import type { Metadata } from "next";
import "../globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — কুরআনের প্রতিটি শব্দ সহজে শিখুন`,
  alternates: { languages: { bn: "/bn/", en: "/en/" } },
  robots: { index: false, follow: true },
};

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
