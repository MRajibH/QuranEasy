export type Locale = "bn" | "en";

/** Compact lemma tuple from /data/lemmas-lite.json */
export type LemmaLite = [
  id: number,
  ar: string,
  bn: string,
  en: string,
  tr: string,
  freq: number,
  root: string,
  firstLoc: string,
];

export interface Lemma {
  id: number;
  ar: string;
  root: string;
  pos: string;
  freq: number;
  bn: string;
  en: string;
  tr: string;
}

export interface Example {
  ref: string;
  w: string[];
  hi: number;
  en: string;
  bn: string;
}

export interface LessonWord extends Lemma {
  ex: Example;
}

export interface Lesson {
  id: number;
  coverage: number;
  words: LessonWord[];
}

export interface LessonIndexItem {
  id: number;
  from: number;
  to: number;
  coverage: number;
}

export interface SurahInfo {
  n: number;
  ar: string;
  name: string;
  en: string;
  bn: string;
  verses: number;
  place: "makkah" | "madinah";
}

/** word tuple: [arabic, transliteration, english, bangla, lemmaId] */
export type VerseWord = [ar: string, tr: string, en: string, bn: string, lemmaId: number];

export interface Verse {
  n: number;
  en: string;
  bn: string;
  w: VerseWord[];
}
