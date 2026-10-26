"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { drawProgressCard, type CardStats } from "@/lib/share-card";
import { SITE_URL } from "@/lib/constants";

/** Shares a progress image through the phone's share sheet, or downloads it on desktop. */
export function ShareProgress({ stats, className = "" }: { stats: CardStats; className?: string }) {
  const { locale, t } = useLocale();
  const [busy, setBusy] = useState(false);
  const share = async () => {
    setBusy(true);
    try {
      const blob = await drawProgressCard(locale, stats);
      const file = new File([blob], "quraneasy-progress.png", { type: "image/png" });
      const text = `${t.share.text} ${SITE_URL}/${locale}/`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text }).catch(() => {});
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } finally {
      setBusy(false);
    }
  };
  return (
    <button type="button" className={`btn btn-secondary ${className}`} onClick={share} disabled={busy}>
      <Share2 className="w-5 h-5" aria-hidden /> {t.share.button}
    </button>
  );
}
