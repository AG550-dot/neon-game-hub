// Regenerate public/sitemap.xml: home, /games, genre pages, /play/:slug for
// every game in the current catalog. Static site map — re-run when catalog changes.
import { writeFileSync } from "node:fs";
import { GAMES, GENRES } from "../src/lib/games";

const BASE = "https://neonplay-arcade.com";
const today = new Date().toISOString().slice(0, 10);

const urls: { loc: string; priority: string; changefreq?: string }[] = [
  { loc: `${BASE}/`, priority: "1.0", changefreq: "daily" },
  { loc: `${BASE}/games`, priority: "0.9", changefreq: "daily" },
  ...GENRES.map((g) => ({
    loc: `${BASE}/genre/${encodeURIComponent(g.toLowerCase())}`,
    priority: "0.8",
    changefreq: "weekly",
  })),
  ...GAMES.map((g) => ({
    loc: `${BASE}/play/${g.slug}`,
    priority: "0.7",
    changefreq: "weekly",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq ?? "weekly"}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", xml);
console.log(`sitemap: ${urls.length} URLs (${GAMES.length} games, ${GENRES.length} genres)`);
