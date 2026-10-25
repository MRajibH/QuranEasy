"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, PartyPopper, Repeat } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { WordCard, exampleLocation } from "./WordCard";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { LoadError, ProgressBar, Spinner, shuffle, useAutoplay, useMeaningText } from "./ui";
import { loadLesson } from "@/lib/data";
import { completeLesson, useCompletedLessons } from "@/lib/progress";
import { pickDistractors } from "@/lib/quiz";
import { Rating, type Grade } from "@/lib/srs";
import { num } from "@/lib/i18n";
import { TOTAL_LESSONS } from "@/lib/constants";
import type { Lesson, LessonWord } from "@/lib/types";

type Phase = "learn" | "quiz" | "done";

export function LessonRunner() {
  const params = useSearchParams();
  const n = Math.min(TOTAL_LESSONS, Math.max(1, Number(params.get("n")) || 1));
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setLesson(null);
    loadLesson(n).then(setLesson, () => setError(true));
  }, [n]);
  useEffect(load, [load]);

  if (error) return <LoadError onRetry={load} />;
  if (!lesson || lesson.id !== n) return <Spinner />;
  return <LessonFlow key={n} lesson={lesson} />;
}

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

function LessonFlow({ lesson }: { lesson: Lesson }) {
  const { locale, t } = useLocale();
  const done = useCompletedLessons();
  const meaningText = useMeaningText();
  const [phase, setPhase] = useState<Phase>("learn");
  const [i, setI] = useState(0);

  // Quiz: wrong answers go back into the queue until answered correctly (active recall).
  const [queue, setQueue] = useState<LessonWord[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [firstTry, setFirstTry] = useState<Map<number, boolean>>(new Map());

  const words = lesson.words;
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
    const distractors = pickDistractors(q, words, (w) => meaningText(w.bn, w.en));
    return shuffle([q, ...distractors]).map((w) => ({ key: w.id, label: meaningText(w.bn, w.en) }));
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
        completeLesson(
          lesson.id,
          words.map((w) => ({ lemmaId: w.id, grade: (ft.get(w.id) ? Rating.Good : Rating.Again) as Grade })),
        );
        setPhase("done");
        window.scrollTo({ top: 0 });
      } else {
        setQueue(nextQueue);
        setQIndex(qIndex + 1);
      }
    },
    [q, queue, qIndex, firstTry, lesson.id, words],
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
        <Link href={`/${locale}/learn/`} className="text-sm text-primary font-semibold inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t.learn.title}
        </Link>
        <h1 className="text-2xl font-bold">
          {t.common.lesson} {num(locale, lesson.id)}
        </h1>
      </div>
      <Steps phase={phase} />
    </div>
  );

  if (phase === "learn") {
    return (
      <div className="max-w-2xl mx-auto">
        {header}
        {i === 0 && done?.has(lesson.id) && (
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
  const hasNext = lesson.id < TOTAL_LESSONS;
  return (
    <div className="max-w-2xl mx-auto">
      {header}
      <div className="card p-8 text-center animate-pop">
        <PartyPopper className="w-16 h-16 mx-auto text-accent" aria-hidden />
        <h2 className="text-3xl font-bold mt-3">{t.learn.lessonDone}</h2>
        <p className="text-xl mt-3">{t.learn.firstTry(num(locale, correctCount), num(locale, words.length))}</p>
        <p className="mt-4 rounded-2xl bg-success-soft text-success font-semibold px-4 py-3">
          {t.learn.nowCoverage(num(locale, lesson.coverage))}
        </p>
        <p className="mt-4 text-muted">{t.learn.addedToReview}</p>
        <div className="mt-6 grid gap-3">
          {hasNext && (
            <Link href={`/${locale}/lesson/?n=${lesson.id + 1}`} className="btn btn-primary btn-lg">
              {t.learn.nextLesson} <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
          )}
          <Link href={`/${locale}/review/`} className="btn btn-secondary btn-lg">
            <Repeat className="w-5 h-5" aria-hidden /> {t.learn.reviewNow}
          </Link>
          <Link href={`/${locale}/`} className="btn btn-ghost">
            {t.common.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
