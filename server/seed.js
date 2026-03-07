import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const users = [
    {
        name: "Admin User",
        email: "admin@sevalink.com",
        password: "password123",
        role: "admin",
        isVerified: true,
        status: "active",
    },
    {
        name: "Worker User",
        mobile: "9876543210",
        password: "password123",
        role: "worker",
        isVerified: true,
        status: "active",
        mustChangePassword: false, // Already changed for seed convenience
    },
    {
        name: "Citizen User",
        email: "citizen@sevalink.com",
        password: "password123",
        role: "citizen",
        isVerified: true,
        status: "active",
    },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        await User.deleteMany({});
        await mongoose.connection.collection("requests").deleteMany({});
        console.log("Existing users and requests cleared");

        const createdUsers = [];
        for (const user of users) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            const newUser = await User.create({
                ...user,
                password: hashedPassword,
            });
            createdUsers.push(newUser);
            console.log(`Created ${user.role}: ${user.email || user.mobile}`);
        }

        // Create a dummy request
        const citizenUser = createdUsers.find(u => u.role === "citizen");
        if (citizenUser) {
            await mongoose.connection.collection("requests").insertOne({
                title: "Broken Streetlight",
                description: "Streetlight at corner of 5th Avenue is flickering.",
                category: "Electricity",
                location: {
                    latitude: 28.6139,
                    longitude: 77.2090,
                    address: "New Delhi, India"
                },
                status: "Open",
                createdBy: citizenUser._id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Dummy Request Created");
        }

        console.log("\nUsers Seeded Successfully:");
        console.log("  Admin  → admin@sevalink.com     / password123");
        console.log("  Worker → mobile: 9876543210     / password123  (login at /worker-login)");
        console.log("  Citizen→ citizen@sevalink.com   / password123");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
