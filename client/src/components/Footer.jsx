import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <img src="/logo.png" alt="SevaLink Logo" className="h-16 w-auto mb-4 brightness-0 invert opacity-80" />
                        <p className="text-sm text-gray-400 leading-relaxed">{t("footer.tagline")}</p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t("footer.product")}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.features")}</a></li>
                            <li><a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.how_it_works")}</a></li>
                            <li><a href="#services" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.services")}</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t("footer.company")}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.about")}</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.contact")}</a></li>
                            <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.privacy")}</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t("footer.contact_title")}</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <Mail size={14} className="text-gray-500" />
                                {t("footer.email")}
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-400">
                                <Phone size={14} className="text-gray-500" />
                                {t("footer.phone")}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
                    {t("footer.copyright", { year: new Date().getFullYear() })}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
