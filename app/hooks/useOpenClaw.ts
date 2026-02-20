'use client';

import { useState, useEffect } from 'react';

interface OpenClawData {
  gateway: {
    url: string;
    reachable: boolean;
    latency: number;
  };
  agents: {
    count: number;
    defaultId: string;
  };
  sessions: Array<{
    key: string;
    kind: string;
    age: string;
    model: string;
    tokens: string;
    percentUsed: number;
    totalTokens: number;
    remainingTokens: number;
  }>;
  channels: Array<{
    name: string;
    enabled: boolean;
    state: string;
  }>;
}

interface UseOpenClawReturn {
  data: OpenClawData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useOpenClaw(pollInterval = 5000): UseOpenClawReturn {
  const [data, setData] = useState<OpenClawData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/openclaw/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch OpenClaw status');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}

// Parse token usage from string like "104.0k/128k (81%)"
export function parseTokenUsage(tokenStr: string): { used: number; total: number; percentage: number } {
  try {
    const match = tokenStr.match(/([\d.]+)k?\/([\d.]+)k?\s*\(([\d.]+)%\)/);
    if (match) {
      const used = parseFloat(match[1]) * (tokenStr.includes('k') ? 1000 : 1);
      const total = parseFloat(match[2]) * (tokenStr.includes('k') ? 1000 : 1);
      return {
        used,
        total,
        percentage: parseFloat(match[3]),
      };
    }
  } catch {}
  
  return { used: 0, total: 128000, percentage: 0 };
}

// Get active model from session key
export function getModelName(model: string): string {
  if (!model) return 'Unknown';
  const parts = model.split('/');
  const name = parts[parts.length - 1] || model;
  // Clean up common model names
  const aliases: Record<string, string> = {
    'kimi-k2.5': 'Kimi K2.5',
    'gemini-2.5-flash': 'Gemini Flash',
    'deepseek-chat-v3-0324': 'DeepSeek Chat',
    'qwen3:4b': 'Qwen 3 4B',
  };
  return aliases[name] || name;
}

// Calculate estimated cost based on tokens
export function estimateCost(tokens: number, model: string): number {
  // Rough pricing per 1M tokens (input + output avg)
  const pricing: Record<string, number> = {
    'kimi-k2.5': 3,
    'gemini-2.5-flash-lite': 0.5,
    'deepseek-chat-v3-0324': 0.5,
    'claude-sonnet': 3,
    'gpt-4': 30,
  };
  
  // Match partial model names
  const priceKey = Object.keys(pricing).find(k => model.toLowerCase().includes(k.toLowerCase()));
  const price = priceKey ? pricing[priceKey] : 3;
  return (tokens / 1000000) * price;
}
