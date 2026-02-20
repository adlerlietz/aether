'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Menu,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { id: 'board', icon: Sparkles, label: 'Board', href: '/' },
  { id: 'agents', icon: Users, label: 'Agents', href: '/agents' },
  { id: 'calendar', icon: Calendar, label: 'Calendar', href: '/calendar' },
];

interface MobileNavProps {
  onMenuClick: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Link 
            key={item.id} 
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.href)}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-[var(--accent-soft)]' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--accent)]' : 'text-white/50'}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--accent)]' : 'text-white/40'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-[var(--accent)]"
                />
              )}
            </motion.div>
          </Link>
        );
      })}
      
      {/* Menu Button */}
      <button 
        className="mobile-nav-item"
        onClick={onMenuClick}
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="p-2 rounded-xl">
            <Menu className="w-5 h-5 text-white/50" />
          </div>
          <span className="text-[10px] font-medium text-white/40">Menu</span>
        </motion.div>
      </button>
    </nav>
  );
}
