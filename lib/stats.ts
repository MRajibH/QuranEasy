/** Local calendar day key, e.g. "2026-10-26". */
export function dayKey(d: Date | number = new Date()) {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * Consecutive days with activity ending today — or yesterday, so a streak
 * isn't shown as broken before the user has had a chance to study today.
 */
export function streak(activeDays: Set<string>, today = new Date()) {
  let d = activeDays.has(dayKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (activeDays.has(dayKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Share of all Qur'an words covered by the given lemma frequencies, as a percentage. */
export function coveragePct(freqs: number[], totalWords: number) {
  const sum = freqs.reduce((s, f) => s + f, 0);
  return Math.round((sum / totalWords) * 1000) / 10;
}

/** Word-count milestones used to give the learner a near, motivating target. */
const MILESTONES = [10, 25, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 4806];
export const nextMilestone = (known: number) => MILESTONES.find((m) => m > known) ?? known;
