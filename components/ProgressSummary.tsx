"use client";

import Link from "next/link";
import { Flame, BookCheck, Target, CalendarDays } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { useOverview } from "./TodayPanel";
import { ProgressRing } from "./ui";
import { useTodayNewCount } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import { TOTAL_WORDS } from "@/lib/constants";

/** Compact progress card for the home page: coverage ring plus three key numbers. */
export function ProgressSummary() {
  const { locale, t } = useLocale();
  const overview = useOverview();
  const newToday = useTodayNewCount() ?? 0;
  const { dailyNew } = useSettings();
  if (!overview) return <div className="card skeleton h-64" aria-hidden />;
  const tiles = [
    { label: t.home.learnedWords, value: num(locale, overview.total), Icon: BookCheck },
    { label: t.home.todayGoalShort, value: `${num(locale, newToday)}/${num(locale, dailyNew)}`, Icon: Target },
    { label: t.home.streakDays, value: num(locale, overview.streak), Icon: CalendarDays },
  ];
  return (
    <section className="card p-5 md:p-7" aria-labelledby="progress-summary">
      <h2 id="progress-summary" className="text-2xl font-bold mb-4">{t.home.progressTitle}</h2>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] items-center">
        <Link href={`/${locale}/progress/`} className="flex flex-col items-center text-center gap-1">
          <ProgressRing pct={overview.coverage} size={136} stroke={12}>
            <span className="text-2xl font-bold text-primary">{num(locale, overview.coverage)}%</span>
          </ProgressRing>
          <span className="text-xs text-muted max-w-36">{t.home.wordsKnown(num(locale, overview.words), num(locale, TOTAL_WORDS))}</span>
        </Link>
        <div className="grid grid-cols-3 gap-3">
          {tiles.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface-2/50 p-3">
              <Icon className="w-5 h-5 text-primary" aria-hidden />
              <p className="text-sm text-muted mt-2 leading-tight">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent">
        <Flame className="w-5 h-5" aria-hidden /> {overview.streak > 0 ? t.home.keepGoing : t.home.startGoing}
      </p>
    </section>
  );
}
