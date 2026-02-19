import AppLayout from '../AppLayout';
import { ReviewView } from '../components/ReviewView';

export default function ReviewPage() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <ReviewView />
      </div>
    </AppLayout>
  );
}
