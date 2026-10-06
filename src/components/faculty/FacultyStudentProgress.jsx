import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StudentDetailAnalysis from './StudentDetailAnalysis';
import {
  TrendingUp,
  Users,
  Search,
  Filter,
  FileText,
  Plus,
  MessageSquare,
  Award,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

export default function FacultyStudentProgress() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Note Modal State
  const [noteModalStudent, setNoteModalStudent] = useState(null);
  const [studentNotes, setStudentNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Academic');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await apiService.getFacultyStudents();
      if (res?.success) {
        setStudents(res.students || []);
      } else {
        showToast(res?.message || 'Failed to load students', 'error');
      }
    } catch (err) {
      showToast('Error loading students: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNotesModal = async (student) => {
    setNoteModalStudent(student);
    setNotesLoading(true);
    setNewNoteContent('');
    try {
      const res = await apiService.getFacultyStudentNotes(student.id);
      if (res?.success) {
        setStudentNotes(res.notes || []);
      }
    } catch (err) {
      console.error('Error fetching student notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) {
      showToast('Note content cannot be empty.', 'error');
      return;
    }
    setSubmittingNote(true);
    try {
      const res = await apiService.createFacultyStudentNote(noteModalStudent.id, {
        note: newNoteContent.trim(),
        category: newNoteCategory,
        isPrivate: true
      });
      if (res?.success) {
        showToast('Faculty observation note recorded.', 'success');
        setNewNoteContent('');
        // Reload notes
        const updated = await apiService.getFacultyStudentNotes(noteModalStudent.id);
        if (updated?.success) setStudentNotes(updated.notes || []);
      } else {
        showToast(res?.message || 'Failed to save note.', 'error');
      }
    } catch (err) {
      showToast('Error saving note: ' + err.message, 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this faculty observation note?')) return;
    try {
      const res = await apiService.deleteFacultyStudentNote(noteModalStudent.id, noteId);
      if (res?.success) {
        showToast('Note deleted.', 'success');
        setStudentNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (err) {
      showToast('Error deleting note: ' + err.message, 'error');
    }
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = searchQuery === '' ||
      s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    const matchesYear = yearFilter === 'ALL' || s.academicYear === yearFilter;

    return matchesSearch && matchesBranch && matchesYear;
  });

  const availableBranches = Array.from(new Set(students.map(s => s.branch))).filter(Boolean);
  const availableYears = Array.from(new Set(students.map(s => s.academicYear))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              STUDENT PROGRESS & OBSERVATIONS
            </span>
            <span className="text-xs text-slate-400 font-medium">Faculty Evaluation Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Academic Progress & Faculty Feedback
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Monitor real student readiness scores, academic standings, and record confidential faculty observations for assigned students.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, USN, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Branches</option>
            {availableBranches.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Academic Years</option>
            {availableYears.map((y, i) => (
              <option key={i} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Progress List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 animate-pulse">
            Loading student academic records and evaluations...
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Students Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No student academic records match your filter criteria or teaching scope.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono block">USN: {s.studentId}</span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {s.fullName}
                    </h3>
                  </div>

                  {/* Rank Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    s.rank === 'Platinum'
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : s.rank === 'Gold'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                  }`}>
                    {s.rank || 'Unranked'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Branch</span>
                    <span className="font-bold text-slate-900 dark:text-white">{s.branch || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">CGPA</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {s.cgpa !== null && s.cgpa !== undefined ? `${s.cgpa} / 10` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Readiness</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{s.readinessScore}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => setSelectedStudentId(s.id)}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Full Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenNotesModal(s)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Faculty Notes / Observation</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL STUDENT PROFILE MODAL */}
      {selectedStudentId && (
        <StudentDetailAnalysis
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {/* FACULTY NOTES / FEEDBACK MODAL */}
      {noteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="glass-card w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 space-y-6 my-auto relative text-slate-900 dark:text-white">
            <button
              onClick={() => setNoteModalStudent(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                CONFIDENTIAL FACULTY NOTES
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {noteModalStudent.fullName} ({noteModalStudent.studentId})
              </h2>
              <p className="text-xs text-slate-400">
                Record observation notes, feedback, and academic guidance for this student.
              </p>
            </div>

            {/* Existing Notes List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Recorded Notes ({studentNotes.length})
              </h4>
              {notesLoading ? (
                <p className="text-xs text-slate-400 animate-pulse">Loading existing notes...</p>
              ) : studentNotes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                  No observation notes recorded for this student yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {studentNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                          {n.category || 'General'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.created_at || n.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete note"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {n.note}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Note Form */}
            <form onSubmit={handleCreateNote} className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">New Observation Note</label>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="Academic">Academic</option>
                  <option value="DSA & Coding">DSA & Coding</option>
                  <option value="Soft Skills">Soft Skills</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="General">General</option>
                </select>
              </div>

              <textarea
                rows={3}
                required
                placeholder="e.g. Needs extra practice in Data Structures. Completed DBMS assignments with distinction..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submittingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
