"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BookCheck, Download, Flame, GraduationCap, Repeat, Trash2, Upload } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { PageTitle, ProgressBar, ProgressRing, Spinner } from "./ui";
import { ShareProgress } from "./ShareProgress";
import { db, exportBackup, importBackup, resetAll } from "@/lib/db";
import { loadLemmaMap } from "@/lib/data";
import { State } from "@/lib/srs";
import { addDays, coveragePct, dayKey, nextMilestone, streak } from "@/lib/stats";
import { num } from "@/lib/i18n";
import { TOTAL_LESSONS, TOTAL_WORDS } from "@/lib/constants";

const HEATMAP_WEEKS = 18;

function useDashboard() {
  return useLiveQuery(async () => {
    const d = db();
    const [cards, logs, lessons] = await Promise.all([d.cards.toArray(), d.logs.toArray(), d.lessons.count()]);
    const known = cards.filter((c) => c.state === State.Review);
    const map = await loadLemmaMap();
    const perDay = new Map<string, number>();
    for (const l of logs) perDay.set(l.day, (perDay.get(l.day) ?? 0) + 1);
    const today = new Date();
    const forecast = Array.from({ length: 7 }, (_, i) => {
      const end = addDays(today, i + 1);
      end.setHours(0, 0, 0, 0);
      const start = i === 0 ? new Date(0) : addDays(end, -1);
      return cards.filter((c) => c.due >= start && c.due < end).length;
    });
    return {
      total: cards.length,
      known: known.length,
      learning: cards.length - known.length,
      reviews: logs.length,
      lessons,
      coverage: coveragePct(cards.map((c) => map.get(c.id)?.[5] ?? 0), TOTAL_WORDS),
      mastered: coveragePct(known.map((c) => map.get(c.id)?.[5] ?? 0), TOTAL_WORDS),
      words: cards.reduce((s, c) => s + (map.get(c.id)?.[5] ?? 0), 0),
      streak: streak(new Set(perDay.keys())),
      perDay,
      forecast,
    };
  }, []);
}

function Heatmap({ perDay }: { perDay: Map<string, number> }) {
  const { locale } = useLocale();
  const today = new Date();
  // Start on the Saturday/Sunday-agnostic column: last HEATMAP_WEEKS*7 days ending today.
  const days = Array.from({ length: HEATMAP_WEEKS * 7 }, (_, i) => addDays(today, i - HEATMAP_WEEKS * 7 + 1));
  const level = (n: number) => (n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : n < 50 ? 3 : 4);
  const colors = ["var(--surface-2)", "color-mix(in srgb, var(--primary) 30%, transparent)", "color-mix(in srgb, var(--primary) 55%, transparent)", "color-mix(in srgb, var(--primary) 80%, transparent)", "var(--primary)"];
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
        {days.map((d) => {
          const k = dayKey(d);
          const n = perDay.get(k) ?? 0;
          return (
            <span
              key={k}
              className="w-4 h-4 rounded-[4px]"
              style={{ background: colors[level(n)] }}
              title={`${d.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US")}: ${num(locale, n)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function Forecast({ data }: { data: number[] }) {
  const { locale, t } = useLocale();
  const max = Math.max(1, ...data);
  const today = new Date();
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((n, i) => {
        const label =
          i === 0 ? t.progress.today : i === 1 ? t.progress.tomorrow : addDays(today, i).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", { weekday: "short" });
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-sm font-semibold">{num(locale, n)}</span>
            <div className="w-full rounded-t-lg bg-primary" style={{ height: `${(n / max) * 100}%`, minHeight: n ? 6 : 2, opacity: n ? 1 : 0.25 }} />
            <span className="text-xs text-muted truncate max-w-full">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ProgressView() {
  const { locale, t } = useLocale();
  const data = useDashboard();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!data) return <Spinner />;

  const download = async () => {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `quraneasy-backup-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (file: File) => {
    try {
      await importBackup(JSON.parse(await file.text()));
      setMsg({ ok: true, text: t.progress.imported });
      setTimeout(() => location.reload(), 800);
    } catch {
      setMsg({ ok: false, text: t.progress.importFailed });
    }
  };

  const tiles = [
    { label: t.progress.streak, value: data.streak, Icon: Flame, cls: "bg-accent-soft text-accent" },
    { label: t.progress.known, value: data.known, Icon: BookCheck, cls: "bg-success-soft text-success" },
    { label: t.progress.learning, value: data.learning, Icon: GraduationCap, cls: "bg-primary-soft text-primary" },
    { label: t.progress.reviews, value: data.reviews, Icon: Repeat, cls: "bg-surface-2 text-muted" },
  ];
  const milestone = nextMilestone(data.known);

  return (
    <>
      <PageTitle title={t.progress.title} />
      {data.total === 0 && (
        <div className="card p-6 mb-6 flex flex-wrap items-center gap-4">
          <p className="flex-1 text-lg">{t.progress.empty}</p>
          <Link href={`/${locale}/lesson/?n=1`} className="btn btn-primary">{t.home.startFirst}</Link>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="card p-6 flex flex-col items-center text-center gap-2 md:w-72">
          <ProgressRing pct={data.coverage} size={180} stroke={16}>
            <span className="text-4xl font-bold text-primary">{num(locale, data.coverage)}%</span>
          </ProgressRing>
          <h2 className="font-bold text-lg">{t.progress.wordsKnown(num(locale, data.words), num(locale, TOTAL_WORDS))}</h2>
          <p className="text-sm text-muted">{t.progress.coverageText(num(locale, data.coverage))}</p>
          <p className="text-sm font-semibold text-success">{t.progress.mastered(num(locale, data.mastered))}</p>
          {data.total > 0 && (
            <ShareProgress stats={{ pct: data.coverage, words: data.words, streak: data.streak }} className="mt-2" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {tiles.map(({ label, value, Icon, cls }) => (
            <div key={label} className="card p-5 flex flex-col gap-2">
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center ${cls}`}>
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="text-3xl font-bold">{num(locale, value)}</span>
              <span className="text-muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <section className="card p-6">
          <div className="flex justify-between font-semibold mb-2">
            <h2>{t.progress.lessonsDone}</h2>
            <span className="text-muted">{num(locale, data.lessons)} / {num(locale, TOTAL_LESSONS)}</span>
          </div>
          <ProgressBar value={data.lessons} max={TOTAL_LESSONS} />
          <div className="flex justify-between font-semibold mt-5 mb-2">
            <h2>{t.progress.milestone(num(locale, milestone))}</h2>
            <span className="text-muted">{num(locale, data.known)} / {num(locale, milestone)}</span>
          </div>
          <ProgressBar value={data.known} max={milestone} />
        </section>
        <section className="card p-6">
          <h2 className="font-semibold mb-3">{t.progress.forecast}</h2>
          <Forecast data={data.forecast} />
        </section>
      </div>

      <section className="card p-6 mt-4">
        <h2 className="font-semibold mb-3">{t.progress.activity}</h2>
        <Heatmap perDay={data.perDay} />
      </section>

      <section className="card p-6 mt-4" aria-labelledby="backup">
        <h2 id="backup" className="text-xl font-bold">{t.progress.backup}</h2>
        <p className="text-muted mt-1">{t.progress.backupText}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={download}>
            <Download className="w-5 h-5" aria-hidden /> {t.progress.export}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="w-5 h-5" aria-hidden /> {t.progress.import}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])}
          />
        </div>
        {msg && (
          <p className={`mt-3 font-semibold ${msg.ok ? "text-success" : "text-danger"}`} role="status">
            {msg.text}
          </p>
        )}
        <button
          type="button"
          className="btn btn-ghost text-danger mt-6 -ml-3"
          onClick={async () => {
            if (confirm(t.progress.resetConfirm)) await resetAll();
          }}
        >
          <Trash2 className="w-5 h-5" aria-hidden /> {t.progress.reset}
        </button>
      </section>
    </>
  );
}
