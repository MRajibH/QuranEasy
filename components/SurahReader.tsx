"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Play, Square } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { WordSheet, type SheetWord } from "./WordSheet";
import { LoadError, ProgressBar, Spinner } from "./ui";
import { playWord, stopAudio } from "@/lib/audio";
import { scriptClass, useIndopak } from "./useIndopak";
import { useAyahPlayer } from "./useAyahPlayer";
import { PlayerBar } from "./PlayerBar";
import { updateSettings } from "@/lib/settings";
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
  /** tapping a word also plays its exact recitation */
  tapAudio: boolean;
}
const DEFAULT_VIEW: View = { meanings: true, translation: true, translit: false, tapAudio: true };

export function SurahReader({
  n,
  surahName,
  verseCount,
  fallback,
}: {
  n: number;
  surahName: string;
  verseCount: number;
  fallback: { ar: string; tr: string };
}) {
  const { locale, t } = useLocale();
  const { meaning } = useSettings();
  const lang = meaning === "both" ? locale : meaning;
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [lemmas, setLemmas] = useState<Map<number, LemmaLite> | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<View>(DEFAULT_VIEW);
  const [sheet, setSheet] = useState<SheetWord | null>(null);
  const [playing, setPlaying] = useState<{ v: number; i: number } | null>(null);
  const playToken = useRef(0);
  const status = useCardStatus();
  const indopak = useIndopak(n);
  const player = useAyahPlayer(n, verseCount);
  const reciting = player.state?.playing ? player.state.ayah : null;

  // Keep the ayah being recited in view while a whole surah plays.
  useEffect(() => {
    if (!reciting || !player.state?.continuous) return;
    document.getElementById(`v${reciting}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [reciting, player.state?.continuous]);
  const { script } = useSettings();

  const stop = useCallback(() => {
    playToken.current++;
    stopAudio();
    setPlaying(null);
  }, []);
  useEffect(() => stop, [stop]);

  /** Recites an ayah word by word, highlighting each word as it is heard. */
  const playVerse = async (v: Verse) => {
    player.pause();
    const token = ++playToken.current;
    for (let i = 0; i < v.w.length; i++) {
      if (playToken.current !== token) return;
      setPlaying({ v: v.n, i });
      await playWord(`${n}:${v.n}:${i + 1}`);
    }
    if (playToken.current === token) setPlaying(null);
  };

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

  // Understanding: share of words whose base word the learner has started.
  const knownIn = (v: Verse) => v.w.reduce((s, w) => s + (status?.has(w[4]) ? 1 : 0), 0);
  const totalWords = verses.reduce((s, v) => s + v.w.length, 0);
  const totalKnown = verses.reduce((s, v) => s + knownIn(v), 0);
  const surahPct = totalWords ? Math.round((totalKnown / totalWords) * 100) : 0;

  const toggles: [keyof View, string][] = [
    ["meanings", t.read.wordMeanings],
    ["translation", t.read.translation],
    ["translit", t.read.translit],
    ["tapAudio", t.read.tapAudio],
  ];

  return (
    <>
      <div className="sticky top-[4.25rem] z-20 -mx-4 px-4 py-2 bg-bg/95 backdrop-blur mb-4 flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => player.play(player.state?.ayah ?? 1, true)}
          className="h-11 px-4 shrink-0 whitespace-nowrap rounded-full bg-primary text-primary-fg font-semibold text-sm inline-flex items-center gap-2"
        >
          <Headphones className="w-4 h-4" aria-hidden /> {t.player.playSurah}
        </button>
        <button
          type="button"
          onClick={() => updateSettings({ script: script === "indopak" ? "uthmani" : "indopak" })}
          className="h-11 px-4 shrink-0 whitespace-nowrap rounded-full border-2 border-accent/50 bg-accent-soft text-accent font-semibold text-sm"
          aria-label={t.settings.script}
        >
          {script === "indopak" ? t.settings.indopak : t.settings.uthmani}
        </button>
        {toggles.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="switch"
            aria-checked={view[k]}
            onClick={() => toggle(k)}
            className={`h-11 px-4 shrink-0 whitespace-nowrap rounded-full border-2 font-semibold text-sm ${
              view[k] ? "border-primary bg-primary-soft text-primary" : "border-border text-muted"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto hidden md:flex shrink-0 items-center gap-3 text-sm text-muted">
          <span className="flex items-center gap-1"><span className="w-4 h-1 rounded bg-success inline-block" />{t.read.legendKnown}</span>
          <span className="flex items-center gap-1"><span className="w-4 h-1 rounded bg-accent inline-block" />{t.read.legendLearning}</span>
        </span>
      </div>

      {status && (
        <div className="card p-4 mb-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-52">
            <p className="font-semibold">{t.read.understandSurah(num(locale, surahPct))}</p>
            <p className="text-sm text-muted">{t.read.knownOf(num(locale, totalKnown), num(locale, totalWords))}</p>
            <ProgressBar value={totalKnown} max={totalWords} className="mt-2" />
          </div>
          {surahPct < 100 && (
            <Link href={`/${locale}/decks/s${n}/`} className="btn btn-secondary">
              {t.decks.learnSurah}
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {verses.map((v) => {
          const known = knownIn(v);
          return (
          <section
            key={v.n}
            id={`v${v.n}`}
            className={`verse card p-4 md:p-6 scroll-mt-32 transition-shadow ${reciting === v.n ? "ring-4 ring-accent/40" : ""}`}
          >
            <div className="flex flex-wrap gap-x-3 gap-y-4 justify-start" dir="rtl" lang="ar">
              {v.w.map((w, i) => {
                const st = status?.get(w[4]);
                const isPlaying = playing?.v === v.n && playing.i === i;
                const underline = st === "known" ? "border-success" : st === "learning" ? "border-accent" : "border-transparent";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const loc = `${n}:${v.n}:${i + 1}`;
                      stop();
                      if (view.tapAudio) {
                        player.pause();
                        playWord(loc);
                      }
                      const lemma = lemmas.get(w[4]);
                      if (lemma) setSheet({ lemma, form: { ar: w[0], tr: w[1], en: w[2], bn: w[3], loc } });
                    }}
                    className={`flex flex-col items-center rounded-xl px-1.5 py-1 transition-colors hover:bg-primary-soft focus-visible:bg-primary-soft ${
                      isPlaying ? "bg-accent-soft ring-2 ring-accent" : ""
                    }`}
                  >
                    <span className={`${scriptClass(!!indopak)} ar-md border-b-[3px] ${underline}`}>{indopak?.[v.n - 1]?.[i] ?? w[0]}</span>
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
            <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-start gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => (reciting === v.n ? player.pause() : (stop(), player.play(v.n, false)))}
                className={`shrink-0 h-11 px-3 rounded-full inline-flex items-center gap-2 text-sm font-semibold ${
                  reciting === v.n ? "bg-accent text-white" : "bg-surface-2 text-text hover:brightness-95"
                }`}
                aria-label={reciting === v.n ? t.player.pause : t.player.recite}
              >
                {reciting === v.n ? <Square className="w-4 h-4" aria-hidden /> : <Headphones className="w-4 h-4" aria-hidden />}
                <span className="hidden sm:inline">{t.player.recite}</span>
              </button>
              <button
                type="button"
                onClick={() => (playing?.v === v.n ? stop() : playVerse(v))}
                className={`shrink-0 h-11 px-3 rounded-full inline-flex items-center gap-2 text-sm font-semibold ${
                  playing?.v === v.n ? "bg-accent text-white" : "bg-primary-soft text-primary hover:brightness-95"
                }`}
                aria-label={playing?.v === v.n ? t.read.stop : t.read.playWords}
              >
                {playing?.v === v.n ? <Square className="w-4 h-4" aria-hidden /> : <Play className="w-4 h-4" aria-hidden />}
                <span className="hidden sm:inline">{playing?.v === v.n ? t.read.stop : t.read.playWords}</span>
              </button>
              {status && (
                <span
                  className={`shrink-0 h-11 px-3 rounded-full inline-flex items-center text-sm font-semibold ${
                    known === v.w.length ? "bg-success-soft text-success" : "bg-surface-2 text-muted"
                  }`}
                  title={t.read.knownOf(num(locale, known), num(locale, v.w.length))}
                >
                  {num(locale, known)}/{num(locale, v.w.length)}
                </span>
              )}
              {view.translation && (
                <p className="text-lg flex-1 basis-full sm:basis-auto" lang={lang}>
                  <span className="font-bold text-primary mr-2">{num(locale, v.n)}.</span>
                  {lang === "bn" ? v.bn : v.en}
                </p>
              )}
            </div>
          </section>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted text-center">{lang === "bn" ? "অনুবাদ: তাইসীরুল কুরআন" : "Translation: Saheeh International"}</p>
      <WordSheet word={sheet} onClose={() => setSheet(null)} />
      {player.state && (
        <PlayerBar
          state={player.state}
          surahName={surahName}
          verseCount={verseCount}
          onPause={player.pause}
          onResume={player.resume}
          onGo={player.go}
          onClose={player.close}
        />
      )}
    </>
  );
}
