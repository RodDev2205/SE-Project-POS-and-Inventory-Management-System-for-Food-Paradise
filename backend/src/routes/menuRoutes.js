import express from "express";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  upload 
} from "../controllers/menuController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

router.get("/", verifyToken, requireRole(2), getAllProducts);
router.post("/", verifyToken, requireRole(2), upload.single("image"), createProduct);
router.put("/:id", verifyToken, requireRole(2), upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, requireRole(2), deleteProduct);

export default router;
