import { useTranslation } from "react-i18next";
import { Droplets, Zap, HeartPulse, Construction, FileCode } from "lucide-react";

const Services = () => {
    const { t } = useTranslation();

    const services = [
        {
            icon: <Droplets size={36} />,
            key: "water",
            gradient: "from-cyan-500 to-blue-500",
            iconColor: "text-blue-500",
            bg: "bg-cyan-50",
        },
        {
            icon: <Zap size={36} />,
            key: "electricity",
            gradient: "from-yellow-500 to-amber-500",
            iconColor: "text-amber-500",
            bg: "bg-amber-50",
        },
        {
            icon: <HeartPulse size={36} />,
            key: "health",
            gradient: "from-rose-500 to-pink-500",
            iconColor: "text-pink-500",
            bg: "bg-rose-50",
        },
        {
            icon: <Construction size={36} />,
            key: "roads",
            gradient: "from-orange-500 to-red-500",
            iconColor: "text-red-500",
            bg: "bg-orange-50",
        },
        {
            icon: <FileCode size={36} />,
            key: "documents",
            gradient: "from-indigo-500 to-violet-500",
            iconColor: "text-indigo-500",
            bg: "bg-indigo-50",
        },
    ];

    return (
        <section id="services" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Services</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("categories.section_title")}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("categories.section_subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                            {/* Gradient accent bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className={`${service.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                <div className={service.iconColor}>
                                    {service.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`categories.${service.key}.title`)}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{t(`categories.${service.key}.desc`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
