import AppLayout from '../AppLayout';
import { MemoryView } from '../components/MemoryView';

export default function MemoryPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <MemoryView />
      </div>
    </AppLayout>
  );
}
