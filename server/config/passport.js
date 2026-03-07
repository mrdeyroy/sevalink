import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userEmail = profile.emails?.[0]?.value;
                console.log("Google Auth Attempt:", { id: profile.id, email: userEmail });
                if (!userEmail) {
                    return done(new Error("No email found from Google profile"), null);
                }

                // 1. Check if user already exists with this googleId
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    return done(null, user);
                }

                // 2. Check if user already exists with this email (registered manually)
                user = await User.findOne({ email: userEmail });

                if (user) {
                    // Update the user with googleId and provider info
                    user.googleId = profile.id;
                    user.authProvider = "google";
                    user.isVerified = true;
                    // Keep existing mobile/password if present
                    if (profile.photos?.[0]?.value && !user.avatar) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }

                // 3. Create new user if not found by googleId or email
                user = new User({
                    name: profile.displayName,
                    email: userEmail,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value || "",
                    authProvider: "google",
                    isVerified: true,
                });

                await user.save();
                done(null, user);
            } catch (err) {
                console.error("Passport Google Callback Error:", err);
                done(err, null);
            }
        }
    )
);

// Serialize/Deserialize not strictly needed for JWT but good for session if used
// Removing them as session: false is used and Mongoose v8 doesn't support callbacks.
