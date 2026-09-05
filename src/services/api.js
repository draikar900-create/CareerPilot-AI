import { supabase } from '../utils/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to execute API requests with Supabase JWT access token attached.
 */
async function fetchWithAuth(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get active session from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const responseData = await response.json().catch(() => ({
    success: false,
    message: `Server returned HTTP ${response.status}`
  }));

  if (!response.ok) {
    if (response.status === 401) {
      console.warn('Unauthorized request - session may be expired.');
    }
    throw new Error(responseData.message || `Request failed with status ${response.status}`);
  }

  return responseData;
}

export const apiService = {
  // Auth API
  login: async (identifier, password) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  },

  signup: async (formData) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  verifyOtp: async (payload) => {
    return fetchWithAuth('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  forgotPassword: async (email) => {
    return fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Student Profile
  getProfile: async () => {
    return fetchWithAuth('/profile', { method: 'GET' });
  },

  updateProfile: async (profileData) => {
    return fetchWithAuth('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Dashboard & Career
  getDashboard: async () => {
    return fetchWithAuth('/dashboard', { method: 'GET' });
  },

  getCareerGoal: async () => {
    return fetchWithAuth('/career-goal', { method: 'GET' });
  },

  setCareerGoal: async (goalData) => {
    return fetchWithAuth('/career-goal', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  },

  getRoadmap: async () => {
    return fetchWithAuth('/roadmap', { method: 'GET' });
  },

  generateRoadmap: async (targetRole) => {
    return fetchWithAuth('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({ targetRole })
    });
  },

  getSkillInsights: async () => {
    return fetchWithAuth('/skill-insights', { method: 'GET' });
  },

  getProgress: async () => {
    return fetchWithAuth('/progress', { method: 'GET' });
  },

  getNotifications: async () => {
    return fetchWithAuth('/notifications', { method: 'GET' });
  },

  // Companies
  getCompanies: async () => {
    return fetchWithAuth('/companies', { method: 'GET' });
  },

  getCompanyById: async (id) => {
    return fetchWithAuth(`/companies/${id}`, { method: 'GET' });
  },

  createCompany: async (companyData) => {
    return fetchWithAuth('/admin/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  },

  deleteCompany: async (id) => {
    return fetchWithAuth(`/admin/companies/${id}`, { method: 'DELETE' });
  },

  // Internships
  getInternships: async () => {
    return fetchWithAuth('/internships', { method: 'GET' });
  },

  getInternshipById: async (id) => {
    return fetchWithAuth(`/internships/${id}`, { method: 'GET' });
  },

  createInternship: async (data) => {
    return fetchWithAuth('/admin/internships', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Jobs
  getJobs: async () => {
    return fetchWithAuth('/jobs', { method: 'GET' });
  },

  getJobById: async (id) => {
    return fetchWithAuth(`/jobs/${id}`, { method: 'GET' });
  },

  createJob: async (data) => {
    return fetchWithAuth('/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateJob: async (id, data) => {
    return fetchWithAuth(`/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteJob: async (id) => {
    return fetchWithAuth(`/admin/jobs/${id}`, {
      method: 'DELETE'
    });
  },

  // Applications
  applyOpportunity: async (payload) => {
    return fetchWithAuth('/applications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getMyApplications: async () => {
    return fetchWithAuth('/applications/me', { method: 'GET' });
  },

  getAdminApplications: async () => {
    return fetchWithAuth('/admin/applications', { method: 'GET' });
  },

  updateApplicationStatus: async (id, status) => {
    return fetchWithAuth(`/admin/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Saved Opportunities
  getSavedOpportunities: async () => {
    return fetchWithAuth('/saved-opportunities', { method: 'GET' });
  },

  saveOpportunity: async (payload) => {
    return fetchWithAuth('/saved-opportunities', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Events
  getEvents: async () => {
    return fetchWithAuth('/events', { method: 'GET' });
  },

  createEvent: async (eventData) => {
    return fetchWithAuth('/admin/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  // File Uploads
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      },
      body: formData
    });
    return response.json();
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${API_BASE_URL}/upload/resume`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      },
      body: formData
    });
    return response.json();
  },

  // AI Chat
  sendAIChat: async (message) => {
    return fetchWithAuth('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // Admin APIs
  getAdminDashboard: async () => {
    return fetchWithAuth('/admin/dashboard', { method: 'GET' });
  },

  getAdminStudents: async () => {
    return fetchWithAuth('/admin/students', { method: 'GET' });
  },

  getAdminSkills: async () => {
    return fetchWithAuth('/admin/skills', { method: 'GET' });
  },

  createAdminSkill: async (skillData) => {
    return fetchWithAuth('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skillData)
    });
  },

  updateAdminSkill: async (id, skillData) => {
    return fetchWithAuth(`/admin/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skillData)
    });
  },

  deleteAdminSkill: async (id) => {
    return fetchWithAuth(`/admin/skills/${id}`, { method: 'DELETE' });
  },

  // Admin Resources
  getAdminResources: async () => {
    return fetchWithAuth('/admin/resources', { method: 'GET' });
  },
  createAdminResource: async (data) => {
    return fetchWithAuth('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAdminResource: async (id, data) => {
    return fetchWithAuth(`/admin/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteAdminResource: async (id) => {
    return fetchWithAuth(`/admin/resources/${id}`, { method: 'DELETE' });
  },

  // Admin Eligibility Rules
  getAdminRules: async () => {
    return fetchWithAuth('/admin/eligibility', { method: 'GET' });
  },
  createAdminRule: async (data) => {
    return fetchWithAuth('/admin/eligibility', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAdminRule: async (id, data) => {
    return fetchWithAuth(`/admin/eligibility/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteAdminRule: async (id) => {
    return fetchWithAuth(`/admin/eligibility/${id}`, { method: 'DELETE' });
  },

  // Notifications
  getAdminNotifications: async () => {
    return fetchWithAuth('/admin/notifications', { method: 'GET' });
  },
  deleteAdminNotification: async (id) => {
    return fetchWithAuth(`/admin/notifications/${id}`, { method: 'DELETE' });
  }
};

export default apiService;
