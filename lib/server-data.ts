import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Lemma, SurahInfo, Verse } from "./types";
import { WORD_PAGE_MIN_FREQ } from "./constants";

// Build-time data access for static pages. Everything is read once and cached in memory.

export interface LemmaFull extends Lemma {
  refs: string[];
  forms: { ar: string; n: number; en: string; bn: string; tr: string }[];
}

const root = process.cwd();
let lemmas: LemmaFull[] | null = null;
let surahs: SurahInfo[] | null = null;
const surahCache = new Map<number, Verse[]>();

const readJson = <T,>(p: string): T => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

export function getLemmas(): LemmaFull[] {
  lemmas ??= readJson<LemmaFull[]>("data/lemmas.json");
  return lemmas;
}

export const getLemma = (id: number) => getLemmas()[id - 1];

export const wordPageIds = () => getLemmas().filter((l) => l.freq >= WORD_PAGE_MIN_FREQ).map((l) => l.id);

export function getSurahs(): SurahInfo[] {
  surahs ??= readJson<SurahInfo[]>("public/data/surahs.json");
  return surahs;
}

export function getSurah(n: number): Verse[] {
  let v = surahCache.get(n);
  if (!v) {
    v = readJson<Verse[]>(`public/data/surah/${n}.json`);
    surahCache.set(n, v);
  }
  return v;
}

export function getVerse(ref: string) {
  const [s, a] = ref.split(":").map(Number);
  return getSurah(s)[a - 1];
}
