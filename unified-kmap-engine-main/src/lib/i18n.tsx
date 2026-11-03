import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { KN } from "./kn-dictionary";

export type Lang = "en" | "kn";

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string) => string;
};

const I18nContext = createContext<I18nValue>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
});

const STORAGE_KEY = "agrova-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "kn" || saved === "en") setLangState(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const t = useCallback(
    (en: string) => (lang === "kn" ? (KN[en] ?? en) : en),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Pick between an English and a Kannada value. */
export function useBi() {
  const { lang } = useI18n();
  return <T,>(en: T, kn: T) => (lang === "kn" ? kn : en);
}
