import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("done")
    ),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    assignee: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),

  sessions: defineTable({
    key: v.string(),
    kind: v.string(),
    agentId: v.optional(v.string()),
    model: v.string(),
    status: v.union(v.literal("online"), v.literal("busy"), v.literal("offline")),
    tokensUsed: v.number(),
    tokensTotal: v.number(),
    lastActivity: v.number(),
  }).index("by_agent", ["agentId"]),

  activities: defineTable({
    type: v.union(
      v.literal("task_created"),
      v.literal("task_moved"),
      v.literal("task_completed"),
      v.literal("agent_action"),
      v.literal("comment")
    ),
    message: v.string(),
    agentId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  approvals: defineTable({
    type: v.union(
      v.literal("delete"),
      v.literal("email"),
      v.literal("spend"),
      v.literal("config"),
      v.literal("spawn")
    ),
    title: v.string(),
    description: v.string(),
    agentId: v.string(),
    risk: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("expired")),
    requestedAt: v.number(),
    expiresAt: v.number(),
    details: v.optional(v.any()),
  }).index("by_status", ["status"]),
});
