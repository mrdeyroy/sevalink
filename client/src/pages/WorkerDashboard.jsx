import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import RequestDetailsModal from "../components/RequestDetailsModal";
import UploadProofModal from "../components/UploadProofModal";
import AnnouncementBanner from "../components/AnnouncementBanner";
import {
    LayoutList, Map as MapIcon, CheckCircle, Clock, AlertCircle,
    RefreshCw, Eye, Play, Loader2, MapPin, Image as ImageIcon,
    ClipboardList, ChevronRight, Truck
} from "lucide-react";
import PageLoader from "../components/PageLoader";

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("list");
    const [updatingId, setUpdatingId] = useState(null);

    // Modal State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Proof upload modal
    const [proofTask, setProofTask] = useState(null);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [proofLoading, setProofLoading] = useState(false);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    const fetchTasks = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            const { data } = await axios.get("https://server-gray-three-90.vercel.app/api/requests", config);
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Failed to load tasks.");
        } finally {
            // Ensure loading animation stays for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const { data } = await axios.get("https://server-gray-three-90.vercel.app/api/announcements", config);
            setAnnouncements(data);
        } catch (err) {
            console.error("Failed to load announcements:", err);
        }
    };

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            await axios.put(`https://server-gray-three-90.vercel.app/api/requests/${id}/status`, { status }, config);
            setTasks(tasks.map(t => t._id === id ? { ...t, status } : t));
            if (selectedRequest && selectedRequest._id === id) {
                setSelectedRequest({ ...selectedRequest, status });
            }
            toast.success(status === "In Progress" ? "Work Started! 🚀" : `Status updated to ${status}`);
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleResolveClick = (task) => {
        setProofTask(task);
        setIsProofModalOpen(true);
    };

    const handleProofUploadAndResolve = async (file) => {
        if (!proofTask) return;
        setProofLoading(true);
        try {
            const formData = new FormData();
            formData.append("proofImage", file);
            formData.append("status", "Resolved");

            await axios.put(
                `https://server-gray-three-90.vercel.app/api/requests/${proofTask._id}/status`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setTasks(tasks.map(t => t._id === proofTask._id ? { ...t, status: "Resolved" } : t));
            setIsProofModalOpen(false);
            setProofTask(null);
            toast.success("Issue Resolved Successfully! ✅");
        } catch (error) {
            console.error("Error uploading proof:", error);
            toast.error("Failed to upload proof. Please try again.");
        } finally {
            setProofLoading(false);
        }
    };

    const handleViewDetails = (task) => {
        setSelectedRequest(task);
        setIsDetailsModalOpen(true);
    };

    useEffect(() => {
        fetchTasks();
        fetchAnnouncements();
    }, [user]);

    // Stats
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === "Open" || t.status === "Assigned" || t.status === "In Progress").length;
    const resolvedTasks = tasks.filter(t => t.status === "Resolved").length;

    const statusColors = {
        "Open": "bg-red-100 text-red-700 border-red-200",
        "Assigned": "bg-blue-100 text-blue-700 border-blue-200",
        "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
        "Resolved": "bg-green-100 text-green-700 border-green-200",
    };

    const categoryColors = {
        "Water": "bg-blue-100 text-blue-700",
        "Electricity": "bg-yellow-100 text-yellow-700",
        "Health": "bg-pink-100 text-pink-700",
        "Roads": "bg-orange-100 text-orange-700",
        "Documents": "bg-purple-100 text-purple-700",
        "Other": "bg-gray-100 text-gray-700",
    };

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-10">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Worker Dashboard</h1>
                        <p className="text-gray-500 mt-1 text-base">
                            Welcome, <span className="font-semibold text-blue-600">{user?.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={fetchTasks}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all font-medium text-sm shadow-sm"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Announcements */}
                <AnnouncementBanner announcements={announcements} />

                {/* ─── Quick Stats ─── */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                    {[
                        { label: "Total Assigned", value: totalTasks, icon: ClipboardList, bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600", iconBg: "bg-blue-100" },
                        { label: "Pending", value: pendingTasks, icon: Clock, bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-600", iconBg: "bg-amber-100" },
                        { label: "Resolved", value: resolvedTasks, icon: CheckCircle, bg: "bg-green-50", border: "border-green-100", text: "text-green-600", iconBg: "bg-green-100" },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4`}>
                            <div className={`${stat.iconBg} p-2.5 sm:p-3 rounded-xl`}>
                                <stat.icon size={22} className={stat.text} />
                            </div>
                            <div>
                                <p className={`text-2xl sm:text-3xl font-extrabold ${stat.text}`}>{stat.value}</p>
                                <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── View Toggle + Task List ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">Assigned Tasks</h2>
                        <div className="flex bg-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab("list")}
                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                <LayoutList size={16} className="mr-1.5" /> List
                            </button>
                            <button
                                onClick={() => setActiveTab("map")}
                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition ${activeTab === "map" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                <MapIcon size={16} className="mr-1.5" /> Map
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {tasks.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <ClipboardList size={52} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-xl font-semibold mb-1">No tasks assigned yet</p>
                                <p className="text-sm">You'll see your assigned tasks here.</p>
                            </div>
                        ) : activeTab === "list" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden flex flex-col"
                                    >
                                        {/* Card Header — badges */}
                                        <div className="px-5 pt-4 pb-0 flex justify-between items-start">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${categoryColors[task.category] || categoryColors["Other"]}`}>
                                                {task.category}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[task.status]}`}>
                                                {task.status}
                                            </span>
                                        </div>

                                        {/* Card Body */}
                                        <div className="px-5 py-3 flex-grow">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug">{task.title}</h3>
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>

                                            {/* Complaint ID */}
                                            {task.complaintId && (
                                                <div className="mb-2">
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                        {task.complaintId}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Location */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                                                <MapPin size={13} />
                                                <span className="truncate">{task.location?.address || "No address"}</span>
                                            </div>

                                            {/* Citizen Issue Photo */}
                                            <div className="rounded-xl overflow-hidden h-36 bg-gray-100 mb-1 relative group border border-gray-100">
                                                <img
                                                    src={(!task.imageUrl || task.imageUrl.startsWith("http")) ? "/citizen_issue.png" : `https://server-gray-three-90.vercel.app${task.imageUrl}`}
                                                    alt="Reported issue"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.src = "/citizen_issue.png"; }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end">
                                                    <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        📷 Reported Issue
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer — Action Buttons */}
                                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                            <button
                                                onClick={() => handleViewDetails(task)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                                            >
                                                <Eye size={16} /> Details
                                            </button>

                                            <div className="flex gap-2">
                                                {(task.status === "Open" || task.status === "Assigned") && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateStatus(task._id, "In Progress"); }}
                                                        disabled={updatingId === task._id}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 text-sm font-bold transition-all shadow-sm disabled:opacity-50"
                                                    >
                                                        {updatingId === task._id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Play size={14} />
                                                        )}
                                                        Start Work
                                                    </button>
                                                )}
                                                {task.status !== "Resolved" && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleResolveClick(task); }}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-bold transition-all shadow-sm"
                                                    >
                                                        <CheckCircle size={14} /> Resolve
                                                    </button>
                                                )}
                                                {task.status === "Resolved" && (
                                                    <span className="flex items-center gap-1.5 px-3 py-2 text-green-600 text-sm font-bold">
                                                        <CheckCircle size={14} /> Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[500px] rounded-xl overflow-hidden border border-gray-200">
                                <MapView requests={tasks} zoom={15} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <RequestDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                request={selectedRequest}
            />

            {/* Proof Upload Modal */}
            <UploadProofModal
                isOpen={isProofModalOpen}
                onClose={() => { setIsProofModalOpen(false); setProofTask(null); }}
                onConfirm={handleProofUploadAndResolve}
                taskTitle={proofTask?.title}
                loading={proofLoading}
            />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default WorkerDashboard;
