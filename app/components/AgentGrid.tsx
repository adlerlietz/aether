'use client';

import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  GitBranch, 
  Power,
  MoreHorizontal,
  Cpu,
  MemoryStick,
  Play,
  Square,
  Settings,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { useOpenClaw, parseTokenUsage, getModelName } from '@/app/hooks/useOpenClaw';

interface AgentCardProps {
  session: {
    key: string;
    kind: string;
    age: string;
    model: string;
    tokens: string;
  };
  index: number;
}

const agentRoster: Record<string, { emoji: string; name: string }> = {
  'main':       { emoji: '🦞', name: 'Molt' },
  'coder':      { emoji: '⚡', name: 'ClodBot' },
  'researcher': { emoji: '🔍', name: 'DeepDive' },
  'planner':    { emoji: '📐', name: 'Kimi' },
  'monitor':    { emoji: '👁️', name: 'CronMaster' },
};

const channelEmojis: Record<string, string> = {
  'telegram': '📱',
  'cron': '⏰',
};

function getAgentEmoji(key: string): string {
  for (const [id, agent] of Object.entries(agentRoster)) {
    if (key.includes(id)) return agent.emoji;
  }
  for (const [channel, emoji] of Object.entries(channelEmojis)) {
    if (key.includes(channel)) return emoji;
  }
  return '🤖';
}

function getAgentName(key: string): string {
  for (const [id, agent] of Object.entries(agentRoster)) {
    if (key.includes(id)) return agent.name;
  }
  if (key.includes('telegram')) return 'Telegram Agent';
  if (key.includes('cron')) return 'Cron Agent';
  return 'Agent';
}

function AgentCard({ session, index }: AgentCardProps) {
  const tokens = parseTokenUsage(session.tokens);
  const isBusy = tokens.percentage > 50;
  const modelName = getModelName(session.model);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="glass p-5 group hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Status ring animation for busy agents */}
      {isBusy && (
        <div className="absolute inset-0 rounded-[var(--radius)] ring-2 ring-cyan-500/30 animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Header: Avatar + Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`relative ${isBusy ? 'ring-2 ring-cyan-500/30' : ''} rounded-full p-0.5`}>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-3xl border border-white/10">
                {getAgentEmoji(session.key)}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${isBusy ? 'bg-cyan-400' : 'bg-green-500'}`}>
                {isBusy && <div className="w-full h-full rounded-full bg-cyan-400 animate-pulse" />}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white/90">{getAgentName(session.key)}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isBusy ? 'bg-cyan-500/20 text-cyan-400' : 'bg-green-500/20 text-green-400'}`}>
                {isBusy ? 'Busy' : 'Online'}
              </span>
            </div>
          </div>
          
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg">
            <MoreHorizontal className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Model Badge */}
        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider text-white/40">Model</span>
          <p className="text-sm text-white/70 font-medium">{modelName}</p>
        </div>

        {/* Token Usage */}
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-white/40">Context Usage</span>
            <span className={`text-xs ${tokens.percentage > 80 ? 'text-orange-400' : 'text-white/60'}`}>
              {tokens.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${tokens.percentage > 80 ? 'bg-orange-400' : 'bg-cyan-400'}`}
              style={{ width: `${tokens.percentage}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">
            {(tokens.used / 1000).toFixed(1)}k / {(tokens.total / 1000).toFixed(0)}k tokens
          </p>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-white/40">
          <div>
            <span className="block text-white/30">Type</span>
            {session.kind}
          </div>
          <div>
            <span className="block text-white/30">Age</span>
            {session.age}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm font-medium">
            <Terminal className="w-4 h-4" />
            View
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm font-medium">
            <GitBranch className="w-4 h-4" />
            Fork
          </button>
          <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function AgentGrid() {
  const { data, loading, error, refresh } = useOpenClaw(5000);
  const sessions = data?.sessions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Digital Office</h2>
          <p className="text-white/50 text-sm mt-1">
            {sessions.length} active sessions connected to OpenClaw
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={refresh}
            disabled={loading}
            className="glass-light px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2">
            <Power className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass p-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass p-5 animate-pulse">
              <div className="h-14 w-14 rounded-full bg-white/10 mb-4" />
              <div className="h-4 w-32 bg-white/10 mb-2" />
              <div className="h-3 w-20 bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map((session, index) => (
          <AgentCard key={session.key} session={session} index={index} />
        ))}
        
        {/* Add New Session Card */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: sessions.length * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="glass-light border-dashed border-2 border-white/20 flex flex-col items-center justify-center gap-3 p-8 min-h-[320px] text-white/40 hover:text-white/70 hover:border-white/40 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Power className="w-8 h-8" />
          </div>
          <span className="font-medium">New Session</span>
          <span className="text-sm text-white/30">Spawn agent from CLI</span>
        </motion.button>
      </div>

      {/* Channel Status */}
      {data?.channels && data.channels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6"
        >
          <h3 className="text-lg font-semibold text-white/90 mb-4">Connected Channels</h3>
          <div className="flex gap-4">
            {data.channels.map((channel, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5">
                <div className={`w-2 h-2 rounded-full ${channel.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                <span className="text-sm text-white/70">{channel.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${channel.state === 'OK' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {channel.state}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
