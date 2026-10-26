"use client";

import { num } from "./i18n";
import { SITE_URL, TOTAL_WORDS } from "./constants";
import type { Locale } from "./types";

export interface CardStats {
  pct: number;
  words: number;
  streak: number;
}

const SIZE = 1080;

function cssFont(varName: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

/** Draws a square progress image (for WhatsApp/Facebook) in the site's colours and fonts. */
export async function drawProgressCard(locale: Locale, s: CardStats): Promise<Blob> {
  const bangla = cssFont("--font-bangla", "sans-serif");
  const quran = cssFont("--font-quran", "serif");
  await Promise.all([document.fonts.load(`700 64px ${bangla}`), document.fonts.load(`48px ${quran}`)]).catch(() => {});

  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, "#0e5a48");
  bg.addColorStop(1, "#062a21");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // faint eight-pointed star lattice
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  for (let x = 60; x < SIZE; x += 120) {
    for (let y = 60; y < SIZE; y += 120) {
      for (const rot of [0, Math.PI / 4]) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeRect(-26, -26, 52, 52);
        ctx.restore();
      }
    }
  }

  const gold = "#e0b65c";
  ctx.textAlign = "center";
  ctx.fillStyle = gold;
  ctx.font = `600 44px ${bangla}`;
  ctx.fillText("QuranEasy", SIZE / 2, 120);

  // progress ring
  const cx = SIZE / 2;
  const cy = 430;
  const r = 210;
  ctx.lineCap = "round";
  ctx.lineWidth = 36;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, "#4cc39b");
  ring.addColorStop(1, gold);
  ctx.strokeStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.min(100, Math.max(s.pct, 0.5))) / 100);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 120px ${bangla}`;
  ctx.fillText(`${num(locale, s.pct)}%`, cx, cy + 40);

  const line1 =
    locale === "bn"
      ? `কুরআনের ${num("bn", TOTAL_WORDS)} শব্দের মধ্যে`
      : `I recognise ${num("en", s.words)} of the`;
  const line2 = locale === "bn" ? `আমি ${num("bn", s.words)}টি শব্দ চিনি` : `Qur'an's ${num("en", TOTAL_WORDS)} words`;
  ctx.font = `600 54px ${bangla}`;
  ctx.fillText(line1, cx, 760);
  ctx.fillText(line2, cx, 830);

  if (s.streak > 0) {
    ctx.fillStyle = gold;
    ctx.font = `500 40px ${bangla}`;
    ctx.fillText(locale === "bn" ? `🔥 ${num("bn", s.streak)} দিন ধারাবাহিক` : `🔥 ${s.streak}-day streak`, cx, 900);
  }

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `500 36px ${bangla}`;
  ctx.fillText(locale === "bn" ? "আপনিও শিখুন — সম্পূর্ণ বিনামূল্যে" : "Learn with me — completely free", cx, 990);
  ctx.fillStyle = gold;
  ctx.font = `600 36px ${bangla}`;
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), cx, 1040);

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas"))), "image/png"));
}
