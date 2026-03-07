import Announcement from "../models/Announcement.js";

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Admin)
export const createAnnouncement = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Title and message are required." });
        }

        const announcement = await Announcement.create({
            title: title.trim(),
            message: message.trim(),
            createdByAdmin: req.user._id,
        });

        res.status(201).json({ message: "Announcement created successfully.", announcement });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all announcements (latest first)
// @route   GET /api/announcements
// @access  Private (all authenticated users)
export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate("createdByAdmin", "name")
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
export const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found." });
        }

        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: "Announcement deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
