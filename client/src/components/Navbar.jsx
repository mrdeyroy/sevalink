import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Settings, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
    { code: "bn", label: "বাংলা", flag: "🇧🇩" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { pathname, hash } = useLocation();
    const { t, i18n } = useTranslation();

    const showLogin = pathname !== "/login";
    const showRegister = pathname !== "/register";
    const dropdownRef = useRef(null);
    const desktopLangRef = useRef(null);
    const mobileLangRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);

            const isDesktopLangClick = desktopLangRef.current && desktopLangRef.current.contains(e.target);
            const isMobileLangClick = mobileLangRef.current && mobileLangRef.current.contains(e.target);

            if (!isDesktopLangClick && !isMobileLangClick) {
                setLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (pathname === "/" && hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) element.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [pathname, hash]);

    const handleNavClick = (e, targetHash) => {
        e.preventDefault();
        setIsOpen(false);
        if (pathname !== "/") {
            navigate(`/${targetHash}`);
        } else {
            const element = document.querySelector(targetHash);
            if (element) element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("i18nextLng", code);
        setLangOpen(false);
    };

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const roleColor = user?.role === "worker" ? "border-orange-400" : user?.role === "admin" ? "border-purple-500" : "border-blue-500";
    const roleBg = user?.role === "worker" ? "bg-orange-500" : user?.role === "admin" ? "bg-purple-600" : "bg-blue-600";

    const dashboardPath =
        user?.role === "admin" ? "/admin" :
            user?.role === "worker" ? "/worker" : "/dashboard";

    return (
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 fixed w-full z-[2000] top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src="/logo.png" alt="SevaLink Logo" className="h-20 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">{t("nav.home")}</Link>
                        <a href="#how-it-works" onClick={(e) => handleNavClick(e, "#how-it-works")} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">{t("nav.how_it_works")}</a>
                        <a href="#services" onClick={(e) => handleNavClick(e, "#services")} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">{t("nav.services")}</a>

                        {/* Language Switcher */}
                        <div className="relative" ref={desktopLangRef}>
                            <button
                                onClick={() => setLangOpen(!langOpen)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                <Globe size={15} />
                                <span>{currentLang.label}</span>
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in">
                                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        <p className="text-sm font-semibold">Select Language</p>
                                    </div>
                                    <div className="py-1">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => changeLanguage(lang.code)}
                                                className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors ${i18n.language === lang.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                                            >
                                                <span className="text-lg">{lang.flag}</span>
                                                <span>{lang.label}</span>
                                                {i18n.language === lang.code && (
                                                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className={`flex items-center gap-2 p-0.5 rounded-full border-2 ${roleColor} hover:opacity-80 transition focus:outline-none`}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full ${roleBg} flex items-center justify-center text-white text-sm font-bold`}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                                        </div>
                                    )}
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{user.email || user.mobile}</p>
                                            <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full capitalize
                                                ${user.role === "admin" ? "bg-purple-100 text-purple-700" :
                                                    user.role === "worker" ? "bg-orange-100 text-orange-700" :
                                                        "bg-blue-100 text-blue-700"}`}>
                                                {user.role}
                                            </span>
                                        </div>

                                        <Link
                                            to={dashboardPath}
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <LayoutDashboard size={15} className="mr-2.5 text-gray-400" />
                                            {t("nav.dashboard")}
                                        </Link>

                                        <Link
                                            to="/profile"
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <Settings size={15} className="mr-2.5 text-gray-400" />
                                            {t("nav.profile")}
                                        </Link>

                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={() => { setDropdownOpen(false); logout(); navigate("/"); }}
                                                className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                                            >
                                                <LogOut size={15} className="mr-2.5" />
                                                {t("nav.signout")}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                {showLogin && (
                                    <Link to="/login" className="text-sm px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                                        {t("nav.login")}
                                    </Link>
                                )}
                                {showRegister && (
                                    <Link to="/register" className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
                                        {t("nav.register")}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* Mobile language */}
                        <div className="relative" ref={mobileLangRef}>
                            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-medium shadow-sm">
                                <Globe size={14} />
                                <span>{currentLang.flag}</span>
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in">
                                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                        <p className="text-sm font-semibold">Select Language</p>
                                    </div>
                                    <div className="py-1">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => changeLanguage(lang.code)}
                                                className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors ${i18n.language === lang.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                                            >
                                                <span className="text-lg">{lang.flag}</span>
                                                <span>{lang.label}</span>
                                                {i18n.language === lang.code && (
                                                    <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-1">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 pb-4 px-4 shadow-lg">
                    <div className="flex flex-col space-y-1 mt-2">
                        <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm font-medium">{t("nav.home")}</Link>
                        <a href="#how-it-works" onClick={(e) => handleNavClick(e, "#how-it-works")} className="text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm font-medium">{t("nav.how_it_works")}</a>
                        <a href="#services" onClick={(e) => handleNavClick(e, "#services")} className="text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 text-sm font-medium">{t("nav.services")}</a>

                        {user ? (
                            <div className="border-t border-gray-100 mt-3 pt-3">
                                <div className="flex items-center px-3 mb-3">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profile" className={`w-10 h-10 rounded-full object-cover border-2 ${roleColor} mr-3`} />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full ${roleBg} flex items-center justify-center text-white font-bold mr-3 text-sm`}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-400">{user.email || user.mobile}</p>
                                    </div>
                                </div>
                                <Link to={dashboardPath} className="flex items-center text-gray-700 py-2.5 px-3 hover:bg-gray-50 rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                                    <LayoutDashboard size={16} className="mr-2.5 text-blue-500" /> {t("nav.dashboard")}
                                </Link>
                                <Link to="/profile" className="flex items-center text-gray-700 py-2.5 px-3 hover:bg-gray-50 rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                                    <Settings size={16} className="mr-2.5 text-gray-400" /> {t("nav.profile")}
                                </Link>
                                <button onClick={() => { setIsOpen(false); logout(); navigate("/"); }} className="flex items-center w-full text-left text-red-500 py-2.5 px-3 hover:bg-red-50 rounded-lg text-sm mt-1">
                                    <LogOut size={16} className="mr-2.5" /> {t("nav.signout")}
                                </button>
                            </div>
                        ) : (
                            <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">
                                {showLogin && (
                                    <Link to="/login" className="block text-center border border-blue-600 text-blue-600 py-2.5 font-medium text-sm hover:bg-blue-50 rounded-lg transition" onClick={() => setIsOpen(false)}>
                                        {t("nav.login")}
                                    </Link>
                                )}
                                {showRegister && (
                                    <Link to="/register" className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium" onClick={() => setIsOpen(false)}>{t("nav.register")}</Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
