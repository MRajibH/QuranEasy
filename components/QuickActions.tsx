import Link from "next/link";
import { BookMarked, BookOpen, Gamepad2, GraduationCap } from "lucide-react";
import { getDict } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/** Big, labelled shortcuts to every way of learning — easy to find for all ages. Server-safe. */
export function QuickActions({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const items = [
    { href: `/${locale}/decks/`, label: t.decks.title, desc: t.quick.decks, Icon: BookMarked, tone: "bg-primary-soft text-primary" },
    { href: `/${locale}/grammar/`, label: t.grammar.title, desc: t.quick.grammar, Icon: GraduationCap, tone: "bg-accent-soft text-accent" },
    { href: `/${locale}/practice/`, label: t.practice.title, desc: t.quick.practice, Icon: Gamepad2, tone: "bg-success-soft text-success" },
    { href: `/${locale}/read/`, label: t.read.title, desc: t.quick.read, Icon: BookOpen, tone: "bg-surface-2 text-text" },
  ];
  return (
    <nav aria-label={t.quick.title}>
      <h2 className="text-2xl font-bold mb-4">{t.quick.title}</h2>
      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map(({ href, label, desc, Icon, tone }) => (
          <li key={href}>
            <Link href={href} className="card p-4 md:p-5 flex flex-col gap-3 h-full">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="font-bold text-lg leading-snug">{label}</span>
              <span className="text-sm text-muted">{desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
