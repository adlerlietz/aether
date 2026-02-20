export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'inbox' | 'assigned' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedAgentId?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Fix auth bug in API',
    description: 'Users reporting 401 errors on token refresh',
    status: 'in-progress',
    priority: 'high',
    assignedAgentId: 'coder',
    dueDate: '2024-02-20',
    createdAt: '2024-02-19',
  },
  {
    id: '2',
    title: 'Research OpenAI API changes',
    description: 'Check new model releases and pricing',
    status: 'assigned',
    priority: 'medium',
    assignedAgentId: 'researcher',
    dueDate: '2024-02-21',
    createdAt: '2024-02-19',
  },
  {
    id: '3',
    title: 'Document agent swarm protocol',
    description: 'Write up delegation and communication patterns',
    status: 'backlog',
    priority: 'low',
    assignedAgentId: 'planner',
    createdAt: '2024-02-19',
  },
  {
    id: '4',
    title: 'Monitor server health',
    description: 'Daily check: CPU, RAM, disk usage',
    status: 'done',
    priority: 'medium',
    assignedAgentId: 'monitor',
    createdAt: '2024-02-18',
  },
  {
    id: '5',
    title: 'Review PR: mobile responsive',
    description: 'Check responsive layout on iPhone',
    status: 'review',
    priority: 'high',
    assignedAgentId: 'main',
    dueDate: '2024-02-19',
    createdAt: '2024-02-19',
  },
  {
    id: '6',
    title: 'Update agent roster in Aether',
    description: 'Add Charles, Dexter, Oliver, Henry, Victor',
    status: 'done',
    priority: 'high',
    assignedAgentId: 'main',
    createdAt: '2024-02-18',
  },
  {
    id: '7',
    title: 'Refactor: Glass component',
    description: 'Extract reusable glass card variants',
    status: 'inbox',
    priority: 'medium',
    createdAt: '2024-02-19',
  },
  {
    id: '8',
    title: 'Set up Convex backend',
    description: 'Deploy schema and configure auth',
    status: 'backlog',
    priority: 'high',
    assignedAgentId: 'coder',
    createdAt: '2024-02-19',
  },
];
