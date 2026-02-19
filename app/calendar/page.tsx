import AppLayout from '../AppLayout';
import { CalendarView } from '../components/CalendarView';
import { Plus } from 'lucide-react';

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <CalendarView />
      </div>

      {/* Floating Action Button */}
      <button className="fab">
        <Plus className="w-5 h-5" />
        <span>New Schedule</span>
      </button>
    </AppLayout>
  );
}
