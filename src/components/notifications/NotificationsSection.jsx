import React, { useState } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import {
  Bell,
  Search,
  Calendar,
  Building2,
  Briefcase,
  Trophy,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export default function NotificationsSection({ setActiveTab }) {
  const { notifications } = usePlacementAdmin();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const getCategoryFromTitle = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('internship') || t.includes('intern')) return { label: 'Internship Alert', icon: Briefcase, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (t.includes('hackathon') || t.includes('contest') || t.includes('event')) return { label: 'Event Notice', icon: Trophy, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (t.includes('placement') || t.includes('hiring') || t.includes('drive') || t.includes('company')) return { label: 'Placement Drive', icon: Building2, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
    return { label: 'Official Announcement', icon: Info, color: 'text-brand-500 bg-brand-500/10 border-brand-500/20' };
  };

  const filteredNotifications = (notifications || []).filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.message?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    const cat = getCategoryFromTitle(item.title).label.toLowerCase();
    return cat.includes(filter.toLowerCase());
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Campus & Placement Notices</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Important Announcements
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Stay updated with placement notices, internship alerts, event announcements, and important updates broadcasted by your institution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {filteredNotifications.length} Total Notices
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'placement', label: 'Placement Drives' },
            { id: 'internship', label: 'Internships' },
            { id: 'event', label: 'Events & Hackathons' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Notifications Cards Grid */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-slate-200/80 dark:border-white/10">
            <Bell className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No announcements found</h3>
            <p className="text-xs text-slate-400 mt-1">Check back later or adjust your search filter.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const category = getCategoryFromTitle(item.title);
            const CategoryIcon = category.icon;

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${category.color}`}>
                      <CategoryIcon className="w-3 h-3" />
                      <span>{category.label}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time || item.sentAt || 'Recent'}</span>
                    </span>

                    <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Placement Cell Official
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-center">
                  {item.title.toLowerCase().includes('internship') && setActiveTab && (
                    <button
                      onClick={() => setActiveTab('internships')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Internships</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.title.toLowerCase().includes('hackathon') && setActiveTab && (
                    <button
                      onClick={() => setActiveTab('events')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View Events</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
