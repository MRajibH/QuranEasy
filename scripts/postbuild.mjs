// Runs after `next build`: writes out/sw.js with the precache list for this build
// and sanity-checks the export against Cloudflare Pages' free-tier limits.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("out");
const CF_MAX_FILES = 20000;
const CF_MAX_FILE_BYTES = 25 * 1024 * 1024;

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = await walk(OUT);
const rel = (p) => "/" + path.relative(OUT, p).split(path.sep).join("/");

// App shell for both languages + every hashed asset (JS, CSS, fonts).
const shellPages = ["", "salah/", "daily/", "learn/", "decks/", "grammar/", "lesson/", "review/", "practice/", "progress/", "settings/", "search/", "read/", "about/"];
const precache = [
  "/",
  ...["bn", "en"].flatMap((l) => shellPages.map((p) => `/${l}/${p}`)),
  "/data/lemmas-lite.json",
  "/data/surahs.json",
  "/data/daily.json",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/favicon.ico",
  ...files.map(rel).filter((f) => f.startsWith("/_next/static/")),
];

const buildId = (await fs.readFile(path.resolve(".next/BUILD_ID"), "utf8")).trim();
const template = await fs.readFile(path.resolve("scripts/sw-template.js"), "utf8");
await fs.writeFile(
  path.join(OUT, "sw.js"),
  template.replace("__VERSION__", buildId).replace("__PRECACHE__", JSON.stringify(precache)),
);

const big = [];
for (const f of files) {
  const { size } = await fs.stat(f);
  if (size > CF_MAX_FILE_BYTES) big.push(rel(f));
}
const count = files.length + 1;
console.log(`sw.js ✓ (${precache.length} precached) · ${count} files in out/`);
if (count > CF_MAX_FILES || big.length) {
  console.error(`Cloudflare Pages limit exceeded: ${count} files (max ${CF_MAX_FILES}); oversized: ${big.join(", ") || "none"}`);
  process.exit(1);
}
