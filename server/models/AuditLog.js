import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        details: {
            type: String
        },
    },
    { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
