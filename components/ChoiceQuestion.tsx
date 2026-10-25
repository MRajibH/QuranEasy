"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { num } from "@/lib/i18n";

export interface ChoiceOption {
  key: string | number;
  label: React.ReactNode;
  arabic?: boolean;
}

/**
 * One multiple-choice question with immediate feedback.
 * Correct answers auto-advance; wrong answers show the right one and wait for "Next",
 * giving the learner time to notice the correction.
 */
export function ChoiceQuestion({
  prompt,
  options,
  correctKey,
  onDone,
}: {
  prompt: React.ReactNode;
  options: ChoiceOption[];
  correctKey: string | number;
  onDone: (correct: boolean) => void;
}) {
  const { locale, t } = useLocale();
  const [picked, setPicked] = useState<string | number | null>(null);
  const answered = picked !== null;
  const correct = picked === correctKey;

  useEffect(() => {
    if (!answered || !correct) return;
    const id = setTimeout(() => onDone(true), 1100);
    return () => clearTimeout(id);
  }, [answered, correct, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const i = Number(e.key) - 1;
      if (!answered && i >= 0 && i < options.length) setPicked(options[i].key);
      else if (answered && !correct && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onDone(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, correct, options, onDone]);

  return (
    <div className="animate-pop">
      <div className="card p-6 md:p-8 text-center">{prompt}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2" role="group">
        {options.map((o, i) => {
          const isCorrect = o.key === correctKey;
          const isPicked = o.key === picked;
          let style = "border-border bg-surface hover:border-primary hover:-translate-y-0.5 shadow-[var(--shadow-sm)]";
          if (answered && isCorrect) style = `border-success bg-success-soft text-success ${isPicked ? "animate-bump" : ""}`;
          else if (answered && isPicked) style = "border-danger bg-danger-soft text-danger animate-shake";
          else if (answered) style = "border-border bg-surface opacity-60";
          return (
            <button
              key={o.key}
              type="button"
              disabled={answered}
              onClick={() => setPicked(o.key)}
              className={`min-h-16 rounded-2xl border-2 px-4 py-3 flex items-center gap-3 text-left font-semibold transition-all ${style}`}
            >
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface-2 text-muted text-sm flex items-center justify-center" aria-hidden>
                {answered && isCorrect ? <Check className="w-5 h-5 text-success" /> : answered && isPicked ? <X className="w-5 h-5 text-danger" /> : num(locale, i + 1)}
              </span>
              <span className={o.arabic ? "font-arabic ar-sm flex-1 text-right" : "flex-1 text-lg"} dir={o.arabic ? "rtl" : undefined} lang={o.arabic ? "ar" : undefined}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 min-h-14" aria-live="polite">
        {answered &&
          (correct ? (
            <p className="text-center text-xl font-bold text-success">{t.common.correct}</p>
          ) : (
            <button type="button" className="btn btn-primary btn-lg w-full" onClick={() => onDone(false)} autoFocus>
              {t.common.next} <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          ))}
      </div>
    </div>
  );
}
