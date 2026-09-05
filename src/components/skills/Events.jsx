import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import Modal from '../common/Modal';
import {
  Calendar,
  MapPin,
  Globe,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  Bookmark
} from 'lucide-react';

export default function Events({ setActiveTab }) {
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const res = await apiService.getEvents();
        if (res.success) {
          setEvents(res.events || []);
        }
      } catch (err) {
        showToast('Error loading events: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>Campus Events & Hackathons</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Engineering Events & Drives
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Explore hackathons, workshops, placement drives, and technical symposiums published by placement teams.
            </p>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-center shrink-0">
            <span className="block text-2xl font-black text-brand-600 dark:text-brand-400 leading-none">
              {events.length}
            </span>
            <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider mt-1 block">
              Active Events
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10">
          <div className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Loading events from database...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No events available yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Institutional event announcements and hackathons will appear here once published by the placement cell.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                    {evt.organizer || 'Placement Cell'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {evt.title}
                </h3>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-500" /> Date:</span>
                    <span className="font-bold">{new Date(evt.event_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location:</span>
                    <span className="font-semibold">{evt.location || 'Campus'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {evt.description}
                </p>
              </div>

              {evt.event_url && (
                <a
                  href={evt.event_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Event Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
