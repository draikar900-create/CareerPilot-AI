import { supabase } from '../utils/supabaseClient.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Helper to execute API requests with Supabase JWT access token attached.
 */
async function fetchWithAuth(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get active session from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;
  const currentUser = session?.user || null;

  // Debug logging for Auth State
  console.log(`[AUTH DEBUG] Request to: ${endpoint}`);
  console.log(`[AUTH DEBUG] Current User:`, currentUser ? { id: currentUser.id, email: currentUser.email } : 'NO_USER');
  console.log(`[AUTH DEBUG] Current Session:`, session ? { expires_at: session.expires_at } : 'NO_SESSION');
  console.log(`[AUTH DEBUG] Access Token:`, token ? `${token.substring(0, 15)}...` : 'NONE');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers
  });

  // Define public authentication endpoints that must NOT trigger token refresh or session expired events
  const publicAuthEndpoints = ['/auth/login', '/auth/signup', '/auth/verify-otp', '/auth/forgot-password'];
  const isPublicAuthRoute = publicAuthEndpoints.some(pub => endpoint.includes(pub));

  // Handle token expiration: if 401 on protected endpoint and we haven't retried yet, force refresh and retry
  if (response.status === 401 && !isRetry && !isPublicAuthRoute) {
    console.warn('[AUTH DEBUG] Received 401 Unauthorized on protected endpoint, attempting to refresh Supabase session...');
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    
    if (!refreshError && refreshedSession?.access_token) {
      console.log('[AUTH DEBUG] Session successfully refreshed. Retrying request with new token...');
      headers['Authorization'] = `Bearer ${refreshedSession.access_token}`;
      response = await fetch(url, {
        ...options,
        headers
      });
    } else {
      console.error('[AUTH DEBUG] Failed to refresh session or no new token available:', refreshError?.message);
      // Clear invalid session state to prevent loop and notify app
      await supabase.auth.signOut().catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cp_session_expired'));
      }
    }
  }

  const responseData = await response.json().catch(() => ({
    success: false,
    message: `Server returned HTTP ${response.status}`
  }));

  if (!response.ok) {
    throw new Error(responseData.message || `Request failed with status ${response.status}`);
  }

  return responseData;
}

export const apiService = {
  // Auth API
  login: async (identifier, password) => {
    const res = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (res && res.success && res.session?.access_token && res.session?.refresh_token) {
      console.log('[AUTH DEBUG] Syncing session into frontend Supabase client...');
      await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token
      });
    }
    return res;
  },

  signup: async (formData) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  },

  verifyOtp: async (payload) => {
    const res = await fetchWithAuth('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res && res.success && res.session?.access_token && res.session?.refresh_token) {
      console.log('[AUTH DEBUG] Syncing verified OTP session into frontend Supabase client...');
      await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token
      });
    }
    return res;
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
    console.log('[PROFILE DEBUG] Profile Save Request Payload:', profileData);
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

  toggleRoadmapTopic: async (phaseIdx, topicId, completed) => {
    return fetchWithAuth('/roadmap/toggle-topic', {
      method: 'POST',
      body: JSON.stringify({ phaseIdx, topicId, completed })
    });
  },

  getStudentRoadmapForFaculty: async (studentId) => {
    return fetchWithAuth(`/faculty/students/${studentId}/roadmap`, { method: 'GET' });
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

  getStudentFacultyNotes: async () => {
    return fetchWithAuth('/faculty/my-notes', { method: 'GET' });
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

  deleteInternship: async (id) => {
    return fetchWithAuth(`/admin/internships/${id}`, { method: 'DELETE' });
  },

  updateAdminInternship: async (id, data) => {
    return fetchWithAuth(`/admin/internships/${id}`, {
      method: 'PUT',
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

  viewResume: async (studentId = 'me') => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const response = await fetch(`${API_BASE_URL}/resume/view/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ message: 'Failed to view resume document.' }));
      throw new Error(errJson.message || 'Failed to view resume.');
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    return { success: true };
  },

  downloadResume: async (studentId = 'me', fallbackFileName = 'resume.pdf') => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const response = await fetch(`${API_BASE_URL}/resume/download/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ message: 'Failed to download resume document.' }));
      throw new Error(errJson.message || 'Failed to download resume.');
    }

    const disposition = response.headers.get('Content-Disposition');
    let fileName = fallbackFileName;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) fileName = match[1];
    }

    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    return { success: true };
  },

  deleteResume: async () => {
    return fetchWithAuth('/resume', { method: 'DELETE' });
  },

  getResumeMetadata: async (studentId = 'me') => {
    return fetchWithAuth(`/resume/metadata/${studentId}`, { method: 'GET' });
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

  getAdminStudentDetail: async (id) => {
    return fetchWithAuth(`/admin/students/${id}`, { method: 'GET' });
  },

  getAdminFaculty: async () => {
    return fetchWithAuth('/admin/faculty', { method: 'GET' });
  },

  createAdminStudent: async (studentData) => {
    return fetchWithAuth('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
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

  // Admin Notifications
  getAdminNotifications: async () => {
    return fetchWithAuth('/admin/notifications', { method: 'GET' });
  },
  // sendAdminNotification was missing — this caused "sendNotification is not a function" in AdminNotifications.jsx
  sendAdminNotification: async (data) => {
    return fetchWithAuth('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  deleteAdminNotification: async (id) => {
    return fetchWithAuth(`/admin/notifications/${id}`, { method: 'DELETE' });
  },

  // TPO Placement Status Update API
  updatePlacementStatus: async (studentId, placementStatus, placementNotes = '') => {
    return fetchWithAuth(`/admin/students/${studentId}/placement-status`, {
      method: 'PUT',
      body: JSON.stringify({ placement_status: placementStatus, placement_notes: placementNotes })
    });
  },

  // Faculty Assignment Deletion API
  deleteFacultyAssignment: async (assignmentId) => {
    return fetchWithAuth(`/admin/faculty/assignments/${assignmentId}`, { method: 'DELETE' });
  },

  // Departments Management API
  getAdminDepartments: async () => {
    return fetchWithAuth('/admin/departments', { method: 'GET' });
  },
  createAdminDepartment: async (data) => {
    return fetchWithAuth('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // User Role Assignment with Escalation Guard API
  assignUserRole: async (targetUserId, targetRole, collegeName) => {
    return fetchWithAuth('/admin/users/role', {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId, target_role: targetRole, college_name: collegeName })
    });
  },

  // Administrative Audit Logs API
  getAdminAuditLogs: async () => {
    return fetchWithAuth('/admin/audit-logs', { method: 'GET' });
  },

  // Banners API
  getBanners: async () => {
    return fetchWithAuth('/banners', { method: 'GET' });
  },
  getAdminBanners: async () => {
    return fetchWithAuth('/admin/banners', { method: 'GET' });
  },
  createAdminBanner: async (data) => {
    return fetchWithAuth('/admin/banners', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAdminBanner: async (id, data) => {
    return fetchWithAuth(`/admin/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteAdminBanner: async (id) => {
    return fetchWithAuth(`/admin/banners/${id}`, { method: 'DELETE' });
  },

  // Student-facing public endpoints — connect Admin-created content to Student Console
  getStudentNotifications: async () => {
    return fetchWithAuth('/notifications', { method: 'GET' });
  },

  getPublicSkills: async () => {
    return fetchWithAuth('/skills', { method: 'GET' });
  },

  getPublicEvents: async () => {
    return fetchWithAuth('/events', { method: 'GET' });
  },

  getPublicResources: async () => {
    return fetchWithAuth('/resources', { method: 'GET' });
  },

  getColleges: async () => {
    return fetchWithAuth('/colleges', { method: 'GET' });
  },

  getDepartments: async (collegeId) => {
    return fetchWithAuth(`/departments/${collegeId}`, { method: 'GET' });
  },

  createCollege: async (data) => {
    return fetchWithAuth('/admin/colleges', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Projects
  getProjects: async () => {
    return fetchWithAuth('/projects', { method: 'GET' });
  },
  createAdminProject: async (data) => {
    return fetchWithAuth('/admin/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAdminProject: async (id, data) => {
    return fetchWithAuth(`/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteAdminProject: async (id) => {
    return fetchWithAuth(`/admin/projects/${id}`, { method: 'DELETE' });
  },

  // Certificates
  getCertificates: async () => {
    return fetchWithAuth('/certificates', { method: 'GET' });
  },
  createAdminCertificate: async (data) => {
    return fetchWithAuth('/admin/certificates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  updateAdminCertificate: async (id, data) => {
    return fetchWithAuth(`/admin/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  deleteAdminCertificate: async (id) => {
    return fetchWithAuth(`/admin/certificates/${id}`, { method: 'DELETE' });
  },

  // Machine Learning Placement Prediction Engine
  getMLPrediction: async () => {
    return fetchWithAuth('/ml/prediction', { method: 'GET' });
  },

  triggerMLPrediction: async () => {
    return fetchWithAuth('/ml/predict', { method: 'POST' });
  },

  getAdminMLAnalytics: async () => {
    return fetchWithAuth('/ml/admin/analytics', { method: 'GET' });
  },

  // Year-Wise Assessment Engine
  getCurrentAssessment: async () => {
    return fetchWithAuth('/assessment/current', { method: 'GET' });
  },

  startAssessmentAttempt: async () => {
    return fetchWithAuth('/assessment/start', { method: 'POST' });
  },

  submitAssessmentAttempt: async (payload) => {
    return fetchWithAuth('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getLatestAssessmentResult: async () => {
    return fetchWithAuth('/assessment/my-latest-result', { method: 'GET' });
  },

  getMyLatestAssessmentResult: async () => {
    return fetchWithAuth('/assessment/my-latest-result', { method: 'GET' });
  },

  // Rank-Based Learning Access API
  getLearningResources: async () => {
    return fetchWithAuth('/learning/resources', { method: 'GET' });
  },

  accessLearningResource: async (resourceId) => {
    return fetchWithAuth(`/learning/resources/${resourceId}/access`, { method: 'GET' });
  },

  toggleResourceProgress: async (resourceId, completed) => {
    return fetchWithAuth(`/learning/resources/${resourceId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ completed })
    });
  },

  // Contact Management API
  submitContactMessage: async (contactData) => {
    return fetchWithAuth('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  },

  getAdminContacts: async () => {
    return fetchWithAuth('/admin/contacts', { method: 'GET' });
  },

  updateContactStatus: async (id, status) => {
    return fetchWithAuth(`/admin/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  deleteContactMessage: async (id) => {
    return fetchWithAuth(`/admin/contacts/${id}`, { method: 'DELETE' });
  },

  // Dedicated Faculty Portal API
  getFacultyProfile: async () => {
    return fetchWithAuth('/faculty/me', { method: 'GET' });
  },

  saveFacultyOnboarding: async (onboardingData) => {
    return fetchWithAuth('/faculty/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData)
    });
  },

  getFacultyDashboard: async () => {
    return fetchWithAuth('/faculty/dashboard', { method: 'GET' });
  },

  getFacultyStudents: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/faculty/students?${query}` : '/faculty/students';
    return fetchWithAuth(endpoint, { method: 'GET' });
  },

  getFacultyStudentDetail: async (studentId) => {
    return fetchWithAuth(`/faculty/students/${studentId}`, { method: 'GET' });
  },

  getFacultyClasses: async () => {
    return fetchWithAuth('/faculty/classes', { method: 'GET' });
  },

  createFacultyClass: async (classData) => {
    return fetchWithAuth('/faculty/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  },

  publishFacultyResource: async (resourceData) => {
    return fetchWithAuth('/faculty/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  },

  getFacultyResources: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/faculty/resources?${query}` : '/faculty/resources';
    return fetchWithAuth(endpoint, { method: 'GET' });
  },

  createFacultyResource: async (resourceData) => {
    return fetchWithAuth('/faculty/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  },

  updateFacultyResource: async (id, resourceData) => {
    return fetchWithAuth(`/faculty/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData)
    });
  },

  deleteFacultyResource: async (id) => {
    return fetchWithAuth(`/faculty/resources/${id}`, { method: 'DELETE' });
  },

  getFacultyStudentNotes: async (studentId) => {
    return fetchWithAuth(`/faculty/students/${studentId}/notes`, { method: 'GET' });
  },

  createFacultyStudentNote: async (studentId, noteData) => {
    return fetchWithAuth(`/faculty/students/${studentId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  },

  deleteFacultyStudentNote: async (studentId, noteId) => {
    return fetchWithAuth(`/faculty/students/${studentId}/notes/${noteId}`, { method: 'DELETE' });
  },

  getFacultyStudentResume: async (studentId) => {
    return fetchWithAuth(`/faculty/students/${studentId}/resume`, { method: 'GET' });
  },

  deleteFacultyClass: async (classId) => {
    return fetchWithAuth(`/faculty/classes/${classId}`, { method: 'DELETE' });
  },

  // Admin Faculty Management
  getAdminFaculty: async () => {
    return fetchWithAuth('/admin/faculty', { method: 'GET' });
  },

  createAdminFaculty: async (facultyData) => {
    return fetchWithAuth('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  },

  assignFacultyScope: async (assignmentData) => {
    return fetchWithAuth('/admin/faculty/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  },

  submitFacultyFeedback: async (feedbackData) => {
    return fetchWithAuth('/faculty/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  },

  getFacultyFeedbackForStudent: async (studentId) => {
    return fetchWithAuth(`/faculty/feedback/${studentId}`, { method: 'GET' });
  },

  getStudentFeedback: async () => {
    return fetchWithAuth('/profile/feedback', { method: 'GET' });
  }
};

export default apiService;

