import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Convex schema for Aether Mission Control
export default defineSchema({
  // Tasks/Kanban items
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
    createdBy: v.string(),
    tags: v.array(v.string()),
    attachments: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      url: v.string(),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),

  // Agent sessions from OpenClaw
  sessions: defineTable({
    key: v.string(),
    agentId: v.string(),
    kind: v.string(),
    model: v.string(),
    tokensUsed: v.number(),
    tokensTotal: v.number(),
    percentUsed: v.number(),
    isActive: v.boolean(),
    lastSeenAt: v.number(),
    metadata: v.optional(v.object({
      channel: v.optional(v.string()),
      source: v.optional(v.string()),
    })),
  })
    .index("by_agent", ["agentId"])
    .index("by_active", ["isActive"]),

  // Token usage history
  tokenUsage: defineTable({
    sessionId: v.string(),
    agentId: v.string(),
    model: v.string(),
    tokensIn: v.number(),
    tokensOut: v.number(),
    cost: v.number(),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"]),

  // Approval requests
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
    agent: v.string(),
    risk: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("expired")
    ),
    details: v.record(v.string(), v.any()),
    requestedAt: v.number(),
    expiresAt: v.number(),
    decidedAt: v.optional(v.number()),
    decidedBy: v.optional(v.string()),
    rejectReason: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_agent", ["agent"]),

  // Activity log
  activities: defineTable({
    type: v.union(
      v.literal("task_created"),
      v.literal("task_moved"),
      v.literal("task_completed"),
      v.literal("agent_action"),
      v.literal("approval_requested"),
      v.literal("approval_decided"),
      v.literal("session_started"),
      v.literal("session_ended"),
      v.literal("error")
    ),
    message: v.string(),
    agent: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_agent", ["agent"]),

  // User preferences
  preferences: defineTable({
    userId: v.string(),
    accentColor: v.optional(v.string()),
    glassBlur: v.optional(v.number()),
    compactMode: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
