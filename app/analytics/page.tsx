import AppLayout from '../AppLayout';
import { AnalyticsView } from '../components/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <AnalyticsView />
      </div>
    </AppLayout>
  );
}
