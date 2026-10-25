"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { num } from "@/lib/i18n";
import { normalizeLatin } from "@/lib/search";
import type { SurahInfo } from "@/lib/types";

export function SurahList({ surahs }: { surahs: SurahInfo[] }) {
  const { locale, t } = useLocale();
  const [q, setQ] = useState("");
  const nq = normalizeLatin(q);
  const list = nq
    ? surahs.filter(
        (s) =>
          String(s.n) === nq ||
          normalizeLatin(s.name).includes(nq) ||
          normalizeLatin(s.en).includes(nq) ||
          s.bn.includes(q.trim()) ||
          s.ar.includes(q.trim()),
      )
    : surahs;
  return (
    <>
      <label className="relative block mb-5">
        <span className="sr-only">{t.read.search}</span>
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.read.search}
          className="w-full h-14 rounded-2xl border-2 border-border bg-surface pl-12 pr-4 text-lg focus:border-primary outline-none"
        />
      </label>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={s.n}>
            <Link href={`/${locale}/read/${s.n}/`} className="card p-4 flex items-center gap-4 hover:border-primary transition-colors">
              <span className="w-12 h-12 shrink-0 rotate-45 rounded-xl bg-primary-soft flex items-center justify-center">
                <span className="-rotate-45 font-bold text-primary">{num(locale, s.n)}</span>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold truncate">{s.name}</span>
                <span className="block text-sm text-muted truncate">
                  {locale === "bn" ? s.bn : s.en} · {t.read.verses(num(locale, s.verses))}
                </span>
              </span>
              <span className="font-arabic ar-sm text-primary" lang="ar" dir="rtl">{s.ar}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
