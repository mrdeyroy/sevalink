import express from "express";
import {
    createRequest,
    getRequests,
    getRequestById,
    updateRequestStatus,
    assignWorker,
    submitReview,
} from "../controllers/requestController.js";
import { protect, admin, worker } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router
    .route("/")
    .post(protect, upload.single("image"), createRequest)
    .get(protect, getRequests);

router.route("/:id").get(protect, getRequestById);

// Worker/Admin update status — supports proof image upload (multipart)
router.route("/:id/status").put(protect, worker, upload.single("proofImage"), updateRequestStatus);

router.route("/:id/assign").put(protect, admin, assignWorker);

// Citizen submits review on a resolved request
router.route("/:id/review").post(protect, submitReview);

export default router;
