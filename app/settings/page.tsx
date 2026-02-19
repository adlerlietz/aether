import AppLayout from '../AppLayout';
import { SettingsView } from '../components/SettingsView';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <SettingsView />
      </div>
    </AppLayout>
  );
}
