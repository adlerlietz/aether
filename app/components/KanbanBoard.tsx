'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Task, mockTasks } from '@/app/data/tasks';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const columns = [
  { id: 'inbox', title: 'Inbox', color: 'text-white/60' },
  { id: 'assigned', title: 'Assigned', color: 'text-blue-400' },
  { id: 'in-progress', title: 'In Progress', color: 'text-cyan-400' },
  { id: 'review', title: 'Review', color: 'text-yellow-400' },
  { id: 'done', title: 'Done', color: 'text-green-400' },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
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

    // Dropped on a column
    if (columns.some(c => c.id === over.id)) {
      setTasks(tasks.map(t => 
        t.id === active.id ? { ...t, status: over.id as Task['status'] } : t
      ));
      return;
    }

    // Dropped on another task - reorder
    const overTask = tasks.find(t => t.id === over.id);
    if (overTask && activeTask.status === overTask.status) {
      const oldIndex = tasks.filter(t => t.status === activeTask.status).findIndex(t => t.id === active.id);
      const newIndex = tasks.filter(t => t.status === overTask.status).findIndex(t => t.id === over.id);
      
      const columnTasks = tasks.filter(t => t.status === activeTask.status);
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      
      setTasks(tasks.map(t => {
        if (t.status !== activeTask.status) return t;
        const newTask = reordered.find(r => r.id === t.id);
        return newTask || t;
      }));
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white/90">Task Board</h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={addTask}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </motion.button>
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
