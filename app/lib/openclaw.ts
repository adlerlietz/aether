// OpenClaw API Client
// Connects to local OpenClaw gateway

const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

export interface OpenClawStatus {
  gateway: {
    url: string;
    reachable: boolean;
    latency: number;
  };
  agents: number;
  sessions: number;
  channels: Array<{
    name: string;
    enabled: boolean;
    state: string;
  }>;
}

export interface Session {
  key: string;
  kind: string;
  age: string;
  model: string;
  tokens: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface AgentRun {
  id: string;
  agent: string;
  model: string;
  status: 'running' | 'completed' | 'error';
  startTime: Date;
  endTime?: Date;
  tokensUsed?: number;
  cost?: number;
}

// Fetch OpenClaw status
export async function getOpenClawStatus(): Promise<OpenClawStatus | null> {
  try {
    const start = Date.now();
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) return null;
    
    const latency = Date.now() - start;
    const data = await response.json();
    
    return {
      gateway: {
        url: OPENCLAW_GATEWAY,
        reachable: true,
        latency,
      },
      agents: data.agents?.count || 0,
      sessions: data.sessions?.length || 0,
      channels: data.channels || [],
    };
  } catch (error) {
    console.error('Failed to fetch OpenClaw status:', error);
    return null;
  }
}

// Fetch active sessions
export async function getSessions(): Promise<Session[]> {
  try {
    // Parse from openclaw status output or API
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/sessions`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      // Return mock data if API not available
      return getMockSessions();
    }
    
    const data = await response.json();
    return data.sessions?.map((s: any) => ({
      key: s.key,
      kind: s.kind,
      age: s.age,
      model: s.model,
      tokens: parseTokens(s.tokens),
    })) || [];
  } catch (error) {
    return getMockSessions();
  }
}

// Fetch agent runs (tasks)
export async function getAgentRuns(): Promise<AgentRun[]> {
  try {
    // This would come from OpenClaw's history/activity log
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/runs`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      return getMockRuns();
    }
    
    const data = await response.json();
    return data.runs || [];
  } catch (error) {
    return getMockRuns();
  }
}

// Parse token string like "104k/128k (81%)"
function parseTokens(tokenStr: string): Session['tokens'] {
  try {
    const match = tokenStr.match(/([\d.]+)k?\/([\d.]+)k?\s*\(([\d.]+)%\)/);
    if (match) {
      return {
        used: parseFloat(match[1]) * (tokenStr.includes('k') ? 1000 : 1),
        total: parseFloat(match[2]) * (tokenStr.includes('k') ? 1000 : 1),
        percentage: parseFloat(match[3]),
      };
    }
  } catch {}
  return { used: 0, total: 128000, percentage: 0 };
}

// Mock data for development
function getMockSessions(): Session[] {
  return [
    {
      key: 'agent:main:telegram:direct:1597...',
      kind: 'direct',
      age: '1m ago',
      model: 'moonshotai/kimi-k2.5',
      tokens: { used: 104000, total: 128000, percentage: 81 },
    },
    {
      key: 'agent:main:main',
      kind: 'direct',
      age: '1m ago',
      model: 'google/gemini-2.5-flash-lite',
      tokens: { used: 9300, total: 128000, percentage: 7 },
    },
    {
      key: 'agent:main:cron:heartbeat',
      kind: 'cron',
      age: '4h ago',
      model: 'moonshotai/kimi-k2.5',
      tokens: { used: 500, total: 128000, percentage: 0 },
    },
  ];
}

function getMockRuns(): AgentRun[] {
  return [
    {
      id: 'run-1',
      agent: 'main',
      model: 'moonshotai/kimi-k2.5',
      status: 'completed',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3500000),
      tokensUsed: 45000,
      cost: 0.12,
    },
    {
      id: 'run-2',
      agent: 'main',
      model: 'google/gemini-2.5-flash-lite',
      status: 'completed',
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 7100000),
      tokensUsed: 12000,
      cost: 0.02,
    },
    {
      id: 'run-3',
      agent: 'heartbeat',
      model: 'moonshotai/kimi-k2.5',
      status: 'running',
      startTime: new Date(Date.now() - 60000),
      tokensUsed: 500,
    },
  ];
}

// Calculate spend from runs
export function calculateSpend(runs: AgentRun[]): number {
  return runs.reduce((acc, run) => acc + (run.cost || 0), 0);
}

// Get today's spend
export function getTodaySpend(runs: AgentRun[]): number {
  const today = new Date().setHours(0, 0, 0, 0);
  return runs
    .filter(r => r.startTime.getTime() >= today)
    .reduce((acc, r) => acc + (r.cost || 0), 0);
}
