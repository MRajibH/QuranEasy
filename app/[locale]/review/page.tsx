import type { Metadata } from "next";
import { ReviewSession } from "@/components/ReviewSession";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return { title: t.review.title, description: t.review.subtitle, robots: { index: false } };
}

export default function ReviewPage() {
  return <ReviewSession />;
}
