#!/bin/bash
# Aether Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Aether Deployment Script"
echo "=========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo "Installing..."
    npm install -g vercel
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Step 1: Git setup
echo "📦 Step 1: Git Setup"
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Aether Mission Control"
    echo -e "${YELLOW}⚠️  Create a GitHub repo and run:${NC}"
    echo "git remote add origin https://github.com/YOUR_USERNAME/aether.git"
    echo "git branch -M main"
    echo "git push -u origin main"
else
    echo "Git already initialized"
    git add .
    git commit -m "Deploy: $(date)" || echo "No changes to commit"
fi
echo ""

# Step 2: Check environment
echo "🔧 Step 2: Environment Setup"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Created .env.local - please edit with your values${NC}"
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No VERCEL_TOKEN found${NC}"
    echo "You'll need to login manually: vercel login"
fi
echo ""

# Step 3: Build check
echo "🏗️  Step 3: Build Check"
npm run build
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 4: Deploy to Vercel
echo "🚀 Step 4: Deploy to Vercel"
echo "This will open a browser for authentication..."
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo -e "${GREEN}✅ Deployed to Vercel${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped Vercel deployment${NC}"
fi
echo ""

# Step 5: Convex check
echo "☁️  Step 5: Convex Setup"
if ! command -v convex &> /dev/null; then
    echo "Installing Convex..."
    npm install -g convex
fi

if [ ! -d convex ]; then
    echo -e "${YELLOW}⚠️  Convex not initialized${NC}"
    echo "Run: npx convex dev"
    echo "Then: npx convex push"
else
    echo "Convex already configured"
fi
echo ""

# Step 6: Webhook setup
echo "🔗 Step 6: Webhook Setup"
if [ -f ~/.openclaw/hooks/aether-webhook/handler.ts ]; then
    echo -e "${GREEN}✅ Webhook hook installed${NC}"
    echo ""
    echo "Add this to ~/.openclaw/config.jsonc:"
    echo '  "hooks": {'
    echo '    "aether-webhook": {'
    echo '      "enabled": true,'
    echo '      "path": "~/.openclaw/hooks/aether-webhook"'
    echo '    }'
    echo '  }'
else
    echo -e "${YELLOW}⚠️  Webhook not installed${NC}"
    echo "Run: ./install-hook.sh"
fi
echo ""

# Step 7: Summary
echo "📊 Deployment Summary"
echo "===================="
echo ""
echo "✅ Build: Ready"
echo "✅ Git: Initialized"
echo "⏳ Vercel: Check deployment URL above"
echo "⏳ Convex: Run 'npx convex dev' to set up"
echo "⏳ Webhooks: Add to OpenClaw config"
echo ""
echo "📝 Next Steps:"
echo "1. Get your Vercel URL from the output above"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Run: npx convex dev (to set up backend)"
echo "4. Configure OpenClaw webhooks"
echo "5. Set up Tailscale or ngrok for OpenClaw access"
echo ""
echo "📚 Docs:"
echo "- Deployment guide: docs/DEPLOY.md"
echo "- Convex schema: convex/schema.ts (move from backup)"
echo "- Webhook setup: hooks/openclaw/"
echo ""
