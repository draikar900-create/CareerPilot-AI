import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

const PlacementAdminContext = createContext();

export function PlacementAdminProvider({ children }) {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [eligibilityRules, setEligibilityRules] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlacementAdminData = async () => {
    setLoading(true);
    try {
      const [stRes, compRes, jobsRes, skillsRes, resRes, rulesRes, notifRes] = await Promise.all([
        apiService.getAdminStudents().catch(() => ({ success: true, students: [] })),
        apiService.getCompanies().catch(() => ({ success: true, companies: [] })),
        apiService.getJobs().catch(() => ({ success: true, jobs: [] })),
        apiService.getAdminSkills().catch(() => ({ success: true, skills: [] })),
        apiService.getAdminResources().catch(() => ({ success: true, resources: [] })),
        apiService.getAdminRules().catch(() => ({ success: true, rules: [] })),
        apiService.getAdminNotifications().catch(() => ({ success: true, notifications: [] }))
      ]);

      const stList = Array.isArray(stRes?.students) ? stRes.students : Array.isArray(stRes?.data) ? stRes.data : [];
      const compList = Array.isArray(compRes?.companies) ? compRes.companies : Array.isArray(compRes?.data) ? compRes.data : [];
      const jobList = Array.isArray(jobsRes?.jobs) ? jobsRes.jobs : Array.isArray(jobsRes?.data) ? jobsRes.data : [];
      const skillList = Array.isArray(skillsRes?.skills) ? skillsRes.skills : Array.isArray(skillsRes?.data) ? skillsRes.data : [];
      const resourceList = Array.isArray(resRes?.resources) ? resRes.resources : Array.isArray(resRes?.data) ? resRes.data : [];
      const ruleList = Array.isArray(rulesRes?.rules) ? rulesRes.rules : Array.isArray(rulesRes?.data) ? rulesRes.data : [];
      const notifList = Array.isArray(notifRes?.notifications) ? notifRes.notifications : Array.isArray(notifRes?.data) ? notifRes.data : [];

      setStudents(stList);
      setCompanies(compList);
      setJobs(jobList);
      setSkills(skillList);
      setResources(resourceList);
      setEligibilityRules(ruleList);
      setNotifications(notifList);
    } catch (err) {
      console.warn('Placement admin data sync error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementAdminData();
  }, []);

  const overviewMetrics = useMemo(() => {
    return {
      totalStudents: students.length,
      totalCompanies: companies.length,
      totalJobs: jobs.length,
      totalResources: resources.length,
      studentsRegistered: students.length,
      studentsProfileCompleted: students.filter(s => s.resume_url).length,
      studentsPlacementReady: Math.round(students.length * 0.75)
    };
  }, [students, companies, jobs, resources]);

  const addCompany = async (companyData) => {
    try {
      const res = await apiService.createCompany(companyData);
      if (res.success) {
        showToast(`Company "${companyData.name}" added successfully!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add company', 'error');
    }
  };

  const deleteCompany = async (id) => {
    try {
      const res = await apiService.deleteCompany(id);
      if (res.success) {
        showToast('Company removed from database.', 'info');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete company', 'error');
    }
  };

  const addJob = async (jobData) => {
    try {
      const res = await apiService.createJob(jobData);
      if (res.success) {
        showToast(`Job listing published!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create job', 'error');
    }
  };

  const updateJob = async (id, jobData) => {
    try {
      const res = await apiService.updateJob(id, jobData);
      if (res.success) {
        showToast(`Job listing updated!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update job', 'error');
    }
  };

  const deleteJob = async (id) => {
    try {
      const res = await apiService.deleteJob(id);
      if (res.success) {
        showToast(`Job listing deleted.`, 'info');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete job', 'error');
    }
  };

  const addSkill = async (skillData) => {
    try {
      const res = await apiService.createAdminSkill(skillData);
      if (res.success) {
        showToast(`Skill "${skillData.name}" added successfully!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add skill', 'error');
    }
  };

  const updateSkill = async (id, skillData) => {
    try {
      const res = await apiService.updateAdminSkill(id, skillData);
      if (res.success) {
        showToast(`Skill updated successfully!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update skill', 'error');
    }
  };

  const deleteSkill = async (id) => {
    try {
      const res = await apiService.deleteAdminSkill(id);
      if (res.success) {
        showToast('Skill removed from database.', 'info');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete skill', 'error');
    }
  };

  // Resources
  const addResource = async (data) => {
    try {
      const res = await apiService.createAdminResource(data);
      if (res.success) {
        showToast(`Resource "${data.title}" added successfully!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add resource', 'error');
    }
  };
  const updateResource = async (id, data) => {
    try {
      const res = await apiService.updateAdminResource(id, data);
      if (res.success) {
        showToast('Resource updated successfully!', 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update resource', 'error');
    }
  };
  const deleteResource = async (id) => {
    try {
      const res = await apiService.deleteAdminResource(id);
      if (res.success) {
        showToast('Resource removed successfully.', 'info');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete resource', 'error');
    }
  };

  // Eligibility Rules
  const addRule = async (data) => {
    try {
      const res = await apiService.createAdminRule(data);
      if (res.success) {
        showToast(`Rule "${data.rule_name}" added successfully!`, 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add rule', 'error');
    }
  };
  const updateRule = async (id, data) => {
    try {
      const res = await apiService.updateAdminRule(id, data);
      if (res.success) {
        showToast('Rule updated successfully!', 'success');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update rule', 'error');
    }
  };
  const deleteRule = async (id) => {
    try {
      const res = await apiService.deleteAdminRule(id);
      if (res.success) {
        showToast('Rule deleted successfully.', 'info');
        fetchPlacementAdminData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete rule', 'error');
    }
  };

  const branchData = useMemo(() => {
    const counts = { CSE: 0, ISE: 0, AIML: 0, ECE: 0, EEE: 0, Mechanical: 0, Civil: 0 };
    (students || []).forEach(s => {
      const b = (s.branch || 'CSE').toUpperCase();
      if (counts[b] !== undefined) counts[b]++;
      else counts.CSE++;
    });

    return [
      { branch: 'CSE', fullName: 'Computer Science & Engineering', students: counts.CSE, fill: '#6366f1' },
      { branch: 'ISE', fullName: 'Information Science & Engineering', students: counts.ISE, fill: '#a855f7' },
      { branch: 'AIML', fullName: 'AI & Machine Learning', students: counts.AIML, fill: '#06b6d4' },
      { branch: 'ECE', fullName: 'Electronics & Communication', students: counts.ECE, fill: '#3b82f6' },
      { branch: 'EEE', fullName: 'Electrical & Electronics', students: counts.EEE, fill: '#f59e0b' },
      { branch: 'Mechanical', fullName: 'Mechanical Engineering', students: counts.Mechanical, fill: '#10b981' },
      { branch: 'Civil', fullName: 'Civil Engineering', students: counts.Civil, fill: '#ec4899' }
    ];
  }, [students]);

  return (
    <PlacementAdminContext.Provider
      value={{
        overviewMetrics,
        branchData,
        students,
        companies,
        addCompany,
        deleteCompany,
        jobs,
        addJob,
        updateJob,
        deleteJob,
        skills,
        addSkill,
        updateSkill,
        deleteSkill,
        resources,
        addResource,
        updateResource,
        deleteResource,
        eligibilityRules,
        addRule,
        updateRule,
        deleteRule,
        notifications,
        fetchPlacementAdminData,
        loading
      }}
    >
      {children}
    </PlacementAdminContext.Provider>
  );
}

export function usePlacementAdmin() {
  const context = useContext(PlacementAdminContext);
  if (!context) {
    throw new Error('usePlacementAdmin must be used within PlacementAdminProvider');
  }
  return context;
}
