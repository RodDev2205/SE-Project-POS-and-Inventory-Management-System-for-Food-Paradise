import { Router } from "express";
import { updateUser } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { requireRole } from "../middlewares/requireRole.js";
const router = Router();

router.patch("/user/:id", verifyToken, requireRole(3), updateUser);

export default router;