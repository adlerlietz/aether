#!/bin/bash
# Aether Webhook Hook Installer for OpenClaw
# Run: ./install-hook.sh

echo "Installing Aether Webhook Hook for OpenClaw..."

# Create hook directory
HOOK_DIR="$HOME/.openclaw/hooks/aether-webhook"
mkdir -p "$HOOK_DIR"

# Copy hook file
cp hooks/openclaw/aether-webhook.ts "$HOOK_DIR/handler.ts"

# Create .env file for webhook URL
cat > "$HOOK_DIR/.env" << 'EOF'
AETHER_WEBHOOK_URL=http://localhost:3000/api/webhooks/openclaw
EOF

echo "✅ Hook installed to: $HOOK_DIR"
echo ""
echo "Next steps:"
echo "1. Make sure Aether is running on http://localhost:3000"
echo "2. Add to your OpenClaw config (~/.openclaw/config.jsonc):"
echo ""
echo '  "hooks": {'
echo '    "aether-webhook": {'
echo '      "enabled": true,'
echo '      "path": "~/.openclaw/hooks/aether-webhook"'
echo '    }'
echo '  }'
echo ""
echo "3. Restart OpenClaw: openclaw gateway restart"
echo ""
echo "Then agent activity will automatically appear in Aether!"
