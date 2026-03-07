import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import RequestForm from "../components/RequestForm";
import MapView from "../components/MapView";
import ReviewModal from "../components/ReviewModal";
import AnnouncementBanner from "../components/AnnouncementBanner";
import axios from "axios";
import {
    LayoutList, Map as MapIcon, Plus, Star, User, Phone, Hash,
    CheckCircle, Image as ImageIcon, ClipboardList, Clock, AlertCircle,
    Loader2, MapPin, X, FileText, Activity, CircleDot, Truck, ChevronRight
} from "lucide-react";
import PageLoader from "../components/PageLoader";

const Dashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("list");
    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [detailsRequest, setDetailsRequest] = useState(null);
    const [imageModal, setImageModal] = useState(null);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    const fetchRequests = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            const { data } = await axios.get("http://localhost:5000/api/requests", config);
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            // Ensure loading stays for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const { data } = await axios.get("http://localhost:5000/api/announcements", config);
            setAnnouncements(data);
        } catch (err) {
            console.error("Failed to load announcements:", err);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchAnnouncements();
    }, [user]);

    const handleReviewSubmit = async (rating, review) => {
        setReviewLoading(true);
        try {
            await axios.post(
                `http://localhost:5000/api/requests/${selectedRequest._id}/review`,
                { rating, reviewText: review },
                config
            );
            setReviewModalOpen(false);
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setReviewLoading(false);
        }
    };

    // Stats
    const totalRequests = requests.length;
    const resolvedRequests = requests.filter(r => r.status === "Resolved").length;
    const inProgressRequests = requests.filter(r => r.status === "In Progress").length;
    const openRequests = requests.filter(r => r.status === "Open").length;

    const statusColors = {
        "Open": "bg-red-100 text-red-700 border-red-200",
        "Assigned": "bg-blue-100 text-blue-700 border-blue-200",
        "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
        "Resolved": "bg-green-100 text-green-700 border-green-200",
    };

    // Progress steps
    const progressSteps = [
        { label: "Submitted", key: "submitted", icon: FileText, color: "gray" },
        { label: "Assigned", key: "assigned", icon: User, color: "blue" },
        { label: "In Progress", key: "inprogress", icon: Truck, color: "amber" },
        { label: "Resolved", key: "resolved", icon: CheckCircle, color: "green" },
    ];

    const getProgressIndex = (req) => {
        if (req.status === "Resolved") return 3;
        if (req.status === "In Progress") return 2;
        if (req.status === "Assigned" || req.assignedTo) return 1;
        return 0;
    };

    // Timeline icon map
    const timelineIcons = {
        "Request Submitted": FileText,
        "Worker Assigned": User,
        "Work Started": Activity,
        "Work Completed": CheckCircle,
    };

    const timelineColors = {
        "Request Submitted": "text-gray-500 bg-gray-100",
        "Worker Assigned": "text-blue-500 bg-blue-100",
        "Work Started": "text-amber-500 bg-amber-100",
        "Work Completed": "text-green-500 bg-green-100",
    };

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Dashboard</h1>
                        <p className="text-gray-500 mt-1 text-base">
                            Welcome, <span className="font-semibold text-blue-600">{user?.name}</span>
                        </p>
                    </div>
                    {user?.role === "citizen" && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all shadow-md font-semibold text-base ${showForm
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {showForm ? <X size={20} /> : <Plus size={20} />}
                            {showForm ? "Cancel" : "Report Issue"}
                        </button>
                    )}
                </div>

                {/* Announcements */}
                <AnnouncementBanner announcements={announcements} />

                {/* Request Form */}
                {showForm && user?.role === "citizen" && (
                    <div className="mb-8 animate-fade-in">
                        <RequestForm onRequestAdded={() => { fetchRequests(); setShowForm(false); }} />
                    </div>
                )}

                {/* ─── Quick Stats ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {[
                        { label: "Total Requests", value: totalRequests, icon: ClipboardList, color: "blue", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600" },
                        { label: "Open", value: openRequests, icon: AlertCircle, color: "red", bg: "bg-red-50", border: "border-red-100", text: "text-red-500" },
                        { label: "In Progress", value: inProgressRequests, icon: Clock, color: "amber", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-500" },
                        { label: "Resolved", value: resolvedRequests, icon: CheckCircle, color: "green", bg: "bg-green-50", border: "border-green-100", text: "text-green-500" },
                    ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-4 sm:p-5`}>
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={20} className={stat.text} />
                                <span className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</span>
                            </div>
                            <p className={`text-2xl sm:text-3xl font-extrabold ${stat.text}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* ─── Issue Details Panel ─── */}
                {detailsRequest && (
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-8 overflow-hidden animate-fade-in">
                        {/* Details Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-white">{detailsRequest.title}</h2>
                                {detailsRequest.complaintId && (
                                    <p className="text-blue-100 text-sm mt-0.5 font-mono">
                                        ID: {detailsRequest.complaintId}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setDetailsRequest(null)} className="text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">

                            {/* ── Progress Tracker ── */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Progress</h3>
                                <div className="flex items-center justify-between">
                                    {progressSteps.map((step, idx) => {
                                        const current = getProgressIndex(detailsRequest);
                                        const done = idx <= current;
                                        const colorMap = { gray: "bg-gray-400", blue: "bg-blue-500", amber: "bg-amber-500", green: "bg-green-500" };
                                        const bgColor = done ? colorMap[step.color] : "bg-gray-200";
                                        const textColor = done ? `text-${step.color}-600` : "text-gray-400";
                                        return (
                                            <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${bgColor} transition-all`}>
                                                    <step.icon size={18} className="text-white" />
                                                </div>
                                                <span className={`text-xs mt-2 font-semibold ${textColor} text-center`}>{step.label}</span>
                                                {idx < progressSteps.length - 1 && (
                                                    <div className={`absolute top-4 sm:top-5 left-[55%] w-[90%] h-0.5 ${idx < current ? colorMap[progressSteps[idx + 1].color] : "bg-gray-200"}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-5">
                                    {/* Description */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 mb-1">Description</h4>
                                        <p className="text-base text-gray-700 leading-relaxed">{detailsRequest.description}</p>
                                    </div>

                                    {/* Status & Category */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColors[detailsRequest.status]}`}>
                                            {detailsRequest.status}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                            {detailsRequest.category}
                                        </span>
                                    </div>

                                    {/* Location */}
                                    {detailsRequest.location?.address && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                            <span>{detailsRequest.location.address}</span>
                                        </div>
                                    )}

                                    {/* Issue Image */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
                                            <ImageIcon size={14} /> Reported Photo
                                        </h4>
                                        <img
                                            src={(!detailsRequest.imageUrl || detailsRequest.imageUrl.startsWith("http")) ? "/citizen_issue.png" : `http://localhost:5000${detailsRequest.imageUrl}`}
                                            alt="Issue"
                                            className="w-full h-48 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setImageModal((!detailsRequest.imageUrl || detailsRequest.imageUrl.startsWith("http")) ? "/citizen_issue.png" : `http://localhost:5000${detailsRequest.imageUrl}`)}
                                            onError={(e) => { e.currentTarget.src = "/citizen_issue.png"; }}
                                        />
                                    </div>

                                    {/* Proof Image */}
                                    {detailsRequest.status === "Resolved" && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
                                                <CheckCircle size={14} className="text-green-500" /> Proof of Completion
                                            </h4>
                                            <img
                                                src={(!detailsRequest.proofImage || detailsRequest.proofImage.startsWith("http")) ? "/worker_resolve.jpg" : `http://localhost:5000${detailsRequest.proofImage}`}
                                                alt="Proof"
                                                className="w-full h-40 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => setImageModal((!detailsRequest.proofImage || detailsRequest.proofImage.startsWith("http")) ? "/worker_resolve.jpg" : `http://localhost:5000${detailsRequest.proofImage}`)}
                                                onError={(e) => { e.currentTarget.src = "/worker_resolve.jpg"; }}
                                            />
                                        </div>
                                    )}

                                    {/* Review Section */}
                                    {detailsRequest.status === "Resolved" && (
                                        <div>
                                            {detailsRequest.rating ? (
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                    <p className="text-xs font-bold text-amber-800 mb-1.5">Your Review</p>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={16} className={s <= detailsRequest.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                                                        ))}
                                                        <span className="text-sm text-amber-700 font-bold ml-1">{detailsRequest.rating}/5</span>
                                                    </div>
                                                    {detailsRequest.reviewText && <p className="text-sm text-amber-700 italic">"{detailsRequest.reviewText}"</p>}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedRequest(detailsRequest); setReviewModalOpen(true); }}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                                                >
                                                    <Star size={16} /> Leave a Review
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-5">
                                    {/* Worker Info */}
                                    {detailsRequest.assignedTo && (
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                                            <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                                                <User size={16} /> Assigned Worker
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-base">
                                                        {detailsRequest.assignedTo.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800 text-base">{detailsRequest.assignedTo.name}</p>
                                                        {detailsRequest.assignedTo.workerId && (
                                                            <p className="text-xs font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                                                {detailsRequest.assignedTo.workerId}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {detailsRequest.assignedTo.mobile && (
                                                    <a href={`tel:${detailsRequest.assignedTo.mobile}`}
                                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition font-medium">
                                                        <Phone size={14} />
                                                        {detailsRequest.assignedTo.mobile}
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <CircleDot size={12} className={detailsRequest.assignedTo.status === "active" ? "text-green-500" : "text-gray-400"} />
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${detailsRequest.assignedTo.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                        {detailsRequest.assignedTo.status || "Active"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {detailsRequest.timeline && detailsRequest.timeline.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <Activity size={14} /> Timeline
                                            </h4>
                                            <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                                                {detailsRequest.timeline.map((event, idx) => {
                                                    const Icon = timelineIcons[event.action] || CircleDot;
                                                    const colorClass = timelineColors[event.action] || "text-gray-500 bg-gray-100";
                                                    return (
                                                        <div key={idx} className="relative">
                                                            <div className={`absolute -left-[25px] w-7 h-7 rounded-full flex items-center justify-center ${colorClass}`}>
                                                                <Icon size={14} />
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-bold text-gray-800">{event.action}</p>
                                                                {event.details && <p className="text-xs text-gray-500 mt-0.5">{event.details}</p>}
                                                                <p className="text-xs text-gray-400 mt-0.5">
                                                                    {new Date(event.timestamp).toLocaleDateString("en-IN", {
                                                                        day: "numeric", month: "short", year: "numeric",
                                                                        hour: "2-digit", minute: "2-digit",
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dates */}
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>📅 Created: {new Date(detailsRequest.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        {detailsRequest.resolvedAt && (
                                            <p>✅ Resolved: {new Date(detailsRequest.resolvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        )}
                                        {detailsRequest.resolutionTime && (
                                            <p>⏱️ Resolution Time: {detailsRequest.resolutionTime.toFixed(1)} hours</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Request List ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">
                            {user?.role === "citizen" ? "My Requests" : "Recent Requests"}
                        </h2>
                        <div className="flex bg-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                <LayoutList size={16} className="mr-1.5" /> List
                            </button>
                            <button
                                onClick={() => setViewMode("map")}
                                className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === "map" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                            >
                                <MapIcon size={16} className="mr-1.5" /> Map
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {requests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-lg font-semibold mb-1">No requests yet</p>
                                <p className="text-sm">Click "Report Issue" to create your first request.</p>
                            </div>
                        ) : viewMode === "list" ? (
                            <div className="space-y-3">
                                {requests.map(req => (
                                    <div
                                        key={req._id}
                                        onClick={() => setDetailsRequest(detailsRequest?._id === req._id ? null : req)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${detailsRequest?._id === req._id
                                            ? "border-blue-300 bg-blue-50 shadow-sm"
                                            : "border-gray-100 hover:border-blue-200"
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0 mr-3">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-base font-bold text-gray-900 truncate">{req.title}</h3>
                                                {req.rating && <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate mb-1.5">{req.description}</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {req.complaintId && (
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                                        {req.complaintId}
                                                    </span>
                                                )}
                                                {req.assignedTo && (
                                                    <span className="text-xs text-blue-600">
                                                        👷 {req.assignedTo.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[req.status]}`}>
                                                {req.status}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                            </span>
                                            <ChevronRight size={16} className="text-gray-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative z-0">
                                <MapView requests={requests} zoom={15} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Enlarge Modal */}
            {imageModal && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setImageModal(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setImageModal(null)}
                            className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition z-10"
                        >
                            <X size={18} />
                        </button>
                        <img src={imageModal} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
                    </div>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => { setReviewModalOpen(false); setSelectedRequest(null); }}
                onSubmit={handleReviewSubmit}
                requestTitle={selectedRequest?.title}
                loading={reviewLoading}
            />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default Dashboard;
