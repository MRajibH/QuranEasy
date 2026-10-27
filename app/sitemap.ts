import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { getDeckIndex, wordPageIds } from "@/lib/server-data";
import { GRAMMAR_LESSONS } from "@/lib/grammar-lessons";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "learn/",
    "daily/",
    "salah/",
    "decks/",
    "grammar/",
    ...GRAMMAR_LESSONS.map((l) => `grammar/${l.slug}/`),
    ...getDeckIndex().map((d) => `decks/${d.id}/`),
    "read/",
    "practice/",
    "search/",
    "about/",
    "support/",
    ...Array.from({ length: 114 }, (_, i) => `read/${i + 1}/`),
    ...wordPageIds().map((id) => `w/${id}/`),
  ];
  return paths.flatMap((p) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/${p}`,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}/${p}`])) },
      priority: p === "" ? 1 : p.startsWith("w/") ? 0.6 : 0.8,
    })),
  );
}
