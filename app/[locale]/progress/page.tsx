import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(locale).progress.title, robots: { index: false } };
}

export default function ProgressPage() {
  return <ProgressView />;
}
