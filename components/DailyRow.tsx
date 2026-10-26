"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocale } from "./LocaleProvider";
import { useDailyWords } from "./DailyWords";
import { AudioButton } from "./ui";
import { db } from "@/lib/db";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";

/** "Today's words" as a row of cards: number, audio, Arabic, pronunciation, meaning, source ayah. */
export function DailyRow() {
  const { locale, t } = useLocale();
  const { translit } = useSettings();
  const { words } = useDailyWords();
  const started = useLiveQuery(
    async () => new Set((await db().cards.bulkGet(words?.map((w) => w.id) ?? [])).filter(Boolean).map((c) => c!.id)),
    [words?.map((w) => w.id).join(",")],
  );
  if (!words || words.length === 0) return null;
  return (
    <section className="card p-5 md:p-7" aria-labelledby="daily-row">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft text-primary px-3 py-1 text-sm font-semibold">
            <Sparkles className="w-4 h-4" aria-hidden /> {t.home.dailyBadge}
          </span>
          <h2 id="daily-row" className="text-2xl md:text-3xl font-bold mt-2">{t.home.dailyTitle(num(locale, words.length))}</h2>
          <p className="text-muted">{t.home.dailySub}</p>
        </div>
        <Link href={`/${locale}/daily/`} className="text-primary font-semibold inline-flex items-center gap-1 underline-offset-4 hover:underline">
          {t.home.seeAll} <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {words.map((w, i) => {
          const done = started?.has(w.id);
          const ex = w.examples[0];
          const [s, a] = ex?.ref.split(":") ?? [];
          return (
            <li key={w.id} className="relative rounded-3xl border border-border bg-surface-2/50 p-5 text-center">
              <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary text-primary-fg text-sm font-bold flex items-center justify-center">
                {done ? <Check className="w-4 h-4" aria-hidden /> : num(locale, i + 1)}
              </span>
              <AudioButton location={w.audio} className="absolute top-3 right-3" />
              <Link href={`/${locale}/daily/`} className="block pt-6">
                <span className="block font-arabic ar-lg text-text" lang="ar" dir="rtl">{w.ar}</span>
                {translit && w.tr && <span className="block text-muted italic">({w.tr})</span>}
                <span className="block mt-2 text-lg font-semibold" lang={locale}>{locale === "bn" ? w.bn : w.en}</span>
                {s && (
                  <span className="mt-3 inline-block rounded-full bg-accent-soft text-accent px-3 py-1 text-sm font-semibold">
                    {t.common.surah} {num(locale, s)}:{num(locale, a)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
