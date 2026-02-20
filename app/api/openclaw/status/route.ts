import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// For Vercel: use ngrok/Tailscale URL. For local dev: use localhost.
const OPENCLAW_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN;

interface SessionInfo {
  key: string;
  kind: string;
  channel: string;
  displayName: string;
  model: string;
  contextTokens: number;
  totalTokens: number;
  updatedAt: number;
  label?: string;
}

export async function GET() {
  try {
    if (!OPENCLAW_URL) {
      return NextResponse.json(
        { error: 'OpenClaw URL not configured' },
        { status: 503 }
      );
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };

    if (OPENCLAW_TOKEN) {
      headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`;
    }

    const start = Date.now();
    const response = await fetch(`${OPENCLAW_URL}/tools/invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'sessions_list',
        action: 'json',
        args: {},
      }),
      signal: AbortSignal.timeout(8000),
    });
    const latency = Date.now() - start;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error?.message || 'tools/invoke failed');
    }

    const sessions: SessionInfo[] = data.result?.details?.sessions || [];

    return NextResponse.json({
      gateway: {
        url: OPENCLAW_URL,
        reachable: true,
        latency,
      },
      agents: {
        count: sessions.length,
        defaultId: 'main',
      },
      sessions: sessions.map((s) => {
        const pct = s.contextTokens > 0
          ? (s.totalTokens / s.contextTokens) * 100
          : 0;
        return {
          key: s.key,
          kind: s.kind || 'session',
          label: s.label,
          age: formatAge(Date.now() - s.updatedAt),
          model: s.model || 'unknown',
          tokens: `${(s.totalTokens / 1000).toFixed(1)}k/${(s.contextTokens / 1000).toFixed(0)}k (${pct.toFixed(0)}%)`,
          percentUsed: Math.round(pct),
          totalTokens: s.totalTokens,
          remainingTokens: s.contextTokens - s.totalTokens,
        };
      }),
      channels: [
        { name: 'Telegram', enabled: true, state: 'OK' },
      ],
    });
  } catch (error) {
    console.error('OpenClaw fetch error:', error);
    return NextResponse.json(
      { error: 'OpenClaw not running or not accessible' },
      { status: 503 }
    );
  }
}

function formatAge(ms: number): string {
  if (!ms || ms < 0) return 'now';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
