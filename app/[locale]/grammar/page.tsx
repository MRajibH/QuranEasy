import type { Metadata } from "next";
import { LearnTabs } from "@/components/LearnTabs";
import { GrammarList } from "@/components/GrammarList";
import { PageTitleStatic } from "@/components/PageTitleStatic";
import { getDict } from "@/lib/i18n";
import { GRAMMAR_LESSONS } from "@/lib/grammar-lessons";
import { findInQuran } from "@/lib/quran-index";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.grammar.title,
    description: t.grammar.subtitle,
    alternates: { canonical: `/${locale}/grammar/`, languages: { bn: "/bn/grammar/", en: "/en/grammar/" } },
  };
}

export default async function GrammarIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const items = GRAMMAR_LESSONS.map((l) => ({
    slug: l.slug,
    title: l.title[locale],
    summary: l.summary[locale],
    sample: findInQuran(l.examples[0].items[0].ar)?.ar ?? l.examples[0].items[0].ar,
  }));
  return (
    <>
      <LearnTabs locale={locale} active="grammar" />
      <PageTitleStatic title={t.grammar.title} subtitle={t.grammar.subtitle} />
      <GrammarList items={items} />
    </>
  );
}
