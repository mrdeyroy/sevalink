import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CTA = () => {
    const { t } = useTranslation();

    return (
        <section className="relative py-20 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgOHYyaC0ydi0yaDJ6bTAgNHYyaC0ydi0yaDJ6bS00IDR2MmgtMnYtMmgyem0wIDR2MmgtMnYtMmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

            <div className="relative max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">{t("cta.title")}</h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/dashboard"
                        className="px-8 py-3.5 bg-white text-blue-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
                    >
                        {t("cta.report_issue")}
                    </Link>
                    <Link
                        to="/register"
                        className="px-8 py-3.5 bg-white/10 backdrop-blur text-white font-bold text-lg rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                        {t("cta.create_account")}
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CTA;
