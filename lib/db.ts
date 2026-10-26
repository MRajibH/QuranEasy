"use client";

import Dexie, { type EntityTable } from "dexie";
import type { Card } from "ts-fsrs";

/** One spaced-repetition card per lemma the user has started learning. */
export interface CardRow extends Card {
  id: number; // lemma id
  added: number; // ms timestamp
}

export interface LogRow {
  id?: number;
  lemmaId: number;
  rating: number; // 1 Again … 4 Easy
  ts: number;
  day: string; // local YYYY-MM-DD
  kind: "learn" | "review";
}

export interface LessonRow {
  id: number;
  done: number;
}

/** A finished part of a surah deck, id "deckId:part" (e.g. "s1:1", "juz30:4"). */
export interface PartRow {
  id: string;
  deck: string;
  done: number;
}

/** A finished grammar mini-lesson, keyed by slug. */
export interface GrammarRow {
  id: string;
  done: number;
}

class QuranEasyDB extends Dexie {
  cards!: EntityTable<CardRow, "id">;
  logs!: EntityTable<LogRow, "id">;
  lessons!: EntityTable<LessonRow, "id">;
  parts!: EntityTable<PartRow, "id">;
  grammar!: EntityTable<GrammarRow, "id">;

  constructor() {
    super("quraneasy");
    this.version(1).stores({
      cards: "id, due, state",
      logs: "++id, day, lemmaId",
      lessons: "id",
    });
    this.version(2).stores({
      parts: "id, deck",
      grammar: "id",
    });
  }
}

let instance: QuranEasyDB | null = null;
export function db() {
  if (!instance) instance = new QuranEasyDB();
  return instance;
}

export const BACKUP_VERSION = 1;

export async function exportBackup() {
  const d = db();
  const [cards, logs, lessons, parts, grammar] = await Promise.all([
    d.cards.toArray(),
    d.logs.toArray(),
    d.lessons.toArray(),
    d.parts.toArray(),
    d.grammar.toArray(),
  ]);
  let settings: unknown = null;
  try {
    settings = JSON.parse(localStorage.getItem("qe-settings") ?? "null");
  } catch {}
  return { app: "quraneasy", version: BACKUP_VERSION, exported: new Date().toISOString(), cards, logs, lessons, parts, grammar, settings };
}

const reviveCard = (c: CardRow): CardRow => ({
  ...c,
  due: new Date(c.due),
  last_review: c.last_review ? new Date(c.last_review) : undefined,
});

export async function importBackup(data: unknown) {
  const b = data as Awaited<ReturnType<typeof exportBackup>>;
  if (!b || b.app !== "quraneasy" || !Array.isArray(b.cards) || !Array.isArray(b.logs)) {
    throw new Error("invalid backup");
  }
  const d = db();
  await d.transaction("rw", [d.cards, d.logs, d.lessons, d.parts, d.grammar], async () => {
    await Promise.all([d.cards.clear(), d.logs.clear(), d.lessons.clear(), d.parts.clear(), d.grammar.clear()]);
    await d.cards.bulkPut(b.cards.map(reviveCard));
    await d.logs.bulkPut(b.logs);
    await d.lessons.bulkPut(b.lessons ?? []);
    await d.parts.bulkPut(b.parts ?? []);
    await d.grammar.bulkPut(b.grammar ?? []);
  });
  if (b.settings) localStorage.setItem("qe-settings", JSON.stringify(b.settings));
}

export async function resetAll() {
  const d = db();
  await Promise.all([d.cards.clear(), d.logs.clear(), d.lessons.clear(), d.parts.clear(), d.grammar.clear()]);
}
