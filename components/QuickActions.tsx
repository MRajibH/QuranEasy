import Link from "next/link";
import { ArrowRight, BookMarked, BookOpenText, GraduationCap, Search } from "lucide-react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** Colourful, labelled shortcuts to every way of learning. Server-safe. */
export function QuickActions({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const items = [
    { href: `/${locale}/decks/`, label: t.decks.title, desc: t.quick.decks, Icon: BookMarked, tone: "from-emerald-500/15 border-emerald-500/25", icon: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" },
    { href: `/${locale}/search/`, label: t.search.title, desc: t.quick.search, Icon: Search, tone: "from-sky-500/15 border-sky-500/25", icon: "bg-sky-500/20 text-sky-700 dark:text-sky-300" },
    { href: `/${locale}/grammar/`, label: t.grammar.title, desc: t.quick.grammar, Icon: GraduationCap, tone: "from-violet-500/15 border-violet-500/25", icon: "bg-violet-500/20 text-violet-700 dark:text-violet-300" },
    { href: `/${locale}/practice/`, label: t.practice.ayah, desc: t.practice.ayahDesc, Icon: BookOpenText, tone: "from-amber-500/15 border-amber-500/25", icon: "bg-amber-500/20 text-amber-700 dark:text-amber-300" },
  ];
  return (
    <nav aria-labelledby="core">
      <div className="flex items-end justify-between gap-3 mb-4">
        <h2 id="core" className="text-2xl md:text-3xl font-bold">{t.home.coreTitle}</h2>
        <a href="#how" className="text-primary font-semibold inline-flex items-center gap-1 underline-offset-4 hover:underline text-sm">
          {t.home.howLink} <ArrowRight className="w-4 h-4" aria-hidden />
        </a>
      </div>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map(({ href, label, desc, Icon, tone, icon }) => (
          <li key={href}>
            <Link href={href} className={`card bg-gradient-to-br to-transparent ${tone} p-4 md:p-5 flex flex-col gap-3 h-full`}>
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${icon}`}>
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="font-bold text-lg leading-snug">{label}</span>
              <span className="text-sm text-muted flex-1">{desc}</span>
              <ArrowRight className="w-5 h-5 text-muted self-end" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
