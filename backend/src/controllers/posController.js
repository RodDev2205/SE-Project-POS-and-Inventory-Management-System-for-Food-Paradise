import { db } from "../config/db.js";

export const completeSale = async (req, res) => {
  const { cart } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check stock for all items first
    for (const item of cart) {
      const portionName = `${item.item} Portion`;

      // Get portion formula JSON   
      const [portionRows] = await connection.query(
        "SELECT formula_json FROM `portions` WHERE portion_name = ?",
        [portionName]
      );

      if (!portionRows.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Portion formula not found for ${item.item}`,
        });
      }

      const formula = JSON.parse(portionRows[0].formula_json); // array of { raw_item_id, qty }

      // Check stock for each ingredient
      for (const ingredient of formula) {
        const [stockRows] = await connection.query(
          "SELECT quantity FROM raw_items WHERE raw_item_id = ?",
          [ingredient.raw_item_id]
        );

        if (!stockRows.length || stockRows[0].quantity < ingredient.qty * item.qty) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ingredient ID ${ingredient.raw_item_id} (${item.item})`,
          });
        }
      }
    }

    // Deduct stock and prepare for order insertion
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart) {
      const portionName = `${item.item} Portion`;

      // Get portion formula JSON again
      const [portionRows] = await connection.query(
        "SELECT formula_json FROM `portions` WHERE portion_name = ?",
        [portionName]
      );

      const formula = JSON.parse(portionRows[0].formula_json);

      // Deduct ingredients
      for (const ingredient of formula) {
        await connection.query(
          "UPDATE raw_items SET quantity = quantity - ? WHERE raw_item_id = ?",
          [ingredient.qty * item.qty, ingredient.raw_item_id]
        );
      }

      // Get product_id and price from products table
      const [productRows] = await connection.query(
        "SELECT product_id, price FROM products WHERE product_name = ?",
        [item.item]
      );

      if (!productRows.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.item}`,
        });
      }

      const productId = productRows[0].product_id;
      const price = Number(productRows[0].price);

      totalAmount += price * item.qty;
      orderItemsData.push({ productId, quantity: item.qty });
    }

    // Insert order
    const [orderResult] = await connection.query(
      "INSERT INTO orders (order_date, total_amount) VALUES (NOW(), ?)",
      [totalAmount]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const orderItem of orderItemsData) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)",
        [orderId, orderItem.productId, orderItem.quantity]
      );
    }

    await connection.commit();
    res.json({ success: true, message: "Sale completed and inventory updated!",orderId: orderId });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    connection.release();
  }
};
