import { useState } from "react";
import { Megaphone, ChevronDown, ChevronUp, X } from "lucide-react";

const AnnouncementBanner = ({ announcements }) => {
    const [expanded, setExpanded] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (!announcements || announcements.length === 0 || dismissed) return null;

    const latest = announcements[0];

    return (
        <div className="mb-6 rounded-xl overflow-hidden border border-blue-200 shadow-sm"
            style={{ animation: "fadeSlideDown 0.4s ease-out" }}>

            {/* Top bar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-white">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <Megaphone size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide">Announcements</span>
                    {announcements.length > 1 && (
                        <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {announcements.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {announcements.length > 1 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1"
                        >
                            {expanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> All</>}
                        </button>
                    )}
                    <button onClick={() => setDismissed(true)} className="text-white/70 hover:text-white transition-colors p-0.5">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Announcement cards */}
            <div className="bg-blue-50 divide-y divide-blue-100">
                {(expanded ? announcements : [latest]).map((ann) => (
                    <div key={ann._id} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-blue-900">{ann.title}</h4>
                                <p className="text-sm text-blue-700 mt-0.5 leading-relaxed">{ann.message}</p>
                                <p className="text-xs text-blue-400 mt-1.5">
                                    {ann.createdByAdmin?.name && `Posted by ${ann.createdByAdmin.name} · `}
                                    {new Date(ann.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AnnouncementBanner;
