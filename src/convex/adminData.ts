import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

async function requireAdmin(
  ctx: { db: { get(id: unknown): Promise<unknown> } },
): Promise<{ _id: unknown; role?: string }> {
  const userId = await getAuthUserId(ctx as never);
  if (userId === null) throw new Error("Not signed in");
  const user = (await ctx.db.get(userId)) as { _id: unknown; role?: string } | null;
  if (!user || user.role !== "admin") throw new Error("Admins only");
  return user;
}

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").take(5000);
    const messages = await ctx.db.query("chatMessages").take(5000);
    const scores = await ctx.db.query("gameScores").take(5000);

    return {
      totalUsers: users.length,
      verifiedUsers: users.filter((u) => u.emailVerificationTime).length,
      totalMessages: messages.length,
      totalScores: scores.length,
    };
  },
});

/** Full user directory for the admin panel (no secrets). */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").take(2000);
    return users
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((u) => ({
        _id: u._id as string,
        username: u.username ?? u.name ?? "—",
        email: u.email ?? "—",
        emailVerified: !!u.emailVerificationTime,
        role: u.role ?? null,
        isAnonymous: !!u.isAnonymous,
        joinedAt: u._creationTime as number,
      }));
  },
});

/** Moderation: remove a chat message. */
export const deleteChatMessage = mutation({
  args: { messageId: v.id("chatMessages") },
  handler: async (ctx, { messageId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(messageId);
  },
});

/** Internal: find a user by username (used by the admin bootstrap action). */
export const findUserByUsernameInternal = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
  },
});

/** Internal: promote a user to admin. */
export const setAdminRoleInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { role: "admin" });
  },
});
