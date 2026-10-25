"use client";

import { db } from "./db";
import { loadDaily } from "./data";
import { dayKey } from "./stats";

export const DAILY_COUNT = 2;
const KEY = "qe-daily";
const HISTORY_KEY = "qe-daily-history";

interface DailyState {
  day: string;
  ids: number[];
}

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Today's words: the most frequent content words the learner hasn't started and hasn't
 * been shown before. Fixed for the whole day once chosen.
 */
export async function getDailyPicks(): Promise<number[]> {
  const today = dayKey();
  const saved = readJson<DailyState | null>(KEY, null);
  if (saved?.day === today && Array.isArray(saved.ids)) return saved.ids;

  const [list, started] = await Promise.all([loadDaily(), db().cards.toCollection().primaryKeys()]);
  const skip = new Set<number>([...(started as number[]), ...readJson<number[]>(HISTORY_KEY, [])]);
  const ids = list.filter((id) => !skip.has(id)).slice(0, DAILY_COUNT);
  try {
    localStorage.setItem(KEY, JSON.stringify({ day: today, ids }));
    localStorage.setItem(HISTORY_KEY, JSON.stringify([...readJson<number[]>(HISTORY_KEY, []), ...ids]));
  } catch {}
  return ids;
}
