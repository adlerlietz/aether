import AppLayout from '../AppLayout';
import { AgentGrid } from '../components/AgentGrid';
import { Plus } from 'lucide-react';

export default function AgentsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <AgentGrid />
      </div>

      {/* Floating Action Button */}
      <button className="fab">
        <Plus className="w-5 h-5" />
        <span>Spawn Agent</span>
      </button>
    </AppLayout>
  );
}
