import type { Locale } from "./types";

/** Grammar summary computed per lemma by scripts/build-data.mjs */
export interface Grammar {
  kind: "noun" | "adj" | "verb" | "proper" | "pronoun" | "particle";
  sub?: "ACT_PCPL" | "PASS_PCPL" | "VN";
  vf?: number;
  gender?: "M" | "F";
  /** number → [most common form, occurrences] */
  num?: Partial<Record<"S" | "D" | "P", [string, number]>>;
  /** tense → [most common form, occurrences] */
  tense?: Partial<Record<"PERF" | "IMPF" | "IMPV", [string, number]>>;
}

// Bangla labels pair the everyday Bangla term with the Arabic grammar term taught in madrasas.
const L = {
  bn: {
    kind: { noun: "বিশেষ্য (ইসম)", adj: "বিশেষণ (সিফাত)", verb: "ক্রিয়া (ফে'ল)", proper: "নামবাচক বিশেষ্য", pronoun: "সর্বনাম (যমীর)", particle: "অব্যয় (হরফ)" },
    sub: { ACT_PCPL: "কর্তা-বাচক (ইসমে ফায়েল)", PASS_PCPL: "কর্ম-বাচক (ইসমে মাফউল)", VN: "ক্রিয়ার নাম (মাসদার)" },
    gender: { M: "পুংলিঙ্গ (মুযাক্কার)", F: "স্ত্রীলিঙ্গ (মুয়ান্নাস)" },
    num: { S: "একবচন (মুফরাদ)", D: "দ্বিবচন (তাসনিয়া)", P: "বহুবচন (জমা)" },
    tense: { PERF: "অতীত কাল (মাযী)", IMPF: "বর্তমান/ভবিষ্যৎ (মুযারে)", IMPV: "আদেশ (আমর)" },
    vf: (n: string) => `বাব/রূপ ${n}`,
  },
  en: {
    kind: { noun: "Noun (ism)", adj: "Adjective (ṣifa)", verb: "Verb (fiʿl)", proper: "Proper noun", pronoun: "Pronoun (ḍamīr)", particle: "Particle (ḥarf)" },
    sub: { ACT_PCPL: "Active participle (ism fāʿil)", PASS_PCPL: "Passive participle (ism mafʿūl)", VN: "Verbal noun (maṣdar)" },
    gender: { M: "Masculine (mudhakkar)", F: "Feminine (muʾannath)" },
    num: { S: "Singular (mufrad)", D: "Dual (muthannā)", P: "Plural (jamʿ)" },
    tense: { PERF: "Past (māḍī)", IMPF: "Present/Future (muḍāriʿ)", IMPV: "Command (amr)" },
    vf: (n: string) => `Verb form ${n}`,
  },
};

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function grammarLabels(locale: Locale) {
  return L[locale];
}

/** Short chips describing the word, Bangla first. */
export function grammarChips(g: Grammar, locale: Locale): string[] {
  const l = L[locale];
  const chips = [g.sub ? l.sub[g.sub] : l.kind[g.kind]];
  if (g.gender) chips.push(l.gender[g.gender]);
  if (g.vf && (g.kind === "verb" || g.sub)) chips.push(l.vf(ROMAN[g.vf] ?? String(g.vf)));
  return chips;
}
