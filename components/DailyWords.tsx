"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, Sparkles } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useLocale } from "./LocaleProvider";
import { WordStudy } from "./WordStudy";
import { ExampleAyah, exampleLocation } from "./WordCard";
import { AudioButton, LoadError, Meaning, PageTitle, Spinner } from "./ui";
import { getDailyPicks } from "@/lib/daily";
import { loadWord } from "@/lib/data";
import { db } from "@/lib/db";
import { addToReview } from "@/lib/progress";
import { grammarChips } from "@/lib/grammar";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import type { WordDetail } from "@/lib/types";

/** Which of the given lemma ids are already in the learner's reviews. */
function useStarted(ids: number[]) {
  return useLiveQuery(async () => new Set((await db().cards.bulkGet(ids)).filter(Boolean).map((c) => c!.id)), [ids.join(",")]);
}

export function useDailyWords() {
  const [words, setWords] = useState<WordDetail[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getDailyPicks()
      .then((ids) => Promise.all(ids.map(loadWord)))
      .then(setWords, () => setError(true));
  }, []);
  return { words, error };
}

function DailyWord({ word, index, started }: { word: WordDetail; index: number; started: boolean }) {
  const { locale, t } = useLocale();
  const { translit } = useSettings();
  const ex = word.examples[0];
  return (
    <article className="grid gap-4" aria-labelledby={`dw-${word.id}`}>
      <header className="card p-6 md:p-10 text-center relative overflow-hidden">
        <span className="absolute top-4 left-4 rounded-full bg-accent-soft text-accent px-3 py-1 text-sm font-bold">
          {t.daily.word(num(locale, index + 1))}
        </span>
        <h2 id={`dw-${word.id}`} className="font-arabic ar-xl mt-4" lang="ar" dir="rtl">{word.ar}</h2>
        {translit && word.tr && <p className="text-muted text-lg italic mt-1">{word.tr}</p>}
        {ex && <AudioButton location={exampleLocation(ex)} size="lg" label className="mt-3" />}
        <Meaning bn={word.bn} en={word.en} size="xl" className="mt-5" />
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          {grammarChips(word.g, locale).map((c) => (
            <span key={c} className="rounded-full bg-surface-2 text-muted px-3 py-1 font-semibold">{c}</span>
          ))}
          <span className="rounded-full bg-primary-soft text-primary px-3 py-1 font-semibold">{t.common.appearsTimes(num(locale, word.freq))}</span>
        </div>
      </header>

      <WordStudy word={word} locale={locale} />

      {word.examples.length > 0 && (
        <section className="card p-5 md:p-6">
          <h3 className="text-xl font-bold mb-3">{t.daily.examples}</h3>
          <div className="grid gap-3">
            {word.examples.slice(0, 2).map((e) => (
              <ExampleAyah key={e.ref} ex={e} caption={false} />
            ))}
          </div>
        </section>
      )}

      {started ? (
        <p className="rounded-2xl bg-success-soft text-success font-bold px-5 py-4 flex items-center justify-center gap-2">
          <Check className="w-5 h-5" aria-hidden /> {t.daily.mastered}
        </p>
      ) : (
        <button type="button" className="btn btn-primary btn-lg w-full" onClick={() => addToReview(word.id)}>
          <CheckCircle2 className="w-6 h-6" aria-hidden /> {t.daily.master}
        </button>
      )}
    </article>
  );
}

export function DailyWords() {
  const { locale, t } = useLocale();
  const { words, error } = useDailyWords();
  const started = useStarted(words?.map((w) => w.id) ?? []);

  if (error) return <LoadError onRetry={() => location.reload()} />;
  if (!words || !started) return <Spinner />;

  const allDone = words.length > 0 && words.every((w) => started.has(w.id));
  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle title={t.daily.title} subtitle={t.daily.subtitle}>
        <Sparkles className="w-10 h-10 text-accent" aria-hidden />
      </PageTitle>
      {words.length === 0 && <p className="card p-8 text-center text-lg">{t.daily.noMore}</p>}
      <div className="grid gap-10">
        {words.map((w, i) => (
          <DailyWord key={w.id} word={w} index={i} started={started.has(w.id)} />
        ))}
      </div>
      {allDone && (
        <div className="card p-6 mt-8 text-center animate-pop">
          <p className="text-xl font-bold text-success">{t.daily.allDone}</p>
          <Link href={`/${locale}/review/`} className="btn btn-secondary mt-4">{t.learn.reviewNow}</Link>
        </div>
      )}
    </div>
  );
}

/** Compact "Today's 2 words" card for the home page. */
export function DailyCard() {
  const { locale, t } = useLocale();
  const { words } = useDailyWords();
  const started = useStarted(words?.map((w) => w.id) ?? []);
  if (!words || !started || words.length === 0) return null;
  const done = words.every((w) => started.has(w.id));
  return (
    <Link
      href={`/${locale}/daily/`}
      className="card p-6 flex flex-wrap items-center gap-5 hover:border-primary transition-colors bg-gradient-to-br from-accent-soft/60 to-surface"
    >
      <span className="w-14 h-14 shrink-0 rounded-2xl bg-accent text-white flex items-center justify-center">
        {done ? <Check className="w-7 h-7" aria-hidden /> : <Sparkles className="w-7 h-7" aria-hidden />}
      </span>
      <span className="flex-1 min-w-48">
        <span className="block text-xl font-bold">{done ? t.daily.done : t.daily.cardTitle}</span>
        <span className="block text-muted">{words.map((w) => (locale === "bn" ? w.bn : w.en)).join(" · ")}</span>
      </span>
      <span className="font-arabic ar-lg text-primary" lang="ar" dir="rtl">
        {words.map((w) => w.ar).join("  ")}
      </span>
    </Link>
  );
}
