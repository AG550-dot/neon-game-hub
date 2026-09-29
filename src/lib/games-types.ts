/** Core types + shared sandbox for the UltraVector catalog. */

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
  /** Direct URL to the game's official logo/icon. All URLs are verified
   *  image responses; cards fall back to gradient-letter art if one ever
   *  fails to load. */
  logo?: string;
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
export const SANDBOX =
  "allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms allow-downloads allow-modals allow-orientation-lock";
