import express from "express";
import { completeSale } from "../controllers/posController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// POST /api/pos/complete-sale (protected route)
router.post("/complete-sale", verifyToken, completeSale);

export default router;
