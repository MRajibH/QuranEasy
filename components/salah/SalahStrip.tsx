"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Clock, MapPin } from "lucide-react";
import { useLocale } from "../LocaleProvider";
import { fmtTime, untilParts } from "./format";
import { useNow, useSalahPrefs } from "@/lib/salah-store";
import { currentAndNext, dayTimes, placeInfo } from "@/lib/salah";
import { addDaysSimple, dayIn, hijri, HIJRI_MONTHS, weekday } from "@/lib/islamic-date";
import { num } from "@/lib/i18n";

/** One-glance bar on the home page: Hijri date, next prayer and time left. */
export function SalahStrip() {
  const { locale, t } = useLocale();
  const prefs = useSalahPrefs();
  const now = useNow(30_000);
  const info = placeInfo(prefs.place);
  const today = now ? dayIn(now, info.tz) : null;
  const data = useMemo(() => {
    if (!today || !now || !prefs.place) return null;
    const times = dayTimes(today, prefs);
    const { next } = currentAndNext(now, times, dayTimes(addDaysSimple(today, 1), prefs));
    return { next, h: hijri(today, prefs.hijriAdjust), friday: weekday(today) === 5 };
  }, [now, prefs, today?.d]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = "card px-4 py-3 flex items-center gap-3 hover:border-primary";
  if (!now) return <div className="card h-[4.25rem] skeleton" aria-hidden />;
  if (!data) {
    return (
      <Link href={`/${locale}/salah/`} className={cls}>
        <span className="w-10 h-10 shrink-0 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
          <MapPin className="w-5 h-5" aria-hidden />
        </span>
        <span className="flex-1 font-semibold">{t.salah.setLocation}</span>
        <ChevronRight className="w-5 h-5 text-muted" aria-hidden />
      </Link>
    );
  }
  const { next, h, friday } = data;
  const left = untilParts(now, next.at);
  const name = next.key === "dhuhr" && friday ? t.salah.names.jumuah : t.salah.names[next.key];
  return (
    <Link href={`/${locale}/salah/`} className={cls} aria-label={t.nav.salah}>
      <span className="w-10 h-10 shrink-0 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
        <Clock className="w-5 h-5" aria-hidden />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-bold leading-tight truncate">
          {name} · <span className="tabular-nums">{fmtTime(next.at, locale, info.tz)}</span>
          <span className="font-normal text-muted"> · {t.salah.left(num(locale, left.h), num(locale, left.m))}</span>
        </span>
        <span className="block text-sm text-accent truncate">
          {num(locale, h.d)} {HIJRI_MONTHS[locale][h.m - 1]} {num(locale, String(h.y))}
        </span>
      </span>
      <ChevronRight className="w-5 h-5 text-muted shrink-0" aria-hidden />
    </Link>
  );
}
