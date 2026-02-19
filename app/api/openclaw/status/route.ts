import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Parse openclaw status JSON output
async function getOpenClawStatusFromCLI(): Promise<any> {
  try {
    // Use --json flag for structured output
    const { stdout } = await execAsync('openclaw status --json 2>/dev/null');
    const data = JSON.parse(stdout);
    
    // Transform to our format
    return {
      gateway: {
        url: data.gateway?.url || 'ws://127.0.0.1:18789',
        reachable: data.gateway?.reachable || false,
        latency: data.gateway?.connectLatencyMs || 0,
      },
      agents: {
        count: data.agents?.totalSessions || 0,
        defaultId: data.agents?.defaultId,
      },
      sessions: (data.sessions?.recent || []).map((s: any) => ({
        key: s.key,
        kind: s.kind,
        age: formatAge(s.age),
        model: s.model,
        tokens: `${(s.totalTokens / 1000).toFixed(1)}k/${(s.contextTokens / 1000).toFixed(0)}k (${s.percentUsed}%)`,
        percentUsed: s.percentUsed,
        totalTokens: s.totalTokens,
        remainingTokens: s.remainingTokens,
      })),
      channels: [
        { name: 'Telegram', enabled: true, state: 'OK' },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch OpenClaw status:', error);
    return null;
  }
}

// Convert milliseconds to human-readable age
function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export async function GET() {
  const status = await getOpenClawStatusFromCLI();
  
  if (!status) {
    return NextResponse.json(
      { error: 'OpenClaw not running or not accessible' },
      { status: 503 }
    );
  }

  return NextResponse.json(status);
}
