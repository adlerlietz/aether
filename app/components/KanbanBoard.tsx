'use client';

import { useState } from 'react';
import { DragDropContext, DropResult, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Column, Task } from '@/app/types';
import { initialColumns } from '@/app/data';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Moving within the same column
    if (source.droppableId === destination.droppableId) {
      const column = columns.find((c) => c.id === source.droppableId);
      if (!column) return;

      const newTasks = Array.from(column.tasks);
      const [reorderedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, reorderedTask);

      const newColumns = columns.map((c) =>
        c.id === column.id ? { ...c, tasks: newTasks } : c
      );
      setColumns(newColumns);
    } else {
      // Moving between columns
      const sourceColumn = columns.find((c) => c.id === source.droppableId);
      const destColumn = columns.find((c) => c.id === destination.droppableId);
      if (!sourceColumn || !destColumn) return;

      const sourceTasks = Array.from(sourceColumn.tasks);
      const destTasks = Array.from(destColumn.tasks);
      const [movedTask] = sourceTasks.splice(source.index, 1);
      
      // Update task status
      const updatedTask: Task = {
        ...movedTask,
        status: destination.droppableId as Task['status'],
        updatedAt: new Date(),
      };
      
      destTasks.splice(destination.index, 0, updatedTask);

      const newColumns = columns.map((c) => {
        if (c.id === sourceColumn.id) return { ...c, tasks: sourceTasks };
        if (c.id === destColumn.id) return { ...c, tasks: destTasks };
        return c;
      });
      setColumns(newColumns);
    }
  };

  const handleTaskClick = (taskId: string) => {
    console.log('Task clicked:', taskId);
    // TODO: Open inspector panel
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              onTaskClick={handleTaskClick}
            />
          ))}
          
          {/* Add Column Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-light flex items-center justify-center gap-2 px-6 min-w-[300px] h-fit py-4 text-white/50 hover:text-white/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Column</span>
          </motion.button>
        </div>
      </div>
    </DragDropContext>
  );
}
