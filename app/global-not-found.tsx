/* eslint-disable @next/next/no-html-link-for-pages -- links cross root layouts and need a full page load */
import type { Metadata } from "next";
import "./globals.css";
import { fontVars } from "./fonts";
import { themeScript } from "@/lib/theme";

export const metadata: Metadata = { title: "404 — QuranEasy" };

export default function GlobalNotFound() {
  return (
    <html lang="bn" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex items-center justify-center p-6">
        <div className="card p-10 max-w-md text-center">
          <p className="font-arabic ar-lg text-primary" lang="ar" dir="rtl">
            سُبْحَانَ ٱللَّهِ
          </p>
          <h1 className="text-2xl font-bold mt-2">এই পাতাটি পাওয়া যায়নি</h1>
          <p className="text-muted mt-1">This page could not be found.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <a className="btn btn-primary" href="/bn/">হোমে যান</a>
            <a className="btn btn-secondary" href="/en/">Home</a>
          </div>
        </div>
      </body>
    </html>
  );
}
