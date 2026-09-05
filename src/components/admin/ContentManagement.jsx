import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import {
  Database,
  FolderGit2,
  Briefcase,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  ExternalLink,
  Clock,
  Calendar
} from 'lucide-react';
import AdminEvents from '../placementAdmin/AdminEvents';

export default function ContentManagement() {
  const {
    projects,
    addProject,
    deleteProject,
    internships,
    addInternship,
    deleteInternship,
    resources,
    addResource,
    deleteResource
  } = useAdmin();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'internships' | 'resources'
  const [showAddModal, setShowAddModal] = useState(false);

  // New item draft states
  const [newProject, setNewProject] = useState({
    title: '',
    difficulty: 'Intermediate',
    duration: '3-4 Weeks',
    skills: 'React, Node.js, Tailwind CSS',
    description: '',
    architecture: 'Vite React -> Express Backend -> PostgreSQL'
  });

  const [newInternship, setNewInternship] = useState({
    company: '',
    role: '',
    location: 'Remote / Hybrid',
    stipend: '$45 / hr',
    duration: '12 Weeks',
    deadline: 'December 2026',
    requiredSkills: 'Python, Git, Problem Solving',
    description: ''
  });

  const [newResource, setNewResource] = useState({
    title: '',
    category: 'Courses',
    provider: 'Coursera / Open Source',
    duration: 'Self-Paced',
    rating: 4.8,
    url: 'https://example.com',
    description: ''
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) {
      showToast('Project title is required', 'error');
      return;
    }
    addProject({
      ...newProject,
      skills: newProject.skills.split(',').map((s) => s.trim())
    });
    setShowAddModal(false);
  };

  const handleCreateInternship = (e) => {
    e.preventDefault();
    if (!newInternship.company.trim() || !newInternship.role.trim()) {
      showToast('Company name and role are required', 'error');
      return;
    }
    addInternship({
      ...newInternship,
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
      requiredSkills: newInternship.requiredSkills.split(',').map((s) => s.trim())
    });
    setShowAddModal(false);
  };

  const handleCreateResource = (e) => {
    e.preventDefault();
    if (!newResource.title.trim()) {
      showToast('Resource title is required', 'error');
      return;
    }
    addResource(newResource);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Curriculum Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Content Management System
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Add, update, or remove engineering projects, internship listings, and curated learning materials across all student tiers.
            </p>
          </div>

          {activeTab !== 'events' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {activeTab === 'projects' ? 'Project' : activeTab === 'internships' ? 'Internship' : 'Resource'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'internships'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Internships ({internships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'resources'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Resources ({resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events & Colleges</span>
        </button>
      </div>

      {/* Projects Tab Table */}
      {activeTab === 'projects' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100/70 dark:bg-slate-900/70 text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Project Title</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Skills Covered</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{proj.title}</div>
                      <div className="text-xs text-slate-400 truncate max-w-sm">{proj.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-500">
                        {proj.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{proj.duration}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proj.skills.map((s) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteProject(proj.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Internships Tab Table */}
      {activeTab === 'internships' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100/70 dark:bg-slate-900/70 text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Stipend</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {internships.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{intern.company}</div>
                      <div className="text-xs text-brand-500 font-medium">{intern.role}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">{intern.location}</td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-500">{intern.stipend}</td>
                    <td className="px-6 py-4 text-xs text-rose-500">{intern.deadline}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteInternship(intern.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Internship"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resources Tab Table */}
      {activeTab === 'resources' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="text-xs uppercase bg-slate-100/70 dark:bg-slate-900/70 text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Resource Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {resources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{res.title}</div>
                      <div className="text-xs text-slate-400">{res.duration}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {res.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{res.provider}</td>
                    <td className="px-6 py-4 text-xs font-bold text-amber-500">{res.rating} ⭐</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteResource(res.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events & Colleges Tab */}
      {activeTab === 'events' && (
        <AdminEvents />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={`Add New ${activeTab === 'projects' ? 'Project' : activeTab === 'internships' ? 'Internship' : 'Resource'}`}
        >
          {activeTab === 'projects' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="e.g. Distributed Key-Value Store"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newProject.difficulty}
                    onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={newProject.duration}
                    onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                    placeholder="e.g. 4 Weeks"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Skills Covered (comma separated)
                </label>
                <input
                  type="text"
                  value={newProject.skills}
                  onChange={(e) => setNewProject({ ...newProject, skills: e.target.value })}
                  placeholder="React, Redis, Docker"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Summarize the project scope..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow"
                >
                  Create Project
                </button>
              </div>
            </form>
          )}

          {activeTab === 'internships' && (
            <form onSubmit={handleCreateInternship} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newInternship.company}
                  onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })}
                  placeholder="e.g. Netflix / Datadog"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={newInternship.role}
                  onChange={(e) => setNewInternship({ ...newInternship, role: e.target.value })}
                  placeholder="e.g. Cloud Infrastructure Intern"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    value={newInternship.stipend}
                    onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })}
                    placeholder="$50 / hr"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newInternship.duration}
                    onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })}
                    placeholder="12 Weeks"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow"
                >
                  Publish Internship
                </button>
              </div>
            </form>
          )}

          {activeTab === 'resources' && (
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Resource Title
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus Explained"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="Videos">Videos</option>
                    <option value="Courses">Courses</option>
                    <option value="Blogs">Blogs</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Practice Platforms">Practice Platforms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={newResource.provider}
                    onChange={(e) => setNewResource({ ...newResource, provider: e.target.value })}
                    placeholder="e.g. MIT OpenCourseware"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
