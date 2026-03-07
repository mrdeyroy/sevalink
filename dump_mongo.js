const { MongoClient } = require('mongodb');

async function run() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db('sevalink');
        const users = database.collection('users');

        const allUsers = await users.find({}, { projection: { name: 1, email: 1, mobile: 1, role: 1 } }).toArray();
        console.log(JSON.stringify(allUsers, null, 2));
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
