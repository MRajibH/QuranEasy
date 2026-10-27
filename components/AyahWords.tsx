"use client";

import { useState } from "react";
import { playWord } from "@/lib/audio";
import { scriptClass, useIndopak } from "./useIndopak";

/**
 * An ayah (or part of one) where every word can be tapped to hear its exact recitation.
 * `verseRef` is "surah:ayah"; words are numbered from `start` (1 for a full ayah, more for a trimmed window).
 */
export function AyahWords({
  verseRef,
  words,
  hi,
  start = 1,
  className = "",
}: {
  verseRef: string;
  words: string[];
  hi?: number;
  start?: number;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [s, a] = verseRef.split(":").map(Number);
  const ip = useIndopak(s)?.[a - 1];
  let n = start - 1;
  return (
    <p className={`${scriptClass(!!ip)} ${className}`} lang="ar" dir="rtl">
      {words.map((w, i) => {
        if (w === "…") return <span key={i} className="text-muted"> … </span>;
        const loc = `${verseRef}:${++n}`;
        return (
          <span key={i}>
            <button
              type="button"
              onClick={async () => {
                setActive(i);
                await playWord(loc);
                setActive((a) => (a === i ? null : a));
              }}
              className={`rounded-lg px-0.5 transition-colors hover:bg-primary-soft ${i === hi ? "hl-word" : ""} ${active === i ? "ring-2 ring-accent" : ""}`}
            >
              {ip?.[n - 1] ?? w}
            </button>{" "}
          </span>
        );
      })}
    </p>
  );
}
