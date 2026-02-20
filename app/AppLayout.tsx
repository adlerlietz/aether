'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileNav } from './components/MobileNav';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { X } from 'lucide-react';

function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mobile-drawer open lg:hidden"
          onClick={onClose}
        >
          <div className="mobile-drawer-backdrop" />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-500 flex items-center justify-center text-black font-bold text-lg">
                  Æ
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white/90">Aether</h1>
                  <p className="text-xs text-white/40">Mission Control</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation links for mobile drawer */}
            <nav className="p-4 space-y-1">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Board', href: '/' },
                { label: 'Agents', href: '/agents' },
                { label: 'Calendar', href: '/calendar' },
                { label: 'Memory', href: '/memory' },
                { label: 'Analytics', href: '/analytics' },
                { label: 'Review', href: '/review' },
                { label: 'Terminal', href: '/terminal' },
                { label: 'Settings', href: '/settings' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={onClose}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* Left Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Mobile Menu Drawer */}
      <MobileDrawer 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
