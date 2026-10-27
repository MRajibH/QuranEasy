import type { Metadata } from "next";
import { SalahView } from "@/components/salah/SalahView";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.salah.title,
    description: t.salah.subtitle,
    alternates: { canonical: `/${locale}/salah/`, languages: { bn: "/bn/salah/", en: "/en/salah/" } },
  };
}

export default function SalahPage() {
  return <SalahView />;
}
