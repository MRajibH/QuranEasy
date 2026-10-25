"use client";

import { useEffect, useId, useState } from "react";
import { Volume2 } from "lucide-react";
import { playWord } from "@/lib/audio";
import { useSettings } from "@/lib/settings";
import { useLocale } from "./LocaleProvider";

export function AudioButton({
  location,
  size = "md",
  label,
  className = "",
}: {
  location: string;
  size?: "md" | "lg";
  label?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const [playing, setPlaying] = useState(false);
  const dim = size === "lg" ? "h-14 min-w-14" : "h-12 min-w-12";
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        setPlaying(true);
        await playWord(location);
        setPlaying(false);
      }}
      className={`${dim} px-3 rounded-full inline-flex items-center justify-center gap-2 font-semibold bg-primary-soft text-primary hover:brightness-95 ${
        playing ? "ring-4 ring-primary/30" : ""
      } ${className}`}
      aria-label={t.common.listen}
      title={t.common.listen}
    >
      <Volume2 className={size === "lg" ? "w-7 h-7" : "w-6 h-6"} aria-hidden />
      {label && <span>{t.common.listen}</span>}
    </button>
  );
}

/** Plays a word once when it appears, if the user enabled autoplay. */
export function useAutoplay(location: string | undefined) {
  const { autoplay } = useSettings();
  useEffect(() => {
    if (autoplay && location) playWord(location);
  }, [autoplay, location]);
}

/** Shows the meaning in the language(s) the user chose; app language comes first. */
export function Meaning({
  bn,
  en,
  className = "",
  size = "lg",
}: {
  bn: string;
  en: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const { locale } = useLocale();
  const { meaning } = useSettings();
  const show = meaning === "both" ? (locale === "bn" ? ["bn", "en"] : ["en", "bn"]) : [meaning];
  const main = { sm: "text-base", md: "text-lg", lg: "text-2xl", xl: "text-3xl" }[size];
  const sub = { sm: "text-sm", md: "text-base", lg: "text-lg", xl: "text-xl" }[size];
  return (
    <div className={className}>
      {show.map((l, i) => (
        <div
          key={l}
          lang={l}
          className={i === 0 ? `${main} font-bold text-text` : `${sub} text-muted`}
        >
          {l === "bn" ? bn : en}
        </div>
      ))}
    </div>
  );
}

export function ProgressRing({ pct, size = 120, stroke = 12, children }: { pct: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const gid = useId();
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, max, className = "" }: { value: number; max: number; className?: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      className={`h-3 rounded-full bg-surface-2 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 55%, var(--gold)))" }}
      />
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-60">
        <h1 className="text-3xl font-bold text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-muted text-lg">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/** Skeleton placeholder shaped like a page heading + card, shown while data loads. */
export function Spinner() {
  const { t } = useLocale();
  return (
    <div className="max-w-2xl mx-auto grid gap-4 py-2" role="status" aria-label={t.common.loading}>
      <div className="skeleton h-9 w-1/2" />
      <div className="skeleton h-4 w-3/4" />
      <div className="card p-8 grid gap-4 justify-items-center">
        <div className="skeleton h-16 w-40" />
        <div className="skeleton h-12 w-28 rounded-full" />
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-5 w-32" />
      </div>
      <div className="skeleton h-14 w-full" />
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry?: () => void }) {
  const { t } = useLocale();
  return (
    <div className="card p-8 text-center">
      <p className="text-lg mb-4">{t.common.error}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          {t.common.retry}
        </button>
      )}
    </div>
  );
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Returns a function that picks the single meaning to show where only one fits (quiz options). */
export function useMeaningText() {
  const { locale } = useLocale();
  const { meaning } = useSettings();
  const lang = meaning === "both" ? locale : meaning;
  return (bn: string, en: string) => (lang === "bn" ? bn || en : en || bn);
}
