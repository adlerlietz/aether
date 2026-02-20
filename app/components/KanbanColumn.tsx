'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/app/data/tasks';
import { KanbanCard } from './KanbanCard';
import { SpawnAgentButton } from './SpawnAgentButton';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  onlineAgents?: Set<string>;
}

const agentMap: Record<string, { name: string; id: string }> = {
  main: { name: 'Charles', id: 'main' },
  coder: { name: 'Dexter', id: 'coder' },
  researcher: { name: 'Oliver', id: 'researcher' },
  planner: { name: 'Henry', id: 'planner' },
  monitor: { name: 'Victor', id: 'monitor' },
};

export function KanbanColumn({ id, title, color, tasks, onlineAgents = new Set() }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`glass flex flex-col w-72 min-w-72 max-w-72 h-full transition-colors ${
        isOver ? 'bg-[var(--accent-soft)] border-[var(--accent)]' : ''
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-sm ${color}`}>{title}</h3>
          <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => {
            const needsSpawn = id === 'assigned' && 
              task.assignedAgentId && 
              !onlineAgents.has(task.assignedAgentId);
            
            return (
              <div key={task.id} className="space-y-2">
                <KanbanCard task={task} />
                {needsSpawn && task.assignedAgentId && agentMap[task.assignedAgentId] && (
                  <SpawnAgentButton
                    agentId={agentMap[task.assignedAgentId].id}
                    agentName={agentMap[task.assignedAgentId].name}
                    size="sm"
                  />
                )}
              </div>
            );
          })}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-white/20 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
