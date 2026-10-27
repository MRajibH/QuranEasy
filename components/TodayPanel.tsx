"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Flame, GraduationCap, Repeat, Target } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocale } from "./LocaleProvider";
import { ProgressBar } from "./ui";
import { ScriptPicker } from "./ScriptPicker";
import { db } from "@/lib/db";
import { nextLessonId, useCompletedLessons, useDueCount, useTodayNewCount } from "@/lib/progress";
import { updateSettings, useSettings, type MeaningLang } from "@/lib/settings";
import { coveragePct, streak } from "@/lib/stats";
import { State } from "@/lib/srs";
import { num } from "@/lib/i18n";
import { loadLemmaMap } from "@/lib/data";
import { TOTAL_LESSONS, TOTAL_WORDS } from "@/lib/constants";

export function useOverview() {
  return useLiveQuery(async () => {
    const d = db();
    const [cards, days] = await Promise.all([d.cards.toArray(), d.logs.orderBy("day").uniqueKeys()]);
    const known = cards.filter((c) => c.state === State.Review);
    let coverage = 0;
    let words = 0;
    if (cards.length) {
      const map = await loadLemmaMap();
      const freqs = cards.map((c) => map.get(c.id)?.[5] ?? 0);
      coverage = coveragePct(freqs, TOTAL_WORDS);
      words = freqs.reduce((a, b) => a + b, 0);
    }
    return { total: cards.length, known: known.length, coverage, words, streak: streak(new Set(days as string[])) };
  }, []);
}

function Onboarding() {
  const { locale, t } = useLocale();
  const s = useSettings();
  const opts: [MeaningLang, string][] = [
    ["bn", t.settings.bangla],
    ["en", t.settings.english],
    ["both", t.settings.both],
  ];
  return (
    <section className="card bg-surface/85 backdrop-blur p-4 sm:p-6 md:p-7 animate-pop" aria-labelledby="setup">
      <h2 id="setup" className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <Target className="w-6 h-6 text-primary" aria-hidden /> {t.home.setupTitle}
      </h2>
      <fieldset className="mt-6">
        <legend className="font-semibold text-lg mb-3">{num(locale, 1)}. {t.home.setupMeaning}</legend>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {opts.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => updateSettings({ meaning: v })}
              className={`btn ${s.meaning === v ? "btn-primary" : "btn-secondary"}`}
              aria-pressed={s.meaning === v}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="font-semibold text-lg mb-3">{num(locale, 2)}. {t.home.setupGoal}</legend>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[5, 10, 20].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => updateSettings({ dailyNew: n })}
              className={`btn ${s.dailyNew === n ? "btn-primary" : "btn-secondary"}`}
              aria-pressed={s.dailyNew === n}
            >
              {num(locale, n)}
            </button>
          ))}
        </div>
        <p className="text-muted mt-2">{t.home.goalHint(num(locale, s.dailyNew))}</p>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="font-semibold text-lg mb-3">{num(locale, 3)}. {t.home.setupScript}</legend>
        <ScriptPicker />
      </fieldset>
      <Link
        href={`/${locale}/lesson/?n=1`}
        onClick={() => updateSettings({ onboarded: true })}
        className="btn btn-gold btn-lg w-full mt-7"
      >
        <BookOpen className="w-5 h-5" aria-hidden /> {t.home.startFirst} <ArrowRight className="w-5 h-5" aria-hidden />
      </Link>
      <p className="text-center text-sm text-muted mt-2">{t.home.startNote}</p>
      <Link
        href={`/${locale}/decks/s1/?p=1`}
        onClick={() => updateSettings({ onboarded: true })}
        className="btn btn-ghost w-full mt-2"
      >
        {t.decks.orFatiha}
      </Link>
    </section>
  );
}

export function TodayPanel() {
  const { locale, t } = useLocale();
  const settings = useSettings();
  const overview = useOverview();
  const due = useDueCount();
  const done = useCompletedLessons();
  const newToday = useTodayNewCount();

  if (!overview || due === undefined || !done) {
    return <div className="card h-72 skeleton" aria-hidden />;
  }
  if (overview.total === 0) return <Onboarding />;

  const next = nextLessonId(done, TOTAL_LESSONS);
  const goalMet = (newToday ?? 0) >= settings.dailyNew;

  return (
    <section aria-label={t.home.todayTitle}>
      <div className="card bg-surface/85 backdrop-blur p-4 sm:p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">{t.home.todayTitle}</h2>
          {overview.streak > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1 text-sm font-semibold whitespace-nowrap">
              <Flame className="w-5 h-5" aria-hidden />
              {t.home.streak(num(locale, overview.streak))}
            </span>
          )}
        </div>

        <div className="mt-5 grid gap-3">
          {due > 0 ? (
            <Link href={`/${locale}/review/`} className="btn btn-primary btn-lg w-full justify-between max-sm:text-base max-sm:px-4">
              <span className="flex items-center gap-2.5 text-left">
                <Repeat className="w-6 h-6 shrink-0" aria-hidden />
                {t.home.startReview}
              </span>
              <span className="rounded-full bg-primary-fg/20 px-3 py-0.5">{num(locale, due)}</span>
            </Link>
          ) : (
            <p className="rounded-2xl bg-success-soft text-success font-semibold px-5 py-4">{t.home.noDue}</p>
          )}
          <Link
            href={`/${locale}/lesson/?n=${next}`}
            className={`btn btn-lg w-full justify-between max-sm:text-base max-sm:px-4 ${due > 0 || goalMet ? "btn-secondary" : "btn-primary"}`}
          >
            <span className="flex items-center gap-2.5 text-left">
              <GraduationCap className="w-6 h-6 shrink-0" aria-hidden />
              {t.home.nextLesson(num(locale, next))}
            </span>
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
        {due > 0 && <p className="mt-3 text-muted">{t.home.dueReviews(num(locale, due))}</p>}

        <div className="mt-6">
          <div className="flex flex-wrap justify-between gap-x-3 text-sm font-semibold mb-1.5">
            <span>{t.home.todayGoal}</span>
            <span className="text-muted">{t.home.newToday(num(locale, newToday ?? 0), num(locale, settings.dailyNew))}</span>
          </div>
          <ProgressBar value={newToday ?? 0} max={settings.dailyNew} />
        </div>
      </div>

    </section>
  );
}
