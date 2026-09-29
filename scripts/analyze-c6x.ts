// Analyze c6x extraction: map their categories to our genres, count coverage.
import { readFileSync } from "node:fs";

const games: any[] = JSON.parse(readFileSync("/tmp/c6x_games.json", "utf8")).filter(
  (g: any) => g.embed,
);
console.log("games with embed:", games.length);

// c6x category -> our genre candidates (in priority order)
const CAT_TO_GENRE: Record<string, string[]> = {
  racing: ["Racing"],
  car: ["Racing"],
  running: ["Endless Runner"],
  arcade: ["Arcade"],
  "2-player": ["Multiplayer", "Sports", "Fighting"],
  action: ["Shooter", "Fighting", "Arcade"],
  shooting: ["Shooter"],
  io: ["Multiplayer"],
  stickman: ["Fighting"],
  retro: ["Retro"],
  flash: ["Retro"],
  fnf: ["Rhythm"],
  "fruit-merge": ["Puzzle"],
  puzzle: ["Puzzle"],
  clicker: ["Idle"],
  idle: ["Idle"],
  incremental: ["Idle"],
  simulator: ["Idle", "Arcade"],
  sport: ["Sports"],
  skill: ["Arcade", "Puzzle", "Endless Runner"],
  adventure: ["Platformer"],
  anime: ["Fighting", "Arcade"],
};

// Which genre bucket(s) each game can fill (first matching category wins, plus all)
function genresFor(g: any): string[] {
  const out: string[] = [];
  for (const cat of g.cats ?? []) {
    for (const gr of CAT_TO_GENRE[cat] ?? []) if (!out.includes(gr)) out.push(gr);
  }
  return out;
}

const counts: Record<string, number> = {};
const byGenre: Record<string, any[]> = {};
for (const g of games) {
  const grs = genresFor(g);
  (g as any).genres = grs;
  for (const gr of grs) {
    counts[gr] = (counts[gr] ?? 0) + 1;
    (byGenre[gr] ??= []).push(g);
  }
}

const TARGETS = [
  "Arcade", "Endless Runner", "Sports", "Platformer", "Idle", "Fighting",
  "Sandbox", "Puzzle", "Racing", "Retro", "Shooter", "Multiplayer",
  "Ragdoll", "Rhythm", "Trivia", "Cooking", "Horror",
];
for (const t of TARGETS) {
  console.log(`${t.padEnd(15)} ${String(counts[t] ?? 0).padStart(3)}`);
}
console.log("unmapped:", games.filter((g) => g.genres.length === 0).length);

// Preview 8 titles for the thin genres to hand-check fit
for (const t of ["Fighting", "Ragdoll", "Trivia", "Cooking", "Horror", "Rhythm", "Sandbox", "Platformer"]) {
  const list = (byGenre[t] ?? []).slice(0, 8).map((g: any) => `${g.slug} [${(g.cats ?? []).join(",")}]`);
  console.log(`\n${t}:`, list.join(" · "));
}
