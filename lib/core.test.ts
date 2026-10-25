import { describe, expect, it } from "vitest";
import { formatInterval, isKnown, newCard, previewDue, Rating, schedule, State, type Grade } from "./srs";
import { addDays, coveragePct, dayKey, nextMilestone, streak } from "./stats";
import { buildIndex, normalizeArabic, normalizeLatin, search } from "./search";
import { pickDistractors } from "./quiz";
import { num, toBnDigits } from "./i18n";
import { LESSON_SIZE, TOTAL_LEMMAS, lemmaIdsOfLesson, lessonOfLemma } from "./constants";
import type { LemmaLite } from "./types";

describe("srs", () => {
  it("graduates a card after successful reviews and spaces it out", () => {
    let now = new Date("2026-01-01T08:00:00Z");
    let card = newCard(now);
    expect(card.state).toBe(State.New);
    card = schedule(card, Rating.Good as Grade, now);
    for (let i = 0; i < 4 && card.state !== State.Review; i++) {
      now = new Date(card.due);
      card = schedule(card, Rating.Good as Grade, now);
    }
    expect(isKnown(card)).toBe(true);
    const firstInterval = card.due.getTime() - now.getTime();
    now = new Date(card.due);
    card = schedule(card, Rating.Good as Grade, now);
    expect(card.due.getTime() - now.getTime()).toBeGreaterThan(firstInterval);
  });

  it("orders preview intervals Again < Hard <= Good < Easy", () => {
    const now = new Date("2026-01-01T08:00:00Z");
    const p = previewDue(schedule(newCard(now), Rating.Good as Grade, now), now);
    expect(p[Rating.Again as Grade].getTime()).toBeLessThan(p[Rating.Good as Grade].getTime());
    expect(p[Rating.Hard as Grade].getTime()).toBeLessThanOrEqual(p[Rating.Good as Grade].getTime());
    expect(p[Rating.Good as Grade].getTime()).toBeLessThan(p[Rating.Easy as Grade].getTime());
  });

  it("formats intervals", () => {
    const a = new Date(0);
    expect(formatInterval(a, new Date(10 * 60000), "en")).toBe("10m");
    expect(formatInterval(a, new Date(3 * 86400000), "en")).toBe("3d");
    expect(formatInterval(a, new Date(3 * 86400000), "bn")).toBe("3 দিন");
  });
});

describe("stats", () => {
  const today = new Date(2026, 9, 26, 12);
  const days = (offsets: number[]) => new Set(offsets.map((o) => dayKey(addDays(today, -o))));

  it("counts a streak ending today or yesterday", () => {
    expect(streak(days([0, 1, 2]), today)).toBe(3);
    expect(streak(days([1, 2]), today)).toBe(2);
    expect(streak(days([2, 3]), today)).toBe(0);
    expect(streak(new Set(), today)).toBe(0);
  });

  it("computes coverage and milestones", () => {
    expect(coveragePct([500, 250], 1000)).toBe(75);
    expect(nextMilestone(0)).toBe(10);
    expect(nextMilestone(10)).toBe(25);
  });
});

describe("search", () => {
  const lemmas: LemmaLite[] = [
    [1, "اللَّه", "আল্লাহ", "Allah", "l-lahi", 2699, "أ ل ه", "1:1:2"],
    [2, "رَحْمَة", "রহমত", "mercy", "raḥmat", 79, "ر ح م", "2:157:4"],
    [3, "رَحِيم", "অসীম দয়ালু", "the Most Merciful", "raḥīm", 115, "ر ح م", "1:1:4"],
  ];
  const index = buildIndex(lemmas);

  it("normalizes Arabic diacritics and letter variants", () => {
    expect(normalizeArabic("ٱلرَّحْمَٰنِ")).toBe("الرحمن");
    expect(normalizeLatin("Raḥmat")).toBe("rahmat");
  });

  it("finds by English, Bangla, transliteration, Arabic and root", () => {
    expect(search(index, "mercy")[0][0]).toBe(2);
    expect(search(index, "রহমত")[0][0]).toBe(2);
    expect(search(index, "rahim")[0][0]).toBe(3);
    expect(search(index, "الله")[0][0]).toBe(1);
    expect(search(index, "رحم").map((l) => l[0]).sort()).toEqual([2, 3]);
    expect(search(index, "")).toEqual([]);
  });
});

describe("quiz", () => {
  it("picks distinct distractors that differ from the answer", () => {
    const pool = ["from", "in", "in", "on", "from", "not"];
    const ds = pickDistractors("from", pool, (x) => x, 3);
    expect(ds).not.toContain("from");
    expect(new Set(ds).size).toBe(ds.length);
    expect(ds.length).toBe(3);
  });
});

describe("i18n + lessons", () => {
  it("renders Bangla digits", () => {
    expect(toBnDigits("2026")).toBe("২০২৬");
    expect(num("bn", 77429)).toBe("৭৭,৪২৯");
    expect(num("en", 77429)).toBe("77,429");
  });

  it("maps lemmas to lessons by frequency rank", () => {
    expect(lessonOfLemma(1)).toBe(1);
    expect(lessonOfLemma(LESSON_SIZE)).toBe(1);
    expect(lessonOfLemma(LESSON_SIZE + 1)).toBe(2);
    expect(lemmaIdsOfLesson(2)[0]).toBe(LESSON_SIZE + 1);
    const last = lessonOfLemma(TOTAL_LEMMAS);
    expect(lemmaIdsOfLesson(last).at(-1)).toBe(TOTAL_LEMMAS);
  });
});
