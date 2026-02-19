export type TaskStatus = 'inbox' | 'assigned' | 'in-progress' | 'review' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  currentTask?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Agent;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link' | 'code';
  url: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_moved' | 'task_completed' | 'agent_action' | 'comment';
  message: string;
  agent?: Agent;
  timestamp: Date;
  metadata?: Record<string, any>;
}
