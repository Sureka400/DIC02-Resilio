// API utility functions
const API_BASE_URL = '/api';

export interface ChatMessage {
  message: string;
  role: 'student' | 'teacher';
}

export interface ChatResponse {
  response: string;
}

export const chatAPI = {
  sendMessage: async (message: string, role: 'student' | 'teacher'): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authorization header when auth is implemented
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, role }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.response || errorData.message || 'Failed to send message');
    }

    return response.json();
  },
};