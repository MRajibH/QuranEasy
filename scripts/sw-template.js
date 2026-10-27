/* QuranEasy service worker — generated into out/sw.js by scripts/postbuild.mjs. */
const VERSION = "__VERSION__";
const PRECACHE = __PRECACHE__;

const STATIC_CACHE = `qe-static-${VERSION}`;
const PAGES_CACHE = "qe-pages";
const DATA_CACHE = "qe-data";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("qe-static-") && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function fromCache(request, opts) {
  const keys = await caches.keys();
  for (const k of keys) {
    const hit = await (await caches.open(k)).match(request, opts);
    if (hit) return hit;
  }
  return undefined;
}

/** Serve cached copy immediately, refresh it in the background. */
async function staleWhileRevalidate(request, cacheName, opts) {
  const cache = await caches.open(cacheName);
  const cached = (await cache.match(request, opts)) ?? (await fromCache(request, opts));
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached ?? (await network) ?? Response.error();
}

/** Data: always fresh when online (its format can change between deploys), cached copy when offline. */
async function networkFirstData(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (await cache.match(request)) ?? Response.error();
  }
}

/** Pages: try the network first so updates show up, fall back to cache when offline. */
async function networkFirstPage(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const url = new URL(request.url);
    const locale = url.pathname.startsWith("/en") ? "en" : "bn";
    return (
      (await fromCache(request, { ignoreSearch: true })) ??
      (await fromCache(`/${locale}/`)) ??
      new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // audio etc. go straight to the network

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(fromCache(request).then((hit) => hit ?? fetch(request)));
  } else if (url.pathname.startsWith("/data/")) {
    event.respondWith(networkFirstData(request));
  } else {
    // RSC payloads (index.txt?_rsc=…) and other same-origin files
    event.respondWith(staleWhileRevalidate(request, PAGES_CACHE, { ignoreSearch: url.pathname.endsWith(".txt") }));
  }
});
