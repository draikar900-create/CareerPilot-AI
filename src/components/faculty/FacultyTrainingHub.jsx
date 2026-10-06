import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  BookOpen,
  Calendar,
  Plus,
  Video,
  FileText,
  Clock,
  ExternalLink,
  CheckCircle2,
  Send,
  UserCheck,
  Trash2
} from 'lucide-react';

export default function FacultyTrainingHub() {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('classes'); // 'classes' | 'publish'

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for class creation
  const [classForm, setClassForm] = useState({
    title: '',
    subject: 'Data Structures',
    topic: '',
    description: '',
    class_date: '',
    academic_year: '3rd Year',
    section: 'A',
    meeting_url: ''
  });

  // Form states for resource publishing
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'Faculty Notes',
    description: '',
    url: '',
    content_type: 'Notes',
    academic_year: '3rd Year'
  });

  const [submittingClass, setSubmittingClass] = useState(false);
  const [submittingResource, setSubmittingResource] = useState(false);

  const fetchFacultyClasses = async () => {
    setLoading(true);
    try {
      const res = await apiService.getFacultyClasses();
      if (res && res.success) {
        setClasses(res.classes || []);
      }
    } catch (err) {
      console.error('Error fetching classes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyClasses();
  }, []);

  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!classForm.title || !classForm.class_date) {
      showToast('Title and Class Date are required.', 'error');
      return;
    }

    setSubmittingClass(true);
    try {
      const res = await apiService.createFacultyClass(classForm);
      if (res && res.success) {
        showToast('Class scheduled successfully!', 'success');
        setClassForm({
          title: '',
          subject: 'Data Structures',
          topic: '',
          description: '',
          class_date: '',
          academic_year: '3rd Year',
          section: 'A',
          meeting_url: ''
        });
        fetchFacultyClasses();
      } else {
        showToast(res.message || 'Failed to schedule class.', 'error');
      }
    } catch (err) {
      showToast('Error scheduling class: ' + err.message, 'error');
    } finally {
      setSubmittingClass(false);
    }
  };

  const handlePublishResource = async (e) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.url) {
      showToast('Title and Resource URL are required.', 'error');
      return;
    }

    setSubmittingResource(true);
    try {
      const res = await apiService.publishFacultyResource(resourceForm);
      if (res && res.success) {
        showToast('Faculty resource published to learning portal!', 'success');
        setResourceForm({
          title: '',
          category: 'Faculty Notes',
          description: '',
          url: '',
          content_type: 'Notes',
          academic_year: '3rd Year'
        });
      } else {
        showToast(res.message || 'Failed to publish resource.', 'error');
      }
    } catch (err) {
      showToast('Error publishing resource: ' + err.message, 'error');
    } finally {
      setSubmittingResource(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to cancel and delete this scheduled class?')) return;
    try {
      const res = await apiService.deleteFacultyClass(classId);
      if (res?.success) {
        showToast('Scheduled class deleted.', 'success');
        setClasses(prev => prev.filter(c => c.id !== classId));
      } else {
        showToast(res?.message || 'Failed to delete class.', 'error');
      }
    } catch (err) {
      showToast('Error deleting class: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Faculty Training & Content Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Training Hub & Scheduled Classes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Schedule live training sessions and publish faculty lecture notes & videos for assigned students.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit">
        <button
          onClick={() => setActiveSubTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'classes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Scheduled Classes
        </button>
        <button
          onClick={() => setActiveSubTab('publish')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'publish' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Publish Faculty Content
        </button>
      </div>

      {/* SCHEDULED CLASSES TAB */}
      {activeSubTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Upcoming Training Sessions</span>
            </h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="glass-card rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No classes scheduled yet.
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div key={cls.id} className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                        {cls.academicYear} Sec {cls.section} &bull; {cls.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(cls.classDate || cls.class_date).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cls.title}</h3>
                    {cls.description && <p className="text-xs text-slate-400">{cls.description}</p>}

                    {cls.meetingUrl || cls.meeting_url ? (
                      <a
                        href={cls.meetingUrl || cls.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline pt-1"
                      >
                        <span>Join Meeting Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Form */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4 self-start">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Schedule New Class</span>
            </h3>

            <form onSubmit={handleScheduleClass} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Class Title
                </label>
                <input
                  type="text"
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  placeholder="e.g. Advanced Dynamic Programming"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={classForm.subject}
                    onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Academic Year
                  </label>
                  <select
                    value={classForm.academic_year}
                    onChange={(e) => setClassForm({ ...classForm, academic_year: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Class Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={classForm.class_date}
                  onChange={(e) => setClassForm({ ...classForm, class_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Google Meet / Zoom URL
                </label>
                <input
                  type="url"
                  value={classForm.meeting_url}
                  onChange={(e) => setClassForm({ ...classForm, meeting_url: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingClass}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
              >
                {submittingClass ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH FACULTY CONTENT TAB */}
      {activeSubTab === 'publish' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6 max-w-2xl">
          <div className="flex items-center gap-2 text-blue-400">
            <Send className="w-5 h-5" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Publish Faculty Lecture Notes & Videos
            </h2>
          </div>

          <form onSubmit={handlePublishResource} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Resource Title
              </label>
              <input
                type="text"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g. DBMS & B+ Tree Indexing Lecture Notes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Content Type
                </label>
                <select
                  value={resourceForm.content_type}
                  onChange={(e) => setResourceForm({ ...resourceForm, content_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Notes">Notes / PDF</option>
                  <option value="Lecture">Lecture Slides</option>
                  <option value="Video">Video Recording</option>
                  <option value="Class">Class Lab</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Academic Year
                </label>
                <select
                  value={resourceForm.academic_year}
                  onChange={(e) => setResourceForm({ ...resourceForm, academic_year: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Resource Link / URL
              </label>
              <input
                type="url"
                value={resourceForm.url}
                onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                placeholder="https://drive.google.com/file/... or Youtube link"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Description & Topics Covered
              </label>
              <textarea
                rows={3}
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Brief summary of concepts and lab instructions..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submittingResource}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all"
            >
              {submittingResource ? 'Publishing...' : 'Publish to Student Portal'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
