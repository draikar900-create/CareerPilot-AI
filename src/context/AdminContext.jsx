import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_ADMIN_USERS,
  RECOMMENDED_PROJECTS,
  RECOMMENDED_INTERNSHIPS,
  LEARNING_RESOURCES,
  PLATFORM_USAGE_DATA
} from '../data/mockData';
import { useToast } from './ToastContext';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { showToast } = useToast();

  const [users, setUsers] = useState(INITIAL_ADMIN_USERS);
  const [projects, setProjects] = useState(RECOMMENDED_PROJECTS);
  const [internships, setInternships] = useState(RECOMMENDED_INTERNSHIPS);
  const [resources, setResources] = useState(LEARNING_RESOURCES);

  // User CRUD
  const addUser = (userData) => {
    const newUser = {
      id: `u-${Date.now()}`,
      ...userData,
      status: 'Active',
      readinessScore: Math.floor(65 + Math.random() * 25)
    };
    setUsers(prev => [newUser, ...prev]);
    showToast(`User "${userData.name}" added successfully!`, 'success');
  };

  const updateUser = (id, updatedFields) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updatedFields } : u)));
    showToast('User profile updated successfully!', 'success');
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast('User deleted from registry.', 'info');
  };

  // Content CRUD
  const addProject = (projectData) => {
    const newProj = {
      id: `proj-${Date.now()}`,
      ...projectData,
      stars: 0
    };
    setProjects(prev => [newProj, ...prev]);
    showToast(`Project "${projectData.title}" published!`, 'success');
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    showToast('Project deleted successfully.', 'info');
  };

  const addInternship = (internData) => {
    const newIntern = {
      id: `intern-${Date.now()}`,
      ...internData,
      applicants: 1
    };
    setInternships(prev => [newIntern, ...prev]);
    showToast(`Internship at "${internData.company}" added!`, 'success');
  };

  const deleteInternship = (id) => {
    setInternships(prev => prev.filter(i => i.id !== id));
    showToast('Internship listing removed.', 'info');
  };

  const addResource = (resourceData) => {
    const newRes = {
      id: `res-${Date.now()}`,
      ...resourceData
    };
    setResources(prev => [newRes, ...prev]);
    showToast(`Resource "${resourceData.title}" added!`, 'success');
  };

  const deleteResource = (id) => {
    setResources(prev => prev.filter(r => r.id !== id));
    showToast('Resource removed from catalog.', 'info');
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        projects,
        addProject,
        deleteProject,
        internships,
        addInternship,
        deleteInternship,
        resources,
        addResource,
        deleteResource,
        platformUsage: PLATFORM_USAGE_DATA
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
