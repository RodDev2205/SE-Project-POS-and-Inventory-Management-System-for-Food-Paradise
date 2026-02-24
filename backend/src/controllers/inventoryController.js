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

    db.query(query, values, (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }
      console.log("Ingredient inserted with ID:", results.insertId);
      res.status(201).json({ message: "Ingredient added successfully", id: results.insertId });
    });
  } catch (error) {
    console.error("CATCH ERROR:", error);
    res.status(500).json({ message: "Catch Error", error: error.message });
  }
};