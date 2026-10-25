// Plain (server-safe) module: storage keys and the pre-paint theme script.
export const SETTINGS_KEY = "qe-settings";
export const LOCALE_KEY = "qe-locale";

/** Inline, render-blocking script that applies saved theme/sizes before paint (no flash). */
export const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem("${SETTINGS_KEY}")||"{}");var r=document.documentElement;var t=s.theme||"system";if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))r.classList.add("dark");if(s.uiScale)r.style.setProperty("--ui-scale",s.uiScale);if(s.arScale)r.style.setProperty("--ar-scale",s.arScale);}catch(e){}})();`;
