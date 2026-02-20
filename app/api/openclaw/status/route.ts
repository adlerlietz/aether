import { NextResponse } from 'next/server';

const OPENCLAW_URL = process.env.NEXT_PUBLIC_OPENCLAW_URL || process.env.OPENCLAW_GATEWAY_URL;
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN;

export async function GET() {
  try {
    if (!OPENCLAW_URL) {
      return NextResponse.json(
        { error: 'OpenClaw URL not configured' },
        { status: 503 }
      );
    }

    // Convert ws:// to http:// for API calls
    const apiUrl = OPENCLAW_URL.replace('ws://', 'http://').replace('wss://', 'https://');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    
    if (OPENCLAW_TOKEN) {
      headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`;
    }

    const response = await fetch(`${apiUrl}/api/status`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      gateway: {
        url: OPENCLAW_URL,
        reachable: true,
        latency: data.gateway?.connectLatencyMs || 0,
      },
      agents: {
        count: data.agents?.totalSessions || data.sessions?.recent?.length || 0,
        defaultId: data.agents?.defaultId,
      },
      sessions: (data.sessions?.recent || []).map((s: any) => ({
        key: s.key,
        kind: s.kind,
        age: formatAge(s.age),
        model: s.model,
        tokens: s.tokens || `${(s.totalTokens / 1000).toFixed(1)}k/${(s.contextTokens / 1000).toFixed(0)}k`,
        percentUsed: s.percentUsed || 0,
      })),
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
  if (!ms) return 'now';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
