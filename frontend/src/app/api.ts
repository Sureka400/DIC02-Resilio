// API utility functions
const API_BASE_URL = '/api';

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string; role: 'student' | 'teacher' | 'admin' }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || (data.errors && data.errors[0].msg) || 'Registration failed');
    }

    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || (data.errors && data.errors[0].msg) || 'Login failed');
    }

    const data = await response.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  getProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get profile');
    }

    return response.json();
  },
};

// Course API
export const courseAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!response.ok) throw new Error('Failed to fetch course details');
    return response.json();
  },

  join: async (classCode: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/courses/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ classCode }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to join course');
    }
    return response.json();
  },

  getAssignments: async (courseId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  getMaterials: async (courseId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/materials`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch materials');
    return response.json();
  },
};

// Teacher API
export const teacherAPI = {
  getDashboard: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  getCourses: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  getProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  createCourse: async (courseData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to create course');
    }
    return response.json();
  },

  createAssignment: async (courseId: string, assignmentData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/courses/${courseId}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(assignmentData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Failed to create assignment');
    }
    return response.json();
  },

  getAssignments: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  deleteCourse: async (courseId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete course');
    }
    return response.json();
  },

  uploadMaterial: async (courseId: string, materialData: { title: string; description: string; file?: File | null; url?: string }) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('title', materialData.title);
    formData.append('description', materialData.description);
    if (materialData.file) {
      formData.append('file', materialData.file);
    }
    if (materialData.url) {
      formData.append('url', materialData.url);
    }
    
    const response = await fetch(`${API_BASE_URL}/teachers/courses/${courseId}/materials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload material');
    }
    return response.json();
  },

  getMaterials: async (courseId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/courses/${courseId}/materials`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch materials');
    return response.json();
  },

  deleteMaterial: async (materialId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/teachers/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete material');
    }
    return response.json();
  },
};

// Student API
export const studentAPI = {
  getDashboard: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch student dashboard');
    return response.json();
  },

  getCourses: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },

  getProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    return response.json();
  },

  getAssignments: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  submitAssignment: async (assignmentId: string, submissionData: any) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(submissionData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit assignment');
    }
    return response.json();
  },

  getGrades: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/students/grades`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch grades');
    return response.json();
  },
  
  getBehavior: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/behavior`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch behavior data');
    return response.json();
  },

  getPsychoProfile: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch psycho-educational profile');
    return response.json();
  },
};

export interface ChatMessage {
  message: string;
  role: 'student' | 'teacher';
}

export interface ChatResponse {
  response: string;
}

export const chatAPI = {
  sendMessage: async (message: string, role: 'student' | 'teacher'): Promise<ChatResponse> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ message, role }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      } catch (e) {
        if (e instanceof Error) {
          throw e;
        }
        throw new Error(`Server error: ${response.status}`);
      }
    }

    return response.json();
  },
};