import { db } from "../config/db.js";

export const addIngredient = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    const { item_name, quantity, servings_per_unit, low_stock_threshold, status } = req.body;
    const branch_id = req.user.branch_id;

    const total_servings = quantity * servings_per_unit;

    const query = `
      INSERT INTO inventory 
      (item_name, quantity, servings_per_unit, total_servings, low_stock_threshold, status, branch_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      item_name,
      quantity,
      servings_per_unit,
      total_servings,
      low_stock_threshold,
      status,
      branch_id,
    ];

    // use promise-based pool (mysql2/promise)
    const [result] = await db.execute(query, values);

    console.log("Ingredient inserted with ID:", result.insertId);
    res.status(201).json({ message: "Ingredient added successfully", id: result.insertId });
  } catch (error) {
    console.error("DB/CATCH ERROR:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// GET ingredients for the current user's branch
export const getIngredientsByBranch = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);

    const branch_id = req.user.branch_id;

    const query = `
      SELECT *
      FROM inventory
      WHERE branch_id = ?
      ORDER BY item_name ASC
    `;

    const [rows] = await db.execute(query, [branch_id]);

    res.status(200).json(rows);
  } catch (error) {
    console.error("DB/CATCH ERROR:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

export const editIngredientById = async (req, res) => {
  try {
    const { id } = req.params; // inventory ID from URL
    const branch_id = req.user.branch_id; // ensure user only edits their branch

    const {
      item_name,
      quantity,
      servings_per_unit,
      low_stock_threshold,
      status,
    } = req.body;

    // Recalculate total servings
    const total_servings = quantity * servings_per_unit;

    // Update query, but ensure only inventory from this branch can be edited
    const query = `
      UPDATE inventory
      SET item_name = ?, quantity = ?, servings_per_unit = ?, total_servings = ?, low_stock_threshold = ?, status = ?
      WHERE inventory_id = ? AND branch_id = ?
    `;
    const values = [
      item_name,
      quantity,
      servings_per_unit,
      total_servings,
      low_stock_threshold,
      status,
      id,
      branch_id,
    ];

    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ingredient not found or no permission" });
    }

    res.status(200).json({
      message: "Ingredient updated successfully",
      updatedItem: { id, item_name, quantity, servings_per_unit, total_servings, low_stock_threshold, status },
    });
  } catch (error) {
    console.error("DB/CATCH ERROR:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};
