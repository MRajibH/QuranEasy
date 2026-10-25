import type { Metadata } from "next";
import { Practice } from "@/components/Practice";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.practice.title,
    description: t.practice.subtitle,
    alternates: { canonical: `/${locale}/practice/`, languages: { bn: "/bn/practice/", en: "/en/practice/" } },
  };
}

export default function PracticePage() {
  return <Practice />;
}
