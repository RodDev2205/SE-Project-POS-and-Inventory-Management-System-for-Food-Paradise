import { Router } from "express";
import { login } from "../controllers/authController.js";
import { startRecovery, verifyPin, resetPassword } from "../controllers/recoveryController.js";

const router = Router();

router.post("/login", login);

// Recovery flow
// 1) POST /recovery/start        { username }
// 2) POST /recovery/verify-pin  { username, pin } -> returns token
// 3) POST /recovery/reset       { username, token, newPassword }
router.post('/recovery/start', startRecovery);
router.post('/recovery/verify-pin', verifyPin);
router.post('/recovery/reset', resetPassword);

export default router;
