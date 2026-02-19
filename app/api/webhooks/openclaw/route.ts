import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const WEBHOOK_LOG = join(homedir(), '.openclaw', 'aether-webhooks.json');

// OpenClaw webhook handler
// Receives events from OpenClaw agent runs

interface OpenClawEvent {
  event: 'agent_start' | 'agent_end' | 'agent_error' | 'tool_call' | 'approval_needed';
  timestamp: string;
  sessionKey: string;
  agent: string;
  data: {
    prompt?: string;
    response?: string;
    tool?: string;
    args?: any;
    error?: string;
    tokensUsed?: number;
    cost?: number;
    requiresApproval?: boolean;
    approvalType?: 'delete' | 'email' | 'spend' | 'config';
    approvalDetails?: Record<string, any>;
  };
}

// Store event for processing
async function logEvent(event: OpenClawEvent) {
  try {
    let events: OpenClawEvent[] = [];
    try {
      const data = await readFile(WEBHOOK_LOG, 'utf-8');
      events = JSON.parse(data);
    } catch {}
    
    events.unshift(event);
    // Keep last 1000 events
    if (events.length > 1000) events = events.slice(0, 1000);
    
    await writeFile(WEBHOOK_LOG, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Failed to log webhook:', error);
  }
}

// Create task from agent activity
async function createTaskFromEvent(event: OpenClawEvent) {
  const task = {
    id: `task-${Date.now()}`,
    title: event.data.prompt?.slice(0, 50) + '...' || 'Agent Task',
    description: event.data.prompt || '',
    status: 'in-progress',
    priority: 'medium',
    agent: event.agent,
    createdAt: new Date().toISOString(),
    source: 'webhook',
  };
  
  // TODO: Save to Convex or local storage
  console.log('[Webhook] Created task:', task);
  return task;
}

// Create approval request
async function createApproval(event: OpenClawEvent) {
  const approval = {
    id: `approval-${Date.now()}`,
    type: event.data.approvalType || 'config',
    title: `${event.data.approvalType?.toUpperCase()} Approval Request`,
    description: `Agent ${event.agent} requires approval`,
    agent: event.agent,
    agentAvatar: '🤖',
    risk: 'medium',
    requestedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 300000).toISOString(),
    details: event.data.approvalDetails || {},
    status: 'pending',
  };
  
  // Save to approvals file
  try {
    const APPROVALS_FILE = join(homedir(), '.openclaw', 'aether-approvals.json');
    let approvals = [];
    try {
      const data = await readFile(APPROVALS_FILE, 'utf-8');
      approvals = JSON.parse(data);
    } catch {}
    
    approvals.unshift(approval);
    await writeFile(APPROVALS_FILE, JSON.stringify(approvals, null, 2));
  } catch (error) {
    console.error('Failed to create approval:', error);
  }
  
  return approval;
}

// POST /api/webhooks/openclaw
export async function POST(request: Request) {
  try {
    const event: OpenClawEvent = await request.json();
    
    console.log('[Webhook] Received:', event.event, 'from', event.agent);
    
    // Log all events
    await logEvent(event);
    
    // Handle different event types
    switch (event.event) {
      case 'agent_start':
        // Create task when agent starts
        await createTaskFromEvent(event);
        break;
        
      case 'agent_end':
        // Update task as completed
        console.log('[Webhook] Agent completed:', event.data.response?.slice(0, 100));
        break;
        
      case 'agent_error':
        // Log error
        console.error('[Webhook] Agent error:', event.data.error);
        break;
        
      case 'approval_needed':
        // Create approval request
        const approval = await createApproval(event);
        return NextResponse.json({ 
          success: true, 
          approvalId: approval.id,
          message: 'Approval request created'
        });
        
      case 'tool_call':
        // Log tool usage
        console.log('[Webhook] Tool call:', event.data.tool, event.data.args);
        break;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/openclaw - Get recent events
export async function GET() {
  try {
    let events: OpenClawEvent[] = [];
    try {
      const data = await readFile(WEBHOOK_LOG, 'utf-8');
      events = JSON.parse(data);
    } catch {}
    
    return NextResponse.json({ events: events.slice(0, 50) });
  } catch (error) {
    return NextResponse.json({ events: [] });
  }
}
