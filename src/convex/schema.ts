import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // public handle chosen at sign-up (unique, shown in chat + leaderboards)
      username: v.optional(v.string()),

      /** SHA-256 hash of the user's screen-lock PIN (never the PIN itself). */
      pinHash: v.optional(v.string()),
      /** Set by the lock action; cleared when the correct PIN is entered. */
      screenLocked: v.optional(v.boolean()),
      /** Legend subscription (£10 bank transfer, admin-approved). */
      subscription: v.optional(
        v.object({
          tier: v.union(v.literal("legend")),
          since: v.number(),
        }),
      ),
    })
      .index("email", ["email"]) // index for the email. do not remove or modify
      .index("by_username", ["username"]),

    // global chat (server-side profanity filtered, rate limited)
    chatMessages: defineTable({
      userId: v.id("users"),
      username: v.string(),
      text: v.string(),
      createdAt: v.number(),
    })
      .index("by_created", ["createdAt"])
      .index("by_user_created", ["userId", "createdAt"]),

    // one row per user per game — their personal best
    gameScores: defineTable({
      userId: v.id("users"),
      username: v.string(),
      gameSlug: v.string(),
      score: v.number(),
      createdAt: v.number(),
    })
      .index("by_game_score", ["gameSlug", "score"])
      .index("by_user_game", ["userId", "gameSlug"]),

    // short-lived email verification codes (managed outside convex-auth)
    emailCodes: defineTable({
      userId: v.id("users"),
      code: v.string(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // tableName: defineTable({
    //   ...
    //   // table fields
    // }).index("by_field", ["field"])

    /** Private 1:1 direct messages (DM page). pairKey = sorted "idA|idB". */
    dmMessages: defineTable({
      pairKey: v.string(),
      senderId: v.id("users"),
      recipientId: v.id("users"),
      text: v.string(),
      createdAt: v.number(),
    })
      .index("by_pair_created", ["pairKey", "createdAt"])
      .index("by_recipient_created", ["recipientId", "createdAt"]),

    /** £10 legend-subscription proof-of-payment submissions (screenshot). */
    subscriptionRequests: defineTable({
      userId: v.id("users"),
      username: v.string(),
      storageId: v.id("_storage"),
      note: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("ai_passed"),
        v.literal("ai_flagged"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
      aiVerdict: v.optional(v.string()),
      aiPassed: v.optional(v.boolean()),
      createdAt: v.number(),
    })
      .index("by_user_created", ["userId", "createdAt"])
      .index("by_status_created", ["status", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
