import express from "express";
import { getBranchMessages, getBranchesWithLastMessage } from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

// Get all branches with last message (for admin/superadmin)
router.get(
  "/branches-with-messages",
  verifyToken,
  requireRole(2, 3), // admin or superadmin
  getBranchesWithLastMessage
);

// Get last 50 messages for a specific branch
router.get(
  "/branch/:branch_id",
  verifyToken,
  requireRole(2, 3),
  getBranchMessages
);

export default router;
