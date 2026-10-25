// Downloads raw source data once into data-raw/ (gitignored).
//  - Quran.com API v4: word-by-word text, transliteration, Bangla/English word meanings, ayah translations
//  - Quranic Arabic Corpus morphology (GPL) for lemma + root of every word
import fs from "node:fs/promises";
import path from "node:path";

const RAW = path.resolve("data-raw");
const API = "https://api.quran.com/api/v4";
const MORPH_URL =
  "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";

// Ayah translations: Saheeh International (en), Taisirul Quran (bn)
const LANGS = { en: 20, bn: 161 };

async function getJson(url, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function exists(p) {
  return fs.access(p).then(() => true, () => false);
}

async function fetchChapter(lang, chapter) {
  const file = path.join(RAW, "qcom", lang, `${chapter}.json`);
  if (await exists(file)) return;
  const verses = [];
  for (let page = 1; ; page++) {
    const url =
      `${API}/verses/by_chapter/${chapter}?words=true&language=${lang}` +
      `&word_fields=text_uthmani,location&translations=${LANGS[lang]}` +
      `&per_page=50&page=${page}`;
    const data = await getJson(url);
    verses.push(...data.verses);
    if (!data.pagination.next_page) break;
  }
  await fs.writeFile(file, JSON.stringify(verses));
}

async function main() {
  for (const lang of Object.keys(LANGS)) {
    await fs.mkdir(path.join(RAW, "qcom", lang), { recursive: true });
  }

  const morphFile = path.join(RAW, "morphology.txt");
  if (!(await exists(morphFile))) {
    const res = await fetch(MORPH_URL);
    if (!res.ok) throw new Error(`morphology download failed: ${res.status}`);
    await fs.writeFile(morphFile, await res.text());
    console.log("morphology ✓");
  }

  for (const lang of Object.keys(LANGS)) {
    const file = path.join(RAW, `chapters-${lang}.json`);
    if (!(await exists(file))) {
      const data = await getJson(`${API}/chapters?language=${lang}`);
      await fs.writeFile(file, JSON.stringify(data.chapters));
    }
  }

  const jobs = [];
  for (const lang of Object.keys(LANGS)) {
    for (let c = 1; c <= 114; c++) jobs.push([lang, c]);
  }
  let done = 0;
  const worker = async () => {
    while (jobs.length) {
      const [lang, c] = jobs.shift();
      await fetchChapter(lang, c);
      if (++done % 20 === 0) console.log(`chapters ${done}/228`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log("fetch complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
