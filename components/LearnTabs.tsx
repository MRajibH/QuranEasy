import Link from "next/link";
import { BookMarked, GraduationCap, Route } from "lucide-react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** Switches between the three ways to learn. Server-safe (no hooks). */
export function LearnTabs({ locale, active }: { locale: Locale; active: "path" | "decks" | "grammar" }) {
  const t = getDict(locale);
  const tabs = [
    { id: "path", href: `/${locale}/learn/`, label: t.learnTabs.path, Icon: Route },
    { id: "decks", href: `/${locale}/decks/`, label: t.learnTabs.decks, Icon: BookMarked },
    { id: "grammar", href: `/${locale}/grammar/`, label: t.learnTabs.grammar, Icon: GraduationCap },
  ] as const;
  return (
    <nav className="mb-6 grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1" aria-label={t.nav.learn}>
      {tabs.map(({ id, href, label, Icon }) => (
        <Link
          key={id}
          href={href}
          aria-current={active === id ? "page" : undefined}
          className={`h-12 rounded-xl font-semibold inline-flex items-center justify-center gap-2 text-sm sm:text-base ${
            active === id ? "bg-surface text-primary shadow-[var(--shadow-sm)]" : "text-muted hover:text-text"
          }`}
        >
          <Icon className="w-5 h-5 shrink-0" aria-hidden />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
