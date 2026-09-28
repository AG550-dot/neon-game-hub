export type NeonGame = {
  /** URL slug used in /play/:slug routes */
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /**
   * URL embedded in the iframe. Points DIRECTLY at the game itself
   * (canvas/app entry), not an ad-wrapped portal page, so it runs
   * cleanly inside our arcade frame.
   */
  src: string;
  /**
   * Where to send players if embedding is ever blocked by the host.
   * Opens in a new tab.
   */
  fallbackUrl: string;
  /** Permissive sandbox for these trusted, static game builds. */
  sandbox: string;
  /** Tailwind gradient classes for the card art */
  artGradient: string;
  /** Tailwind text color class matching the accent */
  accentText: string;
  /** Tailwind bg color class used for the play-button glow chip */
  accentChip: string;
  /** Primary genre — drives /genre/:genre library pages */
  genre: Genre;
  /** Extra style tags shown on cards */
  tags: string[];
  controls: string;
  players: string;
};

export const GENRES = [
  "Arcade",
  "Endless Runner",
  "Sports",
  "Platformer",
  "Idle",
  "Fighting",
  "Sandbox",
  "Puzzle",
  "Racing",
  "Retro",
  "Shooter",
  "Multiplayer",
  "Ragdoll",
  "Rhythm",
  "Trivia",
  "Cooking",
  "Horror",
] as const;

export type Genre = (typeof GENRES)[number];

/** Sandbox token list shared by all hosted games (no allow-top-navigation,
 *  so frame-buster code can never yank the whole arcade page away). */
const SANDBOX =
  "allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-downloads allow-modals allow-orientation-lock";

export const GAMES: NeonGame[] = [
  {
    slug: "slope",
    title: "Slope",
    tagline: "Ride the endless neon slope",
    description:
      "Roll a glowing ball down a steep 3D slope that never stops accelerating. Dodge red blocks, ride the ramps, and chase a leaderboard score that climbs with every meter. One of the most legendary unblocked games ever made.",
    src: "https://slope-pro.github.io/slope-github/",
    fallbackUrl: "https://slope-pro.github.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff2ea6] via-[#b026ff] to-[#2e6bff]",
    accentText: "text-[#ff2ea6]",
    accentChip: "bg-[#ff2ea6]",
    genre: "Endless Runner",
    tags: ["3D", "Hard", "Classic"],
    controls: "Arrow keys / A D — steer",
    players: "1 player",
  },
  {
    slug: "retro-bowl-25",
    title: "Retro Bowl 25",
    tagline: "Coach your pixel dynasty",
    description:
      "The beloved retro football sim, fully unblocked. Draft your roster, call the plays, throw dot-perfect passes and take your pixel franchise all the way to the Retro Bowl. Simple controls, deep season management.",
    src: "https://retrobowl25unblocked.github.io/game/",
    fallbackUrl: "https://retrobowl25unblocked.github.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#3dff8b] via-[#00e5ff] to-[#2e6bff]",
    accentText: "text-[#3dff8b]",
    accentChip: "bg-[#3dff8b]",
    genre: "Sports",
    tags: ["Football", "Management", "Classic"],
    controls: "Mouse / touch — aim & throw",
    players: "1 player",
  },
  {
    slug: "run-3",
    title: "Run 3",
    tagline: "Sprint through the void",
    description:
      "Run through a crumbling neon tunnel floating in space where the whole level rotates as you move. Jump gaps, flip gravity along the walls and unlock new characters across dozens of levels — or go infinite.",
    src: "https://run31225.github.io/",
    fallbackUrl: "https://run3-pro.github.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#00e5ff] via-[#b026ff] to-[#ff2ea6]",
    accentText: "text-[#00e5ff]",
    accentChip: "bg-[#00e5ff]",
    genre: "Endless Runner",
    tags: ["Space", "Levels", "Classic"],
    controls: "Arrows / space — run & jump",
    players: "1 player",
  },
  {
    slug: "cookie-clicker",
    title: "Cookie Clicker",
    tagline: "Bake a cookie empire",
    description:
      "The original idle mega-hit. Click a giant cookie, buy grandmas, farms and portals, and watch your cookies-per-second explode into the millions. The perfect low-key tab to keep open during study hall.",
    src: "https://g8hh.github.io/cookieclicker/",
    fallbackUrl: "https://g8hh.github.io/cookieclicker/",
    sandbox: SANDBOX,
    artGradient: "from-[#ffe14d] via-[#ff7a1a] to-[#ff2ea6]",
    accentText: "text-[#ffe14d]",
    accentChip: "bg-[#ffe14d]",
    genre: "Idle",
    tags: ["Incremental", "Chill", "Classic"],
    controls: "Mouse — click & buy",
    players: "1 player",
  },
  {
    slug: "gladihoppers",
    title: "Gladihoppers",
    tagline: "Hop into the arena",
    description:
      "A hilarious 2D physics gladiator brawler. Charge into the arena, flail your sword with ragdoll precision, and stomp your rival before they stomp you. Practice solo or duel a friend on the same keyboard.",
    src: "https://gladihoppers.io/frame/",
    fallbackUrl: "https://gladihoppersgames.github.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff7a1a] via-[#ff2ea6] to-[#b026ff]",
    accentText: "text-[#ff7a1a]",
    accentChip: "bg-[#ff7a1a]",
    genre: "Fighting",
    tags: ["Physics", "2 Player", "Gladiator"],
    controls: "Arrows / WASD — move, jump & fight",
    players: "1–2 players",
  },
  {
    slug: "eaglercraft",
    title: "Eaglercraft",
    tagline: "A blocky sandbox in your browser",
    description:
      "The legendary browser sandbox — mine, craft, build and survive in an infinite voxel world. Singleplayer works instantly; servers let you join friends. A true Minecraft-style experience that runs on school Chromebooks.",
    src: "https://eaglercraft.q13x.com/1.8.8_2/js/",
    fallbackUrl: "https://eaglercraft.q13x.com/1.8.8_2/js/",
    sandbox: SANDBOX,
    artGradient: "from-[#3dff8b] via-[#ffe14d] to-[#ff7a1a]",
    accentText: "text-[#3dff8b]",
    accentChip: "bg-[#3dff8b]",
    genre: "Sandbox",
    tags: ["Voxel", "Building", "Multiplayer"],
    controls: "WASD + mouse — mine, build & survive",
    players: "Singleplayer & servers",
  },
  {
    slug: "2048",
    title: "2048",
    tagline: "Merge to the magic number",
    description:
      "The original open-source 2048. Slide numbered tiles, merge matching pairs and chase that elusive 2048 tile — then keep going for 4096 and beyond. Simple rules, endless one-more-try appeal.",
    src: "https://gabrielecirulli.github.io/2048/",
    fallbackUrl: "https://gabrielecirulli.github.io/2048/",
    sandbox: SANDBOX,
    artGradient: "from-[#ffe14d] via-[#3dff8b] to-[#00e5ff]",
    accentText: "text-[#ffe14d]",
    accentChip: "bg-[#ffe14d]",
    genre: "Puzzle",
    tags: ["Numbers", "Chill", "Classic"],
    controls: "Arrow keys / swipe — slide tiles",
    players: "1 player",
  },
  {
    slug: "clumsy-bird",
    title: "Clumsy Bird",
    tagline: "Flap through the pipes",
    description:
      "The beloved open-source Flappy Bird remake. Tap to flap your chunky bird through endless neon pipe gaps — easy to learn, brutally hard to master, impossible to put down.",
    src: "https://ellisonleao.github.io/clumsy-bird/",
    fallbackUrl: "https://ellisonleao.github.io/clumsy-bird/",
    sandbox: SANDBOX,
    artGradient: "from-[#3dff8b] via-[#ffe14d] to-[#ff7a1a]",
    accentText: "text-[#3dff8b]",
    accentChip: "bg-[#3dff8b]",
    genre: "Arcade",
    tags: ["Flappy", "Hard", "1 Button"],
    controls: "Click / space — flap",
    players: "1 player",
  },
  {
    slug: "astray",
    title: "Astray",
    tagline: "Tilt through the maze",
    description:
      "Guide a glowing marble through mind-bending 3D mazes built with WebGL. Tilt, roll and navigate toward the goal before the clock beats you — gorgeous, hypnotic puzzle action.",
    src: "https://wwwtyro.github.io/Astray/",
    fallbackUrl: "https://wwwtyro.github.io/Astray/",
    sandbox: SANDBOX,
    artGradient: "from-[#b026ff] via-[#2e6bff] to-[#00e5ff]",
    accentText: "text-[#b026ff]",
    accentChip: "bg-[#b026ff]",
    genre: "Puzzle",
    tags: ["3D", "Maze", "Chill"],
    controls: "Arrow keys / WASD — roll the marble",
    players: "1 player",
  },
  {
    slug: "pacman",
    title: "Pac-Man",
    tagline: "Munch dots, dodge ghosts",
    description:
      "The genuine arcade icon. Chomp every dot, snag power pellets and outwit Blinky, Pinky, Inky and Clyde in the maze that started it all. Faithful, free and dangerously addictive.",
    src: "https://passer-by.com/pacman/",
    fallbackUrl: "https://passer-by.com/pacman/",
    sandbox: SANDBOX,
    artGradient: "from-[#ffe14d] via-[#ff7a1a] to-[#ff2ea6]",
    accentText: "text-[#ffe14d]",
    accentChip: "bg-[#ffe14d]",
    genre: "Retro",
    tags: ["Arcade Icon", "Maze", "Classic"],
    controls: "Arrow keys / swipe — move",
    players: "1 player",
  },
  {
    slug: "hexgl",
    title: "HexGL",
    tagline: "Race the neon future",
    description:
      "Blazing-fast futuristic anti-gravity racing with gorgeous WebGL visuals. Thread your ship through the city track at ludicrous speed — think Wipeout, straight in your browser, no download.",
    src: "https://hexgl.bkcore.com/play/",
    fallbackUrl: "https://hexgl.bkcore.com/play/",
    sandbox: SANDBOX,
    artGradient: "from-[#00e5ff] via-[#2e6bff] to-[#b026ff]",
    accentText: "text-[#00e5ff]",
    accentChip: "bg-[#00e5ff]",
    genre: "Racing",
    tags: ["3D", "Future", "Fast"],
    controls: "Arrows / WASD — steer & boost",
    players: "1 player",
  },
  {
    slug: "chrome-dino",
    title: "Chrome Dino",
    tagline: "The offline legend, online",
    description:
      "The game everyone knows from the no-internet screen. Jump the cacti, duck the pterodactyls, and watch the desert flip to night mode as your score climbs. Simple, timeless, weirdly competitive.",
    src: "https://chromedino.com/",
    fallbackUrl: "https://chromedino.com/",
    sandbox: SANDBOX,
    artGradient: "from-[#a79bd1] via-[#00e5ff] to-[#3dff8b]",
    accentText: "text-[#a79bd1]",
    accentChip: "bg-[#a79bd1]",
    genre: "Retro",
    tags: ["1 Button", "Classic", "Chrome"],
    controls: "Space / up — jump, down — duck",
    players: "1 player",
  },
  {
    slug: "1v1-lol",
    title: "1v1.LOL",
    tagline: "Build. Shoot. Win.",
    description:
      "The premier browser-based Fortnite-style build-and-shoot battler. Outgun your rival AND outbuild them — throw up walls, ramps and roofs mid-firefight in 1v1, box fight or free-build modes.",
    src: "https://1v1-lol-online.github.io/file/",
    fallbackUrl: "https://1v1.lol/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff7a1a] via-[#ffe14d] to-[#3dff8b]",
    accentText: "text-[#ff7a1a]",
    accentChip: "bg-[#ff7a1a]",
    genre: "Shooter",
    tags: ["Building", "PvP", "3D"],
    controls: "WASD + mouse — shoot, Z/X/C/V — build",
    players: "1–2 players",
  },
  {
    slug: "krunker",
    title: "Krunker.io",
    tagline: "High-speed pixel FPS",
    description:
      "Lightning-fast pixelated first-person shooter with classes, custom maps and a huge online community. Bunny-hop, slide and no-scope your way up the leaderboard — runs instantly in the browser.",
    src: "https://krunker.io/",
    fallbackUrl: "https://krunker.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#00e5ff] via-[#2e6bff] to-[#b026ff]",
    accentText: "text-[#00e5ff]",
    accentChip: "bg-[#00e5ff]",
    genre: "Shooter",
    tags: ["FPS", "Multiplayer", "Pixel"],
    controls: "WASD + mouse — move & shoot",
    players: "Online multiplayer",
  },
  {
    slug: "shell-shockers",
    title: "Shell Shockers",
    tagline: "Eggs with attitude",
    description:
      "The world's deadliest eggs, armed to the yolk. A tactical first-person shooter where crack shots crack shells — pick your loadout, guard the carton and scramble the enemy team.",
    src: "https://shellshock.io/",
    fallbackUrl: "https://shellshock.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ffe14d] via-[#ff7a1a] to-[#ff2ea6]",
    accentText: "text-[#ffe14d]",
    accentChip: "bg-[#ffe14d]",
    genre: "Shooter",
    tags: ["FPS", "Multiplayer", "Eggs"],
    controls: "WASD + mouse — aim & shoot",
    players: "Online multiplayer",
  },
  {
    slug: "slither",
    title: "Slither.io",
    tagline: "Eat, grow, constrict",
    description:
      "The massive multiplayer snake arena. Slither around eating glowing orbs, grow longer than everyone, and cut off rivals so they crash into you. Simple, hypnotic, endless.",
    src: "https://slither.io/",
    fallbackUrl: "https://slither.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#3dff8b] via-[#00e5ff] to-[#b026ff]",
    accentText: "text-[#3dff8b]",
    accentChip: "bg-[#3dff8b]",
    genre: "Multiplayer",
    tags: ["Snake", "Arena", "Classic .io"],
    controls: "Mouse — steer, click — boost",
    players: "Online multiplayer",
  },
  {
    slug: "agar",
    title: "Agar.io",
    tagline: "The original cell arena",
    description:
      "The game that launched the .io era. Start as one tiny cell, eat everything smaller, split and merge to outmaneuver rivals across a petri-dish battleground. Millions of players can't be wrong.",
    src: "https://agar.cc/",
    fallbackUrl: "https://agar.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff2ea6] via-[#b026ff] to-[#00e5ff]",
    accentText: "text-[#ff2ea6]",
    accentChip: "bg-[#ff2ea6]",
    genre: "Multiplayer",
    tags: ["Cells", "Arena", "Classic .io"],
    controls: "Mouse — move, space — split, W — eject",
    players: "Online multiplayer",
  },
  {
    slug: "zombsroyale",
    title: "ZombsRoyale.io",
    tagline: "100-player 2D battle royale",
    description:
      "Drop in, loot up, outlast 99 others. A top-down 2D battle royale with weapons, shields, a shrinking storm and squads of friends. Fast matches, instant respawn into the fun.",
    src: "https://zombsroyale.io/",
    fallbackUrl: "https://zombsroyale.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ffe14d] via-[#3dff8b] to-[#00e5ff]",
    accentText: "text-[#ffe14d]",
    accentChip: "bg-[#ffe14d]",
    genre: "Multiplayer",
    tags: ["Battle Royale", "Top-down", "Loot"],
    controls: "WASD + mouse — move, aim & loot",
    players: "Online multiplayer",
  },
  {
    slug: "smash-karts",
    title: "Smash Karts",
    tagline: "Kart chaos arena",
    description:
      "3D multiplayer kart battler mayhem. Drive, drift and blast rivals with rockets, grenades and dash weapons in fast arena rounds. Unlock new karts and hats as you dominate.",
    src: "https://smashkarts.io/",
    fallbackUrl: "https://smashkarts.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff2ea6] via-[#ff7a1a] to-[#ffe14d]",
    accentText: "text-[#ff2ea6]",
    accentChip: "bg-[#ff2ea6]",
    genre: "Multiplayer",
    tags: ["Karts", "3D", "Arena"],
    controls: "WASD / arrows — drive, space — shoot",
    players: "Online multiplayer",
  },
  {
    slug: "drive-mad",
    title: "Drive Mad",
    tagline: "Physics truck trials",
    description:
      "Grid-based physics truck racing across devious obstacle courses. Balance your truck over ramps, loops and collapsing bridges without flipping — easy to start, maddening to master.",
    src: "https://classroom-6x.org/games/drive-mad/",
    fallbackUrl: "https://drivemad.net/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff7a1a] via-[#ff2ea6] to-[#b026ff]",
    accentText: "text-[#ff7a1a]",
    accentChip: "bg-[#ff7a1a]",
    genre: "Racing",
    tags: ["Physics", "Trucks", "Levels"],
    controls: "Arrows / WASD — drive & balance",
    players: "1 player",
  },
  {
    slug: "drift-hunters",
    title: "Drift Hunters",
    tagline: "Tune it. Slide it.",
    description:
      "The most detailed browser drifting sim. Pick from 25+ cars, tune turbo, suspension and camber, then chain massive drifts around warehouse circuits to earn cash for your dream build.",
    src: "https://ubgwtf.gitlab.io/drift-hunters/",
    fallbackUrl: "https://drifthunters.net/",
    sandbox: SANDBOX,
    artGradient: "from-[#2e6bff] via-[#00e5ff] to-[#3dff8b]",
    accentText: "text-[#2e6bff]",
    accentChip: "bg-[#2e6bff]",
    genre: "Racing",
    tags: ["3D", "Drifting", "Tuning"],
    controls: "Arrows / WASD — drive, space — handbrake",
    players: "1 player",
  },
  {
    slug: "moto-x3m",
    title: "Moto X3M",
    tagline: "Stunt bike mayhem",
    description:
      "The legendary side-scrolling motorcycle stunt racer. Launch off ramps, flip over sawblades and blast through 25+ levels of perfectly-timed obstacles. Every second counts.",
    src: "https://html5.gamedistribution.com/5b0abd4c0faa4f5eb190a9a16d5a1b4c/",
    fallbackUrl: "https://motox3m.pro/",
    sandbox: SANDBOX,
    artGradient: "from-[#3dff8b] via-[#ffe14d] to-[#ff7a1a]",
    accentText: "text-[#3dff8b]",
    accentChip: "bg-[#3dff8b]",
    genre: "Racing",
    tags: ["Stunts", "Bike", "Levels"],
    controls: "Arrows / WASD — accelerate, brake & flip",
    players: "1 player",
  },
  {
    slug: "basket-random",
    title: "Basket Random",
    tagline: "Totally absurd hoops",
    description:
      "Chaotic physics basketball where every round changes the rules — different courts, different physics, wobbly players. Grab the ball, flail toward the hoop and laugh your head off. 2-player on one keyboard.",
    src: "https://basketrandom.com/",
    fallbackUrl: "https://basketrandom.com/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff7a1a] via-[#ffe14d] to-[#3dff8b]",
    accentText: "text-[#ff7a1a]",
    accentChip: "bg-[#ff7a1a]",
    genre: "Sports",
    tags: ["2 Player", "Physics", "Funny"],
    controls: "W / up — jump & steal",
    players: "1–2 players",
  },
  {
    slug: "happy-wheels",
    title: "Happy Wheels",
    tagline: "Ragdoll mayhem awaits",
    description:
      "The infamous ragdoll obstacle-course simulator. Pick your character — wheelchair guy, bike dad, pogo dude — and navigate user-made deathtraps full of spikes, bombs and spectacular dismemberment.",
    src: "https://www.rocketgames.io/gameframe/happy-wheels",
    fallbackUrl: "https://totaljerkface.com/",
    sandbox: SANDBOX,
    artGradient: "from-[#a79bd1] via-[#ff2ea6] to-[#b026ff]",
    accentText: "text-[#a79bd1]",
    accentChip: "bg-[#a79bd1]",
    genre: "Ragdoll",
    tags: ["Physics", "Levels", "Infamous"],
    controls: "Arrows — move, space — special, Z/Esc — eject",
    players: "1 player",
  },
  {
    slug: "fireboy-watergirl",
    title: "Fireboy & Watergirl",
    tagline: "Forest Temple co-op",
    description:
      "The ultimate co-op puzzle platformer. Guide Fireboy and Watergirl through the Forest Temple — fire can't touch water, water can't touch lava, and teamwork solves everything. Play solo with both hands or grab a friend.",
    src: "https://gswitchgames.github.io/game-gswitch/fireboy-and-watergirl-1-forest-temple/",
    fallbackUrl: "https://fireboywatergirl6.github.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ff2ea6] via-[#ff7a1a] to-[#00e5ff]",
    accentText: "text-[#ff2ea6]",
    accentChip: "bg-[#ff2ea6]",
    genre: "Platformer",
    tags: ["Co-op", "Puzzle", "Temple"],
    controls: "A D — Fireboy · arrows — Watergirl",
    players: "1–2 players",
  },
  {
    slug: "geometry-dash",
    title: "Geometry Dash Lite",
    tagline: "Jump to the beat",
    description:
      "Rhythm-based obstacle jumping at its purest. One button, pumping electronic tracks, and levels that demand muscle-memory perfection. Die, retry, repeat — the flow state is real.",
    src: "https://geometrydashlite.io/",
    fallbackUrl: "https://geometrydashlite.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#00e5ff] via-[#3dff8b] to-[#ffe14d]",
    accentText: "text-[#00e5ff]",
    accentChip: "bg-[#00e5ff]",
    genre: "Rhythm",
    tags: ["Music", "1 Button", "Hard"],
    controls: "Click / space / up — jump",
    players: "1 player",
  },
  {
    slug: "impossible-quiz",
    title: "The Impossible Quiz",
    tagline: "Questions that hate you",
    description:
      "The infamous trick-question puzzle. 110 questions of pure lateral-thinking torture where the obvious answer is always wrong and the stupid answer is somehow right. Bring friends. You'll need help.",
    src: "https://gswitch3.github.io/g8/the-impossible-quiz/",
    fallbackUrl: "https://theimpossiblequiz.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#b026ff] via-[#ff2ea6] to-[#ffe14d]",
    accentText: "text-[#b026ff]",
    accentChip: "bg-[#b026ff]",
    genre: "Trivia",
    tags: ["Trick Questions", "Infamous", "Funny"],
    controls: "Mouse — pick answers, skips for emergencies",
    players: "1 player",
  },
  {
    slug: "papas-freezeria",
    title: "Papa's Freezeria",
    tagline: "Run the sundae shop",
    description:
      "The most beloved time-management cooking game ever. Take orders, blend the perfect mix, add mixables and toppings, then nail the sundae build. The customers are picky — the rush is real.",
    src: "https://en.gameslol.net/data/awayjs/papa/freezeria.html",
    fallbackUrl: "https://papasfreezeria.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#ffe14d] via-[#3dff8b] to-[#00e5ff]",
    accentText: "text-[#ffe14d]",
    accentChip: "bg-[#ffe14d]",
    genre: "Cooking",
    tags: ["Time Management", "Chill", "Classic"],
    controls: "Mouse — take orders & build sundaes",
    players: "1 player",
  },
  {
    slug: "fnaf",
    title: "Five Nights at Freddy's",
    tagline: "Survive the night shift",
    description:
      "The horror legend that spawned a franchise. Watch the cameras, manage your power and keep the animatronics out of your office until 6 AM. Headphones strongly recommended. Don't turn around.",
    src: "https://sussygamedeveloper.github.io/FNAF1/",
    fallbackUrl: "https://sussygamedeveloper.github.io/FNAF1/",
    sandbox: SANDBOX,
    artGradient: "from-[#1a0b3f] via-[#b026ff] to-[#ff2ea6]",
    accentText: "text-[#c04bff]",
    accentChip: "bg-[#b026ff]",
    genre: "Horror",
    tags: ["Jump Scares", "Survival", "Classic"],
    controls: "Mouse — cameras, lights & doors",
    players: "1 player",
  },
  {
    slug: "granny",
    title: "Granny",
    tagline: "Escape her house",
    description:
      "First-person stealth horror. You wake locked in Granny's house — she hears everything. Sneak, hide under beds and in wardrobes, find the tools and escape before day five. Heart rate not included. Actually, it is.",
    src: "https://st.8games.net/7/igra-dom-zloj-greni/",
    fallbackUrl: "https://granny.games/",
    sandbox: SANDBOX,
    artGradient: "from-[#150b31] via-[#b026ff] to-[#00e5ff]",
    accentText: "text-[#a79bd1]",
    accentChip: "bg-[#a79bd1]",
    genre: "Horror",
    tags: ["Stealth", "Escape", "Scary"],
    controls: "WASD + mouse — sneak, interact & hide",
    players: "1 player",
  },
  {
    slug: "baldis-basics",
    title: "Baldi's Basics",
    tagline: "Math has never been scarier",
    description:
      "Creepy surrealist survival horror disguised as a 90s edutainment game. Collect notebooks, solve impossible math problems and outrun Baldi's ruler as the school descends into chaos. Education and learning!",
    src: "https://baldigames.com/game/",
    fallbackUrl: "https://baldis-basics-game.github.io/",
    sandbox: SANDBOX,
    artGradient: "from-[#3dff8b] via-[#ffe14d] to-[#ff7a1a]",
    accentText: "text-[#3dff8b]",
    accentChip: "bg-[#3dff8b]",
    genre: "Horror",
    tags: ["Meme Horror", "Survival", "School"],
    controls: "WASD + mouse — run, shift — sprint",
    players: "1 player",
  },
];

export function getGame(slug: string | undefined): NeonGame | undefined {
  return GAMES.find((g) => g.slug === slug);
}

/** Games whose primary genre matches, sorted alphabetically by title. */
export function getGamesByGenre(genre: string): NeonGame[] {
  return GAMES.filter(
    (g) => g.genre.toLowerCase() === genre.toLowerCase(),
  ).sort((a, b) => a.title.localeCompare(b.title));
}

/** Genres that actually have games, with counts, biggest first. */
export function getGenreStats(): { genre: Genre; count: number }[] {
  return GENRES.map((genre) => ({
    genre,
    count: GAMES.filter((g) => g.genre === genre).length,
  }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Case-insensitive text search across title, tagline, genre and tags. */
export function searchGames(query: string): NeonGame[] {
  const q = query.trim().toLowerCase();
  if (!q) return GAMES;
  return GAMES.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.tagline.toLowerCase().includes(q) ||
      g.genre.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q)),
  ).sort((a, b) => a.title.localeCompare(b.title));
}
