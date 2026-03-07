import express from "express";
import {
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getAnnouncements);
router.post("/", protect, authorize("admin"), createAnnouncement);
router.delete("/:id", protect, authorize("admin"), deleteAnnouncement);

export default router;
