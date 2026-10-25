"use client";

import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { WordSheet, type SheetWord } from "./WordSheet";
import { PageTitle, Spinner } from "./ui";
import { loadLemmas } from "@/lib/data";
import { buildIndex, search, type SearchIndexItem } from "@/lib/search";
import { useCardStatus } from "@/lib/progress";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";

export function SearchView() {
  const { locale, t } = useLocale();
  const { meaning } = useSettings();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const dq = useDeferredValue(q);
  const [index, setIndex] = useState<SearchIndexItem[] | null>(null);
  const [sheet, setSheet] = useState<SheetWord | null>(null);
  const status = useCardStatus();

  useEffect(() => {
    loadLemmas().then((l) => setIndex(buildIndex(l)));
  }, []);

  // Keep the query in the URL so results can be shared / revisited.
  useEffect(() => {
    const url = new URL(location.href);
    if (dq) url.searchParams.set("q", dq);
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }, [dq]);

  const results = useMemo(() => (index ? search(index, dq) : []), [index, dq]);
  const order = meaning === "both" ? (locale === "bn" ? ["bn", "en"] : ["en", "bn"]) : [meaning];

  return (
    <>
      <PageTitle title={t.search.title} />
      <label className="relative block">
        <span className="sr-only">{t.search.placeholder}</span>
        <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search.placeholder}
          className="w-full h-16 rounded-2xl border-2 border-border bg-surface pl-14 pr-4 text-xl focus:border-primary outline-none"
        />
      </label>
      <p className="text-muted mt-2">{t.search.hint}</p>

      {!index ? (
        <Spinner />
      ) : dq.trim() ? (
        <div className="mt-6" aria-live="polite">
          <p className="text-sm text-muted mb-3">{results.length ? t.search.results(num(locale, results.length)) : t.search.none}</p>
          <ul className="grid gap-2">
            {results.map((l) => {
              const st = status?.get(l[0]);
              return (
                <li key={l[0]}>
                  <button
                    type="button"
                    onClick={() => setSheet({ lemma: l })}
                    className="card w-full p-4 flex items-center gap-4 text-left hover:border-primary"
                  >
                    <span className="font-arabic ar-md min-w-20 text-center" lang="ar" dir="rtl">{l[1]}</span>
                    <span className="flex-1 min-w-0">
                      {order.map((o, i) => (
                        <span key={o} className={`block truncate ${i === 0 ? "font-semibold text-lg" : "text-muted"}`} lang={o}>
                          {o === "bn" ? l[2] : l[3]}
                        </span>
                      ))}
                      <span className="block text-sm text-muted italic">{l[4]}</span>
                    </span>
                    <span className="text-right text-sm text-muted whitespace-nowrap">
                      {num(locale, l[5])} {t.common.times}
                      {st && (
                        <span className={`block font-semibold ${st === "known" ? "text-success" : "text-accent"}`}>
                          {st === "known" ? t.common.learned : t.common.learning}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <WordSheet word={sheet} onClose={() => setSheet(null)} />
    </>
  );
}
