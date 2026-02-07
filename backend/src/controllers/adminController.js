import { db } from "../config/db.js";
import bcrypt from "bcrypt";

export const createCashier = async (req, res) => {
  try {
    const adminId = req.user.id; 
    const { full_name, username, password } = req.body; // match frontend

    if (!full_name || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (full_name, username, password, role_id, status, created_by)
       VALUES (?, ?, ?, 1, 'Activate', ?)`,
      [full_name, username, hashedPassword, adminId]
    );

    res.json({ message: "Cashier created successfully" });

  } catch (err) {
    res.status(500).json({ error: "Error creating cashier", details: err.message });
  }
};


export const getCashiers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        user_id as id,
        full_name,
        username,
        role_id,
        status,
        password
      FROM users
      WHERE role_id = 1
      ORDER BY user_id DESC
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: "Failed to load cashiers", details: err.message });
  }
};

export const toggleCashierStatus = async (req, res) => {
  try {
    const { id } = req.params; // cashier id from frontend

    // Get current status
    const [rows] = await db.query(
      "SELECT status FROM users WHERE user_id = ? AND role_id = 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cashier not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "Activate" ? "Deactivate" : "Activate";

    // Update status
    await db.query(
      "UPDATE users SET status = ? WHERE user_id = ?",
      [newStatus, id]
    );

    res.json({ message: "Status updated successfully", status: newStatus });

  } catch (err) {
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
};

// Update cashier full_name and username
export const updateCashier = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, username } = req.body;

    if (!full_name || !username) {
      return res.status(400).json({ error: "Full name and username are required" });
    }

    // Check if username is already taken by another user
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
      [username, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Update user
    await db.query(
      "UPDATE users SET full_name = ?, username = ? WHERE user_id = ? AND role_id = 1",
      [full_name, username, id]
    );

    res.json({ message: "Cashier updated successfully", full_name, username, id });
  } catch (err) {
    res.status(500).json({ error: "Failed to update cashier", details: err.message });
  }
};

export const updateCashierPassword = async (req, res) => {
  try {
    const { id } = req.params; // cashier id
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE user_id = ? AND role_id = 1",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cashier not found" });
    }

    res.json({ message: "Password updated successfully", id });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password", details: err.message });
  }
};

