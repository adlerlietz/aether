'use client';

import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  GitPullRequest, 
  CheckCircle2, 
  Bot,
  Clock
} from 'lucide-react';
import { recentActivity } from '@/app/data';

const activityIcons = {
  task_created: GitPullRequest,
  task_moved: CheckCircle2,
  task_completed: CheckCircle2,
  agent_action: Bot,
  comment: MessageSquare,
};

const activityColors = {
  task_created: 'text-blue-400 bg-blue-500/20',
  task_moved: 'text-purple-400 bg-purple-500/20',
  task_completed: 'text-green-400 bg-green-500/20',
  agent_action: 'text-cyan-400 bg-cyan-500/20',
  comment: 'text-yellow-400 bg-yellow-500/20',
};

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white/90">Activity Feed</h3>
          <p className="text-sm text-white/50">Live updates from your agents</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-xs text-cyan-400">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {recentActivity.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 group-hover:text-white transition-colors">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.agent && (
                    <>
                      <span className="text-lg">{activity.agent.avatar}</span>
                      <span className="text-xs text-white/50">{activity.agent.name}</span>
                    </>
                  )}
                  <span className="text-xs text-white/30 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-cyan-400 hover:text-cyan-300">
                View →
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state if no activity */}
      {recentActivity.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No recent activity</p>
        </div>
      )}
    </motion.div>
  );
}
