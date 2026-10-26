"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { Check } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { db } from "@/lib/db";
import { num } from "@/lib/i18n";

/** Parts finished per deck, from one query shared by every card on the deck index. */
export function useDeckPartsDone() {
  return useLiveQuery(async () => {
    const m = new Map<string, number>();
    await db()
      .parts.toCollection()
      .each((p) => m.set(p.deck, (m.get(p.deck) ?? 0) + 1));
    return m;
  }, []);
}

export function DeckPartsDone({
  deck,
  parts,
  done,
  onDark,
}: {
  deck: string;
  parts: number;
  done?: Map<string, number>;
  /** on the green hero cards */
  onDark?: boolean;
}) {
  const { locale, t } = useLocale();
  const n = done?.get(deck) ?? 0;
  if (!n) return <span className={`text-sm ${onDark ? "text-white/80" : "text-muted"}`}>{t.decks.parts(num(locale, parts))}</span>;
  const all = n >= parts;
  const tone = onDark ? "text-gold" : all ? "text-success" : "text-primary";
  return (
    <span className={`text-sm font-semibold inline-flex items-center gap-1 ${tone}`}>
      {all && <Check className="w-4 h-4" aria-hidden />}
      {t.decks.partsDone(num(locale, Math.min(n, parts)), num(locale, parts))}
    </span>
  );
}
