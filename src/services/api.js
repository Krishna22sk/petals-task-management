// API Client for Petals Automation REST Backend
let rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
if (rawBaseUrl.endsWith('/')) {
  rawBaseUrl = rawBaseUrl.slice(0, -1);
}
if (!rawBaseUrl.endsWith('/api') && !rawBaseUrl.includes('/api/')) {
  rawBaseUrl += '/api';
}
const API_BASE_URL = rawBaseUrl;

// Helper to get stored JWT Token
const getAuthToken = () => {
  return localStorage.getItem('petals_jwt_token') || '';
};

// Generic fetch wrapper with automatic JWT header injection
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // If uploading FormData, remove Content-Type to let browser set boundary header
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_BASE_URL}${formattedEndpoint}`;
    
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      throw new Error(`Server endpoint [${fullUrl}] returned non-JSON response (${response.status}). Please verify VITE_API_URL in Netlify.`);
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status} Error`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${endpoint}]:`, error.message);
    throw error;
  }
};

export const api = {
  // 1. Authentication
  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('petals_jwt_token', data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore logout token invalidation errors
    } finally {
      localStorage.removeItem('petals_jwt_token');
    }
  },

  getCurrentUser: () => apiFetch('/auth/me'),
  updateProfile: (data) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // 2. Tasks
  getTasks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  getTaskById: (id) => apiFetch(`/tasks/${id}`),

  createTask: (taskData) =>
    apiFetch('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  updateTask: (id, taskData) =>
    apiFetch(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }),

  updateTaskStatus: (id, status) =>
    apiFetch(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateTaskPriority: (id, priority) =>
    apiFetch(`/tasks/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    }),

  deleteTask: (id) =>
    apiFetch(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  addComment: (taskId, commentText) =>
    apiFetch(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: commentText }),
    }),

  addAttachment: (taskId, formData) =>
    apiFetch(`/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    }),

  trackTime: (taskId, duration) =>
    apiFetch(`/tasks/${taskId}/time-tracking`, {
      method: 'POST',
      body: JSON.stringify({ duration }),
    }),

  // 3. Projects
  getProjects: () => apiFetch('/projects'),

  createProject: (projectData) =>
    apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  updateProject: (id, projectData) =>
    apiFetch(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  deleteProject: (id) =>
    apiFetch(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // 4. Employees
  getEmployees: () => apiFetch('/employees'),

  createEmployee: (employeeData) =>
    apiFetch('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    }),

  updateEmployee: (id, employeeData) =>
    apiFetch(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    }),

  deleteEmployee: (id) =>
    apiFetch(`/employees/${id}`, {
      method: 'DELETE',
    }),

  // 5. Notifications & Queries
  getNotifications: () => apiFetch('/notifications'),

  markNotificationsRead: () =>
    apiFetch('/notifications/mark-read', {
      method: 'PATCH',
    }),

  getQueries: () => apiFetch('/queries'),

  submitQuery: (queryData) =>
    apiFetch('/queries', {
      method: 'POST',
      body: JSON.stringify(queryData),
    }),

  replyQuery: (id, replyText) =>
    apiFetch(`/queries/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ replyText }),
    }),

  // 6. Reports & Activity Logs
  getDashboardSummary: () => apiFetch('/reports/dashboard'),
  getActivityLogs: () => apiFetch('/activity-logs'),
  globalSearch: (q) => apiFetch(`/search?q=${encodeURIComponent(q)}`),
};
