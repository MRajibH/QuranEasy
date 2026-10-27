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

## Phase 5 — Deploy ✅
- [x] Live at https://quraneasy.rajib.uk (Cloudflare, auto-deploys from main)
- [ ] Add the site to Google Search Console and submit /sitemap.xml
- [ ] Optional: custom domain, Cloudflare Web Analytics (cookie-less)
- [ ] Beta with family/masjid group, collect feedback

## Phase 6 — Premium UI ✅
- [x] Refined visual language: deep-green hero with Rub el Hizb pattern and gold ayah, layered soft shadows, gradient buttons
- [x] Premium flashcard with 3D flip; correct answers bump, wrong answers shake
- [x] Lightweight confetti on lesson complete, review done, daily words and high practice scores (respects reduced motion)
- [x] Skeleton loaders instead of spinners; gradient progress ring and bars
- [x] Mobile polish: no horizontal overflow on any page at 375px, compact header, shorter hero on phones
- [x] Dark-mode tokens for shadows, hero and pattern

## Phase 7 — Daily words, mastered inside-out (Bangla first) ✅
- [x] **আজকের শব্দ (Words of the Day):** 2 new words every day — the most frequent content words you haven't started, never repeated
- [x] Deep word study (also on every word page), Bangla first with Arabic grammar terms:
  - [x] লিঙ্গ: পুংলিঙ্গ (মুযাক্কার) / স্ত্রীলিঙ্গ (মুয়ান্নাস) — shown only when trustworthy (feminine marker or curated list)
  - [x] বচন: একবচন / দ্বিবচন / বহুবচন with real forms from the Qur'an; verbs: মাযী / মুযারে / আমর
  - [x] শব্দের ধরন: ইসম, সিফাত, ফে'ল, ইসমে ফায়েল, ইসমে মাফউল, মাসদার, বাব (verb form)
  - [x] একই মূলের শব্দ (root family)
  - [x] সমার্থক ও বিপরীত শব্দ — curated in `data/curated/relations.json` (39 antonym pairs, 11 synonym groups)
- [x] **Word-wise progress:** “কুরআনের ৭৭,৪২৯ শব্দের মধ্যে আপনি ___টি চেনেন (__%)” on Today and Progress
- [x] Root URL always opens Bangla first

## Phase 8 — Content quality ⏳
- [ ] Scholar review of the top 500 Bangla base meanings; `data/overrides.json` for corrections
- [ ] Expand curated synonyms/antonyms with review
- [ ] Report-a-mistake link on every word

## Phase 9 — Surah decks & grammar 🚧
- [x] **সূরা ধরে শিখুন (surah decks):** Al-Fatiha and Juz ʿAmma featured, plus every surah; 10-word parts,
      examples taken from the surah itself, “এই সূরার __% শব্দ আপনি চেনেন”
- [x] Entry points: Learn tabs, “learn this surah's words” in the reader, Al-Fatiha option in onboarding
- [x] **সহজ আরবি ব্যাকরণ:** 12 Bangla-first mini-lessons (word types, roots, ال, gender, number, attached and
      separate pronouns, tenses, past endings, present prefixes, participles, particles) with quizzes
- [x] Every grammar example verified to occur in the Qur'an (unit test) and shown in Uthmani script with audio
- [x] **Exact pronunciation everywhere:** every base word plays its own recitation standing alone; every word in
      the reader and in example ayat is tappable; “listen word by word” per ayah with highlighting; play
      buttons on forms, root family, synonyms/antonyms and search results
- [x] **Ayah understanding:** surah and per-ayah “words you know” in the reader; “Complete the ayah” practice game
- [x] Shareable progress image (“আমি কুরআনের __% শব্দ চিনি”) via the phone's share sheet
- [x] Report-a-mistake on every word; hand-reviewed base meanings in `data/curated/meanings.json`
- [x] Modern home: Today first, quick actions to every way of learning; floating bottom navigation
- [x] Canonical domain https://quraneasy.rajib.uk for sitemap and social previews
- [x] **IndoPak (Hafezi) script** option — reader, examples and occurrence lists; chosen at setup or in Settings
- [x] **Every place a word appears** on word pages (all occurrences, 20 at a time, tappable words)
- [x] **Full-ayah recitation:** 7 reciters, play whole surah, repeat each ayah 1/3/5/10× for memorising
- [x] **নামাযের সময় (prayer times):** by the user's location (GPS, calculated on-device) or any of the 64 districts;
      next-prayer countdown, Jumu'ah on Fridays, Sehri/Iftar, Tahajjud, forbidden times, Qibla compass,
      monthly timetable, upcoming Islamic days, Ayyam al-Beed; Karachi/Hanafi defaults, Hijri moon-sighting adjustment
- [x] Three dates every day: Hijri (Bangla + Arabic), Bangla বঙ্গাব্দ (2019 revision), Gregorian; Arabic weekday names
- [x] Home strip with the next prayer and Hijri date
- [ ] Optional cloud sync (Cloudflare D1) only if users ask
- [ ] More languages (Urdu, Indonesian)
