"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpenText, Ear, Languages, Puzzle, RotateCcw, Trophy, Type } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { AudioButton, Meaning, PageTitle, ProgressBar, Spinner, shuffle, useMeaningText } from "./ui";
import { db } from "@/lib/db";
import { loadLemmas, loadSurah } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import { skeletonOf } from "@/lib/search";
import { AyahWords } from "./AyahWords";
import { pickDistractors } from "@/lib/quiz";
import { playWord } from "@/lib/audio";
import { celebrate } from "@/lib/confetti";
import { num } from "@/lib/i18n";
import type { LemmaLite } from "@/lib/types";

type Game = "ayah" | "quiz" | "reverse" | "listen" | "match";
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
    { id: "ayah", title: t.practice.ayah, desc: t.practice.ayahDesc, Icon: BookOpenText },
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
      ) : game === "ayah" ? (
        <AyahGame key={round} learned={fromLearned ? new Set(pool.map((l) => l[0])) : null} onAgain={again} onExit={() => setGame(null)} />
      ) : (
        <QuizGame key={`${game}-${round}`} game={game} pool={pool} all={all} onAgain={again} onExit={() => setGame(null)} />
      )}
    </div>
  );
}

function Score({ score, total, onAgain, onExit }: { score: number; total: number; onAgain: () => void; onExit: () => void }) {
  const { locale, t } = useLocale();
  useEffect(() => {
    if (total && score / total >= 0.7) celebrate();
  }, [score, total]);
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

// ---- Ayah game: fill the missing word in a short ayah (Al-Fatiha + Juz ʿAmma) ----

const AYAH_SURAHS = [1, ...Array.from({ length: 37 }, (_, i) => 78 + i)];
const AYAH_ROUND = 8;

interface AyahQuestion {
  ref: string;
  words: string[];
  blank: number;
  bn: string;
  en: string;
  options: { key: number; label: string; arabic: boolean }[];
}

async function buildAyahQuestions(learned: Set<number> | null): Promise<AyahQuestion[]> {
  const surahs = await Promise.all(AYAH_SURAHS.map((n) => loadSurah(n).then((v) => ({ n, v }))));
  const ayat = surahs.flatMap(({ n, v }) => v.filter((a) => a.w.length >= 3 && a.w.length <= 14).map((a) => ({ n, a })));
  const allWords = ayat.flatMap(({ a }) => a.w.map((w) => w[0]));
  const out: AyahQuestion[] = [];
  for (const { n, a } of shuffle(ayat)) {
    // Blank a word the learner has studied (or, for beginners, one of the 300 most frequent words).
    const candidates = a.w.map((w, i) => ({ w, i })).filter(({ w }) => (learned ? learned.has(w[4]) : w[4] <= 300));
    if (!candidates.length) continue;
    const { w, i } = candidates[Math.floor(Math.random() * candidates.length)];
    const seen = new Set([skeletonOf(w[0])]);
    const distractors: string[] = [];
    for (const d of shuffle(allWords)) {
      const k = skeletonOf(d);
      if (seen.has(k)) continue;
      seen.add(k);
      distractors.push(d);
      if (distractors.length === 3) break;
    }
    const options = shuffle([w[0], ...distractors]).map((label, key) => ({ key: label === w[0] ? -1 : key, label, arabic: true }));
    out.push({ ref: `${n}:${a.n}`, words: a.w.map((x) => x[0]), blank: i, bn: a.bn, en: a.en, options });
    if (out.length === AYAH_ROUND) break;
  }
  return out;
}

function AyahGame({ learned, onAgain, onExit }: { learned: Set<number> | null; onAgain: () => void; onExit: () => void }) {
  const { locale, t } = useLocale();
  const { meaning } = useSettings();
  const meaningLang = meaning === "both" ? locale : meaning;
  const [qs, setQs] = useState<AyahQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<AyahQuestion | null>(null);

  useEffect(() => {
    buildAyahQuestions(learned).then(setQs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one set of questions per round
  }, []);

  const onDone = useCallback(
    (ok: boolean) => {
      if (ok) setScore((s) => s + 1);
      setAnswered(qs![i]);
    },
    [qs, i],
  );

  if (!qs) return <Spinner />;
  if (i >= qs.length) return <Score score={score} total={qs.length} onAgain={onAgain} onExit={onExit} />;

  // After answering: show the complete ayah (every word tappable) before moving on.
  if (answered) {
    const [s, a] = answered.ref.split(":");
    return (
      <div className="card p-6 text-center animate-pop">
        <AyahWords verseRef={answered.ref} words={answered.words} hi={answered.blank} className="ar-lg" />
        <p className="mt-3 text-lg">{meaningLang === "bn" ? answered.bn : answered.en}</p>
        <p className="text-sm text-muted mt-1">{t.common.surah} {num(locale, s)}:{num(locale, a)}</p>
        <button type="button" className="btn btn-primary btn-lg w-full mt-5" onClick={() => { setAnswered(null); setI(i + 1); }} autoFocus>
          {t.common.next}
        </button>
      </div>
    );
  }

  const q = qs[i];
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <ProgressBar value={i} max={qs.length} className="flex-1" />
        <span className="text-sm font-semibold text-muted">{num(locale, i + 1)}/{num(locale, qs.length)}</span>
      </div>
      <ChoiceQuestion
        key={i}
        prompt={
          <>
            <p className="text-muted font-semibold">{t.practice.ayahPrompt}</p>
            <p className="font-arabic ar-lg mt-2" lang="ar" dir="rtl">
              {q.words.map((w, k) => (
                <span key={k}>
                  {k === q.blank ? <span className="inline-block min-w-16 border-b-4 border-accent mx-1 align-bottom">&nbsp;</span> : w}{" "}
                </span>
              ))}
            </p>
            <p className="mt-3 text-muted">{meaningLang === "bn" ? q.bn : q.en}</p>
          </>
        }
        options={q.options}
        correctKey={-1}
        onDone={onDone}
      />
    </>
  );
}
