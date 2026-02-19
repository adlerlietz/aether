#!/usr/bin/env node
/**
 * Aether Webhook Hook for OpenClaw
 * 
 * Place this file in: ~/.openclaw/hooks/aether-webhook/handler.ts
 * 
 * This hook sends agent activity to Aether Mission Control for:
 * - Task tracking
 * - Approval workflows
 * - Activity logging
 */

const AETHER_WEBHOOK_URL = process.env.AETHER_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/openclaw';

interface HookContext {
  sessionKey: string;
  agent: string;
  prompt: string;
}

interface HookResult {
  response: string;
}

// Send event to Aether
async function sendToAether(event: string, data: any) {
  try {
    const response = await fetch(AETHER_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
      }),
    });
    
    if (!response.ok) {
      console.error('[Aether Hook] Failed to send event:', response.statusText);
    } else {
      console.log('[Aether Hook] Event sent:', event);
    }
    
    // Check if approval is needed
    const result = await response.json();
    if (result.approvalId) {
      console.log('[Aether Hook] Approval required:', result.approvalId);
      // Could block here waiting for approval...
    }
  } catch (error) {
    // Fail silently - don't break agent execution
    console.error('[Aether Hook] Error:', error);
  }
}

// Hook handler - called by OpenClaw
export async function onAgentStart(context: HookContext) {
  await sendToAether('agent_start', {
    sessionKey: context.sessionKey,
    agent: context.agent,
    prompt: context.prompt,
  });
}

export async function onAgentEnd(context: HookContext, result: HookResult) {
  await sendToAether('agent_end', {
    sessionKey: context.sessionKey,
    agent: context.agent,
    prompt: context.prompt,
    response: result.response,
  });
}

export async function onAgentError(context: HookContext, error: Error) {
  await sendToAether('agent_error', {
    sessionKey: context.sessionKey,
    agent: context.agent,
    prompt: context.prompt,
    error: error.message,
  });
}

export async function onToolCall(context: HookContext, tool: string, args: any) {
  // Check if tool requires approval
  const needsApproval = [
    'file_delete',
    'file_write',
    'email_send',
    'exec',
    'gateway_restart',
  ].includes(tool);
  
  await sendToAether('tool_call', {
    sessionKey: context.sessionKey,
    agent: context.agent,
    tool,
    args,
    requiresApproval: needsApproval,
  });
  
  if (needsApproval) {
    // Request approval through Aether
    await sendToAether('approval_needed', {
      sessionKey: context.sessionKey,
      agent: context.agent,
      approvalType: tool.includes('delete') ? 'delete' : 
                    tool.includes('email') ? 'email' : 
                    tool.includes('exec') ? 'config' : 'spend',
      approvalDetails: { tool, args },
    });
  }
}

// Default export for OpenClaw
export default {
  onAgentStart,
  onAgentEnd,
  onAgentError,
  onToolCall,
};
