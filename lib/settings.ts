"use client";

import { useSyncExternalStore } from "react";
import { SETTINGS_KEY } from "./theme";

export { SETTINGS_KEY, LOCALE_KEY } from "./theme";

export type MeaningLang = "bn" | "en" | "both";
export type Theme = "system" | "light" | "dark";

export interface Settings {
  meaning: MeaningLang;
  dailyNew: number;
  uiScale: number;
  arScale: number;
  theme: Theme;
  translit: boolean;
  autoplay: boolean;
  onboarded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  meaning: "both",
  dailyNew: 10,
  uiScale: 1,
  arScale: 1,
  theme: "system",
  translit: true,
  autoplay: false,
  onboarded: false,
};

let cache: Settings | null = null;
const listeners = new Set<() => void>();

function read(): Settings {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    cache = { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    cache = { ...DEFAULT_SETTINGS };
  }
  return cache!;
}

/** Applies theme + text sizes to <html>. The same logic runs inline before first paint (see ThemeScript). */
export function applySettings(s: Settings) {
  const root = document.documentElement;
  const dark = s.theme === "dark" || (s.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.style.setProperty("--ui-scale", String(s.uiScale));
  root.style.setProperty("--ar-scale", String(s.arScale));
}

export function updateSettings(patch: Partial<Settings>) {
  const next = { ...read(), ...patch };
  cache = next;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {}
  applySettings(next);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_SETTINGS);
}
