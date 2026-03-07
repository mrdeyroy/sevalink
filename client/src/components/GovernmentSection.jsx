import { useTranslation } from "react-i18next";
import { Monitor, TrendingUp, MapPin, Eye } from "lucide-react";

const GovernmentSection = () => {
    const { t } = useTranslation();

    const points = [
        { icon: <Monitor size={22} />, text: t("government.point1") },
        { icon: <TrendingUp size={22} />, text: t("government.point2") },
        { icon: <MapPin size={22} />, text: t("government.point3") },
        { icon: <Eye size={22} />, text: t("government.point4") },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Left visual */}
                    <div className="lg:w-1/2">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl blur-lg opacity-60" />
                            <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 sm:p-12 text-white">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                        <div className="text-3xl font-bold">156</div>
                                        <div className="text-white/70 text-sm mt-1">Active Complaints</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                        <div className="text-3xl font-bold">92%</div>
                                        <div className="text-white/70 text-sm mt-1">Resolution Rate</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                        <div className="text-3xl font-bold">12</div>
                                        <div className="text-white/70 text-sm mt-1">Active Workers</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                        <div className="text-3xl font-bold">4.8★</div>
                                        <div className="text-white/70 text-sm mt-1">Citizen Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right content */}
                    <div className="lg:w-1/2">
                        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">For Authorities</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("government.title")}</h2>
                        <p className="text-lg text-gray-600 mb-8">{t("government.subtitle")}</p>
                        <div className="space-y-4">
                            {points.map((point, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors duration-200">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 shrink-0">
                                        {point.icon}
                                    </div>
                                    <span className="text-gray-700 font-medium">{point.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GovernmentSection;
