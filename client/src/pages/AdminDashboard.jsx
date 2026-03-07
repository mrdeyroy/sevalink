import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Bar, Pie } from "react-chartjs-2";
import MapView from "../components/MapView";
import AssignWorkerModal from "../components/AssignWorkerModal";
import RequestDetailsModal from "../components/RequestDetailsModal";
import CreateWorkerModal from "../components/CreateWorkerModal";
import PageLoader from "../components/PageLoader";
import { LayoutDashboard, List, Map as MapIcon, Eye, UserPlus, Filter, Search, Users, XCircle, UserMinus, UserCheck, Phone, Trash2, AlertTriangle, Megaphone, Plus, Ban, CheckCircle, Clock, Zap, ChevronLeft, ChevronRight, ArrowUpDown, X as XIcon, AlertCircle as AlertCircleIcon, TrendingUp } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtering State
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterCategory, setFilterCategory] = useState("All");
    const [filterWorker, setFilterWorker] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination & Sorting
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const ROWS_PER_PAGE = 10;

    // Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCreateWorkerModalOpen, setIsCreateWorkerModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [workerToDelete, setWorkerToDelete] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    // Users tab state
    const [citizens, setCitizens] = useState([]);
    const [citizenStats, setCitizenStats] = useState({ total: 0, active: 0, banned: 0 });

    // Announcements tab state
    const [announcements, setAnnouncements] = useState([]);
    const [annTitle, setAnnTitle] = useState("");
    const [annMessage, setAnnMessage] = useState("");
    const [annLoading, setAnnLoading] = useState(false);

    // Analytics state
    const [resolutionAnalytics, setResolutionAnalytics] = useState(null);
    const [workerPerformance, setWorkerPerformance] = useState([]);
    const [areaInsights, setAreaInsights] = useState(null);

    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };

    const fetchData = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            console.log("Fetching Admin Data...");
            const results = await Promise.allSettled([
                axios.get("https://sevalink-zygf.vercel.app/api/admin/stats", config),
                axios.get("https://sevalink-zygf.vercel.app/api/requests", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/workers", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/users", config),
                axios.get("https://sevalink-zygf.vercel.app/api/announcements", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/resolution-time", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/worker-performance", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/area-insights", config)
            ]);

            const [statsResult, requestsResult, workersResult, usersResult, annResult, resAnalyticsResult, perfResult, areaResult] = results;

            if (statsResult.status === "fulfilled") setStats(statsResult.value.data);
            if (requestsResult.status === "fulfilled") setRequests(requestsResult.value.data);
            if (workersResult.status === "fulfilled") setWorkers(workersResult.value.data);
            if (usersResult.status === "fulfilled") {
                setCitizens(usersResult.value.data.citizens);
                setCitizenStats(usersResult.value.data.stats);
            }
            if (annResult.status === "fulfilled") setAnnouncements(annResult.value.data);
            if (resAnalyticsResult.status === "fulfilled") setResolutionAnalytics(resAnalyticsResult.value.data);
            if (perfResult.status === "fulfilled") setWorkerPerformance(perfResult.value.data);
            if (areaResult.status === "fulfilled") setAreaInsights(areaResult.value.data);
        } catch (error) {
            console.error("Values error:", error);
        } finally {
            // Ensure loading animation stays for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleAssignClick = (request) => {
        setSelectedRequest(request);
        setIsAssignModalOpen(true);
    };

    const handleAssignWorker = async (workerId) => {
        try {
            console.log("Sending assignment request for:", selectedRequest._id, "Worker:", workerId);
            await axios.put(
                `https://sevalink-zygf.vercel.app/api/requests/${selectedRequest._id}/assign`,
                { workerId },
                config
            );
            alert("Worker assigned successfully!");
            setIsAssignModalOpen(false);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Failed to assign worker", error);
            alert(`Failed to assign worker: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.put(
                `https://sevalink-zygf.vercel.app/api/requests/${id}/status`,
                { status: newStatus },
                config
            );
            toast.success(`Status updated to ${newStatus}`);
            fetchData();
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update status");
        }
    };

    const handlePriorityUpdate = async (id, newPriority) => {
        try {
            await axios.put(
                `https://sevalink-zygf.vercel.app/api/requests/${id}/status`,
                { priority: newPriority },
                config
            );
            setRequests(requests.map(r => r._id === id ? { ...r, priority: newPriority } : r));
            toast.success(`Priority set to ${newPriority}`);
        } catch (error) {
            console.error("Failed to update priority", error);
            toast.error("Failed to update priority");
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsDetailsModalOpen(true);
    };

    const handleCreateWorker = async (name, mobile, password) => {
        try {
            const res = await axios.post(
                "https://sevalink-zygf.vercel.app/api/admin/create-worker",
                { name, mobile, password },
                config
            );
            const wId = res.data.worker?.workerId || "";
            alert(`Worker account created!\nWorker ID: ${wId}\nMobile: ${mobile}\nSMS notification sent.`);
            setIsCreateWorkerModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create worker", error);
            alert(`Failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSuspendWorker = async (id) => {
        try {
            await axios.patch(`https://sevalink-zygf.vercel.app/api/admin/suspend-user/${id}`, {}, config);
            fetchData();
        } catch (error) {
            console.error("Suspend toggle failed", error);
        }
    };

    const handleDeleteWorker = async () => {
        if (!workerToDelete) return;
        try {
            await axios.delete(`https://sevalink-zygf.vercel.app/api/admin/workers/${workerToDelete._id}`, config);
            setWorkerToDelete(null);
            fetchData();
        } catch (error) {
            alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleBanUser = async (id) => {
        try {
            await axios.patch(`https://sevalink-zygf.vercel.app/api/admin/ban-user/${id}`, {}, config);
            fetchData();
        } catch (error) {
            console.error("Ban toggle failed", error);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await axios.delete(`https://sevalink-zygf.vercel.app/api/admin/users/${userToDelete._id}`, config);
            setUserToDelete(null);
            fetchData();
        } catch (error) {
            alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!annTitle.trim() || !annMessage.trim()) return;
        setAnnLoading(true);
        try {
            await axios.post("https://sevalink-zygf.vercel.app/api/announcements", { title: annTitle, message: annMessage }, config);
            setAnnTitle("");
            setAnnMessage("");
            fetchData();
        } catch (err) {
            alert(`Failed: ${err.response?.data?.message || err.message}`);
        } finally {
            setAnnLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        try {
            await axios.delete(`https://sevalink-zygf.vercel.app/api/announcements/${id}`, config);
            fetchData();
        } catch (err) {
            alert(`Failed to delete announcement.`);
        }
    };

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        const matchesStatus = filterStatus === "All" || req.status === filterStatus;
        const matchesCategory = filterCategory === "All" || req.category === filterCategory;
        const matchesWorker = filterWorker === "All" || (req.assignedTo && req.assignedTo._id === filterWorker) || (!req.assignedTo && filterWorker === "unassigned");
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.complaintId && req.complaintId.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesCategory && matchesSearch && matchesWorker;
    });

    // Sort
    const sortedRequests = [...filteredRequests].sort((a, b) => {
        const priorityOrder = { Emergency: 0, High: 1, Medium: 2, Low: 3 };
        const statusOrder = { Open: 0, Assigned: 1, "In Progress": 2, Resolved: 3 };
        let compare = 0;
        if (sortField === "createdAt") compare = new Date(a.createdAt) - new Date(b.createdAt);
        else if (sortField === "status") compare = statusOrder[a.status] - statusOrder[b.status];
        else if (sortField === "priority") compare = (priorityOrder[a.priority || "Medium"]) - (priorityOrder[b.priority || "Medium"]);
        return sortOrder === "asc" ? compare : -compare;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedRequests.length / ROWS_PER_PAGE));
    const paginatedRequests = sortedRequests.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

    // Repeat issue detection: same category + similar address
    const repeatMap = {};
    requests.forEach(r => {
        const key = `${r.category}::${(r.location?.address || "").split(",")[0].trim().toLowerCase()}`;
        if (!repeatMap[key]) repeatMap[key] = [];
        repeatMap[key].push(r._id);
    });
    const isRepeatIssue = (req) => {
        const key = `${req.category}::${(req.location?.address || "").split(",")[0].trim().toLowerCase()}`;
        return repeatMap[key] && repeatMap[key].length >= 2;
    };

    // Helper: check delay
    const getDaysSinceCreation = (createdAt) => (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);

    const clearFilters = () => {
        setFilterStatus("All");
        setFilterCategory("All");
        setFilterWorker("All");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const toggleSort = (field) => {
        if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortOrder("desc"); }
        setCurrentPage(1);
    };

    const hasActiveFilters = filterStatus !== "All" || filterCategory !== "All" || filterWorker !== "All" || searchTerm;

    if (loading) return <PageLoader />;

    // Charts Data
    const barData = stats ? {
        labels: stats.charts.requestsByCategory.map((item) => item._id),
        datasets: [{
            label: "Requests by Category",
            data: stats.charts.requestsByCategory.map((item) => item.count),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
        }],
    } : null;

    const pieData = stats ? {
        labels: stats.charts.requestsByStatus.map((item) => item._id),
        datasets: [{
            label: "# of Requests",
            data: stats.charts.requestsByStatus.map((item) => item.count),
            backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)"],
            borderWidth: 1,
        }],
    } : null;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <button
                            onClick={fetchData}
                            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 text-blue-600 transition"
                            title="Refresh Data"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                <path d="M16 16h5v5" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap bg-white rounded-lg shadow-sm p-1 mt-4 md:mt-0 gap-1">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "overview" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <LayoutDashboard size={18} className="mr-2" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "requests" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <List size={18} className="mr-2" />
                            Requests
                        </button>
                        <button
                            onClick={() => setActiveTab("map")}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "map" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <MapIcon size={18} className="mr-2" />
                            Map View
                        </button>
                        <button
                            onClick={() => setActiveTab("staff")}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "staff" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <Users size={18} className="mr-2" />
                            Staff
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "users" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <Users size={18} className="mr-2" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab("announcements")}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "announcements" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            <Megaphone size={18} className="mr-2" />
                            Announcements
                        </button>
                    </div>
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && stats && (
                    <div className="animate-fade-in">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                                <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.overview.totalRequests}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                                <h3 className="text-gray-500 text-sm font-medium">Open</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.overview.openRequests}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                                <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.overview.inProgressRequests}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.overview.resolvedRequests}</p>
                            </div>
                        </div>

                        {/* Analytics Cards Header + Link */}
                        <div className="flex justify-between items-center mb-4 mt-8">
                            <h3 className="text-lg font-bold">Quick Analytics</h3>
                            <Link
                                to="/admin/analytics"
                                className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
                            >
                                <TrendingUp size={16} /> Open Full Analytics Dashboard
                            </Link>
                        </div>

                        {/* Analytics Cards */}
                        {resolutionAnalytics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-indigo-800 text-sm font-semibold flex items-center gap-1 mb-1">
                                            <Clock size={16} /> Average Resolution Time
                                        </h3>
                                        <p className="text-3xl font-bold text-indigo-900">
                                            {resolutionAnalytics.avgResolutionTime > 0
                                                ? `${resolutionAnalytics.avgResolutionTime.toFixed(1)} hrs`
                                                : "N/A"
                                            }
                                        </p>
                                        <p className="text-xs text-indigo-600 mt-1">Across all completed tasks</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-6 rounded-xl shadow-sm border border-rose-100 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-rose-800 text-sm font-semibold flex items-center gap-1 mb-1">
                                            <AlertTriangle size={16} /> Pending &gt; 3 Days
                                        </h3>
                                        <p className="text-3xl font-bold text-rose-900">{resolutionAnalytics.pendingOver3Days}</p>
                                        <p className="text-xs text-rose-600 mt-1">Requires immediate attention</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Requests by Category</h3>
                                <Bar data={barData} />
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Request Status Distribution</h3>
                                <div className="w-2/3 mx-auto">
                                    <Pie data={pieData} />
                                </div>
                            </div>
                        </div>

                        {/* Worker Performance */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Zap size={20} className="text-yellow-500" />
                                Worker Performance Analytics
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Assigned</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Resolution Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {workerPerformance.length > 0 ? (
                                            workerPerformance.map((worker, idx) => {
                                                const isFastest = resolutionAnalytics?.fastestWorker && worker._id === resolutionAnalytics.fastestWorker._id;
                                                return (
                                                    <tr key={idx} className={isFastest ? "bg-yellow-50" : "hover:bg-gray-50"}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${isFastest ? "bg-yellow-200 text-yellow-800" : "bg-blue-100 text-blue-600"}`}>
                                                                    {worker.name.charAt(0)}
                                                                </div>
                                                                <span className={`font-medium ${isFastest ? "text-yellow-900" : "text-gray-900"}`}>{worker.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            {worker.tasksAssigned}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                            <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                                                                {worker.completedTasks}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-700 text-sm font-medium">
                                                                    {worker.avgResolutionTime > 0 ? `${worker.avgResolutionTime.toFixed(1)} hrs` : "N/A"}
                                                                </span>
                                                                {isFastest && (
                                                                    <span className="flex items-center text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full gap-1">
                                                                        <Zap size={10} className="fill-yellow-500 text-yellow-500" /> Fastest
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${worker.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {worker.status || 'unknown'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 italic">No worker performance data yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Area-wise Complaint Insights */}
                        {areaInsights && areaInsights.areas && areaInsights.areas.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <MapIcon size={20} className="text-blue-500" />
                                    Area-wise Complaint Insights
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area / Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Complaints</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Issue Category</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {areaInsights.areas.map((area, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                        {area.area}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
                                                            {area.total}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                        {area.open}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                                                        {area.inProgress}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        {area.resolved}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {area.topCategory}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* REQUESTS TAB */}
                {activeTab === "requests" && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-fade-in border border-gray-100">
                        {/* Filters */}
                        <div className="p-4 sm:p-5 border-b bg-gray-50">
                            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <select
                                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Open">Open</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                    <select
                                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Water">Water</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Health">Health</option>
                                        <option value="Roads">Roads</option>
                                        <option value="Documents">Documents</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <select
                                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={filterWorker} onChange={(e) => { setFilterWorker(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="All">All Workers</option>
                                        <option value="unassigned">Unassigned</option>
                                        {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                    </select>
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-medium">
                                            <XIcon size={14} /> Clear
                                        </button>
                                    )}
                                </div>
                                <div className="relative w-full lg:w-72">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    <input
                                        type="text" placeholder="Search by title, ID..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-400">
                                Showing {paginatedRequests.length} of {sortedRequests.length} requests
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Complaint ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Request</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => toggleSort("status")}>
                                            <span className="flex items-center gap-1">Status <ArrowUpDown size={12} /></span>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => toggleSort("priority")}>
                                            <span className="flex items-center gap-1">Priority <ArrowUpDown size={12} /></span>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => toggleSort("createdAt")}>
                                            <span className="flex items-center gap-1">Date <ArrowUpDown size={12} /></span>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paginatedRequests.map((req) => {
                                        const days = getDaysSinceCreation(req.createdAt);
                                        const isOld7 = req.status !== "Resolved" && days > 7;
                                        const isOld3 = req.status !== "Resolved" && days > 3 && !isOld7;
                                        const rowBg = isOld7 ? "bg-red-50/60" : isOld3 ? "bg-amber-50/60" : "";
                                        return (
                                            <tr key={req._id} className={`hover:bg-blue-50/40 transition ${rowBg}`}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        {req.complaintId ? (
                                                            <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                                {req.complaintId}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">—</span>
                                                        )}
                                                        {isRepeatIssue(req) && (
                                                            <span title="Multiple complaints in this area" className="text-amber-500 cursor-help"><AlertTriangle size={14} /></span>
                                                        )}
                                                        {(isOld7 || isOld3) && (
                                                            <span title={`Pending ${Math.floor(days)} days`} className={`cursor-help ${isOld7 ? "text-red-500" : "text-amber-500"}`}>
                                                                <Clock size={13} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">{req.title}</div>
                                                    <div className="text-xs text-gray-400 truncate max-w-[200px]">{req.location?.address || "—"}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${req.category === "Water" ? "bg-blue-100 text-blue-700" :
                                                        req.category === "Electricity" ? "bg-yellow-100 text-yellow-700" :
                                                            req.category === "Health" ? "bg-pink-100 text-pink-700" :
                                                                req.category === "Roads" ? "bg-orange-100 text-orange-700" :
                                                                    req.category === "Documents" ? "bg-purple-100 text-purple-700" :
                                                                        "bg-gray-100 text-gray-700"
                                                        }`}>{req.category}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select
                                                        value={req.status}
                                                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                                                        className={`text-xs font-bold rounded-lg border px-2 py-1 cursor-pointer focus:ring-2 focus:ring-blue-400 ${req.status === "Resolved" ? "text-green-700 bg-green-50 border-green-200" :
                                                            req.status === "In Progress" ? "text-amber-700 bg-amber-50 border-amber-200" :
                                                                req.status === "Assigned" ? "text-blue-700 bg-blue-50 border-blue-200" :
                                                                    "text-red-700 bg-red-50 border-red-200"
                                                            }`}
                                                    >
                                                        <option value="Open">Open</option>
                                                        <option value="Assigned">Assigned</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Resolved">Resolved</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <select
                                                        value={req.priority || "Medium"}
                                                        onChange={(e) => handlePriorityUpdate(req._id, e.target.value)}
                                                        className={`text-xs font-bold rounded-lg border px-2 py-1 cursor-pointer focus:ring-2 focus:ring-blue-400 ${(req.priority || "Medium") === "Emergency" ? "text-red-700 bg-red-50 border-red-200" :
                                                            (req.priority || "Medium") === "High" ? "text-orange-700 bg-orange-50 border-orange-200" :
                                                                (req.priority || "Medium") === "Medium" ? "text-yellow-700 bg-yellow-50 border-yellow-200" :
                                                                    "text-gray-600 bg-gray-50 border-gray-200"
                                                            }`}
                                                    >
                                                        <option value="Low">Low</option>
                                                        <option value="Medium">Medium</option>
                                                        <option value="High">High</option>
                                                        <option value="Emergency">Emergency</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                    {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {req.assignedTo ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                                {req.assignedTo.name?.charAt(0)}
                                                            </div>
                                                            <span className="text-blue-700 font-medium text-xs">{req.assignedTo.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleViewDetails(req)} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition" title="View Details">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button onClick={() => handleAssignClick(req)} className="p-1.5 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition" title={req.assignedTo ? "Reassign Worker" : "Assign Worker"}>
                                                            <UserPlus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {sortedRequests.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <AlertCircleIcon size={40} className="mx-auto text-gray-300 mb-2" />
                                    <p className="font-semibold">No requests match your filters</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* MAP TAB */}
                {activeTab === "map" && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Request Map Distribution & Heatmap</h2>
                        </div>
                        <div className="h-[600px] border rounded-lg overflow-hidden relative">
                            <MapView requests={filteredRequests} heatPoints={areaInsights?.heatPoints} />
                        </div>
                    </div>
                )}

                {/* STAFF TAB */}
                {activeTab === "staff" && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                            <h2 className="text-xl font-bold">Staff Directory</h2>
                            <button
                                onClick={() => setIsCreateWorkerModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
                            >
                                <UserPlus size={16} className="mr-2" />
                                Create Worker
                            </button>
                        </div>

                        {/* Staff Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                { label: "Total Staff", value: workers.length, color: "border-blue-500" },
                                { label: "Active", value: workers.filter(w => w.status === 'active').length, color: "border-green-500" },
                                { label: "Suspended", value: workers.filter(w => w.status === 'suspended').length, color: "border-yellow-500" },
                            ].map(s => (
                                <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.color}`}>
                                    <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {workers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {workers.map((worker) => (
                                    <div key={worker._id} className={`border rounded-lg p-5 shadow-sm bg-white ${worker.status === "suspended" ? "opacity-75 border-red-200" : "border-gray-100"}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 border ${worker.status === "suspended" ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                                                    {worker.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-md font-bold text-gray-800">{worker.name}</h3>
                                                    {worker.workerId && (
                                                        <span className="text-xs font-mono font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">{worker.workerId}</span>
                                                    )}
                                                    <div className="mt-0.5">
                                                        {worker.status === "active" && <span className="text-xs font-semibold px-2 py-0.5 bg-green-100 text-green-700 rounded-full inline-flex items-center"><UserCheck size={12} className="mr-1" /> Active</span>}
                                                        {worker.status === "suspended" && <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full inline-flex items-center"><XCircle size={12} className="mr-1" /> Suspended</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleSuspendWorker(worker._id)}
                                                    className={`p-1.5 rounded-md ${worker.status === "suspended" ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                                                    title={worker.status === "suspended" ? "Reactivate Worker" : "Suspend Worker"}
                                                >
                                                    {worker.status === "suspended" ? <UserCheck size={18} /> : <UserMinus size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => setWorkerToDelete(worker)}
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                    title="Delete Worker"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1 truncate flex items-center gap-1"><Phone size={13} className="text-gray-400" /> {worker.mobile || <span className="italic text-gray-400">No mobile</span>}</p>
                                        <p className="text-sm text-gray-600"><strong>Joined:</strong> {new Date(worker.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No workers have been registered yet.</p>
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === "users" && (
                    <div className="animate-fade-in">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: "Total Citizens", value: citizenStats.total, color: "border-blue-500" },
                                { label: "Active", value: citizenStats.active, color: "border-green-500" },
                                { label: "Banned", value: citizenStats.banned, color: "border-red-500" },
                                { label: "Suspended", value: citizenStats.suspended || 0, color: "border-yellow-500" },
                            ].map(s => (
                                <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.color}`}>
                                    <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">Citizen Accounts</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {citizens.map(c => (
                                            <tr key={c._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                            {c.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{c.name}</p>
                                                            {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {c.mobile && <div className="flex items-center gap-1"><Phone size={12} className="text-gray-400" />{c.mobile}</div>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === "active" ? "bg-green-100 text-green-700" :
                                                        c.status === "banned" ? "bg-red-100 text-red-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleBanUser(c._id)}
                                                            className={`p-1.5 rounded-md text-sm transition ${c.status === "banned"
                                                                ? "text-green-600 hover:bg-green-50"
                                                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                }`}
                                                            title={c.status === "banned" ? "Unban User" : "Ban User"}
                                                        >
                                                            {c.status === "banned" ? <CheckCircle size={16} /> : <Ban size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setUserToDelete(c)}
                                                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {citizens.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">No citizens registered yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ANNOUNCEMENTS TAB */}
                {activeTab === "announcements" && (
                    <div className="animate-fade-in space-y-6">
                        {/* Create Announcement Form */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-blue-600" /> Create Announcement
                            </h2>
                            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. Water supply maintenance tomorrow"
                                        value={annTitle}
                                        onChange={e => setAnnTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-1">Message</label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                        placeholder="Write the announcement message here..."
                                        rows={3}
                                        value={annMessage}
                                        onChange={e => setAnnMessage(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={annLoading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2"
                                >
                                    {annLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Megaphone size={14} />}
                                    Post Announcement
                                </button>
                            </form>
                        </div>

                        {/* Existing Announcements */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800">All Announcements ({announcements.length})</h2>
                            </div>
                            {announcements.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No announcements yet.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {announcements.map(ann => (
                                        <div key={ann._id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-gray-900">{ann.title}</h3>
                                                <p className="text-sm text-gray-600 mt-0.5">{ann.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(ann.createdAt).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAnnouncement(ann._id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition shrink-0"
                                                title="Delete Announcement"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODALS */}
                <AssignWorkerModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    workers={workers}
                    onAssign={handleAssignWorker}
                />

                <RequestDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    request={selectedRequest}
                />

                <CreateWorkerModal
                    isOpen={isCreateWorkerModalOpen}
                    onClose={() => setIsCreateWorkerModalOpen(false)}
                    onCreateWorker={handleCreateWorker}
                />

                {/* Delete Worker Confirmation Modal */}
                {workerToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle size={28} className="text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Worker?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Permanently delete <strong className="text-gray-800">{workerToDelete.name}</strong>?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setWorkerToDelete(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteWorker}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 size={15} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete User Confirmation Modal */}
                {userToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
                            <div className="flex justify-center mb-4">
                                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertTriangle size={28} className="text-red-500" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete User?</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Permanently delete <strong className="text-gray-800">{userToDelete.name}</strong>? This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setUserToDelete(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button onClick={handleDeleteUser}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center justify-center gap-1.5">
                                    <Trash2 size={15} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
