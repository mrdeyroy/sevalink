import mongoose from 'mongoose';
import User from './models/User.js';

async function run() {
    await mongoose.connect('mongodb://localhost:27017/sevalink');
    const users = await User.find({}, 'name email mobile role isVerified isMobileVerified password').lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
}
run();
