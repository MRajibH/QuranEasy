// Turns data-raw/ into the compact JSON the app ships in public/data/.
//   data/lemmas.json             – full lemma records (build-time only: word pages)
//   public/data/lemmas-lite.json – compact lemma list for the client (review, search, quiz)
//   public/data/lessons/N.json   – one lesson: its lemmas + a short example ayah each
//   public/data/surahs.json      – surah index
//   public/data/surah/N.json     – word-by-word text for one surah, each word linked to a lemma
//   public/data/word/ID.json     – deep study data for one lemma (grammar, root family, synonyms/antonyms)
//   public/data/daily.json       – content words eligible as "Words of the Day", by frequency
//   public/data/decks/ID.json    – surah decks (s1…s114) and Juz ʿAmma (juz30) for surah-focused study
//   data/decks.json              – deck index (build-time)
// Lemma ids are frequency ranks, so lesson N always holds ids (N-1)*LESSON_SIZE+1 … N*LESSON_SIZE.
import fs from "node:fs/promises";
import path from "node:path";

const RAW = path.resolve("data-raw");
const OUT = path.resolve("public/data");
const BUILD_OUT = path.resolve("data");
const LESSON_SIZE = 10;
const MAX_FORMS = 6;
const MAX_FAMILY = 8;
const WORD_PAGE_MIN_FREQ = 3; // keep in sync with lib/constants.ts
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
    .replace(/^[\s,;:.।'`]+|[\s,;:.।'`]+$/g, "")
    .trim();

// ---- morphology: location "s:a:w" -> primary (stem) segment ----
function parseMorphology(text) {
  const words = new Map();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const [loc, text, tag, feat] = line.split("\t");
    const [s, a, w] = loc.split(":");
    const key = `${s}:${a}:${w}`;
    const feats = feat.split("|");
    const seg = {
      text,
      tag,
      feats,
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

// ---- grammar: gender/number/tense/verb form, counted over every occurrence of a lemma ----
const GN = /^(M|F)(S|D|P)?$/;
const newGrammar = () => ({ kind: new Map(), sub: new Map(), vf: new Map(), gender: new Map(), num: new Map(), tense: new Map() });
// Forms are counted twice: words standing alone (no attached prefix/suffix) are preferred for display.
const bumpForm = (map, cat, word, single) => {
  if (!map.has(cat)) map.set(cat, { single: new Map(), any: new Map() });
  const f = map.get(cat);
  bump(f.any, word);
  if (single) bump(f.single, word);
};

function noteGrammar(g, m, word) {
  const f = m.feats;
  const kind =
    m.tag === "V" ? "verb"
    : m.tag !== "N" ? "particle"
    : f.includes("PN") ? "proper"
    : f.some((x) => x === "PRON" || x === "DEM" || x === "REL") ? "pronoun"
    : f.includes("ADJ") ? "adj"
    : "noun";
  bump(g.kind, kind);
  for (const s of ["ACT_PCPL", "PASS_PCPL", "VN"]) if (f.includes(s)) bump(g.sub, s);
  const vf = f.find((x) => x.startsWith("VF:"));
  if (vf) bump(g.vf, vf.slice(3));
  if (m.tag === "V") {
    const tense = ["PERF", "IMPF", "IMPV"].find((x) => f.includes(x));
    if (tense) bumpForm(g.tense, tense, word, m.single);
  } else if (m.tag === "N") {
    const gn = f.find((x) => GN.test(x));
    if (gn) {
      const [, gender, number = "S"] = gn.match(GN);
      // Broken plurals are tagged feminine plural, so gender comes from singular uses only.
      if (number === "S") bump(g.gender, gender);
      bumpForm(g.num, number, word, m.single);
    }
  }
}

function top(map) {
  let best = null;
  for (const [k, n] of map) if (!best || n > best[1]) best = [k, n];
  return best;
}

function finalizeGrammar(g, freq) {
  const out = { kind: top(g.kind)?.[0] ?? "noun" };
  const sub = top(g.sub);
  if (sub && sub[1] >= freq / 2) out.sub = sub[0];
  const vf = top(g.vf);
  if (vf && vf[1] >= freq / 2) out.vf = Number(vf[0]);
  const genderTotal = [...g.gender.values()].reduce((a, b) => a + b, 0);
  const gender = top(g.gender);
  if (gender && genderTotal >= 2 && gender[1] / genderTotal >= 0.75) out.gender = gender[0];
  const forms = (map) => {
    const o = {};
    for (const [cat, { single, any }] of map) {
      const [ar] = top(single.size ? single : any);
      o[cat] = [ar, [...any.values()].reduce((a, b) => a + b, 0)];
    }
    return Object.keys(o).length ? o : undefined;
  };
  if (out.kind === "verb") out.tense = forms(g.tense);
  else if (out.kind !== "particle" && out.kind !== "pronoun") out.num = forms(g.num);
  return out;
}

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
              enAll: new Map(), bnAll: new Map(), tr: new Map(), forms: new Map(), occ: [], gram: newGrammar() };
            lemmaKeys.set(key, st);
          }
          const tEn = cleanWord(w.translation?.text);
          const tBn = cleanWord(wordsBn[j]?.translation?.text);
          st.freq++;
          noteGrammar(st.gram, m, w.text_uthmani);
          bump(st.enAll, tEn);
          bump(st.bnAll, tBn);
          if (m.single) {
            bump(st.en, tEn);
            bump(st.bn, tBn);
            bump(st.tr, w.transliteration?.text);
          }
          const form = st.forms.get(w.text_uthmani) ?? {
            n: 0, en: tEn, bn: tBn, tr: w.transliteration?.text ?? "", loc: w.location, single: m.single,
          };
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
  // Exact pronunciation: recitation of the lemma's most common form standing alone (no attached
  // prefix/suffix), so the audio says just this word — e.g. مِن "min", not لَمِنَ "lamina".
  const audioOf = (st) => {
    const forms = [...st.forms.values()].sort((a, b) => b.n - a.n);
    return (forms.find((f) => f.single) ?? forms[0]).loc;
  };
  const lemmas = ordered.map((st, i) => ({
    id: i + 1,
    ar: st.key,
    root: st.root ? [...st.root].join(" ") : "",
    pos: st.tag,
    freq: st.freq,
    bn: mostCommon(st.bn) || mostCommon(st.bnAll),
    en: mostCommon(st.en) || mostCommon(st.enAll),
    tr: mostCommon(st.tr),
    audio: audioOf(st),
    g: finalizeGrammar(st.gram, st.freq),
    refs: pickExamples(st.occ),
    forms: [...st.forms.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, MAX_FORMS)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- drop the internal flag
      .map(([ar, { single, ...f }]) => ({ ar, ...f })),
  }));

  // Hand-reviewed base meanings override the automatically chosen ones.
  const meaningFixes = await readJson(path.resolve("data/curated/meanings.json"));
  const lemmaByNfd = new Map(lemmas.map((l) => [l.ar.normalize("NFD"), l]));
  for (const [lem, fix] of Object.entries(meaningFixes)) {
    if (lem.startsWith("_")) continue;
    const l = lemmaByNfd.get(lem.normalize("NFD"));
    if (!l) throw new Error(`meanings.json: lemma not found in corpus: ${lem}`);
    [l.bn, l.en] = fix;
  }

  // Gender: masculine tags are kept; feminine is shown only with a feminine marker (ة / ى / اء)
  // or for curated unmarked feminine nouns, because the corpus tag alone is unreliable (e.g. قَلْب).
  const curated = await readJson(path.resolve("data/curated/relations.json"));
  const nfd = (x) => x.normalize("NFD");
  const lemmaNfd = new Set(lemmas.map((l) => nfd(l.ar)));
  for (const w of curated.feminine) if (!lemmaNfd.has(nfd(w))) throw new Error(`curated feminine lemma not found: ${w}`);
  const femNfd = new Set(curated.feminine.map(nfd));
  const bare = (x) => x.replace(/[\u064B-\u065F\u0670]/g, "");
  for (const l of lemmas) {
    const curatedFem = femNfd.has(nfd(l.ar));
    if (curatedFem) l.g.gender = "F";
    else if (l.g.gender === "F" && !/(\u0629|\u0649|\u0627\u0621)$/.test(bare(l.ar))) delete l.g.gender;
  }

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

  // lite tuple: [id, arabic, bangla, english, transliteration, freq, root, audioLocation]
  await fs.writeFile(
    path.join(OUT, "lemmas-lite.json"),
    JSON.stringify(lemmas.map((l) => [l.id, l.ar, l.bn, l.en, l.tr, l.freq, l.root, l.audio])),
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
  // ---- deep word study files: root family + curated synonyms/antonyms ----
  // NFD puts stacked diacritics (shadda + vowel) in canonical order, so typed spellings match the corpus.
  const idByNfd = new Map([...idOf].map(([k, id]) => [k.normalize("NFD"), id]));
  const resolve = (lem) => {
    const id = idByNfd.get(lem.normalize("NFD"));
    if (!id) throw new Error(`curated lemma not found in corpus: ${lem}`);
    return id;
  };
  const ant = new Map();
  const syn = new Map();
  const link = (map, a, b) => {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a).add(b);
  };
  for (const [a, b] of curated.antonyms) {
    const [x, y] = [resolve(a), resolve(b)];
    link(ant, x, y);
    link(ant, y, x);
  }
  for (const group of curated.synonyms) {
    const ids = group.map(resolve);
    for (const x of ids) for (const y of ids) if (x !== y) link(syn, x, y);
  }
  const byRoot = new Map();
  for (const l of lemmas) if (l.root) (byRoot.get(l.root) ?? byRoot.set(l.root, []).get(l.root)).push(l);
  // relation tuple: [id, arabic, bangla, english, freq]
  const rel = (id) => {
    const l = lemmas[id - 1];
    return [l.id, l.ar, l.bn, l.en, l.freq, l.audio];
  };

  await fs.mkdir(path.join(OUT, "word"), { recursive: true });
  const daily = [];
  for (const l of lemmas) {
    if (l.freq < WORD_PAGE_MIN_FREQ) continue;
    const family = (byRoot.get(l.root) ?? []).filter((x) => x.id !== l.id).slice(0, MAX_FAMILY).map((x) => rel(x.id));
    const detail = {
      id: l.id, ar: l.ar, tr: l.tr, bn: l.bn, en: l.en, root: l.root, freq: l.freq, audio: l.audio, g: l.g,
      forms: l.forms,
      family,
      ant: [...(ant.get(l.id) ?? [])].map(rel),
      syn: [...(syn.get(l.id) ?? [])].map(rel),
      examples: l.refs.map(example),
    };
    await fs.writeFile(path.join(OUT, "word", `${l.id}.json`), JSON.stringify(detail));
    if (l.root && ["noun", "adj", "verb"].includes(l.g.kind)) daily.push(l.id);
  }
  await fs.writeFile(path.join(OUT, "daily.json"), JSON.stringify(daily));

  // ---- surah decks (+ Juz ʿAmma): every lemma in the deck, most used in that deck first ----
  await fs.mkdir(path.join(OUT, "decks"), { recursive: true });
  // Long ayat are cut to a window around the word (translation dropped) to keep deck files small.
  const DECK_EX_MAX = 14;
  const DECK_EX_SIDE = 4;
  const deckExample = (loc) => {
    const ex = example(loc);
    if (ex.w.length <= DECK_EX_MAX) return ex;
    const from = Math.max(0, ex.hi - DECK_EX_SIDE);
    const to = Math.min(ex.w.length, ex.hi + DECK_EX_SIDE + 1);
    const w = [...(from > 0 ? ["…"] : []), ...ex.w.slice(from, to), ...(to < ex.w.length ? ["…"] : [])];
    return { ref: ex.ref, w, hi: ex.hi - from + (from > 0 ? 1 : 0), start: from + 1, en: "", bn: "" };
  };
  const buildDeck = (id, chapterNums) => {
    const stats = new Map(); // lemmaId -> { n, first, loc }
    let total = 0;
    let order = 0;
    for (const c of chapterNums) {
      for (const v of surahs[c - 1].verses) {
        v.words.forEach((w, i) => {
          const lid = idOf.get(w.key);
          total++;
          const st = stats.get(lid) ?? { n: 0, first: order, loc: `${c}:${v.n}:${i + 1}` };
          st.n++;
          stats.set(lid, st);
          order++;
        });
      }
    }
    const words = [...stats.entries()]
      .sort((a, b) => b[1].n - a[1].n || a[1].first - b[1].first)
      .map(([lid, st]) => {
        const l = lemmas[lid - 1];
        return { id: l.id, ar: l.ar, root: l.root, pos: l.pos, freq: l.freq, bn: l.bn, en: l.en, tr: l.tr, sfreq: st.n, audio: l.audio, ex: deckExample(st.loc) };
      });
    return { id, total, words };
  };
  const deckIndex = [];
  const writeDeck = async (deck) => {
    await fs.writeFile(path.join(OUT, "decks", `${deck.id}.json`), JSON.stringify(deck));
    deckIndex.push({ id: deck.id, total: deck.total, unique: deck.words.length });
  };
  await writeDeck(buildDeck("juz30", Array.from({ length: 37 }, (_, i) => 78 + i)));
  for (let c = 1; c <= 114; c++) await writeDeck(buildDeck(`s${c}`, [c]));
  await fs.writeFile(path.join(BUILD_OUT, "decks.json"), JSON.stringify(deckIndex));

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
