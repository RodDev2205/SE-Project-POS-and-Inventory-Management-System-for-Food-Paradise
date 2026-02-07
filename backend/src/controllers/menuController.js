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
    const [rows] = await db.query(
      `SELECT p.product_id, p.product_name, p.price, p.status, p.image_name, p.image_path, 
              c.category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.category_id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------
// GET single product
// -------------------
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT p.product_id, p.product_name, p.price, p.status, p.image_name, p.image_path, 
              c.category_name 
       FROM products p
       JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
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
    const { product_name, category_id, price } = req.body;
    const image_name = req.file ? req.file.originalname : null;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO products (product_name, category_id, price, image_name, image_path)
       VALUES (?, ?, ?, ?, ?)`,
      [product_name, category_id, price, image_name, image_path]
    );

    res.status(201).json({
      product_id: result.insertId,
      product_name,
      category_id,
      price,
      status: "available",
      image_name,
      image_path,
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
    const { product_name, price, status } = req.body;

    let query = "UPDATE products SET product_name=?, price=?, status=?";
    const params = [product_name, price, status];

    if (req.file) {
      query += ", image_name=?, image_path=?";
      params.push(req.file.originalname, `/uploads/${req.file.filename}`);
    }

    query += " WHERE product_id=?";
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    // Optionally return the updated product
    const [updatedRows] = await db.query(
      "SELECT * FROM products WHERE product_id=?",
      [id]
    );

    res.json(updatedRows[0]);
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

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
