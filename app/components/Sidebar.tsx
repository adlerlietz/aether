'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Search, 
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { agents } from '@/app/data';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { id: 'board', icon: Sparkles, label: 'Board', href: '/' },
  { id: 'agents', icon: Users, label: 'Agents', href: '/agents' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', href: '/calendar' },
  { id: 'memory', icon: Search, label: 'Memory', href: '/memory' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { id: 'review', icon: ShieldCheck, label: 'Review', href: '/review' },
  { id: 'terminal', icon: Terminal, label: 'Terminal', href: '/terminal' },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div 
      className="sidebar flex flex-col transition-all duration-300"
      style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 w-6 h-6 rounded-full glass flex items-center justify-center text-white/60 hover:text-white"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-blue-500 flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
          Æ
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-lg text-white/90">Aether</h1>
            <p className="text-xs text-white/40">Mission Control</p>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20' 
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Pinned Agents */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-white/5">
          <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">
            Active Agents
          </h3>
          <div className="space-y-2">
            {agents.slice(0, 3).map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <span className="text-xl">{agent.avatar}</span>
                  <div className={`
                    absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900
                    ${agent.status === 'online' ? 'bg-green-500' : ''}
                    ${agent.status === 'busy' ? 'bg-[var(--accent)]' : ''}
                    ${agent.status === 'away' ? 'bg-yellow-500' : ''}
                    ${agent.status === 'offline' ? 'bg-gray-500' : ''}
                  `} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">{agent.name}</p>
                  <p className="text-xs text-white/40 truncate">{agent.currentTask || 'Idle'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">Adler</p>
              <p className="text-xs text-white/40 truncate">Commander</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
