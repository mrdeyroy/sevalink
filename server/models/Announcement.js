import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        createdByAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;
