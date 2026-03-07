import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "hi", label: "हिंदी", flag: "🇮🇳" },
    { code: "bn", label: "বাংলা", flag: "🇧🇩" },
];

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { i18n } = useTranslation();
    const ref = useRef(null);

    const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("i18nextLng", code);
        setIsOpen(false);
    };

    return (
        <div ref={ref} className="fixed bottom-6 right-6 z-[9999]">
            {/* Popup */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in mb-2">
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <p className="text-sm font-semibold">Select Language</p>
                    </div>
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm transition-colors ${i18n.language === lang.code
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
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

            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
                aria-label="Change language"
            >
                <Globe size={18} />
                <span className="text-sm font-semibold">{currentLang.label}</span>
            </button>
        </div>
    );
};

export default LanguageSwitcher;
