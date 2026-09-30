import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Record a score, keeping only the player's personal best per game. */
export const submitScore = mutation({
  args: { gameSlug: v.string(), score: v.number() },
  handler: async (ctx, { gameSlug, score }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in to save scores");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Account not found");
    if (user.isAnonymous) {
      throw new Error("Create a free account to save scores");
    }
    if (!Number.isFinite(score) || score < 0 || score > 1e12) {
      throw new Error("Invalid score");
    }
    const slug = gameSlug.trim().slice(0, 64);
    if (!slug) throw new Error("Invalid game");

    const username = user.username ?? user.name ?? "player";
    const existing = await ctx.db
      .query("gameScores")
      .withIndex("by_user_game", (q) =>
        q.eq("userId", userId).eq("gameSlug", slug),
      )
      .first();

    if (existing) {
      if (score > existing.score) {
        await ctx.db.patch(existing._id, {
          score,
          username,
          createdAt: Date.now(),
        });
      }
      return existing._id;
    }
    return await ctx.db.insert("gameScores", {
      userId,
      username,
      gameSlug: slug,
      score,
      createdAt: Date.now(),
    });
  },
});

/** Top scores for a game, best first. */
export const topScores = query({
  args: { gameSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { gameSlug, limit = 10 }) => {
    const n = Math.min(Math.max(limit, 1), 50);
    return await ctx.db
      .query("gameScores")
      .withIndex("by_game_score", (q) => q.eq("gameSlug", gameSlug))
      .order("desc")
      .take(n);
  },
});

/** The signed-in player's best score + rank on a game (null if none). */
export const myBest = query({
  args: { gameSlug: v.string() },
  handler: async (ctx, { gameSlug }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const mine = await ctx.db
      .query("gameScores")
      .withIndex("by_user_game", (q) =>
        q.eq("userId", userId).eq("gameSlug", gameSlug),
      )
      .first();
    if (!mine) return null;
    const better = await ctx.db
      .query("gameScores")
      .withIndex("by_game_score", (q) =>
        q.eq("gameSlug", gameSlug).gt("score", mine.score),
      )
      .take(1000);
    return { score: mine.score, rank: better.length + 1 };
  },
});
