import React, { useState, useMemo } from 'react';
import { useEvents } from '../../context/EventsContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import {
  Calendar,
  Building2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  School,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Tag,
  RefreshCw
} from 'lucide-react';

export default function AdminEvents() {
  const {
    colleges,
    events,
    addCollege,
    updateCollege,
    deleteCollege,
    addEvent,
    updateEvent,
    deleteEvent,
    resetToDefaultData,
    eventTypes,
    eventModes
  } = useEvents();

  const { showToast } = useToast();

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState('events'); // 'events' | 'colleges'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Modals state
  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deletingCollege, setDeletingCollege] = useState(null);

  // College Form State
  const initialCollegeForm = {
    name: '',
    shortName: '',
    logo: '',
    website: '',
    location: '',
    badge: 'Premier Institute',
    description: ''
  };
  const [collegeForm, setCollegeForm] = useState(initialCollegeForm);

  // Event Form State
  const initialEventForm = {
    collegeId: colleges[0]?.id || '',
    collegeName: colleges[0]?.name || '',
    name: '',
    type: 'Hackathon',
    description: '',
    eventDate: '',
    regDeadline: '',
    venue: '',
    fee: 'Free',
    regUrl: '',
    eligibility: 'Open to all Engineering & Tech Students',
    mode: 'Offline',
    organizer: '',
    highlights: 'National Certificate, Cash Prizes'
  };
  const [eventForm, setEventForm] = useState(initialEventForm);

  // Filtered Events in Admin view
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (events || []).filter((evt) => {
      const matchesSearch =
        !q ||
        (evt.name || evt.title || '').toLowerCase().includes(q) ||
        (evt.collegeName || evt.college_name || '').toLowerCase().includes(q) ||
        (evt.type || '').toLowerCase().includes(q) ||
        (evt.venue || '').toLowerCase().includes(q) ||
        (evt.description || '').toLowerCase().includes(q);

      const matchesCollege =
        selectedCollegeFilter === 'All' ||
        evt.collegeId === selectedCollegeFilter ||
        evt.collegeName === selectedCollegeFilter;

      const matchesType =
        selectedTypeFilter === 'All' || evt.type === selectedTypeFilter;

      return matchesSearch && matchesCollege && matchesType;
    });
  }, [events, searchQuery, selectedCollegeFilter, selectedTypeFilter]);

  // Filtered Colleges in Admin view
  const filteredColleges = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return colleges.filter((c) => {
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.shortName && c.shortName.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
      );
    });
  }, [colleges, searchQuery]);

  // Handlers for Add College
  const handleOpenAddCollege = () => {
    setCollegeForm({
      name: '',
      shortName: '',
      logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80',
      website: 'https://',
      location: '',
      badge: 'Premier Institute',
      description: ''
    });
    setShowAddCollegeModal(true);
  };

  const handleSaveCollege = (e) => {
    e.preventDefault();
    if (!collegeForm.name.trim()) {
      showToast('College Name is required', 'error');
      return;
    }
    if (!collegeForm.website.trim() || collegeForm.website === 'https://') {
      showToast('Valid College Website URL is required', 'error');
      return;
    }

    addCollege(collegeForm);
    setShowAddCollegeModal(false);
  };

  // Handlers for Add Event
  const handleOpenAddEvent = () => {
    const firstCol = colleges[0];
    setEventForm({
      ...initialEventForm,
      collegeId: firstCol ? firstCol.id : '',
      collegeName: firstCol ? firstCol.name : '',
      venue: firstCol ? `${firstCol.name} Campus` : 'Campus Auditorium',
      organizer: firstCol ? `${firstCol.name} Student Council` : 'College Tech Club'
    });
    setShowAddEventModal(true);
  };

  const handleCollegeSelectInEvent = (colId) => {
    const selected = colleges.find((c) => c.id === colId);
    if (selected) {
      setEventForm((prev) => ({
        ...prev,
        collegeId: selected.id,
        collegeName: selected.name,
        venue: prev.venue || `${selected.name} Campus`,
        organizer: prev.organizer || `${selected.name} Technical Council`
      }));
    }
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!eventForm.name.trim()) {
      showToast('Event Name is required', 'error');
      return;
    }
    if (!eventForm.collegeName.trim()) {
      showToast('Please select or specify a College', 'error');
      return;
    }
    if (!eventForm.eventDate.trim()) {
      showToast('Event Date is required', 'error');
      return;
    }
    if (!eventForm.regDeadline.trim()) {
      showToast('Registration Deadline is required', 'error');
      return;
    }
    if (!eventForm.regUrl.trim()) {
      showToast('Registration Link is required', 'error');
      return;
    }

    addEvent(eventForm);
    setShowAddEventModal(false);
  };

  // Handlers for Edit Event
  const handleOpenEditEvent = (evt) => {
    setEditingEvent({
      ...evt,
      highlights: Array.isArray(evt.highlights) ? evt.highlights.join(', ') : evt.highlights || ''
    });
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    if (!editingEvent.name.trim()) {
      showToast('Event Name is required', 'error');
      return;
    }
    if (!editingEvent.eventDate.trim()) {
      showToast('Event Date is required', 'error');
      return;
    }
    if (!editingEvent.regDeadline.trim()) {
      showToast('Registration Deadline is required', 'error');
      return;
    }
    if (!editingEvent.regUrl.trim()) {
      showToast('Registration Link is required', 'error');
      return;
    }

    const payload = {
      ...editingEvent,
      highlights: typeof editingEvent.highlights === 'string'
        ? editingEvent.highlights.split(',').map((h) => h.trim()).filter(Boolean)
        : editingEvent.highlights
    };

    updateEvent(editingEvent.id, payload);
    setEditingEvent(null);
  };

  // Handlers for Delete Event with Confirmation
  const handleConfirmDeleteEvent = () => {
    if (deletingEvent) {
      deleteEvent(deletingEvent.id);
      setDeletingEvent(null);
    }
  };

  // Handlers for Delete College with Confirmation
  const handleConfirmDeleteCollege = () => {
    if (deletingCollege) {
      deleteCollege(deletingCollege.id);
      setDeletingCollege(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Admin Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console • Event Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              College & Event Management Suite
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Add and curate partner colleges, publish hackathons and technical symposiums, manage registration links, and configure event deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddCollege}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <School className="w-4 h-4 text-indigo-500" />
              <span>Add College</span>
            </button>

            <button
              onClick={handleOpenAddEvent}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Colleges
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {colleges.length}
            </span>
            <School className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Live Events
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {events.length}
            </span>
            <Calendar className="w-5 h-5 text-brand-500" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Online / Hybrid
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-500">
              {events.filter((e) => e.mode === 'Online' || e.mode === 'Hybrid').length}
            </span>
            <Globe className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Free Competitions
          </span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-purple-500">
              {events.filter((e) => e.fee?.toLowerCase() === 'free' || e.fee === '₹0').length}
            </span>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Admin Tabs Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminTab === 'events'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Events ({events.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('colleges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              adminTab === 'colleges'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Manage Colleges ({colleges.length})</span>
          </button>
        </div>

        <button
          onClick={resetToDefaultData}
          className="text-[11px] text-slate-400 hover:text-brand-500 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          title="Restore sample institutions and events"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Sample Catalogue</span>
        </button>
      </div>

      {/* Admin Search & Filters */}
      <div className="glass-card rounded-3xl p-4 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              adminTab === 'events'
                ? 'Search events by name, college, type, venue...'
                : 'Search colleges by institution name or location...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-xs"
          />
        </div>

        {adminTab === 'events' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedCollegeFilter}
              onChange={(e) => setSelectedCollegeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/50 font-medium"
            >
              <option value="All">All Colleges ({colleges.length})</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500/50 font-medium"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EVENTS MANAGEMENT TABLE & CARDS                                   */}
      {/* ========================================================================= */}
      {adminTab === 'events' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-white/10 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No events match your criteria.
              </p>
              <button
                onClick={handleOpenAddEvent}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Event</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* College & Type badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 truncate">
                        <School className="w-3.5 h-3.5 shrink-0" />
                        {evt.collegeName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {evt.type}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {evt.mode}
                        </span>
                      </div>
                    </div>

                    {/* Event Name */}
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {evt.name}
                    </h3>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                      <div>
                        <span className="text-slate-400 block">Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {evt.eventDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Deadline:</span>
                        <span className="font-bold text-rose-500 truncate block">
                          {evt.regDeadline || evt.regCloseDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Fee:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {evt.fee}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Venue:</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300 truncate block">
                          {evt.venue}
                        </span>
                      </div>
                    </div>

                    {evt.eligibility && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        <strong className="text-slate-400">Eligibility:</strong> {evt.eligibility}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {evt.description}
                    </p>
                  </div>

                  {/* Actions: External Link + Edit + Delete */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <a
                      href={evt.regUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-500 hover:text-brand-500 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Registration URL</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditEvent(evt)}
                        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingEvent(evt)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COLLEGES DIRECTORY MANAGEMENT                                     */}
      {/* ========================================================================= */}
      {adminTab === 'colleges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredColleges.map((col) => {
              const count = events.filter((e) => e.collegeId === col.id || e.collegeName?.toLowerCase() === col.name?.toLowerCase()).length;
              return (
                <div
                  key={col.id}
                  className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <img
                        src={col.logo}
                        alt={col.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        {count} {count === 1 ? 'Event' : 'Events'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                        {col.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{col.location}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {col.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <a
                      href={col.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </a>

                    <button
                      onClick={() => setDeletingCollege(col)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete College"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD COLLEGE                                                      */}
      {/* ========================================================================= */}
      {showAddCollegeModal && (
        <Modal
          isOpen={showAddCollegeModal}
          onClose={() => setShowAddCollegeModal(false)}
          title="Add New Engineering Institution"
        >
          <form onSubmit={handleSaveCollege} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                College Name *
              </label>
              <input
                type="text"
                required
                value={collegeForm.name}
                onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                placeholder="e.g. Indian Institute of Technology Kharagpur"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Short Acronym / Code
                </label>
                <input
                  type="text"
                  value={collegeForm.shortName}
                  onChange={(e) => setCollegeForm({ ...collegeForm, shortName: e.target.value })}
                  placeholder="e.g. IITKGP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location / City *
                </label>
                <input
                  type="text"
                  value={collegeForm.location}
                  onChange={(e) => setCollegeForm({ ...collegeForm, location: e.target.value })}
                  placeholder="e.g. Kharagpur, West Bengal"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                College Website URL *
              </label>
              <input
                type="url"
                required
                value={collegeForm.website}
                onChange={(e) => setCollegeForm({ ...collegeForm, website: e.target.value })}
                placeholder="https://www.iitkgp.ac.in"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                College Logo URL
              </label>
              <input
                type="url"
                value={collegeForm.logo}
                onChange={(e) => setCollegeForm({ ...collegeForm, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description / Overview
              </label>
              <textarea
                rows={3}
                value={collegeForm.description}
                onChange={(e) => setCollegeForm({ ...collegeForm, description: e.target.value })}
                placeholder="Brief description of the college, reputation, technical fests..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddCollegeModal(false)}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow cursor-pointer"
              >
                Save College
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EVENT                                                        */}
      {/* ========================================================================= */}
      {showAddEventModal && (
        <Modal
          isOpen={showAddEventModal}
          onClose={() => setShowAddEventModal(false)}
          title="Publish New Event / Competition"
        >
          <form onSubmit={handleSaveEvent} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* College Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hosting College *
              </label>
              <select
                value={eventForm.collegeId}
                onChange={(e) => handleCollegeSelectInEvent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={eventForm.name}
                onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                placeholder="e.g. Smart India Hackathon 2027"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Event Type & Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Type *
                </label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {eventTypes.filter((t) => t !== 'All').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Mode *
                </label>
                <select
                  value={eventForm.mode}
                  onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Offline">Offline (On Campus)</option>
                  <option value="Online">Online (Virtual)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Dates: Event Date & Registration Deadline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Date *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  placeholder="e.g. Dec 18 - 20, 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Deadline *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.regDeadline}
                  onChange={(e) => setEventForm({ ...eventForm, regDeadline: e.target.value })}
                  placeholder="e.g. Nov 30, 2026"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Venue & Fee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Venue / Location *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  placeholder="e.g. Convocation Hall, Campus"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Fee *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.fee}
                  onChange={(e) => setEventForm({ ...eventForm, fee: e.target.value })}
                  placeholder="Free or ₹150"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Registration Link */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Registration Link *
              </label>
              <input
                type="url"
                required
                value={eventForm.regUrl}
                onChange={(e) => setEventForm({ ...eventForm, regUrl: e.target.value })}
                placeholder="https://official-portal.org/register"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Organizer & Eligibility */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organizer
                </label>
                <input
                  type="text"
                  value={eventForm.organizer}
                  onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                  placeholder="e.g. CSE Dept & Tech Club"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Eligibility
                </label>
                <input
                  type="text"
                  value={eventForm.eligibility}
                  onChange={(e) => setEventForm({ ...eventForm, eligibility: e.target.value })}
                  placeholder="e.g. BE/B.Tech students all years"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Comprehensive description of the competition, problem statements, prizes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* Highlights (comma separated) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Highlights / Tags (Comma separated)
              </label>
              <input
                type="text"
                value={eventForm.highlights}
                onChange={(e) => setEventForm({ ...eventForm, highlights: e.target.value })}
                placeholder="₹1,00,000 Prize Pool, National Certificate, Swags"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddEventModal(false)}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow cursor-pointer"
              >
                Publish Event
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT EVENT                                                       */}
      {/* ========================================================================= */}
      {editingEvent && (
        <Modal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          title={`Edit Event: ${editingEvent.name}`}
        >
          <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hosting College *
              </label>
              <select
                value={editingEvent.collegeId}
                onChange={(e) => {
                  const found = colleges.find((c) => c.id === e.target.value);
                  setEditingEvent({
                    ...editingEvent,
                    collegeId: e.target.value,
                    collegeName: found ? found.name : editingEvent.collegeName
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={editingEvent.name}
                onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Type
                </label>
                <select
                  value={editingEvent.type}
                  onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {eventTypes.filter((t) => t !== 'All').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mode
                </label>
                <select
                  value={editingEvent.mode}
                  onChange={(e) => setEditingEvent({ ...editingEvent, mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Offline">Offline (On Campus)</option>
                  <option value="Online">Online (Virtual)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Date *
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.eventDate}
                  onChange={(e) => setEditingEvent({ ...editingEvent, eventDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Deadline *
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.regDeadline}
                  onChange={(e) => setEditingEvent({ ...editingEvent, regDeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registration Fee *
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.fee}
                  onChange={(e) => setEditingEvent({ ...editingEvent, fee: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Registration Link *
              </label>
              <input
                type="url"
                required
                value={editingEvent.regUrl}
                onChange={(e) => setEditingEvent({ ...editingEvent, regUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organizer
                </label>
                <input
                  type="text"
                  value={editingEvent.organizer || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Eligibility
                </label>
                <input
                  type="text"
                  value={editingEvent.eligibility || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, eligibility: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editingEvent.description}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Highlights (comma separated)
              </label>
              <input
                type="text"
                value={editingEvent.highlights}
                onChange={(e) => setEditingEvent({ ...editingEvent, highlights: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow cursor-pointer"
              >
                Update Event
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE EVENT CONFIRMATION                                        */}
      {/* ========================================================================= */}
      {deletingEvent && (
        <Modal
          isOpen={!!deletingEvent}
          onClose={() => setDeletingEvent(null)}
          title="Confirm Event Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Are you sure you want to delete this event?</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  You are about to delete <strong className="text-slate-900 dark:text-white">"{deletingEvent.name}"</strong> conducted by <strong className="text-slate-900 dark:text-white">{deletingEvent.collegeName}</strong>. This will also remove it from students' saved lists.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteEvent}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Yes, Delete Event
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE COLLEGE CONFIRMATION                                      */}
      {/* ========================================================================= */}
      {deletingCollege && (
        <Modal
          isOpen={!!deletingCollege}
          onClose={() => setDeletingCollege(null)}
          title="Confirm College Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Delete "{deletingCollege.name}"?</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Deleting this college will also delete all events associated with it. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingCollege(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCollege}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Yes, Delete College
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
