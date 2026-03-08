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

/*
================================
Allowed Origins
================================
*/

const allowedOrigins = [
    "http://localhost:5173",
    "https://sevalink.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

/*
================================
Middleware
================================
*/

app.use(express.json());

// Explicitly handle preflight OPTIONS for all routes
app.options('*', cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true
}));

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            return callback(null, true); // For development, allow all origins
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    })
);

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

app.use(morgan("common"));
app.use(passport.initialize());

/*
================================
Routes
================================
*/

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/health", healthRoutes);

/*
================================
Root Endpoint
================================
*/

app.get("/", (req, res) => {
    res.json({
        message: "SevaLink API is running",
        status: "ok",
        timestamp: new Date()
    });
});

/*
================================
Startup Logs
================================
*/

console.log("🚀 SevaLink API deployed");

/*
================================
MongoDB Connection
================================
*/

if (!process.env.MONGO_URI) {
    console.error("CRITICAL: MONGO_URI is not defined. Server cannot start.");
    process.exit(1);
}

if (!mongoose.connection.readyState) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB Connected");
        })
        .catch((err) => {
            console.error("❌ MongoDB Connection Failed:", err.message);
            process.exit(1);
        });
}

/*
================================
Global Error Handler
================================
*/

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);

    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {}
    });
});

export default app;