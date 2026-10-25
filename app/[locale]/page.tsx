import type { Metadata } from "next";
import { Brain, Layers, Repeat, Target } from "lucide-react";
import { TodayPanel } from "@/components/TodayPanel";
import { getDict, num } from "@/lib/i18n";
import { getVerse } from "@/lib/server-data";
import { TOTAL_LEMMAS, TOTAL_LESSONS, TOTAL_WORDS } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: { canonical: `/${locale}/`, languages: { bn: "/bn/", en: "/en/" } } };
}

const ICONS = [Target, Repeat, Brain, Layers];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const ayah = getVerse("54:17");

  return (
    <div className="grid gap-10">
      <section className="text-center pt-2">
        <p className="text-accent font-semibold">{t.home.welcome}</p>
        <h1 className="mt-1 text-3xl md:text-5xl font-bold text-text leading-tight">{t.home.heroTitle}</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl mx-auto">{t.home.heroText}</p>
      </section>

      <TodayPanel />

      <section className="card p-6 md:p-8 text-center bg-surface-2/50" aria-label="Qur'an 54:17">
        <p className="font-arabic ar-md text-text" lang="ar" dir="rtl">
          {ayah.w.map((w) => w[0]).join(" ")}
        </p>
        <p className="mt-3 text-lg" lang={locale}>
          {locale === "bn" ? ayah.bn : ayah.en}
        </p>
        <p className="mt-1 text-sm text-muted">{locale === "bn" ? "সূরা আল-ক্বামার ৫৪:১৭" : "Surah Al-Qamar 54:17"}</p>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="text-2xl font-bold mb-4">{t.home.howTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {t.home.how.map(([title, text], i) => {
            const Icon = ICONS[i];
            return (
              <div key={title} className="card p-6 flex gap-4">
                <span className="shrink-0 w-12 h-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-muted mt-1">{text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 text-center">
        {[
          [TOTAL_WORDS, t.home.statWords],
          [TOTAL_LEMMAS, t.home.statLemmas],
          [TOTAL_LESSONS, t.home.statLessons],
        ].map(([n, label]) => (
          <div key={label} className="card p-4">
            <div className="text-2xl md:text-3xl font-bold text-primary">{num(locale, n as number)}</div>
            <div className="text-sm text-muted">{label}</div>
          </div>
        ))}
      </section>

      <section className="text-center py-4">
        <blockquote className="text-xl font-semibold max-w-2xl mx-auto">{t.home.hadith}</blockquote>
        <p className="text-muted mt-2">— {t.home.hadithRef}</p>
        <p className="mt-6 text-sm text-muted">{t.home.free}</p>
      </section>
    </div>
  );
}
