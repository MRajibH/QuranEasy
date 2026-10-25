"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Plus, X } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { AudioButton, Meaning } from "./ui";
import { addToReview, useCard } from "@/lib/progress";
import { isKnown } from "@/lib/srs";
import { useSettings } from "@/lib/settings";
import { num } from "@/lib/i18n";
import { WORD_PAGE_MIN_FREQ } from "@/lib/constants";
import type { LemmaLite } from "@/lib/types";

export interface SheetWord {
  /** the word as it appears in the ayah (optional when opened from search) */
  form?: { ar: string; tr: string; bn: string; en: string; loc: string };
  lemma: LemmaLite;
}

/** Bottom sheet (mobile) / dialog (desktop) with a word's meaning, root, audio and review status. */
export function WordSheet({ word, onClose }: { word: SheetWord | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (word && !d.open) d.showModal();
    if (!word && d.open) d.close();
  }, [word]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto md:m-auto w-full max-w-none md:max-w-lg rounded-t-3xl md:rounded-3xl bg-surface text-text p-0 backdrop:bg-black/50"
    >
      {word && <SheetBody word={word} onClose={onClose} />}
    </dialog>
  );
}

function SheetBody({ word, onClose }: { word: SheetWord; onClose: () => void }) {
  const { locale, t } = useLocale();
  const { translit } = useSettings();
  const [id, ar, bn, en, tr, freq, root, firstLoc] = word.lemma;
  const card = useCard(id);
  const form = word.form;
  const sameAsLemma = !form || form.ar === ar;

  return (
    <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[85dvh] overflow-y-auto">
      <div className="flex justify-between items-start gap-3">
        <span className="mx-auto md:hidden w-12 h-1.5 rounded-full bg-border -mt-2 mb-2" aria-hidden />
        <button type="button" onClick={onClose} className="ml-auto w-11 h-11 rounded-full flex items-center justify-center hover:bg-surface-2" aria-label={t.common.close}>
          <X className="w-6 h-6" />
        </button>
      </div>
      {form && (
        <div className="text-center">
          <p className="font-arabic ar-xl" lang="ar" dir="rtl">{form.ar}</p>
          {translit && form.tr && <p className="text-muted italic mt-1">{form.tr}</p>}
          <p className="text-sm font-semibold text-muted mt-3">{t.common.inContext}</p>
          <Meaning bn={form.bn} en={form.en} size="lg" />
        </div>
      )}
      <div className={`${form ? "mt-5 pt-5 border-t border-border" : ""} text-center`}>
        {form && !sameAsLemma && <p className="text-sm font-semibold text-muted">{t.common.dictionaryMeaning}</p>}
        {!sameAsLemma || !form ? (
          <>
            <p className="font-arabic ar-lg" lang="ar" dir="rtl">{ar}</p>
            {translit && tr && <p className="text-muted italic mt-1">{tr}</p>}
            <Meaning bn={bn} en={en} size="md" className="mt-1" />
          </>
        ) : null}
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm">
          {root && (
            <span className="rounded-full bg-accent-soft text-accent px-3 py-1 font-semibold">
              {t.common.root}: <span className="font-arabic text-lg" lang="ar">{root}</span>
            </span>
          )}
          <span className="rounded-full bg-primary-soft text-primary px-3 py-1 font-semibold">{t.common.appearsTimes(num(locale, freq))}</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
        <AudioButton location={form?.loc ?? firstLoc} size="lg" />
        {card ? (
          <span className="h-14 rounded-2xl inline-flex items-center justify-center gap-2 font-semibold bg-success-soft text-success">
            <Check className="w-5 h-5" aria-hidden /> {isKnown(card) ? t.common.learned : t.common.added}
          </span>
        ) : (
          <button type="button" className="btn btn-primary h-14" onClick={() => addToReview(id)}>
            <Plus className="w-5 h-5" aria-hidden /> {t.common.addToReview}
          </button>
        )}
      </div>
      {freq >= WORD_PAGE_MIN_FREQ && (
        <Link href={`/${locale}/w/${id}/`} className="btn btn-ghost w-full mt-2">
          {t.common.seeWord}
        </Link>
      )}
    </div>
  );
}
