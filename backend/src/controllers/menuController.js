import { db } from "../config/db.js";
import multer from "multer";
import path from "path";

// -------------------
// Multer configuration
// -------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

export const upload = multer({ storage });

// -------------------
// GET all products
// -------------------
export const getAllProducts = async (req, res) => {
  try {
    const userBranchId = req.user.branch_id; // assuming your JWT sets req.user

    const [rows] = await db.query(
      `SELECT p.product_id, p.product_name, p.price, p.status, p.approval_status, 
              p.image_name, p.image_path, p.created_by, p.branch_id,
              c.category_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.approval_status = 'APPROVED' AND p.branch_id = ?`,
      [userBranchId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// -------------------
// CREATE product
// -------------------
export const createProduct = async (req, res) => {
  try {
    // Make sure the user is authenticated
    if (!req.user || !req.user.user_id || !req.user.branch_id) {
      return res.status(401).json({ error: "Unauthorized: user info missing" });
    }

    const { product_name, category_id, price } = req.body;
    const created_by = req.user.user_id;
    const branch_id = req.user.branch_id;

    const image_name = req.file ? req.file.originalname : null;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO products 
       (product_name, category_id, price, image_name, image_path, created_by, branch_id, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_name, category_id, price, image_name, image_path, created_by, branch_id, 'PENDING']
    );

    res.status(201).json({
      product_id: result.insertId,
      product_name,
      category_id,
      price,
      status: "available",
      image_name,
      image_path,
      created_by,
      branch_id,
      approval_status: 'PENDING'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// -------------------
// UPDATE product
// -------------------
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, category_id, price, status } = req.body;

    let query = "UPDATE products SET product_name=?, price=?, status=?, category_id=?";
    const params = [product_name, price, status, category_id];

    if (req.file) {
      query += ", image_name=?, image_path=?";
      params.push(req.file.originalname, `/uploads/${req.file.filename}`);
    }

    query += " WHERE product_id=?";
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    // Return the updated product including category_name
    const [row] = await db.query(
      `SELECT p.product_id, p.product_name, p.price, p.status, p.approval_status, 
              p.image_name, p.image_path, p.created_by, p.branch_id, c.category_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ?`,
      [id]
    );

    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------
// DELETE product
// -------------------
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM products WHERE product_id=?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully", product_id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------
// GET all declined products for the current user & branch
// -------------------
export const getDeclinedProducts = async (req, res) => {
  try {
    // Ensure we have user info
    if (!req.user || !req.user.user_id || !req.user.branch_id) {
      return res.status(401).json({ error: "Unauthorized: user info missing" });
    }

    const userId = req.user.user_id;
    const branchId = req.user.branch_id;

    const [rows] = await db.query(
      `SELECT p.product_id, p.product_name, p.price, p.status, p.approval_status,
              p.image_name, p.image_path, p.created_by, p.branch_id,
              c.category_name
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.approval_status = 'DECLINED' 
         AND p.branch_id = ? 
         AND p.created_by = ?`,
      [branchId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------
// UPDATE declined product (resubmit for review)
// -------------------
export const editDeclinedProduct = async (req, res) => {
  try {
    const { id } = req.params; // product_id
    const { product_name, category_id, price, status } = req.body;

    // Validate user
    if (!req.user?.user_id || !req.user?.branch_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.user_id;
    const branchId = req.user.branch_id;

    // Validate category_id
    const catId = Number(category_id);
    if (!catId || isNaN(catId)) {
      return res.status(400).json({ message: "Invalid category selected." });
    }

    // Check if product exists and is editable
    const [existing] = await db.query(
      `SELECT * FROM products WHERE product_id=? AND created_by=? AND branch_id=? AND approval_status='DECLINED'`,
      [id, userId, branchId]
    );

    if (!existing.length) {
      return res.status(404).json({ message: "Declined product not found or cannot edit" });
    }

    // Build update query
    let query = `UPDATE products SET product_name=?, price=?, status=?, category_id=?, approval_status='PENDING'`;
    const params = [product_name.trim(), price, status, catId];

    if (req.file) {
      query += `, image_name=?, image_path=?`;
      params.push(req.file.originalname, `/uploads/${req.file.filename}`);
    }

    query += ` WHERE product_id=? AND created_by=? AND branch_id=?`;
    params.push(id, userId, branchId);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to update product" });
    }

    // Return updated product with category name
    const [row] = await db.query(
      `SELECT p.*, c.category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.category_id 
       WHERE p.product_id=?`,
      [id]
    );

    res.json(row[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};



