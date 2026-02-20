'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Task, mockTasks } from '@/app/data/tasks';
import { SpawnAgentButton } from './SpawnAgentButton';
import { Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOpenClaw } from '@/app/hooks/useOpenClaw';

const columns = [
  { id: 'inbox', title: 'Inbox', color: 'text-white/60' },
  { id: 'assigned', title: 'Assigned', color: 'text-blue-400' },
  { id: 'in-progress', title: 'In Progress', color: 'text-cyan-400' },
  { id: 'review', title: 'Review', color: 'text-yellow-400' },
  { id: 'done', title: 'Done', color: 'text-green-400' },
];

const agentMap: Record<string, { name: string; id: string }> = {
  main: { name: 'Charles', id: 'main' },
  coder: { name: 'Dexter', id: 'coder' },
  researcher: { name: 'Oliver', id: 'researcher' },
  planner: { name: 'Henry', id: 'planner' },
  monitor: { name: 'Victor', id: 'monitor' },
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: openClawData, refresh } = useOpenClaw(5000);
  
  const onlineAgents = new Set<string>(
    (openClawData?.sessions || []).map(s => {
      if (s.key.includes('main') && !s.key.includes('cron')) return 'main';
      if (s.key.includes('coder')) return 'coder';
      if (s.key.includes('researcher')) return 'researcher';
      if (s.key.includes('planner')) return 'planner';
      if (s.key.includes('cron')) return 'monitor';
      return '';
    }).filter(Boolean)
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    // Check if dropping on a column
    if (columns.some(c => c.id === over.id)) {
      const newStatus = over.id as Task['status'];
      
      // If moving to in-progress and agent is offline, show spawn option
      if (newStatus === 'in-progress' && activeTask.assignedAgentId) {
        const isOnline = onlineAgents.has(activeTask.assignedAgentId);
        if (!isOnline) {
          // Keep in assigned, will show spawn button
          setTasks(tasks.map(t => 
            t.id === active.id ? { ...t, status: 'assigned' } : t
          ));
          return;
        }
      }
      
      setTasks(tasks.map(t => 
        t.id === active.id ? { ...t, status: newStatus } : t
      ));
    }
  };

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'New Task',
      status: 'inbox',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const activeTask = tasks.find(t => t.id === activeId);
  
  // Find tasks that need spawning
  const needsSpawn = tasks.filter(t => 
    t.status === 'in-progress' && 
    t.assignedAgentId && 
    !onlineAgents.has(t.assignedAgentId)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white/90">Task Board</h2>
          <button 
            onClick={refresh}
            className="p-2 rounded-lg glass-light text-white/60 hover:text-white/90"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Spawn buttons for offline agents with in-progress tasks */}
          {needsSpawn.map(task => (
            task.assignedAgentId && agentMap[task.assignedAgentId] && (
              <SpawnAgentButton
                key={task.id}
                agentId={agentMap[task.assignedAgentId].id}
                agentName={agentMap[task.assignedAgentId].name}
                size="sm"
              />
            )
          ))}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addTask}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </motion.button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {columns.map(column => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={tasks.filter(t => t.status === column.id)}
                onlineAgents={onlineAgents}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
