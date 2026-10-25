import type { Metadata } from "next";
import { LessonPath, type PathLesson } from "@/components/LessonPath";
import { PageTitleStatic } from "@/components/PageTitleStatic";
import { getDict } from "@/lib/i18n";
import { getLemmas } from "@/lib/server-data";
import { LESSON_SIZE, TOTAL_LESSONS, TOTAL_WORDS } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return {
    title: t.learn.title,
    description: t.learn.subtitle,
    alternates: { canonical: `/${locale}/learn/`, languages: { bn: "/bn/learn/", en: "/en/learn/" } },
  };
}

export default async function LearnPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const lemmas = getLemmas();
  const lessons: PathLesson[] = [];
  let covered = 0;
  for (let n = 1; n <= TOTAL_LESSONS; n++) {
    const chunk = lemmas.slice((n - 1) * LESSON_SIZE, n * LESSON_SIZE);
    covered += chunk.reduce((s, l) => s + l.freq, 0);
    lessons.push({
      n,
      preview: chunk.slice(0, 3).map((l) => l.ar),
      hint: chunk.slice(0, 3).map((l) => (locale === "bn" ? l.bn : l.en)).join(", "),
      coverage: Math.round((covered / TOTAL_WORDS) * 1000) / 10,
    });
  }
  return (
    <>
      <PageTitleStatic title={t.learn.title} subtitle={t.learn.subtitle} />
      <LessonPath lessons={lessons} />
    </>
  );
}
