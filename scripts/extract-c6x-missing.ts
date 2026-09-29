// Fetch game pages for slugs NOT covered by the category crawl, merge into pool.
import { readFileSync, writeFileSync } from "node:fs";

const allLocs: string[] = readFileSync("/tmp/c6x_locs.txt", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => l.replace(/<\/?loc>/g, "").trim())
  .filter((u) => /\/game\//.test(u))
  .map((u) => u.replace("https://classroom-6x.org/game/", ""));

const mapped = new Set(
  JSON.parse(readFileSync("/tmp/c6x_games.json", "utf8")).map((g: any) => g.slug),
);
const missing = allLocs.filter((s) => !mapped.has(s));
console.log("all:", allLocs.length, "mapped:", mapped.size, "missing:", missing.length);

async function fetchGame(slug: string) {
  const url = `https://classroom-6x.org/game/${slug}`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { slug, error: `HTTP ${res.status}` };
    const html = await res.text();
    const title =
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*[-–|]\s*Play Unblocked.*$/i, "").trim() ?? slug;
    const embed = html.match(/<iframe[^>]*\ssrc="(https?:\/\/[^"]+)"/)?.[1];
    const icon = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1];
    const desc = html.match(/name="description"\s+content="([^"]+)"/)?.[1];
    return { slug, title, embed, icon, desc, cats: [] };
  } catch (e) {
    return { slug, error: String(e).slice(0, 80) };
  }
}

const CONCURRENCY = 12;
const results: any[] = [];
for (let i = 0; i < missing.length; i += CONCURRENCY) {
  const batch = missing.slice(i, i + CONCURRENCY);
  const out = await Promise.all(batch.map(fetchGame));
  results.push(...out);
}
console.log("fetched:", results.length, "with embed:", results.filter((r) => r.embed).length);

// Merge with existing pool
const existing: any[] = JSON.parse(readFileSync("/tmp/c6x_games.json", "utf8"));
const merged = [...existing, ...results];
writeFileSync("/tmp/c6x_games_all.json", JSON.stringify(merged, null, 1));
console.log("merged pool:", merged.length);
