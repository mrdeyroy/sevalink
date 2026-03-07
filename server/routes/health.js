import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
    const requiredEnvs = [
        "MONGO_URI",
        "JWT_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "EMAIL_USER",
        "EMAIL_PASS",
        "FAST2SMS_API_KEY",
        "CLIENT_URL",
    ];

    const missingEnv = requiredEnvs.filter((key) => !process.env[key]);

    if (missingEnv.length > 0) {
        return res.status(500).json({
            status: "ERROR",
            missingEnv,
        });
    }

    const database = mongoose.connection.readyState === 1 ? "connected" : "failed";

    const googleAuth =
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? "configured"
            : "not_configured";

    const emailService =
        process.env.EMAIL_USER && process.env.EMAIL_PASS
            ? "configured"
            : "not_configured";

    const smsService = process.env.FAST2SMS_API_KEY ? "configured" : "not_configured";

    res.json({
        status: "OK",
        server: "running",
        database,
        googleAuth,
        emailService,
        smsService,
        timestamp: new Date().toISOString(),
    });
});

export default router;
