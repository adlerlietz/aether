'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Terminal, 
  Palette, 
  Save,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Server,
  Send,
  Trash2
} from 'lucide-react';

// Real Terminal Component
function RealTerminal() {
  const [history, setHistory] = useState<Array<{type: 'prompt' | 'output' | 'error', text: string}>>([
    { type: 'output', text: 'Aether Terminal v1.0.0 - Connected to OpenClaw' },
    { type: 'output', text: 'Type "help" for available commands or "openclaw status" to check gateway.' },
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [cwd, setCwd] = useState('~');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Fetch shell info on mount
  useEffect(() => {
    fetch('/api/terminal')
      .then(r => r.json())
      .then(data => {
        if (data.home) setCwd(data.home.replace(/^\/home\/|^\/Users\//, '~'));
      })
      .catch(() => {});
  }, []);

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    
    setIsExecuting(true);
    setHistory(prev => [...prev, { type: 'prompt', text: cmd }]);
    
    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, cwd }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        setHistory(prev => [...prev, { type: 'error', text: result.error }]);
      } else {
        if (result.stdout) {
          setHistory(prev => [...prev, { type: 'output', text: result.stdout }]);
        }
        if (result.stderr) {
          setHistory(prev => [...prev, { type: 'error', text: result.stderr }]);
        }
      }
    } catch (error) {
      setHistory(prev => [...prev, { type: 'error', text: 'Failed to execute command' }]);
    } finally {
      setIsExecuting(false);
      setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  return (
    <div className="glass overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">zsh — aether</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        className="p-4 h-80 overflow-y-auto font-mono text-sm bg-black/50"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, idx) => (
          <div key={idx} className="mb-1">
            {line.type === 'prompt' && (
              <div className="flex items-center gap-2">
                <span className="text-green-400">➜</span>
                <span className="text-cyan-400">{cwd}</span>
                <span className="text-white/80">{line.text}</span>
              </div>
            )}
            {line.type === 'output' && (
              <pre className="text-white/70 whitespace-pre-wrap pl-0">{line.text}</pre>
            )}
            {line.type === 'error' && (
              <pre className="text-red-400 whitespace-pre-wrap pl-0">{line.text}</pre>
            )}
          </div>
        ))}
        
        {/* Input Line */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <span className="text-green-400">➜</span>
          <span className="text-cyan-400">{cwd}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white/80 outline-none"
            placeholder={isExecuting ? 'Executing...' : 'Type command...'}
            disabled={isExecuting}
            autoFocus
          />
          {isExecuting && (
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
        </form>
        
        <div ref={bottomRef} />
      </div>

      {/* Quick Commands */}
      <div className="px-4 py-2 border-t border-white/10 bg-black/20">
        <div className="flex gap-2 overflow-x-auto">
          {['openclaw status', 'openclaw logs', 'clear', 'pwd', 'ls -la'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => executeCommand(cmd)}
              disabled={isExecuting}
              className="px-2 py-1 rounded bg-white/5 text-white/50 hover:text-white/80 text-xs whitespace-nowrap transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simplified settings view focused on terminal
export function SettingsView() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'models' | 'appearance'>('terminal');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Settings</h2>
          <p className="text-white/50 text-sm mt-1">Configure Aether and OpenClaw</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[
          { id: 'terminal', label: 'Terminal', icon: Terminal },
          { id: 'models', label: 'Models', icon: Key },
          { id: 'appearance', label: 'Appearance', icon: Palette },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === tab.id ? 'bg-cyan-500 text-black' : 'glass-light text-white/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'terminal' && (
        <div className="space-y-6">
          <div className="glass p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Built-in Terminal</h3>
            <p className="text-white/50 text-sm mb-4">
              Execute <code className="bg-white/10 px-1 rounded">openclaw</code> commands and shell commands directly. 
              All commands run on your local machine with your permissions.
            </p>
            <RealTerminal />
          </div>

          <div className="glass p-6">
            <h3 className="text-lg font-semibold text-white/90 mb-4">Available Commands</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-white/5">
                <code className="text-cyan-400">openclaw status</code>
                <p className="text-white/50 mt-1">Check gateway and session status</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <code className="text-cyan-400">openclaw logs</code>
                <p className="text-white/50 mt-1">View recent gateway logs</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <code className="text-cyan-400">openclaw agent list</code>
                <p className="text-white/50 mt-1">List configured agents</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <code className="text-cyan-400">openclaw gateway restart</code>
                <p className="text-white/50 mt-1">Restart the gateway service</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Model Configuration</h3>
          <p className="text-white/50">Configure API keys in your OpenClaw config:</p>
          <code className="block mt-4 p-4 rounded-xl bg-black/50 text-sm text-white/70">
            ~/.openclaw/config.jsonc
          </code>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="glass p-6">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Appearance</h3>
          <p className="text-white/50">Theme settings coming soon...</p>
        </div>
      )}
    </div>
  );
}
