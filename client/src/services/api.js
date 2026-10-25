// Centralized API Client Module (ICTAK Guide Section 7.2)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('edutrack_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.errors = data.errors || [];
      throw error;
    }

    return data;
  } catch (error) {
    // If backend connection fails completely (e.g. network down)
    if (!error.status) {
      error.message = 'Unable to reach the server. Please check your connection.';
    }
    throw error;
  }
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me', { method: 'GET' }),
};

export const coursesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.level && params.level !== 'All') query.append('level', params.level);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/courses${queryString}`, { method: 'GET' });
  },
  getById: (id) => request(`/courses/${id}`, { method: 'GET' }),
  create: (courseData) => request('/courses', { method: 'POST', body: courseData }),
  update: (id, courseData) => request(`/courses/${id}`, { method: 'PUT', body: courseData }),
  delete: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
};

export const enrollmentsApi = {
  enroll: (courseId) => request('/enrollments', { method: 'POST', body: { courseId } }),
  getMyEnrollments: () => request('/enrollments/my', { method: 'GET' }),
  getCourseEnrollments: (courseId) => request(`/enrollments/course/${courseId}`, { method: 'GET' }),
  updateGrade: (id, data) => request(`/enrollments/${id}/grade`, { method: 'PATCH', body: data }),
  drop: (id) => request(`/enrollments/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  getStudents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/users/students${queryString}`, { method: 'GET' });
  },
  getInstructors: () => request('/users/instructors', { method: 'GET' }),
};

export const dashboardApi = {
  getStats: () => request('/dashboard/stats', { method: 'GET' }),
};
