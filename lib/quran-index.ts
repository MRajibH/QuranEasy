import fs from "node:fs";
import path from "node:path";
import type { Verse } from "./types";

// Finds where a word occurs in the Qur'an, so hand-written grammar examples are shown in
// their real Uthmani spelling, with recitation audio, and are guaranteed to exist.
// Plain Node module (no "server-only") so unit tests can verify every example.

/** Vowelled key: keeps harakat, drops spelling-only differences (alif forms, hamza seats, Uthmani marks). */
export function vowelledKey(s: string) {
  return s
    .normalize("NFD")
    .replace(/ࣰ/g, "ً")
    .replace(/ࣱ/g, "ٌ")
    .replace(/ࣲ/g, "ٍ")
    .replace(/[ؐ-ؚـْٰٓۖ-ۭ]/g, "")
    .replace(/[ءآأإإٔٱ]/g, "")
    .replace(/ؤ/g, "و")
    .replace(/[ئى]/g, "ي")
    .trim();
}

/** Consonant skeleton: vowelled key without any harakat (looser fallback). */
export const skeletonKey = (s: string) => vowelledKey(s).replace(/[ً-ّ]/g, "");

export interface QuranWord {
  ar: string;
  loc: string;
  en: string;
  bn: string;
}

let index: { exact: Map<string, QuranWord>; loose: Map<string, QuranWord> } | null = null;

function build() {
  const exact = new Map<string, QuranWord>();
  const loose = new Map<string, QuranWord>();
  const dir = path.join(process.cwd(), "public/data/surah");
  for (let s = 1; s <= 114; s++) {
    const verses: Verse[] = JSON.parse(fs.readFileSync(path.join(dir, `${s}.json`), "utf8"));
    for (const v of verses) {
      v.w.forEach(([ar, , en, bn], i) => {
        const word = { ar, loc: `${s}:${v.n}:${i + 1}`, en, bn };
        const e = vowelledKey(ar);
        const l = skeletonKey(ar);
        if (!exact.has(e)) exact.set(e, word);
        if (!loose.has(l)) loose.set(l, word);
      });
    }
  }
  return { exact, loose };
}

/** First occurrence of the word in the Qur'an, or undefined if it never occurs. */
export function findInQuran(ar: string): QuranWord | undefined {
  index ??= build();
  return index.exact.get(vowelledKey(ar)) ?? index.loose.get(skeletonKey(ar));
}
