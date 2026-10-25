import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from "ts-fsrs";

export { Rating, State };
export type { Grade };

// 90% target retention; fuzz spreads reviews so they don't pile up on one day.
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: true, maximum_interval: 3650 });

export function newCard(now = new Date()): Card {
  return createEmptyCard(now);
}

export function schedule(card: Card, grade: Grade, now = new Date()): Card {
  return scheduler.next(card, now, grade).card;
}

/** Next due date for each grade, used to label the rating buttons. */
export function previewDue(card: Card, now = new Date()): Record<Grade, Date> {
  const p = scheduler.repeat(card, now);
  return {
    [Rating.Again]: p[Rating.Again].card.due,
    [Rating.Hard]: p[Rating.Hard].card.due,
    [Rating.Good]: p[Rating.Good].card.due,
    [Rating.Easy]: p[Rating.Easy].card.due,
  } as Record<Grade, Date>;
}

/** A word counts as "learned" once it has graduated to the Review state. */
export const isKnown = (card: Pick<Card, "state">) => card.state === State.Review;

/** Short human interval like "10m", "3d", "2mo" (localized by caller's digit mapping). */
export function formatInterval(from: Date, to: Date, locale: "bn" | "en"): string {
  const mins = Math.max(1, Math.round((to.getTime() - from.getTime()) / 60000));
  const units =
    locale === "bn"
      ? { m: " মিনিট", h: " ঘণ্টা", d: " দিন", mo: " মাস", y: " বছর" }
      : { m: "m", h: "h", d: "d", mo: "mo", y: "y" };
  if (mins < 60) return `${mins}${units.m}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}${units.h}`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}${units.d}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}${units.mo}`;
  return `${Math.round(days / 365)}${units.y}`;
}
