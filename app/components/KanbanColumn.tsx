'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Column } from '@/app/types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  index: number;
  onTaskClick?: (taskId: string) => void;
}

const columnColors: Record<string, string> = {
  inbox: 'bg-blue-500/20 text-blue-400',
  assigned: 'bg-purple-500/20 text-purple-400',
  'in-progress': 'bg-cyan-500/20 text-cyan-400',
  review: 'bg-yellow-500/20 text-yellow-400',
  done: 'bg-green-500/20 text-green-400',
};

export function KanbanColumn({ column, index, onTaskClick }: KanbanColumnProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="kanban-column max-h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${columnColors[column.id].split(' ')[0]}`} />
          <h3 className="font-semibold text-white/90">{column.title}</h3>
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60">
            {column.tasks.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-white/60" />
          </button>
          <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 overflow-y-auto p-3 min-h-[200px]
              transition-colors duration-200
              ${snapshot.isDraggingOver ? 'drag-over' : ''}
            `}
          >
            {column.tasks.map((task, taskIndex) => (
              <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={snapshot.isDragging ? 'dragging' : ''}
                    style={provided.draggableProps.style}
                  >
                    <TaskCard
                      task={task}
                      index={taskIndex}
                      onClick={() => onTaskClick?.(task.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {/* Empty State */}
            {column.tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm">Add a task</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </motion.div>
  );
}
