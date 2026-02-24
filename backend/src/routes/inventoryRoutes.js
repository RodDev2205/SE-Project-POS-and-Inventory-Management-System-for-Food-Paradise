import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireRole } from '../middlewares/requireRole.js';
import { addIngredient, getIngredientsByBranch, editIngredientById } from '../controllers/inventoryController.js';

const router = Router();

// Add new ingredient (only for SuperAdmin and Admin)
router.post(
  '/add-ingredient',
  verifyToken,
  requireRole(2, 3), // SuperAdmin and Admin
  addIngredient
);

// Get ingredients for a specific branch (only for SuperAdmin and Admin)
router.get(
  '/get-ingredients',
  verifyToken,
  requireRole(2, 3), // SuperAdmin and Admin
  getIngredientsByBranch
);

// Edit an existing ingredient (only for SuperAdmin and Admin)
router.put(
  '/edit-ingredient/:id',
  verifyToken,
  requireRole(2, 3), // SuperAdmin and Admin
  editIngredientById
);



export default router;