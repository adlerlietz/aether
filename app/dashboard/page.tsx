import AppLayout from '../AppLayout';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { ActivityFeed } from '../components/ActivityFeed';
import { KanbanBoard } from '../components/KanbanBoard';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="h-full flex flex-col max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white/90">Dashboard</h2>
            <p className="text-white/50 text-sm mt-1">
              Overview of your agent fleet and activity
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass-light px-4 py-2 rounded-xl">
              <span className="text-sm text-white/60">
                <span className="text-white/90 font-medium">4</span> agents ·{' '}
                <span className="text-[var(--accent)] font-medium">12</span> tasks
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <DashboardMetrics />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Activity Feed - Takes 1 column */}
          <div className="lg:col-span-1 overflow-hidden">
            <ActivityFeed />
          </div>
          
          {/* Quick Kanban Preview - Takes 2 columns */}
          <div className="lg:col-span-2 glass p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white/90">Recent Tasks</h3>
                <p className="text-sm text-white/50">Drag to update status</p>
              </div>
              <button className="text-sm text-cyan-400 hover:text-cyan-300">
                View Board →
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <KanbanBoard />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fab">
        <Plus className="w-5 h-5" />
        <span>Quick Action</span>
      </button>
    </AppLayout>
  );
}
