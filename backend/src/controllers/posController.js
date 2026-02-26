import { db } from "../config/db.js";

// Helper function to generate unique transaction number
const generateTransactionNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

export const completeSale = async (req, res) => {
  const { cart, paymentMethod, amountPaid, discount } = req.body;
  const user = req.user; // From JWT token

  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  if (!paymentMethod || !amountPaid) {
    return res.status(400).json({ success: false, message: "Payment details required" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let subtotal = 0;
    const transactionItemsData = [];
    const ingredientDeductions = new Map(); // Track ingredient deductions needed

    // ==================== STEP 1: Validate all items and collect ingredient needs ====================
    for (const item of cart) {
      // Get product_id and price from products table
      const [productRows] = await connection.query(
        `SELECT product_id, price FROM products WHERE product_id = ?`,
        [item.product_id]
      );

      if (!productRows.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product not found for product_id: ${item.product_id}`,
        });
      }

      const price = Number(productRows[0].price);
      const itemTotal = price * item.qty;
      subtotal += itemTotal;

      transactionItemsData.push({
        menu_id: item.product_id,
        quantity: item.qty,
        price: price,
        total: itemTotal,
      });

      // ✅ Get linked ingredients from menu_inventory table
      const [ingredientRows] = await connection.query(
        `SELECT inventory_id, servings_required 
         FROM menu_inventory 
         WHERE product_id = ?`,
        [item.product_id]
      );

      // ❌ Check if product has any linked ingredients
      if (!ingredientRows || ingredientRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product "${item.item || item.product_id}" has no linked ingredients. Please set up ingredients for this product.`,
        });
      }

      // Collect ingredient deductions
      for (const ingredient of ingredientRows) {
        const servingsNeeded = ingredient.servings_required * item.qty;
        const key = ingredient.inventory_id;

        if (ingredientDeductions.has(key)) {
          ingredientDeductions.set(key, ingredientDeductions.get(key) + servingsNeeded);
        } else {
          ingredientDeductions.set(key, servingsNeeded);
        }
      }
    }

    // ==================== STEP 2: Check if enough servings in inventory ====================
    for (const [inventoryId, servingsNeeded] of ingredientDeductions) {
      const [inventoryRows] = await connection.query(
        `SELECT item_name, total_servings FROM inventory WHERE inventory_id = ?`,
        [inventoryId]
      );

      if (!inventoryRows.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Inventory item not found for ID: ${inventoryId}`,
        });
      }

      const inventory = inventoryRows[0];

      if (inventory.total_servings < servingsNeeded) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${inventory.item_name}". Available: ${inventory.total_servings}, Needed: ${servingsNeeded}`,
        });
      }
    }

    // ==================== STEP 3: Calculate transaction amounts ====================
    const discountObj = discount || { type: "none", value: 0 };
    let discountAmount = 0;

    if (discountObj.type === "percentage") {
      discountAmount = (subtotal * discountObj.value) / 100;
    } else if (discountObj.type === "fixed") {
      discountAmount = discountObj.value;
    }

    const totalAmount = subtotal - discountAmount;
    const changeAmount = Number(amountPaid) - totalAmount;

    if (changeAmount < 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient payment. Total: ${totalAmount}, Paid: ${amountPaid}`,
      });
    }

    // ==================== STEP 4: Deduct servings from inventory ====================
    for (const [inventoryId, servingsNeeded] of ingredientDeductions) {
      await connection.query(
        `UPDATE inventory 
         SET total_servings = total_servings - ?
         WHERE inventory_id = ?`,
        [servingsNeeded, inventoryId]
      );
    }

    // ==================== STEP 5: Create transaction record ====================
    const transactionNumber = generateTransactionNumber();

    const [transactionResult] = await connection.query(
      `INSERT INTO transactions 
       (transaction_number, subtotal, discount_type, discount_value, discount_amount, total_amount, payment_method, amount_paid, change_amount, cashier_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionNumber,
        subtotal,
        discountObj.type || "none",
        discountObj.value || 0,
        discountAmount,
        totalAmount,
        paymentMethod,
        amountPaid,
        changeAmount,
        user.user_id,
        user.branch_id,
      ]
    );

    const transactionId = transactionResult.insertId;

    // ==================== STEP 6: Insert transaction items ====================
    for (const item of transactionItemsData) {
      await connection.query(
        `INSERT INTO transaction_items 
         (transaction_id, menu_id, quantity, price, total)
         VALUES (?, ?, ?, ?, ?)`,
        [transactionId, item.menu_id, item.quantity, item.price, item.total]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Sale completed and inventory updated!",
      transactionId: transactionId,
      transactionNumber: transactionNumber,
      totalAmount: totalAmount,
      changeAmount: changeAmount,
    });

  } catch (error) {
    await connection.rollback();
    console.error("POS Error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  } finally {
    connection.release();
  }
};
