import type { Metadata } from "next";
import { Suspense } from "react";
import { LessonRunner } from "@/components/LessonRunner";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(locale).common.lesson, robots: { index: false } };
}

export default function LessonPage() {
  return (
    <Suspense>
      <LessonRunner />
    </Suspense>
  );
}
