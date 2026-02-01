import express from "express";
import { registerWorker, registerEstablishment, login, logout, getMe, verifyEmail, resendOtp, forgotPassword, resetPassword, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    validate,
    registerWorkerSchema,
    registerEstablishmentSchema,
    loginSchema,
    resetPasswordSchema
} from "../validators/authValidator.js";

const router = express.Router();

router.post("/register/worker", validate(registerWorkerSchema), registerWorker);
router.post("/register/establishment", validate(registerEstablishmentSchema), registerEstablishment);
router.post("/login", validate(loginSchema), login);

router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);

export default router;
