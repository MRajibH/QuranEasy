import type { Metadata } from "next";
import { Brain, Layers, Repeat, Target } from "lucide-react";
import { TodayPanel } from "@/components/TodayPanel";
import { DailyCard } from "@/components/DailyWords";
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
      <section className="hero px-6 py-8 md:px-12 md:py-10 text-center">
        <p className="text-gold font-semibold tracking-wide">{t.home.welcome}</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-bold leading-tight text-white">{t.home.heroTitle}</h1>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{t.home.heroText}</p>
        <figure className="mt-6 max-w-2xl mx-auto">
          <p className="font-arabic ar-md text-gold" lang="ar" dir="rtl">
            {ayah.w.map((w) => w[0]).join(" ")}
          </p>
          <figcaption className="mt-2 text-white/75" lang={locale}>
            {locale === "bn" ? ayah.bn : ayah.en}
            <span className="block text-sm text-white/55 mt-1">
              {locale === "bn" ? "সূরা আল-ক্বামার ৫৪:১৭" : "Surah Al-Qamar 54:17"}
            </span>
          </figcaption>
        </figure>
        <dl className="mt-6 hidden sm:grid grid-cols-3 gap-2 max-w-lg mx-auto">
          {[
            [TOTAL_WORDS, t.home.statWords],
            [TOTAL_LEMMAS, t.home.statLemmas],
            [TOTAL_LESSONS, t.home.statLessons],
          ].map(([n, label]) => (
            <div key={label} className="rounded-2xl bg-white/8 border border-white/10 px-2 py-3">
              <dt className="sr-only">{label}</dt>
              <dd className="text-xl md:text-2xl font-bold text-white">{num(locale, n as number)}</dd>
              <dd className="text-xs md:text-sm text-white/65">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 -mt-4">
        <TodayPanel />
        <DailyCard />
      </div>

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

      <section className="text-center py-4">
        <blockquote className="text-xl font-semibold max-w-2xl mx-auto">{t.home.hadith}</blockquote>
        <p className="text-muted mt-2">— {t.home.hadithRef}</p>
        <p className="mt-6 text-sm text-muted">{t.home.free}</p>
      </section>
    </div>
  );
}
