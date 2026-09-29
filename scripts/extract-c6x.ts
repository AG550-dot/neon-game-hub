// One-off extraction script: fetch every classroom-6x game page and pull
// title / embed iframe src / og:image icon / description. Writes JSON to /tmp.
import { readFileSync, writeFileSync } from "node:fs";

const catmap = readFileSync("/tmp/c6x_catmap.txt", "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const [cat, ...rest] = l.trim().split(" ");
    return { cat, slug: rest.join(" ") };
  });

const bySlug = new Map();
for (const { cat, slug } of catmap) {
  if (!bySlug.has(slug)) bySlug.set(slug, new Set());
  bySlug.get(slug).add(cat);
}
const slugs = [...bySlug.keys()];
console.log("unique slugs:", slugs.length);

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
    return { slug, title, embed, icon, desc, cats: [...bySlug.get(slug)] };
  } catch (e) {
    return { slug, error: String(e).slice(0, 80) };
  }
}

const CONCURRENCY = 12;
const results: unknown[] = [];
for (let i = 0; i < slugs.length; i += CONCURRENCY) {
  const batch = slugs.slice(i, i + CONCURRENCY);
  const out = await Promise.all(batch.map(fetchGame));
  results.push(...out);
  if ((i / CONCURRENCY) % 5 === 0) console.log(`  ${i + batch.length}/${slugs.length}`);
}
console.log("fetched:", results.length);
const ok = results.filter((r: any) => r.embed);
console.log("with embed:", ok.length);
console.log("no embed (errors/404s):", results.length - ok.length);

writeFileSync("/tmp/c6x_games.json", JSON.stringify(results, null, 1));
console.log("wrote /tmp/c6x_games.json");
