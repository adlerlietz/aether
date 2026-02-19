'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, WifiOff } from 'lucide-react';
import { usePWA } from '@/app/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isOffline, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || (!isInstallable && !isOffline) || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
      >
        <div className="glass p-4 flex items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-500 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
            Æ
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white/90">
              {isOffline ? 'You\'re Offline' : 'Install Aether'}
            </h4>
            <p className="text-sm text-white/50">
              {isOffline 
                ? 'App is running offline. Changes will sync when you reconnect.'
                : 'Add to home screen for quick access.'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isInstallable && !isOffline && (
              <button
                onClick={install}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            )}
            {isOffline && (
              <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-400">
                <WifiOff className="w-5 h-5" />
              </div>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
