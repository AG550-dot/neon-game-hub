import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Link } from "react-router";
import { Crown, Medal, Trophy } from "lucide-react";

const RANK_STYLES = [
  "text-[#ffe14d]",
  "text-[#cfd8e3]",
  "text-[#ff9d5c]",
];

/**
 * Live top-10 leaderboard for one game, plus the signed-in player's own
 * rank. Scores come from the built-in games' automatic reporting.
 */
export default function GameLeaderboard({
  gameSlug,
  className = "",
}: {
  gameSlug: string;
  className?: string;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const scores = useQuery(api.leaderboard.topScores, {
    gameSlug,
    limit: 10,
  });
  const myBest = useQuery(api.leaderboard.myBest, { gameSlug });

  return (
    <section className={`neon-card rounded-2xl p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <Trophy className="size-5 text-[#ffe14d]" />
        <h2 className="font-display text-xl font-bold">
          <span className="text-rainbow">Leaderboard</span>
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#b026ff55] to-transparent" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          built-in games record scores automatically
        </span>
      </div>

      {scores === undefined ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Loading scores…
        </p>
      ) : scores.length === 0 ? (
        <div className="rounded-xl border border-[#b026ff26] bg-[#0b0520]/60 px-4 py-6 text-center">
          <p className="text-sm font-semibold">No scores yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in and play the built-in version to claim the first spot.
          </p>
        </div>
      ) : (
        <ol className="space-y-1.5">
          {scores.map((row, i) => (
            <li
              key={row._id}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
                user && row.userId === user._id
                  ? "border-[#00e5ff66] bg-[#00e5ff0f]"
                  : "border-[#b026ff26] bg-[#0b0520]/60"
              }`}
            >
              <span
                className={`flex w-8 shrink-0 items-center justify-center font-display text-sm font-extrabold ${
                  RANK_STYLES[i] ?? "text-muted-foreground"
                }`}
              >
                {i === 0 ? (
                  <Crown className="size-4" />
                ) : i < 3 ? (
                  <Medal className="size-4" />
                ) : (
                  `#${i + 1}`
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {row.username}
                {user && row.userId === user._id && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#00e5ff]">
                    you
                  </span>
                )}
              </span>
              <span className="font-display text-sm font-bold text-[#3dff8b]">
                {row.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}

      {/* Your rank / sign-in nudge */}
      {!isLoading && !isAuthenticated && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link
            to="/auth?returnTo=/"
            className="font-semibold text-[#00e5ff] hover:underline"
          >
            Sign in
          </Link>{" "}
          to save your scores and climb the board.
        </p>
      )}
      {isAuthenticated && myBest && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your best:{" "}
          <span className="font-bold text-[#3dff8b]">
            {myBest.score.toLocaleString()}
          </span>{" "}
          · rank{" "}
          <span className="font-bold text-[#00e5ff]">#{myBest.rank}</span>
        </p>
      )}
    </section>
  );
}
