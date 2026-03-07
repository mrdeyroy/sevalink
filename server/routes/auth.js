import express from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import {
    registerUser,
    loginUser,
    workerLogin,
    changePassword,
    updateProfile,
    getMe,
    googleAuthCallback,
    verifyEmail,
    resendVerification,
    forgotPassword,
    verifyOTPAndReset,
    resetPassword,
    sendMobileOTP,
    verifyMobileOTP,
} from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

// Rate limiter: max 10 login attempts per 15 minutes per IP
const workerLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { message: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

// Citizen auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/resend-verification", resendVerification);
router.post("/verify", verifyEmail);

// Forgot Password (OTP-based — email or mobile)
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp-reset", verifyOTPAndReset);
// Legacy token-based reset (kept for backward compatibility)
router.post("/reset-password/:token", resetPassword);

// Mobile OTP routes (citizen registration)
router.post("/send-mobile-otp", sendMobileOTP);
router.post("/verify-mobile-otp", verifyMobileOTP);

// Worker auth routes
router.post("/worker-login", workerLoginLimiter, workerLogin);
router.post("/change-password", protect, changePassword);

// Profile
router.put("/profile", protect, upload.single("avatar"), updateProfile);

// Shared
router.get("/me", protect, getMe);

// Google Auth Routes (Citizens only)
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`, session: false }),
    googleAuthCallback
);

export default router;
