// Final fill round: verify remaining candidates for thin genres.
// Merges survivors into /tmp/catalog_final2.json.
import { readFileSync, writeFileSync } from "node:fs";

const HDR = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// [slug, genre, title, embed, icon, sourcePool]
const FILLS: [string, string, string, string, string][] = [
  // Rhythm
  ["geometry-dash-bloodbath", "Rhythm", "Geometry Dash Bloodbath", "https://geometrydashlitepc.io/game/geometry-dash-lite/", ""],
  ["geometry-neon-dash-rainbow", "Rhythm", "Geometry Neon Dash Rainbow", "https://bitlifeonline.github.io/geometry-neon-dash-rain", ""],
  ["magic-tiles-3", "Rhythm", "Magic Tiles 3", "https://slope-game.github.io/new3623/magic-tiles-3/", ""],
  // Cooking — Papa's portal + gameslol AwayJS builds
  ["papas-bakeria", "Cooking", "Papa's Bakeria", "https://en.gameslol.net/data/awayjs/papa/bakeria.html", ""],
  ["papas-tacomia", "Cooking", "Papa's Taco Mia!", "https://en.gameslol.net/data/awayjs/papa/tacomia.html", ""],
  ["papas-pastaria", "Cooking", "Papa's Pastaria", "https://en.gameslol.net/data/awayjs/papa/pastaria.html", ""],
  ["papas-scooperia", "Cooking", "Papa's Scooperia", "https://papas-games.io/papas-scooperia.embed", "https://papasfreezeria.io/cache/data/image/options/papasfreezeriafavicon1-m72x72.jpg"],
  ["papas-cupcakeria", "Cooking", "Papa's Cupcakeria", "https://papas-games.io/papas-cupcakeria.embed", "https://papasfreezeria.io/cache/data/image/options/papasfreezeriafavicon1-m72x72.jpg"],
  ["papas-cheeseria", "Cooking", "Papa's Cheeseria", "https://papas-games.io/papas-cheeseria.embed", "https://papasfreezeria.io/cache/data/image/options/papasfreezeriafavicon1-m72x72.jpg"],
  ["papas-pancakeria", "Cooking", "Papa's Pancakeria", "https://papas-games.io/papas-pancakeria.embed", "https://papasfreezeria.io/cache/data/image/options/papasfreezeriafavicon1-m72x72.jpg"],
  // Horror retries + fills
  ["scary-wheels", "Horror", "Scary Wheels", "https://ubgwtf.gitlab.io/scary-wheels/", ""],
  ["stupid-zombies", "Horror", "Stupid Zombies", "https://ubgwtf.gitlab.io/stupid-zombies/", ""],
  ["plants-vs-zombies", "Horror", "Plants vs. Zombies", "https://ubgwtf.gitlab.io/plants-vs-zombies/", ""],
  ["death-chase-3", "Horror", "Death Chase 3", "https://ubgwtf.gitlab.io/death-chase-3/", ""],
  ["huggy-wuggy-shooter", "Horror", "Huggy Wuggy Shooter", "https://ubgwtf.gitlab.io/huggy-wuggy-shooter/", ""],
  ["monster-school-vs-siren-head", "Horror", "Monster School vs Siren Head", "https://ubgwtf.gitlab.io/monster-school-vs-siren-head/", ""],
  ["noob-nightmare-arcade", "Horror", "Noob Nightmare Arcade", "https://ubgwtf.gitlab.io/noob-nightmare-arcade/", ""],
  // Trivia fills (board/card/classics)
  ["dots-and-boxes", "Trivia", "Dots and Boxes", "https://slope-game.github.io/dots-and-boxes/", ""],
  ["four-in-a-row", "Trivia", "Four in a Row", "https://slope-game.github.io/four-in-a-row/", ""],
  ["ludo-hero", "Trivia", "Ludo Hero", "https://fridaynight-funkin.github.io/f8/ludo-hero", ""],
  ["uno", "Trivia", "Uno Online", "https://slope-game.github.io/uno/", ""],
  ["drop-the-number", "Trivia", "Drop the Number", "https://slope-game.github.io/drop-the-number/", ""],
  ["math-duck", "Trivia", "Math Duck", "https://slope-game.github.io/math-duck/", ""],
  // Ragdoll fills
  ["flip-bros", "Ragdoll", "Flip Bros", "https://classroom-6x.org/games/flip-bros/", ""],
  ["draw-crash-race", "Ragdoll", "Draw Crash Race", "https://ubgwtf.gitlab.io/draw-crash-race/", ""],
  ["boxing-random", "Ragdoll", "Boxing Random", "https://ubgwtf.gitlab.io/boxing-random/", ""],
  ["silly-ways-to-die-adventures", "Ragdoll", "Silly Ways to Die: Adventures", "https://slope-game.github.io/silly-ways-to-die-adventures/", ""],
  ["human-flip", "Ragdoll", "Human Flip", "https://slope-game.github.io/human-flip/", ""],
  ["kickflip-santa", "Ragdoll", "Kickflip Santa", "https://slope-game.github.io/kickflip-santa/", ""],
  ["hide-and-smash", "Ragdoll", "Hide and Smash", "https://bitlifeonline.github.io/hide-and-smash/", ""],
  ["pixel-smash-duel", "Ragdoll", "Pixel Smash Duel", "https://slope-game.github.io/pixel-smash-duel/", ""],
  // Sandbox fills
  ["the-final-earth-2", "Sandbox", "The Final Earth 2", "https://fridaynight-funkin.github.io/f8/the-final-earth-2", ""],
  ["diggy", "Sandbox", "Diggy", "https://slope-game.github.io/diggy/", ""],
  ["awesome-tanks-2", "Sandbox", "Awesome Tanks 2", "https://ubgwtf.gitlab.io/awesome-tanks-2/", ""],
  ["jellycar-worlds", "Sandbox", "JellyCar Worlds", "https://slope-game.github.io/jellycar-worlds/", ""],
  ["parkour-block-5", "Sandbox", "Parkour Block 5", "https://slope-game.github.io/parkour-block-5/", ""],
  ["parkour-block-4", "Sandbox", "Parkour Block 4", "https://slope-game.github.io/parkour-block-4/", ""],
  ["parkour-block-3d", "Sandbox", "Parkour Block 3D", "https://slope-game.github.io/parkour-block-3d/", ""],
  ["tradecraft", "Sandbox", "Tradecraft", "https://ubgwtf.gitlab.io/tradecraft/", ""],
];

async function checkEmbed(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { redirect: "follow", headers: HDR, signal: AbortSignal.timeout(16000) });
      if (r.status >= 200 && r.status < 300) {
        const xfo = (r.headers.get("x-frame-options") ?? "").toLowerCase();
        const csp = (r.headers.get("content-security-policy") ?? "").toLowerCase();
        if (xfo.includes("deny") || xfo.includes("sameorigin")) return `XFO ${xfo}`;
        if (/frame-ancestors\s+'?self'|frame-ancestors\s+'none'/.test(csp)) return "CSP";
        return null;
      }
      if (r.status === 403 || r.status === 429) { await sleep(4000 + attempt * 4000); continue; }
      return `HTTP ${r.status}`;
    } catch (e: any) {
      if (attempt === 3) return `ERR ${String(e).slice(0, 40)}`;
      await sleep(3000);
    }
  }
  return "retries exhausted";
}

async function checkIcon(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow", headers: HDR, signal: AbortSignal.timeout(14000) });
    const ct = r.headers.get("content-type") ?? "";
    return r.status === 200 && /image|octet/.test(ct);
  } catch { return false; }
}

const ok: any[] = [];
const bad: any[] = [];
for (let i = 0; i < FILLS.length; i++) {
  const [slug, genre, title, embed, icon] = FILLS[i];
  const err = await checkEmbed(embed);
  if (err) { bad.push({ slug, err }); console.log(`BAD  ${slug} [${err}]`); continue; }
  let goodIcon = "";
  if (icon && (await checkIcon(icon))) goodIcon = icon;
  ok.push({ slug, genre, title, embed, icon: goodIcon });
  console.log(`OK   ${slug}${goodIcon ? " +icon" : ""}`);
  await sleep(600);
}
console.log("\nfill OK:", ok.length, "bad:", bad.length);

// Merge with prior final
const prev = JSON.parse(readFileSync("/tmp/catalog_final.json", "utf8"));
const seen = new Set(prev.verified.map((g: any) => g.slug));
for (const o of ok) if (!seen.has(o.slug)) { prev.verified.push(o); seen.add(o.slug); }
const counts: Record<string, number> = {};
for (const v of prev.verified) counts[v.genre] = (counts[v.genre] ?? 0) + 1;
console.log("MERGED per genre:", JSON.stringify(counts, null, 1));
writeFileSync("/tmp/catalog_final2.json", JSON.stringify(prev, null, 1));
console.log("total games:", prev.verified.length);
