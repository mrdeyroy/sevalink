import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
    {
        complaintId: {
            type: String,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ["Water", "Electricity", "Health", "Roads", "Documents", "Other"],
        },
        imageUrl: {
            type: String, // Path to image
        },
        location: {
            latitude: Number,
            longitude: Number,
            address: String,
        },
        status: {
            type: String,
            enum: ["Open", "Assigned", "In Progress", "Resolved"],
            default: "Open",
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Emergency"],
            default: "Medium",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Worker
        },
        // Worker proof photo (uploaded when resolving)
        proofImage: {
            type: String,
        },
        completedAt: {
            type: Date,
        },
        resolvedAt: {
            type: Date,
        },
        resolutionTime: {
            type: Number, // Stored in hours
        },
        completedByWorkerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        // Citizen review
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        reviewText: {
            type: String,
            trim: true,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
        timeline: [
            {
                action: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                details: { type: String },
            },
        ],
    },
    { timestamps: true }
);

const Request = mongoose.model("Request", RequestSchema);
export default Request;
