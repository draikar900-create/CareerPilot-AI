import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_BRANCH_DATA,
  INITIAL_OVERVIEW_METRICS,
  INITIAL_STUDENTS,
  INITIAL_COMPANIES,
  INITIAL_JOBS,
  INITIAL_SKILLS,
  INITIAL_RESOURCES,
  INITIAL_ELIGIBILITY_RULES,
  INITIAL_NOTIFICATIONS,
  getSavedPlacementData,
  savePlacementData
} from '../data/placementAdminData';
import { useToast } from './ToastContext';

const PlacementAdminContext = createContext();

export function PlacementAdminProvider({ children }) {
  const { showToast } = useToast();

  // 1. Overview Metrics & Branch Analytics
  const [branchData] = useState(INITIAL_BRANCH_DATA);

  // 2. Students
  const [students, setStudents] = useState(() =>
    getSavedPlacementData('cp_admin_students', INITIAL_STUDENTS)
  );

  // 3. Companies
  const [companies, setCompanies] = useState(() =>
    getSavedPlacementData('cp_admin_companies', INITIAL_COMPANIES)
  );

  // 4. Jobs
  const [jobs, setJobs] = useState(() =>
    getSavedPlacementData('cp_admin_jobs', INITIAL_JOBS)
  );

  // 5. Skills
  const [skills, setSkills] = useState(() =>
    getSavedPlacementData('cp_admin_skills', INITIAL_SKILLS)
  );

  // 6. Learning Resources
  const [resources, setResources] = useState(() =>
    getSavedPlacementData('cp_admin_resources', INITIAL_RESOURCES)
  );

  // 7. Eligibility Rules
  const [eligibilityRules, setEligibilityRules] = useState(() =>
    getSavedPlacementData('cp_admin_eligibility', INITIAL_ELIGIBILITY_RULES)
  );

  // 8. Notifications / Announcements
  const [notifications, setNotifications] = useState(() =>
    getSavedPlacementData('cp_admin_notifications', INITIAL_NOTIFICATIONS)
  );

  // Save to localStorage when state changes
  useEffect(() => {
    savePlacementData('cp_admin_students', students);
  }, [students]);

  useEffect(() => {
    savePlacementData('cp_admin_companies', companies);
  }, [companies]);

  useEffect(() => {
    savePlacementData('cp_admin_jobs', jobs);
  }, [jobs]);

  useEffect(() => {
    savePlacementData('cp_admin_skills', skills);
  }, [skills]);

  useEffect(() => {
    savePlacementData('cp_admin_resources', resources);
  }, [resources]);

  useEffect(() => {
    savePlacementData('cp_admin_eligibility', eligibilityRules);
  }, [eligibilityRules]);

  useEffect(() => {
    savePlacementData('cp_admin_notifications', notifications);
  }, [notifications]);

  // Derived Overview Metrics
  const overviewMetrics = useMemo(() => {
    return {
      totalStudents: INITIAL_OVERVIEW_METRICS.totalStudents,
      totalCompanies: companies.length,
      totalJobs: jobs.length,
      totalResources: resources.length,
      studentsRegistered: INITIAL_OVERVIEW_METRICS.studentsRegistered,
      studentsProfileCompleted: INITIAL_OVERVIEW_METRICS.studentsProfileCompleted,
      studentsPlacementReady: INITIAL_OVERVIEW_METRICS.studentsPlacementReady
    };
  }, [companies.length, jobs.length, resources.length]);

  // ================= COMPANY CRUD =================
  const addCompany = (companyData) => {
    const newCompany = {
      id: `cmp-${Date.now()}`,
      name: companyData.name.trim(),
      description: companyData.description.trim(),
      availableRoles: Array.isArray(companyData.availableRoles)
        ? companyData.availableRoles
        : companyData.availableRoles.split(',').map(r => r.trim()).filter(Boolean)
    };
    setCompanies(prev => [newCompany, ...prev]);
    showToast(`Company "${newCompany.name}" added successfully!`, 'success');
  };

  const updateCompany = (id, updatedData) => {
    setCompanies(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...updatedData,
            availableRoles: Array.isArray(updatedData.availableRoles)
              ? updatedData.availableRoles
              : typeof updatedData.availableRoles === 'string'
              ? updatedData.availableRoles.split(',').map(r => r.trim()).filter(Boolean)
              : c.availableRoles
          };
        }
        return c;
      })
    );
    showToast('Company details updated successfully!', 'success');
  };

  const deleteCompany = (id) => {
    const target = companies.find(c => c.id === id);
    setCompanies(prev => prev.filter(c => c.id !== id));
    showToast(`Company "${target?.name || ''}" removed.`, 'info');
  };

  // ================= JOB CRUD =================
  const addJob = (jobData) => {
    const newJob = {
      id: `job-${Date.now()}`,
      role: jobData.role.trim(),
      company: jobData.company.trim(),
      location: jobData.location.trim(),
      salary: jobData.salary.trim(),
      applyLink: jobData.applyLink.trim()
    };
    setJobs(prev => [newJob, ...prev]);
    showToast(`Job listing "${newJob.role}" published!`, 'success');
  };

  const updateJob = (id, updatedData) => {
    setJobs(prev => prev.map(j => (j.id === id ? { ...j, ...updatedData } : j)));
    showToast('Job listing updated successfully!', 'success');
  };

  const deleteJob = (id) => {
    const target = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
    showToast(`Job "${target?.role || ''}" removed.`, 'info');
  };

  // ================= SKILLS CRUD =================
  const addSkill = (skillData) => {
    const newSkill = {
      id: `skl-${Date.now()}`,
      name: skillData.name.trim(),
      category: skillData.category.trim(),
      usage: Array.isArray(skillData.usage) ? skillData.usage : [skillData.usage].filter(Boolean)
    };
    setSkills(prev => [newSkill, ...prev]);
    showToast(`Skill "${newSkill.name}" registered!`, 'success');
  };

  const updateSkill = (id, updatedData) => {
    setSkills(prev => prev.map(s => (s.id === id ? { ...s, ...updatedData } : s)));
    showToast('Skill updated successfully!', 'success');
  };

  const deleteSkill = (id) => {
    const target = skills.find(s => s.id === id);
    setSkills(prev => prev.filter(s => s.id !== id));
    showToast(`Skill "${target?.name || ''}" removed.`, 'info');
  };

  // ================= RESOURCES CRUD =================
  const addResource = (resData) => {
    const newResource = {
      id: `res-${Date.now()}`,
      title: resData.title.trim(),
      skillsCovered: Array.isArray(resData.skillsCovered)
        ? resData.skillsCovered
        : resData.skillsCovered.split(',').map(s => s.trim()).filter(Boolean),
      resourceType: resData.resourceType || 'PDF',
      level: resData.level || 'Beginner',
      provider: resData.provider.trim(),
      url: resData.url ? resData.url.trim() : 'https://careerpilot.ai'
    };
    setResources(prev => [newResource, ...prev]);
    showToast(`Learning resource "${newResource.title}" added!`, 'success');
  };

  const updateResource = (id, updatedData) => {
    setResources(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            ...updatedData,
            skillsCovered: Array.isArray(updatedData.skillsCovered)
              ? updatedData.skillsCovered
              : typeof updatedData.skillsCovered === 'string'
              ? updatedData.skillsCovered.split(',').map(s => s.trim()).filter(Boolean)
              : r.skillsCovered
          };
        }
        return r;
      })
    );
    showToast('Resource updated successfully!', 'success');
  };

  const deleteResource = (id) => {
    const target = resources.find(r => r.id !== id);
    setResources(prev => prev.filter(r => r.id !== id));
    showToast(`Resource "${target?.title || ''}" deleted.`, 'info');
  };

  // ================= ELIGIBILITY RULES CRUD =================
  const addEligibilityRule = (ruleData) => {
    const newRule = {
      id: `rul-${Date.now()}`,
      companyName: ruleData.companyName.trim(),
      jobRole: ruleData.jobRole.trim(),
      minCgpa: parseFloat(ruleData.minCgpa) || 7.0,
      eligibleBranches: Array.isArray(ruleData.eligibleBranches)
        ? ruleData.eligibleBranches
        : ruleData.eligibleBranches.split(',').map(b => b.trim()).filter(Boolean),
      maxBacklogs: parseInt(ruleData.maxBacklogs, 10) || 0,
      requiredSkills: ruleData.requiredSkills.trim()
    };
    setEligibilityRules(prev => [newRule, ...prev]);
    showToast(`Eligibility criteria for ${newRule.companyName} created!`, 'success');
  };

  const updateEligibilityRule = (id, updatedData) => {
    setEligibilityRules(prev =>
      prev.map(rule => {
        if (rule.id === id) {
          return {
            ...rule,
            ...updatedData,
            minCgpa: parseFloat(updatedData.minCgpa) || rule.minCgpa,
            maxBacklogs: parseInt(updatedData.maxBacklogs, 10) ?? rule.maxBacklogs,
            eligibleBranches: Array.isArray(updatedData.eligibleBranches)
              ? updatedData.eligibleBranches
              : typeof updatedData.eligibleBranches === 'string'
              ? updatedData.eligibleBranches.split(',').map(b => b.trim()).filter(Boolean)
              : rule.eligibleBranches
          };
        }
        return rule;
      })
    );
    showToast('Eligibility rule updated successfully!', 'success');
  };

  const deleteEligibilityRule = (id) => {
    const target = eligibilityRules.find(r => r.id === id);
    setEligibilityRules(prev => prev.filter(r => r.id !== id));
    showToast(`Rule for "${target?.companyName || ''}" deleted.`, 'info');
  };

  // ================= NOTIFICATIONS / ANNOUNCEMENTS =================
  const sendNotification = (notificationData) => {
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: notificationData.title.trim(),
      message: notificationData.message.trim(),
      sentDate: formattedDate,
      recipients: 'All Registered Students',
      status: 'Delivered'
    };
    setNotifications(prev => [newNotification, ...prev]);
    showToast('Announcement broadcasted to all students!', 'success');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Announcement removed from records.', 'info');
  };

  return (
    <PlacementAdminContext.Provider
      value={{
        branchData,
        overviewMetrics,
        students,
        companies,
        addCompany,
        updateCompany,
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
        addEligibilityRule,
        updateEligibilityRule,
        deleteEligibilityRule,
        notifications,
        sendNotification,
        deleteNotification
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
