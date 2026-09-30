import { lazy } from "react";

/** A built-in game component receives a bounded container size and must fill it.
 *  `report` (optional) submits the player's score to the global leaderboard. */
export type NativeGameProps = {
  width: number;
  height: number;
  report?: (score: number) => void;
};

const NeonSlope = lazy(() => import("./NeonSlope"));
const PixelBowl = lazy(() => import("./PixelBowl"));
const VoidRunner = lazy(() => import("./VoidRunner"));
const NeonClicker = lazy(() => import("./NeonClicker"));

export const NATIVE_GAMES: Record<string, React.ComponentType<NativeGameProps>> = {
  slope: NeonSlope,
  "retro-bowl-25": PixelBowl,
  "run-3": VoidRunner,
  "cookie-clicker": NeonClicker,
  // Hosted-embed-only games (Gladihoppers, Eaglercraft, 2048, Clumsy Bird,
  // Astray, Pac-Man, HexGL, Chrome Dino) are not listed here — Play.tsx
  // defaults them to hosted mode.
};

export function getNativeGame(slug: string | undefined) {
  if (!slug) return undefined;
  return NATIVE_GAMES[slug];
}
