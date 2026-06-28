const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('taskflow_token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

// Auth
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request('/auth/me'),
};

// Todos
export const todosApi = {
  getAll: (filters?: Record<string, string>) => {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return request(`/todos${params}`);
  },

  create: (title: string, description?: string, priority?: string, dueDate?: string | null, status?: string) =>
    request('/todos', {
      method: 'POST',
      body: JSON.stringify({ title, description, priority, dueDate, status }),
    }),

  update: (id: string, data: { title?: string; description?: string; priority?: string; dueDate?: string | null }) =>
    request(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: string) =>
    request(`/todos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request(`/todos/${id}`, { method: 'DELETE' }),
};

// Profile
export const profileApi = {
  get: () => request('/profile'),

  update: (data: { name?: string; email?: string }) =>
    request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request('/profile/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  deleteAccount: () =>
    request('/profile', { method: 'DELETE' }),
};