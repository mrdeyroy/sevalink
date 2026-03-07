import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);

        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Provider: ${u.authProvider}, GoogleId: ${u.googleId}`);
        });

        const workers = await User.find({ role: "worker" });
        console.log(`\nExplicit Query for role='worker': Found ${workers.length}`);

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkUsers();
