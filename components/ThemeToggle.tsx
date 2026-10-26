"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { updateSettings, useSettings } from "@/lib/settings";
import { useLocale } from "./LocaleProvider";

/** Sun / moon switch in the header; picks an explicit light or dark theme. */
export function ThemeToggle() {
  const { t } = useLocale();
  const { theme } = useSettings();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), [theme]);
  const btn = (active: boolean) =>
    `w-9 h-9 rounded-full flex items-center justify-center transition-colors ${active ? "bg-accent-soft text-accent" : "text-muted hover:text-text"}`;
  return (
    <div className="flex items-center rounded-full border border-border p-0.5" role="group" aria-label={t.settings.theme}>
      <button type="button" className={btn(!dark)} onClick={() => updateSettings({ theme: "light" })} aria-pressed={!dark} aria-label={t.settings.light}>
        <Sun className="w-[18px] h-[18px]" aria-hidden />
      </button>
      <button type="button" className={btn(dark)} onClick={() => updateSettings({ theme: "dark" })} aria-pressed={dark} aria-label={t.settings.dark}>
        <Moon className="w-[18px] h-[18px]" aria-hidden />
      </button>
    </div>
  );
}
