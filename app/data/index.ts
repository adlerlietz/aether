import { Column, Agent, Activity } from '@/app/types';

export const agents: Agent[] = [
  {
    id: '1',
    name: 'Claude',
    avatar: '🧠',
    role: 'Primary',
    status: 'online',
    currentTask: 'Explore Whisper codebase',
  },
  {
    id: '2',
    name: 'Molt',
    avatar: '🦞',
    role: 'Executive',
    status: 'busy',
    currentTask: 'Mission Control',
  },
  {
    id: '3',
    name: 'Helper',
    avatar: '🤖',
    role: 'Utility',
    status: 'online',
  },
  {
    id: '4',
    name: 'Coder',
    avatar: '💻',
    role: 'Development',
    status: 'away',
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
    message: 'Created task: "Build Kanban board"',
    agent: agents[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'a2',
    type: 'task_moved',
    message: 'Moved "Initialize project" to Done',
    agent: agents[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'a3',
    type: 'agent_action',
    message: 'Claude started working on UI components',
    agent: agents[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'a4',
    type: 'task_created',
    message: 'Completed task: "Explore Whisper codebase"',
    agent: agents[0],
    timestamp: new Date(),
  },
];
