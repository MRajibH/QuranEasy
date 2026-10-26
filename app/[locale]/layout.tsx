import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVars } from "../fonts";
import { LocaleProvider } from "@/components/LocaleProvider";
import { BottomNav, Header } from "@/components/Nav";
import { ClientInit } from "@/components/ClientInit";
import { Logo } from "@/components/Logo";
import { Heart } from "lucide-react";
import { getDict, isLocale, LOCALES } from "@/lib/i18n";
import { themeScript } from "@/lib/theme";
import { REPO_URL, SITE_NAME, SITE_URL } from "@/lib/constants";
import type { Locale } from "@/lib/types";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale as Locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${SITE_NAME} — ${t.appTagline}`, template: `%s | ${SITE_NAME}` },
    description: t.home.heroText,
    applicationName: SITE_NAME,
    manifest: "/manifest.webmanifest",
    icons: { icon: [{ url: "/favicon.ico" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "bn" ? "bn_BD" : "en_US",
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e5a48" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1412" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <html lang={locale} className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <LocaleProvider locale={locale}>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn btn-primary">
            {locale === "bn" ? "মূল অংশে যান" : "Skip to content"}
          </a>
          <ClientInit />
          <Header />
          <main id="main" className="flex-1 w-full mx-auto max-w-6xl px-4 pt-6 pb-32 md:pb-12">
            {children}
          </main>
          <footer className="border-t border-border pb-28 md:pb-0">
            <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center text-sm text-muted">
              <Link href={`/${locale}/`} className="flex items-center gap-2.5">
                <Logo className="w-10 h-10" />
                <span className="flex flex-col leading-tight">
                  <span className="font-bold text-lg text-text">QuranEasy</span>
                  <span className="text-xs text-accent">{t.brandTagline}</span>
                </span>
              </Link>
              <nav className="flex flex-wrap gap-x-5 gap-y-2 md:justify-center" aria-label="Footer">
                {[
                  [`/${locale}/daily/`, t.nav.daily],
                  [`/${locale}/decks/`, t.decks.title],
                  [`/${locale}/grammar/`, t.learnTabs.grammar],
                  [`/${locale}/practice/`, t.nav.practice],
                  [`/${locale}/about/`, t.nav.about],
                  [`/${locale}/about/#sources`, t.footer.sources],
                  [`/${locale}/support/`, t.nav.support],
                ].map(([href, label]) => (
                  <Link key={href} className="hover:text-primary underline-offset-4 hover:underline" href={href}>
                    {label}
                  </Link>
                ))}
                <a className="hover:text-primary underline-offset-4 hover:underline" href={REPO_URL} rel="noopener" target="_blank">GitHub</a>
              </nav>
              <p className="flex items-center gap-1.5 md:justify-end">
                <Heart className="w-4 h-4 text-accent" aria-hidden /> {t.footer.motto}
              </p>
              <p className="md:col-span-3 text-xs text-center border-t border-border pt-4">{t.footer.niyyah} · {t.footer.privacy}</p>
            </div>
          </footer>
          <BottomNav />
        </LocaleProvider>
      </body>
    </html>
  );
}
