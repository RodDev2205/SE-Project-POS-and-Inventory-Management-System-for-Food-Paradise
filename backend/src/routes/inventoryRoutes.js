import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireRole } from '../middlewares/requireRole.js';
import { addIngredient } from '../controllers/inventoryController.js';

const router = Router();

// Add new ingredient (only for SuperAdmin and Admin)
router.post(
  '/add-ingredient',
  verifyToken,
  requireRole(2, 3), // SuperAdmin and Admin
  addIngredient
);

export default router;