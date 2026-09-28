import { lazy } from "react";

/** A built-in game component receives a bounded container size and must fill it. */
export type NativeGameProps = {
  width: number;
  height: number;
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
};

export function getNativeGame(slug: string | undefined) {
  if (!slug) return undefined;
  return NATIVE_GAMES[slug];
}
