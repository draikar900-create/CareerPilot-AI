import React, { useState, useEffect } from 'react';
import { LEARNING_RESOURCES } from '../../data/mockData';
import { useToast } from '../../context/ToastContext';
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
  Layers
} from 'lucide-react';

export default function Resources() {
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'saved'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const tabs = [
    'All',
    'Videos',
    'Courses',
    'Blogs',
    'Documentation',
    'Practice Platforms'
  ];

  const baseList = activeSection === 'saved'
    ? LEARNING_RESOURCES.filter(r => savedResourceIds.includes(r.id))
    : LEARNING_RESOURCES;

  const filteredResources = baseList.filter((res) => {
    const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curated Knowledge Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Learning Resources & Practice Platforms
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            World-class tutorials, open-source documentation, system design primers, and interactive coding sandboxes vetted by staff engineers.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs (All Resources vs Saved Resources) */}
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
              {LEARNING_RESOURCES.length}
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

        {/* Global Resource Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by title, provider, or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-xs transition-all"
          />
        </div>
      </div>

      {/* Multi-Tabs: Videos, Courses, Blogs, Documentation, Practice Platforms */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveCategory(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab
                ? 'bg-brand-600 text-white shadow-glow'
                : 'bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State for Saved Resources */}
      {activeSection === 'saved' && baseList.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No saved resources yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Bookmark high-yield tutorials, official documentation, and interactive platforms by clicking Save on any card.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveSection('all')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Resources</span>
            </button>
          </div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-white/10 space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No resources found matching the selected category or search query.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-brand-500 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Resources Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isSaved = savedResourceIds.includes(res.id);

            return (
              <div
                key={res.id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  {/* Header: Category & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                      {res.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{res.rating}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaveResource(res)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isSaved ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={isSaved ? 'Remove from saved' : 'Save resource'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-brand-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-xs text-brand-500 font-semibold mt-1">
                    Source: {res.provider}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Duration */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {res.duration}
                    </span>
                  </div>
                </div>

                {/* Open Resource & Save Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleSaveResource(res)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                        : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-600 hover:text-white'
                    }`}
                    title={isSaved ? 'Click to remove from saved' : 'Save resource'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved ✓' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
