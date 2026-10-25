"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type CardRow } from "./db";
import { newCard, schedule, State, type Grade } from "./srs";
import { dayKey } from "./stats";

/** Saves the result of a finished lesson: creates a card per word graded by the quiz. */
export async function completeLesson(lessonId: number, results: { lemmaId: number; grade: Grade }[]) {
  const d = db();
  const now = new Date();
  await d.transaction("rw", d.cards, d.logs, d.lessons, async () => {
    for (const { lemmaId, grade } of results) {
      if (await d.cards.get(lemmaId)) continue; // already learning (e.g. added from reader)
      const card = schedule(newCard(now), grade, now);
      await d.cards.put({ ...card, id: lemmaId, added: now.getTime() });
      await d.logs.add({ lemmaId, rating: grade, ts: now.getTime(), day: dayKey(now), kind: "learn" });
    }
    await d.lessons.put({ id: lessonId, done: now.getTime() });
  });
}

export async function reviewCard(row: CardRow, grade: Grade) {
  const d = db();
  const now = new Date();
  const { id, added, ...card } = row;
  const next = schedule(card, grade, now);
  const updated: CardRow = { ...next, id, added };
  await d.cards.put(updated);
  await d.logs.add({ lemmaId: id, rating: grade, ts: now.getTime(), day: dayKey(now), kind: "review" });
  return updated;
}

/** Adds a single word (e.g. tapped in the reader) as a new card that is due right away. */
export async function addToReview(lemmaId: number) {
  const d = db();
  if (await d.cards.get(lemmaId)) return;
  await d.cards.put({ ...newCard(), id: lemmaId, added: Date.now() });
}

export type CardStatus = "known" | "learning";

/** Live map of lemmaId → status for every word the user has started. */
export function useCardStatus(): Map<number, CardStatus> | undefined {
  return useLiveQuery(async () => {
    const m = new Map<number, CardStatus>();
    await db()
      .cards.toCollection()
      .each((c) => m.set(c.id, c.state === State.Review ? "known" : "learning"));
    return m;
  }, []);
}

export function useCard(lemmaId: number) {
  return useLiveQuery(() => db().cards.get(lemmaId), [lemmaId]);
}

/**
 * Cards due within this window count as due now (like Anki's learn-ahead limit), so words
 * from a just-finished lesson can be reviewed right away instead of "come back in 1 minute".
 */
export const LEARN_AHEAD_MS = 20 * 60 * 1000;
export const dueCutoff = () => new Date(Date.now() + LEARN_AHEAD_MS);

export function useDueCount() {
  return useLiveQuery(() => db().cards.where("due").belowOrEqual(dueCutoff()).count(), []);
}

export function useCompletedLessons() {
  return useLiveQuery(async () => new Set((await db().lessons.toArray()).map((l) => l.id)), []);
}

/** First lesson not yet completed. */
export function nextLessonId(done: Set<number> | undefined, total: number) {
  if (!done) return 1;
  for (let i = 1; i <= total; i++) if (!done.has(i)) return i;
  return total;
}

export function useTodayNewCount() {
  return useLiveQuery(() => db().logs.where("day").equals(dayKey()).filter((l) => l.kind === "learn").count(), []);
}
