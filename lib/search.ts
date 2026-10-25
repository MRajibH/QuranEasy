import type { LemmaLite } from "./types";

// Arabic diacritics, Quranic annotation marks, tatweel; unify alef/ya/ta-marbuta forms.
const AR_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export function normalizeArabic(s: string) {
  return s
    .replace(AR_MARKS, "")
    .replace(/[آأإٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, "");
}

export function normalizeLatin(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ʿʾ'’`-]/g, "")
    .trim();
}

const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

export interface SearchIndexItem {
  lemma: LemmaLite;
  ar: string;
  root: string;
  text: string; // normalized bn + en + transliteration
}

export function buildIndex(lemmas: LemmaLite[]): SearchIndexItem[] {
  return lemmas.map((l) => ({
    lemma: l,
    ar: normalizeArabic(l[1]),
    root: normalizeArabic(l[6]),
    text: `${l[2]} | ${normalizeLatin(l[3])} | ${normalizeLatin(l[4])}`,
  }));
}

/** Ranked search: exact > prefix > contains; ties broken by frequency (ids are frequency ranks). */
export function search(index: SearchIndexItem[], query: string, limit = 50): LemmaLite[] {
  const q = query.trim();
  if (!q) return [];
  const scored: [number, LemmaLite][] = [];
  if (hasArabic(q)) {
    const nq = normalizeArabic(q);
    for (const it of index) {
      let s = 0;
      if (it.ar === nq) s = 100;
      else if (it.root === nq) s = 90;
      else if (it.ar.startsWith(nq)) s = 70;
      else if (it.ar.includes(nq)) s = 40;
      if (s) scored.push([s, it.lemma]);
    }
  } else {
    const nq = normalizeLatin(q);
    for (const it of index) {
      const parts = it.text.split(" | ");
      let s = 0;
      for (const p of parts) {
        const words = p.split(/[\s,;()/]+/);
        if (p === nq) s = Math.max(s, 100);
        else if (words.includes(nq)) s = Math.max(s, 80);
        else if (words.some((w) => w.startsWith(nq))) s = Math.max(s, 60);
        else if (p.includes(nq)) s = Math.max(s, 30);
      }
      if (s) scored.push([s, it.lemma]);
    }
  }
  return scored
    .sort((a, b) => b[0] - a[0] || a[1][0] - b[1][0])
    .slice(0, limit)
    .map(([, l]) => l);
}
