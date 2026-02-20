'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/app/data/tasks';
import { Calendar, GripVertical, StickyNote } from 'lucide-react';
import { useTaskNotes } from '@/app/hooks/useTaskNotes';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

const agentEmojis: Record<string, string> = {
  main: '🦞',
  coder: '⚡',
  researcher: '🔍',
  planner: '📐',
  monitor: '👁️',
};

const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function KanbanCard({ task, isDragging, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: task.id });
  
  const { hasNote } = useTaskNotes(task.id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting || isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="glass p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors group"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-white/20 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-white/90 truncate">{task.title}</h4>
            {hasNote && (
              <StickyNote className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
            )}
          </div>
          
          {task.description && (
            <p className="text-xs text-white/50 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              
              {task.dueDate && (
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>

            {task.assignedAgentId && (
              <span className="text-sm" title={task.assignedAgentId}>
                {agentEmojis[task.assignedAgentId] || '🤖'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
