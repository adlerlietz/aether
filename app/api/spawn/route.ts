import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();
    
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (OPENCLAW_TOKEN) {
      headers['Authorization'] = `Bearer ${OPENCLAW_TOKEN}`;
    }

    const response = await fetch(`${OPENCLAW_URL}/tools/invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tool: 'sessions_spawn',
        action: 'json',
        args: {
          agentId,
          task: `Spawned from Aether UI`,
          runTimeoutSeconds: 300,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `OpenClaw error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.ok) {
      return NextResponse.json({ error: data.error?.message || 'Spawn failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      session: data.result,
      message: `${agentId} spawned successfully` 
    });
  } catch (error) {
    console.error('Spawn error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
