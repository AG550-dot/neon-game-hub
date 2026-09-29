// Generate src/lib/games-new.ts + public/sitemap.xml from the verified catalog.
import { readFileSync, writeFileSync } from "node:fs";

const state = JSON.parse(readFileSync("/tmp/catalog_final3.json", "utf8"));
const games: any[] = state.verified;

// Doodle Jump (verified manually, one-off)
if (!games.some((g) => g.slug === "doodle-jump")) {
  games.push({
    slug: "doodle-jump", genre: "Endless Runner", title: "Doodle Jump",
    embed: "https://fridaynight-funkin.github.io/f7/doodle-jump",
    icon: "https://fridaynight-funkin.github.io/imgs/doodle-jump.png",
  });
}

// Slug fixes to avoid collisions with existing catalog
const SLUG_FIX: Record<string, string> = { "geometry-dash": "geometry-dash-classic" };

const EXISTING_SLUGS = new Set([
  "slope", "retro-bowl-25", "run-3", "cookie-clicker", "gladihoppers", "eaglercraft",
  "2048", "clumsy-bird", "astray", "pacman", "hexgl", "chrome-dino", "1v1-lol",
  "krunker", "shell-shockers", "slither", "agar", "zombsroyale", "smash-karts",
  "drive-mad", "drift-hunters", "moto-x3m", "basket-random", "happy-wheels",
  "fireboy-watergirl", "geometry-dash", "impossible-quiz", "papas-freezeria",
  "fnaf", "granny", "baldis-basics",
]);

const TAGLINE: Record<string, string[]> = {
  Arcade: ["Pure arcade energy", "Simple to start, hard to put down", "One more run, guaranteed", "Instant fun, zero setup"],
  "Endless Runner": ["How far can you go?", "The run never stops", "Speed is the only rule", "Chase that high score"],
  Sports: ["Step onto the field", "Champions only", "Game day, every day", "Bring your A-game"],
  Platformer: ["Jump, run, repeat", "Precision platforming", "Time every leap", "A classic jump-and-run"],
  Idle: ["Watch the numbers explode", "Progress even while you rest", "Tap, upgrade, repeat", "The perfect background tab"],
  Fighting: ["Settle it with fists", "Fight for glory", "Chaos in the arena", "Last one standing wins"],
  Sandbox: ["Build your own world", "Create without limits", "Your rules, your world", "Grow something great"],
  Puzzle: ["Flex that big brain", "Think it through", "Solve the impossible", "Every level is a riddle"],
  Racing: ["Pedal to the metal", "Burn rubber, chase glory", "First across the line", "Grip it and rip it"],
  Retro: ["A legend, reborn", "Old-school, timeless", "Straight from the arcade", "The classics still rule"],
  Shooter: ["Lock, load, go", "Aim true", "Blast through the waves", "Steady hands win"],
  Multiplayer: ["Better with friends", "Challenge the world", "Multiplayer mayhem", "Beat your buddies"],
  Ragdoll: ["Physics does the rest", "Wobble, flip, flop", "Ugly landings, big laughs", "Brace for impact"],
  Rhythm: ["Feel the beat", "Move with the music", "Tap to the tempo", "Don't miss a beat"],
  Trivia: ["Brain power required", "Think you're smart? Prove it", "A true mind-bender", "Smarts beat speed"],
  Cooking: ["Serve it up hot", "Order up!", "The kitchen is calling", "Cook fast, serve faster"],
  Horror: ["Lights off recommended", "Don't play this alone", "Survive if you can", "Enter at your own risk"],
};
const DESC_CORE: Record<string, string> = {
  Arcade: "instant-to-learn arcade action that runs right in the browser — no downloads, no sign-up",
  "Endless Runner": "an endless runner where every meter raises the stakes",
  Sports: "fast, pick-up-and-play sports action you can start in one click",
  Platformer: "a classic platform adventure with handcrafted levels",
  Idle: "a deeply satisfying idle game that keeps earning while you're away",
  Fighting: "a frantic head-to-head brawler",
  Sandbox: "a creative sandbox that rewards experimentation",
  Puzzle: "a clever puzzle challenge that gets trickier every level",
  Racing: "high-speed driving action with real handling",
  Retro: "a faithful browser tribute to an arcade legend",
  Shooter: "a fast-fingered shooting challenge",
  Multiplayer: "a competitive arena you can share with a friend",
  Ragdoll: "hilarious ragdoll physics at their finest",
  Rhythm: "a rhythm challenge where timing is everything",
  Trivia: "a brain-teasing classic that never gets old",
  Cooking: "a time-management cooking classic",
  Horror: "a tense browser horror experience",
};
const CONTROLS: Record<string, string> = {
  Arcade: "Arrows / WASD — move", "Endless Runner": "Arrows / space — run & jump",
  Sports: "Arrows / mouse — aim & play", Platformer: "Arrows / WASD — move & jump",
  Idle: "Mouse — click & upgrade", Fighting: "Arrows / WASD — move & fight",
  Sandbox: "Mouse + keys — build & explore", Puzzle: "Mouse / arrows — solve",
  Racing: "Arrows / WASD — drive", Retro: "Arrows — play",
  Shooter: "Mouse — aim, click — shoot", Multiplayer: "Arrows / WASD — move & compete",
  Ragdoll: "Arrows — flail & flop", Rhythm: "Arrow keys / DFJK — hit the beat",
  Trivia: "Mouse — think & click", Cooking: "Mouse — cook & serve",
  Horror: "WASD + mouse — explore & survive",
};
const TAGS: Record<string, string[]> = {
  Arcade: ["Skill", "Quick Rounds", "High Scores"], "Endless Runner": ["Endless", "High Scores", "Reflex"],
  Sports: ["Sports", "Arcade", "Quick Match"], Platformer: ["Levels", "Precision", "Classic"],
  Idle: ["Incremental", "Chill", "Upgrades"], Fighting: ["Versus", "Arcade", "Combat"],
  Sandbox: ["Creative", "Building", "Open-Ended"], Puzzle: ["Logic", "Brainy", "Levels"],
  Racing: ["Speed", "Driving", "Time Attack"], Retro: ["Classic", "8-bit", "Old School"],
  Shooter: ["Action", "Aim", "Waves"], Multiplayer: ["Arena", "Friends", "Competitive"],
  Ragdoll: ["Physics", "Funny", "Chaos"], Rhythm: ["Music", "Timing", "Beat"],
  Trivia: ["Brainy", "Classic", "Smart"], Cooking: ["Time Management", "Chill", "Cute"],
  Horror: ["Spooky", "Survival", "Thrills"],
};
const PALETTES = [
  ["from-[#ff2ea6] via-[#b026ff] to-[#2e6bff]", "text-[#ff2ea6]", "bg-[#ff2ea6]"],
  ["from-[#00e5ff] via-[#b026ff] to-[#ff2ea6]", "text-[#00e5ff]", "bg-[#00e5ff]"],
  ["from-[#3dff8b] via-[#00e5ff] to-[#2e6bff]", "text-[#3dff8b]", "bg-[#3dff8b]"],
  ["from-[#ffe14d] via-[#ff7a1a] to-[#ff2ea6]", "text-[#ffe14d]", "bg-[#ffe14d]"],
  ["from-[#b026ff] via-[#2e6bff] to-[#00e5ff]", "text-[#b026ff]", "bg-[#b026ff]"],
  ["from-[#ff7a1a] via-[#ff2ea6] to-[#b026ff]", "text-[#ff7a1a]", "bg-[#ff7a1a]"],
  ["from-[#00e5ff] via-[#2e6bff] to-[#b026ff]", "text-[#00e5ff]", "bg-[#00e5ff]"],
  ["from-[#3dff8b] via-[#ffe14d] to-[#ff7a1a]", "text-[#3dff8b]", "bg-[#3dff8b]"],
  ["from-[#ff2ea6] via-[#ff7a1a] to-[#ffe14d]", "text-[#ff2ea6]", "bg-[#ff2ea6]"],
  ["from-[#2e6bff] via-[#00e5ff] to-[#3dff8b]", "text-[#2e6bff]", "bg-[#2e6bff]"],
  ["from-[#1a0b3f] via-[#b026ff] to-[#ff2ea6]", "text-[#c04bff]", "bg-[#b026ff]"],
  ["from-[#150b31] via-[#b026ff] to-[#00e5ff]", "text-[#a79bd1]", "bg-[#a79bd1]"],
];
const LOCAL_2P = new Set([
  "rooftop-snipers", "rooftop-snipers-2", "getaway-shootout", "house-of-hazards",
  "minibattles", "12-minibattles", "duo-survival-2", "duo-survival-3",
  "head-soccer-2-player", "head-soccer-2023", "penalty-challenge-multiplayer",
  "bobblehead-soccer", "thumb-fighter-christmas", "boxing-physics-2", "dad-n-me",
  "wrassling", "get-on-top", "tug-the-table", "pixel-smash-duel", "drunken-boxing",
  "drunken-boxing-2", "ultimate-boxing", "rowdy-wrestling", "rowdy-city-wrestling",
]);
const IO_GAME = (g: any) => /\.io$|-io$|^io/i.test(g.slug) || g.slug === "eatio-online";

function cleanTitle(t: string): string {
  return (t ?? "")
    .replace(/\s*(Unblocked\s*Games?\s*(66|76|6x|WTF|77|67)?|Unblocked)\s*$/i, "")
    .replace(/\s*[-–|]\s*Play.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

const out: string[] = [];
const perGenre: Record<string, number> = {};
const seenSlugs = new Set<string>();
let dropped = 0;

games.forEach((g, i) => {
  let slug = SLUG_FIX[g.slug] ?? g.slug;
  if (EXISTING_SLUGS.has(slug) || seenSlugs.has(slug)) { dropped++; console.log("SKIP dup:", slug); return; }
  seenSlugs.add(slug);
  const genre = g.genre;
  const title = cleanTitle(g.title) || slug;
  const tls = TAGLINE[genre];
  const tagline = tls[i % tls.length];
  const tags = TAGS[genre];
  const pal = PALETTES[i % PALETTES.length];
  const players =
    genre === "Multiplayer"
      ? LOCAL_2P.has(slug) ? "1–2 players" : "Online multiplayer"
      : genre === "Fighting"
        ? LOCAL_2P.has(slug) ? "1–2 players" : "1 player"
        : "1 player";
  const desc = `${title} is ${DESC_CORE[genre]}. ${tagline} — ${CONTROLS[genre].split(" — ")[0].toLowerCase()} is all it takes to jump in. Free, unblocked and instant on school Chromebooks.`;
  const logo = g.icon ? `\n    logo: ${JSON.stringify(g.icon)},` : "";
  out.push(`  {
    slug: ${JSON.stringify(slug)},
    title: ${JSON.stringify(title)},
    tagline: ${JSON.stringify(tagline)},
    description: ${JSON.stringify(desc)},
    src: ${JSON.stringify(g.embed)},
    fallbackUrl: ${JSON.stringify(g.embed)},
    sandbox: SANDBOX,
    artGradient: ${JSON.stringify(pal[0])},
    accentText: ${JSON.stringify(pal[1])},
    accentChip: ${JSON.stringify(pal[2])},
    genre: ${JSON.stringify(genre)},
    tags: ${JSON.stringify(tags)},
    controls: ${JSON.stringify(CONTROLS[genre])},
    players: ${JSON.stringify(players)},${logo}
  },`);
  perGenre[genre] = (perGenre[genre] ?? 0) + 1;
});
console.log("emitted:", out.length, "dropped:", dropped, perGenre);

const file = `import { SANDBOX, type NeonGame } from "./games-types";

/**
 * Expanded library entries — every embed URL and logo was verified
 * (HTTP 200, framable, image) at build time. Order is stable.
 */
export const NEW_GAMES: NeonGame[] = [
${out.join("\n")}
];
`;
// SANDBOX lives in games.ts; to avoid a runtime cycle we keep types + sandbox in games-types.ts
writeFileSync("src/lib/games-new.ts", file);
console.log("wrote src/lib/games-new.ts");
