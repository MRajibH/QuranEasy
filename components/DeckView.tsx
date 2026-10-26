"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, ArrowRight, BookOpen, Check, Play } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { StudyFlow } from "./StudyFlow";
import { LoadError, ProgressRing, Spinner } from "./ui";
import { loadDeck } from "@/lib/data";
import { db } from "@/lib/db";
import { completeDeckPart, useCompletedParts, type StudyResult } from "@/lib/progress";
import { num } from "@/lib/i18n";
import { DECK_PART_SIZE, JUZ_AMMA } from "@/lib/constants";
import type { Deck } from "@/lib/types";

interface Props {
  id: string;
  title: string;
  ar: string;
  surahNum: number | null;
  total: number;
  unique: number;
  parts: number;
}

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

/** Share of the deck's word occurrences the learner has started (any card). */
function useDeckCoverage(deck: Deck | null) {
  return useLiveQuery(async () => {
    if (!deck) return 0;
    const cards = await db().cards.bulkGet(deck.words.map((w) => w.id));
    const known = deck.words.reduce((s, w, i) => s + (cards[i] ? w.sfreq : 0), 0);
    return pct(known, deck.total);
  }, [deck]);
}

export function DeckView(props: Props) {
  const params = useSearchParams();
  const part = Number(params.get("p")) || 0;
  const [deck, setDeck] = useState<Deck | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    loadDeck(props.id).then(setDeck, () => setError(true));
  }, [props.id]);
  useEffect(load, [load]);

  if (error) return <LoadError onRetry={load} />;
  if (!deck) return <Spinner />;
  if (part >= 1 && part <= props.parts) return <DeckPart key={part} deck={deck} part={part} {...props} />;
  return <DeckOverview deck={deck} {...props} />;
}

function DeckPart({ deck, part, id, title, parts }: Props & { deck: Deck; part: number }) {
  const { locale, t } = useLocale();
  const done = useCompletedParts(id);
  const coverage = useDeckCoverage(deck);
  const words = deck.words.slice((part - 1) * DECK_PART_SIZE, part * DECK_PART_SIZE);
  const onComplete = useCallback((results: StudyResult[]) => completeDeckPart(id, part, results), [id, part]);
  return (
    <StudyFlow
      title={`${title} · ${t.decks.part(num(locale, part))}`}
      back={{ href: `/${locale}/decks/${id}/`, label: title }}
      words={words}
      distractorPool={deck.words}
      alreadyDone={done?.has(part)}
      onComplete={onComplete}
      doneMessage={coverage !== undefined ? t.decks.partDone(num(locale, coverage)) : undefined}
      next={part < parts ? { href: `/${locale}/decks/${id}/?p=${part + 1}`, label: t.decks.nextPart } : undefined}
    />
  );
}

function DeckOverview({ deck, id, title, ar, surahNum, total, unique, parts }: Props & { deck: Deck }) {
  const { locale, t } = useLocale();
  const done = useCompletedParts(id);
  const coverage = useDeckCoverage(deck);
  const nextPart = useMemo(() => {
    for (let p = 1; p <= parts; p++) if (!done?.has(p)) return p;
    return null;
  }, [done, parts]);

  const partList = Array.from({ length: parts }, (_, i) => {
    const words = deck.words.slice(i * DECK_PART_SIZE, (i + 1) * DECK_PART_SIZE);
    return { n: i + 1, preview: words.slice(0, 3).map((w) => w.ar), hint: words.slice(0, 3).map((w) => (locale === "bn" ? w.bn : w.en)).join(", ") };
  });

  return (
    <div className="max-w-3xl mx-auto grid gap-6">
      <Link href={`/${locale}/decks/`} className="text-sm text-primary font-semibold inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" aria-hidden /> {t.decks.title}
      </Link>

      <header className="hero p-6 md:p-8 grid gap-6 md:grid-cols-[1fr_auto] items-center">
        <div>
          <p className="font-arabic ar-lg text-gold" lang="ar" dir="rtl">{ar}</p>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-white/75">
            {t.decks.totalWords(num(locale, total))} · {t.decks.unique(num(locale, unique))} · {t.decks.parts(num(locale, parts))}
          </p>
          <p className="text-sm text-white/60">{t.decks.days(num(locale, parts))}</p>
        </div>
        <div className="flex flex-col items-center text-center gap-1">
          <ProgressRing pct={coverage ?? 0} size={130} stroke={12}>
            <span className="text-2xl font-bold text-white">{num(locale, coverage ?? 0)}%</span>
          </ProgressRing>
          <span className="text-sm text-white/80 max-w-44">
            {(id === JUZ_AMMA.id ? t.decks.understandJuz : t.decks.understand)(num(locale, coverage ?? 0))}
          </span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {nextPart ? (
          <Link href={`/${locale}/decks/${id}/?p=${nextPart}`} className="btn btn-primary btn-lg">
            <Play className="w-5 h-5" aria-hidden /> {t.decks.startNext(num(locale, nextPart))}
          </Link>
        ) : (
          <p className="rounded-2xl bg-success-soft text-success font-semibold px-5 py-3 flex items-center">{t.decks.allPartsDone}</p>
        )}
        {surahNum && (
          <Link href={`/${locale}/read/${surahNum}/`} className="btn btn-secondary btn-lg">
            <BookOpen className="w-5 h-5" aria-hidden /> {t.decks.readSurah}
          </Link>
        )}
      </div>

      <ol className="grid gap-2 sm:grid-cols-2">
        {partList.map(({ n, preview, hint }) => {
          const isDone = done?.has(n);
          const isNext = n === nextPart;
          return (
            <li key={n}>
              <Link
                href={`/${locale}/decks/${id}/?p=${n}`}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
                  isNext ? "border-primary bg-primary-soft" : "border-transparent bg-surface shadow-[var(--shadow-sm)] hover:border-border"
                }`}
              >
                <span
                  className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center font-bold ${
                    isDone ? "bg-success text-white" : isNext ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted"
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5" /> : num(locale, n)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-muted">{t.decks.part(num(locale, n))}</span>
                  <span className="block truncate text-sm">{hint}</span>
                </span>
                <span className="font-arabic ar-sm shrink-0 max-w-[40%] truncate" lang="ar" dir="rtl">{preview.join(" · ")}</span>
                <ArrowRight className="w-4 h-4 text-muted shrink-0" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
