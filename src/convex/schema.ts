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
  },
  {
    schemaValidation: false,
  },
);

export default schema;
