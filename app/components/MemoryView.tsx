'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  Brain,
  Clock,
  MoreHorizontal,
  Filter,
  BookOpen,
  Share2,
  Sparkles,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface Memory {
  id: string;
  type: 'task' | 'chat' | 'document' | 'vector';
  title: string;
  content: string;
  agent?: string;
  timestamp: Date;
  tags: string[];
  relevance?: number;
}

interface Document {
  id: string;
  title: string;
  type: 'note' | 'code' | 'link' | 'image';
  content: string;
  updatedAt: Date;
  connections: number;
}

const mockMemories: Memory[] = [
  {
    id: '1',
    type: 'chat',
    title: 'Building Aether UI discussion',
    content: 'We discussed using iOS Liquid Glass design with 32px blur and cyan accents...',
    agent: 'Claude',
    timestamp: new Date(Date.now() - 3600000),
    tags: ['design', 'aether', 'ui'],
    relevance: 0.95,
  },
  {
    id: '2',
    type: 'task',
    title: 'Implement Kanban board',
    content: 'Created drag-and-drop kanban with 5 columns: Inbox, Assigned, In Progress, Review, Done',
    agent: 'Molt',
    timestamp: new Date(Date.now() - 7200000),
    tags: ['feature', 'kanban'],
    relevance: 0.88,
  },
  {
    id: '3',
    type: 'document',
    title: 'Mission Control Spec',
    content: 'Full specification for Aether - iOS Liquid Glass mission control dashboard...',
    timestamp: new Date(Date.now() - 86400000),
    tags: ['spec', 'planning'],
    relevance: 0.82,
  },
  {
    id: '4',
    type: 'vector',
    title: 'Agent memory: User preferences',
    content: 'User prefers terse communication, bullet points over paragraphs...',
    agent: 'Helper',
    timestamp: new Date(Date.now() - 172800000),
    tags: ['preferences', 'memory'],
    relevance: 0.75,
  },
];

const mockDocuments: Document[] = [
  { id: '1', title: 'Aether Design System', type: 'note', content: 'Glassmorphism specs...', updatedAt: new Date(), connections: 12 },
  { id: '2', title: 'API Integration Guide', type: 'code', content: 'How to connect...', updatedAt: new Date(Date.now() - 86400000), connections: 8 },
  { id: '3', title: 'Project Roadmap', type: 'link', content: 'https://...', updatedAt: new Date(Date.now() - 172800000), connections: 5 },
  { id: '4', title: 'Architecture Diagram', type: 'image', content: 'diagram.png', updatedAt: new Date(Date.now() - 259200000), connections: 15 },
];

const typeIcons = {
  task: Sparkles,
  chat: MessageSquare,
  document: FileText,
  vector: Brain,
};

const typeColors = {
  task: 'text-cyan-400 bg-cyan-500/20',
  chat: 'text-purple-400 bg-purple-500/20',
  document: 'text-yellow-400 bg-yellow-500/20',
  vector: 'text-green-400 bg-green-500/20',
};

function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredMemories = mockMemories.filter(m => 
    (activeFilter ? m.type === activeFilter : true) &&
    (query ? m.title.toLowerCase().includes(query.toLowerCase()) || 
              m.content.toLowerCase().includes(query.toLowerCase()) : true)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl glass overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
              <Search className="w-6 h-6 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search memories, tasks, conversations..."
                className="flex-1 bg-transparent text-xl text-white placeholder:text-white/30 outline-none"
                autoFocus
              />
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5">
              <Filter className="w-4 h-4 text-white/40 mr-2" />
              {['all', 'task', 'chat', 'document', 'vector'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter === 'all' ? null : filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    (filter === 'all' && !activeFilter) || activeFilter === filter
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-4">
              {filteredMemories.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No memories found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMemories.map((memory, idx) => {
                    const Icon = typeIcons[memory.type];
                    return (
                      <motion.button
                        key={memory.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeColors[memory.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white/90">{memory.title}</h4>
                              {memory.relevance && (
                                <span className="text-xs text-cyan-400">
                                  {Math.round(memory.relevance * 100)}% match
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-white/50 line-clamp-2 mb-2">
                              {memory.content}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              {memory.agent && (
                                <span className="text-white/40">{memory.agent}</span>
                              )}
                              <span className="text-white/30">
                                {format(memory.timestamp, 'MMM d, h:mm a')}
                              </span>
                              <div className="flex gap-1">
                                {memory.tags.map((tag) => (
                                  <span key={tag} className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-white/5">
              <span className="text-xs text-white/40">
                {filteredMemories.length} memories
              </span>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DocumentCard({ doc, index }: { doc: Document; index: number }) {
  const typeIcons = {
    note: FileText,
    code: FileText,
    link: Share2,
    image: FileText,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-light p-4 hover:scale-[1.02] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-white/5">
          {(() => {
            const Icon = typeIcons[doc.type];
            return <Icon className="w-5 h-5 text-white/60" />;
          })()}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
          <MoreHorizontal className="w-4 h-4 text-white/40" />
        </button>
      </div>
      
      <h4 className="font-medium text-white/90 mb-1 truncate">{doc.title}</h4>
      <p className="text-xs text-white/40 mb-3 line-clamp-2">{doc.content}</p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/30">{format(doc.updatedAt, 'MMM d')}</span>
        <span className="flex items-center gap-1 text-cyan-400">
          <Share2 className="w-3 h-3" />
          {doc.connections} links
        </span>
      </div>
    </motion.div>
  );
}

function MemoryGraph() {
  // Simple visual representation of memory connections
  const nodes = [
    { id: 1, x: 50, y: 50, label: 'Aether', size: 40 },
    { id: 2, x: 150, y: 80, label: 'UI', size: 30 },
    { id: 3, x: 100, y: 150, label: 'Kanban', size: 35 },
    { id: 4, x: 200, y: 120, label: 'Agents', size: 32 },
    { id: 5, x: 180, y: 200, label: 'Tasks', size: 28 },
    { id: 6, x: 80, y: 220, label: 'Glass', size: 25 },
  ];

  return (
    <div className="glass p-6 relative overflow-hidden">
      <h3 className="text-lg font-semibold text-white/90 mb-4">Memory Graph</h3>
      <div className="relative h-64 w-full">
        <svg className="absolute inset-0 w-full h-full">
          {/* Connections */}
          <line x1="50" y1="50" x2="150" y2="80" stroke="rgba(0,245,255,0.3)" strokeWidth="1" />
          <line x1="50" y1="50" x2="100" y2="150" stroke="rgba(0,245,255,0.3)" strokeWidth="1" />
          <line x1="150" y1="80" x2="200" y2="120" stroke="rgba(0,245,255,0.2)" strokeWidth="1" />
          <line x1="100" y1="150" x2="180" y2="200" stroke="rgba(147,51,234,0.3)" strokeWidth="1" />
          <line x1="100" y1="150" x2="80" y2="220" stroke="rgba(147,51,234,0.3)" strokeWidth="1" />
          <line x1="200" y1="120" x2="180" y2="200" stroke="rgba(147,51,234,0.2)" strokeWidth="1" />
        </svg>
        
        {/* Nodes */}
        {nodes.map((node) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: node.id * 0.1 }}
            className="absolute rounded-full glass flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: node.x,
              top: node.y,
              width: node.size * 2,
              height: node.size * 2,
              marginLeft: -node.size,
              marginTop: -node.size,
            }}
          >
            <span className="text-xs font-medium text-white/80">{node.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function MemoryView() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'graph'>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white/90">Memory & Knowledge</h2>
          <p className="text-white/50 text-sm mt-1">
            Search and explore agent memories
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['all', 'documents', 'graph'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors capitalize ${
                  activeTab === tab ? 'bg-white/10 text-white' : 'text-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setSearchOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-medium text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Memories */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white/90">Recent Memories</h3>
            {mockMemories.map((memory, idx) => {
              const Icon = typeIcons[memory.type];
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-4 hover:border-white/20 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${typeColors[memory.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white/90">{memory.title}</h4>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-white/40" />
                        </button>
                      </div>
                      <p className="text-sm text-white/50 mb-2">{memory.content}</p>
                      <div className="flex items-center gap-3 text-xs">
                        {memory.agent && (
                          <span className="text-white/40">{memory.agent}</span>
                        )}
                        <span className="text-white/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(memory.timestamp, 'MMM d')}
                        </span>
                        <div className="flex gap-1">
                          {memory.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MemoryGraph />
            
            <div className="glass p-6">
              <h3 className="text-lg font-semibold text-white/90 mb-4">Daily Journal</h3>
              <div className="space-y-3">
                <p className="text-sm text-white/60">
                  Today we built out Features 1-5 of Aether. The glassmorphism UI is looking great.
                </p>
                <button className="w-full py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-colors text-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ask agent to remember this
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <h3 className="text-lg font-semibold text-white/90 mb-4">Document Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockDocuments.map((doc, idx) => (
              <DocumentCard key={doc.id} doc={doc} index={idx} />
            ))}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: mockDocuments.length * 0.1 }}
              className="glass-light border-dashed border-2 border-white/20 flex flex-col items-center justify-center gap-3 p-6 min-h-[180px] text-white/40 hover:text-white/70 hover:border-white/40 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="font-medium">New Document</span>
            </motion.button>
          </div>
        </div>
      )}

      {activeTab === 'graph' && (
        <div className="glass p-8">
          <h3 className="text-lg font-semibold text-white/90 mb-6">Knowledge Graph</h3>
          <div className="relative h-96 w-full">
            <svg className="absolute inset-0 w-full h-full">
              {/* Animated connections */}
              {[...Array(10)].map((_, i) => (
                <motion.line
                  key={i}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  x1={Math.random() * 100 + '%'}
                  y1={Math.random() * 100 + '%'}
                  x2={Math.random() * 100 + '%'}
                  y2={Math.random() * 100 + '%'}
                  stroke="rgba(0,245,255,0.3)"
                  strokeWidth="1"
                />
              ))}
            </svg>
            
            {/* Floating nodes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  x: [0, 20, -20, 0],
                  y: [0, -20, 20, 0],
                }}
                transition={{ 
                  scale: { delay: i * 0.1 },
                  x: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                }}
                className="absolute w-16 h-16 rounded-full glass flex items-center justify-center"
                style={{
                  left: `${15 + (i % 4) * 25}%`,
                  top: `${20 + Math.floor(i / 4) * 50}%`,
                }}
              >
                <span className="text-xs text-white/70">{['Task', 'Agent', 'Doc', 'Chat'][i % 4]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
