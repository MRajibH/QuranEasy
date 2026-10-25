import { AUDIO_BASE } from "./constants";

/** Word-by-word recitation audio for a word location "surah:ayah:word". */
export function wordAudioUrl(location: string) {
  const [s, a, w] = location.split(":").map((n) => String(n).padStart(3, "0"));
  return `${AUDIO_BASE}wbw/${s}_${a}_${w}.mp3`;
}

let current: HTMLAudioElement | null = null;

export function playWord(location: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  current?.pause();
  const audio = new Audio(wordAudioUrl(location));
  current = audio;
  return new Promise((resolve) => {
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}
