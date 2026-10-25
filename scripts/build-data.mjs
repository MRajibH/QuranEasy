// Turns data-raw/ into the compact JSON the app ships in public/data/.
//   data/lemmas.json             – full lemma records (build-time only: word pages)
//   public/data/lemmas-lite.json – compact lemma list for the client (review, search, quiz)
//   public/data/lessons/N.json   – one lesson: its lemmas + a short example ayah each
//   public/data/surahs.json      – surah index
//   public/data/surah/N.json     – word-by-word text for one surah, each word linked to a lemma
// Lemma ids are frequency ranks, so lesson N always holds ids (N-1)*LESSON_SIZE+1 … N*LESSON_SIZE.
import fs from "node:fs/promises";
import path from "node:path";

const RAW = path.resolve("data-raw");
const OUT = path.resolve("public/data");
const BUILD_OUT = path.resolve("data");
const LESSON_SIZE = 10;
const MAX_FORMS = 6;
const EXAMPLES_PER_LEMMA = 3;

const readJson = async (p) => JSON.parse(await fs.readFile(p, "utf8"));
const clean = (s) =>
  (s ?? "")
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Word glosses sometimes carry stray quotes/punctuation from the source text.
const cleanWord = (s) =>
  clean(s)
    .replace(/["“”‘’]/g, "")
    .replace(/^[\s,;:.।]+|[\s,;:.।]+$/g, "")
    .trim();

// ---- morphology: location "s:a:w" -> primary (stem) segment ----
function parseMorphology(text) {
  const words = new Map();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const [loc, , tag, feat] = line.split("\t");
    const [s, a, w] = loc.split(":");
    const key = `${s}:${a}:${w}`;
    const feats = feat.split("|");
    const seg = {
      tag,
      lemma: feats.find((f) => f.startsWith("LEM:"))?.slice(4),
      root: feats.find((f) => f.startsWith("ROOT:"))?.slice(5),
      affix: feats.includes("PREF") || feats.includes("SUFF"),
    };
    if (!words.has(key)) words.set(key, []);
    words.get(key).push(seg);
  }
  const primary = new Map();
  for (const [key, segs] of words) {
    const stem =
      segs.find((x) => x.root) ?? segs.find((x) => !x.affix && x.lemma) ?? segs[0];
    primary.set(key, { ...stem, single: segs.length === 1 });
  }
  return primary;
}

function mostCommon(counter) {
  let best = null;
  for (const [k, n] of counter) if (!best || n > best[1]) best = [k, n];
  return best?.[0] ?? "";
}

const bump = (map, k) => k && map.set(k, (map.get(k) ?? 0) + 1);

async function main() {
  const morph = parseMorphology(await fs.readFile(path.join(RAW, "morphology.txt"), "utf8"));
  const chaptersEn = await readJson(path.join(RAW, "chapters-en.json"));
  const chaptersBn = await readJson(path.join(RAW, "chapters-bn.json"));

  const lemmaKeys = new Map(); // lemma text -> stats
  const surahs = [];
  let totalWords = 0;

  for (let c = 1; c <= 114; c++) {
    const en = await readJson(path.join(RAW, "qcom/en", `${c}.json`));
    const bn = await readJson(path.join(RAW, "qcom/bn", `${c}.json`));
    const verses = en.map((ve, i) => {
      const vb = bn[i];
      const wordsBn = vb.words.filter((w) => w.char_type_name === "word");
      const words = ve.words
        .filter((w) => w.char_type_name === "word")
        .map((w, j) => {
          const m = morph.get(w.location);
          if (!m) throw new Error(`no morphology for ${w.location}`);
          const key = m.lemma ?? w.text_uthmani;
          let st = lemmaKeys.get(key);
          if (!st) {
            st = { key, root: m.root ?? "", tag: m.tag, freq: 0, en: new Map(), bn: new Map(),
              enAll: new Map(), bnAll: new Map(), tr: new Map(), forms: new Map(), occ: [] };
            lemmaKeys.set(key, st);
          }
          const tEn = cleanWord(w.translation?.text);
          const tBn = cleanWord(wordsBn[j]?.translation?.text);
          st.freq++;
          bump(st.enAll, tEn);
          bump(st.bnAll, tBn);
          if (m.single) {
            bump(st.en, tEn);
            bump(st.bn, tBn);
            bump(st.tr, w.transliteration?.text);
          }
          const form = st.forms.get(w.text_uthmani) ?? { n: 0, en: tEn, bn: tBn, tr: w.transliteration?.text ?? "" };
          form.n++;
          st.forms.set(w.text_uthmani, form);
          st.occ.push(w.location);
          totalWords++;
          return { ar: w.text_uthmani, tr: w.transliteration?.text ?? "", en: tEn, bn: tBn, key };
        });
      return {
        n: ve.verse_number,
        en: clean(ve.translations?.[0]?.text),
        bn: clean(vb.translations?.[0]?.text),
        words,
      };
    });
    surahs.push({ c, verses });
  }

  // verse length (in words) lets us pick short, readable example ayat
  const verseLen = new Map();
  for (const { c, verses } of surahs) for (const v of verses) verseLen.set(`${c}:${v.n}`, v.words.length);
  // Some ayat repeat verbatim (e.g. 26:108/110/126), so dedupe by text, not just by reference.
  const verseText = new Map();
  for (const { c, verses } of surahs) for (const v of verses) verseText.set(`${c}:${v.n}`, v.words.map((w) => w.ar).join(" "));
  const pickExamples = (occ) => {
    const seen = new Set();
    const uniq = occ.filter((loc) => {
      const text = verseText.get(loc.split(":").slice(0, 2).join(":"));
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    });
    // prefer short ayat (3–12 words) so the example fits on a card
    const len = (loc) => verseLen.get(loc.split(":").slice(0, 2).join(":"));
    const score = (loc) => (len(loc) < 3 ? 100 + len(loc) : len(loc) > 12 ? 50 + len(loc) : len(loc));
    return uniq.sort((a, b) => score(a) - score(b)).slice(0, EXAMPLES_PER_LEMMA);
  };

  // ---- lemmas ordered by frequency, ids 1..N ----
  const ordered = [...lemmaKeys.values()].sort((a, b) => b.freq - a.freq || a.key.localeCompare(b.key));
  const idOf = new Map(ordered.map((st, i) => [st.key, i + 1]));
  const lemmas = ordered.map((st, i) => ({
    id: i + 1,
    ar: st.key,
    root: st.root ? [...st.root].join(" ") : "",
    pos: st.tag,
    freq: st.freq,
    bn: mostCommon(st.bn) || mostCommon(st.bnAll),
    en: mostCommon(st.en) || mostCommon(st.enAll),
    tr: mostCommon(st.tr),
    refs: pickExamples(st.occ),
    forms: [...st.forms.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, MAX_FORMS)
      .map(([ar, f]) => ({ ar, ...f })),
  }));

  const verseOf = new Map();
  for (const { c, verses } of surahs) for (const v of verses) verseOf.set(`${c}:${v.n}`, v);
  const example = (loc) => {
    const [c, a, w] = loc.split(":").map(Number);
    const v = verseOf.get(`${c}:${a}`);
    return { ref: `${c}:${a}`, w: v.words.map((x) => x.ar), hi: w - 1, en: v.en, bn: v.bn };
  };

  // ---- write ----
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(path.join(OUT, "surah"), { recursive: true });
  await fs.mkdir(path.join(OUT, "lessons"), { recursive: true });
  await fs.mkdir(BUILD_OUT, { recursive: true });
  await fs.writeFile(path.join(BUILD_OUT, "lemmas.json"), JSON.stringify(lemmas));

  // lite tuple: [id, arabic, bangla, english, transliteration, freq, root, firstLocation]
  await fs.writeFile(
    path.join(OUT, "lemmas-lite.json"),
    JSON.stringify(lemmas.map((l) => [l.id, l.ar, l.bn, l.en, l.tr, l.freq, l.root, l.refs[0]])),
  );

  let covered = 0;
  const lessonIndex = [];
  for (let i = 0; i < lemmas.length; i += LESSON_SIZE) {
    const chunk = lemmas.slice(i, i + LESSON_SIZE);
    covered += chunk.reduce((s, l) => s + l.freq, 0);
    const id = lessonIndex.length + 1;
    const coverage = Math.round((covered / totalWords) * 1000) / 10;
    lessonIndex.push({ id, from: chunk[0].id, to: chunk.at(-1).id, coverage });
    await fs.writeFile(
      path.join(OUT, "lessons", `${id}.json`),
      JSON.stringify({
        id,
        coverage,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop build-only fields
        words: chunk.map(({ forms, refs, ...l }) => ({ ...l, ex: example(refs[0]) })),
      }),
    );
  }
  await fs.writeFile(path.join(OUT, "lessons.json"), JSON.stringify(lessonIndex));

  await fs.writeFile(
    path.join(OUT, "surahs.json"),
    JSON.stringify(
      chaptersEn.map((ch, i) => ({
        n: ch.id,
        ar: ch.name_arabic,
        name: ch.name_simple,
        en: ch.translated_name.name,
        bn: chaptersBn[i].translated_name.name,
        verses: ch.verses_count,
        place: ch.revelation_place,
      })),
    ),
  );
  for (const { c, verses } of surahs) {
    // word tuple: [arabic, transliteration, english, bangla, lemmaId]
    const compact = verses.map((v) => ({
      n: v.n,
      en: v.en,
      bn: v.bn,
      w: v.words.map((w) => [w.ar, w.tr, w.en, w.bn, idOf.get(w.key)]),
    }));
    await fs.writeFile(path.join(OUT, "surah", `${c}.json`), JSON.stringify(compact));
  }
  await fs.writeFile(
    path.join(BUILD_OUT, "stats.json"),
    JSON.stringify({ totalWords, lemmas: lemmas.length, lessons: lessonIndex.length, lessonSize: LESSON_SIZE }),
  );

  console.log(`words: ${totalWords}  lemmas: ${lemmas.length}  lessons: ${lessonIndex.length}`);
  const top300 = lemmas.slice(0, 300).reduce((s, l) => s + l.freq, 0);
  console.log(`top 300 lemmas cover ${((top300 / totalWords) * 100).toFixed(1)}% of the Qur'an`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
