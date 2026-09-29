// Recovery + fill: 1) normalize stillBad embed URLs and re-verify,
// 2) probe fill slugs across known host patterns until one works.
import { readFileSync, writeFileSync } from "node:fs";

const HDR = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalize(url: string): string[] {
  const out = new Set<string>();
  let u = url.replace(/\?gd_zone_config=.*$/, "").replace(/\/index\.html$/, "/");
  out.add(u);
  // extension-less path without trailing slash -> add one
  const m = u.match(/^(https?:\/\/[^\/]+(\/[^\/\.\?]+)*)\/?(\?.*)?$/);
  if (m && !/\.[a-z0-9]{2,4}$/i.test(m[1])) out.add(m[1] + "/");
  return [...out];
}

async function okEmbed(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, { redirect: "follow", headers: HDR, signal: AbortSignal.timeout(16000) });
    if (!(r.status >= 200 && r.status < 300)) return false;
    const xfo = (r.headers.get("x-frame-options") ?? "").toLowerCase();
    const csp = (r.headers.get("content-security-policy") ?? "").toLowerCase();
    if (xfo.includes("deny") || xfo.includes("sameorigin")) return false;
    if (/frame-ancestors\s+'?self'|frame-ancestors\s+'none'/.test(csp)) return false;
    return true;
  } catch { return false; }
}

async function okIcon(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow", headers: HDR, signal: AbortSignal.timeout(12000) });
    const ct = r.headers.get("content-type") ?? "";
    return r.status === 200 && /image|octet/.test(ct);
  } catch { return false; }
}

const state = JSON.parse(readFileSync("/tmp/catalog_final2.json", "utf8"));
const have = new Set(state.verified.map((g: any) => g.slug));

// ---- 1) recover stillBad via normalization ----
let recovered = 0;
for (const p of state.stillBad) {
  if (have.has(p.slug)) continue;
  if (!/embed/.test(p.problem ?? "")) continue;
  for (const u of normalize(p.embed)) {
    if (await okEmbed(u)) {
      const icon = p.icon && (await okIcon(p.icon)) ? p.icon : "";
      state.verified.push({ ...p, embed: u, icon, problem: undefined });
      have.add(p.slug);
      recovered++;
      console.log(`RECOVERED ${p.slug} -> ${u}`);
      break;
    }
    await sleep(400);
  }
}
console.log("recovered:", recovered);

// ---- 2) fill slugs per genre across host patterns ----
const FILLS: Record<string, [string, string][]> = {
  Rhythm: [
    ["geometry-dash-subzero", "Geometry Dash Subzero"],
    ["geometry-dash-meltdown", "Geometry Dash Meltdown"],
    ["geometry-neon-dash-rainbow", "Geometry Neon Dash Rainbow"],
    ["magic-tiles-3", "Magic Tiles 3"],
    ["dancing-line", "Dancing Line"],
    ["neon-biker", "Neon Biker"],
    ["friday-night-funkin", "Friday Night Funkin'"],
  ],
  Arcade: [
    ["crossy-road", "Crossy Road"], ["duck-life-4", "Duck Life 4"],
    ["curve-ball-3d", "Curve Ball 3D"], ["mad-day", "Mad Day"],
    ["iron-snout", "Iron Snout"], ["rocket-pult", "Rocket Pult"],
    ["ape-sling", "Ape Sling"], ["stick-hero", "Stick Hero"],
    ["square-stacker", "Square Stacker"], ["paint-pop-3d", "Paint Pop 3D"],
  ],
  Sports: [
    ["basket-random", "Basket Random"], ["volley-random", "Volley Random"],
    ["soccer-random", "Soccer Random"], ["basket-slam-dunk-2", "Basket Slam Dunk 2"],
    ["basket-swooshes", "Basket Swooshes"], ["football-legends", "Football Legends"],
    ["football-masters", "Football Masters"], ["penalty-shooters-2", "Penalty Shooters 2"],
    ["penalty-shooters-3", "Penalty Shooters 3"],
  ],
  Platformer: [
    ["vex-3", "VEX 3"], ["vex-4", "VEX 4"], ["vex-5", "VEX 5"],
    ["vex-6", "VEX 6"], ["vex-7", "VEX 7"], ["big-tower-tiny-square", "Big Tower Tiny Square"],
    ["heroball-adventures", "HeroBall Adventures"], ["roller-ball-6", "Roller Ball 6"],
  ],
  Idle: [
    ["idle-dice", "Idle Dice"], ["idle-ants", "Idle Ants"],
    ["idle-success", "Idle Success"], ["merge-arena", "Merge Arena"],
    ["capybara-clicker", "Capybara Clicker"], ["cat-clicker", "Cat Clicker"],
    ["idle-fill-factory-events", "Idle Fill Factory"], ["merge-party", "Merge Party"],
  ],
  Sandbox: [
    ["grindcraft", "Grindcraft"], ["bloons-tower-defense-3", "Bloons TD 3"],
    ["bloons-tower-defense-4", "Bloons TD 4"], ["game-of-farmers", "Game of Farmers"],
    ["gold-miner", "Gold Miner"], ["tradecraft", "Tradecraft"],
    ["raft-life", "Raft Life"], ["the-final-earth", "The Final Earth"],
    ["idle-toy-factories", "Idle Toy Factories"], ["three-goblets", "Three Goblets"],
  ],
  Racing: [
    ["moto-x3m-2", "Moto X3M 2"], ["moto-x3m-pool-party", "Moto X3M Pool Party"],
    ["moto-x3m-winter", "Moto X3M Winter"], ["moto-x3m-3", "Moto X3M 3"],
    ["highway-racer-3d", "Highway Racer 3D"], ["traffic-mania", "Traffic Mania"],
    ["grand-prix-hero", "Grand Prix Hero"], ["burnout-drift-seaport-max", "Burnout Drift: Seaport Max"],
    ["rally-point-3", "Rally Point 3"], ["offroader-v5", "Offroader V5"],
  ],
  Retro: [
    ["tetrys", "Tetrys"], ["q-bert", "Q*bert"], ["cuphead", "Cuphead"],
    ["terris", "Terris"], ["dinosaur-game", "Dinosaur Game"], ["snake", "Snake"],
    ["space-is-key", "Space Is Key"], ["pong", "Pong"], ["breakout", "Breakout"],
  ],
  Ragdoll: [
    ["hide-and-smash", "Hide and Smash"], ["flip-bottle", "Flip Bottle"],
    ["human-flip", "Human Flip"], ["kickflip-santa", "Kickflip Santa"],
    ["pixel-smash-duel", "Pixel Smash Duel"], ["obby-flip", "Obby Flip"],
    ["halloween-skeleton-smash", "Halloween Skeleton Smash"], ["dad-n-me", "Dad 'n Me"],
  ],
  Trivia: [
    ["dots-and-boxes", "Dots and Boxes"], ["four-in-a-row", "Four in a Row"],
    ["ludo-hero", "Ludo Hero"], ["uno", "Uno Online"],
    ["drop-the-number", "Drop the Number"], ["math-duck", "Math Duck"],
    ["jewel", "Jewel Shuffle"], ["guess-the-kitty", "Guess the Kitty"],
    ["arithmetica", "Arithmetica"], ["who-is", "Who Is?"],
  ],
  Cooking: [
    ["penguin-diner-1", "Penguin Diner"], ["penguin-diner-2", "Penguin Diner 2"],
    ["cooking-tile", "Cooking Tile"], ["merge-cakes", "Merge Cakes"],
    ["sushi-supply-co", "Sushi Supply Co"], ["papas-hotdoggeria", "Papa's Hot Doggeria"],
    ["bad-ice-cream-3", "Bad Ice-Cream 3"],
  ],
  Horror: [
    ["trollface-quest-horror-1", "TrollFace Quest: Horror 1"],
    ["trollface-quest-horror-2", "TrollFace Quest: Horror 2"],
    ["zombies-are-coming-xtreme", "Zombies Are Coming Xtreme"],
    ["death-chase-2", "Death Chase 2"], ["merge-monster-army-game", "Merge Monster Army"],
    ["impostor-vs-noob", "Impostor vs Noob"], ["scary-wheels", "Scary Wheels"],
    ["stupid-zombies", "Stupid Zombies"], ["huggy-wuggy-shooter", "Huggy Wuggy Shooter"],
  ],
};

const HOSTS = (s: string) => {
  const enc = s.replace(/\./g, "");
  return [
    `https://slope-game.github.io/${s}/`,
    `https://bitlifeonline.github.io/${s}/`,
    `https://webglmath.github.io/${s}/`,
    `https://ubgwtf.gitlab.io/${s}/`,
    `https://ubg89.github.io/${s}/`,
    `https://ubg98.github.io/${s}/`,
    `https://classroomjq.github.io/${s}/`,
    `https://retrobowlubg.github.io/games/${s}/`,
    `https://classroom-6x.org/games/${s}/`,
    `https://gamesaturn.net/games/${s}/`,
    `https://wwwtyro.github.io/${s}/`,
    `https://ubgwtf.gitlab.io/${enc}/`,
  ];
};

const DEFICITS: Record<string, number> = {};
for (const v of state.verified) DEFICITS[v.genre] = (DEFICITS[v.genre] ?? 0) + 1;
for (const g of Object.keys(FILLS)) DEFICITS[g] = DEFICITS[g] ?? 0;

for (const [genre, entries] of Object.entries(FILLS)) {
  let need = 20 - (DEFICITS[genre] ?? 0);
  if (need <= 0) continue;
  for (const [slug, title] of entries) {
    if (need <= 0) break;
    if (have.has(slug)) continue;
    let done = false;
    for (const u of HOSTS(slug)) {
      if (await okEmbed(u)) {
        // try common icon paths beside the embed
        const base = u.replace(/\/$/, "");
        let icon = "";
        for (const ic of [`${base}/logo.png`, `${base}/icon.png`, `${base}/thumb.png`, `${base}/favicon.ico`]) {
          if (await okIcon(ic)) { icon = ic; break; }
        }
        state.verified.push({ slug, genre, title, embed: u, icon });
        have.add(slug);
        DEFICITS[genre]++;
        need--;
        done = true;
        console.log(`FILLED ${genre}: ${slug} -> ${u}${icon ? " +icon" : ""}`);
        break;
      }
      await sleep(300);
    }
    if (!done) console.log(`(no host) ${genre}: ${slug}`);
  }
  console.log(`-- ${genre}: now ${DEFICITS[genre]}`);
}

const counts: Record<string, number> = {};
for (const v of state.verified) counts[v.genre] = (counts[v.genre] ?? 0) + 1;
console.log("FINAL per genre:", JSON.stringify(counts, null, 1));
console.log("total:", state.verified.length);
writeFileSync("/tmp/catalog_final3.json", JSON.stringify(state, null, 1));
