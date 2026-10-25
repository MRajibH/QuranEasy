"use client";

import { Check, Plus } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { AudioButton } from "./ui";
import { addToReview, useCard } from "@/lib/progress";
import { isKnown } from "@/lib/srs";

/** Listen + add-to-review controls, with the learner's current status for this word. */
export function WordActions({ lemmaId, audioLoc }: { lemmaId: number; audioLoc: string }) {
  const { t } = useLocale();
  const card = useCard(lemmaId);
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-3">
      <AudioButton location={audioLoc} size="lg" label />
      {card ? (
        <span className="h-14 px-5 rounded-full inline-flex items-center gap-2 font-semibold bg-success-soft text-success">
          <Check className="w-5 h-5" aria-hidden /> {isKnown(card) ? t.common.learned : t.common.added}
        </span>
      ) : (
        <button type="button" className="btn btn-secondary h-14 rounded-full" onClick={() => addToReview(lemmaId)}>
          <Plus className="w-5 h-5" aria-hidden /> {t.common.addToReview}
        </button>
      )}
    </div>
  );
}
