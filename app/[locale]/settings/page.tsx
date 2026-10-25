import type { Metadata } from "next";
import { SettingsView } from "@/components/SettingsView";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: getDict(locale).settings.title, robots: { index: false } };
}

export default function SettingsPage() {
  return <SettingsView />;
}
