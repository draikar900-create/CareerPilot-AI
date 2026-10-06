import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  RefreshCw,
  User,
  MessageSquare,
  AlertCircle,
  Inbox,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function ContactManagement() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiService.getAdminContacts();
      if (res && res.success) {
        const list = Array.isArray(res.contacts)
          ? res.contacts
          : Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.inquiries)
          ? res.inquiries
          : [];
        setContacts(list);
        if (list.length > 0 && !selectedContact) {
          setSelectedContact(list[0]);
        }
      } else {
        setContacts([]);
        if (res?.error) setErrorMsg(res.error);
      }
    } catch (err) {
      console.error('Error fetching admin contacts:', err?.message);
      setContacts([]);
      setErrorMsg('Could not load inquiries. Verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await apiService.updateContactStatus(id, newStatus);
      if (res && res.success) {
        setContacts((prev) =>
          (Array.isArray(prev) ? prev : []).map((c) =>
            c?.id === id ? { ...c, status: newStatus } : c
          )
        );
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast?.(`Contact inquiry marked as ${newStatus}.`, 'success');
      } else {
        showToast?.(res?.error || 'Failed to update status.', 'error');
      }
    } catch (err) {
      showToast?.('Error updating contact status: ' + err?.message, 'error');
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact message?')) return;
    try {
      const res = await apiService.deleteContactMessage(id);
      if (res && res.success) {
        const remaining = (Array.isArray(contacts) ? contacts : []).filter((c) => c?.id !== id);
        setContacts(remaining);
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact(remaining.length > 0 ? remaining[0] : null);
        }
        showToast?.('Contact inquiry deleted.', 'info');
      } else {
        showToast?.(res?.error || 'Failed to delete contact.', 'error');
      }
    } catch (err) {
      showToast?.('Error deleting contact: ' + err?.message, 'error');
    }
  };

  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const filteredContacts = safeContacts.filter((c) => {
    if (!c) return false;
    const q = (searchTerm || '').toLowerCase().trim();
    const name = String(c?.name || '').toLowerCase();
    const email = String(c?.email || '').toLowerCase();
    const subject = String(c?.subject || '').toLowerCase();
    const message = String(c?.message || '').toLowerCase();

    const matchesSearch = !q || name.includes(q) || email.includes(q) || subject.includes(q) || message.includes(q);

    const isUnread = c?.status === 'unread';
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Unread'
        ? isUnread
        : statusFilter === 'Resolved'
        ? !isUnread
        : true;

    return matchesSearch && matchesStatus;
  });

  const totalCount = safeContacts.length;
  const unreadCount = safeContacts.filter((c) => c?.status === 'unread').length;
  const resolvedCount = totalCount - unreadCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-zinc-900 dark:text-zinc-100">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 mb-2">
            <Mail className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Helpdesk & Communications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Contact Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Review, triage, and resolve incoming student, alumni, and recruiter queries submitted through CareerPilot AI.
          </p>
        </div>

        <button
          onClick={fetchContacts}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Inquiries</span>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pending / Unread</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{unreadCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Resolved</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, subject, message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-zinc-400" />
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            {['All', 'Unread', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs font-semibold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchContacts}
            className="underline font-semibold hover:opacity-80"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Layout: List + Preview Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] animate-pulse space-y-3"
                >
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824]">
              <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No Contact Inquiries Found
              </p>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'All'
                  ? 'No messages match your active search or filter criteria.'
                  : 'There are currently no contact messages stored in the database.'}
              </p>
            </div>
          ) : (
            (filteredContacts || []).map((c) => {
              const isSelected = selectedContact?.id === c?.id;
              const isUnread = c?.status === 'unread';

              return (
                <div
                  key={c?.id || Math.random()}
                  onClick={() => {
                    setSelectedContact(c);
                    if (isUnread && c?.id) handleUpdateStatus(c.id, 'read');
                  }}
                  className={`glass-card rounded-2xl p-4 border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800/40 shadow-xs'
                      : isUnread
                      ? 'border-amber-400/50 dark:border-amber-500/40 bg-white dark:bg-[#121824]'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {c?.name ? String(c.name).charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {c?.name || 'Anonymous Visitor'}
                        </h3>
                        <p className="text-[11px] text-zinc-400 truncate">{c?.email || 'No email provided'}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                        isUnread
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isUnread ? 'Unread' : 'Resolved'}
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {c?.subject || 'General Inquiry'}
                  </h4>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {c?.message || 'No message body.'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c?.created_at
                        ? new Date(c.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Detail / Preview Pane (5 cols) */}
        <div className="lg:col-span-5">
          {selectedContact ? (
            <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] space-y-5 sticky top-20">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {selectedContact.subject || 'Inquiry Details'}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate">
                    From {selectedContact.name} ({selectedContact.email})
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Message Content
                </span>
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {selectedContact.message || 'No content provided.'}
                </div>
              </div>

              {/* Timestamp info */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Received on{' '}
                  {selectedContact.created_at
                    ? new Date(selectedContact.created_at).toLocaleString()
                    : 'Recent'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                  Resolution Action
                </span>
                <div className="flex items-center gap-2">
                  {selectedContact.status !== 'resolved' ? (
                    <button
                      onClick={() => handleUpdateStatus(selectedContact.id, 'resolved')}
                      className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(selectedContact.id, 'unread')}
                      className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>Mark as Pending / Unread</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-zinc-400 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121824] space-y-2">
              <Mail className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Select a message to view the full inquiry and respond.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
