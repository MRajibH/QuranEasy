"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Play } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { ProgressBar } from "./ui";
import { nextLessonId, useCompletedLessons } from "@/lib/progress";
import { num } from "@/lib/i18n";

export interface PathLesson {
  n: number;
  preview: string[];
  hint: string;
  coverage: number;
}

const STAGE = 10;

export function LessonPath({ lessons }: { lessons: PathLesson[] }) {
  const { locale, t } = useLocale();
  const done = useCompletedLessons();
  const next = nextLessonId(done, lessons.length);
  const currentStage = Math.ceil(next / STAGE);
  const [open, setOpen] = useState<Set<number>>(new Set([1]));
  const currentRef = useRef<HTMLAnchorElement>(null);

  const scrolled = useRef(false);
  useEffect(() => {
    if (!done) return;
    setOpen((o) => new Set([...o, currentStage]));
  }, [done, currentStage]);
  useEffect(() => {
    // Bring the current lesson into view once, for learners deep into the path.
    if (!done || scrolled.current || next <= STAGE) return;
    scrolled.current = true;
    requestAnimationFrame(() => currentRef.current?.scrollIntoView({ block: "center" }));
  });

  const stages: PathLesson[][] = [];
  for (let i = 0; i < lessons.length; i += STAGE) stages.push(lessons.slice(i, i + STAGE));

  return (
    <div className="grid gap-4">
      {done && done.size > 0 && (
        <div className="card p-5">
          <div className="flex justify-between font-semibold mb-2">
            <span>{t.progress.lessonsDone}</span>
            <span className="text-muted">
              {num(locale, done.size)} / {num(locale, lessons.length)}
            </span>
          </div>
          <ProgressBar value={done.size} max={lessons.length} />
        </div>
      )}
      {stages.map((stage, si) => {
        const s = si + 1;
        const isOpen = open.has(s);
        const doneInStage = stage.filter((l) => done?.has(l.n)).length;
        return (
          <section key={s} className="card overflow-hidden">
            <button
              type="button"
              onClick={() =>
                setOpen((o) => {
                  const n = new Set(o);
                  if (n.has(s)) n.delete(s);
                  else n.add(s);
                  return n;
                })
              }
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-2"
              aria-expanded={isOpen}
            >
              <span
                className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg ${
                  doneInStage === stage.length ? "bg-success text-white" : s === currentStage ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted"
                }`}
              >
                {doneInStage === stage.length ? <Check className="w-6 h-6" /> : num(locale, s)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-lg">
                  {t.learn.stage(num(locale, s))} · {t.learn.lessonsRange(num(locale, stage[0].n), num(locale, stage.at(-1)!.n))}
                </span>
                <span className="block text-muted text-sm">{t.learn.coverageUpTo(num(locale, stage.at(-1)!.coverage))}</span>
              </span>
              <span className="text-sm text-muted hidden sm:block">
                {num(locale, doneInStage)}/{num(locale, stage.length)}
              </span>
              <ChevronDown className={`w-6 h-6 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {isOpen && (
              <ol className="grid gap-2 p-3 pt-0 sm:grid-cols-2">
                {stage.map((l) => {
                  const isDone = done?.has(l.n);
                  const isCurrent = l.n === next && !isDone;
                  return (
                    <li key={l.n}>
                      <Link
                        ref={isCurrent ? currentRef : undefined}
                        href={`/${locale}/lesson/?n=${l.n}`}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
                          isCurrent ? "border-primary bg-primary-soft" : "border-transparent bg-surface-2/60 hover:border-border"
                        }`}
                      >
                        <span
                          className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center font-bold ${
                            isDone ? "bg-success text-white" : isCurrent ? "bg-primary text-primary-fg" : "bg-surface text-muted border border-border"
                          }`}
                        >
                          {isDone ? <Check className="w-5 h-5" /> : isCurrent ? <Play className="w-5 h-5" /> : num(locale, l.n)}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                            {t.common.lesson} {num(locale, l.n)}
                            {isCurrent && <span className="text-primary">· {t.learn.current}</span>}
                          </span>
                          <span className="block truncate text-sm">{l.hint}</span>
                        </span>
                        <span className="font-arabic ar-sm text-text shrink-0 max-w-[40%] truncate" lang="ar" dir="rtl">
                          {l.preview.join(" · ")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}
