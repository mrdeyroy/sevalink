import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Request from "./models/Request.js";

dotenv.config();

const debugDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const admin = await User.findOne({ email: "admin@sevalink.com" });
        console.log("Admin User:", admin ? `${admin.email} (${admin.role})` : "Not Found");

        const citizen = await User.findOne({ email: "citizen@sevalink.com" });
        console.log("Citizen User:", citizen ? `${citizen.email} (${citizen.role})` : "Not Found");

        const requests = await Request.find({});
        console.log(`Total Requests: ${requests.length}`);

        requests.forEach(r => {
            console.log(`- [${r.status}] ${r.title} (Created By: ${r.createdBy}, Assigned: ${r.assignedTo})`);
        });

        process.exit();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

debugDB();
