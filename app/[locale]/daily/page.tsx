import type { Metadata } from "next";
import { DailyWords } from "@/components/DailyWords";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.daily.title,
    description: t.daily.subtitle,
    alternates: { canonical: `/${locale}/daily/`, languages: { bn: "/bn/daily/", en: "/en/daily/" } },
  };
}

export default function DailyPage() {
  return <DailyWords />;
}
