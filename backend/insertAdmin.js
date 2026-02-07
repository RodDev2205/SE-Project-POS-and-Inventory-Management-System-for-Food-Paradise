/*import bcrypt from "bcrypt";
import { db } from "./src/config/db.js";

const createSuperAdmin = async () => {
  try {
    const full_name = "Admin123";
    const username = "admin8"; 
    const password = "admin12345"; // your choice 

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (full_name, username, password, role_id, status, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, username, hashed, 3, "active", null]
    );

    console.log("Super admin created successfully!");
  } catch (err) {
    console.error("Error inserting super admin:", err.message);
  }

  process.exit(); // end script
};

createSuperAdmin();*/
