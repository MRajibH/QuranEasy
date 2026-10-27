"use client";

import { useEffect, useState } from "react";
import { loadIndopak } from "@/lib/data";
import { useSettings } from "@/lib/settings";

/**
 * IndoPak text for a surah (verses → words), or null while the Uthmani script is selected.
 * Words line up one-to-one with the Uthmani words, so callers swap text by index.
 */
export function useIndopak(surah: number | null): string[][] | null {
  const { script } = useSettings();
  const [data, setData] = useState<{ n: number; v: string[][] } | null>(null);
  useEffect(() => {
    if (script !== "indopak" || !surah) return;
    let live = true;
    loadIndopak(surah).then((v) => live && setData({ n: surah, v }), () => {});
    return () => {
      live = false;
    };
  }, [script, surah]);
  return script === "indopak" && data?.n === surah ? data.v : null;
}

/** Class for Qur'an text in the chosen script. */
export const scriptClass = (indopak: boolean) => (indopak ? "font-indopak" : "font-arabic");
