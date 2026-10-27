import { Amiri_Quran, Hind_Siliguri, Inter, Noto_Naskh_Arabic } from "next/font/google";

export const quran = Amiri_Quran({ weight: "400", subsets: ["arabic"], variable: "--font-quran", display: "swap" });
export const bangla = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-bangla",
  display: "swap",
});
// IndoPak ("Hafezi") script needs a South-Asian-style naskh face with full Qur'anic mark support.
export const indopak = Noto_Naskh_Arabic({ weight: ["400", "600"], subsets: ["arabic"], variable: "--font-indopak", display: "swap" });
export const latin = Inter({ subsets: ["latin"], variable: "--font-latin", display: "swap" });

export const fontVars = `${quran.variable} ${indopak.variable} ${bangla.variable} ${latin.variable}`;
