"use client";

import type { LemmaLite, Lesson, SurahInfo, Verse } from "./types";

// Client-side loaders for the static JSON in /public/data, memoized per session.
// The service worker caches these responses for offline use.
const memo = new Map<string, Promise<unknown>>();

function load<T>(url: string): Promise<T> {
  let p = memo.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return r.json() as Promise<T>;
    });
    p.catch(() => memo.delete(url));
    memo.set(url, p);
  }
  return p;
}

export const loadLemmas = () => load<LemmaLite[]>("/data/lemmas-lite.json");
export const loadLesson = (n: number) => load<Lesson>(`/data/lessons/${n}.json`);
export const loadSurahs = () => load<SurahInfo[]>("/data/surahs.json");
export const loadSurah = (n: number) => load<Verse[]>(`/data/surah/${n}.json`);

let byId: Promise<Map<number, LemmaLite>> | null = null;
export function loadLemmaMap() {
  byId ??= loadLemmas().then((ls) => new Map(ls.map((l) => [l[0], l])));
  return byId;
}
