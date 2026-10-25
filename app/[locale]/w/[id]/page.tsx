import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";
import { WordActions } from "@/components/WordActions";
import { getDict, LOCALES, num } from "@/lib/i18n";
import { getLemma, getLemmas, getVerse, wordPageIds } from "@/lib/server-data";
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
  if (!l || l.freq < WORD_PAGE_MIN_FREQ) notFound();
  const t = getDict(locale);
  const lemmas = getLemmas();
  const prev = id > 1 ? lemmas[id - 2] : null;
  const next = lemmas[id]?.freq >= WORD_PAGE_MIN_FREQ ? lemmas[id] : null;
  const lesson = lessonOfLemma(id);
  const examples = l.refs.map((loc) => {
    const [s, a, w] = loc.split(":").map(Number);
    return { s, a, hi: w - 1, verse: getVerse(`${s}:${a}`) };
  });
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

      <header className="card p-6 md:p-10 text-center">
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
          {t.word.pos[l.pos] && <span className="rounded-full bg-surface-2 text-muted px-3 py-1 font-semibold">{t.word.pos[l.pos]}</span>}
        </div>
        <WordActions lemmaId={id} audioLoc={l.refs[0]} />
        <Link href={`/${locale}/lesson/?n=${lesson}`} className="btn btn-primary btn-lg mt-4">
          <GraduationCap className="w-5 h-5" aria-hidden /> {t.word.inLesson(num(locale, lesson))}
        </Link>
      </header>

      {l.forms.length > 1 && (
        <section className="card p-6" aria-labelledby="forms">
          <h2 id="forms" className="text-xl font-bold mb-3">{t.word.forms}</h2>
          <ul className="divide-y divide-border">
            {l.forms.map((f) => (
              <li key={f.ar} className="py-3 flex items-center gap-4">
                <span className="font-arabic ar-sm min-w-24 text-right" lang="ar" dir="rtl">{f.ar}</span>
                <span className="flex-1">
                  <span className="block font-semibold">{locale === "bn" ? f.bn : f.en}</span>
                  <span className="block text-sm text-muted">{f.tr}</span>
                </span>
                <span className="text-sm text-muted whitespace-nowrap">{num(locale, f.n)} {t.common.times}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="examples">
        <h2 id="examples" className="text-xl font-bold mb-3">{t.word.examples}</h2>
        <div className="grid gap-4">
          {examples.map(({ s, a, hi, verse }) => (
            <figure key={`${s}:${a}`} className="card p-5">
              <p className="font-arabic ar-md text-right" lang="ar" dir="rtl">
                {verse.w.map((w, i) => (
                  <span key={i}>
                    <span className={i === hi ? "hl-word" : ""}>{w[0]}</span>{" "}
                  </span>
                ))}
              </p>
              <p className="mt-2" lang={locale}>{locale === "bn" ? verse.bn : verse.en}</p>
              <figcaption className="mt-2 text-sm">
                <Link href={`/${locale}/read/${s}/#v${a}`} className="text-primary font-semibold underline underline-offset-4">
                  {t.common.surah} {num(locale, s)}:{num(locale, a)} — {t.word.readAyah}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </article>
  );
}
