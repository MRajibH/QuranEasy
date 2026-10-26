import type { Metadata } from "next";
import { LearnTabs } from "@/components/LearnTabs";
import { DeckIndex } from "@/components/DeckIndex";
import { PageTitleStatic } from "@/components/PageTitleStatic";
import { getDict } from "@/lib/i18n";
import { getDeckIndex, getSurahs } from "@/lib/server-data";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.decks.title,
    description: t.decks.subtitle,
    alternates: { canonical: `/${locale}/decks/`, languages: { bn: "/bn/decks/", en: "/en/decks/" } },
  };
}

export default async function DecksPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <LearnTabs locale={locale} active="decks" />
      <PageTitleStatic title={t.decks.title} subtitle={t.decks.subtitle} />
      <DeckIndex decks={getDeckIndex()} surahs={getSurahs()} />
    </>
  );
}
