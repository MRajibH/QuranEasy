"use client";

import { Pause, Play, Repeat, SkipBack, SkipForward, X } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import type { PlayerState } from "./useAyahPlayer";
import { RECITERS, REPEAT_STEPS } from "@/lib/reciters";
import { updateSettings, useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";

/** Floating recitation controls: ayah, previous / play-pause / next, repeat count and reciter. */
export function PlayerBar({
  state,
  surahName,
  verseCount,
  onPause,
  onResume,
  onGo,
  onClose,
}: {
  state: PlayerState;
  surahName: string;
  verseCount: number;
  onPause: () => void;
  onResume: () => void;
  onGo: (delta: number) => void;
  onClose: () => void;
}) {
  const { locale, t } = useLocale();
  const { reciter, repeat } = useSettings();
  const nextRepeat = REPEAT_STEPS[(REPEAT_STEPS.indexOf(repeat) + 1) % REPEAT_STEPS.length];
  const round = "w-11 h-11 rounded-full flex items-center justify-center hover:bg-surface-2 disabled:opacity-40";

  return (
    <div
      className="fixed z-40 inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-6 md:left-auto md:right-6 md:w-[26rem] card shadow-[var(--shadow-lg)] p-3 animate-rise"
      role="region"
      aria-label={t.player.title}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="hidden sm:block font-bold truncate">{surahName}</p>
          <p className="font-semibold sm:font-normal sm:text-sm sm:text-muted whitespace-nowrap">
            {t.common.ayah} {num(locale, state.ayah)}/{num(locale, verseCount)}
          </p>
          {repeat > 1 && (
            <p className="text-xs text-accent font-semibold whitespace-nowrap">{t.player.heard(num(locale, state.heard), num(locale, repeat))}</p>
          )}
        </div>
        <button type="button" className={round} onClick={() => onGo(-1)} disabled={state.ayah <= 1} aria-label={t.player.prev}>
          <SkipBack className="w-5 h-5" aria-hidden />
        </button>
        <button
          type="button"
          className="w-12 h-12 rounded-full bg-primary text-primary-fg flex items-center justify-center shadow"
          onClick={state.playing ? onPause : onResume}
          aria-label={state.playing ? t.player.pause : t.player.play}
        >
          {state.playing ? <Pause className="w-6 h-6" aria-hidden /> : <Play className="w-6 h-6" aria-hidden />}
        </button>
        <button type="button" className={round} onClick={() => onGo(1)} disabled={state.ayah >= verseCount} aria-label={t.player.next}>
          <SkipForward className="w-5 h-5" aria-hidden />
        </button>
        <button type="button" className={round} onClick={onClose} aria-label={t.common.close}>
          <X className="w-5 h-5" aria-hidden />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ repeat: nextRepeat })}
          className={`h-10 px-3 shrink-0 rounded-full border-2 text-sm font-semibold inline-flex items-center gap-1.5 ${
            repeat > 1 ? "border-accent bg-accent-soft text-accent" : "border-border text-muted"
          }`}
          aria-label={t.player.repeat}
          title={t.player.repeat}
        >
          <Repeat className="w-4 h-4" aria-hidden /> {num(locale, repeat)}×
        </button>
        <label className="flex-1 min-w-0">
          <span className="sr-only">{t.player.reciter}</span>
          <select
            value={reciter}
            onChange={(e) => updateSettings({ reciter: e.target.value })}
            className="w-full h-10 rounded-full border-2 border-border bg-surface px-3 text-sm font-semibold"
          >
            {RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {locale === "bn" ? r.bn : r.en}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
