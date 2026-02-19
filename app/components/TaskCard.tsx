'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, Paperclip, MessageSquare } from 'lucide-react';
import { Task } from '@/app/types';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick?: () => void;
}

const priorityColors = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="kanban-card p-4 mb-3 group"
    >
      {/* Header: Priority & Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
          <span className="text-xs uppercase tracking-wider text-white/40">
            {task.priority}
          </span>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-medium text-white/90 mb-1 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-white/50 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/60 border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Assignee & Meta */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{task.assignee.avatar}</span>
              <span className="text-xs text-white/50">{task.assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-white/30">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-white/40">
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs">
            <MessageSquare className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
