import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
    const database = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
        status: "OK",
        message: "SevaLink Backend Running",
        database,
        server: "healthy"
    });
});

export default router;
