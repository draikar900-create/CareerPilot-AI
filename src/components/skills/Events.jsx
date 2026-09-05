import React, { useState, useMemo } from 'react';
import { useEvents } from '../../context/EventsContext';
import Modal from '../common/Modal';
import {
  Calendar,
  MapPin,
  Globe,
  Tag,
  Search,
  ExternalLink,
  Bookmark,
  Building2,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  School,
  Share2,
  Users,
  ShieldCheck,
  AlertCircle,
  Trophy,
  SlidersHorizontal,
  ChevronRight,
  Compass
} from 'lucide-react';

export default function Events({ setActiveTab }) {
  const {
    colleges,
    events,
    savedEventIds,
    toggleSaveEvent,
    isEventSaved,
    eventTypes,
    eventModes
  } = useEvents();

  // Navigation states
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);
  const [activeTab, setLocalActiveTab] = useState('colleges'); // 'colleges' | 'saved'

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [selectedFee, setSelectedFee] = useState('All'); // 'All' | 'Free' | 'Paid'
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Active college object if one is selected
  const activeCollege = useMemo(() => {
    if (!selectedCollegeId) return null;
    return colleges.find((c) => c.id === selectedCollegeId) || null;
  }, [colleges, selectedCollegeId]);

  // College-wise event count map
  const eventCountsByCollege = useMemo(() => {
    const counts = {};
    colleges.forEach((col) => {
      counts[col.id] = events.filter((e) => e.collegeId === col.id || e.collegeName?.toLowerCase() === col.name?.toLowerCase()).length;
    });
    return counts;
  }, [colleges, events]);

  // Filtered colleges list based on search and event type filter
  const filteredColleges = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return colleges.filter((col) => {
      const colEvents = events.filter(
        (e) => e.collegeId === col.id || e.collegeName?.toLowerCase() === col.name?.toLowerCase()
      );

      // Search match: College Name, location, or events within this college matching name/type
      const matchesSearch =
        !q ||
        col.name.toLowerCase().includes(q) ||
        (col.shortName && col.shortName.toLowerCase().includes(q)) ||
        (col.location && col.location.toLowerCase().includes(q)) ||
        colEvents.some(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.type.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        );

      // Type match: If a specific event type is selected, college must have an event of that type
      const matchesType =
        selectedType === 'All' || colEvents.some((e) => e.type === selectedType);

      return matchesSearch && matchesType;
    });
  }, [colleges, events, searchQuery, selectedType]);

  // Filtered events for the currently selected college
  const collegeEvents = useMemo(() => {
    if (!selectedCollegeId && activeTab !== 'saved') return [];

    let list = [];
    if (activeTab === 'saved') {
      list = events.filter((e) => savedEventIds.includes(e.id));
    } else if (activeCollege) {
      list = events.filter(
        (e) =>
          e.collegeId === activeCollege.id ||
          e.collegeName?.toLowerCase() === activeCollege.name?.toLowerCase()
      );
    }

    const q = searchQuery.toLowerCase().trim();

    return list.filter((evt) => {
      // Search: event name, college name, type, venue, description
      const matchesSearch =
        !q ||
        evt.name.toLowerCase().includes(q) ||
        evt.collegeName?.toLowerCase().includes(q) ||
        evt.type.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        (evt.organizer && evt.organizer.toLowerCase().includes(q));

      // Event Type
      const matchesType = selectedType === 'All' || evt.type === selectedType;

      // Mode: Online / Offline / Hybrid
      const matchesMode =
        selectedMode === 'All' ||
        evt.mode?.toLowerCase() === selectedMode.toLowerCase() ||
        (selectedMode === 'Online' && evt.isOnline);

      // Registration Fee: Free / Paid
      const isFree = evt.fee?.toLowerCase().trim() === 'free' || evt.fee?.trim() === '₹0';
      const matchesFee =
        selectedFee === 'All' ||
        (selectedFee === 'Free' && isFree) ||
        (selectedFee === 'Paid' && !isFree);

      return matchesSearch && matchesType && matchesMode && matchesFee;
    });
  }, [selectedCollegeId, activeCollege, activeTab, events, savedEventIds, searchQuery, selectedType, selectedMode, selectedFee]);

  // Color mapping for event types
  const getBadgeColor = (type) => {
    switch (type) {
      case 'Hackathon':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Ideathon':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Coding Contest':
      case 'AI/ML Competition':
        return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20';
      case 'Technical Fest':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Workshop':
      case 'Bootcamp':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'Paper Presentation':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Project Exhibition':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    }
  };

  // Mode badge styling
  const getModeBadge = (mode) => {
    const m = (mode || 'Offline').toLowerCase();
    if (m === 'online') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Globe className="w-3 h-3" /> Online
        </span>
      );
    }
    if (m === 'hybrid') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <Compass className="w-3 h-3" /> Hybrid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20">
        <MapPin className="w-3 h-3 text-slate-400" /> On Campus
      </span>
    );
  };

  const handleSelectCollege = (colId) => {
    setSelectedCollegeId(colId);
    setLocalActiveTab('colleges');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToColleges = () => {
    setSelectedCollegeId(null);
    setSearchQuery('');
    setSelectedType('All');
    setSelectedMode('All');
    setSelectedFee('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <School className="w-3.5 h-3.5" />
              <span>Career Growth Hub • College-Wise Events</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Engineering College Events & Hackathons
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Explore hackathons, ideathons, workshops, and technical symposiums organized college-wise by premier IITs, NITs, and top autonomous institutions.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
              <span className="block text-2xl font-black text-slate-900 dark:text-white leading-none">
                {colleges.length}
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                Colleges
              </span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-center">
              <span className="block text-2xl font-black text-brand-600 dark:text-brand-400 leading-none">
                {events.length}
              </span>
              <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider mt-1 block">
                Live Events
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Switcher: Colleges Directory vs Saved Events */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
          <button
            onClick={() => {
              setLocalActiveTab('colleges');
              if (activeCollege) setSelectedCollegeId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'colleges' && !selectedCollegeId
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Colleges Directory</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'colleges' && !selectedCollegeId ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {colleges.length}
            </span>
          </button>

          {selectedCollegeId && activeCollege && activeTab === 'colleges' && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-bold animate-fade-in">
              <span>{activeCollege.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500 text-white ml-1">
                {collegeEvents.length}
              </span>
            </div>
          )}

          <button
            onClick={() => {
              setLocalActiveTab('saved');
              setSelectedCollegeId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedEventIds.length > 0 ? 'fill-current text-amber-400' : ''}`} />
            <span>Saved Events</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === 'saved' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'
            }`}>
              {savedEventIds.length}
            </span>
          </button>
        </div>

        {/* Breadcrumb / Context indicator */}
        {selectedCollegeId && activeCollege ? (
          <button
            onClick={handleBackToColleges}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Colleges</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            {activeTab === 'saved'
              ? `Viewing ${collegeEvents.length} Saved Event${collegeEvents.length !== 1 ? 's' : ''}`
              : `Showing ${filteredColleges.length} of ${colleges.length} Colleges`}
          </span>
        )}
      </div>

      {/* Global & In-College Search & Filter Bar */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedCollegeId && activeCollege
                ? `Search events in ${activeCollege.name} by event name, type, topic...`
                : "Search by College Name, Event Name (Hackathon, Ideathon, Workshop, Tech Fest)..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-xs transition-all"
          />
        </div>

        {/* Filter Controls: Event Type, Mode, Fee */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Event Type Filter Pills */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Event Category / Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/50 font-medium"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Event Types (Hackathon, Ideathon, Workshop...)' : type}
                </option>
              ))}
            </select>
          </div>

          {(selectedCollegeId || activeTab === 'saved') && (
            <>
              {/* Venue Mode Filter */}
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Event Mode
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/50 font-medium"
                >
                  <option value="All">All Modes (Online / Campus / Hybrid)</option>
                  <option value="Online">Online Only</option>
                  <option value="Offline">On Campus (In-Person)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Registration Fee Filter */}
              <div className="w-full sm:w-36">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Registration Fee
                </label>
                <select
                  value={selectedFee}
                  onChange={(e) => setSelectedFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/50 font-medium"
                >
                  <option value="All">All Fees</option>
                  <option value="Free">Free Only</option>
                  <option value="Paid">Paid Only</option>
                </select>
              </div>
            </>
          )}

          {(searchQuery || selectedType !== 'All' || selectedMode !== 'All' || selectedFee !== 'All') && (
            <div className="self-end pb-0.5">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedMode('All');
                  setSelectedFee('All');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: COLLEGES DIRECTORY (Default Student Landing)                     */}
      {/* ========================================================================= */}
      {activeTab === 'colleges' && !selectedCollegeId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Select an Engineering Institution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any college card to explore technical events, hackathons, and registration portals conducted by that institution.
              </p>
            </div>
          </div>

          {filteredColleges.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <School className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No institutions match your search
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try searching for another college name (e.g., IIT Bombay, NIT Surathkal, BMS, RVCE) or reset your filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-all cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((col) => {
                const eventCount = eventCountsByCollege[col.id] || 0;
                return (
                  <div
                    key={col.id}
                    onClick={() => handleSelectCollege(col.id)}
                    className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-500/40"
                  >
                    {/* Top gradient glow on hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full filter blur-xl group-hover:bg-brand-500/15 transition-all pointer-events-none" />

                    <div className="space-y-4">
                      {/* College Header: Logo + Badge + Active Events */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="relative">
                          <img
                            src={col.logo}
                            alt={col.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              // Fallback placeholder with monogram
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80';
                            }}
                          />
                          {col.shortName && (
                            <span className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-900 text-white dark:bg-brand-600 shadow">
                              {col.shortName}
                            </span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            eventCount > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}>
                            <Sparkles className="w-3 h-3" />
                            {eventCount} {eventCount === 1 ? 'Event' : 'Events'} Active
                          </span>
                        </div>
                      </div>

                      {/* College Name & Tagline */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors leading-snug">
                          {col.name}
                        </h3>
                        {col.badge && (
                          <span className="text-[10px] font-bold text-brand-500 dark:text-brand-400 mt-0.5 block">
                            {col.badge}
                          </span>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{col.location || 'Campus'}</span>
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {col.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                      {col.website ? (
                        <a
                          href={col.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-semibold text-slate-500 hover:text-brand-500 flex items-center gap-1 transition-colors"
                          title="Visit official college website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Official Website</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Campus Portal</span>
                      )}

                      <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                        <span>View Events</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: COLLEGE EVENTS PAGE (Opened when student selects a college)       */}
      {/* ========================================================================= */}
      {activeTab === 'colleges' && selectedCollegeId && activeCollege && (
        <div className="space-y-6 animate-fade-in">
          {/* Selected College Header Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden bg-gradient-to-r from-brand-500/5 via-purple-500/5 to-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={activeCollege.logo}
                  alt={activeCollege.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {activeCollege.type || 'Engineering College'}
                    </span>
                    {activeCollege.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {activeCollege.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeCollege.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {activeCollege.location}
                    </span>
                    {activeCollege.website && (
                      <>
                        <span>•</span>
                        <a
                          href={activeCollege.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Official Portal</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Action: Switch college */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToColleges}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Choose Another College</span>
                </button>
              </div>
            </div>
          </div>

          {/* Available Events Title & Count */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Available Events ({collegeEvents.length})
              </h3>
              <p className="text-xs text-slate-400">
                All upcoming technical events, competitions, and hackathons hosted by {activeCollege.name}
              </p>
            </div>
          </div>

          {/* Events Grid */}
          {collegeEvents.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-white/10 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No events currently match your filters for {activeCollege.name}.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try resetting your event type or mode filters, or check back soon for new event announcements.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedMode('All');
                  setSelectedFee('All');
                }}
                className="text-xs font-bold text-brand-500 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collegeEvents.map((evt) => {
                const isSaved = isEventSaved(evt.id);

                return (
                  <div
                    key={evt.id}
                    className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all"
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges: Type, Mode, Fee */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBadgeColor(evt.type)}`}>
                          {evt.type}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {getModeBadge(evt.mode)}
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                            evt.fee?.toLowerCase() === 'free' || evt.fee === '₹0'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                          }`}>
                            {evt.fee}
                          </span>
                        </div>
                      </div>

                      {/* Event Name */}
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {evt.name}
                        </h4>

                        {/* Organizer */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.organizer || evt.conductedBy || activeCollege.name}</span>
                        </p>
                      </div>

                      {/* Dates & Deadlines Box */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-brand-500" /> Event Date:
                          </span>
                          <span className="font-bold text-brand-600 dark:text-brand-400 text-[11px]">
                            {evt.eventDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-1.5">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-500" /> Reg. Deadline:
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400 text-[11px]">
                            {evt.regDeadline || evt.regCloseDate || 'Rolling Registration'}
                          </span>
                        </div>
                      </div>

                      {/* Venue */}
                      <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{evt.venue}</span>
                      </div>

                      {/* Eligibility */}
                      {evt.eligibility && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 text-[11px]">
                            <strong className="text-slate-400 font-medium">Eligibility:</strong> {evt.eligibility}
                          </span>
                        </div>
                      )}

                      {/* Description snippet */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Highlights */}
                      {evt.highlights && evt.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {evt.highlights.slice(0, 3).map((h, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions: Register Now + Save Event */}
                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Register Button */}
                        <a
                          href={evt.regUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <span>Register Now</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Save Event Button */}
                        <button
                          type="button"
                          onClick={() => toggleSaveEvent(evt)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-500'
                          }`}
                          title={isSaved ? 'Click to remove from saved' : 'Save Event'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          <span>{isSaved ? 'Saved ✓' : 'Save Event'}</span>
                        </button>
                      </div>

                      {/* Quick Details link */}
                      <button
                        type="button"
                        onClick={() => setSelectedEventModal(evt)}
                        className="w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-brand-500 transition-colors cursor-pointer"
                      >
                        View Full Event Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SAVED EVENTS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Your Bookmarked Events ({savedEventIds.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your saved hackathons, symposiums, and competitions across all participating institutions.
            </p>
          </div>

          {collegeEvents.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                No saved events yet.
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Explore events conducted by IIT Bombay, NIT Surathkal, RVCE, and other colleges and click "Save Event" to bookmark them here.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setLocalActiveTab('colleges');
                    setSelectedCollegeId(null);
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Browse Colleges & Events</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collegeEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* College indicator & Type */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-brand-500 flex items-center gap-1 truncate">
                        <School className="w-3.5 h-3.5 shrink-0" />
                        {evt.collegeName}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(evt.type)}`}>
                        {evt.type}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {evt.name}
                    </h4>

                    {/* Schedule */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date:</span>
                        <span className="font-bold text-brand-500">{evt.eventDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fee:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{evt.fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deadline:</span>
                        <span className="font-bold text-rose-500">{evt.regDeadline || evt.regCloseDate}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <a
                      href={evt.regUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      <span>Register Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => toggleSaveEvent(evt)}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVENT DETAILS MODAL                                                      */}
      {/* ========================================================================= */}
      {selectedEventModal && (
        <Modal
          isOpen={!!selectedEventModal}
          onClose={() => setSelectedEventModal(null)}
          title={selectedEventModal.name}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(selectedEventModal.type)}`}>
                {selectedEventModal.type}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Fee: {selectedEventModal.fee}
              </span>
              {getModeBadge(selectedEventModal.mode)}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">College / University:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEventModal.collegeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Organizer:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEventModal.organizer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Venue:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedEventModal.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Event Date:</span>
                <span className="font-bold text-brand-500">{selectedEventModal.eventDate}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <span className="text-slate-400">Registration Deadline:</span>
                <span className="font-bold text-rose-500">{selectedEventModal.regDeadline || selectedEventModal.regCloseDate}</span>
              </div>
              {selectedEventModal.eligibility && (
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5">
                  <span className="text-slate-400">Eligibility:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-right max-w-xs">{selectedEventModal.eligibility}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedEventModal.description}
            </p>

            {selectedEventModal.highlights && selectedEventModal.highlights.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Event Highlights & Rewards
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedEventModal.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-3 py-1 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => toggleSaveEvent(selectedEventModal)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEventSaved(selectedEventModal.id)
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isEventSaved(selectedEventModal.id) ? 'fill-current' : ''}`} />
                <span>{isEventSaved(selectedEventModal.id) ? 'Saved ✓' : 'Save Event'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={selectedEventModal.regUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Official Registration Form</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
