import { Column, Agent, Activity } from '@/app/types';

export const agents: Agent[] = [
  {
    id: '1',
    name: 'Claude',
    avatar: '🧠',
    role: 'Primary',
    status: 'online',
    currentTask: 'Available',
  },
  {
    id: '2',
    name: 'Molt',
    avatar: '🦞',
    role: 'Executive',
    status: 'busy',
    currentTask: 'Mission Control & Aether deployment',
  },
  {
    id: '3',
    name: 'Helper',
    avatar: '🤖',
    role: 'Utility',
    status: 'online',
    currentTask: 'Available',
  },
  {
    id: '4',
    name: 'Coder',
    avatar: '💻',
    role: 'Development',
    status: 'busy',
    currentTask: 'Whisperish iOS security audit',
  },
];

export const initialColumns: Column[] = [
  {
    id: 'inbox',
    title: 'Inbox',
    tasks: [
      {
        id: 't1',
        title: 'Design glass card component',
        description: 'Create reusable glassmorphism card with hover effects',
        status: 'inbox',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['ui', 'design'],
      },
      {
        id: 't2',
        title: 'Setup Convex backend',
        description: 'Initialize Convex project for real-time sync',
        status: 'inbox',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['backend'],
      },
    ],
  },
  {
    id: 'assigned',
    title: 'Assigned',
    tasks: [
      {
        id: 'whisperish-review',
        title: 'Code Review: Whisperish iOS App',
        description: 'Comprehensive security audit and App Store readiness evaluation. Review Swift 6 architecture, ChaChaPoly encryption, Supabase backend, 48h TTL, spatial messaging. Location: ~/Desktop/whisperish-repo/Echo',
        status: 'assigned',
        priority: 'high',
        assignee: agents[3], // Coder
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['code-review', 'ios', 'security', 'app-store'],
      },
    ],
  },
  {
    id: 'assigned',
    title: 'Assigned',
    tasks: [
      {
        id: 't3',
        title: 'Review PR: Glass system',
        status: 'assigned',
        priority: 'medium',
        assignee: agents[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['review'],
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: 't4',
        title: 'Build Kanban board',
        description: 'Drag and drop columns with glass styling',
        status: 'in-progress',
        priority: 'high',
        assignee: agents[1],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['feature', 'kanban'],
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: 't5',
        title: 'Initialize project',
        status: 'done',
        priority: 'low',
        assignee: agents[1],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['setup'],
      },
      {
        id: 't6',
        title: 'Explore Whisper codebase',
        description: 'Analyze Echo/Whisperish iOS app architecture: Swift 6, Supabase, H3 spatial, CryptoKit, 48h TTL',
        status: 'done',
        priority: 'medium',
        assignee: agents[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['research', 'code-review'],
      },
    ],
  },
];

export const recentActivity: Activity[] = [
  {
    id: 'a1',
    type: 'task_created',
    message: 'Created task: "Code Review: Whisperish iOS App"',
    agent: agents[1],
    timestamp: new Date(Date.now() - 1000 * 30),
  },
  {
    id: 'a2',
    type: 'agent_action',
    message: 'ClodBot assigned to Whisperish security audit',
    agent: agents[3],
    timestamp: new Date(Date.now() - 1000 * 25),
  },
  {
    id: 'a3',
    type: 'task_created',
    message: 'Aether deployed to Vercel production',
    agent: agents[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'a4',
    type: 'agent_action',
    message: 'Molt created Aether documentation',
    agent: agents[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
];
