# QuranEasy — Roadmap

A free, fully static website to learn every word of the Qur'an in **Bangla first**, and English.
Built as sadaqah jariyah. Hosted free on Cloudflare Pages.

Status legend: ✅ done · 🚧 in progress · ⏳ planned

---

## Phase 0 — Data pipeline ✅
- [x] Download word-by-word data (Quran.com API): Arabic, transliteration, Bangla + English word meanings, ayah translations
- [x] Quranic Arabic Corpus morphology → lemma + root for all 77,429 words
- [x] Frequency-ordered lemmas (4,806); top 300 cover **74.2%** of the Qur'an
- [x] Lessons of 10 words, per-surah word-by-word JSON, example ayat (short, de-duplicated)

## Phase 1 — Foundation ✅
- [x] Next.js 15 static export, Tailwind v4 design tokens, light/dark themes
- [x] Bangla/English UI (`/bn`, `/en`), Bangla digits, Bangla fonts
- [x] Accessible for all ages: 18px base text, 48px+ tap targets, text-size setting, icons + labels

## Phase 2 — Learn & review ✅
- [x] Learning path (481 lessons in stages) with coverage per stage
- [x] Lesson flow: meet words → quiz with re-queue until correct → result
- [x] FSRS spaced repetition (flashcards + multiple choice, 20-min learn-ahead)
- [x] Practice games: pick meaning, pick Arabic, listen & choose, match pairs

## Phase 3 — Read, search, progress ✅
- [x] Word-by-word reader for all 114 surahs, tap any word, known words underlined
- [x] Static word pages (2,101 lemmas × 2 languages) for SEO
- [x] Search by Bangla / English / transliteration / Arabic / root
- [x] Progress dashboard: coverage ring, streak, heatmap, 7-day forecast, backup/restore

## Phase 4 — PWA, SEO, launch prep ✅
- [x] Service worker (offline app shell + data), installable manifest, icons, OG image
- [x] Sitemap with hreflang, robots, canonical URLs, JSON-LD
- [x] Cloudflare `_headers`, file-count guard for the free tier (20k files)
- [x] About (method, sources, privacy), Support pages; unit tests

## Phase 5 — Deploy ⏳ (owner action)
- [ ] Connect GitHub repo to Cloudflare Pages (see README → Deploy)
- [ ] Optional: custom domain, Cloudflare Web Analytics (cookie-less)
- [ ] Beta with family/masjid group, collect feedback

## Phase 6 — Premium UI 🚧
- [ ] Refined visual language: Islamic geometric pattern accents, layered soft shadows, gradient hero
- [ ] Premium flashcard: 3D flip, satisfying correct/wrong micro-interactions
- [ ] Celebration on lesson complete (lightweight confetti), milestone badges
- [ ] Skeleton loaders instead of spinners; smoother transitions
- [ ] Polished mobile layout (no awkward wrapping), larger Arabic on phones
- [ ] Dark-mode polish and contrast review

## Phase 7 — Daily words, mastered inside-out (Bangla first) 🚧
- [ ] **আজকের শব্দ (Words of the Day):** 2 new words every day, same for everyone (shareable)
- [ ] Deep word study, Bangla first:
  - [ ] লিঙ্গ (gender): পুংলিঙ্গ / স্ত্রীলিঙ্গ — মুযাক্কার / মুয়ান্নাস
  - [ ] বচন (number): একবচন / দ্বিবচন / বহুবচন with real forms from the Qur'an
  - [ ] শব্দের ধরন: ক্রিয়া, বিশেষ্য, বিশেষণ, ইসমে ফায়েল, ইসমে মাফউল, মাসদার, verb form (বাব)
  - [ ] একই মূলের শব্দ (root family)
  - [ ] সমার্থক ও বিপরীত শব্দ (synonyms / antonyms) — curated, well-established Qur'anic pairs only
- [ ] **Word-wise progress:** “কুরআনের ৭৭,৪২৯ শব্দের মধ্যে আপনি ___টি চেনেন (__%)”
- [ ] Root URL always opens Bangla first

## Phase 8 — Content quality ⏳
- [ ] Scholar review of the top 500 Bangla base meanings; `data/overrides.json` for corrections
- [ ] Expand curated synonyms/antonyms with review
- [ ] Report-a-mistake link on every word

## Phase 9 — Growth ⏳
- [ ] Surah-focused decks (e.g. Juz ʿAmma, Al-Fatiha first)
- [ ] Grammar mini-lessons (pronoun suffixes, verb forms I–X)
- [ ] Optional cloud sync (Cloudflare D1) only if users ask
- [ ] More languages (Urdu, Indonesian)
