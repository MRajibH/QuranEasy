import { describe, expect, it } from "vitest";
import { GRAMMAR_LESSONS } from "./grammar-lessons";
import { findInQuran } from "./quran-index";

describe("grammar lessons", () => {
  const all = GRAMMAR_LESSONS.flatMap((l) => [
    ...l.examples.flatMap((g) => g.items.map((e) => [l.slug, e.ar] as const)),
    ...l.quiz.filter((q) => q.ar).map((q) => [l.slug, q.ar!] as const),
  ]);

  it.each(all)("%s: %s occurs in the Qur'an", (_slug, ar) => {
    expect(findInQuran(ar), ar).toBeDefined();
  });

  it("has unique slugs and complete translations", () => {
    expect(new Set(GRAMMAR_LESSONS.map((l) => l.slug)).size).toBe(GRAMMAR_LESSONS.length);
    for (const l of GRAMMAR_LESSONS) {
      expect(l.body.bn.length).toBe(l.body.en.length);
      for (const q of l.quiz) expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});
