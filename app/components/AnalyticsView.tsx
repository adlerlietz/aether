'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Activity,
  Bot,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';

// Glass tooltip for charts
const GlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 border border-white/20">
        <p className="text-white/90 font-medium mb-1">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AnalyticsData {
  spendHistory: Array<{
    date: string;
    amount: number;
    tokens: number;
  }>;
  modelBreakdown: Array<{
    name: string;
    value: number;
    cost: number;
    color: string;
  }>;
  agentPerformance: Array<{
    agent: string;
    tasks: number;
    success: number;
    failed: number;
  }>;
  recentErrors: Array<{
    id: number;
    agent: string;
    error: string;
    time: string;
    type: string;
  }>;
  summary: {
    totalSpend: number;
    totalTokens: number;
    avgDaily: number;
    projectedMonthly: number;
  };
}

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

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [budgetAlert, setBudgetAlert] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
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
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const summary = data?.summary;
  const budgetLimit = 500;
  const budgetPercent = summary ? (summary.projectedMonthly / budgetLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Analytics & Observability</h2>
          <p className="text-white/50 text-sm mt-1">Monitor spend, utilization, and errors</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                  timeRange === range ? 'bg-white/10 text-white' : 'text-white/50'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={fetchAnalytics}
            disabled={loading}
            className="glass-light px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Budget Alert */}
      {budgetAlert && budgetPercent > 80 && summary && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-orange-500/30 bg-orange-500/10 p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <div>
              <p className="font-medium text-white/90">Budget Alert</p>
              <p className="text-sm text-white/60">
                Projected spend (${summary.projectedMonthly}) exceeds 80% of budget (${budgetLimit})
              </p>
            </div>
          </div>
          <button onClick={() => setBudgetAlert(false)} className="text-sm text-white/50 hover:text-white/80">Dismiss</button>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Spend"
          value={summary ? `$${summary.totalSpend.toFixed(2)}` : '$0.00'}
          subtitle="Past 7 days"
          icon={DollarSign}
          trend="up"
          trendValue={data ? 'Live' : 'Loading'}
          accent="cyan"
          delay={0}
          loading={loading}
        />
        <MetricCard
          title="Projected Monthly"
          value={summary ? `$${summary.projectedMonthly}` : '$0'}
          subtitle="Based on current rate"
          icon={TrendingUp}
          trend="neutral"
          trendValue="Estimated"
          accent="purple"
          delay={0.1}
          loading={loading}
        />
        <MetricCard
          title="Total Tokens"
          value={summary ? `${(summary.totalTokens / 1000).toFixed(0)}k` : '0'}
          subtitle="Across all sessions"
          icon={Bot}
          trend="neutral"
          trendValue="Real-time"
          accent="green"
          delay={0.2}
          loading={loading}
        />
        <MetricCard
          title="Avg Daily"
          value={summary ? `$${summary.avgDaily.toFixed(2)}` : '$0.00'}
          subtitle="Daily average spend"
          icon={Activity}
          trend="neutral"
          trendValue="Calculated"
          accent="orange"
          delay={0.3}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Chart */}
        <motion.div className="glass p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Daily Spend</h3>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.spendHistory || []}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip content={<GlassTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#00f5ff" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Model Breakdown */}
        <motion.div className="glass p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-4">By Model</h3>
          <div className="h-48">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.modelBreakdown || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(data?.modelBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {(data?.modelBreakdown || []).map((model) => (
              <div key={model.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: model.color }} />
                  <span className="text-white/70">{model.name}</span>
                </div>
                <span className="text-white/50">${model.cost}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agent Performance & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="glass p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Agent Performance</h3>
          <div className="h-48">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.agentPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="agent" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                  <Tooltip content={<GlassTooltip />} />
                  <Bar dataKey="success" stackId="a" fill="#22c55e" />
                  <Bar dataKey="failed" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white/90">Recent Events</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
              {(data?.recentErrors || []).length} today
            </span>
          </div>
          <div className="space-y-3">
            {(data?.recentErrors || []).map((error) => (
              <div key={error.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                <div className={`p-2 rounded-lg ${error.type === 'error' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                  <AlertTriangle className={`w-4 h-4 ${error.type === 'error' ? 'text-red-400' : 'text-yellow-400'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white/80">{error.agent}</span>
                    <span className="text-xs text-white/40">{error.time}</span>
                  </div>
                  <p className="text-sm text-white/60">{error.error}</p>
                </div>
              </div>
            ))}
            {(data?.recentErrors || []).length === 0 && (
              <div className="text-center py-8 text-white/30">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No recent events</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
