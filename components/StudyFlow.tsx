"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, PartyPopper, Repeat } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { WordCard, exampleLocation } from "./WordCard";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { ProgressBar, shuffle, useAutoplay, useMeaningText } from "./ui";
import { pickDistractors } from "@/lib/quiz";
import { celebrate } from "@/lib/confetti";
import { Rating, type Grade } from "@/lib/srs";
import type { StudyResult } from "@/lib/progress";
import { num } from "@/lib/i18n";
import type { LessonWord } from "@/lib/types";

type Phase = "learn" | "quiz" | "done";
type Gloss = Pick<LessonWord, "id" | "bn" | "en">;

function Steps({ phase }: { phase: Phase }) {
  const { locale, t } = useLocale();
  const steps: [Phase, string][] = [
    ["learn", t.learn.step1],
    ["quiz", t.learn.step2],
    ["done", t.learn.step3],
  ];
  const idx = steps.findIndex(([p]) => p === phase);
  return (
    <ol className="flex items-center gap-2 text-sm font-semibold" aria-label="Steps">
      {steps.map(([p, label], i) => (
        <li key={p} className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              i <= idx ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted"
            }`}
            aria-current={i === idx ? "step" : undefined}
          >
            {num(locale, i + 1)}
          </span>
          <span className={i === idx ? "text-text" : "text-muted hidden sm:inline"}>{label}</span>
          {i < steps.length - 1 && <span className="w-4 h-0.5 bg-border" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

/**
 * Learn → quiz → result for a set of words. Used by frequency lessons and surah deck parts.
 * In the quiz, wrong answers go back into the queue until answered correctly (active recall);
 * first-try answers become the initial spaced-repetition grade.
 */
export function StudyFlow({
  title,
  back,
  words,
  distractorPool,
  alreadyDone,
  onComplete,
  doneMessage,
  next,
}: {
  title: string;
  back: { href: string; label: string };
  words: LessonWord[];
  /** extra meanings for wrong options when the set itself is small */
  distractorPool?: Gloss[];
  alreadyDone?: boolean;
  onComplete: (results: StudyResult[]) => void;
  doneMessage?: React.ReactNode;
  next?: { href: string; label: string };
}) {
  const { locale, t } = useLocale();
  const meaningText = useMeaningText();
  const [phase, setPhase] = useState<Phase>("learn");
  const [i, setI] = useState(0);
  const [queue, setQueue] = useState<LessonWord[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [firstTry, setFirstTry] = useState<Map<number, boolean>>(new Map());

  const current = words[i];
  useAutoplay(phase === "learn" ? exampleLocation(current.ex) : undefined);

  const startQuiz = () => {
    setQueue(shuffle(words));
    setQIndex(0);
    setFirstTry(new Map());
    setPhase("quiz");
    window.scrollTo({ top: 0 });
  };

  const q = queue[qIndex];
  const options = useMemo(() => {
    if (!q) return [];
    const text = (w: Gloss) => meaningText(w.bn, w.en);
    let distractors: Gloss[] = pickDistractors<Gloss>(q, words, text);
    if (distractors.length < 3 && distractorPool) {
      distractors = pickDistractors<Gloss>(q, [...distractors, ...distractorPool], text);
    }
    return shuffle<Gloss>([q, ...distractors]).map((w) => ({ key: w.id, label: text(w) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle only when the question changes
  }, [q, qIndex]);

  const onAnswer = useCallback(
    (correct: boolean) => {
      if (!q) return;
      const ft = new Map(firstTry);
      if (!ft.has(q.id)) ft.set(q.id, correct);
      setFirstTry(ft);
      const nextQueue = correct ? queue : [...queue, q];
      if (qIndex + 1 >= nextQueue.length) {
        onComplete(words.map((w) => ({ lemmaId: w.id, grade: (ft.get(w.id) ? Rating.Good : Rating.Again) as Grade })));
        setPhase("done");
        window.scrollTo({ top: 0 });
        celebrate();
      } else {
        setQueue(nextQueue);
        setQIndex(qIndex + 1);
      }
    },
    [q, queue, qIndex, firstTry, words, onComplete],
  );

  // Arrow keys move between cards in the learn phase.
  useEffect(() => {
    if (phase !== "learn") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const forward = (e.key === "ArrowRight") !== (document.dir === "rtl");
        setI((x) => Math.max(0, Math.min(words.length - 1, x + (forward ? 1 : -1))));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, words.length]);

  const header = (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <Link href={back.href} className="text-sm text-primary font-semibold inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {back.label}
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <Steps phase={phase} />
    </div>
  );

  if (phase === "learn") {
    return (
      <div className="max-w-2xl mx-auto">
        {header}
        {i === 0 && alreadyDone && (
          <p className="mb-4 rounded-2xl bg-primary-soft text-primary px-4 py-3 font-semibold">{t.learn.alreadyDone}</p>
        )}
        <div className="flex items-center gap-3 mb-4">
          <ProgressBar value={i + 1} max={words.length} className="flex-1" />
          <span className="text-sm font-semibold text-muted">
            {num(locale, i + 1)}/{num(locale, words.length)}
          </span>
        </div>
        <WordCard key={current.id} word={current} ex={current.ex} />
        <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => setI(i - 1)}
            disabled={i === 0}
            aria-label={t.common.prev}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          {i < words.length - 1 ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setI(i + 1)}>
              {t.learn.tapToContinue} <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={startQuiz}>
              {t.learn.startQuiz} <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "quiz" && q) {
    const remaining = queue.length - qIndex;
    return (
      <div className="max-w-2xl mx-auto">
        {header}
        <div className="flex items-center gap-3 mb-4">
          <ProgressBar value={firstTry.size} max={words.length} className="flex-1" />
          <span className="text-sm font-semibold text-muted">{t.review.left(num(locale, remaining))}</span>
        </div>
        <ChoiceQuestion
          key={`${q.id}-${qIndex}`}
          prompt={
            <>
              <p className="text-muted font-semibold">{t.learn.quizPrompt}</p>
              <p className="font-arabic ar-xl mt-2" lang="ar" dir="rtl">
                {q.ar}
              </p>
            </>
          }
          options={options}
          correctKey={q.id}
          onDone={onAnswer}
        />
      </div>
    );
  }

  const correctCount = [...firstTry.values()].filter(Boolean).length;
  return (
    <div className="max-w-2xl mx-auto">
      {header}
      <div className="card p-8 text-center animate-pop">
        <PartyPopper className="w-16 h-16 mx-auto text-accent" aria-hidden />
        <h2 className="text-3xl font-bold mt-3">{t.learn.lessonDone}</h2>
        <p className="text-xl mt-3">{t.learn.firstTry(num(locale, correctCount), num(locale, words.length))}</p>
        {doneMessage && <p className="mt-4 rounded-2xl bg-success-soft text-success font-semibold px-4 py-3">{doneMessage}</p>}
        <p className="mt-4 text-muted">{t.learn.addedToReview}</p>
        <div className="mt-6 grid gap-3">
          {next && (
            <Link href={next.href} className="btn btn-primary btn-lg">
              {next.label} <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
          )}
          <Link href={`/${locale}/review/`} className="btn btn-secondary btn-lg">
            <Repeat className="w-5 h-5" aria-hidden /> {t.learn.reviewNow}
          </Link>
          <Link href={back.href} className="btn btn-ghost">
            {back.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
