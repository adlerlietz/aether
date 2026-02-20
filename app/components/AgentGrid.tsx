'use client';

import { motion } from 'framer-motion';
import { 
  GitBranch, 
  Power,
  MoreHorizontal,
  Play,
  Square,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { useOpenClaw, parseTokenUsage, getModelName } from '@/app/hooks/useOpenClaw';

// Full Swarm Roster with American names
interface RosterAgent {
  id: string;
  emoji: string;
  name: string;
  nickname?: string;
  title: string;
  role: string;
  model: string;
  skills: string[];
}

const SWARM_ROSTER: RosterAgent[] = [
  {
    id: 'main',
    emoji: '🦞',
    name: 'Charles',
    nickname: 'Charlie',
    title: 'Chief of Staff',
    role: 'Coordinator',
    model: 'moonshotai/kimi-k2.5',
    skills: ['Delegation', 'Synthesis', 'Strategy']
  },
  {
    id: 'coder',
    emoji: '⚡',
    name: 'Dexter',
    title: 'Code Slinger',
    role: 'Engineer',
    model: 'deepseek/deepseek-chat-v3-0324',
    skills: ['Code', 'Git', 'Terminal', 'DevOps']
  },
  {
    id: 'researcher',
    emoji: '🔍',
    name: 'Oliver',
    nickname: 'Ollie',
    title: 'Field Researcher',
    role: 'Investigator',
    model: 'google/gemini-2.5-flash',
    skills: ['Web Search', 'Scraping', 'OSINT', 'APIs']
  },
  {
    id: 'planner',
    emoji: '📐',
    name: 'Henry',
    title: 'Systems Architect',
    role: 'Designer',
    model: 'moonshotai/kimi-k2.5',
    skills: ['Architecture', 'Docs', 'Analysis']
  },
  {
    id: 'monitor',
    emoji: '👁️',
    name: 'Victor',
    nickname: 'Vic',
    title: 'Watch Officer',
    role: 'Sentinel',
    model: 'ollama/qwen3:4b',
    skills: ['Monitoring', 'Logs', 'Health Checks']
  }
];

interface LiveSession {
  key: string;
  kind: string;
  age: string;
  model: string;
  tokens: string;
  percentUsed: number;
  totalTokens: number;
  remainingTokens: number;
  label?: string;
}

interface AgentCardProps {
  agent: RosterAgent;
  session?: LiveSession;
  index: number;
}

function getSessionForAgent(agentId: string, sessions: LiveSession[]): LiveSession | undefined {
  return sessions.find(s => {
    if (agentId === 'main') return s.key.includes('main') && !s.key.includes('cron');
    if (agentId === 'monitor') return s.key.includes('cron');
    return s.key.includes(agentId);
  });
}

function AgentCard({ agent, session, index }: AgentCardProps) {
  const isOnline = !!session;
  const tokens = session ? parseTokenUsage(session.tokens) : { used: 0, total: 128000, percentage: 0 };
  const isBusy = tokens.percentage > 50;
  const modelName = session ? getModelName(session.model) : getModelName(agent.model);
  
  // Get current task/label if online
  const currentTask = session?.label || (session?.kind === 'other' ? 'Active' : 'Idle');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className={`glass p-5 group hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${!isOnline ? 'opacity-60' : ''}`}
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
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl border border-white/10 ${isOnline ? 'bg-gradient-to-br from-white/10 to-white/5' : 'bg-white/5 grayscale'}`}>
                {agent.emoji}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900 ${isOnline ? (isBusy ? 'bg-cyan-400' : 'bg-green-500') : 'bg-gray-500'}`}>
                {isBusy && <div className="w-full h-full rounded-full bg-cyan-400 animate-pulse" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white/90">{agent.name}</h4>
                {agent.nickname && (
                  <span className="text-xs text-white/40">"{agent.nickname}"</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full ${isOnline ? (isBusy ? 'bg-cyan-500/20 text-cyan-400' : 'bg-green-500/20 text-green-400') : 'bg-gray-500/20 text-gray-400'}`}>
                  {isOnline ? (isBusy ? 'Busy' : 'Online') : 'Available'}
                </span>
                {isOnline && currentTask && (
                  <span className="text-xs text-white/30">• {currentTask}</span>
                )}
              </div>
            </div>
          </div>
          
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg">
            <MoreHorizontal className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Title & Role */}
        <div className="mb-3">
          <p className="text-sm text-white/70 font-medium">{agent.title}</p>
          <p className="text-xs text-white/40">{agent.role}</p>
        </div>

        {/* Model Badge */}
        <div className="mb-4">
          <span className="text-xs uppercase tracking-wider text-white/40">Model</span>
          <p className="text-sm text-white/70 font-medium">{modelName}</p>
        </div>

        {/* Token Usage - only show if online */}
        {isOnline ? (
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
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/5 border-dashed">
            <div className="flex items-center gap-2 text-white/30">
              <Power className="w-4 h-4" />
              <span className="text-sm">Dormant — spawn to activate</span>
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.skills.map((skill) => (
            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
              {skill}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
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
            </>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors text-sm font-medium">
              <Play className="w-4 h-4" />
              Spawn {agent.name}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AgentGrid() {
  const { data, loading, error, refresh } = useOpenClaw(5000);
  const sessions = data?.sessions || [];
  
  // Count online agents
  const onlineCount = SWARM_ROSTER.filter(agent => 
    getSessionForAgent(agent.id, sessions)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">The Swarm</h2>
          <p className="text-white/50 text-sm mt-1">
            {onlineCount} of {SWARM_ROSTER.length} agents online
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
          {SWARM_ROSTER.map((agent) => (
            <div key={agent.id} className="glass p-5 animate-pulse">
              <div className="h-14 w-14 rounded-full bg-white/10 mb-4" />
              <div className="h-4 w-32 bg-white/10 mb-2" />
              <div className="h-3 w-20 bg-white/10" />
            </div>
          ))}
        </div>
      )}

      {/* Agent Grid - Full Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SWARM_ROSTER.map((agent, index) => (
          <AgentCard 
            key={agent.id} 
            agent={agent} 
            session={getSessionForAgent(agent.id, sessions)}
            index={index} 
          />
        ))}
      </div>

      {/* Quick Spawn Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6"
      >
        <h3 className="text-lg font-semibold text-white/90 mb-4">Quick Spawn</h3>
        <div className="flex flex-wrap gap-3">
          {SWARM_ROSTER.filter(a => !getSessionForAgent(a.id, sessions)).map((agent) => (
            <button 
              key={agent.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span>{agent.emoji}</span>
              <span className="text-sm text-white/70">{agent.name}</span>
              <span className="text-xs text-white/40">— {agent.title}</span>
            </button>
          ))}
          {SWARM_ROSTER.filter(a => !getSessionForAgent(a.id, sessions)).length === 0 && (
            <p className="text-sm text-white/40">All agents online 🎉</p>
          )}
        </div>
      </motion.div>

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
