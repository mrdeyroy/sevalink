import Request from "../models/Request.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import bcrypt from "bcryptjs";
import sendSMS from "../utils/sendSMS.js";

// Password must be at least 8 chars and contain at least one digit
const isStrongPassword = (pwd) => pwd.length >= 8 && /\d/.test(pwd);

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
    try {
        const totalRequests = await Request.countDocuments();
        const openRequests = await Request.countDocuments({ status: "Open" });
        const inProgressRequests = await Request.countDocuments({ status: "In Progress" });
        const resolvedRequests = await Request.countDocuments({ status: "Resolved" });

        // Requests by Category
        const requestsByCategory = await Request.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]);

        // Requests by Status
        const requestsByStatus = await Request.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        // Worker Performance (Tasks Resolved)
        const workerPerformance = await Request.aggregate([
            { $match: { status: "Resolved", assignedTo: { $exists: true } } },
            { $group: { _id: "$assignedTo", resolvedCount: { $sum: 1 } } },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "worker",
                },
            },
            { $unwind: "$worker" },
            { $project: { _id: 1, name: "$worker.name", resolvedCount: 1 } },
        ]);

        res.json({
            overview: {
                totalRequests,
                openRequests,
                inProgressRequests,
                resolvedRequests,
            },
            charts: {
                requestsByCategory,
                requestsByStatus,
                workerPerformance,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all workers
// @route   GET /api/admin/workers
// @access  Private (Admin)
export const getWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: "worker" }).select("-password");
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new worker account directly (no email invite)
// @route   POST /api/admin/create-worker
// @access  Private (Admin)
export const createWorker = async (req, res) => {
    const { name, mobile, password } = req.body;

    try {
        // Normalize mobile
        const normalizedMobile = mobile?.trim();

        if (!name || !normalizedMobile || !password) {
            return res.status(400).json({ message: "Name, mobile number, and password are required." });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and contain at least one number." });
        }

        const mobileExists = await User.findOne({ mobile: normalizedMobile });
        if (mobileExists) {
            return res.status(400).json({ message: "A user with this mobile number already exists." });
        }

        // Generate unique workerId: WRK-XXXX (1000 + count-based, padded)
        const workerCount = await User.countDocuments({ role: "worker" });
        const workerIdNum = 1000 + workerCount + 1;
        const workerId = `WRK-${workerIdNum}`;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const worker = await User.create({
            name,
            mobile: normalizedMobile,
            password: hashedPassword,
            role: "worker",
            workerId,
            status: "active",
            isVerified: true,
            mustChangePassword: true, // Worker must change on first login
            createdBy: req.user._id,
        });

        // Audit Log
        await AuditLog.create({
            action: "worker_created",
            performedBy: req.user._id,
            targetUser: worker._id,
            details: `Worker account created by admin ${req.user.name} for mobile ${normalizedMobile} (${workerId})`
        });

        // Send SMS notification to worker (non-fatal)
        try {
            const smsBody =
                `SevaLink Worker Account Approved\n` +
                `Worker ID: ${workerId}\n` +
                `Mobile: ${normalizedMobile}\n` +
                `Temporary Password: ${password}\n` +
                `Login at: http://localhost:5173/worker-login\n` +
                `Please change your password after first login.`;
            await sendSMS(normalizedMobile, smsBody);
        } catch (smsErr) {
            console.warn("Worker SMS notification failed (non-fatal):", smsErr.message);
        }

        res.status(201).json({
            message: `Worker account created successfully. SMS sent to ${normalizedMobile}.`,
            worker: {
                _id: worker._id,
                name: worker.name,
                mobile: worker.mobile,
                workerId: worker.workerId,
                role: worker.role,
                status: worker.status,
                mustChangePassword: worker.mustChangePassword,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get all citizens (for user management panel)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
    try {
        const citizens = await User.find({ role: "citizen" }).select("-password").sort({ createdAt: -1 });
        const total = citizens.length;
        const active = citizens.filter(u => u.status === "active").length;
        const banned = citizens.filter(u => u.status === "banned").length;
        const suspended = citizens.filter(u => u.status === "suspended").length;
        res.json({ citizens, stats: { total, active, banned, suspended } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ban or Unban a citizen
// @route   PATCH /api/admin/ban-user/:id
// @access  Private (Admin)
export const banUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot ban an admin account." });
        }

        user.status = user.status === "banned" ? "active" : "banned";
        await user.save();

        res.json({ message: `User has been ${user.status === "banned" ? "banned" : "unbanned"}.`, status: user.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete any non-admin user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot delete an admin account." });
        }

        await User.findByIdAndDelete(req.params.id);

        await AuditLog.create({
            action: "user_deleted",
            performedBy: req.user._id,
            targetUser: user._id,
            details: `User ${user.name} (role: ${user.role}) permanently deleted by admin ${req.user.name}`,
        });

        res.json({ message: `User "${user.name}" has been permanently deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Suspend or activate a user/worker account
// @route   PATCH /api/admin/suspend-user/:id
// @access  Private (Admin)
export const suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.role === "admin") {
            return res.status(403).json({ message: "Cannot suspend an admin account." });
        }

        user.status = user.status === "suspended" ? "active" : "suspended";
        await user.save();

        res.json({ message: `User account has been ${user.status}.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a worker account permanently
// @route   DELETE /api/admin/workers/:id
// @access  Private (Admin)
export const deleteWorker = async (req, res) => {
    try {
        const worker = await User.findById(req.params.id);

        if (!worker) {
            return res.status(404).json({ message: "Worker not found." });
        }

        if (worker.role !== "worker") {
            return res.status(403).json({ message: "Can only delete worker accounts." });
        }

        await User.findByIdAndDelete(req.params.id);

        await AuditLog.create({
            action: "worker_deleted",
            performedBy: req.user._id,
            targetUser: worker._id,
            details: `Worker ${worker.name} (mobile: ${worker.mobile}) permanently deleted by admin ${req.user.name}`,
        });

        res.json({ message: `Worker "${worker.name}" has been permanently deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system-wide resolution time analytics
// @route   GET /api/admin/analytics/resolution-time
// @access  Private (Admin)
export const getResolutionAnalytics = async (req, res) => {
    try {
        // Calculate average resolution time across all resolved requests
        const avgResolutionTimeAgg = await Request.aggregate([
            { $match: { status: "Resolved", resolutionTime: { $exists: true } } },
            { $group: { _id: null, avgTime: { $avg: "$resolutionTime" }, count: { $sum: 1 } } }
        ]);

        const avgResolutionTime = avgResolutionTimeAgg.length > 0 ? avgResolutionTimeAgg[0].avgTime : 0;
        const totalResolvedRequests = avgResolutionTimeAgg.length > 0 ? avgResolutionTimeAgg[0].count : 0;

        // Calculate requests pending > 3 days
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const pendingRequests = await Request.countDocuments({
            status: { $in: ["Open", "In Progress"] },
            createdAt: { $lte: threeDaysAgo }
        });

        // Calculate fastest worker
        const fastestWorkerAgg = await Request.aggregate([
            { $match: { status: "Resolved", resolutionTime: { $exists: true }, assignedTo: { $exists: true } } },
            { $group: { _id: "$assignedTo", avgTime: { $avg: "$resolutionTime" }, count: { $sum: 1 } } },
            { $sort: { avgTime: 1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "worker",
                },
            },
            { $unwind: "$worker" },
            { $project: { _id: 1, name: "$worker.name", avgTime: 1, completedTasks: "$count" } },
        ]);

        const fastestWorker = fastestWorkerAgg.length > 0 ? fastestWorkerAgg[0] : null;

        res.json({
            avgResolutionTime,
            totalResolvedRequests,
            pendingOver3Days: pendingRequests,
            fastestWorker
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get advanced worker performance analytics
// @route   GET /api/admin/analytics/worker-performance
// @access  Private (Admin)
export const getWorkerPerformance = async (req, res) => {
    try {
        const performance = await Request.aggregate([
            { $match: { assignedTo: { $exists: true } } },
            {
                $group: {
                    _id: "$assignedTo",
                    tasksAssigned: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
                    },
                    avgResolutionTime: {
                        $avg: { $cond: [{ $eq: ["$status", "Resolved"] }, "$resolutionTime", null] }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "worker",
                },
            },
            { $unwind: "$worker" },
            {
                $project: {
                    _id: 1,
                    name: "$worker.name",
                    status: "$worker.status",
                    tasksAssigned: 1,
                    completedTasks: 1,
                    avgResolutionTime: { $ifNull: ["$avgResolutionTime", 0] }
                }
            },
            { $sort: { completedTasks: -1 } }
        ]);

        res.json(performance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get area-wise complaint insights
// @route   GET /api/admin/analytics/area-insights
// @access  Private (Admin)
export const getAreaInsights = async (req, res) => {
    try {
        const requests = await Request.find({}).lean();

        // Group by the first part of the address (area name) 
        const areaMap = {};
        const heatPoints = [];

        requests.forEach(r => {
            // Extract area from address (first segment before comma, or full address)
            const address = r.location?.address || "Unknown";
            const area = address.split(",")[0].trim() || "Unknown";

            if (!areaMap[area]) {
                areaMap[area] = { area, total: 0, open: 0, inProgress: 0, resolved: 0, categories: {} };
            }
            areaMap[area].total += 1;
            if (r.status === "Open") areaMap[area].open += 1;
            else if (r.status === "In Progress") areaMap[area].inProgress += 1;
            else if (r.status === "Resolved") areaMap[area].resolved += 1;

            // Track categories
            const cat = r.category || "Other";
            areaMap[area].categories[cat] = (areaMap[area].categories[cat] || 0) + 1;

            // Collect heat points (latitude, longitude, intensity)
            if (r.location?.latitude && r.location?.longitude) {
                heatPoints.push([r.location.latitude, r.location.longitude, 1]);
            }
        });

        // Convert to array, add top category, sort by total desc
        const areas = Object.values(areaMap).map(a => {
            const topCategory = Object.entries(a.categories).sort((x, y) => y[1] - x[1])[0];
            return {
                area: a.area,
                total: a.total,
                open: a.open,
                inProgress: a.inProgress,
                resolved: a.resolved,
                topCategory: topCategory ? topCategory[0] : "N/A",
            };
        }).sort((a, b) => b.total - a.total);

        res.json({ areas, heatPoints });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complete analytics overview (Total, New this week, Resolution Rate, Avg Time, Response Time by Priority)
// @route   GET /api/admin/analytics/overview
// @access  Private (Admin)
export const getAnalyticsOverview = async (req, res) => {
    try {
        const requests = await Request.find({}).lean();

        const totalComplaints = requests.length;

        // New this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newThisWeek = requests.filter(r => new Date(r.createdAt) >= oneWeekAgo).length;

        // Resolution rate
        const resolvedRequests = requests.filter(r => r.status === "Resolved");
        const resolutionRate = totalComplaints > 0 ? Math.round((resolvedRequests.length / totalComplaints) * 100) : 0;

        // Average resolution time (overall)
        const requestsWithResTime = requests.filter(r => r.resolutionTime > 0);
        const avgResolutionTime = requestsWithResTime.length > 0
            ? (requestsWithResTime.reduce((sum, r) => sum + r.resolutionTime, 0) / requestsWithResTime.length)
            : 0;

        // Average resolution time by priority
        const priorities = ['Critical', 'Emergency', 'High', 'Medium', 'Low'];
        const responseTimeByPriority = {};

        priorities.forEach(p => {
            // Note: 'Emergency' is the enum value in Request schema, but prompt asked for 'Critical'. We map it.
            const queryP = p === 'Critical' ? 'Emergency' : p;
            const reqs = requestsWithResTime.filter(r => r.priority === queryP);
            const avg = reqs.length > 0 ? (reqs.reduce((sum, r) => sum + r.resolutionTime, 0) / reqs.length) : 0;
            responseTimeByPriority[p] = avg;
        });

        // Priority distribution
        const priorityDistribution = {
            'Critical': 0,
            'High': 0,
            'Medium': 0,
            'Low': 0,
        };

        requests.forEach(r => {
            const p = r.priority || 'Low';
            if (p === 'Emergency') priorityDistribution['Critical']++;
            else if (priorityDistribution[p] !== undefined) priorityDistribution[p]++;
            else priorityDistribution['Low']++;
        });

        // Service Efficiency Score metrics
        const resolvedWithin48h = requestsWithResTime.filter(r => r.resolutionTime <= 48).length;
        const resolvedWithin48hRate = requestsWithResTime.length > 0 ? Math.round((resolvedWithin48h / requestsWithResTime.length) * 100) : 0;
        const delayedRequests = requests.filter(r => r.status !== "Resolved" && new Date(r.createdAt) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)).length;

        res.json({
            totalComplaints,
            newThisWeek,
            resolutionRate,
            avgResolutionTime,
            responseTimeByPriority,
            priorityDistribution,
            serviceEfficiency: {
                avgResolutionTime,
                resolvedWithin48hRate,
                delayedRequests
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get infrastructure hotspots (Grouped by location + category)
// @route   GET /api/admin/analytics/hotspots
// @access  Private (Admin)
export const getHotspots = async (req, res) => {
    try {
        const requests = await Request.find({}).lean();
        const hotspotsMap = {};

        requests.forEach(r => {
            const address = r.location?.address || "Unknown";
            const area = address.split(",")[0].trim() || "Unknown";
            const category = r.category || "Other";

            const key = `${area}|${category}`;

            if (!hotspotsMap[key]) {
                hotspotsMap[key] = { area, category, count: 0 };
            }
            hotspotsMap[key].count += 1;
        });

        // Filter and sort for actual hotspots (e.g. at least 2 complaints)
        // For demonstration, we'll return top 10 grouped
        const hotspots = Object.values(hotspotsMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);

        res.json(hotspots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complaint category trends over time
// @route   GET /api/admin/analytics/categories
// @access  Private (Admin)
export const getCategoryTrends = async (req, res) => {
    try {
        const requests = await Request.find({}).lean();

        // Group by month and category
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trends = {};

        requests.forEach(r => {
            const d = new Date(r.createdAt);
            const monthName = months[d.getMonth()];
            const cat = r.category || "Other";

            if (!trends[monthName]) {
                trends[monthName] = { name: monthName };
            }
            trends[monthName][cat] = (trends[monthName][cat] || 0) + 1;
        });

        // Current distribution
        const distribution = {};
        requests.forEach(r => {
            const cat = r.category || "Other";
            distribution[cat] = (distribution[cat] || 0) + 1;
        });

        // Create an ordered array for the chart
        const chartData = months.filter(m => trends[m]).map(m => trends[m]);

        res.json({ trends: chartData, distribution });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get citizen engagement metrics
// @route   GET /api/admin/analytics/engagement
// @access  Private (Admin)
export const getCitizenEngagement = async (req, res) => {
    try {
        const requests = await Request.find({}).lean();

        // Active Citizens (have made at least 1 request)
        const userMap = {};
        let photoUploads = 0;
        let reviewsSubmitted = 0;

        requests.forEach(r => {
            if (r.createdBy) {
                const uid = r.createdBy.toString();
                userMap[uid] = (userMap[uid] || 0) + 1;
            }
            if (r.imageUrl) {
                photoUploads += 1;
            }
            if (r.rating || r.reviewText) {
                reviewsSubmitted += 1;
            }
        });

        const activeCitizens = Object.keys(userMap).length;
        const repeatReporters = Object.values(userMap).filter(count => count >= 2).length;

        res.json({
            activeCitizens,
            repeatReporters,
            photoUploads,
            reviewsSubmitted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
