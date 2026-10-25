// Generates app icons, favicon and the Open Graph image into public/ (run once; outputs are committed).
import fs from "node:fs/promises";
import sharp from "sharp";

const GREEN = "#0e5a48";
const GOLD = "#f6ecd4";

const mark = (size, pad = 0) => {
  const s = 64;
  const inner = `
    <g transform="translate(32 30)">
      <rect x="-13" y="-13" width="26" height="26" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <rect x="-13" y="-13" width="26" height="26" fill="none" stroke="${GOLD}" stroke-width="3" transform="rotate(45)"/>
      <circle r="5" fill="${GOLD}"/>
    </g>
    <path d="M14 50 Q23 45 32 50 Q41 45 50 50" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>`;
  const scale = (s - pad * 2) / s;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" rx="${pad ? 0 : 16}" fill="${GREEN}"/>
    <g transform="translate(${pad} ${pad}) scale(${scale})">${inner}</g>
  </svg>`;
};

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** ICO container holding PNG images (supported by all modern browsers). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#faf7f0"/>
  <rect x="0" y="0" width="1200" height="14" fill="${GREEN}"/>
  <g transform="translate(90 120) scale(2.6)">${mark(64).replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="300" y="190" font-family="Lato, sans-serif" font-size="78" font-weight="700" fill="${GREEN}">QuranEasy</text>
  <text x="300" y="260" font-family="Noto Sans Bengali, sans-serif" font-size="44" fill="#1b2421">কুরআনের প্রতিটি শব্দ সহজে শিখুন</text>
  <text x="90" y="420" font-family="Lato, sans-serif" font-size="40" fill="#1b2421">Learn every word of the Qur'an in Bangla &amp; English</text>
  <text x="90" y="490" font-family="Lato, sans-serif" font-size="30" fill="#4f5a55">Frequency-first lessons · Spaced repetition · Free · Works offline</text>
  <text x="1110" y="580" text-anchor="end" font-family="Noto Naskh Arabic, serif" font-size="46" fill="#9a6f17">وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ</text>
</svg>`;

const out = "public";
await fs.writeFile(`${out}/icon.svg`, mark(64));
await fs.writeFile(`${out}/icon-192.png`, await png(mark(512), 192));
await fs.writeFile(`${out}/icon-512.png`, await png(mark(512), 512));
await fs.writeFile(`${out}/icon-maskable-512.png`, await png(mark(512, 10), 512));
await fs.writeFile(`${out}/apple-touch-icon.png`, await png(mark(512, 6), 180));
await fs.writeFile(
  `${out}/favicon.ico`,
  ico([
    { size: 16, data: await png(mark(64), 16) },
    { size: 32, data: await png(mark(64), 32) },
    { size: 48, data: await png(mark(64), 48) },
  ]),
);
await fs.writeFile(`${out}/og.png`, await sharp(Buffer.from(og)).png().toBuffer());
console.log("icons ✓");
