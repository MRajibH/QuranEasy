"use client";

import { Check } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { updateSettings, useSettings, type Script } from "@/lib/settings";

// Al-Fatiha 1:1 in each script, so learners can recognise the one they grew up reading.
const SAMPLE: Record<Script, string> = {
  uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
  indopak: "بِسۡمِ اللّٰهِ الرَّحۡمٰنِ الرَّحِيۡمِ",
};

/** Two big cards showing the same ayah in Uthmani and IndoPak script. */
export function ScriptPicker() {
  const { t } = useLocale();
  const { script } = useSettings();
  const opts: [Script, string, string][] = [
    ["indopak", t.settings.indopak, "font-indopak"],
    ["uthmani", t.settings.uthmani, "font-arabic"],
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {opts.map(([v, label, cls]) => {
        const on = script === v;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => updateSettings({ script: v })}
            className={`relative rounded-2xl border-2 p-3 text-center transition-colors ${
              on ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary"
            }`}
          >
            {on && <Check className="absolute top-2 left-2 w-5 h-5 text-primary" aria-hidden />}
            <span className={`block ${cls} ar-sm text-text`} lang="ar" dir="rtl">{SAMPLE[v]}</span>
            <span className="block text-sm font-semibold mt-1">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
