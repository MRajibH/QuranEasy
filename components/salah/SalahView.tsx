"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarHeart, Clock, LocateFixed, MapPin, Moon, MoonStar, Sun, Sunrise, Sunset, CloudSun, ShieldAlert, Settings2, Sparkles } from "lucide-react";
import { useLocale } from "../LocaleProvider";
import { QiblaCard } from "./QiblaCard";
import { MonthTable } from "./MonthTable";
import { ARABIC_PRAYER, fmtTime, untilParts } from "./format";
import { locate, updateSalah, useNow, useSalahPrefs, type LocateState } from "@/lib/salah-store";
import { currentAndNext, dayTimes, DISTRICTS, DIVISIONS, METHODS, placeInfo, PRAYERS, qiblaBearing, type Method, type PrayerKey } from "@/lib/salah";
import { addDaysSimple, ARABIC_WEEKDAYS, bangla, BANGLA_MONTHS, dayIn, hijri, HIJRI_MONTHS, isAyyamBeed, upcomingIslamicDays, weekday } from "@/lib/islamic-date";
import { num } from "@/lib/i18n";

const ICONS: Record<PrayerKey, typeof Sun> = { fajr: MoonStar, sunrise: Sunrise, dhuhr: Sun, asr: CloudSun, maghrib: Sunset, isha: Moon };

export function SalahView() {
  const { locale, t } = useLocale();
  const prefs = useSalahPrefs();
  const now = useNow(1000);
  const [loc, setLoc] = useState<LocateState>("idle");
  const asked = useRef(false);

  // First visit: ask for the device location once; fall back to choosing a district.
  useEffect(() => {
    if (prefs.place || asked.current) return;
    asked.current = true;
    locate(setLoc);
  }, [prefs.place]);

  const info = placeInfo(prefs.place);
  const today = now ? dayIn(now, info.tz) : null;
  const times = useMemo(() => (today ? dayTimes(today, prefs) : null), [today?.y, today?.m, today?.d, prefs]); // eslint-disable-line react-hooks/exhaustive-deps
  const tomorrow = useMemo(() => (today ? dayTimes(addDaysSimple(today, 1), prefs) : null), [today?.y, today?.m, today?.d, prefs]); // eslint-disable-line react-hooks/exhaustive-deps
  const events = useMemo(() => (today ? upcomingIslamicDays(today, prefs.hijriAdjust, 6) : []), [today?.y, today?.m, today?.d, prefs.hijriAdjust]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!now || !today || !times || !tomorrow) return <div className="card skeleton h-96" aria-hidden />;

  const { current, next } = currentAndNext(now, times, tomorrow);
  const left = untilParts(now, next.at);
  const isFriday = weekday(today) === 5;
  const nameOf = (k: PrayerKey) => (k === "dhuhr" && isFriday ? t.salah.names.jumuah : t.salah.names[k]);
  const arOf = (k: PrayerKey) => (k === "dhuhr" && isFriday ? ARABIC_PRAYER.jumuah : ARABIC_PRAYER[k]);
  const h = hijri(today, prefs.hijriAdjust);
  const b = bangla(today);
  const placeLabel =
    prefs.place?.kind === "gps"
      ? info.district
        ? `${t.salah.myLocation} · ${t.salah.near(locale === "bn" ? info.district.bn : info.district.en)}`
        : t.salah.myLocation
      : locale === "bn"
        ? info.district!.bn
        : info.district!.en;
  const tf = (d: Date) => fmtTime(d, locale, info.tz);
  const addMin = (d: Date, m: number) => new Date(d.getTime() + m * 60000);

  return (
    <div className="grid gap-5 md:gap-6">
      {/* Hero: place, next prayer countdown, three calendars */}
      <section className="dark hero -mx-4 -mt-6 sm:mx-0 sm:mt-0 rounded-none sm:rounded-[2rem] px-4 py-6 sm:p-8 grid gap-6 lg:grid-cols-[1.1fr_1fr] items-center">
        <div>
          <button
            type="button"
            onClick={() => document.getElementById("salah-settings")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white"
          >
            <MapPin className="w-4 h-4 text-gold" aria-hidden /> {placeLabel}
            <span className="text-gold">· {t.salah.change}</span>
          </button>
          <p className="mt-5 text-white/70 font-semibold">{t.salah.next}</p>
          <p className="text-4xl sm:text-5xl font-bold text-white mt-1">
            {nameOf(next.key)} <span className="font-arabic text-gold text-3xl sm:text-4xl" lang="ar">{arOf(next.key)}</span>
          </p>
          <p className="text-2xl text-white/90 mt-1 tabular-nums">{tf(next.at)}</p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-soft text-accent px-4 py-1.5 font-semibold">
            <Clock className="w-4 h-4" aria-hidden /> {t.salah.left(num(locale, left.h), num(locale, left.m))}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 grid gap-3">
          <p className="text-sm font-semibold text-white/60">{t.salah.dates}</p>
          <div>
            <p className="text-2xl font-bold text-gold">
              {num(locale, h.d)} {HIJRI_MONTHS[locale][h.m - 1]} {num(locale, String(h.y))} {locale === "bn" ? "হিজরি" : "AH"}
            </p>
            <p className="font-arabic text-white/80 text-lg" lang="ar" dir="rtl">
              {ARABIC_WEEKDAYS[weekday(today)]} · {HIJRI_MONTHS.ar[h.m - 1]}
            </p>
          </div>
          <p className="text-white/85">
            <span className="text-white/55 text-sm">{t.salah.banglaCal}: </span>
            {num("bn", b.d)} {BANGLA_MONTHS[b.m - 1]} {num("bn", String(b.y))}
          </p>
          <p className="text-white/85">
            <span className="text-white/55 text-sm">{t.salah.english}: </span>
            {new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: info.tz }).format(now)}
          </p>
          {isAyyamBeed(h) && (
            <p className="text-sm text-gold inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" aria-hidden /> {t.salah.beed}
            </p>
          )}
        </div>
      </section>

      {!prefs.place && (
        <section className="card p-5 border-accent/40 bg-accent-soft/40">
          <h2 className="font-bold text-lg">{loc === "locating" ? t.salah.locating : t.salah.askTitle}</h2>
          <p className="text-muted mt-1">{loc === "denied" ? t.salah.denied : loc === "unavailable" ? t.salah.unavailable : t.salah.askText}</p>
          {loc !== "locating" && (
            <button type="button" className="btn btn-primary mt-3" onClick={() => locate(setLoc)}>
              <LocateFixed className="w-5 h-5" aria-hidden /> {t.salah.useLocation}
            </button>
          )}
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        {/* Today's prayers */}
        <section className="card p-3 sm:p-4" aria-label={t.salah.title}>
          <ul className="grid gap-1.5">
            {PRAYERS.map((k) => {
              const Icon = ICONS[k];
              const isNow = current === k && k !== "sunrise";
              const isNext = next.key === k && next.at === times[k];
              const passed = now >= times[k] && !isNow;
              return (
                <li
                  key={k}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${
                    isNow ? "bg-primary text-primary-fg shadow" : isNext ? "bg-accent-soft ring-2 ring-accent/50" : ""
                  } ${passed ? "opacity-60" : ""}`}
                >
                  <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${isNow ? "bg-white/20" : "bg-surface-2 text-primary"}`}>
                    <Icon className="w-6 h-6" aria-hidden />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold text-lg leading-tight">{nameOf(k)}</span>
                    <span className="block text-sm opacity-80">
                      {isNow ? t.salah.now : isNext ? t.salah.next : <span className="font-arabic" lang="ar">{arOf(k)}</span>}
                    </span>
                  </span>
                  <span className="text-xl font-bold tabular-nums">{tf(times[k])}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted px-3 pt-3">{t.salah.disclaimer}</p>
        </section>

        <div className="grid gap-5 content-start">
          {/* Sehri / Iftar / Tahajjud */}
          <section className="card p-5" aria-labelledby="extras">
            <h2 id="extras" className="font-bold text-lg mb-3">{t.salah.extras}</h2>
            <dl className="grid grid-cols-2 gap-3">
              {[
                [t.salah.sehri, tf(times.fajr)],
                [t.salah.iftar, tf(times.maghrib)],
                [t.salah.tahajjud, `${tf(times.lastThird)} – ${tf(tomorrow.fajr)}`],
              ].map(([label, value], i) => (
                <div key={label} className={`rounded-2xl bg-surface-2/60 p-3 ${i === 2 ? "col-span-2" : ""}`}>
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="text-xl font-bold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          {/* Forbidden times */}
          <section className="card p-5" aria-labelledby="forbidden">
            <h2 id="forbidden" className="font-bold text-lg mb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-danger" aria-hidden /> {t.salah.forbidden}
            </h2>
            <ul className="grid gap-2 text-sm">
              {[
                [t.salah.forbiddenItems.sunrise, `${tf(times.sunrise)} – ${tf(addMin(times.sunrise, 15))}`],
                [t.salah.forbiddenItems.zawal, `${tf(addMin(times.dhuhr, -8))} – ${tf(times.dhuhr)}`],
                [t.salah.forbiddenItems.sunset, `${tf(addMin(times.maghrib, -15))} – ${tf(times.maghrib)}`],
              ].map(([label, value]) => (
                <li key={label} className="flex justify-between gap-3 rounded-xl bg-danger-soft/50 px-3 py-2">
                  <span>{label}</span>
                  <span className="font-semibold tabular-nums whitespace-nowrap">{value}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-2">{t.salah.approx}</p>
          </section>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <QiblaCard bearing={qiblaBearing(info.lat, info.lng)} />
        {/* Upcoming Islamic days */}
        <section className="card p-5 md:p-6" aria-labelledby="upcoming">
          <h2 id="upcoming" className="text-xl font-bold flex items-center gap-2">
            <CalendarHeart className="w-6 h-6 text-primary" aria-hidden /> {t.salah.upcoming}
          </h2>
          <ul className="mt-4 grid gap-2">
            {events.map(({ date, hijri: eh, ev }) => {
              const diff = Math.round((Date.UTC(date.y, date.m - 1, date.d) - Date.UTC(today.y, today.m - 1, today.d)) / 86400000);
              return (
                <li key={`${ev.key}-${date.y}-${date.m}-${date.d}`} className="flex items-center gap-3 rounded-2xl bg-surface-2/60 px-3 py-2.5">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold">{locale === "bn" ? ev.bn : ev.en}</span>
                    <span className="block text-sm text-muted">
                      {num(locale, eh.d)} {HIJRI_MONTHS[locale][eh.m - 1]} ·{" "}
                      {new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long" }).format(new Date(date.y, date.m - 1, date.d))}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-primary-soft text-primary px-3 py-1 text-sm font-semibold">{t.salah.inDays(num(locale, diff))}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <MonthTable today={today} prefs={prefs} tz={info.tz} />

      {/* Location and calculation settings */}
      <section id="salah-settings" className="card p-5 md:p-6 grid gap-5 scroll-mt-24" aria-labelledby="salah-settings-title">
        <h2 id="salah-settings-title" className="text-xl font-bold flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-primary" aria-hidden /> {t.salah.settings}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-primary" onClick={() => locate(setLoc)} disabled={loc === "locating"}>
            <LocateFixed className="w-5 h-5" aria-hidden /> {loc === "locating" ? t.salah.locating : prefs.place?.kind === "gps" ? t.salah.updateLocation : t.salah.useLocation}
          </button>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-muted">{t.salah.orDistrict}</span>
            <select
              value={prefs.place?.kind === "district" ? prefs.place.id : ""}
              onChange={(e) => e.target.value && updateSalah({ place: { kind: "district", id: e.target.value } })}
              className="h-12 rounded-2xl border-2 border-border bg-surface px-3 font-semibold"
            >
              <option value="">—</option>
              {Object.entries(DIVISIONS).map(([div, name]) => (
                <optgroup key={div} label={locale === "bn" ? name.bn : name.en}>
                  {DISTRICTS.filter((d) => d.div === div).map((d) => (
                    <option key={d.id} value={d.id}>
                      {locale === "bn" ? d.bn : d.en}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>
        {(loc === "denied" || loc === "unavailable") && prefs.place && (
          <p className="text-sm text-danger">{loc === "denied" ? t.salah.denied : t.salah.unavailable}</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-muted">{t.salah.method}</span>
            <select
              value={prefs.method}
              onChange={(e) => updateSalah({ method: e.target.value as Method })}
              className="h-12 rounded-2xl border-2 border-border bg-surface px-3 font-semibold"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {t.salah.methods[m]}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="grid gap-1">
            <legend className="text-sm font-semibold text-muted mb-1">{t.salah.asr}</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["hanafi", "shafi"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={prefs.madhab === m}
                  onClick={() => updateSalah({ madhab: m })}
                  className={`btn px-2 ${prefs.madhab === m ? "btn-primary" : "btn-secondary"}`}
                >
                  {t.salah[m]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-muted">{t.salah.hijriAdjust}</legend>
          <p className="text-sm text-muted mb-2">{t.salah.hijriAdjustHint}</p>
          <div className="grid grid-cols-5 gap-2">
            {[-2, -1, 0, 1, 2].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={prefs.hijriAdjust === n}
                onClick={() => updateSalah({ hijriAdjust: n })}
                className={`btn px-1 ${prefs.hijriAdjust === n ? "btn-primary" : "btn-secondary"}`}
              >
                {n > 0 ? "+" : n < 0 ? "−" : ""}
                {num(locale, Math.abs(n))}
              </button>
            ))}
          </div>
        </fieldset>
      </section>
    </div>
  );
}
