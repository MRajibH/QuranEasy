"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloudDownload, Smartphone } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { PageTitle, ProgressBar } from "./ui";
import { updateSettings, useSettings, type Settings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import { TOTAL_LESSONS } from "@/lib/constants";

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="card p-5">
      <legend className="sr-only">{label}</legend>
      <p className="font-bold text-lg mb-3" aria-hidden>{label}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
        {options.map(([v, l]) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={`btn px-2 ${value === v ? "btn-primary" : "btn-secondary"}`}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="card p-5 flex items-center gap-4 cursor-pointer">
      <span className="flex-1 font-bold text-lg">{label}</span>
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        className="relative w-16 h-9 shrink-0 rounded-full bg-surface-2 border-2 border-border transition-colors peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-4 peer-focus-visible:ring-accent/50 after:absolute after:top-1 after:left-1 after:w-6 after:h-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-7"
        aria-hidden
      />
    </label>
  );
}

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

function OfflineDownload() {
  const { locale, t } = useLocale();
  const [pct, setPct] = useState<number | null>(null);
  const run = async () => {
    const urls = [
      "/data/lemmas-lite.json",
      "/data/surahs.json",
      ...Array.from({ length: TOTAL_LESSONS }, (_, i) => `/data/lessons/${i + 1}.json`),
      ...Array.from({ length: 114 }, (_, i) => `/data/surah/${i + 1}.json`),
      ...Array.from({ length: 114 }, (_, i) => `/${locale}/read/${i + 1}/`),
    ];
    let done = 0;
    setPct(0);
    const queue = [...urls];
    const worker = async () => {
      while (queue.length) {
        const u = queue.shift()!;
        await fetch(u).catch(() => {});
        setPct(Math.round((++done / urls.length) * 100));
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  };
  return (
    <section className="card p-5">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <CloudDownload className="w-6 h-6 text-primary" aria-hidden /> {t.settings.offline}
      </h2>
      <p className="text-muted mt-1">{t.settings.offlineText}</p>
      {pct === null ? (
        <button type="button" className="btn btn-primary mt-4" onClick={run}>
          {t.settings.download}
        </button>
      ) : pct < 100 ? (
        <div className="mt-4" role="status">
          <p className="font-semibold mb-2">{t.settings.downloading(num(locale, pct))}</p>
          <ProgressBar value={pct} max={100} />
        </div>
      ) : (
        <p className="mt-4 font-semibold text-success" role="status">{t.settings.downloaded}</p>
      )}
    </section>
  );
}

function InstallApp() {
  const { t } = useLocale();
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    setStandalone(matchMedia("(display-mode: standalone)").matches);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  if (standalone) return null;
  return (
    <section className="card p-5">
      <h2 className="font-bold text-lg flex items-center gap-2">
        <Smartphone className="w-6 h-6 text-primary" aria-hidden /> {t.settings.install}
      </h2>
      {evt ? (
        <button type="button" className="btn btn-primary mt-4" onClick={() => evt.prompt().then(() => setEvt(null))}>
          {t.settings.installBtn}
        </button>
      ) : (
        <p className="text-muted mt-1">{t.settings.installText}</p>
      )}
    </section>
  );
}

export function SettingsView() {
  const { locale, t } = useLocale();
  const s = useSettings();
  const path = usePathname();
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => updateSettings({ [k]: v } as Partial<Settings>);
  const sizes: [number, string][] = [
    [0.9, t.settings.small],
    [1, t.settings.normal],
    [1.15, t.settings.large],
    [1.3, t.settings.xlarge],
  ];
  const arSizes: [number, string][] = [
    [0.85, t.settings.small],
    [1, t.settings.normal],
    [1.2, t.settings.large],
    [1.45, t.settings.xlarge],
  ];
  return (
    <div className="max-w-2xl mx-auto">
      <PageTitle title={t.settings.title} />
      <div className="grid gap-4">
        <fieldset className="card p-5">
          <p className="font-bold text-lg mb-3">{t.settings.language}</p>
          <div className="grid grid-cols-2 gap-2">
            {(["bn", "en"] as const).map((l) => (
              <Link
                key={l}
                href={path.replace(/^\/(bn|en)/, `/${l}`)}
                className={`btn ${locale === l ? "btn-primary" : "btn-secondary"}`}
                aria-current={locale === l ? "true" : undefined}
              >
                {l === "bn" ? "বাংলা" : "English"}
              </Link>
            ))}
          </div>
        </fieldset>
        <Segmented
          label={t.settings.meaning}
          value={s.meaning}
          onChange={set("meaning")}
          options={[
            ["bn", t.settings.bangla],
            ["en", t.settings.english],
            ["both", t.settings.both],
          ]}
        />
        <Segmented
          label={t.settings.dailyGoal}
          value={s.dailyNew}
          onChange={set("dailyNew")}
          options={[5, 10, 20, 30].map((n) => [n, num(locale, n)] as [number, string])}
        />
        <Segmented label={t.settings.textSize} value={s.uiScale} onChange={set("uiScale")} options={sizes} />
        <div className="grid gap-2">
          <Segmented label={t.settings.arabicSize} value={s.arScale} onChange={set("arScale")} options={arSizes} />
          <p className="font-arabic ar-lg text-center card py-2" lang="ar" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
        <Segmented
          label={t.settings.theme}
          value={s.theme}
          onChange={set("theme")}
          options={[
            ["light", t.settings.light],
            ["dark", t.settings.dark],
            ["system", t.settings.system],
          ]}
        />
        <Toggle label={t.settings.showTranslit} checked={s.translit} onChange={set("translit")} />
        <Toggle label={t.settings.autoplay} checked={s.autoplay} onChange={set("autoplay")} />
        <OfflineDownload />
        <InstallApp />
      </div>
    </div>
  );
}
