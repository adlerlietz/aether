# Aether Deployment Guide

## Overview
Deploy Aether to Vercel + Convex for production access.

## Architecture
```
[User] → [Vercel: Aether Frontend] → [Convex: Real-time Backend]
     ↓
[Tailscale/ngrok] → [Your Mac: OpenClaw Gateway]
```

## Step 1: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
cd ~/Desktop/aether/my-app

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: GitHub Integration
1. Push to GitHub
2. Connect repo at vercel.com
3. Auto-deploy on push

## Step 2: Set up Convex

```bash
# Install Convex globally
npm install -g convex

# Initialize project
cd ~/Desktop/aether/my-app
npx convex dev

# Follow prompts:
# 1. Create/login to Convex account
# 2. Create new project "aether-mission-control"
# 3. Deploy schema
npx convex push

# Copy the deployment URL
```

## Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
WEBHOOK_SECRET=generate-random-string
NEXT_PUBLIC_APP_URL=https://your-aether.vercel.app
```

## Step 4: Connect OpenClaw (Your Mac)

Since your OpenClaw runs locally, you need a tunnel:

### Option A: Tailscale (Recommended - secure)
```bash
# Install Tailscale
brew install tailscale

# Start Tailscale
tailscale up

# Your Mac gets a static IP like 100.x.x.x
# Use that in Aether settings: http://100.x.x.x:18789
```

### Option B: ngrok (Temporary - good for testing)
```bash
# Install ngrok
brew install ngrok

# Expose OpenClaw
ngrok http 18789

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Set OPENCLAW_GATEWAY_URL in Vercel
```

## Step 5: Activate Webhooks

Add to `~/.openclaw/config.jsonc`:
```jsonc
{
  "hooks": {
    "aether-webhook": {
      "enabled": true,
      "path": "~/.openclaw/hooks/aether-webhook",
      "config": {
        "webhookUrl": "https://your-aether.vercel.app/api/webhooks/openclaw"
      }
    }
  }
}
```

Then restart:
```bash
openclaw gateway restart
```

## Step 6: Verify

1. Open https://your-aether.vercel.app
2. Check dashboard shows live data
3. Run an agent → Task appears in Aether
4. Create approval → Shows in Review page

## Troubleshooting

### Can't reach OpenClaw from Vercel
- Make sure tunnel (Tailscale/ngrok) is running
- Check firewall settings
- Verify OPENCLAW_GATEWAY_URL is set correctly

### Webhooks not working
- Check `~/.openclaw/logs/` for errors
- Verify webhook URL is accessible
- Check Vercel function logs

### Convex not syncing
- Verify NEXT_PUBLIC_CONVEX_URL is correct
- Check browser console for errors
- Ensure convex dev is running locally

## Security Notes

1. **Never commit `.env.local`** to git
2. **Use strong WEBHOOK_SECRET** (random 32+ chars)
3. **Tailscale is more secure** than ngrok for long-term
4. **Rotate ngrok URLs** frequently if using
5. **Set up Vercel Authentication** for team access

## Team Access

To share with team:
1. Add them to Vercel project (Settings → Members)
2. Add them to Convex project (Dashboard → Team)
3. Share Tailscale network (if using)

## Monitoring

- Vercel Analytics: Built-in
- Convex Dashboard: convex.dev
- OpenClaw: `openclaw logs --follow`
