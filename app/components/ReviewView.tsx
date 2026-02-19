'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  FileText,
  Mail,
  Trash2,
  Settings,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

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

const typeIcons = {
  delete: Trash2,
  email: Mail,
  spend: AlertTriangle,
  config: Settings,
  spawn: ShieldCheck,
};

const riskColors = {
  low: 'text-green-400 bg-green-500/20 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  high: 'text-red-400 bg-red-500/20 border-red-500/30',
};

function ApprovalCard({ 
  approval, 
  onApprove, 
  onReject,
  expanded,
  onToggle
}: { 
  approval: ApprovalRequest; 
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = typeIcons[approval.type];
  const isExpired = approval.status === 'expired';
  const expiresAt = new Date(approval.expiresAt);
  const timeLeft = Math.max(0, expiresAt.getTime() - Date.now());
  const minutesLeft = Math.floor(timeLeft / 60000);

  return (
    <motion.div layout className={`glass p-5 transition-all ${isExpired ? 'opacity-50' : ''} ${expanded ? 'border-cyan-500/30' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${riskColors[approval.risk]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-white/90">{approval.title}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[approval.risk]}`}>
              {approval.risk} risk
            </span>
            {approval.status !== 'pending' && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                approval.status === 'approved' ? 'bg-green-500/20 text-green-400' : 
                approval.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 
                'bg-gray-500/20 text-gray-400'
              }`}>
                {approval.status}
              </span>
            )}
          </div>
          
          <p className="text-sm text-white/60 mb-2">{approval.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <span>{approval.agentAvatar}</span>
              {approval.agent}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(approval.requestedAt), 'h:mm a')}
            </span>
            {!isExpired && approval.status === 'pending' && (
              <span className="text-orange-400">Expires in {minutesLeft}m</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {approval.status === 'pending' && !isExpired && (
            <>
              <button onClick={() => onReject(approval.id)} className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30">
                <X className="w-5 h-5" />
              </button>
              <button onClick={() => onApprove(approval.id)} className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30">
                <Check className="w-5 h-5" />
              </button>
            </>
          )}
          <button onClick={onToggle} className="p-2 rounded-lg hover:bg-white/10 text-white/40">
            {expanded ? '−' : '+'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4">
              <h5 className="text-sm font-medium text-white/70 mb-3">Details</h5>
              <div className="space-y-2">
                {Object.entries(approval.details).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-white/40 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-white/80 font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {approval.status === 'pending' && !isExpired && (
              <div className="mt-4 flex gap-3">
                <button onClick={() => onApprove(approval.id)} className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 font-medium">
                  Approve
                </button>
                <button onClick={() => onReject(approval.id)} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium">
                  Reject
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ReviewView() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/approvals');
      if (!response.ok) throw new Error('Failed to fetch approvals');
      const data = await response.json();
      setApprovals(data.approvals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredApprovals = approvals.filter(a => filter === 'all' ? true : a.status === filter);

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/approvals?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!response.ok) throw new Error('Failed to approve');
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectNote) {
      setShowRejectModal(id);
      return;
    }
    try {
      const response = await fetch(`/api/approvals?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectReason: rejectNote }),
      });
      if (!response.ok) throw new Error('Failed to reject');
      setShowRejectModal(null);
      setRejectNote('');
      await fetchApprovals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Review & Approvals</h2>
          <p className="text-white/50 text-sm mt-1">Human-in-the-loop for sensitive actions</p>
        </div>
        <button onClick={fetchApprovals} disabled={loading} className="glass-light px-4 py-2 rounded-xl text-sm text-white/70 flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && <div className="glass p-4 border-red-500/30 bg-red-500/10"><p className="text-red-400">{error}</p></div>}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }} className="glass p-4 text-center cursor-pointer" onClick={() => setFilter(stat.label.toLowerCase() as any)}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-white/50 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === f ? 'bg-cyan-500 text-black' : 'glass-light text-white/60'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && !approvals.length ? (
          <div className="glass p-12 text-center">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="glass p-12 text-center">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-white/30" />
            <p className="text-white/50">No {filter} approvals</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onReject={handleReject}
              expanded={expandedId === approval.id}
              onToggle={() => setExpandedId(expandedId === approval.id ? null : approval.id)}
            />
          ))
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl" onClick={() => setShowRejectModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="glass p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white/90 mb-2">Reject Action</h3>
              <p className="text-sm text-white/60 mb-4">Please provide a reason for rejection.</p>
              <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Enter reason..." className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowRejectModal(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/70">Cancel</button>
                <button onClick={() => handleReject(showRejectModal)} disabled={!rejectNote} className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 disabled:opacity-50">Reject</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
