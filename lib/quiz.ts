/** Picks `n` distractors whose displayed text differs from the answer and from each other. */
export function pickDistractors<T>(answer: T, pool: T[], text: (x: T) => string, n = 3, random = Math.random): T[] {
  const seen = new Set([norm(text(answer))]);
  const out: T[] = [];
  const candidates = [...pool];
  while (out.length < n && candidates.length) {
    const [c] = candidates.splice(Math.floor(random() * candidates.length), 1);
    const k = norm(text(c));
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[()[\].,!?'"]/g, "");
