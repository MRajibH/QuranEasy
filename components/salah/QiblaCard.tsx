"use client";

import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { useLocale } from "../LocaleProvider";
import { num } from "@/lib/i18n";

type OrientationEvt = DeviceOrientationEvent & { webkitCompassHeading?: number };

/** Qibla bearing with a dial; on phones with a compass the dial turns with the device. */
export function QiblaCard({ bearing }: { bearing: number }) {
  const { locale, t } = useLocale();
  const [heading, setHeading] = useState<number | null>(null);
  const [state, setState] = useState<"off" | "on" | "none">("off");

  useEffect(() => {
    if (state !== "on") return;
    const onOrient = (e: Event) => {
      const ev = e as OrientationEvt;
      const h = ev.webkitCompassHeading ?? (ev.absolute && ev.alpha != null ? 360 - ev.alpha : null);
      if (h != null) setHeading(h);
    };
    const type = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(type, onOrient);
    const noSignal = setTimeout(() => setHeading((h) => (h == null ? (setState("none"), null) : h)), 3000);
    return () => {
      window.removeEventListener(type, onOrient);
      clearTimeout(noSignal);
    };
  }, [state]);

  const start = async () => {
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (!DOE) return setState("none");
    if (DOE.requestPermission) {
      const r = await DOE.requestPermission().catch(() => "denied");
      if (r !== "granted") return setState("none");
    }
    setState("on");
  };

  // Rotate the whole dial so North follows the real North; the Kaaba mark sits at the Qibla bearing.
  const dial = heading == null ? 0 : -heading;
  const aligned = heading != null && Math.abs(((bearing - heading + 540) % 360) - 180) < 5;

  return (
    <section className="card p-5 md:p-6" aria-labelledby="qibla">
      <h2 id="qibla" className="text-xl font-bold flex items-center gap-2">
        <Compass className="w-6 h-6 text-primary" aria-hidden /> {t.salah.qibla}
      </h2>
      <p className="text-muted mt-1">{t.salah.qiblaText(num(locale, Math.round(bearing)))}</p>
      <div className="flex flex-col items-center gap-3 mt-4">
        <svg viewBox="0 0 200 200" className={`w-56 h-56 transition-transform duration-300 ${aligned ? "drop-shadow-[0_0_12px_var(--success)]" : ""}`} style={{ transform: `rotate(${dial}deg)` }} aria-hidden>
          <circle cx="100" cy="100" r="94" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="3" />
          {Array.from({ length: 36 }, (_, i) => (
            <line key={i} x1="100" y1="10" x2="100" y2={i % 9 === 0 ? 24 : 17} stroke="var(--muted)" strokeWidth={i % 9 === 0 ? 3 : 1.5} transform={`rotate(${i * 10} 100 100)`} />
          ))}
          <text x="100" y="40" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--danger)">N</text>
          <g transform={`rotate(${bearing} 100 100)`}>
            <line x1="100" y1="100" x2="100" y2="34" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
            <rect x="88" y="16" width="24" height="24" rx="3" fill="var(--text)" />
            <rect x="88" y="22" width="24" height="4" fill="var(--gold)" />
          </g>
          <circle cx="100" cy="100" r="7" fill="var(--primary)" />
        </svg>
        {state === "off" && (
          <button type="button" className="btn btn-secondary" onClick={start}>
            <Compass className="w-5 h-5" aria-hidden /> {t.salah.compass}
          </button>
        )}
        {state === "on" && <p className="text-sm text-muted text-center">{t.salah.compassHint}</p>}
        {state === "none" && <p className="text-sm text-muted text-center">{t.salah.noCompass}</p>}
      </div>
    </section>
  );
}
