'use client';

import { motion } from 'framer-motion';
import { 
  Bot, 
  CheckCircle2, 
  Wallet, 
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useOpenClaw, parseTokenUsage, estimateCost, getModelName } from '@/app/hooks/useOpenClaw';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accent?: 'cyan' | 'green' | 'purple' | 'orange';
  delay?: number;
  loading?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  accent = 'cyan',
  delay = 0,
  loading = false
}: MetricCardProps) {
  const accentColors = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  };

  const iconColors = {
    cyan: 'text-cyan-400 bg-cyan-500/20',
    green: 'text-green-400 bg-green-500/20',
    purple: 'text-purple-400 bg-purple-500/20',
    orange: 'text-orange-400 bg-orange-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`glass p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColors[accent]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconColors[accent]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-400' : 
              trend === 'down' ? 'text-red-400' : 'text-white/60'
            }`}>
              {trend === 'up' && <TrendingUp className="w-4 h-4" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        <h3 className="text-white/60 text-sm font-medium mb-1">{title}</h3>
        {loading ? (
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-bold text-white/90 mb-1">{value}</p>
        )}
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

export function DashboardMetrics() {
  const { data, loading, error, refresh } = useOpenClaw(5000);

  // Calculate metrics from real data
  const activeAgents = data?.agents?.count || 0;
  const activeSessions = data?.sessions?.length || 0;
  
  // Calculate total tokens and estimated cost
  let totalTokens = 0;
  let estimatedCost = 0;
  
  data?.sessions?.forEach(session => {
    const tokens = parseTokenUsage(session.tokens);
    totalTokens += tokens.used;
    estimatedCost += estimateCost(tokens.used, session.model);
  });

  // Calculate average token percentage for "health"
  const avgTokenPercent = data?.sessions?.length 
    ? data.sessions.reduce((acc, s) => acc + parseTokenUsage(s.tokens).percentage, 0) / data.sessions.length 
    : 0;

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light text-sm text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 border-red-500/30 bg-red-500/10"
        >
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-white/50 text-xs mt-1">
            Make sure OpenClaw is running: <code className="bg-white/10 px-1 rounded">openclaw status</code>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Agents"
          value={activeAgents}
          subtitle={`${activeSessions} sessions running`}
          icon={Bot}
          trend="up"
          trendValue={data ? 'Live' : 'Offline'}
          accent="cyan"
          delay={0}
          loading={loading}
        />
        <MetricCard
          title="Active Sessions"
          value={activeSessions}
          subtitle={`${data?.channels?.filter(c => c.enabled).length || 0} channels enabled`}
          icon={CheckCircle2}
          trend="neutral"
          trendValue="Real-time"
          accent="green"
          delay={0.1}
          loading={loading}
        />
        <MetricCard
          title="Token Spend"
          value={`$${estimatedCost.toFixed(2)}`}
          subtitle={`${(totalTokens / 1000).toFixed(1)}k tokens today`}
          icon={Wallet}
          trend="neutral"
          trendValue="Live"
          accent="purple"
          delay={0.2}
          loading={loading}
        />
        <MetricCard
          title="Context Health"
          value={`${avgTokenPercent.toFixed(0)}%`}
          subtitle={avgTokenPercent > 80 ? 'High usage - consider new sessions' : 'Healthy usage'}
          icon={Activity}
          trend={avgTokenPercent > 80 ? 'down' : avgTokenPercent > 50 ? 'neutral' : 'up'}
          trendValue={avgTokenPercent > 80 ? 'Warning' : 'Good'}
          accent={avgTokenPercent > 80 ? 'orange' : 'green'}
          delay={0.3}
          loading={loading}
        />
      </div>

      {/* Live Sessions Preview */}
      {data?.sessions && data.sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4"
        >
          <h4 className="text-sm font-medium text-white/70 mb-3">Live Sessions</h4>
          <div className="space-y-2">
            {data.sessions.slice(0, 4).map((session, idx) => {
              const tokens = parseTokenUsage(session.tokens);
              return (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-white/80">{getModelName(session.model)}</span>
                    <span className="text-xs text-white/40">{session.kind}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${tokens.percentage > 80 ? 'bg-orange-400' : 'bg-cyan-400'}`}
                          style={{ width: `${tokens.percentage}%` }}
                        />
                      </div>
                      <span className={tokens.percentage > 80 ? 'text-orange-400' : 'text-white/50'}>
                        {tokens.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-white/30">{session.age}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
