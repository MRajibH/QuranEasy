"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { DEFAULT_SALAH, type SalahPrefs } from "./salah";

// Prayer settings live in their own localStorage key (they are not part of learning progress).
const KEY = "qe-salah";
let cache: SalahPrefs | null = null;
const listeners = new Set<() => void>();

function read(): SalahPrefs {
  if (cache) return cache;
  try {
    cache = { ...DEFAULT_SALAH, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    cache = { ...DEFAULT_SALAH };
  }
  return cache!;
}

export function updateSalah(patch: Partial<SalahPrefs>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach((l) => l());
}

export function useSalahPrefs(): SalahPrefs {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => DEFAULT_SALAH,
  );
}

/** Current time, ticking every `ms` (null during server render to avoid hydration mismatch). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export type LocateState = "idle" | "locating" | "denied" | "unavailable";

/** Asks the browser for the device position (used only on the device to calculate times). */
export function locate(onState: (s: LocateState) => void) {
  if (!("geolocation" in navigator)) return onState("unavailable");
  onState("locating");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      updateSalah({ place: { kind: "gps", lat: Math.round(pos.coords.latitude * 1e4) / 1e4, lng: Math.round(pos.coords.longitude * 1e4) / 1e4 } });
      onState("idle");
    },
    (err) => onState(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600 * 1000 },
  );
}
