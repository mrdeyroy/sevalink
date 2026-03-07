import { useTranslation } from "react-i18next";
import { Users, Wrench, Globe, Clock } from "lucide-react";

const ImpactSection = () => {
    const { t } = useTranslation();

    const metrics = [
        {
            icon: <Users size={28} />,
            value: t("impact.citizens_count"),
            label: t("impact.active_citizens"),
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            icon: <Wrench size={28} />,
            value: t("impact.resolved_count"),
            label: t("impact.issues_resolved"),
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            icon: <Globe size={28} />,
            value: t("impact.villages_count"),
            label: t("impact.villages_connected"),
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            icon: <Clock size={28} />,
            value: t("impact.resolution_time"),
            label: t("impact.avg_resolution"),
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">{t("impact.section_title")}</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`inline-flex items-center justify-center w-14 h-14 ${metric.bg} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <div className={metric.color}>
                                    {metric.icon}
                                </div>
                            </div>
                            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">{metric.value}</div>
                            <div className="text-sm text-gray-500 font-medium">{metric.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ImpactSection;
