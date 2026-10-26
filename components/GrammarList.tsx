"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { ProgressBar } from "./ui";
import { useCompletedGrammar } from "@/lib/progress";
import { num } from "@/lib/i18n";

export interface GrammarListItem {
  slug: string;
  title: string;
  summary: string;
  sample: string;
}

export function GrammarList({ items }: { items: GrammarListItem[] }) {
  const { locale, t } = useLocale();
  const done = useCompletedGrammar();
  const count = items.filter((i) => done?.has(i.slug)).length;
  return (
    <div className="grid gap-4">
      {count > 0 && (
        <div className="card p-5">
          <p className="font-semibold mb-2">{t.grammar.progress(num(locale, count), num(locale, items.length))}</p>
          <ProgressBar value={count} max={items.length} />
        </div>
      )}
      <ol className="grid gap-3 sm:grid-cols-2">
        {items.map((l, i) => {
          const isDone = done?.has(l.slug);
          return (
            <li key={l.slug}>
              <Link href={`/${locale}/grammar/${l.slug}/`} className="card p-5 flex gap-4 h-full">
                <span
                  className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg ${
                    isDone ? "bg-success text-white" : "bg-primary-soft text-primary"
                  }`}
                >
                  {isDone ? <Check className="w-6 h-6" aria-label={t.grammar.done} /> : num(locale, i + 1)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-lg leading-snug">{l.title}</span>
                  <span className="block text-muted mt-1">{l.summary}</span>
                </span>
                <span className="font-arabic ar-sm text-accent shrink-0 self-center" lang="ar" dir="rtl">{l.sample}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
