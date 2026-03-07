import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import "./config/passport.js";
import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/request.js";
import adminRoutes from "./routes/admin.js";
import announcementRoutes from "./routes/announcement.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan("common"));
app.use(passport.initialize());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);

app.get("/", (req, res) => {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (apiKey && apiKey !== "YOUR_KEY_HERE") {
        res.send("api key working");
    } else {
        res.send("SevaLink API is running, but FAST2SMS_API_KEY is not configured.");
    }
});

// Database Connection
if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB Connected"))
        .catch((err) => console.error("MongoDB Connection Error:", err));
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

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
