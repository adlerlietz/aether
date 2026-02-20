'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, CheckCircle } from 'lucide-react';

interface SpawnAgentButtonProps {
  agentId: string;
  agentName: string;
  onSpawn?: () => void;
  size?: 'sm' | 'md';
}

export function SpawnAgentButton({ agentId, agentName, onSpawn, size = 'md' }: SpawnAgentButtonProps) {
  const [isSpawning, setIsSpawning] = useState(false);
  const [isSpawned, setIsSpawned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSpawn = async () => {
    setIsSpawning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to spawn agent');
      }

      setIsSpawned(true);
      onSpawn?.();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSpawned(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSpawning(false);
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-2 text-sm';

  if (isSpawned) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-1.5 ${sizeClasses} rounded-lg bg-green-500/20 text-green-400`}
      >
        <CheckCircle className="w-4 h-4" />
        <span>Spawned</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleSpawn}
      disabled={isSpawning}
      className={`flex items-center gap-1.5 ${sizeClasses} rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition-colors disabled:opacity-50`}
    >
      {isSpawning ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Spawning...</span>
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          <span>Spawn {agentName}</span>
        </>
      )}
    </motion.button>
  );
}
