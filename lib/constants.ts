import stats from "@/data/stats.json";

export const SITE_NAME = "QuranEasy";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://quraneasy.pages.dev").replace(/\/$/, "");
export const REPO_URL = "https://github.com/MRajibH/QuranEasy";

export const TOTAL_WORDS: number = stats.totalWords;
export const TOTAL_LEMMAS: number = stats.lemmas;
export const TOTAL_LESSONS: number = stats.lessons;
export const LESSON_SIZE: number = stats.lessonSize;

/** Lemmas that occur at least this often get their own static, indexable page. */
export const WORD_PAGE_MIN_FREQ = 3;

export const AUDIO_BASE = "https://audio.qurancdn.com/";

/** Lemma ids are frequency ranks, so lesson membership is pure arithmetic. */
export const lessonOfLemma = (lemmaId: number) => Math.ceil(lemmaId / LESSON_SIZE);
export const lemmaIdsOfLesson = (lesson: number) => {
  const from = (lesson - 1) * LESSON_SIZE + 1;
  const to = Math.min(lesson * LESSON_SIZE, TOTAL_LEMMAS);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
};

export const DECK_PART_SIZE = 10;
export const JUZ_AMMA = { id: "juz30", from: 78, to: 114 };
export const deckParts = (unique: number) => Math.ceil(unique / DECK_PART_SIZE);
