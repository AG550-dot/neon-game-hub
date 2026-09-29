// Compose the final new-game catalog: select per-genre slugs, clean titles,
// verify embed+icon URLs, emit compact verified JSON.
import { readFileSync, writeFileSync } from "node:fs";

// ---------- load pools ----------
const pools = [
  "/tmp/c6x_games_all.json",
  "/tmp/u66_games.json",
  "/tmp/fnf_games.json",
].flatMap((p) => JSON.parse(readFileSync(p, "utf8")) as any[]).filter((g) => g.embed);

const pool = new Map<string, any>();
for (const g of pools) {
  const embed = g.embed.replace(/\?gd_zone_config=.*$/, "").replace(/\/index\.html$/, "/");
  if (!/^https?:\/\//.test(embed)) continue;
  if (!pool.has(g.slug)) pool.set(g.slug, { ...g, embed });
}
console.log("pool:", pool.size);

// ---------- exclusions: our existing 31 premium games ----------
const EXCLUDE = new Set([
  "slope", "retro-bowl", "run-3", "cookie-clicker", "gladihoppers", "2048",
  "pacman", "chrome-dino", "1v1-lol", "1v1.lol", "krunker", "shell-shockers",
  "slither", "agar", "zombsroyale", "smash-karts", "drive-mad", "drift-hunters",
  "moto-x3m", "basket-random", "happy-wheels", "fireboy-and-watergirl-1",
  "geometry-dash-lite", "impossible-quiz", "papas-freezeria", "fnaf", "granny",
  "baldis-basics", "astray", "hexgl", "clumsy-bird", "eaglercraft",
]);

// ---------- selection ----------
const SELECTION: Record<string, string[]> = {
  Arcade: [
    "fancy-pants", "fancy-pants-2", "fancy-pants-3", "iron-snout", "short-life",
    "short-ride", "eggy-car", "tube-jumpers", "rocket-pult", "sausage-flip",
    "duck-life", "duck-life-2-world-champion", "duck-life-3-evolution", "duck-life-4",
    "eugenes-life", "rabbit-samurai", "crossy-road", "doodle-champion-island",
    "slime-road", "perfect-peel", "mad-day", "curve-ball-3d",
  ],
  "Endless Runner": [
    "slope-2", "slope-3", "slope-city", "temple-run-2", "subway-surfers-beijing",
    "subway-surfers-houston", "subway-surfers-newyork", "subway-runner", "helix-jump",
    "rolling-sky", "running-fred", "electron-dash", "snow-rider-3d", "cluster-rush",
    "vector-rush", "x-trench-run", "eagle-ride", "crowd-run-3d", "color-road-2",
    "g-switch-3", "dark-runner", "cubito",
  ],
  Sports: [
    "basketball-stars", "4th-and-goal-2022", "8-ball-pool",
    "air-hockey-championship-deluxe", "athletics-hero", "basket-champs",
    "bowling-stars", "cricket-world-cup", "dunkers", "foot-chinko",
    "free-kick-shooter", "kix-dream-soccer", "linebacker-alley-2",
    "penalty-kick-online", "stickman-golf", "super-liquid-soccer", "tanuki-sunset",
    "tennis-masters", "volley-random", "unicycle-hero", "archery-world-tour",
    "golfinity", "pool-club", "street-ball-jam", "golf-champions",
  ],
  Platformer: [
    "fireboy-and-watergirl-2", "fireboy-and-watergirl-3-ice-temple",
    "fireboy-and-watergirl-4", "fireboy-and-watergirl-5",
    "fireboy-and-watergirl-6", "snail-bob-1-html5", "snail-bob-2-html5",
    "snail-bob-3", "snail-bob-4", "snail-bob-5-html5", "snail-bob-6", "snail-bob-7",
    "vex-3", "vex-4", "vex-5", "vex-6", "vex-7", "vex-8", "ovo",
    "icy-purple-head-3", "icy-purple-head-superslide", "red-ball-4", "plactions",
  ],
  Idle: [
    "monkey-mart", "clicker-heroes", "idle-ants", "idle-breakout", "idle-dice",
    "idle-lumber-inc", "idle-mining-empire", "idle-success", "idle-miner",
    "idle-digging-tycoon", "idle-startup-tycoon", "ant-art-tycoon", "mr-mine-idle",
    "merge-alphabet", "merge-arena", "merge-master", "merge-rainbow", "merge-rot",
    "spacebar-clicker", "bitcoin-clicker", "capybara-clicker", "doggo-clicker",
    "kiwi-clicker", "tiny-fishing",
  ],
  Fighting: [
    "drunken-boxing", "drunken-boxing-2", "fray-fight", "rowdy-city-wrestling",
    "rowdy-wrestling", "swipe-fighter-heroes", "ultimate-boxing", "ninja-hands",
    "stick-war-ninja-duel", "stickman-dragon-fight", "stickman-fighter-epic-battle",
    "stickman-fighter-epic-battle-2", "stickman-fighter-mega-brawl", "stickman-war",
    "stickmanhook", "the-spear-stickman", "the-speed-ninja", "thumb-fighter-christmas",
    "stickman-boxing-ko-champion", "stick-fighter", "superbattle-2", "boxing-physics-2",
    "stickman-army-team-battle", "gun-fu-stickman-2",
  ],
  Sandbox: [
    "grindcraft", "grindcraft-remastered", "minecraft-unblocked", "minefunio",
    "bloons-tower-defense-3", "bloons-tower-defense-4", "game-of-farmers",
    "farm-clash-3d", "my-perfect-hotel", "tower-building", "build-crush",
    "tradecraft", "gold-miner", "ant-art-tycoon", "blocky-cars",
    "fortride-open-world", "only-up-3d-parkour-go-ascend", "raft-life",
    "jollyworld", "merge-harvest",
  ],
  Puzzle: [
    "block-blast", "b-cubed", "bloxorz", "block-the-pig", "lines-to-fill",
    "brain-test-tricky-puzzles", "brain-test-2-tricky-stories",
    "brain-test-3-tricky-quests", "who-is-lying", "there-is-no-game",
    "bob-the-robber", "bob-the-robber-2", "bob-the-robber-3",
    "bob-the-robber-5-temple-adventure", "boxrob", "boxrob-2", "boxrob-3",
    "factory-balls-forever", "free-the-key", "maze-path-of-light",
    "water-color-sort", "wood-blocks-3d", "detective-loupe-puzzle", "riddle-school",
    "getting-over-it",
  ],
  Racing: [
    "moto-x3m-2", "moto-x3m-pool-party", "moto-x3m-spooky-land", "moto-x3m-winter",
    "drift-boss", "burnout-drift-seaport-max", "crazy-cars", "city-rider",
    "highway-racer-3d", "highway-traffic", "traffic-mania", "madalin-stunt-cars-2",
    "madalin-stunt-cars-3", "grand-prix-hero", "furious-racing-3d", "go-kart-go-ultra",
    "rally-champion", "stock-car-hero", "top-speed-3d", "monster-tracks",
    "mad-truck-challenge-special", "school-bus-demolition-derby",
    "demolition-derby-crash-racing", "death-chase", "zombie-derby-pixel-survival",
  ],
  Retro: [
    "tetrys", "tetris-flash", "terris", "space-invaders", "google-snake",
    "doodle-jump", "flappy-bird-origin", "dinosaur-game", "dino-bros",
    "super-mario-classic", "sonic-origins-pocket-edition", "q-bert",
    "bubbles-hooter", "bubbles-cool", "pinball-space-adventure", "bomb-it-6",
    "bomb-it-7", "bomb-it-8", "cuphead", "worlds-hardest-game", "snake-vs-worms",
    "hextris",
  ],
  Shooter: [
    "time-shooter", "time-shooter-2", "time-shooter-3-swat", "funny-shooter-2",
    "fps-assault-shooter", "battle-forces", "blockpost", "gun-fest",
    "rooftop-shooters", "sniper-code-2", "sniper-shot-bullet-time", "the-sniper-code",
    "apple-shooter-1", "gunblood", "mr-bullet", "mr-bullet-2-online", "mr-bullet-3d",
    "horde-killer-you-vs-100", "squid-shooter", "slime-hunter", "superhot-prototype",
    "archer-master-3d-castle-defense", "leader-strike", "masked-forces",
    "pixel-gun-survival",
  ],
  Multiplayer: [
    "paper-io-2", "hole.io", "eatio-online", "tanko-io", "drift-io", "fish-eat",
    "trains-io", "armed-forces-io", "aquaparkio", "yohoho.io", "superhero.io",
    "rooftop-snipers", "rooftop-snipers-2", "getaway-shootout", "house-of-hazards",
    "minibattles", "12-minibattles", "duo-survival-2", "duo-survival-3",
    "head-soccer-2-player", "head-soccer-2023", "penalty-challenge-multiplayer",
    "bobblehead-soccer", "slope-2-multiplayer", "raft-wars-multiplayer",
  ],
  Ragdoll: [
    "ragdoll-archers", "ragdoll-hit", "hide-and-smash", "stickman-planks-fall",
    "fall-red-stickman", "bottle-flip-2", "bottle-flip-3d", "noob-torch-flip-2d",
    "obby-flip", "flip-bottle", "human-flip", "kickflip-santa", "tug-the-table",
    "dad-n-me", "wrassling", "elasticman", "halloween-skeleton-smash",
    "pixel-smash-duel", "justfall-lol", "bossy-toss", "get-on-top", "avoid-dying",
  ],
  Rhythm: [
    "friday-night-funkin", "fnf-another-friday-night", "a-dance-of-fire-and-ice",
    "color-switch", "geometry-dash", "geometry-dash-bloodbath",
    "geometry-dash-mr-dubstep", "geometry-dash-remastered", "geometry-dash-world",
    "geometry-dash-world-unblocked", "glitch-dash", "skibidi-dash", "tiles-hop-3d",
    "neon-tile-rush", "hell-tile", "geometry-neon-dash-rainbow", "evw",
    "rolling-sky-2", "magic-tiles-3", "dancing-line",
  ],
  Trivia: [
    "cubes-2048-io", "onet-fruit-classic", "tictactoe", "impossible-tic-tac-toe",
    "master-chess", "battleship", "word-city-crossed", "word-city-uncrossed",
    "words-search-classic-edition", "worldguessr", "guess-the-kitty",
    "handless-millionaire", "minesweeper", "jewel", "bejeweled-classic",
    "arithmetica", "2048-multitask", "tile-matching-3d", "poker-quest", "who-is",
  ],
  Cooking: [
    "bad-ice-cream", "bad-ice-cream-2", "bad-ice-cream-3", "papas-pizzeria",
    "papas-sushiria", "papas-burgeria", "papas-hotdoggeria", "papas-wingeria",
    "sushi-party-io", "sushi-supply-co", "penguin-diner-1", "penguin-diner-2",
    "cooking-tile", "merge-cakes", "cookie-master", "ice-cream-vendor",
    "cake-clicker", "cake-maker", "food-empire-inc", "burger-clicker",
  ],
  Horror: [
    "poppy-glamrock", "escape-from-school", "level-devil", "level-devil-2",
    "death-run-3d", "death-chase-2", "zombie-clash-3d", "zombies-are-coming-xtreme",
    "zombie-tsunami", "zombies-shooter-part-2", "fnaf-shooter",
    "merge-monster-army-game", "jump-monster", "trollface-quest-horror-1",
    "trollface-quest-horror-2", "imposter-between-us", "impostor-vs-noob", "murder",
    "stickman-vs-huggy-wuggy", "death-chase",
  ],
};

// ---------- helpers ----------
function cleanTitle(g: any): string {
  let t: string = (g.title ?? g.slug)
    .replace(/\s*(Unblocked\s*Games?\s*(66|76|6x|WTF|77|67)?|Unblocked)\s*$/i, "")
    .replace(/\s*[-–|]\s*Play.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const SPECIAL: Record<string, string> = {
    "Papas Freezeria": "Papa's Freezeria", "Papas Pizzeria": "Papa's Pizzeria",
    "Papas Sushiria": "Papa's Sushiria", "Papas Burgeria": "Papa's Burgeria",
    "Papas Hotdoggeria": "Papa's Hotdoggeria", "Papas Wingeria": "Papa's Wingeria",
    "Fnf Another Friday Night": "FNF: Another Friday Night",
    "Friday Night Funkin": "Friday Night Funkin'",
    "A Dance Of Fire And Ice": "A Dance of Fire and Ice",
    "Trollface Quest Horror 1": "TrollFace Quest: Horror 1",
    "Trollface Quest Horror 2": "TrollFace Quest: Horror 2",
    "2048 Multitask": "2048 Multitask", "Q-bert": "Q*bert", "Q*bert": "Q*bert",
    "Evw": "EVW Dash", "Who Is": "Who Is?", "Geometry Dash World Unblocked": "Geometry Dash World",
    "Geometry Neon Dash RainBow": "Geometry Neon Dash Rainbow",
    "Mr.mine Idle": "Mr. Mine", "Mr Mine": "Mr. Mine",
    "TicTacToe": "Tic-Tac-Toe", "B-Cubed": "B-Cubed", "Vex 3 Xmas": "VEX 3 Xmas",
    "Ice Cream Vendor": "Ice Cream Vendor", "Zombsroyale": "ZombsRoyale",
    "1v1.LOL": "1v1.LOL", "Snake Is MLG Edition": "Snake MLG",
  };
  if (SPECIAL[t]) return SPECIAL[t];
  t = t.replace(/\bfnf\b/i, "FNF").replace(/\bio\b/g, ".io").replace(/\bTd\b/, "TD")
    .replace(/\b3d\b/g, "3D").replace(/\b2d\b/g, "2D").replace(/\bHtml5\b/, "HTML5")
    .replace(/\bIq\b/, "IQ").replace(/\bVr\b/, "VR");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const GENRE_TAGLINE: Record<string, string[]> = {
  Arcade: ["Pure arcade energy", "Simple to start, hard to put down", "One more run, guaranteed", "Classic arcade chaos", "Instant fun, zero setup"],
  "Endless Runner": ["How far can you go?", "The run never stops", "Speed is the only rule", "Chase that high score", "Reflexes only — good luck"],
  Sports: ["Step onto the field", "Champions only", "Game day, every day", "Bring your A-game", "Victory tastes sweet"],
  Platformer: ["Jump, run, repeat", "Precision platforming", "Time every leap", "A classic jump-and-run", "Timing is everything"],
  Idle: ["Watch the numbers explode", "Progress even while you rest", "Idle hands, huge empire", "Tap, upgrade, repeat", "The perfect background tab"],
  Fighting: ["Duel your rival", "Settle it with fists", "Fight for glory", "Chaos in the arena", "Last one standing wins"],
  Sandbox: ["Build your own world", "Create without limits", "Your rules, your world", "Grow something great", "A world to call yours"],
  Puzzle: ["Flex that big brain", "Think it through", "Solve the impossible", "Logic meets fun", "Every level is a riddle"],
  Racing: ["Pedal to the metal", "Burn rubber, chase glory", "First across the line", "Speed demon approved", "Grip it and rip it"],
  Retro: ["A legend, reborn", "Old-school, timeless", "Straight from the arcade", "Retro never dies", "The classics still rule"],
  Shooter: ["Lock, load, go", "Aim true", "Trigger discipline required", "Blast through the waves", "Steady hands win"],
  Multiplayer: ["Better with friends", "Challenge the world", "Grab a rival and go", "Multiplayer mayhem", "Beat your buddies"],
  Ragdoll: ["Physics does the rest", "Wobble, flip, flop", "Brace for impact", "Ragdoll glory awaits", "Ugly landings, big laughs"],
  Rhythm: ["Feel the beat", "Move with the music", "Rhythm is everything", "Tap to the tempo", "Don't miss a beat"],
  Trivia: ["Brain power required", "Think you're smart? Prove it", "Master every challenge", "Smarts beat speed", "A true mind-bender"],
  Cooking: ["Serve it up hot", "Order up!", "The kitchen is calling", "Customer satisfaction guaranteed", "Cook fast, serve faster"],
  Horror: ["Lights off recommended", "Don't play this alone", "Survive if you can", "Something lurks here", "Enter at your own risk"],
};
const GENRE_DESC: Record<string, string> = {
  Arcade: "instant-to-learn arcade action that runs right in the browser",
  "Endless Runner": "an endless runner where every meter raises the stakes",
  Sports: "a fast, pick-up-and-play sports showdown",
  Platformer: "a classic platform adventure with handcrafted levels",
  Idle: "a deeply satisfying idle game that keeps earning while you're away",
  Fighting: "a frantic head-to-head brawler",
  Sandbox: "a creative sandbox that rewards experimentation",
  Puzzle: "a clever puzzle challenge that gets trickier every level",
  Racing: "high-speed driving action with real handling",
  Retro: "a faithful browser tribute to an arcade legend",
  Shooter: "a fast-fingered shooting gallery",
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
  Racing: "Arrows / WASD — drive", Retro: "Arrows — play", Shooter: "Mouse — aim, click — shoot",
  Multiplayer: "Arrows / WASD — move & compete", Ragdoll: "Arrows — flail & flop",
  Rhythm: "Arrow keys / DFJK — hit the beat", Trivia: "Mouse — think & click",
  Cooking: "Mouse — cook & serve", Horror: "WASD + mouse — explore & survive",
};

// ---------- assemble ----------
const chosen: any[] = [];
const usedSlugs = new Set<string>();
const missing: string[] = [];
for (const [genre, slugs] of Object.entries(SELECTION)) {
  for (const slug of slugs) {
    if (EXCLUDE.has(slug) || usedSlugs.has(slug)) continue;
    const g = pool.get(slug);
    if (!g) { missing.push(`${genre}:${slug}`); continue; }
    usedSlugs.add(slug);
    const title = cleanTitle(g);
    const tls = GENRE_TAGLINE[genre];
    const tagline = tls[(chosen.length + slug.length) % tls.length];
    chosen.push({
      slug, title, tagline, genre,
      embed: g.embed, icon: g.icon ?? "",
      desc: `${title} is ${GENRE_DESC[genre]}. ${tagline} — ${CONTROLS[genre].split(" — ")[0].toLowerCase()} is all you need.`,
      cats: g.cats ?? [],
    });
  }
}
console.log("chosen:", chosen.length);
const byGenreCount: Record<string, number> = {};
for (const c of chosen) byGenreCount[c.genre] = (byGenreCount[c.genre] ?? 0) + 1;
console.log(byGenreCount);
if (missing.length) console.log("MISSING:", missing.join(", "));

// ---------- verification ----------
async function verify(c: any) {
  const hdr = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0" };
  try {
    const r = await fetch(c.embed, { redirect: "follow", headers: hdr, signal: AbortSignal.timeout(14000) });
    if (!(r.status >= 200 && r.status < 300)) return { ...c, problem: `embed HTTP ${r.status}` };
    const xfo = (r.headers.get("x-frame-options") ?? "").toLowerCase();
    const csp = (r.headers.get("content-security-policy") ?? "").toLowerCase();
    if (xfo.includes("deny") || xfo.includes("sameorigin")) return { ...c, problem: `embed XFO ${xfo}` };
    if (/frame-ancestors\s+'?self'|frame-ancestors\s+'none'/.test(csp)) return { ...c, problem: "embed CSP" };
  } catch (e: any) {
    return { ...c, problem: `embed ERR ${String(e).slice(0, 60)}` };
  }
  if (c.icon) {
    try {
      const r2 = await fetch(c.icon, { method: "HEAD", redirect: "follow", headers: hdr, signal: AbortSignal.timeout(12000) });
      const ct = r2.headers.get("content-type") ?? "";
      if (!(r2.status === 200 && /image| octet-stream|application\/octet/.test(ct))) {
        const r3 = await fetch(c.icon, { redirect: "follow", headers: hdr, signal: AbortSignal.timeout(12000) });
        const ct3 = r3.headers.get("content-type") ?? "";
        if (!(r3.status === 200 && /image|octet/.test(ct3))) return { ...c, problem: `icon HTTP ${r2.status} ${ct}` };
      }
    } catch (e: any) {
      return { ...c, problem: `icon ERR ${String(e).slice(0, 60)}` };
    }
  }
  return c;
}

const CONC = 10;
const verified: any[] = [];
const problems: any[] = [];
for (let i = 0; i < chosen.length; i += CONC) {
  const out = await Promise.all(chosen.slice(i, i + CONC).map(verify));
  for (const r of out) (r.problem ? problems : verified).push(r);
  if ((i / CONC) % 8 === 0) console.log(`  verified ${i + out.length}/${chosen.length}`);
}
console.log("verified OK:", verified.length, "problems:", problems.length);
console.log("PROBLEMS:", problems.map((p) => `${p.slug} [${p.problem}]`).join("\n"));

const finalCounts: Record<string, number> = {};
for (const v of verified) finalCounts[v.genre] = (finalCounts[v.genre] ?? 0) + 1;
console.log("FINAL per genre:", finalCounts);

writeFileSync("/tmp/catalog_verified.json", JSON.stringify({ verified, problems }, null, 1));
console.log("wrote /tmp/catalog_verified.json");
