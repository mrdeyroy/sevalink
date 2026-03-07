import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import "../config/passport.js";
import authRoutes from "../routes/auth.js";
import requestRoutes from "../routes/request.js";
import adminRoutes from "../routes/admin.js";
import announcementRoutes from "../routes/announcement.js";
import healthRoutes from "../routes/health.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan("common"));
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/health", healthRoutes);

app.get("/", (req, res) => {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (apiKey && apiKey !== "YOUR_KEY_HERE") {
        res.send("api key working");
    } else {
        res.send("SevaLink API is running, but FAST2SMS_API_KEY is not configured.");
    }
});

// Deployment Console Logs
console.log("🚀 SevaLink API deployed successfully");
if (!process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.FAST2SMS_API_KEY || !process.env.CLIENT_URL) {
    const missingEnvs = [];
    const requiredEnvs = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'FAST2SMS_API_KEY', 'CLIENT_URL'];
    requiredEnvs.forEach(env => {
        if (!process.env[env]) missingEnvs.push(env);
    });
    console.log("❌ Missing Environment Variables:", missingEnvs.join(', '));
}

// Database Connection
if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB Connected");
            if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
                console.log("✅ Google OAuth Configured");
            }
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                console.log("✅ Email Service Ready");
            }
            if (process.env.FAST2SMS_API_KEY) {
                console.log("✅ SMS Service Ready");
            }
            console.log("🌐 Health Check Endpoint: /api/health");
        })
        .catch((err) => {
            console.log("❌ MongoDB Connection Failed");
            console.error("MongoDB Connection Error:", err);
        });
} else {
    console.warn("CRITICAL: MONGO_URI is not defined. Database features will fail.");
}

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err.stack || err);
    res.status(err.status || 500).json({
        message: typeof err === 'string' ? err : (err.message || "Internal Server Error"),
        error: process.env.NODE_ENV === "development" ? (typeof err === 'string' ? { message: err } : err) : {}
    });
});

export default app;
