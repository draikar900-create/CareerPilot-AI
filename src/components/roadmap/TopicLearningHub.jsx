import React, { useState, useMemo, useEffect } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';
import { getTopicLearningDetails } from '../../data/roadmapTopicDetails';
import Modal from '../common/Modal';
import {
  BookOpen,
  FileText,
  Video,
  Code2,
  FolderGit2,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Download,
  ExternalLink,
  Search,
  Sparkles,
  Clock,
  Eye,
  Play,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  Cpu,
  Bookmark,
  Share2
} from 'lucide-react';

export default function TopicLearningHub({ topic, phaseIdx, phaseSemester, onBack }) {
  const { currentRole, toggleTopicCompletion } = useCareer();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pdf' | 'youtube' | 'practice' | 'projects' | 'progress'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);
  const [expandedInterviewIdx, setExpandedInterviewIdx] = useState(null);
  const [expandedPracticeIdx, setExpandedPracticeIdx] = useState(null);

  // Modals
  const [activePdfModal, setActivePdfModal] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Generate rich learning hub data for this topic
  const details = useMemo(() => {
    return getTopicLearningDetails(topic, currentRole, profile);
  }, [topic, currentRole, profile]);

  // Persistent Topic Progress Tracking state (stored in localStorage)
  const storageKey = `cp_topic_progress_${topic.id}`;
  const [progressState, setProgressState] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      notesRead: !!topic.completed,
      openedPdfIds: [],
      watchedVideoIds: [],
      completedProjectTitles: []
    };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progressState));
  }, [progressState, storageKey]);

  // Compute live progress percentage (0 - 100%)
  const topicProgress = useMemo(() => {
    let score = 0;
    // Notes Read: 25%
    if (progressState.notesRead) score += 25;
    // PDFs Opened: 25%
    const totalPdfs = details.pdfNotes.length;
    if (totalPdfs > 0) {
      const pdfRatio = Math.min(1, progressState.openedPdfIds.length / totalPdfs);
      score += Math.round(pdfRatio * 25);
    }
    // Videos Watched: 25%
    const totalVideos = details.youtubeTutorials.length;
    if (totalVideos > 0) {
      const videoRatio = Math.min(1, progressState.watchedVideoIds.length / totalVideos);
      score += Math.round(videoRatio * 25);
    }
    // Projects Completed: 25%
    const totalProjects = details.projects.beginner.length + details.projects.intermediate.length;
    if (totalProjects > 0) {
      const projectRatio = Math.min(1, progressState.completedProjectTitles.length / Math.min(3, totalProjects));
      score += Math.round(projectRatio * 25);
    }
    return Math.min(100, Math.max(0, score));
  }, [progressState, details]);

  // Mark PDF as opened when viewed
  const handleOpenPdf = (pdf) => {
    setActivePdfModal(pdf);
    if (!progressState.openedPdfIds.includes(pdf.id)) {
      setProgressState(prev => ({
        ...prev,
        openedPdfIds: [...prev.openedPdfIds, pdf.id]
      }));
      showToast(`Opened "${pdf.title}". Progress tracked!`, 'info');
    }
  };

  const handleDownloadPdf = (pdf) => {
    const element = document.createElement('a');
    const file = new Blob([
      `# ${pdf.title}\n\nAuthor: ${pdf.author}\nDomain: ${details.domain}\nDate: ${new Date().toLocaleDateString()}\n\n---\n\n## Summary\n${pdf.contentSummary}\n\n## Key Topics\n${(pdf?.previewTopics || []).map(t => `- ${t}`).join('\n')}\n\n## Reference Notes\n${details?.overview?.explanation || ''}\n\nCareerPilot - Verified Curriculum Study Document`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${pdf.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    if (!progressState.openedPdfIds.includes(pdf.id)) {
      setProgressState(prev => ({
        ...prev,
        openedPdfIds: [...prev.openedPdfIds, pdf.id]
      }));
    }
    showToast(`Downloading "${pdf.title}"...`, 'success');
  };

  const handleWatchVideo = (video) => {
    setActiveVideoModal(video);
  };

  const toggleVideoWatched = (videoId) => {
    setProgressState(prev => {
      const isWatched = prev.watchedVideoIds.includes(videoId);
      const updated = isWatched
        ? prev.watchedVideoIds.filter(id => id !== videoId)
        : [...prev.watchedVideoIds, videoId];
      if (!isWatched) {
        showToast('Lesson marked as watched! Progress updated.', 'success');
      }
      return { ...prev, watchedVideoIds: updated };
    });
  };

  const toggleProjectCompleted = (projectTitle) => {
    setProgressState(prev => {
      const isDone = prev.completedProjectTitles.includes(projectTitle);
      const updated = isDone
        ? prev.completedProjectTitles.filter(t => t !== projectTitle)
        : [...prev.completedProjectTitles, projectTitle];
      if (!isDone) {
        showToast(`Project milestone "${projectTitle}" completed.`, 'success');
      }
      return { ...prev, completedProjectTitles: updated };
    });
  };

  const toggleNotesRead = () => {
    setProgressState(prev => {
      const next = !prev.notesRead;
      showToast(next ? 'Topic notes marked as read!' : 'Topic notes marked unread', 'info');
      return { ...prev, notesRead: next };
    });
  };

  const handleToggleRoadmapMilestone = () => {
    toggleTopicCompletion(phaseIdx, topic.id);
  };

  const copyCode = (snippet, idx) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeIdx(idx);
    showToast('Code snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Filtered resources based on user search query
  const filteredConcepts = details.overview.importantConcepts.filter(c =>
    c.concept.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPdfs = details.pdfNotes.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = details.youtubeTutorials.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBeginnerProjects = details.projects.beginner.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIntermediateProjects = details.projects.intermediate.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAdvancedProjects = details.projects.advanced.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto animate-fade-in">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Curriculum Roadmap</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleRoadmapMilestone}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              topic.completed
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow'
            }`}
          >
            {topic.completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Roadmap Milestone Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-white" />
                <span>Mark Milestone Complete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Learning Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-500/15 via-indigo-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Smart Learning Hub</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {phaseSemester || 'Semester Core'}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Domain: {details.domain}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{details.hours} Hours Estimated</span>
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {details.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {details.overview.explanation}
              </p>
            </div>

            {/* Live Progress Gauge */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shrink-0 min-w-[200px] shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-600 dark:text-slate-400">Topic Progress</span>
                <span className="text-brand-600 dark:text-brand-400">{topicProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${topicProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                {topicProgress === 100 ? 'Complete & Verified' : 'Track notes, PDFs, tutorials & projects'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* In-Page Resource Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search notes, PDFs, tutorials, practice questions, or projects for "${details.title}"...`}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Navigation Hub Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 select-none">
        {[
          { id: 'overview', label: 'Overview & Notes', icon: BookOpen },
          { id: 'pdf', label: `PDF Notes (${details.pdfNotes.length})`, icon: FileText },
          { id: 'youtube', label: `YouTube Masterclasses (${details.youtubeTutorials.length})`, icon: Video },
          { id: 'practice', label: 'Practice & Interview Qs', icon: Code2 },
          { id: 'projects', label: 'Recommended Projects', icon: FolderGit2 },
          { id: 'progress', label: `Progress Tracker (${topicProgress}%)`, icon: CheckCircle2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & LEARNING NOTES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Mark Notes Read Banner */}
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Study Notes & Core Invariants
                </h4>
                <p className="text-xs text-slate-400">
                  Read the principles below and check off to advance your progress gauge.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleNotesRead}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                progressState.notesRead
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500/40 border border-transparent'
              }`}
            >
              {progressState.notesRead ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Notes Marked Read</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>Mark Notes Read (+25%)</span>
                </>
              )}
            </button>
          </div>

          {/* Grid: What You Will Learn & Prerequisites */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What You Will Learn */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>What You Will Learn</span>
              </div>
              <ul className="space-y-2.5">
                {(Array.isArray(details?.overview?.whatYouWillLearn) ? details.overview.whatYouWillLearn : []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites */}
            <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <GraduationCap className="w-4 h-4" />
                <span>Foundational Prerequisites</span>
              </div>
              <ul className="space-y-2.5">
                {(Array.isArray(details?.overview?.prerequisites) ? details.overview.prerequisites : []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Concepts & Code Snippets */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-500" />
              <span>Core Architectural Concepts & Code Patterns</span>
            </h3>

            <div className="space-y-4">
              {filteredConcepts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.concept}
                    </h4>
                    <button
                      type="button"
                      onClick={() => copyCode(item.codeSnippet, idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                      title="Copy code"
                    >
                      {copiedCodeIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="rounded-xl overflow-hidden bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800/80">
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                      {item.codeSnippet}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes & Real World Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Common Mistakes */}
            <div className="glass-card rounded-3xl p-6 border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Mistakes & Anti-Patterns</span>
              </div>
              <ul className="space-y-2.5">
                {(Array.isArray(details?.overview?.commonMistakes) ? details.overview.commonMistakes : []).map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Real World Applications */}
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>Real-World Industry Applications</span>
              </div>
              <ul className="space-y-2.5">
                {(Array.isArray(details?.overview?.realWorldApplications) ? details.overview.realWorldApplications : []).map((app, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PDF RESOURCES */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                <span>Downloadable Study Guides & Hand-Written PDF Notes</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Verified technical notes covering cheat sheets, architecture blueprints, and 50 high-frequency interview questions.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold self-start">
              {progressState.openedPdfIds.length} of {details.pdfNotes.length} Opened
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPdfs.map((pdf) => {
              const isOpened = progressState.openedPdfIds.includes(pdf.id);
              return (
                <div
                  key={pdf.id}
                  className={`glass-card rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                    isOpened
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-brand-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
                        PDF Notes
                      </span>
                      {isOpened && (
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Opened</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {pdf.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{pdf.pages}</span>
                      <span>•</span>
                      <span>{pdf.size}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {pdf.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Included Sections
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {pdf.previewTopics.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPdf(pdf)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(pdf)}
                      className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: YOUTUBE MASTERCLASSES */}
      {activeTab === 'youtube' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-rose-500" />
                <span>Curated YouTube Masterclasses (Beginner → Advanced)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hand-picked lectures from top educators (Striver, Apna College, CodeWithHarry, freeCodeCamp, Programming with Mosh, Abdul Bari).
              </p>
            </div>

            <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold self-start">
              {progressState.watchedVideoIds.length} of {details.youtubeTutorials.length} Watched
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const isWatched = progressState.watchedVideoIds.includes(video.id);
              return (
                <div
                  key={video.id}
                  className={`glass-card rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                    isWatched
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-200/80 dark:border-white/10 hover:border-brand-500/40'
                  }`}
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900 group">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          video.level === 'Beginner'
                            ? 'bg-emerald-500/90 text-white'
                            : video.level === 'Intermediate'
                            ? 'bg-brand-500/90 text-white'
                            : 'bg-purple-600/90 text-white'
                        }`}
                      >
                        {video.level} Tier
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[11px] font-bold">
                      {video.duration}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleWatchVideo(video)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-glow transform transition-transform group-hover:scale-110">
                        <Play className="w-5 h-5 fill-white translate-x-0.5" />
                      </div>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {video.channel}
                        </span>
                        <span>{video.views}</span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                        {video.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleWatchVideo(video)}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Watch Tutorial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleVideoWatched(video.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                          isWatched
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
                        }`}
                        title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PRACTICE & INTERVIEW PREPARATION */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Practice Platforms Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-500" />
              <span>Recommended Practice Platforms & Problem Sets</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Array.isArray(details?.practiceResources) ? details.practiceResources : []).map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500">
                        {res.badge}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {res.platform}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {res.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mt-3 block">
                    {res.problemCount} →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Practice Questions */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-500" />
              <span>Algorithmic Practice Questions & Hints</span>
            </h3>

            <div className="space-y-3">
              {(Array.isArray(details?.overview?.practiceQuestions) ? details.overview.practiceQuestions : []).map((q, idx) => {
                const isExpanded = expandedPracticeIdx === idx;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div
                      onClick={() => setExpandedPracticeIdx(isExpanded ? null : idx)}
                      className="flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' : q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {q.difficulty}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {q.title}
                        </h4>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <p className="text-slate-500 dark:text-slate-400">
                          <strong className="text-amber-500">Hint:</strong> {q.hint}
                        </p>
                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          <strong className="text-emerald-500 block mb-1">Model Solution Strategy:</strong>
                          {q.answer}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Interview Questions */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-500" />
              <span>High-Yield Technical Interview Questions</span>
            </h3>

            <div className="space-y-3">
              {(Array.isArray(details?.overview?.interviewQuestions) ? details.overview.interviewQuestions : []).map((iq, idx) => {
                const isExpanded = expandedInterviewIdx === idx;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <div
                      onClick={() => setExpandedInterviewIdx(isExpanded ? null : idx)}
                      className="flex items-start justify-between cursor-pointer select-none gap-4"
                    >
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {iq.question}
                      </h4>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-brand-500/5 p-3 rounded-xl border border-brand-500/20">
                        <strong className="text-brand-600 dark:text-brand-400 block mb-1">
                          Senior Interview Answer Rubric:
                        </strong>
                        {iq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COURSE-SPECIFIC PROJECT RECOMMENDATION SYSTEM */}
      {activeTab === 'projects' && (
        <div className="space-y-8">
          {/* Dynamic Criteria Tailoring Banner */}
          <div className="glass-card rounded-3xl p-6 border border-brand-500/30 bg-brand-500/5 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Dynamic Project Recommendation Engine</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Tailored Capstones for {details.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Projects dynamically suggested based on your verified criteria:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  Branch: <strong>{details.branch}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  Standing: <strong>Semester {details.semester}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 font-bold text-brand-600 dark:text-brand-400">
                  Target Role: <strong>{details.targetRole}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 1. Beginner Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Beginner Foundations Projects</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Hands-on projects to solidify core concepts before moving to complex systems.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                Tier 1
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredBeginnerProjects.map((proj, idx) => {
                const isCompleted = progressState.completedProjectTitles.includes(proj.title);
                return (
                  <div
                    key={idx}
                    className={`glass-card rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-slate-200/80 dark:border-white/10 hover:border-brand-500/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {proj.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {proj.duration}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                        {proj.title}
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tech Stack
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(proj?.tech) ? proj.tech : []).map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProjectCompleted(proj.title)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Project Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Intermediate Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <span>Intermediate Full-Featured Applications</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Production-grade apps that directly showcase resume capability for internship screening.
                </p>
              </div>
              <span className="text-xs font-bold text-brand-500 px-2.5 py-0.5 rounded-full bg-brand-500/10">
                Tier 2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredIntermediateProjects.map((proj, idx) => {
                const isCompleted = progressState.completedProjectTitles.includes(proj.title);
                return (
                  <div
                    key={idx}
                    className={`glass-card rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-slate-200/80 dark:border-white/10 hover:border-brand-500/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                          {proj.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {proj.duration}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                        {proj.title}
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tech Stack
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(proj?.tech) ? proj.tech : []).map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProjectCompleted(proj.title)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Project Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mark as Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Advanced / Major Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Major Capstone & Advanced Architectures</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Large-scale distributed systems and AI platforms that win hackathons and distinguish top-tier candidates.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-500 px-2.5 py-0.5 rounded-full bg-purple-500/10">
                Tier 3 Advanced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAdvancedProjects.map((proj, idx) => {
                const isCompleted = progressState.completedProjectTitles.includes(proj.title);
                return (
                  <div
                    key={idx}
                    className={`glass-card rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                      isCompleted
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          {proj.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {proj.duration}
                        </span>
                      </div>

                      <h5 className="font-bold text-base text-slate-900 dark:text-white">
                        {proj.title}
                      </h5>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs">
                        <strong className="text-brand-600 dark:text-brand-400 block mb-1">Architecture Blueprint:</strong>
                        <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{proj.architecture}</span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Tech Stack
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(proj?.tech) ? proj.tech : []).map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProjectCompleted(proj.title)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-glow hover:opacity-95'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Advanced Capstone Completed</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Mark Capstone Completed (+25%)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PROGRESS TRACKER */}
      {activeTab === 'progress' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {details.title} Progress Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically calculated from your reading, study materials, watched masterclasses, and built projects.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                {topicProgress}%
              </span>
              <div className="w-32 bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${topicProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4 Interactive Trackers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Notes Read */}
            <div
              onClick={toggleNotesRead}
              className={`p-5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
                progressState.notesRead
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${progressState.notesRead ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Core Notes & Invariants Read
                  </h4>
                  <span className="text-xs text-slate-400">25% of topic milestone</span>
                </div>
              </div>

              {progressState.notesRead ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Circle className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {/* 2. PDF Materials Opened */}
            <div
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                progressState.openedPdfIds.length > 0
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${progressState.openedPdfIds.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    PDF Study Guides Opened
                  </h4>
                  <span className="text-xs text-slate-400">
                    {progressState.openedPdfIds.length} of {details.pdfNotes.length} Guides Consulted
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {Math.round((progressState.openedPdfIds.length / Math.max(1, details.pdfNotes.length)) * 25)}% / 25%
              </span>
            </div>

            {/* 3. YouTube Masterclasses Watched */}
            <div
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                progressState.watchedVideoIds.length > 0
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${progressState.watchedVideoIds.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    YouTube Tutorials Watched
                  </h4>
                  <span className="text-xs text-slate-400">
                    {progressState.watchedVideoIds.length} of {details.youtubeTutorials.length} Lessons Finished
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {Math.round((progressState.watchedVideoIds.length / Math.max(1, details.youtubeTutorials.length)) * 25)}% / 25%
              </span>
            </div>

            {/* 4. Projects Completed */}
            <div
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                progressState.completedProjectTitles.length > 0
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${progressState.completedProjectTitles.length > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Capstone Projects Completed
                  </h4>
                  <span className="text-xs text-slate-400">
                    {progressState.completedProjectTitles.length} Project Milestones Built
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                {Math.min(25, progressState.completedProjectTitles.length * 12.5)}% / 25%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-500 shrink-0" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Completing this topic increases your overall <strong>{details.targetRole}</strong> Readiness Index by directly satisfying corporate interview screening criteria.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleRoadmapMilestone}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow shrink-0"
            >
              {topic.completed ? 'Roadmap Milestone Verified' : 'Complete Topic Now'}
            </button>
          </div>
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      {activePdfModal && (
        <Modal
          isOpen={!!activePdfModal}
          onClose={() => setActivePdfModal(null)}
          title={`Document Viewer: ${activePdfModal.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Header info bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold">{activePdfModal.author}</span>
              <div className="flex items-center gap-3">
                <span>{activePdfModal.pages}</span>
                <span>•</span>
                <span>{activePdfModal.size}</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold">Verified PDF</span>
              </div>
            </div>

            {/* Document Viewer Frame simulation */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 font-serif text-slate-800 dark:text-slate-200 text-sm leading-relaxed max-h-96 overflow-y-auto shadow-inner">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white">
                  {activePdfModal.title}
                </h2>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  CareerPilot Curriculum • Semester {details.semester} Hand-Written Notes
                </p>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <h4 className="font-bold text-sm text-brand-600 dark:text-brand-400">
                  Chapter 1: Conceptual Foundation
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activePdfModal.contentSummary}
                </p>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h5 className="font-bold text-slate-900 dark:text-white mb-1.5">
                    Core Study Syllabus:
                  </h5>
                  <ul className="space-y-1 text-slate-500 dark:text-slate-400">
                    {(Array.isArray(activePdfModal?.previewTopics) ? activePdfModal.previewTopics : []).map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand-500" />
                        <span>Section {idx + 1}: {t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tracked in Progress Metrics</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePdfModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close Reader
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(activePdfModal)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* YOUTUBE WATCH MODAL */}
      {activeVideoModal && (
        <Modal
          isOpen={!!activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
          title={activeVideoModal.title}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Embedded Player Simulator */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl flex items-center justify-center group">
              <img
                src={activeVideoModal.thumbnail}
                alt={activeVideoModal.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <a
                  href={activeVideoModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-glow transform hover:scale-110 transition-all"
                >
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </a>
                <p className="text-xs font-bold text-white tracking-wide">
                  Click to open lecture in high-definition on YouTube
                </p>
                <span className="text-[11px] text-slate-300">
                  Instructor: <strong>{activeVideoModal.channel}</strong> • Duration: {activeVideoModal.duration}
                </span>
              </div>
            </div>

            {/* Video Lesson Description & Actions */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {activeVideoModal.level} Masterclass
                </span>
                <span className="text-xs text-slate-400">Rating: {activeVideoModal.rating}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeVideoModal.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => toggleVideoWatched(activeVideoModal.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  progressState.watchedVideoIds.includes(activeVideoModal.id)
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {progressState.watchedVideoIds.includes(activeVideoModal.id)
                    ? 'Lesson Completed'
                    : 'Mark as Watched (+25%)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close Video
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
