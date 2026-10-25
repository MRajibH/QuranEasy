import type { Metadata } from "next";
import { PageTitleStatic } from "@/components/PageTitleStatic";
import { SurahList } from "@/components/SurahList";
import { getDict } from "@/lib/i18n";
import { getSurahs } from "@/lib/server-data";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.read.title,
    description: t.read.subtitle,
    alternates: { canonical: `/${locale}/read/`, languages: { bn: "/bn/read/", en: "/en/read/" } },
  };
}

export default async function ReadIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  return (
    <>
      <PageTitleStatic title={t.read.title} subtitle={t.read.subtitle} />
      <SurahList surahs={getSurahs()} />
    </>
  );
}
