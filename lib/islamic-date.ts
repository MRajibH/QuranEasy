import type { Locale } from "./types";

// Hijri (Umm al-Qura, adjustable for local moon sighting), Bangla (Bangabda, 2019 revision)
// and Arabic weekday names. Pure functions on calendar days, so they are easy to test.

export interface SimpleDate {
  y: number;
  m: number; // 1-12
  d: number;
}

export const HIJRI_MONTHS: Record<Locale | "ar", string[]> = {
  bn: ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানিয়া", "রজব", "শাবান", "রমযান", "শাওয়াল", "যিলকদ", "যিলহজ"],
  en: ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"],
  ar: ["مُحَرَّم", "صَفَر", "رَبِيع الأَوَّل", "رَبِيع الآخِر", "جُمَادَى الأُولَى", "جُمَادَى الآخِرَة", "رَجَب", "شَعْبَان", "رَمَضَان", "شَوَّال", "ذُو القَعْدَة", "ذُو الحِجَّة"],
};

export const ARABIC_WEEKDAYS = ["الأَحَد", "الإِثْنَيْن", "الثُّلَاثَاء", "الأَرْبِعَاء", "الخَمِيس", "الجُمُعَة", "السَّبْت"];

export const BANGLA_MONTHS = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];

/** Calendar day (y/m/d) of an instant in a time zone (device zone when tz is undefined). */
export function dayIn(date: Date, tz?: string): SimpleDate {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

const utcNoon = (s: SimpleDate) => new Date(Date.UTC(s.y, s.m - 1, s.d, 12));
export const addDaysSimple = (s: SimpleDate, n: number): SimpleDate => {
  const x = utcNoon(s);
  x.setUTCDate(x.getUTCDate() + n);
  return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate() };
};
export const weekday = (s: SimpleDate) => utcNoon(s).getUTCDay();

/** Hijri date for a calendar day; `adjust` shifts for local moon sighting (Bangladesh is often -1). */
export function hijri(s: SimpleDate, adjust = 0): SimpleDate {
  const shifted = utcNoon(addDaysSimple(s, adjust));
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
    timeZone: "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(shifted);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)!.value, 10);
  return { y: get("year"), m: get("month"), d: get("day") };
}

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/**
 * Bangla calendar as used officially in Bangladesh since 2019: year starts on 14 April;
 * Boishakh–Ashwin have 31 days, Falgun 29 (30 when it contains 29 February), others 30.
 */
export function bangla(s: SimpleDate): SimpleDate {
  const startYear = s.m > 4 || (s.m === 4 && s.d >= 14) ? s.y : s.y - 1;
  const start = Date.UTC(startYear, 3, 14);
  let days = Math.round((Date.UTC(s.y, s.m - 1, s.d) - start) / 86400000);
  const lengths = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, isLeap(startYear + 1) ? 30 : 29, 30];
  let m = 0;
  while (days >= lengths[m]) {
    days -= lengths[m];
    m++;
  }
  return { y: startYear - 593, m: m + 1, d: days + 1 };
}

export interface IslamicDay {
  key: string;
  bn: string;
  en: string;
}

/** Widely observed days, by Hijri month/day. */
const EVENTS: { m: number; d: number; ev: IslamicDay }[] = [
  { m: 1, d: 1, ev: { key: "newyear", bn: "হিজরি নববর্ষ", en: "Islamic New Year" } },
  { m: 1, d: 10, ev: { key: "ashura", bn: "আশুরা", en: "Day of Ashura" } },
  { m: 9, d: 1, ev: { key: "ramadan", bn: "রমযান শুরু", en: "Ramadan begins" } },
  { m: 9, d: 21, ev: { key: "lastten", bn: "রমযানের শেষ দশক শুরু (লাইলাতুল কদর অন্বেষণ)", en: "Last ten nights of Ramadan begin" } },
  { m: 10, d: 1, ev: { key: "fitr", bn: "ঈদুল ফিতর", en: "Eid al-Fitr" } },
  { m: 12, d: 9, ev: { key: "arafah", bn: "আরাফার দিন", en: "Day of Arafah" } },
  { m: 12, d: 10, ev: { key: "adha", bn: "ঈদুল আযহা", en: "Eid al-Adha" } },
];

/** Upcoming special days from `from` (inclusive), searching about a year ahead. */
export function upcomingIslamicDays(from: SimpleDate, adjust: number, limit = 6) {
  const out: { date: SimpleDate; hijri: SimpleDate; ev: IslamicDay }[] = [];
  for (let i = 0; i < 400 && out.length < limit; i++) {
    const date = addDaysSimple(from, i);
    const h = hijri(date, adjust);
    const hit = EVENTS.find((e) => e.m === h.m && e.d === h.d);
    if (hit) out.push({ date, hijri: h, ev: hit.ev });
  }
  return out;
}

/** Ayyam al-Beed: the 13th, 14th and 15th of every Hijri month (recommended fasts). */
export const isAyyamBeed = (h: SimpleDate) => h.d >= 13 && h.d <= 15;
