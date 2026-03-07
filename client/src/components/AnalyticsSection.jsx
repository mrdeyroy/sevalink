import { useTranslation } from "react-i18next";
import { BarChart3, TrendingUp, MapPin } from "lucide-react";

const AnalyticsSection = () => {
    const { t } = useTranslation();

    const highlights = [
        { icon: <BarChart3 size={20} />, label: t("analytics.highlight1") },
        { icon: <TrendingUp size={20} />, label: t("analytics.highlight2") },
        { icon: <MapPin size={20} />, label: t("analytics.highlight3") },
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left content */}
                    <div className="lg:w-1/2">
                        <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Analytics</p>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("analytics.title")}</h2>
                        <p className="text-lg text-gray-400 mb-8 leading-relaxed">{t("analytics.desc")}</p>
                        <div className="flex flex-wrap gap-3">
                            {highlights.map((h, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm text-gray-200">
                                    <span className="text-blue-400">{h.icon}</span>
                                    {h.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: mock analytics dashboard */}
                    <div className="lg:w-1/2">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-2xl blur-xl" />
                            <div className="relative bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                                {/* Mock toolbar */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                    <span className="ml-3 text-xs text-gray-500">SevaLink Analytics Dashboard</span>
                                </div>

                                {/* Mock chart bars */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-700/50 rounded-xl p-4">
                                        <div className="text-xs text-gray-400 mb-3">Monthly Complaints</div>
                                        <div className="flex items-end gap-1.5 h-20">
                                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm opacity-80 hover:opacity-100 transition-opacity"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-700/50 rounded-xl p-4">
                                        <div className="text-xs text-gray-400 mb-3">Resolution Rate</div>
                                        <div className="flex items-center justify-center h-20">
                                            <div className="relative w-16 h-16">
                                                <svg viewBox="0 0 36 36" className="w-full h-full">
                                                    <path
                                                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="#374151"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="#3b82f6"
                                                        strokeWidth="3"
                                                        strokeDasharray="92, 100"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-400">92%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mock table */}
                                <div className="bg-gray-700/50 rounded-xl p-4">
                                    <div className="text-xs text-gray-400 mb-3">Recent Activity</div>
                                    {[
                                        { status: "bg-emerald-400", text: "Water pipe repaired — Village Kamla" },
                                        { status: "bg-amber-400", text: "Road repair in progress — Sector 12" },
                                        { status: "bg-blue-400", text: "New complaint: Electricity — Nagar Panchayat" },
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-600/30 last:border-0">
                                            <div className={`w-2 h-2 rounded-full ${row.status}`} />
                                            <span className="text-xs text-gray-300">{row.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AnalyticsSection;
