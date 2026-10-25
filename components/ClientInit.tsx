"use client";

import { useEffect } from "react";
import { applySettings, useSettings } from "@/lib/settings";

/** Keeps <html> in sync with settings (incl. OS theme changes) and registers the service worker. */
export function ClientInit() {
  const settings = useSettings();

  useEffect(() => {
    applySettings(settings);
    if (settings.theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applySettings(settings);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    // Ask the browser not to evict our IndexedDB progress under storage pressure.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  return null;
}
