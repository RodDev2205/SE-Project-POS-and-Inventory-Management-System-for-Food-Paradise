import express from "express";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  upload 
} from "../controllers/menuController.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
