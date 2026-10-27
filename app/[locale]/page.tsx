import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, BookOpenText, Brain, Layers, Lightbulb, Repeat, Sparkles, Target } from "lucide-react";
import { TodayPanel } from "@/components/TodayPanel";
import { DailyRow } from "@/components/DailyRow";
import { ProgressSummary } from "@/components/ProgressSummary";
import { QuickActions } from "@/components/QuickActions";
import { HeroIllustration } from "@/components/HeroIllustration";
import { SalahStrip } from "@/components/salah/SalahStrip";
import { getDict } from "@/lib/i18n";
import { getVerse } from "@/lib/server-data";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: { canonical: `/${locale}/`, languages: { bn: "/bn/", en: "/en/" } } };
}

const FEATURE_ICONS = [BookOpen, Layers, Lightbulb, Brain];
const HOW_ICONS = [Target, Repeat, Brain, Layers];

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const ayah = getVerse("54:17");

  return (
    <div className="grid gap-8 md:gap-10">
      {/* Hero: always dark (the "dark" class re-themes everything inside), start card + illustration */}
      <SalahStrip />

      <section className="dark hero -mx-4 -mt-4 sm:mx-0 sm:mt-0 rounded-none sm:rounded-[2rem] px-4 py-6 sm:p-7 lg:p-10 grid gap-6 sm:gap-8 lg:grid-cols-[1.05fr_1fr] items-center">
        <div className="grid gap-5">
          <span className="justify-self-start inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-soft/60 text-accent px-3.5 py-1.5 text-sm font-semibold">
            <Sparkles className="w-4 h-4" aria-hidden /> {t.home.heroBadge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
            {t.home.heroTitle}
            <span className="block text-gold">{t.home.heroTitleGold}</span>
          </h1>
          <p className="text-white/80 md:text-lg max-w-xl">{t.home.heroText}</p>
          <TodayPanel />
        </div>

        <div className="relative hidden lg:block">
          <HeroIllustration className="w-full h-auto drop-shadow-2xl" />
        </div>

        <ul className="lg:col-span-2 hidden md:grid grid-cols-2 xl:grid-cols-4 gap-2 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-2">
          {t.home.features.map(([title, desc], i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <li key={title} className="flex items-center gap-3 rounded-2xl p-2.5">
                <span className="w-11 h-11 shrink-0 rounded-full border border-primary/40 bg-primary-soft text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-white leading-snug">{title}</span>
                  <span className="block text-sm text-white/65">{desc}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <DailyRow />

      <QuickActions locale={locale} />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <ProgressSummary />
        <section className="dark hero p-6 md:p-8 flex flex-col justify-center text-center" aria-label="Qur'an 54:17">
          <p className="font-arabic ar-md text-gold" lang="ar" dir="rtl">
            {ayah.w.map((w) => w[0]).join(" ")}
          </p>
          <p className="mt-3 text-white/85 text-lg" lang={locale}>
            “{locale === "bn" ? ayah.bn : ayah.en}”
          </p>
          <p className="text-sm text-white/55 mt-2">— {locale === "bn" ? "সূরা আল-ক্বামার (৫৪:১৭)" : "Surah Al-Qamar (54:17)"}</p>
          <span className="mx-auto mt-4 flex items-center gap-2 text-gold/70" aria-hidden>
            <span className="h-px w-12 bg-current" />◆<span className="h-px w-12 bg-current" />
          </span>
        </section>
      </div>

      <section id="how" aria-labelledby="how-title" className="scroll-mt-24">
        <h2 id="how-title" className="text-2xl md:text-3xl font-bold mb-4">{t.home.howTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {t.home.how.map(([title, text], i) => {
            const Icon = HOW_ICONS[i];
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

      <section className="dark hero p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
        <span className="w-16 h-16 shrink-0 rounded-2xl bg-accent-soft text-gold flex items-center justify-center">
          <BookOpenText className="w-9 h-9" aria-hidden />
        </span>
        <p className="flex-1 text-white/85 md:text-lg">{t.home.ctaText}</p>
        <Link href={`/${locale}/learn/`} className="btn btn-gold shrink-0">
          {t.home.ctaBtn} <ArrowRight className="w-5 h-5" aria-hidden />
        </Link>
      </section>

      <section className="text-center pb-2">
        <blockquote className="text-xl font-semibold max-w-2xl mx-auto">{t.home.hadith}</blockquote>
        <p className="text-muted mt-2">— {t.home.hadithRef}</p>
        <p className="mt-4 text-sm text-muted">{t.home.free}</p>
      </section>
    </div>
  );
}
