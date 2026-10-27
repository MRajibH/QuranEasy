"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useLocale } from "../LocaleProvider";
import { fmtTime } from "./format";
import { dayTimes, PRAYERS, type SalahPrefs } from "@/lib/salah";
import { hijri, HIJRI_MONTHS, type SimpleDate } from "@/lib/islamic-date";
import { num } from "@/lib/i18n";

/** Prayer times for every day of the current month; today is highlighted. */
export function MonthTable({ today, prefs, tz }: { today: SimpleDate; prefs: SalahPrefs; tz?: string }) {
  const { locale, t } = useLocale();
  const rows = useMemo(() => {
    const days = new Date(Date.UTC(today.y, today.m, 0)).getUTCDate();
    return Array.from({ length: days }, (_, i) => {
      const day = { y: today.y, m: today.m, d: i + 1 };
      return { day, times: dayTimes(day, prefs), h: hijri(day, prefs.hijriAdjust) };
    });
  }, [today.y, today.m, prefs]);
  const monthName = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { month: "long", year: "numeric" }).format(new Date(today.y, today.m - 1, 1));

  return (
    <section className="card p-5 md:p-6" aria-labelledby="month">
      <h2 id="month" className="text-xl font-bold flex items-center gap-2">
        <CalendarDays className="w-6 h-6 text-primary" aria-hidden /> {t.salah.month} · {monthName}
      </h2>
      <div className="mt-4 overflow-x-auto -mx-2">
        <table className="w-full min-w-[34rem] text-sm text-center">
          <thead>
            <tr className="text-muted">
              <th className="py-2 px-2 text-left font-semibold">{t.salah.date}</th>
              {PRAYERS.map((p) => (
                <th key={p} className="py-2 px-1 font-semibold">{t.salah.names[p]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ day, times, h }) => {
              const isToday = day.d === today.d;
              return (
                <tr key={day.d} className={isToday ? "bg-primary-soft text-primary font-bold" : "border-t border-border"}>
                  <td className="py-2 px-2 text-left whitespace-nowrap">
                    {num(locale, day.d)}
                    <span className="block text-xs text-muted font-normal">
                      {num(locale, h.d)} {HIJRI_MONTHS[locale][h.m - 1]}
                    </span>
                  </td>
                  {PRAYERS.map((p) => (
                    <td key={p} className="py-2 px-1 tabular-nums">{fmtTime(times[p], locale, tz)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
