import { useTranslation } from "react-i18next";
import { FileText, UserCheck, Wrench, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorks = () => {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <FileText size={32} className="text-blue-600" />,
            title: t("how.step1.title"),
            desc: t("how.step1.desc"),
            step: "01",
            color: "bg-blue-50 border-blue-100",
            iconBg: "bg-blue-100",
        },
        {
            icon: <UserCheck size={32} className="text-violet-600" />,
            title: t("how.step2.title"),
            desc: t("how.step2.desc"),
            step: "02",
            color: "bg-violet-50 border-violet-100",
            iconBg: "bg-violet-100",
        },
        {
            icon: <Wrench size={32} className="text-amber-600" />,
            title: t("how.step3.title"),
            desc: t("how.step3.desc"),
            step: "03",
            color: "bg-amber-50 border-amber-100",
            iconBg: "bg-amber-100",
        },
        {
            icon: <CheckCircle size={32} className="text-emerald-600" />,
            title: t("how.step4.title"),
            desc: t("how.step4.desc"),
            step: "04",
            color: "bg-emerald-50 border-emerald-100",
            iconBg: "bg-emerald-100",
        },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Process</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("how.section_title")}</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("how.section_subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Connector arrow (hidden on last item and on mobile) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:flex absolute top-12 -right-3 z-10 text-gray-300 group-hover:text-blue-400 transition-colors">
                                    <ArrowRight size={24} />
                                </div>
                            )}
                            <div className={`relative ${step.color} border rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Step {step.step}</span>
                                </div>
                                <div className={`${step.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
