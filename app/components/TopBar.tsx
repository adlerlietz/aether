'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Plus,
  Command,
  Wifi,
  WifiOff,
  Cpu
} from 'lucide-react';

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [connected, setConnected] = useState(true);

  return (
    <header className="top-bar">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl glass-light text-white/50 hover:text-white/80 transition-colors min-w-[300px]"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search tasks, agents, memories...</span>
          <div className="ml-auto flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-white/10">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </motion.button>
      </div>

      {/* Center: Quick Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </motion.button>
      </div>

      {/* Right: Status & Notifications */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Gateway Health */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/60">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white/60">Offline</span>
            </>
          )}
        </div>

        {/* Token Spend */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light">
          <Cpu className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-xs text-white/60">$12.45 today</span>
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-xl glass-light text-white/60 hover:text-white/90"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </motion.button>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <Search className="w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="flex-1 bg-transparent text-lg text-white placeholder:text-white/40 outline-none"
                  autoFocus
                />
                <button 
                  onClick={() => setSearchOpen(false)}
                  className="px-2 py-1 rounded bg-white/10 text-xs text-white/60"
                >
                  ESC
                </button>
              </div>
              <div className="p-4">
                <p className="text-sm text-white/40 mb-3">Recent searches</p>
                <div className="space-y-2">
                  {['Build kanban board', 'Review agent PR', 'Glass component'].map((term) => (
                    <button
                      key={term}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left text-white/70 hover:text-white"
                    >
                      <Search className="w-4 h-4 text-white/30" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
