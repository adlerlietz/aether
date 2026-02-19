// OpenClaw API Client via Tailscale
const OPENCLAW_GATEWAY = process.env.NEXT_PUBLIC_OPENCLAW_URL 
  || process.env.OPENCLAW_GATEWAY_URL 
  || 'http://100.89.70.54:18789';

export async function getOpenClawStatus() {
  try {
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/status`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch OpenClaw status:', error);
    return null;
  }
}

export async function getSessions() {
  try {
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/sessions`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}
