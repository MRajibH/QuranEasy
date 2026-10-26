import Link from "next/link";
import { ArrowLeftRight, BookOpenText, Equal, GitBranch, Shapes } from "lucide-react";
import { AudioButton } from "./ui";
import { getDict, num } from "@/lib/i18n";
import { grammarChips, grammarLabels } from "@/lib/grammar";
import { WORD_PAGE_MIN_FREQ } from "@/lib/constants";
import type { Locale, Relation, WordDetail } from "@/lib/types";

// Hook-free so it renders both in static word pages (server) and on the daily page (client).

const SECTION = "card p-5 md:p-6";

function Heading({ icon: Icon, children }: { icon: typeof Shapes; children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
      <span className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" aria-hidden />
      </span>
      {children}
    </h2>
  );
}

function RelationList({ items, locale }: { items: Relation[]; locale: Locale }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map(([id, ar, bn, en, freq, audio]) => {
        const body = (
          <>
            <span className="font-arabic ar-sm min-w-16 text-center" lang="ar" dir="rtl">{ar}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold truncate" lang={locale}>{locale === "bn" ? bn : en}</span>
              <span className="block text-sm text-muted truncate">{locale === "bn" ? en : bn}</span>
            </span>
          </>
        );
        const cls = "flex-1 min-w-0 flex items-center gap-3 rounded-xl px-1 py-1";
        return (
          <li key={id} className="flex items-center gap-2 rounded-2xl bg-surface-2/70 px-2 py-1.5">
            <AudioButton location={audio} />
            {freq >= WORD_PAGE_MIN_FREQ ? (
              <Link href={`/${locale}/w/${id}/`} className={`${cls} hover:bg-primary-soft`}>{body}</Link>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function WordStudy({ word, locale }: { word: WordDetail; locale: Locale }) {
  const t = getDict(locale);
  const gl = grammarLabels(locale);
  const chips = grammarChips(word.g, locale);
  const formRows =
    word.g.kind === "verb"
      ? (["PERF", "IMPF", "IMPV"] as const).filter((k) => word.g.tense?.[k]).map((k) => [gl.tense[k], ...word.g.tense![k]!] as const)
      : (["S", "D", "P"] as const).filter((k) => word.g.num?.[k]).map((k) => [gl.num[k], ...word.g.num![k]!] as const);

  return (
    <div className="grid gap-4">
      <section className={SECTION} aria-labelledby={`grammar-${word.id}`}>
        <Heading icon={Shapes}>
          <span id={`grammar-${word.id}`}>{t.study.grammar}</span>
        </Heading>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-accent-soft text-accent px-4 py-1.5 font-semibold">{c}</span>
          ))}
          {word.root && (
            <span className="rounded-full bg-surface-2 px-4 py-1.5 font-semibold">
              {t.common.root}: <span className="font-arabic text-lg" lang="ar">{word.root}</span>
            </span>
          )}
        </div>
        {formRows.length > 0 && (
          <>
            <h3 className="font-semibold text-muted mt-5 mb-2">{word.g.kind === "verb" ? t.study.tenses : t.study.numbers}</h3>
            <ul className="grid gap-2 sm:grid-cols-3">
              {formRows.map(([label, ar, n]) => (
                <li key={label} className="rounded-2xl border-2 border-border p-3 text-center">
                  <span className="block text-sm font-semibold text-muted">{label}</span>
                  <span className="block font-arabic ar-md" lang="ar" dir="rtl">{ar}</span>
                  <span className="block text-xs text-muted">{num(locale, n)} {t.common.times}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {word.forms.length > 1 && (
        <section className={SECTION}>
          <Heading icon={BookOpenText}>{t.word.forms}</Heading>
          <ul className="divide-y divide-border">
            {word.forms.map((f) => (
              <li key={f.ar} className="py-3 flex items-center gap-3">
                <AudioButton location={f.loc} />
                <span className="font-arabic ar-sm min-w-24 text-right" lang="ar" dir="rtl">{f.ar}</span>
                <span className="flex-1">
                  <span className="block font-semibold">{locale === "bn" ? f.bn : f.en}</span>
                  <span className="block text-sm text-muted">{f.tr}</span>
                </span>
                <span className="text-sm text-muted whitespace-nowrap">{num(locale, f.n)} {t.common.times}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {word.syn.length > 0 && (
        <section className={SECTION}>
          <Heading icon={Equal}>{t.study.synonyms}</Heading>
          <p className="text-sm text-muted -mt-2 mb-3">{t.study.synonymsNote}</p>
          <RelationList items={word.syn} locale={locale} />
        </section>
      )}

      {word.ant.length > 0 && (
        <section className={SECTION}>
          <Heading icon={ArrowLeftRight}>{t.study.antonyms}</Heading>
          <RelationList items={word.ant} locale={locale} />
        </section>
      )}

      {word.family.length > 0 && (
        <section className={SECTION}>
          <Heading icon={GitBranch}>{t.study.family}</Heading>
          <p className="text-sm text-muted -mt-2 mb-3">{t.study.familyNote(word.root)}</p>
          <RelationList items={word.family} locale={locale} />
        </section>
      )}
    </div>
  );
}
