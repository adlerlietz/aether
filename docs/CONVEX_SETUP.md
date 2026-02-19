# Convex Quick Setup

## Step 1: Login & Initialize (Interactive)

Run in your terminal (not through agent):

```bash
cd ~/Desktop/aether/my-app
npx convex dev
```

This will:
1. Open browser to login/create Convex account
2. Create project "aether-mission-control"
3. Generate `convex.json` with your project URL

## Step 2: Deploy Schema

After initialization, deploy the schema:

```bash
npx convex push
```

## Step 3: Get Environment Variables

Convex will output:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOY_KEY`

Add these to:
- `.env.local` (for local dev)
- Vercel Dashboard → Environment Variables (for production)

## Step 4: Update Aether to Use Convex

Replace local data hooks with Convex hooks (see `docs/CONVEX_MIGRATION.md`)

## Current Status

✅ Schema defined in `convex/schema.ts`
⏳ Needs initialization
⏳ Needs environment variables
⏳ Needs code integration

## Schema Overview

- `tasks` — Kanban board items
- `sessions` — OpenClaw agent sessions
- `tokenUsage` — Spend tracking
- `approvals` — Approval requests
- `activities` — Activity log
- `preferences` — User settings

## Free Tier Limits

- 1M function calls/month
- 1GB storage
- 10GB bandwidth/month
- Perfect for personal/small team use
