import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Locale, TranslationKey } from "@/lib/translations";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<Ctx | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "pt-BR";
    const stored = localStorage.getItem("petalert-locale") as Locale | null;
    return stored || "pt-BR";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("petalert-locale", locale);
  }, [locale]);

  const t = (key: TranslationKey) => {
    return translations[locale]?.[key] ?? translations["pt-BR"][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: setLocaleState, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};