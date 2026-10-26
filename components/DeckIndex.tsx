"use client";

import Link from "next/link";
import { BookOpenCheck, Sparkles } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { DeckPartsDone, useDeckPartsDone } from "./DeckPartsDone";
import { num } from "@/lib/i18n";
import { deckParts, JUZ_AMMA } from "@/lib/constants";
import type { DeckIndexItem, SurahInfo } from "@/lib/types";

export function DeckIndex({ decks, surahs }: { decks: DeckIndexItem[]; surahs: SurahInfo[] }) {
  const { locale, t } = useLocale();
  const done = useDeckPartsDone();
  const byId = new Map(decks.map((d) => [d.id, d]));
  const fatiha = byId.get("s1")!;
  const juz = byId.get(JUZ_AMMA.id)!;

  const featured = [
    { id: "s1", title: t.decks.fatiha, desc: t.decks.fatihaDesc, ar: "الفاتحة", deck: fatiha, Icon: Sparkles },
    { id: JUZ_AMMA.id, title: t.decks.juzAmma, desc: t.decks.juzAmmaDesc, ar: "جزء عمّ", deck: juz, Icon: BookOpenCheck },
  ];

  const surahCard = (s: SurahInfo) => {
    const d = byId.get(`s${s.n}`)!;
    return (
      <li key={s.n}>
        <Link href={`/${locale}/decks/s${s.n}/`} className="card p-4 flex items-center gap-4">
          <span className="w-11 h-11 shrink-0 rotate-45 rounded-xl bg-primary-soft flex items-center justify-center">
            <span className="-rotate-45 font-bold text-primary text-sm">{num(locale, s.n)}</span>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-bold truncate">{s.name}</span>
            <span className="block text-sm text-muted truncate">{t.decks.unique(num(locale, d.unique))}</span>
            <DeckPartsDone deck={d.id} parts={deckParts(d.unique)} done={done} />
          </span>
          <span className="font-arabic ar-sm text-primary" lang="ar" dir="rtl">{s.ar}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="grid gap-8">
      <section aria-labelledby="featured">
        <h2 id="featured" className="text-xl font-bold mb-3">{t.decks.featured}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {featured.map(({ id, title, desc, ar, deck, Icon }) => (
            <Link key={id} href={`/${locale}/decks/${id}/`} className="hero p-6 flex flex-col gap-3">
              <span className="flex items-center justify-between gap-3">
                <span className="w-12 h-12 rounded-2xl bg-white/10 text-gold flex items-center justify-center">
                  <Icon className="w-6 h-6" aria-hidden />
                </span>
                <span className="font-arabic ar-lg text-gold" lang="ar" dir="rtl">{ar}</span>
              </span>
              <span className="text-2xl font-bold text-white">{title}</span>
              <span className="text-white/75">{desc}</span>
              <span className="text-sm text-white/65">
                {t.decks.unique(num(locale, deck.unique))} · {t.decks.totalWords(num(locale, deck.total))}
              </span>
              <span className="rounded-xl bg-white/10 border border-white/15 px-3 py-1 self-start">
                <DeckPartsDone deck={id} parts={deckParts(deck.unique)} done={done} onDark />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="juz">
        <h2 id="juz" className="text-xl font-bold mb-3">{t.decks.juzSurahs}</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {surahs.filter((s) => s.n >= JUZ_AMMA.from).reverse().map(surahCard)}
        </ol>
      </section>

      <section aria-labelledby="all">
        <h2 id="all" className="text-xl font-bold mb-3">{t.decks.allSurahs}</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{surahs.filter((s) => s.n < JUZ_AMMA.from).map(surahCard)}</ol>
      </section>
    </div>
  );
}
