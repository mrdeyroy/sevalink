import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // Optional: workers don't need email
        },
        password: {
            type: String, // Optional for Google Auth users
        },
        mobile: {
            type: String,
            unique: true,
            sparse: true, // Workers and verified citizens have mobile
            index: true,  // Fast lookup for login
        },
        workerId: {
            type: String,
            unique: true,
            sparse: true, // Only workers have workerId
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatar: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["citizen", "admin", "worker"],
            default: "citizen",
        },
        status: {
            type: String,
            enum: ["active", "suspended", "banned"],
            default: "active",
        },
        mustChangePassword: {
            type: Boolean,
            default: false, // Workers set to true on creation
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: {
            type: String,
        },
        verificationTokenExpiry: {
            type: Date,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpiry: {
            type: Date,
        },
        isMobileVerified: {
            type: Boolean,
            default: false,
        },
        mobileOTP: {
            type: String,
        },
        mobileOTPExpiry: {
            type: Date,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
