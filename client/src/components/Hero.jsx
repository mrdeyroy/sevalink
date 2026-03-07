import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Hero = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <section className="relative pt-28 pb-20 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
                {/* Left content */}
                <div className="lg:w-1/2 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-blue-100/80 text-blue-700 text-sm font-medium rounded-full">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Civic-Tech Platform
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                        {t("hero.title")}
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        {t("hero.subtitle")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        {!user ? (
                            <>
                                <Link
                                    to="/register"
                                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                    {t("hero.primary_cta")}
                                </Link>
                                <a
                                    href="#how-it-works"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="px-8 py-3.5 bg-white/80 backdrop-blur-sm text-gray-700 text-lg font-semibold border border-gray-200 rounded-xl shadow-sm hover:bg-white hover:shadow-md transition-all duration-300"
                                >
                                    {t("hero.secondary_cta")}
                                </a>
                            </>
                        ) : (
                            <Link
                                to={user.role === "admin" ? "/admin" : user.role === "worker" ? "/worker" : "/dashboard"}
                                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                {t("hero.dashboard_cta")}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right illustration */}
                <div className="lg:w-1/2 flex justify-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-2xl blur-xl" />
                        <img
                            src="/hero_img.png"
                            alt="Community Services"
                            className="relative w-full max-w-lg rounded-2xl shadow-2xl shadow-gray-300/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
