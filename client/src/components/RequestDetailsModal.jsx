import { useState } from "react";
import { X, MapPin, Calendar, User, Image as ImageIcon, Star, FileText, Activity, CheckCircle, Truck, CircleDot } from "lucide-react";
import MapView from "./MapView";

const BASE_URL = "https://sevalink-zygf.vercel.app";

const resolveImageUrl = (src, isCitizen = true) => {
    if (!src || src.startsWith("http")) return isCitizen ? "/citizen_issue.png" : "/worker_resolve.jpg";
    return `${BASE_URL}${src}`;
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

// Timeline helpers
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

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
    const [enlargedImage, setEnlargedImage] = useState(null);

    if (!isOpen || !request) return null;

    const mapRequest = [request];
    const current = getProgressIndex(request);

    return (
        <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[3000] p-4">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                    style={{ animation: "scaleIn 0.2s ease-out" }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-start sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-bold text-white">{request.title}</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                {request.complaintId && (
                                    <span className="text-blue-100 text-sm font-mono bg-white/15 px-2 py-0.5 rounded">
                                        {request.complaintId}
                                    </span>
                                )}
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${request.status === "Resolved" ? "bg-green-100 text-green-800"
                                    : request.status === "In Progress" ? "bg-amber-100 text-amber-800"
                                        : request.status === "Assigned" ? "bg-blue-100 text-blue-800"
                                            : "bg-red-100 text-red-800"
                                    }`}>
                                    {request.status}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Progress Tracker */}
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Progress</h3>
                        <div className="flex items-center justify-between">
                            {progressSteps.map((step, idx) => {
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

                    {/* Content — Two Columns */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* LEFT — Issue Information */}
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                                <p className="text-base text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl">{request.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-xs text-gray-500 font-medium mb-1">Category</h3>
                                    <p className="font-bold text-gray-800">{request.category}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs text-gray-500 font-medium mb-1">Date Reported</h3>
                                    <div className="flex items-center text-gray-800">
                                        <Calendar size={14} className="mr-1.5 text-gray-400" />
                                        <span className="font-medium">{new Date(request.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs text-gray-500 font-medium mb-1">Submitted By</h3>
                                <div className="flex items-center gap-2 text-gray-800">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                        {request.createdBy?.name?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <span className="font-semibold">{request.createdBy?.name || "Unknown"}</span>
                                        {request.createdBy?.mobile && (
                                            <span className="text-gray-500 text-xs ml-2">📞 {request.createdBy.mobile}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs text-gray-500 font-medium mb-1">Location</h3>
                                <div className="flex items-start text-gray-800 gap-1.5">
                                    <MapPin size={14} className="mt-0.5 text-blue-400 flex-shrink-0" />
                                    <span className="text-sm">{request.location?.address || "No address provided"}</span>
                                </div>
                            </div>

                            {/* Timeline */}
                            {request.timeline && request.timeline.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Activity size={13} /> Timeline
                                    </h3>
                                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-3">
                                        {request.timeline.map((event, idx) => {
                                            const Icon = timelineIcons[event.action] || CircleDot;
                                            const colorClass = timelineColors[event.action] || "text-gray-500 bg-gray-100";
                                            return (
                                                <div key={idx} className="relative">
                                                    <div className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}>
                                                        <Icon size={12} />
                                                    </div>
                                                    <div className="ml-2">
                                                        <p className="text-sm font-bold text-gray-800">{event.action}</p>
                                                        <p className="text-xs text-gray-400">
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

                            {/* Review */}
                            {request.rating && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h3 className="text-xs font-semibold text-amber-800 mb-2">Citizen Review</h3>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={16} className={s <= request.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                                        ))}
                                        <span className="text-xs text-amber-700 font-medium ml-1">{request.rating}/5</span>
                                    </div>
                                    {request.reviewText && <p className="text-sm text-amber-700 italic">"{request.reviewText}"</p>}
                                </div>
                            )}
                        </div>

                        {/* RIGHT — Photos + Map */}
                        <div className="space-y-5">
                            {/* Citizen Reported Photo */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <ImageIcon size={13} /> Reported Issue Photo
                                </h3>
                                <img
                                    src={resolveImageUrl(request.imageUrl, true)}
                                    alt="Reported issue"
                                    className="w-full h-56 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setEnlargedImage(resolveImageUrl(request.imageUrl, true))}
                                    onError={(e) => { e.currentTarget.src = "/citizen_issue.png"; }}
                                />
                            </div>

                            {/* Proof of Completion Photo */}
                            {request.status === "Resolved" && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <CheckCircle size={13} className="text-green-500" /> Proof of Completion
                                    </h3>
                                    <img
                                        src={resolveImageUrl(request.proofImage, false)}
                                        alt="Proof of completion"
                                        className="w-full h-48 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-green-200"
                                        onClick={() => setEnlargedImage(resolveImageUrl(request.proofImage, false))}
                                        onError={(e) => { e.currentTarget.src = "/worker_resolve.jpg"; }}
                                    />
                                    {request.completedAt && (
                                        <p className="text-xs text-green-600 mt-1.5 font-medium">
                                            ✅ Completed on {new Date(request.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Map */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location Map</h3>
                                <div className="h-56 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                    <MapView requests={mapRequest} zoom={15} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t bg-gray-50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Enlarged Image Modal */}
            {enlargedImage && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-lg z-[4000] flex items-center justify-center p-4"
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setEnlargedImage(null)}
                            className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition z-10"
                        >
                            <X size={18} />
                        </button>
                        <img src={enlargedImage} alt="Enlarged" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </>
    );
};

export default RequestDetailsModal;
