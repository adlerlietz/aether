import AppLayout from './AppLayout';
import { KanbanBoard } from './components/KanbanBoard';
import { Plus } from 'lucide-react';

export default function BoardPage() {
  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white/90">Board</h2>
            <p className="text-white/50 text-sm mt-1">
              Manage tasks and track agent progress
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass-light px-4 py-2 rounded-xl">
              <span className="text-sm text-white/60">
                <span className="text-white/90 font-medium">12</span> tasks ·{' '}
                <span className="text-[var(--accent)] font-medium">3</span> in progress
              </span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 -mx-6 px-6">
          <KanbanBoard />
        </div>
      </div>
      
      {/* Floating Action Button */}
      <button className="fab">
        <Plus className="w-5 h-5" />
        <span>Spawn Agent</span>
      </button>
    </AppLayout>
  );
}
