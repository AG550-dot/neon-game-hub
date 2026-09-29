// Rerun genre assignment over the FULL merged pool (734 entries, 620 with embeds).
import { readFileSync, writeFileSync } from "node:fs";

const games: any[] = JSON.parse(readFileSync("/tmp/c6x_games_all.json", "utf8")).filter(
  (g: any) => g.embed,
);
// Dedupe by embed, strip tracking params, drop junk
const seen = new Map<string, any>();
for (const g of games) {
  if (!seen.has(g.embed)) seen.set(g.embed, g);
}
const uniq = [...seen.values()]
  .map((g) => ({
    ...g,
    embed: g.embed.replace(/\?gd_zone_config=.*$/, "").replace(/\/index\.html$/, "/"),
  }))
  .filter(
    (g) =>
      !/roblox|minecraft|hollow.?knight|gta|fortnite|among.?us|call.?of.?duty|fifa|sonic\.?exe/i.test(
        g.slug,
      ),
    )
  .filter((g) => g.embed.startsWith("http"));
console.log("clean pool:", uniq.length);

// Slug/title -> genre buckets (curated; honest primary-genre assignments)
const ASSIGN: [RegExp, string][] = [
  [/^(fnf|friday|funkin)/i, "Rhythm"],
  [/geometry.?dash|electron.?dash|glitch.?dash|skibidi.?dash/i, "Rhythm"],
  [/piano|tile.?hop|beat.?saber|music.?r|dance|dancing/i, "Rhythm"],
  [/ragdoll|wreck|destroy|smash|demolish/i, "Ragdoll"],
  [/boxing|wrestl|fight|brawl|duel|sword|samurai|ninja|karate|taekwondo|war$|wars/i, "Fighting"],
  [/^(papas|papa)/i, "Cooking"],
  [/sushi|pizza|burger|ice.?cream|cake|cook|cafe|coffee|lemonade|candy|donut|snack|food|dessert/i, "Cooking"],
  [/zombi|granny|baldi|fnaf|freddy|scary|horror|night.?at|haunt|backrooms|amanda|evil|monster|death|kidnap|escape/i, "Horror"],
  [/^(quiz|trivia|word)|crossword|sudoku|typing|hangman|millionaire|flag|geo.?guess|tictactoe|tic.?tac/i, "Trivia"],
  [/2048|onet|memory|match.?pair|solitaire|mahjong|minesweeper|chess|checkers/i, "Trivia"],
  [/^(grindcraft|bloxd)|craft|mine|tycoon|build|farmer|farm|island|colony|town|kogama|voxel|hotel|zoo|park/i, "Sandbox"],
  [/^(tetrys|tetris|snake|pac|pong|breakout|bubble.?shooter|flappy|dino|mario|sonic|invader|frogger|asteroid|galaga|donkey|atari|q.?bert|frog|duck.?hunt)/i, "Retro"],
  [/paper.?io|\.io$|-io$|^io|cubes.?2048|fish.?eat|hole.?io|eat\.io|aquapark|tanko|trains.?io|armed.?forces|multiplayer|2.?player/i, "Multiplayer"],
  [/^(slope|run|tunnel|electron|spiral|helix|color.?road|sky.?roll|wave|jetpack|subway|cluster|vector|rolling|eagle|x.?trench|queen|crowd|cubito|g?switch|supernova)/i, "Endless Runner"],
  [/parking|drift|race|racing|rally|kart|bike|moto|driv|car|truck|taxi|bus|traffic|highway|speed|burnout|burnin|stunt|skate|hover|bumper|wheely|hill.?climb|jellycar|offroad/i, "Racing"],
  [/^(basket|basketball|foot|soccer|golf|penalty|free.?kick|volley|tennis|cricket|hockey|baseball|bowling|ping.?pong|pool|8.?ball|darts|minigolf|billiard|blumgi.?ball|head.?soccer|street.?dribble|slam.?dunk|crossbar|goalkeeper)/i, "Sports"],
  [/plank|flip|fall|troll|wobble|body|physics/i, "Ragdoll"],
  [/^(ovo|snail.?bob|fireboy|watergirl|bad.?ice|vex|platform|jump|climb|ladder|maze|red.?ball|wheely|tomb.?of.?the.?mask)/i, "Platformer"],
  [/^(idle|clicker|click|incremental|merge|ant.?art|monkey.?mart|mr.?mine|bitcoin|capybara|doggo|kiwi|poop|tube|spacebar)/i, "Idle"],
];

const byGenre: Record<string, any[]> = {};
const leftover: any[] = [];
for (const g of uniq) {
  const hit = ASSIGN.find(([re]) => re.test(g.slug) || re.test(g.title ?? ""));
  if (hit) (byGenre[hit[1]] ??= []).push(g);
  else leftover.push(g);
}

const TARGETS = [
  "Arcade", "Endless Runner", "Sports", "Platformer", "Idle", "Fighting",
  "Sandbox", "Puzzle", "Racing", "Retro", "Shooter", "Multiplayer",
  "Ragdoll", "Rhythm", "Trivia", "Cooking", "Horror",
];
for (const t of TARGETS) console.log(`${t.padEnd(15)} ${String(byGenre[t]?.length ?? 0).padStart(3)}`);
console.log("leftover:", leftover.length);
console.log("LEFTOVER:", leftover.map((g) => g.slug).join(" · "));

writeFileSync("/tmp/c6x_bygenre_all.json", JSON.stringify(byGenre, null, 1));
writeFileSync("/tmp/c6x_leftover_all.json", JSON.stringify(leftover, null, 1));
