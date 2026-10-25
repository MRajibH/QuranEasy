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

class QuranEasyDB extends Dexie {
  cards!: EntityTable<CardRow, "id">;
  logs!: EntityTable<LogRow, "id">;
  lessons!: EntityTable<LessonRow, "id">;

  constructor() {
    super("quraneasy");
    this.version(1).stores({
      cards: "id, due, state",
      logs: "++id, day, lemmaId",
      lessons: "id",
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
  const [cards, logs, lessons] = await Promise.all([d.cards.toArray(), d.logs.toArray(), d.lessons.toArray()]);
  let settings: unknown = null;
  try {
    settings = JSON.parse(localStorage.getItem("qe-settings") ?? "null");
  } catch {}
  return { app: "quraneasy", version: BACKUP_VERSION, exported: new Date().toISOString(), cards, logs, lessons, settings };
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
  await d.transaction("rw", d.cards, d.logs, d.lessons, async () => {
    await Promise.all([d.cards.clear(), d.logs.clear(), d.lessons.clear()]);
    await d.cards.bulkPut(b.cards.map(reviveCard));
    await d.logs.bulkPut(b.logs);
    await d.lessons.bulkPut(b.lessons ?? []);
  });
  if (b.settings) localStorage.setItem("qe-settings", JSON.stringify(b.settings));
}

export async function resetAll() {
  const d = db();
  await Promise.all([d.cards.clear(), d.logs.clear(), d.lessons.clear()]);
}
