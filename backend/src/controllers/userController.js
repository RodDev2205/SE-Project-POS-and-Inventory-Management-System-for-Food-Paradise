import { db } from "../config/db.js";
import bcrypt from "bcrypt";

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, username, password, branch_id } = req.body;

    if (!full_name || !username || !branch_id) {
      return res.status(400).json({
        error: "Full name, username, and branch are required",
      });
    }

    // ✅ Check if username already taken by another user
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
      [username, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let sql;
    let params;

    if (hashedPassword) {
      sql = `
        UPDATE users 
        SET full_name = ?, username = ?, password = ?, branch_id = ?
        WHERE user_id = ?
      `;
      params = [full_name, username, hashedPassword, branch_id, userId];
    } else {
      sql = `
        UPDATE users 
        SET full_name = ?, username = ?, branch_id = ?
        WHERE user_id = ?
      `;
      params = [full_name, username, branch_id, userId];
    }

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [updatedUserRows] = await db.query(
      "SELECT user_id, full_name, username, branch_id FROM users WHERE user_id = ?",
      [userId]
    );

    res.json({
      message: "User updated successfully",
      user: updatedUserRows[0],
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to update user",
      details: err.message,
    });
  }
};
