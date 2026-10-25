"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Eye, GraduationCap, Layers, ListChecks } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { AudioButton, Meaning, PageTitle, ProgressBar, Spinner, shuffle, useAutoplay, useMeaningText } from "./ui";
import { db, type CardRow } from "@/lib/db";
import { loadLemmaMap, loadLemmas } from "@/lib/data";
import { dueCutoff, nextLessonId, reviewCard, useCompletedLessons } from "@/lib/progress";
import { formatInterval, previewDue, Rating, type Grade } from "@/lib/srs";
import { pickDistractors } from "@/lib/quiz";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import { TOTAL_LESSONS, WORD_PAGE_MIN_FREQ } from "@/lib/constants";
import type { LemmaLite } from "@/lib/types";

type Mode = "cards" | "choice";
const MODE_KEY = "qe-review-mode";
const SESSION_LIMIT = 100;
/** Cards that come due again within this window are repeated in the same session. */
const REQUEUE_MS = 15 * 60 * 1000;

export function ReviewSession() {
  const { locale, t } = useLocale();
  const [queue, setQueue] = useState<CardRow[] | null>(null);
  const [lemmas, setLemmas] = useState<Map<number, LemmaLite> | null>(null);
  const [pool, setPool] = useState<LemmaLite[]>([]);
  const [hasCards, setHasCards] = useState(true);
  const [reviewed, setReviewed] = useState(0);
  const [nextDue, setNextDue] = useState<Date | null>(null);
  const [mode, setMode] = useState<Mode>("cards");
  const initial = useRef(0);

  useEffect(() => {
    try {
      const m = localStorage.getItem(MODE_KEY);
      if (m === "cards" || m === "choice") setMode(m);
    } catch {}
    (async () => {
      const [map, all] = await Promise.all([loadLemmaMap(), loadLemmas()]);
      const d = db();
      const due = (await d.cards.where("due").belowOrEqual(dueCutoff()).limit(SESSION_LIMIT).toArray()).filter((c) =>
        map.has(c.id),
      );
      setHasCards((await d.cards.count()) > 0);
      initial.current = due.length;
      setLemmas(map);
      setPool(all.slice(0, 600));
      setQueue(shuffle(due));
    })();
  }, []);

  useEffect(() => {
    if (queue && queue.length === 0) {
      db().cards.orderBy("due").first().then((c) => setNextDue(c ? new Date(c.due) : null));
    }
  }, [queue]);

  const changeMode = (m: Mode) => {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {}
  };

  const rate = useCallback(
    async (grade: Grade) => {
      if (!queue?.length) return;
      const [head, ...rest] = queue;
      const updated = await reviewCard(head, grade);
      setReviewed((r) => r + 1);
      const soon = new Date(updated.due).getTime() - Date.now() < REQUEUE_MS;
      setQueue(soon ? [...rest, updated] : rest);
    },
    [queue],
  );

  if (!queue || !lemmas) return <Spinner />;

  const title = (
    <PageTitle title={t.review.title} subtitle={t.review.subtitle}>
      {queue.length > 0 && (
        <div className="flex rounded-2xl bg-surface-2 p-1" role="radiogroup" aria-label="Mode">
          {(
            [
              ["cards", t.review.modeCards, Layers],
              ["choice", t.review.modeChoice, ListChecks],
            ] as const
          ).map(([m, label, Icon]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => changeMode(m)}
              className={`h-11 px-4 rounded-xl font-semibold inline-flex items-center gap-2 ${
                mode === m ? "bg-surface text-primary shadow-sm" : "text-muted"
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden /> {label}
            </button>
          ))}
        </div>
      )}
    </PageTitle>
  );

  if (!hasCards) {
    return (
      <>
        {title}
        <EmptyState
          heading={t.review.nothingYet}
          text={t.review.nothingYetText}
          action={
            <Link href={`/${locale}/lesson/?n=1`} className="btn btn-primary btn-lg">
              <GraduationCap className="w-5 h-5" aria-hidden /> {t.home.startFirst}
            </Link>
          }
        />
      </>
    );
  }

  if (queue.length === 0) {
    return (
      <>
        {title}
        <AllDone reviewed={reviewed} nextDue={nextDue} />
      </>
    );
  }

  const head = queue[0];
  const lemma = lemmas.get(head.id);
  if (!lemma) return null; // unreachable: queue is filtered to known lemma ids on load
  const done = Math.max(0, initial.current - queue.length);

  return (
    <div className="max-w-2xl mx-auto">
      {title}
      <div className="flex items-center gap-3 mb-4">
        <ProgressBar value={done} max={Math.max(initial.current, 1)} className="flex-1" />
        <span className="text-sm font-semibold text-muted">{t.review.left(num(locale, queue.length))}</span>
      </div>
      {mode === "cards" ? (
        <Flashcard key={`${head.id}-${reviewed}`} card={head} lemma={lemma} onRate={rate} />
      ) : (
        <ChoiceReview key={`${head.id}-${reviewed}`} lemma={lemma} pool={pool} onRate={rate} flip={reviewed % 3 === 2} />
      )}
    </div>
  );
}

function EmptyState({ heading, text, action }: { heading: string; text: string; action: React.ReactNode }) {
  return (
    <div className="card p-10 text-center max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">{heading}</h2>
      <p className="mt-2 text-muted text-lg">{text}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

function AllDone({ reviewed, nextDue }: { reviewed: number; nextDue: Date | null }) {
  const { locale, t } = useLocale();
  const done = useCompletedLessons();
  const next = nextLessonId(done, TOTAL_LESSONS);
  return (
    <div className="card p-10 text-center max-w-xl mx-auto animate-pop">
      <CheckCircle2 className="w-16 h-16 text-success mx-auto" aria-hidden />
      <h2 className="text-2xl font-bold mt-3">{t.review.allDone}</h2>
      <p className="mt-2 text-muted text-lg">{t.review.allDoneText}</p>
      {reviewed > 0 && <p className="mt-2 font-semibold">{t.review.reviewed(num(locale, reviewed))}</p>}
      {nextDue && (
        <p className="mt-2 text-muted">
          {t.review.nextAt(num(locale, formatInterval(new Date(), nextDue, locale)))}
        </p>
      )}
      <div className="mt-6 grid gap-3">
        <Link href={`/${locale}/lesson/?n=${next}`} className="btn btn-primary btn-lg">
          <GraduationCap className="w-5 h-5" aria-hidden /> {t.home.nextLesson(num(locale, next))}
        </Link>
        <Link href={`/${locale}/practice/`} className="btn btn-secondary">
          {t.nav.practice}
        </Link>
      </div>
    </div>
  );
}

const GRADES: { grade: Grade; key: "again" | "hard" | "good" | "easy"; cls: string }[] = [
  { grade: Rating.Again as Grade, key: "again", cls: "border-danger text-danger hover:bg-danger-soft" },
  { grade: Rating.Hard as Grade, key: "hard", cls: "border-accent text-accent hover:bg-accent-soft" },
  { grade: Rating.Good as Grade, key: "good", cls: "border-success text-success hover:bg-success-soft" },
  { grade: Rating.Easy as Grade, key: "easy", cls: "border-primary text-primary hover:bg-primary-soft" },
];

function Flashcard({ card, lemma, onRate }: { card: CardRow; lemma: LemmaLite; onRate: (g: Grade) => void }) {
  const { locale, t } = useLocale();
  const { translit } = useSettings();
  const [shown, setShown] = useState(false);
  const [, ar, bn, en, tr, freq, root, loc] = lemma;
  const intervals = useMemo(() => {
    const now = new Date();
    const p = previewDue(card, now);
    return Object.fromEntries(GRADES.map((g) => [g.grade, formatInterval(now, p[g.grade], locale)]));
  }, [card, locale]);
  useAutoplay(loc);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!shown && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setShown(true);
      } else if (shown && ["1", "2", "3", "4"].includes(e.key)) {
        onRate(GRADES[Number(e.key) - 1].grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, onRate]);

  return (
    <div className="animate-pop">
      <div className="card p-6 md:p-10 text-center min-h-80 flex flex-col items-center justify-center">
        <p className="font-arabic ar-xl" lang="ar" dir="rtl">{ar}</p>
        {loc && <AudioButton location={loc} size="lg" className="mt-2" />}
        {!shown ? (
          <p className="mt-6 text-muted">{t.review.think}</p>
        ) : (
          <div className="mt-4 animate-pop">
            {translit && tr && <p className="text-muted italic text-lg">{tr}</p>}
            <Meaning bn={bn} en={en} size="xl" className="mt-2" />
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
              {root && (
                <span className="rounded-full bg-accent-soft text-accent px-3 py-1 font-semibold">
                  {t.common.root}: <span className="font-arabic text-lg" lang="ar">{root}</span>
                </span>
              )}
              <span className="rounded-full bg-primary-soft text-primary px-3 py-1 font-semibold">
                {t.common.appearsTimes(num(locale, freq))}
              </span>
            </div>
            {freq >= WORD_PAGE_MIN_FREQ && (
              <Link href={`/${locale}/w/${lemma[0]}/`} target="_blank" className="mt-3 inline-block text-sm text-primary underline underline-offset-4">
                {t.common.seeWord}
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="mt-4">
        {!shown ? (
          <button type="button" className="btn btn-primary btn-lg w-full" onClick={() => setShown(true)} autoFocus>
            <Eye className="w-5 h-5" aria-hidden /> {t.review.showAnswer}
          </button>
        ) : (
          <>
            <p className="text-center font-semibold mb-2">{t.review.howWell}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GRADES.map((g, i) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => onRate(g.grade)}
                  className={`min-h-20 rounded-2xl border-2 bg-surface font-bold flex flex-col items-center justify-center gap-0.5 px-2 ${g.cls}`}
                >
                  <span>{t.review[g.key]}</span>
                  <span className="text-xs font-semibold opacity-80">{num(locale, intervals[g.grade])}</span>
                  <span className="sr-only">({i + 1})</span>
                </button>
              ))}
            </div>
          </>
        )}
        <p className="hidden md:block text-center text-xs text-muted mt-3">{t.review.keys}</p>
      </div>
    </div>
  );
}

/** Multiple-choice review: correct → Good, wrong → Again. Every third card asks in reverse (meaning → Arabic). */
function ChoiceReview({ lemma, pool, onRate, flip }: { lemma: LemmaLite; pool: LemmaLite[]; onRate: (g: Grade) => void; flip: boolean }) {
  const { t } = useLocale();
  const meaningText = useMeaningText();
  const text = useCallback((l: LemmaLite) => (flip ? l[1] : meaningText(l[2], l[3])), [flip, meaningText]);
  const options = useMemo(() => {
    const ds = pickDistractors(lemma, pool, text);
    return shuffle([lemma, ...ds]).map((l) => ({ key: l[0], label: text(l), arabic: flip }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixed per question
  }, [lemma]);
  useAutoplay(lemma[7]);
  return (
    <ChoiceQuestion
      prompt={
        flip ? (
          <>
            <p className="text-muted font-semibold">{t.practice.reverseDesc}</p>
            <Meaning bn={lemma[2]} en={lemma[3]} size="xl" className="mt-3" />
          </>
        ) : (
          <>
            <p className="text-muted font-semibold">{t.learn.quizPrompt}</p>
            <p className="font-arabic ar-xl mt-2" lang="ar" dir="rtl">{lemma[1]}</p>
            {lemma[7] && <AudioButton location={lemma[7]} className="mt-1" />}
          </>
        )
      }
      options={options}
      correctKey={lemma[0]}
      onDone={(ok) => onRate((ok ? Rating.Good : Rating.Again) as Grade)}
    />
  );
}
