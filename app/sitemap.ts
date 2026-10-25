import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { wordPageIds } from "@/lib/server-data";
import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "learn/",
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
