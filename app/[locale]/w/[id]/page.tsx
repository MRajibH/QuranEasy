import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { WordActions } from "@/components/WordActions";
import { WordStudy } from "@/components/WordStudy";
import { AyahWords } from "@/components/AyahWords";
import { ReportMistake } from "@/components/ReportMistake";
import { WordOccurrences } from "@/components/WordOccurrences";
import { getDict, LOCALES, num } from "@/lib/i18n";
import { getLemma, getLemmas, getWordDetail, wordPageIds } from "@/lib/server-data";
import { grammarChips } from "@/lib/grammar";
import { lessonOfLemma, SITE_NAME, WORD_PAGE_MIN_FREQ } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export const dynamicParams = false;
export function generateStaticParams() {
  const ids = wordPageIds();
  return LOCALES.flatMap((locale) => ids.map((id) => ({ locale, id: String(id) })));
}

type Params = Promise<{ locale: Locale; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const l = getLemma(Number(id));
  if (!l) return {};
  const title = locale === "bn" ? `${l.ar} অর্থ — ${l.bn}` : `${l.ar} meaning — ${l.en}`;
  const description =
    locale === "bn"
      ? `কুরআনের শব্দ ${l.ar} (${l.tr}) — অর্থ: ${l.bn}। ইংরেজি: ${l.en}। কুরআনে ${num("bn", l.freq)} বার এসেছে। উচ্চারণ, মূল অক্ষর ও আয়াতের উদাহরণসহ।`
      : `Qur'anic word ${l.ar} (${l.tr}) means “${l.en}” (Bangla: ${l.bn}). Appears ${l.freq} times in the Qur'an. With pronunciation, root and example ayat.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/w/${id}/`, languages: { bn: `/bn/w/${id}/`, en: `/en/w/${id}/` } },
    openGraph: { title: `${title} | ${SITE_NAME}`, description },
  };
}

export default async function WordPage({ params }: { params: Params }) {
  const { locale, id: idStr } = await params;
  const id = Number(idStr);
  const l = getLemma(id);
  const detail = getWordDetail(id);
  if (!l || !detail || l.freq < WORD_PAGE_MIN_FREQ) notFound();
  const t = getDict(locale);
  const lemmas = getLemmas();
  const prev = id > 1 ? lemmas[id - 2] : null;
  const next = lemmas[id]?.freq >= WORD_PAGE_MIN_FREQ ? lemmas[id] : null;
  const lesson = lessonOfLemma(id);
  const chips = grammarChips(detail.g, locale);
  const primary = locale === "bn" ? l.bn : l.en;
  const secondary = locale === "bn" ? l.en : l.bn;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: l.ar,
    alternateName: l.tr,
    description: `${l.bn} — ${l.en}`,
    inDefinedTermSet: SITE_NAME,
  };

  return (
    <article className="max-w-3xl mx-auto grid gap-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex justify-between gap-3 text-sm font-semibold">
        {prev ? (
          <Link href={`/${locale}/w/${prev.id}/`} className="text-primary inline-flex items-center gap-1" rel="prev">
            <ArrowLeft className="w-4 h-4" aria-hidden /> <span className="font-arabic text-lg" lang="ar">{prev.ar}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/${locale}/w/${next.id}/`} className="text-primary inline-flex items-center gap-1" rel="next">
            <span className="font-arabic text-lg" lang="ar">{next.ar}</span> <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        )}
      </nav>

      <header className="card p-6 md:p-10 text-center bg-[radial-gradient(120%_70%_at_50%_0%,var(--primary-soft),var(--surface)_70%)]">
        <h1 className="font-arabic ar-xl text-text" lang="ar" dir="rtl">{l.ar}</h1>
        {l.tr && <p className="text-muted text-lg italic mt-1">{l.tr}</p>}
        <p className="mt-4 text-3xl font-bold" lang={locale}>{primary}</p>
        <p className="text-xl text-muted" lang={locale === "bn" ? "en" : "bn"}>{secondary}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          {l.root && (
            <Link href={`/${locale}/search/?q=${encodeURIComponent(l.root.replace(/ /g, ""))}`} className="rounded-full bg-accent-soft text-accent px-3 py-1 font-semibold">
              {t.common.root}: <span className="font-arabic text-lg" lang="ar">{l.root}</span>
            </Link>
          )}
          <span className="rounded-full bg-primary-soft text-primary px-3 py-1 font-semibold">{t.common.appearsTimes(num(locale, l.freq))}</span>
          <span className="rounded-full bg-surface-2 text-muted px-3 py-1 font-semibold">{t.word.rank(num(locale, id))}</span>
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-surface-2 text-muted px-3 py-1 font-semibold">{c}</span>
          ))}
        </div>
        <WordActions lemmaId={id} audioLoc={detail.audio} />
        <Link href={`/${locale}/lesson/?n=${lesson}`} className="btn btn-primary btn-lg mt-4">
          <GraduationCap className="w-5 h-5" aria-hidden /> {t.word.inLesson(num(locale, lesson))}
        </Link>
        <div className="mt-4">
          <ReportMistake id={id} ar={l.ar} bn={detail.bn} en={detail.en} locale={locale} />
        </div>
      </header>

      <WordStudy word={detail} locale={locale} />

      <WordOccurrences id={id} freq={l.freq} />

      <section aria-labelledby="examples">
        <h2 id="examples" className="text-xl font-bold mb-3">{t.word.examples}</h2>
        <div className="grid gap-4">
          {detail.examples.map((ex) => {
            const [s, a] = ex.ref.split(":");
            return (
              <figure key={ex.ref} className="card p-5">
                <AyahWords verseRef={ex.ref} words={ex.w} hi={ex.hi} start={ex.start} className="ar-md text-right" />
                <p className="mt-2" lang={locale}>{locale === "bn" ? ex.bn : ex.en}</p>
                <figcaption className="mt-2 text-sm">
                  <Link href={`/${locale}/read/${s}/#v${a}`} className="text-primary font-semibold underline underline-offset-4">
                    {t.common.surah} {num(locale, s)}:{num(locale, a)} — {t.word.readAyah}
                  </Link>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </article>
  );
}
