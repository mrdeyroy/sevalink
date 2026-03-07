import mongoose from "mongoose";
import User from "./server/models/User.js";
import { loginUser } from "./server/controllers/auth.js";

async function test() {
    await mongoose.connect("mongodb://localhost:27017/sevalink");
    console.log("Connected to DB.");

    try {
        await User.deleteMany({ mobile: "9999999999" });

        const citizen = await User.create({
            name: "Test Citizen",
            mobile: "9999999999",
            password: "hashedPassword123",
            role: "citizen",
            status: "active",
            isMobileVerified: true,
            authProvider: "local",
            isVerified: true
        });

        console.log("Created citizen role with mobile 9999999999:", citizen._id);

        const req = {
            body: {
                identifier: "9999999999",
                password: "wrong_password_does_not_matter_here",
            }
        };

        const res = {
            status: (code) => {
                console.log("Response status:", code);
                return res;
            },
            json: (data) => {
                console.log("Response JSON:", data);
            }
        };

        console.log("Simulating loginUser controller...");
        await loginUser(req, res);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

test();
