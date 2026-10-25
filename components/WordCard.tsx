"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { AudioButton, Meaning } from "./ui";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import { WORD_PAGE_MIN_FREQ } from "@/lib/constants";
import type { Example } from "@/lib/types";

export interface CardWord {
  id: number;
  ar: string;
  tr: string;
  bn: string;
  en: string;
  root: string;
  freq: number;
}

/** Location "s:a:w" of the highlighted word in an example (used for audio). */
export const exampleLocation = (ex: Example) => `${ex.ref}:${ex.hi + 1}`;

export function ExampleAyah({ ex, caption = true }: { ex: Example; caption?: boolean }) {
  const { locale, t } = useLocale();
  const { meaning } = useSettings();
  const lang = meaning === "both" ? locale : meaning;
  const [s, a] = ex.ref.split(":");
  return (
    <figure className="rounded-2xl bg-surface-2/70 p-4 text-center">
      {caption && <figcaption className="text-sm font-semibold text-muted mb-1">{t.learn.example}</figcaption>}
      <p className="font-arabic ar-md" lang="ar" dir="rtl">
        {ex.w.map((w, i) => (
          <span key={i}>
            <span className={i === ex.hi ? "hl-word" : ""}>{w}</span>{" "}
          </span>
        ))}
      </p>
      <p className="mt-2 text-base" lang={lang}>
        {lang === "bn" ? ex.bn : ex.en}
      </p>
      <Link href={`/${locale}/read/${s}/#v${a}`} className="mt-1 inline-block text-sm text-primary underline underline-offset-4">
        {t.common.surah} {num(locale, s)}:{num(locale, a)}
      </Link>
    </figure>
  );
}

export function WordCard({ word, ex, audioLoc }: { word: CardWord; ex?: Example; audioLoc?: string }) {
  const { locale, t } = useLocale();
  const { translit } = useSettings();
  const loc = audioLoc ?? (ex ? exampleLocation(ex) : undefined);
  return (
    <div className="card p-6 md:p-8 text-center animate-pop">
      <p className="font-arabic ar-xl text-text" lang="ar" dir="rtl">
        {word.ar}
      </p>
      {translit && word.tr && <p className="text-muted text-lg mt-1 italic">{word.tr}</p>}
      {loc && (
        <div className="mt-3">
          <AudioButton location={loc} size="lg" label />
        </div>
      )}
      <Meaning bn={word.bn} en={word.en} size="xl" className="mt-5" />
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        {word.root && (
          <span className="rounded-full bg-accent-soft text-accent px-3 py-1 font-semibold">
            {t.common.root}: <span className="font-arabic text-lg" lang="ar">{word.root}</span>
          </span>
        )}
        <span className="rounded-full bg-primary-soft text-primary px-3 py-1 font-semibold">
          {t.common.appearsTimes(num(locale, word.freq))}
        </span>
      </div>
      {ex && (
        <div className="mt-5 text-left">
          <ExampleAyah ex={ex} />
        </div>
      )}
      {word.freq >= WORD_PAGE_MIN_FREQ && (
        <Link href={`/${locale}/w/${word.id}/`} className="mt-4 inline-block text-primary font-semibold underline underline-offset-4">
          {t.common.seeWord}
        </Link>
      )}
    </div>
  );
}
