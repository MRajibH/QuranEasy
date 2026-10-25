"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useLocale } from "./LocaleProvider";

/** Native share sheet where available, otherwise copies the site link. */
export function ShareButton({ label }: { label: string }) {
  const { locale, t } = useLocale();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${location.origin}/${locale}/`;
    const data = { title: "QuranEasy", text: t.appTagline, url };
    if (navigator.share) {
      await navigator.share(data).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <button type="button" className="btn btn-primary btn-lg" onClick={share}>
      {copied ? <Check className="w-5 h-5" aria-hidden /> : <Share2 className="w-5 h-5" aria-hidden />}
      {copied ? "✓" : label}
    </button>
  );
}
