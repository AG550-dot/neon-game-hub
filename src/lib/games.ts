export type NeonGame = {
  /** URL slug used in /play/:slug routes */
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /**
   * URL embedded in the iframe. Points DIRECTLY at the game itself
   * (canvas/app entry), not the ad-wrapped portal page, so it runs
   * cleanly inside our arcade frame.
   */
  src: string;
  /**
   * Where to send players if embedding is ever blocked by the host
   * (school filter, CORS policy change, etc.). Opens in a new tab.
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
  genre: string;
  controls: string;
  players: string;
};

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
    genre: "Arcade · Endless Runner",
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
    genre: "Sports · Football",
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
    genre: "Platformer · Endless Runner",
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
    genre: "Idle · Incremental",
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
    genre: "Fighting · Physics",
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
    genre: "Sandbox · Survival",
    controls: "WASD + mouse — mine, build & survive",
    players: "Singleplayer & servers",
  },
];

export function getGame(slug: string | undefined): NeonGame | undefined {
  return GAMES.find((g) => g.slug === slug);
}
