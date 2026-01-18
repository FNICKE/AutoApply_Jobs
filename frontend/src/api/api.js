// src/api/api.js
// Last updated: Improved consistency in error handling/logging, added validation in applyJob,
// structured console output for easier debugging, minor cleanups

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 12000,           // slightly increased - 12 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // uncomment if you switch to cookie-based auth later
});

// ────────────────────────────────────────────────
// Request interceptor - attach JWT if available
// ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Request Interceptor] Error:', error);
    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────
// Response interceptor - common error patterns
// ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.warn('[API] Request timed out. Is backend running?');
    } else if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized → clearing token & redirecting');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.warn('[API] 403 Forbidden - check permissions or token role');
    } else if (error.response?.status >= 500) {
      console.error('[API] Server error (5xx). Check backend logs.');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('[API] Network failure - backend offline or CORS issue?');
    }

    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────
// Auth
// ────────────────────────────────────────────────
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('[login] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('[register] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  } catch (error) {
    console.error('[logout] Failed:', error.response?.data || error.message);
    localStorage.removeItem('token');
    throw error;
  }
};

// ────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────
export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('[getProfile] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('[updateProfile] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export const addSkills = async (skillsData) => {
  try {
    const { skills } = skillsData;
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new Error('Skills must be a non-empty array');
    }
    const response = await api.post('/users/skills', { skills });
    return response.data;
  } catch (error) {
    console.error('[addSkills] Failed:', error.response?.data || error.message);
    throw error;
  }
};

// ────────────────────────────────────────────────
// Jobs
// ────────────────────────────────────────────────
export const getJobs = async (params = {}) => {
  try {
    const response = await api.get('/jobs', { params });
    return response.data; // expected: { jobs: [], total: number, ... }
  } catch (error) {
    console.error('[getJobs] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getJobMatches = async (params = {}) => {
  try {
    if (!params || typeof params !== 'object') {
      throw new Error('getJobMatches: params must be an object');
    }
    const response = await api.get('/jobs/matches', { params });
    return response.data;
  } catch (error) {
    console.error('[getJobMatches] Failed (full error):', error);
    throw error;
  }
};

export const autoApplyJobs = async (maxApps = 30, role = 'all') => {
  try {
    const response = await api.post('/jobs/auto-apply', { maxApps, role });
    return response.data;
  } catch (error) {
    console.error('[autoApplyJobs] Failed:', error.response?.data || error.message);
    throw error;
  }
};

// ────────────────────────────────────────────────
// Applications
// ────────────────────────────────────────────────
export const applyJob = async (jobId) => {
  try {
    if (!jobId) {
      throw new Error('applyJob: jobId is required');
    }
    if (typeof jobId !== 'number' && typeof jobId !== 'string') {
      throw new Error('applyJob: jobId should be number or string');
    }

    const response = await api.post('/applications/apply', { job_id: jobId });
    return response.data;
  } catch (error) {
    console.error('[applyJob] Failed:', {
      jobId,
      status: error.response?.status,
      serverMessage: error.response?.data?.message,
      errorMessage: error.message,
    });
    throw error;
  }
};

export const getApplications = async () => {
  try {
    const response = await api.get('/applications');
    return response.data;
  } catch (error) {
    console.error('[getApplications] Failed (full):', error.response?.data || error);
    throw error;
  }
};

export const updateStatus = async (appId, status) => {
  try {
    if (!appId || !status) {
      throw new Error('updateStatus: appId and status are required');
    }
    const response = await api.put(`/applications/${appId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('[updateStatus] Failed:', error.response?.data || error.message);
    throw error;
  }
};

// ────────────────────────────────────────────────
// Resume
// ────────────────────────────────────────────────
export const uploadResume = async (formData) => {
  try {
    const response = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 45000, // longer timeout for file uploads
    });
    return response.data;
  } catch (error) {
    console.error('[uploadResume] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getResume = async () => {
  try {
    const response = await api.get('/resumes');
    return response.data;
  } catch (error) {
    console.error('[getResume] Failed:', error.response?.data || error.message);
    throw error;
  }
};

export default api;