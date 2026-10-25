"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Ear, Languages, Puzzle, RotateCcw, Trophy, Type } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { AudioButton, Meaning, PageTitle, ProgressBar, Spinner, shuffle, useMeaningText } from "./ui";
import { db } from "@/lib/db";
import { loadLemmas } from "@/lib/data";
import { pickDistractors } from "@/lib/quiz";
import { playWord } from "@/lib/audio";
import { num } from "@/lib/i18n";
import type { LemmaLite } from "@/lib/types";

type Game = "quiz" | "reverse" | "listen" | "match";
const ROUND = 10;
const PAIRS = 6;

export function Practice() {
  const { t } = useLocale();
  const [pool, setPool] = useState<LemmaLite[] | null>(null);
  const [all, setAll] = useState<LemmaLite[]>([]);
  const [fromLearned, setFromLearned] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    (async () => {
      const lemmas = await loadLemmas();
      const ids = (await db().cards.toCollection().primaryKeys()) as number[];
      const learned = ids.map((id) => lemmas[id - 1]).filter(Boolean);
      const enough = learned.length >= 4;
      setFromLearned(enough);
      setPool(enough ? learned : lemmas.slice(0, 30));
      setAll(lemmas.slice(0, 600));
    })();
  }, []);

  if (!pool) return <Spinner />;

  const games: { id: Game; title: string; desc: string; Icon: typeof Type }[] = [
    { id: "quiz", title: t.practice.quiz, desc: t.practice.quizDesc, Icon: Type },
    { id: "reverse", title: t.practice.reverse, desc: t.practice.reverseDesc, Icon: Languages },
    { id: "listen", title: t.practice.listen, desc: t.practice.listenDesc, Icon: Ear },
    { id: "match", title: t.practice.match, desc: t.practice.matchDesc, Icon: Puzzle },
  ];

  if (!game) {
    return (
      <>
        <PageTitle title={t.practice.title} subtitle={t.practice.subtitle} />
        <p className="mb-4 rounded-2xl bg-primary-soft text-primary px-4 py-3 font-semibold">
          {fromLearned ? t.practice.fromLearned : t.practice.fromStart}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {games.map(({ id, title, desc, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setGame(id)}
              className="card p-6 text-left flex gap-4 items-center hover:border-primary transition-colors"
            >
              <span className="w-14 h-14 shrink-0 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                <Icon className="w-7 h-7" aria-hidden />
              </span>
              <span>
                <span className="block text-xl font-bold">{title}</span>
                <span className="block text-muted">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const back = (
    <button type="button" className="btn btn-ghost mb-3 -ml-3" onClick={() => setGame(null)}>
      <ArrowLeft className="w-5 h-5" aria-hidden /> {t.practice.chooseOther}
    </button>
  );
  const again = () => setRound((r) => r + 1);

  return (
    <div className="max-w-2xl mx-auto">
      {back}
      {game === "match" ? (
        <MatchGame key={round} pool={pool} onAgain={again} onExit={() => setGame(null)} />
      ) : (
        <QuizGame key={`${game}-${round}`} game={game} pool={pool} all={all} onAgain={again} onExit={() => setGame(null)} />
      )}
    </div>
  );
}

function Score({ score, total, onAgain, onExit }: { score: number; total: number; onAgain: () => void; onExit: () => void }) {
  const { locale, t } = useLocale();
  return (
    <div className="card p-10 text-center animate-pop">
      <Trophy className="w-16 h-16 mx-auto text-accent" aria-hidden />
      <p className="text-3xl font-bold mt-3">{t.practice.score(num(locale, score), num(locale, total))}</p>
      <div className="mt-6 grid gap-3">
        <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
          <RotateCcw className="w-5 h-5" aria-hidden /> {t.practice.playAgain}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExit}>
          {t.practice.chooseOther}
        </button>
      </div>
    </div>
  );
}

function QuizGame({
  game,
  pool,
  all,
  onAgain,
  onExit,
}: {
  game: Exclude<Game, "match">;
  pool: LemmaLite[];
  all: LemmaLite[];
  onAgain: () => void;
  onExit: () => void;
}) {
  const { locale, t } = useLocale();
  const meaningText = useMeaningText();
  const questions = useMemo(() => {
    const src = game === "listen" ? pool.filter((l) => l[7]) : pool;
    return shuffle(src).slice(0, ROUND);
  }, [game, pool]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const q = questions[i];
  const distractorPool = useMemo(() => [...pool, ...all], [pool, all]);
  const reverse = game === "reverse";
  const text = useCallback((l: LemmaLite) => (reverse ? l[1] : meaningText(l[2], l[3])), [reverse, meaningText]);

  const options = useMemo(() => {
    if (!q) return [];
    return shuffle([q, ...pickDistractors(q, distractorPool, text)]).map((l) => ({ key: l[0], label: text(l), arabic: reverse }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixed per question
  }, [q]);

  useEffect(() => {
    if (game === "listen" && q?.[7]) playWord(q[7]);
  }, [game, q]);

  const onDone = useCallback((ok: boolean) => {
    if (ok) setScore((s) => s + 1);
    setI((x) => x + 1);
  }, []);

  if (!q) return <Score score={score} total={questions.length} onAgain={onAgain} onExit={onExit} />;

  const prompt =
    game === "listen" ? (
      <>
        <p className="text-muted font-semibold mb-3">{t.practice.tapPlay}</p>
        <AudioButton location={q[7]} size="lg" label />
      </>
    ) : reverse ? (
      <>
        <p className="text-muted font-semibold">{t.practice.reverseDesc}</p>
        <Meaning bn={q[2]} en={q[3]} size="xl" className="mt-3" />
      </>
    ) : (
      <>
        <p className="text-muted font-semibold">{t.learn.quizPrompt}</p>
        <p className="font-arabic ar-xl mt-2" lang="ar" dir="rtl">{q[1]}</p>
      </>
    );

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <ProgressBar value={i} max={questions.length} className="flex-1" />
        <span className="text-sm font-semibold text-muted">
          {num(locale, i + 1)}/{num(locale, questions.length)}
        </span>
      </div>
      <ChoiceQuestion key={i} prompt={prompt} options={options} correctKey={q[0]} onDone={onDone} />
    </>
  );
}

function MatchGame({ pool, onAgain, onExit }: { pool: LemmaLite[]; onAgain: () => void; onExit: () => void }) {
  const { t } = useLocale();
  const meaningText = useMeaningText();
  const pairs = useMemo(() => {
    const seen = new Set<string>();
    const out: LemmaLite[] = [];
    for (const l of shuffle(pool)) {
      const k = meaningText(l[2], l[3]);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(l);
      if (out.length === PAIRS) break;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one board per round
  }, [pool]);
  const right = useMemo(() => shuffle(pairs), [pairs]);
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (selL === null || selR === null) return;
    if (selL === selR) {
      setMatched((m) => new Set([...m, selL]));
      setSelL(null);
      setSelR(null);
    } else {
      setWrong(true);
      setMistakes((x) => x + 1);
      const id = setTimeout(() => {
        setWrong(false);
        setSelL(null);
        setSelR(null);
      }, 700);
      return () => clearTimeout(id);
    }
  }, [selL, selR]);

  if (matched.size === pairs.length && pairs.length) {
    return <Score score={pairs.length} total={pairs.length + mistakes} onAgain={onAgain} onExit={onExit} />;
  }

  const tile = (active: boolean, done: boolean) =>
    `min-h-16 w-full rounded-2xl border-2 px-3 py-2 font-semibold transition-colors ${
      done
        ? "border-success bg-success-soft text-success opacity-50"
        : active
          ? wrong
            ? "border-danger bg-danger-soft"
            : "border-primary bg-primary-soft"
          : "border-border bg-surface hover:border-primary"
    }`;

  return (
    <>
      <p className="text-center text-muted font-semibold mb-4">{t.practice.matchDesc}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-3">
          {pairs.map((l) => (
            <button
              key={l[0]}
              type="button"
              disabled={matched.has(l[0])}
              onClick={() => setSelL(l[0])}
              className={`${tile(selL === l[0], matched.has(l[0]))} font-arabic ar-sm`}
              lang="ar"
              dir="rtl"
            >
              {l[1]}
            </button>
          ))}
        </div>
        <div className="grid gap-3">
          {right.map((l) => (
            <button
              key={l[0]}
              type="button"
              disabled={matched.has(l[0])}
              onClick={() => setSelR(l[0])}
              className={tile(selR === l[0], matched.has(l[0]))}
            >
              {meaningText(l[2], l[3])}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
