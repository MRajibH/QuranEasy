// Full-ayah recitations served by Quran.com's audio CDN (paths from the Quran.com API v4 recitations).
export interface Reciter {
  id: string;
  bn: string;
  en: string;
  base: string;
}

export const RECITERS: Reciter[] = [
  { id: "alafasy", bn: "মিশারি রাশিদ আল-আফাসি", en: "Mishary Rashid Alafasy", base: "https://verses.quran.com/Alafasy/mp3/" },
  { id: "basit-murattal", bn: "আব্দুল বাসিত (মুরাত্তাল)", en: "Abdul Basit (Murattal)", base: "https://verses.quran.com/AbdulBaset/Murattal/mp3/" },
  { id: "basit-mujawwad", bn: "আব্দুল বাসিত (মুজাওয়াদ)", en: "Abdul Basit (Mujawwad)", base: "https://verses.quran.com/AbdulBaset/Mujawwad/mp3/" },
  { id: "sudais", bn: "আব্দুর রহমান আস-সুদাইস", en: "Abdur-Rahman as-Sudais", base: "https://verses.quran.com/Sudais/mp3/" },
  { id: "husary", bn: "মাহমুদ খলিল আল-হুসারি", en: "Mahmoud Khalil Al-Husary", base: "https://mirrors.quranicaudio.com/everyayah/Husary_64kbps/" },
  { id: "minshawi", bn: "মুহাম্মাদ সিদ্দিক আল-মিনশাভি", en: "Mohamed Siddiq al-Minshawi", base: "https://verses.quran.com/Minshawi/Murattal/mp3/" },
  { id: "shuraym", bn: "সাউদ আশ-শুরাইম", en: "Sa'ud ash-Shuraym", base: "https://verses.quran.com/Shuraym/mp3/" },
];

export const DEFAULT_RECITER = "alafasy";
export const reciterById = (id: string) => RECITERS.find((r) => r.id === id) ?? RECITERS[0];

const pad = (n: number) => String(n).padStart(3, "0");
export const ayahAudioUrl = (reciterId: string, surah: number, ayah: number) => `${reciterById(reciterId).base}${pad(surah)}${pad(ayah)}.mp3`;

export const REPEAT_STEPS = [1, 3, 5, 10];
