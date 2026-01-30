import express from "express";
import { completeSale } from "../controllers/posController.js";

const router = express.Router();

// POST /api/pos/complete-sale
router.post("/complete-sale", completeSale);

export default router;
