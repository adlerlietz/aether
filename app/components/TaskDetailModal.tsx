'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, RotateCcw, Clock, User } from 'lucide-react';
import { Task } from '@/app/data/tasks';
import { TaskNoteEditor } from './TaskNoteEditor';
import { useTaskNotes } from '@/app/hooks/useTaskNotes';
import { formatDistanceToNow } from '@/app/lib/utils';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const statusOptions = [
  { value: 'inbox', label: 'Inbox', color: 'text-white/60' },
  { value: 'assigned', label: 'Assigned', color: 'text-blue-400' },
  { value: 'in-progress', label: 'In Progress', color: 'text-cyan-400' },
  { value: 'review', label: 'Review', color: 'text-yellow-400' },
  { value: 'done', label: 'Done', color: 'text-green-400' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-400' },
];

const agentOptions = [
  { id: 'main', name: 'Charles', emoji: '🦞' },
  { id: 'coder', name: 'Dexter', emoji: '⚡' },
  { id: 'researcher', name: 'Oliver', emoji: '🔍' },
  { id: 'planner', name: 'Henry', emoji: '📐' },
  { id: 'monitor', name: 'Victor', emoji: '👁️' },
];

export function TaskDetailModal({ task, isOpen, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'history'>('notes');
  const { versions, restoreVersion } = useTaskNotes(task?.id || '');
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    onUpdate?.(editedTask);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      onDelete?.(task.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'notes' 
                      ? 'text-[var(--accent)] border-[var(--accent)]' 
                      : 'text-white/50 border-transparent hover:text-white/80'
                  }`}
                >
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-1.5 text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === 'history' 
                      ? 'text-[var(--accent)] border-[var(--accent)]' 
                      : 'text-white/50 border-transparent hover:text-white/80'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                  {versions.length > 0 && (
                    <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                      {versions.length}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'notes' ? (
                <div className="p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[var(--accent)]/50"
                    />
                  </div>

                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider">Status</label>
                      <select
                        value={editedTask.status}
                        onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
                        className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[var(--accent)]/50"
                      >
                        {statusOptions.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider">Priority</label>
                      <select
                        value={editedTask.priority}
                        onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                        className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[var(--accent)]/50"
                      >
                        {priorityOptions.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Assigned Agent */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider">Assigned To</label>
                    <select
                      value={editedTask.assignedAgentId || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, assignedAgentId: e.target.value || undefined })}
                      className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[var(--accent)]/50"
                    >
                      <option value="">Unassigned</option>
                      {agentOptions.map(a => (
                        <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider">Due Date</label>
                    <input
                      type="date"
                      value={editedTask.dueDate || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || undefined })}
                      className="w-full mt-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[var(--accent)]/50"
                    />
                  </div>

                  {/* Notes Editor */}
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider">Notes</label>
                    <div className="mt-1">
                      <TaskNoteEditor taskId={task.id} expanded />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {versions.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {[...versions].reverse().map((version, idx) => (
                        <div
                          key={version.version}
                          className="glass p-3 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-white/40" />
                              <span className="text-sm text-white/80">
                                {formatDistanceToNow(new Date(version.timestamp))} ago
                              </span>
                              <span className="text-xs text-white/40">by {version.author}</span>
                            </div>
                            <span className="text-xs text-white/40">v{version.version}</span>
                          </div>
                          <p className="text-sm text-white/60 mt-2 line-clamp-2">
                            {version.content.slice(0, 100)}...
                          </p>
                          <button
                            onClick={() => restoreVersion(version.version)}
                            className="flex items-center gap-1 text-xs text-[var(--accent)] mt-2 hover:underline"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Restore this version
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-white/5">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium"
              >
                Delete
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-white/60 hover:text-white/90 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent)]/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
