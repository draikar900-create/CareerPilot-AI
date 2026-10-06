import React, { useState, useEffect } from 'react';
// import { RECOMMENDED_PROJECTS } from '../../data/mockData';
import { useCareer } from '../../context/CareerContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import { apiService } from '../../services/api';
import {
  FolderGit2,
  Clock,
  ExternalLink,
  Star,
  Layers,
  Sparkles,
  ArrowUpRight,
  Code2,
  Bookmark
} from 'lucide-react';
import { GithubIcon } from '../common/BrandIcons';

export default function Projects() {
  const { currentRole } = useCareer();
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'saved'
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  const [savedProjectIds, setSavedProjectIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_saved_projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    import('../../services/api').then(({ apiService }) => {
      apiService.getProjects().then(res => {
        if (res.success) setProjects(res.data || res.projects || []);
      }).catch(console.error);
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cp_saved_projects', JSON.stringify(savedProjectIds));
    } catch (e) {}
  }, [savedProjectIds]);

  const toggleSaveProject = (proj) => {
    if (savedProjectIds.includes(proj.id)) {
      setSavedProjectIds(prev => prev.filter(id => id !== proj.id));
      showToast(`Removed "${proj.title}" from Saved Projects`, 'info');
    } else {
      setSavedProjectIds(prev => [...prev, proj.id]);
      showToast(`"${proj.title}" saved successfully!`, 'success');
    }
  };

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const baseList = activeSection === 'saved'
    ? projects.filter(p => savedProjectIds.includes(p.id))
    : projects;

  const filteredProjects = baseList.filter((p) => {
    if (filterDifficulty === 'All') return true;
    return p.difficulty === filterDifficulty;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Portfolio Engineering</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recommended Engineering Projects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Curated hands-on capstones specifically recommended for <strong className="text-slate-800 dark:text-slate-200">{currentRole?.title || 'Engineering'}</strong> aspirants to demonstrate production code capability.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs (All Projects vs Saved Projects) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>All Projects</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'saved'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedProjectIds.length > 0 ? 'fill-current' : ''}`} />
            <span>Saved Projects</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'saved' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {savedProjectIds.length}
            </span>
          </button>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
          {difficulties.map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterDifficulty === diff
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State for Saved Projects */}
      {activeSection === 'saved' && baseList.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No saved projects yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Browse through the recommended engineering projects and click Save to bookmark them here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveSection('all')}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Projects</span>
            </button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-white/10 space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No projects match the selected "{filterDifficulty}" difficulty.
          </p>
          <button
            onClick={() => setFilterDifficulty('All')}
            className="text-xs font-bold text-brand-500 hover:underline cursor-pointer"
          >
            Reset filter to All
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const isSaved = savedProjectIds.includes(proj.id);

            return (
              <div
                key={proj.id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  {/* Difficulty & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        proj.difficulty === 'Beginner'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : proj.difficulty === 'Intermediate'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {proj.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {proj.duration}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Skills Covered */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Skills Covered
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.skills || proj.technologies || []).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* View Details & Save Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(proj)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSaveProject(proj)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                        : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-600 hover:text-white'
                    }`}
                    title={isSaved ? 'Click to remove from saved' : 'Save project'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.title}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500">
                {selectedProject.difficulty} Level
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {selectedProject.duration}
              </span>
              <span className="text-xs text-slate-400">
                Category: {selectedProject.category}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedProject.description}
            </p>

            {/* Architecture Overview */}
            {selectedProject.architecture && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  System Architecture Stack
                </span>
                <p className="text-xs font-mono text-brand-500 dark:text-brand-400 break-words">
                  {selectedProject.architecture}
                </p>
              </div>
            )}

            {/* Skills */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Technologies & Tools Practiced
              </span>
              <div className="flex flex-wrap gap-2">
                {(selectedProject.skills || selectedProject.technologies || []).map((s) => (
                  <span
                    key={s}
                    className="text-xs font-semibold px-3 py-1 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => toggleSaveProject(selectedProject)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  savedProjectIds.includes(selectedProject.id)
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedProjectIds.includes(selectedProject.id) ? 'fill-current' : ''}`} />
                <span>{savedProjectIds.includes(selectedProject.id) ? 'Saved' : 'Save Project'}</span>
              </button>

              <div className="flex items-center gap-2">
                {(selectedProject.github || selectedProject.github_template_url) && (
                  <a
                    href={selectedProject.github || selectedProject.github_template_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center gap-2"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>View Starter Code</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    showToast(`Project ${selectedProject.title} pinned to your active learning tasks!`, 'success');
                    setSelectedProject(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow cursor-pointer"
                >
                  Add to My Portfolio Tasks
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
