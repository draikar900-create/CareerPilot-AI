import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [internships, setInternships] = useState([]);
  const [resources, setResources] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const refreshAdminData = async () => {
    try {
      const [uRes, cRes, jRes, iRes, aRes] = await Promise.all([
        apiService.getAdminStudents().catch(() => ({ success: true, students: [] })),
        apiService.getCompanies().catch(() => ({ success: true, companies: [] })),
        apiService.getJobs().catch(() => ({ success: true, jobs: [] })),
        apiService.getInternships().catch(() => ({ success: true, internships: [] })),
        apiService.getAdminApplications().catch(() => ({ success: true, applications: [] }))
      ]);

      if (uRes.success) setUsers(uRes.students || []);
      if (cRes.success) setCompanies(cRes.companies || []);
      if (jRes.success) setJobs(jRes.jobs || []);
      if (iRes.success) setInternships(iRes.internships || []);
      if (aRes.success) setApplications(aRes.applications || []);
    } catch (err) {
      console.warn('Admin context sync warning:', err.message);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  const addCompany = async (companyData) => {
    try {
      const res = await apiService.createCompany(companyData);
      if (res.success) {
        showToast(`Company "${companyData.name}" added successfully!`, 'success');
        refreshAdminData();
        return res.company;
      }
    } catch (err) {
      showToast(err.message || 'Failed to add company', 'error');
    }
  };

  const addJob = async (jobData) => {
    try {
      const res = await apiService.createJob(jobData);
      if (res.success) {
        showToast(`Job "${jobData.title}" published!`, 'success');
        refreshAdminData();
        return res.job;
      }
    } catch (err) {
      showToast(err.message || 'Failed to publish job', 'error');
    }
  };

  const addInternship = async (internData) => {
    try {
      const res = await apiService.createInternship(internData);
      if (res.success) {
        showToast(`Internship published successfully!`, 'success');
        refreshAdminData();
        return res.internship;
      }
    } catch (err) {
      showToast(err.message || 'Failed to publish internship', 'error');
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      const res = await apiService.updateApplicationStatus(id, status);
      if (res.success) {
        showToast(`Application status updated to ${status}`, 'success');
        refreshAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update application status', 'error');
    }
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        projects,
        internships,
        resources,
        companies,
        jobs,
        applications,
        refreshAdminData,
        addCompany,
        addJob,
        addInternship,
        updateApplicationStatus
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
}
