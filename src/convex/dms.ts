import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { filterProfanity } from "./profanity";

/**
 * Direct messages — the DM page (/dm). Every real user shows up in the
 * directory; tap one to open a private thread. Guest accounts are excluded.
 */

const MAX_LENGTH = 500;
const SEND_COOLDOWN_MS = 1500;

type Tier = "legend" | "demon" | null;

function pairKeyOf(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function tierOf(user: {
  role?: string;
  subscription?: { tier: string } | null;
}): Tier {
  if (user.role === "admin") return "demon";
  if (user.subscription?.tier === "legend") return "legend";
  return null;
}

/** Everyone you can message (every non-guest user, alphabetical). */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const meId = await getAuthUserId(ctx);
    if (meId === null) return [];
    const all = await ctx.db.query("users").take(3000);
    const rows = all
      .filter((u) => !u.isAnonymous && u._id !== meId)
      .map((u) => ({
        userId: u._id,
        username: u.username ?? u.name ?? "player",
        tier: tierOf(u),
      }))
      .sort((a, b) => a.username.localeCompare(b.username))
      .slice(0, 300);
    return rows;
  },
});

/** A conversation thread — newest last. `mine` lets the client style bubbles. */
export const thread = query({
  args: { otherId: v.id("users") },
  handler: async (ctx, { otherId }) => {
    const meId = await getAuthUserId(ctx);
    if (meId === null) return [];
    const key = pairKeyOf(meId, otherId);
    const rows = await ctx.db
      .query("dmMessages")
      .withIndex("by_pair_created", (q) => q.eq("pairKey", key))
      .order("desc")
      .take(200);
    return rows
      .reverse()
      .map((r) => ({
        _id: r._id,
        mine: r.senderId === meId,
        text: r.text,
        createdAt: r.createdAt,
      }));
  },
});

/** Send a DM to another user. */
export const send = mutation({
  args: { otherId: v.id("users"), text: v.string() },
  handler: async (ctx, { otherId, text }) => {
    const meId = await getAuthUserId(ctx);
    if (meId === null) throw new Error("Sign in to message");
    const me = await ctx.db.get(meId);
    if (!me) throw new Error("Account not found");
    if (me.isAnonymous) throw new Error("Create a free account to message");
    const other = await ctx.db.get(otherId);
    if (!other) throw new Error("User not found");

    const body = text.trim().slice(0, MAX_LENGTH);
    if (!body) throw new Error("Message is empty");

    const key = pairKeyOf(meId, otherId);
    const last = await ctx.db
      .query("dmMessages")
      .withIndex("by_pair_created", (q) => q.eq("pairKey", key))
      .order("desc")
      .first();
    if (last && last.senderId === meId && Date.now() - last.createdAt < SEND_COOLDOWN_MS) {
      throw new Error("Slow down a little");
    }

    await ctx.db.insert("dmMessages", {
      pairKey: key,
      senderId: meId,
      recipientId: otherId,
      text: filterProfanity(body),
      createdAt: Date.now(),
    });
  },
});
