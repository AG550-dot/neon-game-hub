import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Screen lock — an app-level lock the player can throw on so nobody snoops
 * their account if they walk away. The PIN itself never leaves the device:
 * the client hashes it with SHA-256 and only the hash is stored/compared.
 */

const PIN_HASH_RE = /^[0-9a-f]{64}$/;

/** Current lock state for the signed-in user. */
export const status = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return { hasPin: false, screenLocked: false };
    const user = await ctx.db.get(userId);
    return {
      hasPin: !!user?.pinHash,
      screenLocked: !!user?.screenLocked,
    };
  },
});

/** Store the (pre-hashed) PIN. Call only with a SHA-256 hex digest. */
export const setPin = mutation({
  args: { pinHash: v.string() },
  handler: async (ctx, { pinHash }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    if (!PIN_HASH_RE.test(pinHash)) throw new Error("Invalid PIN");
    await ctx.db.patch(userId, { pinHash });
    return true;
  },
});

/** Throw the lock — only possible once a PIN exists. */
export const lock = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const user = await ctx.db.get(userId);
    if (!user?.pinHash) throw new Error("Create a PIN first");
    await ctx.db.patch(userId, { screenLocked: true });
    return true;
  },
});

/** Unlock with the (pre-hashed) PIN. */
export const unlock = mutation({
  args: { pinHash: v.string() },
  handler: async (ctx, { pinHash }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Sign in first");
    const user = await ctx.db.get(userId);
    if (!user?.pinHash) throw new Error("No PIN set");
    if (user.pinHash !== pinHash) throw new Error("Wrong PIN");
    await ctx.db.patch(userId, { screenLocked: false });
    return true;
  },
});
