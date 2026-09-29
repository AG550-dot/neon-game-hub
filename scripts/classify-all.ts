// Classify the COMBINED c6x + u66 pools into our 17 genres with full rules.
import { readFileSync, writeFileSync } from "node:fs";

const c6x: any[] = JSON.parse(readFileSync("/tmp/c6x_games_all.json", "utf8")).filter((g: any) => g.embed);
const u66: any[] = JSON.parse(readFileSync("/tmp/u66_games.json", "utf8")).filter((g: any) => g.embed);

// Merge: c6x first (priority), dedupe by embed + slug
const seenEmbed = new Set<string>();
const seenSlug = new Set<string>();
const merged: any[] = [];
for (const g of [...c6x, ...u66]) {
  const embed = g.embed.replace(/\?gd_zone_config=.*$/, "").replace(/\/index\.html$/, "/");
  if (!/^https?:\/\//.test(embed)) continue;
  if (seenEmbed.has(embed) || seenSlug.has(g.slug)) continue;
  seenEmbed.add(embed);
  seenSlug.add(g.slug);
  merged.push({ ...g, embed });
}
console.log("merged unique games:", merged.length);

const ASSIGN: [RegExp, string][] = [
  [/^(fnf|friday|funkin)/i, "Rhythm"],
  [/geometry.?dash|electron.?dash|glitch.?dash|skibidi.?dash|tiles.?hop|evw$/i, "Rhythm"],
  [/piano|music|song|beat.?saber|dance|dancing|harmonica/i, "Rhythm"],
  [/ragdoll|wreck|destroy|smash|demolish/i, "Ragdoll"],
  [/^(papas|papa)/i, "Cooking"],
  [/sushi|pizza|burger|ice.?cream|cake|cook|cafe|coffee|lemonade|candy|donut|snack|food|dessert|diner|penguin.?diner|cooking.?tile|bakery/i, "Cooking"],
  [/zombi|granny|baldi|fnaf|freddy|scary|horror|night.?at|haunt|backrooms|amanda|evil|monster|death|kidnap|poppy|escape/i, "Horror"],
  [/^(quiz|trivia|word)|crossword|sudoku|typing|hangman|millionaire|flag|geo.?guess|worldguessr|guess/i, "Trivia"],
  [/2048|onet|memory|match.?pair|solitaire|mahjong|minesweeper|chess|checkers|battleship|tictactoe|tic.?tac|master.?chess/i, "Trivia"],
  [/^(grindcraft|bloxd)|craft|mine|tycoon|build|farmer|farm|island|colony|town|kogama|voxel|hotel|zoo|park$|parkour|parking|bloons.?tower/i, "Sandbox"],
  [/^(tetrys|tetris|snake|pac|pong|breakout|bubble.?shooter|flappy|dino|mario|sonic|invader|frogger|asteroid|galaga|donkey|atari|q.?bert|frog|duck.?hunt|pinball|bejeweled|bomb.?it|cuphead|world.?hardest|bubbles)/i, "Retro"],
  [/paper.?io|\.io$|-io$|^io|cubes.?2048|fish.?eat|hole.?io|eat\.io|aquapark|tanko|trains.?io|armed.?forces|multiplayer|2.?player|head.?soccer|penalty.?challenge|duo|1v1/i, "Multiplayer"],
  [/^(slope|run|tunnel|electron|spiral|helix|color.?road|sky.?roll|wave|jetpack|subway|cluster|vector|rolling|eagle|x.?trench|queen|crowd|cubito|g?switch|supernova|temple.?run|doodle.?jump|snow.?rider|dark.?runner|crazy.?runner|neon.?challenge)/i, "Endless Runner"],
  [/parking|drift|race|racing|rally|kart|bike|moto|driv|car|truck|taxi|bus|traffic|highway|speed|burnout|burnin|stunt|skate|hover|bumper|wheely|hill.?climb|jellycar|offroad|earn.?to.?die|formula|grand.?prix|top.?speed|hydro/i, "Racing"],
  [/^(basket|basketball|foot|soccer|golf|penalty|free.?kick|volley|tennis|cricket|hockey|baseball|bowling|ping.?pong|pool|8.?ball|darts|minigolf|billiard|blumgi.?ball|street.?dribble|slam.?dunk|crossbar|goalkeeper|badminton|kix|fiveheads|pill.?soccer|heads.?arena|rocket.?soccer|tap.?tap.?shots|dunkbrush|a.?small.?world.?cup|football|headis)/i, "Sports"],
  [/plank|flip|fall|troll|wobble|body|physics|getaway|tug.?the.?table|wrassling|dad.?n.?me|elasticman/i, "Ragdoll"],
  [/^(ovo|snail.?bob|fireboy|watergirl|bad.?ice|vex|platform|jump|climb|ladder|maze|red.?ball|wheely|tomb.?of.?the.?mask|icy.?purple|plonky|getting.?over.?it|swing|sling.?kong|rotate|b.?cubed|bloxorz|block.?the.?pig|block.?blast|lines.?to.?fill|block.?toggle|balls.?avoid|slice.?master|colorup|color.?tunnel)/i, "Puzzle"],
  [/^(idle|clicker|click|incremental|merge|ant.?art|monkey.?mart|mr.?mine|mr\.mine|bitcoin|capybara|doggo|kiwi|poop|tube|spacebar|chicken|planet|duck.?duck|chill.?guy|tung|barbershop|tiny.?fishing|gold.?digger|cats.?drop|slimemaker|pop.?it)/i, "Idle"],
  [/^(ovo|snail.?bob|adam|eugene|duck.?life|raft|fox|dog|cat|horse|tiger|panda|dragon.?sim|deer|raccoon|sharko|rio.?rex|iron.?snout|bacon|cave.?blast|castle.?pals|eugenes)/i, "Arcade"],
  [/^(apple.?shooter|archer|sniper|gun|shoot|bullet|fps|battle.?forces|blockpost|time.?shooter|superhot|horde.?killer|squid.?shooter|slime.?hunter|mr.?bullet|rooftop.?shoot|soldier|rebel|clash|war|strike|zombie.?clash|duck.?shooter|cannon|bomb|tank|armed|swat|strike.?force|assault)/i, "Shooter"],
  [/^(stick)/i, "Fighting"],
  [/^(1v1|rooftop.?snipers|getaway.?shootout|house.?of.?hazards|minibattles|12.?minibattles)/i, "Multiplayer"],
  [/^(bob.?the.?robber|boxrob|stealing|infiltrating|fleeing|breaking.?the.?bank|grindcraft)/i, "Puzzle"],
  [/^(brain.?test|brain.?truck|who.?is.?lying|there.?is.?no.?game|help.?the.?hero|magikmon|poker.?quest|trash.?factory|doll.?designer|instadiva|pop.?it)/i, "Puzzle"],
  [/^(tag$|tag-|duck.?life|eugenes.?life|happy.?wheels|g?switch)/i, "Arcade"],
];

const byGenre: Record<string, any[]> = {};
const leftover: any[] = [];
for (const g of merged) {
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

writeFileSync("/tmp/pool_bygenre.json", JSON.stringify(byGenre, null, 1));
writeFileSync("/tmp/pool_leftover.json", JSON.stringify(leftover, null, 1));
writeFileSync("/tmp/pool_merged.json", JSON.stringify(merged, null, 1));
