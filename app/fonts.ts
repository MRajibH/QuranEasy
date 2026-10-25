import { Amiri_Quran, Hind_Siliguri, Inter } from "next/font/google";

export const quran = Amiri_Quran({ weight: "400", subsets: ["arabic"], variable: "--font-quran", display: "swap" });
export const bangla = Hind_Siliguri({
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-bangla",
  display: "swap",
});
export const latin = Inter({ subsets: ["latin"], variable: "--font-latin", display: "swap" });

export const fontVars = `${quran.variable} ${bangla.variable} ${latin.variable}`;
