import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            bn: { translation: bn },
        },
        supportedLngs: ["en", "hi", "bn"],
        nonExplicitSupportedLngs: true,
        fallbackLng: "en",
        lng: localStorage.getItem("i18nextLng") || "en",
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
