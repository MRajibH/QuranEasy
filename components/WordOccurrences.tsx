"use client";

import Link from "next/link";
import { useState } from "react";
import { ListTree } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { AyahWords } from "./AyahWords";
import { loadOccurrences, type Occurrence } from "@/lib/data";
import { num } from "@/lib/i18n";

const PAGE = 20;

/** Every place the word occurs in the Qur'an, loaded on request and shown 20 at a time. */
export function WordOccurrences({ id, freq }: { id: number; freq: number }) {
  const { locale, t } = useLocale();
  const [items, setItems] = useState<Occurrence[] | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(false);

  const open = async () => {
    setLoading(true);
    try {
      setItems(await loadOccurrences(id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-5 md:p-6" aria-labelledby="occ">
      <h2 id="occ" className="text-xl font-bold flex items-center gap-2">
        <span className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
          <ListTree className="w-5 h-5" aria-hidden />
        </span>
        {t.occ.title}
      </h2>
      <p className="text-muted mt-1">{t.occ.subtitle(num(locale, freq))}</p>
      {!items ? (
        <button type="button" className="btn btn-primary mt-4" onClick={open} disabled={loading}>
          {loading ? t.common.loading : t.occ.show(num(locale, freq))}
        </button>
      ) : (
        <>
          <ol className="mt-4 grid gap-2">
            {items.slice(0, shown).map(([ref, start, hi, words], i) => {
              const [s, a] = ref.split(":");
              return (
                <li key={`${ref}-${start}-${i}`} className="rounded-2xl bg-surface-2/60 px-3 py-2 flex items-center gap-3">
                  <span className="text-xs text-muted w-8 shrink-0 text-center">{num(locale, i + 1)}</span>
                  <AyahWords verseRef={ref} words={words.includes("|") ? words.split("|") : words.split(" ")} hi={hi} start={start} className="ar-sm flex-1 min-w-0 text-right" />
                  <Link href={`/${locale}/read/${s}/#v${a}`} className="shrink-0 text-sm font-semibold text-primary underline-offset-4 hover:underline">
                    {num(locale, s)}:{num(locale, a)}
                  </Link>
                </li>
              );
            })}
          </ol>
          {shown < items.length && (
            <button type="button" className="btn btn-secondary w-full mt-3" onClick={() => setShown(shown + PAGE)}>
              {t.occ.more(num(locale, Math.min(PAGE, items.length - shown)), num(locale, items.length - shown))}
            </button>
          )}
        </>
      )}
    </section>
  );
}
