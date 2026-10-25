"use client";

import { createContext, useContext, useEffect } from "react";
import { getDict } from "@/lib/i18n";
import { LOCALE_KEY } from "@/lib/theme";
import type { Locale } from "@/lib/types";

const LocaleContext = createContext<Locale>("bn");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {}
  }, [locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const locale = useContext(LocaleContext);
  return { locale, t: getDict(locale) };
}
