// controllers/authController.js
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password, platform } = req.body; // <-- get platform

    // Check if user exists
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?", 
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = rows[0];

    // STEP 2: Check password first (security best practice)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // STEP 3: Check if account is deactivated
    // We send a 403 (Forbidden) and a specific error string
    if (user.status !== 'Activate') {
      return res.status(403).json({ 
        error: "Deactivated", 
        message: "Your account is deactivated.\nPlease contact the Branch Admin or Super Admin." 
      });
    }

    // Enforce platform restrictions
    if (platform === "mobile" && user.role_id !== 3) {
      return res.status(403).json({
        error: "Access denied. Only Superadmin can login via mobile."
      });
    }

    // JWT token
    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        role_id: user.role_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      role_id: user.role_id
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
