import { useTranslation } from "react-i18next";
import { WifiOff, MapPin, Activity, Camera, Shield, MessageSquare } from "lucide-react";

const Features = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <WifiOff size={24} />,
            key: "offline",
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: <MapPin size={24} />,
            key: "map_tracking",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            icon: <Activity size={24} />,
            key: "realtime_updates",
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            icon: <Camera size={24} />,
            key: "photo_evidence",
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            icon: <Shield size={24} />,
            key: "transparent_governance",
            color: "text-rose-600",
            bg: "bg-rose-50",
        },
        {
            icon: <MessageSquare size={24} />,
            key: "citizen_feedback",
            color: "text-teal-600",
            bg: "bg-teal-50",
        },
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Features</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("features.section_title")}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("features.section_subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <div className={feature.color}>{feature.icon}</div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`features.${feature.key}.title`)}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{t(`features.${feature.key}.desc`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
