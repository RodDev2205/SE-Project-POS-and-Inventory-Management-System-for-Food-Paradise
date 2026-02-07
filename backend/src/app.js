import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js"; // <-- import menu routes
import categoryRoutes from "./routes/categoryRoutes.js";
import rawItemsRoutes from "./routes/rawItemRoutes.js";
import portionRoutes from "./routes/portionRoutes.js";
import posRoutes from "./routes/posRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import superadminRoutes from "./routes/superadminRoutes.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Register routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes); // <-- register menu routes
app.use("/api/categories", categoryRoutes);
app.use("/api/raw-items", rawItemsRoutes);
app.use("/api/portions", portionRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/superadmin", superadminRoutes);
// Print route

app.post("/api/print-receipt", async (req, res) => {
  const data = req.body;

  try {
    // Dynamically import CJS module
    const printModule = await import("../usb-test-print.cjs");
    const { printReceipt } = printModule;

    printReceipt(data); // Send data to printer

    res.json({ success: true, message: "Printing started!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default app;
