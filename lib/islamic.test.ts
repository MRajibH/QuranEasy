import { describe, expect, it } from "vitest";
import { addDaysSimple, bangla, hijri, upcomingIslamicDays } from "./islamic-date";
import { currentAndNext, dayTimes, DEFAULT_SALAH, DISTRICTS, qiblaBearing } from "./salah";

describe("Bangla calendar (2019 revision)", () => {
  it.each([
    [{ y: 2026, m: 4, d: 14 }, { y: 1433, m: 1, d: 1 }], // Pohela Boishakh
    [{ y: 2025, m: 12, d: 16 }, { y: 1432, m: 9, d: 1 }], // Victory Day = 1 Poush
    [{ y: 2026, m: 2, d: 21 }, { y: 1432, m: 11, d: 8 }], // Ekushey = 8 Falgun
    [{ y: 2026, m: 3, d: 26 }, { y: 1432, m: 12, d: 12 }], // Independence Day = 12 Choitro
    [{ y: 2026, m: 4, d: 13 }, { y: 1432, m: 12, d: 30 }], // last day of Choitro (30 days)
  ])("%o → %o", (g, b) => {
    expect(bangla(g)).toEqual(b);
  });
});

describe("Hijri", () => {
  it("uses Umm al-Qura with an adjustable offset", () => {
    const day = { y: 2026, m: 10, d: 27 };
    const h0 = hijri(day, 0);
    expect(h0.y).toBe(1448);
    const h1 = hijri(day, -1);
    expect(hijri(addDaysSimple(day, -1), 0)).toEqual(h1);
  });

  it("finds Eid and Ramadan within a year", () => {
    const evs = upcomingIslamicDays({ y: 2026, m: 10, d: 27 }, 0, 10).map((e) => e.ev.key);
    expect(evs).toContain("ramadan");
    expect(evs).toContain("fitr");
    expect(evs).toContain("adha");
  });
});

describe("Prayer times", () => {
  const today = { y: 2026, m: 10, d: 27 };
  const times = dayTimes(today, DEFAULT_SALAH);

  it("are in the right order for Dhaka", () => {
    const order = [times.fajr, times.sunrise, times.dhuhr, times.asr, times.maghrib, times.isha];
    for (let i = 1; i < order.length; i++) expect(order[i].getTime()).toBeGreaterThan(order[i - 1].getTime());
  });

  it("knows the current and next prayer", () => {
    const tomorrow = dayTimes(addDaysSimple(today, 1), DEFAULT_SALAH);
    const afterAsr = new Date(times.asr.getTime() + 60_000);
    expect(currentAndNext(afterAsr, times, tomorrow)).toMatchObject({ current: "asr", next: { key: "maghrib" } });
    const late = new Date(times.isha.getTime() + 60_000);
    expect(currentAndNext(late, times, tomorrow).next.key).toBe("fajr");
  });

  it("covers all 64 districts with plausible coordinates and points Qibla west", () => {
    expect(DISTRICTS).toHaveLength(64);
    expect(new Set(DISTRICTS.map((d) => d.id)).size).toBe(64);
    for (const d of DISTRICTS) {
      expect(d.lat).toBeGreaterThan(20.5);
      expect(d.lat).toBeLessThan(26.7);
      expect(d.lng).toBeGreaterThan(88);
      expect(d.lng).toBeLessThan(92.7);
      const q = qiblaBearing(d.lat, d.lng);
      expect(q).toBeGreaterThan(270);
      expect(q).toBeLessThan(285);
    }
  });
});
