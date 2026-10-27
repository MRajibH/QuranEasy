import { num } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** "4:45" in the place's time zone, 12-hour, Bangla digits in the Bangla UI (the prayer name gives AM/PM). */
export function fmtTime(d: Date, locale: Locale, tz?: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(d);
  const h = parts.find((p) => p.type === "hour")!.value;
  const m = parts.find((p) => p.type === "minute")!.value;
  return num(locale, `${h}:${m}`);
}

/** Hours and minutes until `to` (rounded up to the minute). */
export function untilParts(now: Date, to: Date) {
  const mins = Math.max(0, Math.ceil((to.getTime() - now.getTime()) / 60000));
  return { h: Math.floor(mins / 60), m: mins % 60 };
}

export const ARABIC_PRAYER: Record<string, string> = {
  fajr: "الفَجْر",
  sunrise: "الشُّرُوق",
  dhuhr: "الظُّهْر",
  jumuah: "الجُمُعَة",
  asr: "العَصْر",
  maghrib: "المَغْرِب",
  isha: "العِشَاء",
};
