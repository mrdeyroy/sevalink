import express from "express";
import {
    getAdminStats,
    getWorkers,
    createWorker,
    suspendUser,
    deleteWorker,
    getUsers,
    banUser,
    deleteUser,
    getResolutionAnalytics,
    getWorkerPerformance,
    getAreaInsights,
    getAnalyticsOverview,
    getHotspots,
    getCategoryTrends,
    getCitizenEngagement
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Existing routes (unchanged)
router.get("/stats", protect, authorize("admin"), getAdminStats);
router.get("/workers", protect, authorize("admin"), getWorkers);
router.post("/create-worker", protect, authorize("admin"), createWorker);
router.patch("/suspend-user/:id", protect, authorize("admin"), suspendUser);
router.delete("/workers/:id", protect, authorize("admin"), deleteWorker);

// New: User management routes
router.get("/users", protect, authorize("admin"), getUsers);
router.patch("/ban-user/:id", protect, authorize("admin"), banUser);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

// Analytics
router.get("/analytics/resolution-time", protect, authorize("admin"), getResolutionAnalytics);
router.get("/analytics/worker-performance", protect, authorize("admin"), getWorkerPerformance);
router.get("/analytics/area-insights", protect, authorize("admin"), getAreaInsights);
router.get("/analytics/overview", protect, authorize("admin"), getAnalyticsOverview);
router.get("/analytics/hotspots", protect, authorize("admin"), getHotspots);
router.get("/analytics/categories", protect, authorize("admin"), getCategoryTrends);
router.get("/analytics/engagement", protect, authorize("admin"), getCitizenEngagement);

export default router;
