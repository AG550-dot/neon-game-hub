import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Returns a stable `report(score)` callback that saves the player's best
 * score for the given game. Server keeps the max, so reporting is idempotent.
 * Silently ignores failures (signed-out / anonymous visitors just don't get
 * leaderboard entries).
 */
export function useReportScore(gameSlug: string) {
  const submit = useMutation(api.leaderboard.submitScore);
  return useCallback(
    (score: number) => {
      if (!Number.isFinite(score) || score <= 0) return;
      submit({ gameSlug, score: Math.floor(score) }).catch(() => {
        /* not signed in / anonymous / rate issues — ignore */
      });
    },
    [submit, gameSlug],
  );
}
