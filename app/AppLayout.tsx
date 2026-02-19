'use client';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navigation Bar */}
      <TopBar />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
