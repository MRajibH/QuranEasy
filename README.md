# QuranEasy — কুরআনের প্রতিটি শব্দ সহজে শিখুন

A free, fully static website to learn **every word of the Qur'an** in **Bangla** (first) and **English**,
using frequency-first lessons and spaced repetition. No account, no ads, works offline.
Built with the intention of sadaqah jariyah.

- 77,429 words · 4,806 base words (lemmas) · 481 lessons of 10 words
- The 300 most frequent lemmas cover **74.2%** of all words in the Qur'an
- Word-by-word reader for all 114 surahs, with recitation audio
- FSRS spaced repetition, practice games, progress dashboard, offline PWA

See [ROADMAP.md](ROADMAP.md) for phases and status.

## Tech

Next.js 15 (App Router, `output: "export"`) · TypeScript · Tailwind CSS v4 · Dexie (IndexedDB) · ts-fsrs · lucide-react.
All progress is stored locally in the browser; there is no server.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit tests (vitest)
npm run lint
npm run build        # static site in out/ (+ service worker, Cloudflare limit check)
npm start            # serve out/ locally
```

### Data

Generated data is committed (`data/`, `public/data/`), so a normal build needs no network.
To regenerate from the sources:

```bash
npm run data:fetch   # downloads raw data into data-raw/ (gitignored)
npm run data:build   # writes data/lemmas.json, public/data/**
npm run icons        # regenerates icons and og.png
```

## Deploy (Cloudflare, free)

The site is fully static: `npm run build` writes it to `out/`, and `wrangler.jsonc` tells Cloudflare to
serve that folder as static assets (no server, no Next.js adapter).

1. Cloudflare dashboard → Workers & Pages → Create → Import a repository → pick `MRajibH/QuranEasy`.
2. Build command: `npm run build` · Deploy command: `npx wrangler deploy` (the defaults Cloudflare suggests).
3. Variables: `NODE_VERSION` = `22`, and `NEXT_PUBLIC_SITE_URL` = your final URL, e.g. `https://quraneasy.rajib.uk` (used for the sitemap and
   social previews).
4. Save and deploy. Every push to `main` redeploys automatically.

Classic Pages projects work too: build command `npm run build`, output directory `out`.

Do not let Cloudflare set up OpenNext / `@opennextjs/cloudflare` for this project — that is for server-rendered
Next.js apps and fails on a static export. The committed `wrangler.jsonc` prevents that auto-setup.

The export is ~12,300 files, within the free tier's 20,000-file limit; `npm run build` fails loudly if a
future change exceeds it.

## Sources & credits

- Word-by-word meanings, transliteration, recitation audio: [Quran.com](https://quran.com) API / QuranCDN
- Lemmas and roots: [Quranic Arabic Corpus](https://corpus.quran.com) (GNU GPL)
- Bangla translation: Taisirul Quran (Tawheed Publication) · English: Saheeh International

Base meanings for each lemma are selected automatically from the word-by-word data. Please report mistakes
via [GitHub issues](https://github.com/MRajibH/QuranEasy/issues). Translations are the property of their
publishers; check their terms before any commercial use.

## License

Code: GPL-3.0-or-later (compatible with the Quranic Arabic Corpus license).
