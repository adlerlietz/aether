import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

const APPROVALS_FILE = join(homedir(), '.openclaw', 'aether-approvals.json');

// Approval store - in production use Redis/DB
interface ApprovalRequest {
  id: string;
  type: 'delete' | 'email' | 'spend' | 'config' | 'spawn';
  title: string;
  description: string;
  agent: string;
  agentAvatar: string;
  risk: 'low' | 'medium' | 'high';
  requestedAt: string;
  expiresAt: string;
  details: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejectReason?: string;
}

async function getApprovals(): Promise<ApprovalRequest[]> {
  try {
    const data = await readFile(APPROVALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return default approvals
    return [
      {
        id: '1',
        type: 'delete',
        title: 'Delete file request',
        description: 'Claude wants to delete a file',
        agent: 'main',
        agentAvatar: '🧠',
        risk: 'medium',
        requestedAt: new Date(Date.now() - 300000).toISOString(),
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        details: {
          path: '/Users/adler/Documents/temp/old-data.json',
          size: '2.4 MB',
          modified: '2 days ago',
        },
        status: 'pending',
      },
      {
        id: '2',
        type: 'spend',
        title: 'High cost operation',
        description: 'Request to use expensive model',
        agent: 'telegram',
        agentAvatar: '📱',
        risk: 'medium',
        requestedAt: new Date(Date.now() - 600000).toISOString(),
        expiresAt: new Date(Date.now() + 240000).toISOString(),
        details: {
          estimatedCost: '$5.50',
          duration: '~10 minutes',
          model: 'claude-opus',
          tokens: 'Estimated 200K tokens',
        },
        status: 'pending',
      },
    ];
  }
}

async function saveApprovals(approvals: ApprovalRequest[]) {
  await writeFile(APPROVALS_FILE, JSON.stringify(approvals, null, 2));
}

// GET /api/approvals - List all approvals
export async function GET() {
  try {
    const approvals = await getApprovals();
    
    // Check for expired approvals
    const now = new Date().toISOString();
    const updated = approvals.map(a => {
      if (a.status === 'pending' && a.expiresAt < now) {
        return { ...a, status: 'expired' as const };
      }
      return a;
    });
    
    if (JSON.stringify(updated) !== JSON.stringify(approvals)) {
      await saveApprovals(updated);
    }
    
    return NextResponse.json({ approvals: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

// POST /api/approvals - Create new approval request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const approvals = await getApprovals();
    
    const newApproval: ApprovalRequest = {
      id: `approval-${Date.now()}`,
      type: body.type || 'config',
      title: body.title || 'Approval Request',
      description: body.description || '',
      agent: body.agent || 'system',
      agentAvatar: body.agentAvatar || '🤖',
      risk: body.risk || 'medium',
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (body.timeout || 300000)).toISOString(),
      details: body.details || {},
      status: 'pending',
    };
    
    approvals.unshift(newApproval);
    await saveApprovals(approvals);
    
    return NextResponse.json({ approval: newApproval });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create approval' },
      { status: 500 }
    );
  }
}

// PATCH /api/approvals/:id - Update approval status
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Approval ID required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const approvals = await getApprovals();
    
    const index = approvals.findIndex(a => a.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }
    
    approvals[index] = {
      ...approvals[index],
      status: body.status,
      rejectReason: body.rejectReason,
    };
    
    await saveApprovals(approvals);
    
    // TODO: Notify OpenClaw gateway of decision
    // await fetch('http://localhost:18789/api/approvals/' + id + '/decision', {
    //   method: 'POST',
    //   body: JSON.stringify({ status: body.status })
    // });
    
    return NextResponse.json({ approval: approvals[index] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}
