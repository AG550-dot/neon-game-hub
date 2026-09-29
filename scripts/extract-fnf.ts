// Fetch fridaynight-funkin.github.io /play/<slug>.html pages, extract embed+icon.
import { readFileSync, writeFileSync } from "node:fs";

const catmap = readFileSync("/tmp/fnf_catmap.txt", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const [cat, slug] = l.trim().split(/\s+/);
    return { cat, slug };
  });
const bySlug = new Map<string, Set<string>>();
for (const { cat, slug } of catmap) {
  if (!bySlug.has(slug)) bySlug.set(slug, new Set());
  bySlug.get(slug)!.add(cat);
}
const slugs = [...bySlug.keys()];
console.log("fnf portal slugs:", slugs.length);

async function fetchGame(slug: string) {
  try {
    const res = await fetch(`https://fridaynight-funkin.github.io/play/${slug}.html`, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { slug, error: `HTTP ${res.status}` };
    const html = await res.text();
    const title =
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*[-–|]\s*fridaynight.*$/i, "").trim() ?? slug;
    const embed =
      html.match(/<iframe[^>]*\sid="game-area"[^>]*\ssrc="([^"]+)"/)?.[1] ??
      html.match(/<iframe[^>]*\ssrc="([^"]+)"/)?.[1];
    const icon = html.match(/og:image"\s+content="([^"]+)"/)?.[1];
    const desc = html.match(/name="description"\s+content="([^"]+)"/)?.[1];
    return { slug, title, embed, icon, desc, cats: [...bySlug.get(slug)!] };
  } catch (e) {
    return { slug, error: String(e).slice(0, 80) };
  }
}

const CONCURRENCY = 12;
const results: any[] = [];
for (let i = 0; i < slugs.length; i += CONCURRENCY) {
  const batch = slugs.slice(i, i + CONCURRENCY);
  results.push(...(await Promise.all(batch.map(fetchGame))));
}
console.log("fetched:", results.length, "with embed:", results.filter((r) => r.embed).length);
writeFileSync("/tmp/fnf_games.json", JSON.stringify(results, null, 1));
