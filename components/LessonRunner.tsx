"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { StudyFlow } from "./StudyFlow";
import { LoadError, Spinner } from "./ui";
import { loadLesson } from "@/lib/data";
import { completeLesson, useCompletedLessons, type StudyResult } from "@/lib/progress";
import { num } from "@/lib/i18n";
import { TOTAL_LESSONS } from "@/lib/constants";
import type { Lesson } from "@/lib/types";

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

function LessonFlow({ lesson }: { lesson: Lesson }) {
  const { locale, t } = useLocale();
  const done = useCompletedLessons();
  const onComplete = useCallback((results: StudyResult[]) => completeLesson(lesson.id, results), [lesson.id]);
  return (
    <StudyFlow
      title={`${t.common.lesson} ${num(locale, lesson.id)}`}
      back={{ href: `/${locale}/learn/`, label: t.learn.title }}
      words={lesson.words}
      alreadyDone={done?.has(lesson.id)}
      onComplete={onComplete}
      doneMessage={t.learn.nowCoverage(num(locale, lesson.coverage))}
      next={lesson.id < TOTAL_LESSONS ? { href: `/${locale}/lesson/?n=${lesson.id + 1}`, label: t.learn.nextLesson } : undefined}
    />
  );
}
