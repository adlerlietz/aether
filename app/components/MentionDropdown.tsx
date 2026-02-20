'use client';

import { useState, useRef, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  emoji: string;
}

const agents: Agent[] = [
  { id: 'main', name: 'Charles', emoji: '🦞' },
  { id: 'coder', name: 'Dexter', emoji: '⚡' },
  { id: 'researcher', name: 'Oliver', emoji: '🔍' },
  { id: 'planner', name: 'Henry', emoji: '📐' },
  { id: 'monitor', name: 'Victor', emoji: '👁️' }
];

interface MentionDropdownProps {
  onSelect: (markdown: string) => void;
  position: { top: number; left: number };
}

export function MentionDropdown({ onSelect, position }: MentionDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (agent: Agent) => {
    onSelect(`[@${agent.name}](/agents/${agent.id})`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onSelect('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelect]);

  // Adjust position to stay on screen
  const adjustedPosition = {
    top: Math.min(position.top, window.innerHeight - 200),
    left: Math.min(position.left, window.innerWidth - 280),
  };

  return (
    <div 
      ref={dropdownRef}
      className="fixed z-50 glass p-2 w-64 max-h-60 overflow-auto"
      style={{ top: adjustedPosition.top, left: adjustedPosition.left }}
    >
      <input
        type="text"
        className="w-full p-2 mb-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 outline-none focus:border-[var(--accent)]/50"
        placeholder="Search agents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus
      />
      <ul className="space-y-1">
        {filteredAgents.map((agent) => (
          <li
            key={agent.id}
            className="p-2 rounded-lg hover:bg-white/10 cursor-pointer flex items-center gap-3 text-white/80 hover:text-white transition-colors"
            onClick={() => handleSelect(agent)}
          >
            <span className="text-lg">{agent.emoji}</span>
            <span className="text-sm">{agent.name}</span>
          </li>
        ))}
        {filteredAgents.length === 0 && (
          <li className="p-2 text-white/40 text-sm">No agents found</li>
        )}
      </ul>
    </div>
  );
}
