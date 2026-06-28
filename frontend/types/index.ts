export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: 'to_be_done' | 'in_progress' | 'done';
  priority: TodoPriority;
  dueDate: string;
  completedAt: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TodoFilters {
  status?: 'to_be_done' | 'in_progress' | 'done';
  search?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}