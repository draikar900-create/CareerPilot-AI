import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCareer } from '../../context/CareerContext';
import {
  BookOpen,
  Search,
  Star,
  Clock,
  ExternalLink,
  Video,
  GraduationCap,
  FileText,
  Bookmark,
  Terminal,
  Layers,
  Lock,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  UserCheck,
  PlayCircle,
  X
} from 'lucide-react';

export default function Resources() {
  const { showToast } = useToast();
  const { testResults } = useCareer();

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'saved'
  const [activeAccessFilter, setActiveAccessFilter] = useState('All Levels'); // 'All Levels' | 'Standard' | 'Faculty' | 'Premium' | 'Expert'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [resources, setResources] = useState([]);
  const [rankInfo, setRankInfo] = useState({ rank: null, hasTakenAssessment: false, score: 0 });

  // 1. Fetch Learning Resources & Rank Authorization from Backend
  const loadLearningHub = async () => {
    setLoading(true);
    try {
      const res = await apiService.getLearningResources();
      if (res && res.success) {
        setResources(res.resources || []);
        if (res.rankInfo) {
          setRankInfo(res.rankInfo);
        }
      }
    } catch (err) {
      console.error('Error fetching learning hub:', err.message);
      showToast('Could not load learning resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearningHub();
  }, [testResults?.score]);

  // Saved resources local tracking
  const [savedResourceIds, setSavedResourceIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_saved_resources');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_saved_resources', JSON.stringify(savedResourceIds));
    } catch (e) {}
  }, [savedResourceIds]);

  const toggleSaveResource = (res) => {
    if (savedResourceIds.includes(res.id)) {
      setSavedResourceIds(prev => prev.filter(id => id !== res.id));
      showToast(`Removed "${res.title}" from Saved Resources`, 'info');
    } else {
      setSavedResourceIds(prev => [...prev, res.id]);
      showToast(`"${res.title}" saved successfully!`, 'success');
    }
  };

  const [selectedResourceModal, setSelectedResourceModal] = useState(null);
  const [toggleProgressLoading, setToggleProgressLoading] = useState(false);

  // Securely access resource & open in-app CareerPilot viewer
  const handleAccessResource = async (res) => {
    if (res.isLocked) {
      showToast(`CONTENT LOCKED: ${res.lockReason || 'Requires a higher learning rank.'}`, 'warning');
      return;
    }

    try {
      const accessRes = await apiService.accessLearningResource(res.id);
      if (accessRes && accessRes.success) {
        setSelectedResourceModal({
          resource: res,
          accessData: accessRes.resource || res,
          isCompleted: Boolean(accessRes.isCompleted)
        });
      } else if (res.url) {
        setSelectedResourceModal({
          resource: res,
          accessData: res,
          isCompleted: false
        });
      } else {
        showToast('Resource content is currently unavailable.', 'info');
      }
    } catch (err) {
      showToast('Access denied: ' + err.message, 'error');
    }
  };

  const handleToggleCompleted = async () => {
    if (!selectedResourceModal) return;
    const targetId = selectedResourceModal.resource.id;
    const nextCompleted = !selectedResourceModal.isCompleted;

    setToggleProgressLoading(true);
    try {
      const res = await apiService.toggleResourceProgress(targetId, nextCompleted);
      if (res && res.success) {
        setSelectedResourceModal(prev => prev ? { ...prev, isCompleted: nextCompleted } : null);
        showToast(nextCompleted ? 'Marked resource as completed!' : 'Marked resource as in-progress', 'success');
      }
    } catch (err) {
      showToast('Could not update progress: ' + err.message, 'error');
    } finally {
      setToggleProgressLoading(false);
    }
  };

  const accessFilterTabs = [
    'All Levels',
    'Standard',
    'Faculty',
    'Premium',
    'Expert'
  ];

  const categoryTabs = [
    'All',
    'Documentation',
    'Videos',
    'Courses',
    'Blogs',
    'Practice Platforms'
  ];

  const baseList = activeSection === 'saved'
    ? resources.filter(r => savedResourceIds.includes(r.id))
    : resources;

  const filteredResources = baseList.filter((res) => {
    const matchesAccess = activeAccessFilter === 'All Levels' || res.accessLevel === activeAccessFilter;
    const matchesCategory = activeCategory === 'All' ||
      res.category === activeCategory ||
      (activeCategory === 'Videos' && (res.type === 'youtube' || res.type === 'video' || res.contentType === 'Video' || res.category?.includes('Video') || res.category?.includes('YouTube'))) ||
      (activeCategory === 'Documentation' && (res.type === 'notes' || res.contentType === 'Notes' || res.category?.includes('Notes') || res.category?.includes('Doc')));

    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAccess && matchesCategory && matchesSearch;
  });

  const currentRank = rankInfo?.rank || testResults?.rank || null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          Authenticating Rank-Based Learning Access...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Rank-Gated Learning Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faculty & Expert Learning Resources
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Access level governed by your standardized assessment score. High-yield FAANG interview notes, staff engineer masterclasses, and faculty lecture archives.
            </p>
          </div>

          {/* LEARNING RANK BADGE CARD */}
          <div className="shrink-0">
            {currentRank === 'Platinum' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-teal-500/15 to-emerald-500/20 border border-cyan-500/40 text-cyan-300 shadow-glow space-y-1 text-center min-w-[240px]">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                  <span className="text-xs font-black uppercase tracking-widest">PLATINUM LEARNING</span>
                </div>
                <div className="text-lg font-extrabold text-white">ALL ACCESS UNLOCKED</div>
                <p className="text-[10px] text-cyan-200/80">Standard + Faculty + Premium + Expert Masterclasses</p>
              </div>
            )}

            {currentRank === 'Gold' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-orange-500/20 border border-amber-500/40 text-amber-300 shadow-glow space-y-1 text-center min-w-[240px]">
                <div className="flex items-center justify-center gap-1.5 text-amber-400">
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">GOLD LEARNING</span>
                </div>
                <div className="text-lg font-extrabold text-white">PREMIUM UNLOCKED</div>
                <p className="text-[10px] text-amber-200/80">Standard + Faculty + Premium Notes (Expert Locked)</p>
              </div>
            )}

            {currentRank === 'Silver' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-500/20 via-zinc-500/15 to-slate-600/20 border border-slate-400/30 text-slate-300 space-y-1 text-center min-w-[240px]">
                <div className="flex items-center justify-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">SILVER LEARNING</span>
                </div>
                <div className="text-lg font-extrabold text-white">STANDARD & FACULTY</div>
                <p className="text-[10px] text-slate-400">Premium & Expert Content Locked</p>
              </div>
            )}

            {!currentRank && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 space-y-1 text-center min-w-[240px]">
                <div className="flex items-center justify-center gap-1.5 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">UNRANKED STUDENT</span>
                </div>
                <div className="text-xs font-bold text-white">Take Readiness Assessment</div>
                <p className="text-[10px] text-amber-200/70">Complete assessment to unlock Premium & Expert content</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs (All vs Saved) & Search */}
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
            <BookOpen className="w-3.5 h-3.5" />
            <span>All Resources</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {resources.length}
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
            <Bookmark className={`w-3.5 h-3.5 ${savedResourceIds.length > 0 ? 'fill-current' : ''}`} />
            <span>Saved Resources</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'saved' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {savedResourceIds.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, faculty lectures, or expert masterclasses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-xs transition-all"
          />
        </div>
      </div>

      {/* Rank Access Level Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Access Tier:</span>
          {accessFilterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveAccessFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeAccessFilter === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RESOURCE CARDS GRID */}
      {filteredResources.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Resources Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No learning resources match your selected access level or search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isSaved = savedResourceIds.includes(res.id);

            return (
              <div
                key={res.id}
                className={`glass-card rounded-3xl p-6 border flex flex-col justify-between space-y-4 relative transition-all ${
                  res.isLocked
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-80 hover:opacity-100 bg-slate-50/50 dark:bg-slate-900/30'
                    : 'border-slate-200/80 dark:border-white/10 hover:border-brand-500/40 hover:shadow-lg'
                }`}
              >
                {/* Card Header: Type Badge & Bookmark */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Access Level Badge */}
                    {res.accessLevel === 'Expert' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>EXPERT TIER</span>
                      </span>
                    )}

                    {res.accessLevel === 'Premium' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>PREMIUM TIER</span>
                      </span>
                    )}

                    {res.accessLevel === 'Faculty' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        <span>FACULTY CONTENT</span>
                      </span>
                    )}

                    {(!res.accessLevel || res.accessLevel === 'Standard') && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        STANDARD ACCESS
                      </span>
                    )}

                    <button
                      onClick={() => toggleSaveResource(res)}
                      className="text-slate-400 hover:text-brand-500 transition-colors p-1"
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-500 text-brand-500' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {res.title}
                    </h3>
                    {res.author && (
                      <span className="text-[11px] font-medium text-slate-400 mt-0.5 block">
                        By {res.author} &bull; {res.contentType || 'Resource'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {res.description}
                  </p>
                </div>

                {/* Card Footer: Access Button / Locked State */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {res.academicYear ? `${res.academicYear}` : 'All Academic Years'}
                  </span>

                  {res.isLocked ? (
                    <button
                      onClick={() => handleAccessResource(res)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{res.requiredRank ? `Requires ${res.requiredRank}` : 'Locked'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {res.type === 'youtube' || res.contentType === 'Video' || res.url?.includes('youtube') || res.url?.includes('youtu.be') ? (
                        <button
                          onClick={() => handleAccessResource(res)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlayCircle className="w-4 h-4 text-white" />
                          <span>Watch Video</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAccessResource(res)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Access Content</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {res.url && (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open direct link in new tab"
                          className="p-2 rounded-xl text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CAREERPILOT IN-APP RESOURCE VIEWER MODAL                                  */}
      {/* ========================================================================= */}
      {selectedResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0E1322]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/30">
                    {selectedResourceModal.resource.contentType || selectedResourceModal.accessData.contentType || 'Resource'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    {selectedResourceModal.resource.accessLevel || 'Standard Access'}
                  </span>

                  {selectedResourceModal.resource.academicYear && (
                    <span className="text-[10px] font-medium text-slate-400">
                      &bull; {selectedResourceModal.resource.academicYear}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedResourceModal.resource.title}
                </h2>
                {selectedResourceModal.resource.author && (
                  <p className="text-xs text-slate-400">
                    Author / Provider: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedResourceModal.resource.author}</span>
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedResourceModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Resource Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedResourceModal.resource.description}
                </p>
              </div>

              {/* Viewer according to Content Type */}
              {(() => {
                const url = selectedResourceModal.accessData.url || selectedResourceModal.resource.url || '';
                const contentType = (selectedResourceModal.resource.contentType || selectedResourceModal.accessData.contentType || '').toLowerCase();

                // 1. PDF Document
                if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-brand-500" />
                          <span>CareerPilot PDF Document Viewer</span>
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Open / Download PDF</span>
                        </a>
                      </div>

                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 min-h-[400px]">
                        <iframe
                          src={`${url}#toolbar=1`}
                          title={selectedResourceModal.resource.title}
                          className="w-full h-[450px] border-0"
                        />
                      </div>
                    </div>
                  );
                }

                // 2. Video Player / YouTube Lecture
                const resObj = selectedResourceModal.accessData || selectedResourceModal.resource;
                const isYt = Boolean((url && (url.includes('youtube') || url.includes('youtu.be'))) || resObj.type === 'youtube' || contentType.includes('video'));

                if (isYt || contentType.includes('video') || url.endsWith('.mp4')) {
                  let embedUrl = resObj.embedUrl || url;
                  let watchUrl = resObj.watchUrl || url;

                  if (url.includes('youtube.com/watch?v=')) {
                    const videoId = url.split('v=')[1]?.split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                  } else if (url.includes('youtu.be/')) {
                    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                  } else if (url.includes('youtube.com/shorts/')) {
                    const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <PlayCircle className="w-4 h-4 text-rose-500" />
                          <span>CareerPilot Video Lecture Player</span>
                        </span>

                        <a
                          href={watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <span>Open on YouTube</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-black aspect-video flex items-center justify-center">
                        {embedUrl.includes('embed') ? (
                          <iframe
                            src={embedUrl}
                            title={selectedResourceModal.resource.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <video src={url} controls className="w-full h-full max-h-[450px]" />
                        )}
                      </div>
                    </div>
                  );
                }

                // 3. External Link Information Card
                return (
                  <div className="p-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 space-y-4 text-center">
                    <ExternalLink className="w-10 h-10 text-brand-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">External Web Resource</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        This learning material is hosted on an external authoritative learning platform ({url ? new URL(url).hostname : 'External Domain'}).
                      </p>
                    </div>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all"
                    >
                      <span>Open External Resource</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer: Progress Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={selectedResourceModal.isCompleted}
                  disabled={toggleProgressLoading}
                  onChange={handleToggleCompleted}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span>Mark as Completed</span>
              </label>

              <button
                onClick={() => setSelectedResourceModal(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
