import React, { useState } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import {
  Bell,
  Send,
  Trash2,
  Users,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Clock,
  X,
  Radio,
  FileText
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    label: 'New Internship Available',
    title: 'New Internship Available: Salutex AI Research Fellowship',
    message:
      'Salutex AI is hiring Summer AI Research Interns (₹45,000/month stipend). Eligible branches: CSE, ISE, AIML, ECE. Check Jobs section to apply directly.'
  },
  {
    label: 'Hackathon Registration Open',
    title: 'Hackathon Registration Open: National Smart Tech 2026',
    message:
      'Registrations are active for the Inter-College Smart Tech Hackathon. Cash prize pool: ₹5 Lakhs. Students can form teams of up to 4 members.'
  },
  {
    label: 'New Company Added',
    title: 'New Company Added: Qualcomm Hardware & VLSI Drive',
    message:
      'Qualcomm campus hiring drive rules have been published. Minimum CGPA required is 7.5 for ECE, EEE, and CSE streams.'
  },
  {
    label: 'Placement Drive Announcement',
    title: 'Placement Drive Announcement: Google 2026 Batch',
    message:
      'Google registration portal is now open for Final Year & Pre-Final Year students with CGPA >= 8.5. Complete your resume upload before Friday 5:00 PM.'
  }
];

export default function AdminNotifications() {
  const { notifications, sendNotification, deleteNotification } = usePlacementAdmin();

  const [showSendModal, setShowSendModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });

  const openSendModal = (preset = null) => {
    if (preset) {
      setFormData({
        title: preset.title,
        message: preset.message
      });
    } else {
      setFormData({
        title: '',
        message: ''
      });
    }
    setShowSendModal(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    sendNotification(formData);
    setShowSendModal(false);
    setFormData({ title: '', message: '' });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Campus Notification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Broadcast Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dispatch urgent placement alerts, internship opportunities, and drive deadlines to all registered students.
          </p>
        </div>

        <button
          onClick={() => openSendModal()}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          <span>Send Notification</span>
        </button>
      </div>

      {/* Quick Template Presets */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Quick Announcement Templates</span>
          </span>
          <span className="text-[11px] text-slate-400">Click any preset to compose instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {PRESET_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              onClick={() => openSendModal(tpl)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all group"
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {tpl.label}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {tpl.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sent Announcements History
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {notifications.length} Broadcasts Logged
          </span>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No broadcasted announcements yet. Use the "Send Notification" button to create one.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{n.status || 'Delivered'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{n.sentDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Target: {n.recipients}</span>
                    </span>
                  </div>
                </div>

                <div className="sm:shrink-0 flex items-center justify-end">
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                <span>Send Notification to Students</span>
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Placement Drive Announcement"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Notification Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter the full announcement text to broadcast to all students..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500 shrink-0" />
                <span>This announcement will be delivered immediately to <strong>All 1,280 Registered Students</strong>.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send To All Students</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
