import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { AudioButton } from "@/components/ui";
import { GrammarQuiz } from "@/components/GrammarQuiz";
import { getDict, LOCALES, num } from "@/lib/i18n";
import { GRAMMAR_LESSONS, grammarLesson } from "@/lib/grammar-lessons";
import { findInQuran } from "@/lib/quran-index";
import type { Locale } from "@/lib/types";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.flatMap((locale) => GRAMMAR_LESSONS.map((l) => ({ locale, slug: l.slug })));

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = grammarLesson(slug);
  if (!l) return {};
  return {
    title: l.title[locale],
    description: l.summary[locale],
    alternates: { canonical: `/${locale}/grammar/${slug}/`, languages: { bn: `/bn/grammar/${slug}/`, en: `/en/grammar/${slug}/` } },
  };
}

export default async function GrammarLessonPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const l = grammarLesson(slug);
  if (!l) notFound();
  const t = getDict(locale);
  const idx = GRAMMAR_LESSONS.indexOf(l);
  const prev = GRAMMAR_LESSONS[idx - 1];
  const next = GRAMMAR_LESSONS[idx + 1];
  // Show each example as it is written in the Qur'an (Uthmani script), with its location for audio.
  const quran = (ar: string) => findInQuran(ar) ?? { ar, loc: "", en: "", bn: "" };

  return (
    <article className="max-w-3xl mx-auto grid gap-6">
      <Link href={`/${locale}/grammar/`} className="text-sm text-primary font-semibold inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" aria-hidden /> {t.grammar.all}
      </Link>

      <header className="hero p-6 md:p-8">
        <p className="text-gold font-semibold">{t.grammar.lesson(num(locale, idx + 1))}</p>
        <h1 className="text-3xl font-bold text-white mt-1">{l.title[locale]}</h1>
        <p className="mt-2 text-white/75 text-lg">{l.summary[locale]}</p>
      </header>

      <section className="card p-6 grid gap-3 text-lg leading-relaxed">
        {l.body[locale].map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section aria-labelledby="examples" className="grid gap-4">
        <h2 id="examples" className="text-2xl font-bold">{t.grammar.examples}</h2>
        {l.examples.map((group) => (
          <div key={group.title.en} className="card p-5">
            <h3 className="font-bold text-lg mb-3 text-primary">{group.title[locale]}</h3>
            <ul className="grid gap-2">
              {group.items.map((e) => {
                const q = quran(e.ar);
                const [s, a] = q.loc.split(":");
                return (
                  <li key={e.ar} className="flex items-center gap-3 rounded-2xl bg-surface-2/70 px-3 py-2">
                    {q.loc && <AudioButton location={q.loc} />}
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-lg" lang={locale}>{e.gloss[locale]}</span>
                      {q.loc && (
                        <Link href={`/${locale}/read/${s}/#v${a}`} className="text-sm text-muted hover:text-primary underline-offset-4 hover:underline">
                          {t.common.surah} {num(locale, s)}:{num(locale, a)}
                        </Link>
                      )}
                    </span>
                    <span className="font-arabic ar-md shrink-0" lang="ar" dir="rtl">{q.ar}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {l.tip && (
        <p className="rounded-2xl bg-accent-soft text-accent font-semibold px-5 py-4 flex gap-3">
          <Lightbulb className="w-6 h-6 shrink-0" aria-hidden /> {l.tip[locale]}
        </p>
      )}

      <GrammarQuiz
        slug={l.slug}
        questions={l.quiz.map((q) => ({
          prompt: q.prompt[locale],
          ar: q.ar ? quran(q.ar).ar : undefined,
          options: q.options.map((o) => o[locale]),
        }))}
        next={next ? { href: `/${locale}/grammar/${next.slug}/`, label: next.title[locale] } : undefined}
      />

      <nav className="grid grid-cols-2 gap-3">
        {prev ? (
          <Link href={`/${locale}/grammar/${prev.slug}/`} className="card p-4 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">
              <span className="block text-sm text-muted">{t.grammar.prev}</span>
              <span className="block font-bold truncate">{prev.title[locale]}</span>
            </span>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/${locale}/grammar/${next.slug}/`} className="card p-4 flex items-center justify-end gap-2 text-right">
            <span className="min-w-0">
              <span className="block text-sm text-muted">{t.grammar.next}</span>
              <span className="block font-bold truncate">{next.title[locale]}</span>
            </span>
            <ArrowRight className="w-5 h-5 shrink-0 text-primary" aria-hidden />
          </Link>
        )}
      </nav>
    </article>
  );
}
