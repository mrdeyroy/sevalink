import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;
    const reqs = await db.collection('requests').find({}).toArray();
    console.log(`Total Requests: ${reqs.length}`);

    if (reqs.length > 0) {
        let priorities = ['Low', 'Medium', 'High', 'Emergency'];
        let users = await db.collection('users').find({ role: 'citizen' }).toArray();
        let userIds = users.map(u => u._id);

        let updatedCount = 0;

        for (let r of reqs) {
            let updateStats = {};

            // Randomly update to simulate data
            updateStats.priority = priorities[Math.floor(Math.random() * priorities.length)];

            if (!r.createdBy && userIds.length > 0) {
                updateStats.createdBy = userIds[Math.floor(Math.random() * userIds.length)];
            }

            if (!r.imageUrl && Math.random() > 0.5) {
                updateStats.imageUrl = '/uploads/sample.jpg';
            }

            if ((!r.rating && !r.reviewText) && Math.random() > 0.4) {
                updateStats.rating = Math.floor(Math.random() * 5) + 1;
                updateStats.reviewText = "Sample review here";
            }

            if (Object.keys(updateStats).length > 0) {
                await db.collection('requests').updateOne({ _id: r._id }, { $set: updateStats });
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} requests with mock analytics data.`);
    }
    process.exit(0);
}).catch(console.error);
