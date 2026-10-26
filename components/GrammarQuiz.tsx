"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ListChecks, RotateCcw } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { ProgressBar, shuffle } from "./ui";
import { completeGrammar, useCompletedGrammar } from "@/lib/progress";
import { celebrate } from "@/lib/confetti";
import { num } from "@/lib/i18n";

export interface QuizItem {
  prompt: string;
  ar?: string;
  /** options[0] is correct */
  options: string[];
}

/** Short end-of-lesson quiz; finishing it marks the grammar lesson done. */
export function GrammarQuiz({ slug, questions, next }: { slug: string; questions: QuizItem[]; next?: { href: string; label: string } }) {
  const { locale, t } = useLocale();
  const done = useCompletedGrammar();
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const finished = started && i >= questions.length;

  // Options are shuffled once per round; key 0 is always the correct answer.
  const shuffled = useMemo(
    () => questions.map((q) => shuffle(q.options.map((label, key) => ({ key, label })))),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle per round
    [questions, round],
  );

  const onDone = useCallback(
    (ok: boolean) => {
      const nextScore = score + (ok ? 1 : 0);
      setScore(nextScore);
      if (i + 1 >= questions.length) {
        completeGrammar(slug);
        if (nextScore / questions.length >= 0.6) celebrate();
      }
      setI(i + 1);
    },
    [i, score, questions.length, slug],
  );

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setScore(0);
    setStarted(true);
  };

  return (
    <section className="card p-6 grid gap-4" aria-labelledby="quiz">
      <h2 id="quiz" className="text-2xl font-bold flex items-center gap-2">
        <ListChecks className="w-7 h-7 text-primary" aria-hidden /> {t.grammar.quiz}
        {done?.has(slug) && <CheckCircle2 className="w-6 h-6 text-success" aria-label={t.grammar.done} />}
      </h2>
      {!started ? (
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setStarted(true)}>
          {t.grammar.quizStart} <ArrowRight className="w-5 h-5" aria-hidden />
        </button>
      ) : finished ? (
        <div className="text-center grid gap-3 animate-pop">
          <p className="text-2xl font-bold">{t.grammar.score(num(locale, score), num(locale, questions.length))}</p>
          <p className="text-success font-semibold">{t.grammar.done}</p>
          {next && (
            <Link href={next.href} className="btn btn-primary btn-lg">
              {t.grammar.next}: {next.label} <ArrowRight className="w-5 h-5" aria-hidden />
            </Link>
          )}
          <button type="button" className="btn btn-secondary" onClick={restart}>
            <RotateCcw className="w-5 h-5" aria-hidden /> {t.grammar.again}
          </button>
        </div>
      ) : (
        <>
          <ProgressBar value={i} max={questions.length} />
          <ChoiceQuestion
            key={`${round}-${i}`}
            prompt={
              <>
                <p className="text-muted font-semibold text-lg">{questions[i].prompt}</p>
                {questions[i].ar && (
                  <p className="font-arabic ar-xl mt-2" lang="ar" dir="rtl">{questions[i].ar}</p>
                )}
              </>
            }
            options={shuffled[i]}
            correctKey={0}
            onDone={onDone}
          />
        </>
      )}
    </section>
  );
}
