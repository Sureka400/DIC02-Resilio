// API utility functions
const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  lastLogin?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ChatMessage {
  message: string;
  role: 'student' | 'teacher';
}

export interface ChatResponse {
  response: string;
}

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  register: async (name: string, email: string, password: string, role: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export const chatAPI = {
  sendMessage: async (message: string, role: 'student' | 'teacher'): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.response || errorData.message || 'Failed to send message');
    }

    return response.json();
  },
};

export const studentAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/students/profile`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/students/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  }
};

export const teacherAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/teachers/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  }
};

export const courseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  }
};