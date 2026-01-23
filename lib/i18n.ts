import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import type { InitOptions } from "i18next";

const isProduction = process.env.NODE_ENV === "production";
const defaultNS = "translations";

// Import translations directly (NO async loading)
import enTranslations from "@/locales/en/translations.json";
import viTranslations from "@/locales/vi/translations.json";
import jaTranslations from "@/locales/ja/translations.json";

const resources = {
  en: { [defaultNS]: enTranslations },
  vi: { [defaultNS]: viTranslations },
  ja: { [defaultNS]: jaTranslations },
};

// Synchronous language resolution — runs before React render
function getInitialLanguage(): "en" | "vi" | "ja" {
  if (typeof window === "undefined") {
    return "vi";
  }

  // 1. Highest priority: injected by layout.tsx before hydration
  const windowLocale = (window as any).__NEXT_LOCALE__;
  if (["en", "vi", "ja"].includes(windowLocale)) {
    return windowLocale;
  }

  // 2. Cookie
  try {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    if (match && ["en", "vi", "ja"].includes(match[1])) {
      return match[1] as any;
    }
  } catch {}

  // 3. localStorage
  try {
    const stored = localStorage.getItem("i18nextLng");
    if (stored && ["en", "vi", "ja"].includes(stored)) {
      return stored as any;
    }
  } catch {}

  return "vi";
}

const initialLanguage = getInitialLanguage();

const i18nOptions: InitOptions = {
  lng: initialLanguage,           // 🔑 critical: set BEFORE init
  fallbackLng: "vi",
  load: 'languageOnly',
  defaultNS,
  ns: [defaultNS],
  resources,
  debug: !isProduction,

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: true,             // block render until ready
  },

  // Important: make init fully sync
  initImmediate: false,
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init(i18nOptions);
}

export default i18n;
