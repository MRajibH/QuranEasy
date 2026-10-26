"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, GraduationCap, Home, Repeat, Search, Settings } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useDueCount } from "@/lib/progress";
import { num } from "@/lib/i18n";

function useItems() {
  const { locale, t } = useLocale();
  return [
    { href: `/${locale}/`, label: t.nav.home, Icon: Home, exact: true },
    { href: `/${locale}/learn/`, label: t.nav.learn, Icon: GraduationCap },
    { href: `/${locale}/review/`, label: t.nav.review, Icon: Repeat, badge: true },
    { href: `/${locale}/read/`, label: t.nav.read, Icon: BookOpen },
    { href: `/${locale}/progress/`, label: t.nav.progress, Icon: BarChart3 },
  ];
}

const isActive = (path: string, href: string, exact?: boolean) =>
  exact ? path === href || path === href.slice(0, -1) : path.startsWith(href.slice(0, -1));

function DueBadge({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  const due = useDueCount();
  if (!due) return null;
  return (
    <span
      className={`min-w-6 h-6 px-1.5 rounded-full bg-danger text-white text-xs font-bold inline-flex items-center justify-center ${className}`}
      aria-label={`${due}`}
    >
      {num(locale, due > 99 ? "99+" : due)}
    </span>
  );
}

export function Header() {
  const { locale, t } = useLocale();
  const path = usePathname();
  const items = useItems();
  const other = locale === "bn" ? "en" : "bn";
  const switchHref = path.replace(/^\/(bn|en)/, `/${other}`);
  const icon = "w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-surface-2 hover:text-text";
  return (
    <header className="sticky top-0 z-30 bg-bg/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-[4.25rem] flex items-center gap-2 sm:gap-3">
        <Link href={`/${locale}/`} className="flex items-center gap-2.5 shrink-0">
          <Logo className="w-10 h-10" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-bold text-lg text-text">QuranEasy</span>
            <span className="text-xs text-accent">{t.brandTagline}</span>
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 ml-6" aria-label="Main">
          {items.map(({ href, label, Icon, exact, badge }) => {
            const active = isActive(path, href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 px-4 h-10 rounded-full font-semibold border transition-colors ${
                  active ? "bg-primary-soft text-primary border-primary/30" : "border-transparent text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" aria-hidden />
                {label}
                {badge && <DueBadge />}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link href={`/${locale}/search/`} className={icon} aria-label={t.nav.search} title={t.nav.search}>
            <Search className="w-5 h-5" />
          </Link>
          <ThemeToggle />
          <Link href={`/${locale}/settings/`} className={`${icon} hidden sm:flex`} aria-label={t.nav.settings} title={t.nav.settings}>
            <Settings className="w-5 h-5" />
          </Link>
          <Link
            href={switchHref}
            hrefLang={other}
            className="h-10 px-3.5 rounded-full flex items-center gap-1 font-semibold border border-border hover:border-primary"
            aria-label={other === "en" ? "Switch to English" : "বাংলায় দেখুন"}
          >
            {other === "en" ? "EN" : "বাং"}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  const items = useItems();
  return (
    <nav
      className="md:hidden fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 rounded-3xl bg-surface/95 backdrop-blur border border-border shadow-[var(--shadow-lg)]"
      aria-label="Main"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon, exact, badge }) => {
          const active = isActive(path, href, exact);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 h-[4.25rem] text-[0.78rem] font-semibold ${
                  active ? "text-primary" : "text-muted"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className={`flex items-center justify-center w-14 h-8 rounded-full transition-colors ${active ? "bg-primary-soft" : ""}`}>
                  <Icon className="w-6 h-6" aria-hidden />
                </span>
                {label}
                {badge && <DueBadge className="absolute top-1 right-[18%] min-w-5 h-5 text-[0.65rem]" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
