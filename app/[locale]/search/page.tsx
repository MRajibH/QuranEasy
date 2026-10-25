import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/SearchView";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.search.title,
    alternates: { canonical: `/${locale}/search/`, languages: { bn: "/bn/search/", en: "/en/search/" } },
  };
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
