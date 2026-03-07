import axios from "axios";

const verify = async () => {
    try {
        // 1. Login as Admin
        console.log("Logging in as Admin...");
        const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
            email: "admin@sevalink.com",
            password: "password123"
        });
        const token = loginRes.data.token;
        console.log("Login successful. Token received.");

        // 2. Fetch Stats (Known good endpoint)
        console.log("Fetching Stats...");
        try {
            const statsRes = await axios.get("http://localhost:5000/api/admin/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Stats Response Status:", statsRes.status);
        } catch (error) {
            console.error("Stats Error:", error.response ? error.response.status : error.message);
        }

        // 3. Fetch Workers
        console.log("Fetching Workers...");
        const workersRes = await axios.get("http://localhost:5000/api/admin/workers", {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Workers Response Status:", workersRes.status);
        console.log("Workers Data:", JSON.stringify(workersRes.data, null, 2));

    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
};

verify();
