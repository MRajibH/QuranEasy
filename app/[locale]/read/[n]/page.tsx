import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { SurahReader } from "@/components/SurahReader";
import { getDict, LOCALES, num } from "@/lib/i18n";
import { getSurah, getSurahs } from "@/lib/server-data";
import type { Locale } from "@/lib/types";

export const dynamicParams = false;
export const generateStaticParams = () =>
  LOCALES.flatMap((locale) => Array.from({ length: 114 }, (_, i) => ({ locale, n: String(i + 1) })));

type Params = Promise<{ locale: Locale; n: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, n } = await params;
  const s = getSurahs()[Number(n) - 1];
  if (!s) return {};
  const title =
    locale === "bn" ? `সূরা ${s.name} (${s.bn}) — শব্দে শব্দে অর্থ` : `Surah ${s.name} (${s.en}) — word by word`;
  const description =
    locale === "bn"
      ? `সূরা ${s.name} এর প্রতিটি আরবি শব্দের বাংলা ও ইংরেজি অর্থ, উচ্চারণ ও তিলাওয়াত। ${num("bn", s.verses)} আয়াত।`
      : `Every Arabic word of Surah ${s.name} with English and Bangla meaning, pronunciation and recitation. ${s.verses} ayat.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/read/${n}/`, languages: { bn: `/bn/read/${n}/`, en: `/en/read/${n}/` } },
  };
}

export default async function SurahPage({ params }: { params: Params }) {
  const { locale, n: nStr } = await params;
  const n = Number(nStr);
  const surahs = getSurahs();
  const s = surahs[n - 1];
  if (!s) notFound();
  const t = getDict(locale);
  const first = getSurah(n)[0];
  const prev = surahs[n - 2];
  const next = surahs[n];

  return (
    <div className="max-w-3xl mx-auto">
      <header className="card p-6 md:p-8 text-center mb-6">
        <p className="font-arabic ar-lg text-primary" lang="ar" dir="rtl">{s.ar}</p>
        <h1 className="text-2xl font-bold">
          {num(locale, n)}. {t.common.surah} {s.name}
        </h1>
        <p className="text-muted">
          {locale === "bn" ? s.bn : s.en} · {t.read.verses(num(locale, s.verses))} · {s.place === "makkah" ? t.read.makki : t.read.madani}
        </p>
        <Link href={`/${locale}/decks/s${n}/`} className="btn btn-secondary mt-4">
          <GraduationCap className="w-5 h-5" aria-hidden /> {t.decks.learnSurah}
        </Link>
        {n !== 1 && n !== 9 && (
          <div className="mt-4">
            <p className="font-arabic ar-md" lang="ar" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <p className="text-sm text-muted">{t.read.bismillah}</p>
          </div>
        )}
      </header>

      {/* First ayah is pre-rendered for search engines and no-JS readers; the reader replaces it. */}
      <SurahReader n={n} surahName={`${t.common.surah} ${s.name}`} verseCount={s.verses} fallback={{ ar: first.w.map((w) => w[0]).join(" "), tr: locale === "bn" ? first.bn : first.en }} />

      <nav className="mt-8 grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={`/${locale}/read/${prev.n}/`} className="card p-4 hover:border-primary flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm text-muted">{t.read.prevSurah}</span>
              <span className="block font-bold truncate">{prev.name}</span>
            </span>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/${locale}/read/${next.n}/`} className="card p-4 hover:border-primary flex items-center justify-end gap-2 text-right">
            <span className="min-w-0">
              <span className="block text-sm text-muted">{t.read.nextSurah}</span>
              <span className="block font-bold truncate">{next.name}</span>
            </span>
            <ArrowRight className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          </Link>
        )}
      </nav>
    </div>
  );
}
