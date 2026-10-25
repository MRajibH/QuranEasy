"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { WordSheet, type SheetWord } from "./WordSheet";
import { LoadError, Spinner } from "./ui";
import { loadLemmaMap, loadSurah } from "@/lib/data";
import { useCardStatus } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import type { LemmaLite, Verse } from "@/lib/types";

const VIEW_KEY = "qe-reader";
interface View {
  meanings: boolean;
  translation: boolean;
  translit: boolean;
}
const DEFAULT_VIEW: View = { meanings: true, translation: true, translit: false };

export function SurahReader({ n, fallback }: { n: number; fallback: { ar: string; tr: string } }) {
  const { locale, t } = useLocale();
  const { meaning } = useSettings();
  const lang = meaning === "both" ? locale : meaning;
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [lemmas, setLemmas] = useState<Map<number, LemmaLite> | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [sheet, setSheet] = useState<SheetWord | null>(null);
  const status = useCardStatus();

  const load = useCallback(() => {
    setError(false);
    Promise.all([loadSurah(n), loadLemmaMap()]).then(
      ([v, m]) => {
        setVerses(v);
        setLemmas(m);
      },
      () => setError(true),
    );
  }, [n]);

  useEffect(() => {
    try {
      setView({ ...DEFAULT_VIEW, ...JSON.parse(localStorage.getItem(VIEW_KEY) ?? "{}") });
    } catch {}
    load();
  }, [load]);

  // Jump to #v<ayah> once the text is rendered.
  useEffect(() => {
    if (!verses) return;
    const m = location.hash.match(/^#v(\d+)$/);
    if (m) {
      const el = document.getElementById(`v${m[1]}`);
      el?.scrollIntoView({ block: "start" });
      el?.classList.add("ring-4", "ring-accent/40");
    }
  }, [verses]);

  const toggle = (k: keyof View) => {
    const next = { ...view, [k]: !view[k] };
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, JSON.stringify(next));
    } catch {}
  };

  if (error) return <LoadError onRetry={load} />;
  if (!verses || !lemmas) {
    return (
      <>
        <noscript>
          <p className="font-arabic ar-md text-right" lang="ar" dir="rtl">{fallback.ar}</p>
          <p>{fallback.tr}</p>
        </noscript>
        <Spinner />
      </>
    );
  }

  const toggles: [keyof View, string][] = [
    ["meanings", t.read.wordMeanings],
    ["translation", t.read.translation],
    ["translit", t.read.translit],
  ];

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 px-4 py-2 bg-bg/95 backdrop-blur mb-4 flex flex-wrap items-center gap-2">
        {toggles.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="switch"
            aria-checked={view[k]}
            onClick={() => toggle(k)}
            className={`h-11 px-4 rounded-full border-2 font-semibold text-sm ${
              view[k] ? "border-primary bg-primary-soft text-primary" : "border-border text-muted"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1"><span className="w-4 h-1 rounded bg-success inline-block" />{t.read.legendKnown}</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 rounded bg-accent inline-block" />{t.read.legendLearning}</span>
        </span>
      </div>

      <div className="grid gap-4">
        {verses.map((v) => (
          <section key={v.n} id={`v${v.n}`} className="verse card p-4 md:p-6 scroll-mt-32">
            <div className="flex flex-wrap gap-x-3 gap-y-4 justify-start" dir="rtl" lang="ar">
              {v.w.map((w, i) => {
                const st = status?.get(w[4]);
                const underline = st === "known" ? "border-success" : st === "learning" ? "border-accent" : "border-transparent";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const lemma = lemmas.get(w[4]);
                      if (lemma) setSheet({ lemma, form: { ar: w[0], tr: w[1], en: w[2], bn: w[3], loc: `${n}:${v.n}:${i + 1}` } });
                    }}
                    className="flex flex-col items-center rounded-xl px-1.5 py-1 hover:bg-primary-soft focus-visible:bg-primary-soft"
                  >
                    <span className={`font-arabic ar-md border-b-[3px] ${underline}`}>{w[0]}</span>
                    {view.translit && <span className="text-xs text-muted italic" dir="ltr">{w[1]}</span>}
                    {view.meanings && (
                      <span className="text-sm text-muted max-w-28 text-center leading-snug" dir="ltr" lang={lang}>
                        {lang === "bn" ? w[3] : w[2]}
                      </span>
                    )}
                  </button>
                );
              })}
              <span className="self-center font-arabic ar-sm text-primary px-1" aria-label={`${t.common.ayah} ${v.n}`}>
                ﴿{num("en", v.n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])}﴾
              </span>
            </div>
            {view.translation && (
              <p className="mt-4 pt-4 border-t border-border text-lg" lang={lang}>
                <span className="font-bold text-primary mr-2">{num(locale, v.n)}.</span>
                {lang === "bn" ? v.bn : v.en}
              </p>
            )}
          </section>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted text-center">{lang === "bn" ? "অনুবাদ: তাইসীরুল কুরআন" : "Translation: Saheeh International"}</p>
      <WordSheet word={sheet} onClose={() => setSheet(null)} />
    </>
  );
}
