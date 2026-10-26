import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeckView } from "@/components/DeckView";
import { getDict, LOCALES, num } from "@/lib/i18n";
import { getDeckIndex, getSurahs } from "@/lib/server-data";
import { deckParts, JUZ_AMMA } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.flatMap((locale) => getDeckIndex().map((d) => ({ locale, id: d.id })));

type Params = Promise<{ locale: Locale; id: string }>;

function deckInfo(locale: Locale, id: string) {
  const t = getDict(locale);
  const d = getDeckIndex().find((x) => x.id === id);
  if (!d) return null;
  if (id === JUZ_AMMA.id) return { d, title: t.decks.juzAmma, ar: "جزء عمّ", surah: null };
  const s = getSurahs()[Number(id.slice(1)) - 1];
  return { d, title: `${t.common.surah} ${s.name}`, ar: s.ar, surah: s };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const info = deckInfo(locale, id);
  if (!info) return {};
  const t = getDict(locale);
  const title = `${info.title} — ${t.decks.learnSurah}`;
  const description =
    locale === "bn"
      ? `${info.title}-এর ${num("bn", info.d.unique)}টি আলাদা শব্দ বাংলা অর্থ, উচ্চারণ ও তিলাওয়াতসহ ছোট ছোট অংশে শিখুন।`
      : `Learn the ${info.d.unique} different words of ${info.title} in small parts, with Bangla and English meanings and recitation.`;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/decks/${id}/`, languages: { bn: `/bn/decks/${id}/`, en: `/en/decks/${id}/` } },
  };
}

export default async function DeckPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const info = deckInfo(locale, id);
  if (!info) notFound();
  return (
    <Suspense>
      <DeckView
        id={id}
        title={info.title}
        ar={info.ar}
        surahNum={info.surah?.n ?? null}
        total={info.d.total}
        unique={info.d.unique}
        parts={deckParts(info.d.unique)}
      />
    </Suspense>
  );
}
