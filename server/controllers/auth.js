import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetOTP } from "../config/mailer.js";
import sendSMS from "../utils/sendSMS.js";

// @desc    Update profile (name + avatar)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (req.body.name && req.body.name.trim()) {
            user.name = req.body.name.trim();
        }

        if (req.body.removeAvatar === "true") {
            user.avatar = "";
        } else if (req.file) {
            user.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            avatar: user.avatar,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register new citizen
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, mobile, password } = req.body;

    try {
        const cleanMobile = mobile?.trim();
        const cleanEmail = email?.trim() || null;

        if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
            return res.status(400).json({ message: "Please enter a valid 10-digit Indian mobile number." });
        }

        // Check email uniqueness (only if email provided)
        if (cleanEmail) {
            const emailExists = await User.findOne({ email: cleanEmail });
            if (emailExists) {
                return res.status(400).json({ message: "An account with this email already exists." });
            }
        }

        // Find the pending doc created by sendMobileOTP
        const pendingUser = await User.findOne({ mobile: cleanMobile });

        if (!pendingUser) {
            return res.status(400).json({ message: "Please verify your mobile number first." });
        }

        if (!pendingUser.isMobileVerified) {
            return res.status(400).json({ message: "Mobile number not verified. Please complete OTP verification first." });
        }

        // Ensure the pending doc isn't already a fully registered user
        if (pendingUser.email || pendingUser.password) {
            return res.status(400).json({ message: "This mobile number is already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- Mobile-only registration (no email) ---
        if (!cleanEmail) {
            pendingUser.name = name;
            pendingUser.password = hashedPassword;
            pendingUser.role = "citizen";
            pendingUser.status = "active";
            pendingUser.isVerified = true; // No email to verify
            pendingUser.isMobileVerified = true;
            pendingUser.mobileOTP = undefined;
            pendingUser.mobileOTPExpiry = undefined;
            await pendingUser.save();

            return res.status(201).json({
                message: "Registration successful! You can now log in with your mobile number.",
                mobile_only: true,
            });
        }

        // --- Email + Mobile registration ---
        const unhashedToken = crypto.randomInt(100000, 999999).toString();
        const verificationToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
        const verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        pendingUser.name = name;
        pendingUser.email = cleanEmail;
        pendingUser.password = hashedPassword;
        pendingUser.role = "citizen";
        pendingUser.status = "active";
        pendingUser.isVerified = false;
        pendingUser.isMobileVerified = true;
        pendingUser.verificationToken = verificationToken;
        pendingUser.verificationTokenExpiry = verificationTokenExpiry;
        pendingUser.mobileOTP = undefined;
        pendingUser.mobileOTPExpiry = undefined;

        await pendingUser.save();

        try {
            await sendVerificationEmail(cleanEmail, unhashedToken);
            res.status(201).json({
                message: "Registration successful! Please check your email to verify your account.",
                pending_verification: true,
            });
        } catch (emailError) {
            // Rollback email fields so user can try again
            pendingUser.email = undefined;
            pendingUser.password = undefined;
            pendingUser.name = "Pending";
            pendingUser.isVerified = false;
            pendingUser.verificationToken = undefined;
            pendingUser.verificationTokenExpiry = undefined;
            await pendingUser.save();
            console.error("Failed to send verification email:", emailError);
            return res.status(500).json({
                message: "Failed to send verification email. Your account was not created. Please check server email configuration."
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Citizen login via email OR mobile + password
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        if (!identifier) {
            return res.status(400).json({ message: "Please enter your email or mobile number." });
        }

        // Auto-detect: 10-digit number starting with 6-9 = mobile
        const isMobile = /^[6-9]\d{9}$/.test(identifier.trim());
        const user = isMobile
            ? await User.findOne({ mobile: identifier.trim() })
            : await User.findOne({ email: identifier.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials. Please check your email/mobile and password." });
        }

        // Workers must use the worker login endpoint
        if (user.role === "worker") {
            return res.status(403).json({ message: "Workers must login via the Worker Login page." });
        }

        if (user.status !== "active") {
            return res.status(403).json({ message: `Access denied. Your account is ${user.status}. Please contact support.` });
        }

        // Block unverified local accounts (check for email verification only if email exists)
        if (user.authProvider === "local") {
            // If they registered with email but haven't verified it, block them
            if (user.email && !user.isVerified) {
                return res.status(403).json({
                    message: "Please verify your email before logging in. Check your inbox for the verification link.",
                });
            }
            // If they registered mobile-only and their mobile isn't verified (shouldn't happen, but just in case)
            if (!user.email && !user.isMobileVerified) {
                return res.status(403).json({
                    message: "Please verify your mobile number before logging in.",
                });
            }
        }

        if (!user.password) {
            return res.status(401).json({ message: "This account uses Google Sign-In. Please use the Google login button." });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials. Please check your email/mobile and password." });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            avatar: user.avatar,
            role: user.role,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Worker login via mobile + password
// @route   POST /api/auth/worker-login
// @access  Public
export const workerLogin = async (req, res) => {
    const { mobile, password } = req.body;

    try {
        const normalizedMobile = mobile?.trim();
        const user = await User.findOne({ mobile: normalizedMobile });

        if (!user) {
            return res.status(401).json({ message: "Invalid mobile number or password" });
        }

        // Only workers can use this endpoint
        if (user.role !== "worker") {
            return res.status(403).json({ message: "Not authorized as worker" });
        }

        // Must be active
        if (user.status !== "active") {
            return res.status(403).json({ message: `Account is ${user.status}. Contact your admin.` });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid mobile number or password" });
        }

        res.json({
            _id: user.id,
            name: user.name,
            mobile: user.mobile,
            workerId: user.workerId,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change password (forced on first worker login)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const isStrong = newPassword.length >= 8 && /\d/.test(newPassword);
        if (!isStrong) {
            return res.status(400).json({ message: "New password must be at least 8 characters and contain at least one number." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: "Password changed successfully. Please log in again." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify user email otp
// @route   POST /api/auth/verify
// @access  Public
export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");

        const user = await User.findOne({
            email,
            verificationToken: hashedToken,
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid verification token." });
        }

        if (user.verificationTokenExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please try registering again." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        res.json({
            message: "Email successfully verified. You can now login.",
            _id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "User is already verified." });
        }

        const unhashedToken = crypto.randomInt(100000, 999999).toString();
        const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");

        user.verificationToken = hashedToken;
        user.verificationTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendVerificationEmail(email, unhashedToken);
            res.json({ message: "A new verification link has been sent to your email." });
        } catch (emailError) {
            console.error("SMTP Error on Resend:", emailError);
            res.status(500).json({ message: "Failed to send email. Link logged to server console." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Login with Google
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = (req, res) => {
    if (!req.user) {
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=Google authentication failed`);
    }
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login?token=${token}`);
};

// @desc    Forgot Password — send OTP via email OR mobile
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    const { identifier } = req.body; // email or mobile
    try {
        if (!identifier) {
            return res.status(400).json({ message: "Please provide your email or mobile number." });
        }

        const isMobile = /^[6-9]\d{9}$/.test(identifier.trim());
        const user = isMobile
            ? await User.findOne({ mobile: identifier.trim() })
            : await User.findOne({ email: identifier.trim().toLowerCase() });

        // Security: always return a generic success response
        const genericResponse = { message: "If an account exists, an OTP has been sent.", success: true };

        if (!user || user.role === "admin") {
            return res.json(genericResponse);
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

        user.resetPasswordToken = hashedOTP;
        user.resetPasswordExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();

        if (isMobile) {
            // Send OTP via SMS
            const smsMsg = `SevaLink Password Reset OTP: ${otp}. This OTP expires in 5 minutes. Do not share it.`;
            try {
                await sendSMS(identifier.trim(), smsMsg);
            } catch (smsErr) {
                // Fallback: log to console in dev mode
                console.log(`[DEV] SMS OTP for ${identifier}: ${otp}`);
                console.error("Forgot pwd SMS failed:", smsErr.message);
            }
        } else {
            // Send OTP via email
            try {
                await sendPasswordResetOTP(identifier.trim().toLowerCase(), otp);
            } catch (emailErr) {
                console.error("Forgot pwd email failed:", emailErr.message);
            }
        }

        return res.json(genericResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-otp-reset
// @access  Public
export const verifyOTPAndReset = async (req, res) => {
    const { identifier, otp, newPassword } = req.body;
    try {
        if (!identifier || !otp || !newPassword) {
            return res.status(400).json({ message: "Identifier, OTP, and new password are required." });
        }

        const isMobile = /^[6-9]\d{9}$/.test(identifier.trim());
        const user = isMobile
            ? await User.findOne({ mobile: identifier.trim() })
            : await User.findOne({ email: identifier.trim().toLowerCase() });

        if (!user || !user.resetPasswordToken || !user.resetPasswordExpiry) {
            return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
        }

        if (user.resetPasswordExpiry < new Date()) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        const hashedOTP = crypto.createHash("sha256").update(otp.trim()).digest("hex");
        if (hashedOTP !== user.resetPasswordToken) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Validate new password strength
        if (newPassword.length < 8 || !/\d/.test(newPassword)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and contain at least one number." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({ message: "Password reset successful. You can now log in with your new password.", success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password (legacy – kept for backwards compatibility)
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;
        await user.save();

        res.json({ message: "Password reset successful, you can now log in." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send mobile OTP for citizen registration
// @route   POST /api/auth/send-mobile-otp
// @access  Public
export const sendMobileOTP = async (req, res) => {
    const { mobile } = req.body;

    try {
        const cleanMobile = mobile?.trim();
        if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
            return res.status(400).json({ message: "Please enter a valid 10-digit Indian mobile number." });
        }

        // Check if mobile already belongs to a registered user or worker
        const existingUser = await User.findOne({ mobile: cleanMobile });
        if (existingUser) {
            // Block if it's a worker or fully registered citizen
            if (existingUser.role === "worker" || (existingUser.isMobileVerified && existingUser.email)) {
                return res.status(400).json({ message: "This mobile number is already registered." });
            }

            // Block if it's a mobile-only (no email) registered citizen
            if (existingUser.isMobileVerified && existingUser.password && !existingUser.email) {
                return res.status(400).json({ message: "This mobile number is already registered." });
            }

            // 30-second cooldown: check if OTP was sent within the last 30 seconds
            if (
                existingUser.mobileOTPExpiry &&
                existingUser.mobileOTPExpiry > new Date(Date.now() + 4.5 * 60 * 1000)
            ) {
                return res.status(429).json({ message: "Please wait 30 seconds before requesting a new OTP." });
            }

            // Update OTP on existing pending doc — SAVE FIRST, then send SMS
            const otp = crypto.randomInt(100000, 999999).toString();
            existingUser.mobileOTP = otp;
            existingUser.mobileOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
            existingUser.isMobileVerified = false;
            await existingUser.save(); // ← OTP persisted before SMS attempt

            await trySendOTP(cleanMobile, otp);
        } else {
            // Create a minimal pending record — SAVE FIRST, then send SMS
            const otp = crypto.randomInt(100000, 999999).toString();
            await User.create({
                name: "Pending",
                mobile: cleanMobile,
                role: "citizen",
                status: "active",
                isVerified: false,
                isMobileVerified: false,
                mobileOTP: otp,
                mobileOTPExpiry: new Date(Date.now() + 5 * 60 * 1000),
            }); // ← OTP persisted before SMS attempt

            await trySendOTP(cleanMobile, otp);
        }

        res.json({ message: "OTP sent successfully to your mobile number.", success: true });
    } catch (error) {
        console.error("sendMobileOTP error:", error);
        res.status(500).json({ message: error.message || "Failed to send OTP. Please try again." });
    }
};

/**
 * Attempt to send OTP via Fast2SMS.
 * If API key is not configured, fall back to logging OTP to console (dev mode).
 * This is non-throwing — SMS failure is always logged but never crashes the endpoint.
 */
async function trySendOTP(mobile, otp) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    const isDevMode = !apiKey || apiKey === "YOUR_KEY_HERE";

    if (isDevMode) {
        console.log("\n========================================");
        console.log("  [DEV MODE] Fast2SMS not configured");
        console.log(`  Mobile : ${mobile}`);
        console.log(`  OTP    : ${otp}`);
        console.log("  Set FAST2SMS_API_KEY in .env to enable real SMS");
        console.log("========================================\n");
        return; // Don't throw — registration can proceed
    }

    try {
        const smsMessage = `SevaLink Verification Code: ${otp}\nDo not share this OTP with anyone.`;
        await sendSMS(mobile, smsMessage);
    } catch (err) {
        // SMS failed but OTP is already in DB — log and re-throw so the endpoint returns a clear error
        console.error("Fast2SMS delivery failed:", err.message);
        throw new Error(`SMS delivery failed: ${err.message}. Please check your FAST2SMS_API_KEY.`);
    }
}


// @desc    Verify mobile OTP
// @route   POST /api/auth/verify-mobile-otp
// @access  Public
export const verifyMobileOTP = async (req, res) => {
    const { mobile, otp } = req.body;

    try {
        const cleanMobile = mobile?.trim();
        if (!cleanMobile || !otp) {
            return res.status(400).json({ message: "Mobile and OTP are required." });
        }

        const user = await User.findOne({ mobile: cleanMobile });

        if (!user || !user.mobileOTP) {
            return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
        }

        if (user.mobileOTPExpiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        if (user.mobileOTP !== otp.trim()) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Mark mobile as verified, clear OTP
        user.isMobileVerified = true;
        user.mobileOTP = undefined;
        user.mobileOTPExpiry = undefined;
        await user.save();

        res.json({ message: "Mobile number verified successfully.", success: true });
    } catch (error) {
        console.error("verifyMobileOTP error:", error);
        res.status(500).json({ message: error.message });
    }
};
