import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CircularProgress from '../common/CircularProgress';
import {
  X,
  User,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  BookOpen,
  Briefcase,
  Code,
  FileText,
  GraduationCap,
  Building,
  Target,
  FolderGit2,
  Eye,
  Download
} from 'lucide-react';

export default function StudentDetailAnalysis({ studentId, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [studentDetail, setStudentDetail] = useState(null);
  const [facultyNotes, setFacultyNotes] = useState([]);
  const [secureResumeUrl, setSecureResumeUrl] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    setLoading(true);
    Promise.all([
      apiService.getFacultyStudentDetail(studentId),
      apiService.getFacultyStudentNotes(studentId),
      apiService.getFacultyStudentResume(studentId)
    ])
      .then(([res, notesRes, resumeRes]) => {
        if (res && res.success && res.studentDetail) {
          setStudentDetail(res.studentDetail);
        } else {
          showToast(res?.message || 'Unauthorized student detail access.', 'error');
          onClose();
        }

        if (notesRes?.success) {
          setFacultyNotes(notesRes.notes || []);
        }

        if (resumeRes?.success && resumeRes.resumeUrl) {
          setSecureResumeUrl(resumeRes.resumeUrl);
        }
      })
      .catch((err) => {
        console.error('Error fetching student detail:', err.message);
        showToast('Unauthorized access: ' + err.message, 'error');
        onClose();
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await apiService.createFacultyStudentNote(studentId, {
        note: newNote.trim(),
        category: 'Academic',
        isPrivate: true
      });
      if (res?.success) {
        showToast('Faculty note saved.', 'success');
        setNewNote('');
        const updated = await apiService.getFacultyStudentNotes(studentId);
        if (updated?.success) setFacultyNotes(updated.notes || []);
      }
    } catch (err) {
      showToast('Error saving note: ' + err.message, 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 space-y-6 overflow-y-auto my-auto relative text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 animate-pulse">Running Server Authorization & Profile Retrieval...</p>
          </div>
        ) : !studentDetail ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Unauthorized Student Record Access</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">You do not have permission to view this student profile.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header / Basic Student Profile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    {studentDetail.academicYear} &bull; Sec {studentDetail.section}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {studentDetail.studentId}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {studentDetail.fullName}
                </h2>
                <p className="text-xs text-slate-400">
                  {studentDetail.branch} &bull; {studentDetail.collegeName || 'Institution Not Specified'}
                </p>
              </div>

              {/* Rank Badge */}
              <div>
                {studentDetail.rank === 'Platinum' && (
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 text-cyan-300 text-center">
                    <Sparkles className="w-4 h-4 mx-auto mb-0.5 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider block">PLATINUM TIER</span>
                  </div>
                )}
                {studentDetail.rank === 'Gold' && (
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-center">
                    <Award className="w-4 h-4 mx-auto mb-0.5 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider block">GOLD TIER</span>
                  </div>
                )}
                {studentDetail.rank === 'Silver' && (
                  <div className="px-4 py-2 rounded-2xl bg-slate-500/20 border border-slate-400/30 text-slate-300 text-center">
                    <ShieldCheck className="w-4 h-4 mx-auto mb-0.5 text-slate-400" />
                    <span className="text-xs font-bold uppercase tracking-wider block">SILVER TIER</span>
                  </div>
                )}
                {studentDetail.rank === 'Unranked' && (
                  <div className="px-4 py-2 rounded-2xl bg-slate-800 text-slate-400 text-center border border-slate-700">
                    <span className="text-xs font-medium uppercase tracking-wider block">UNRANKED</span>
                  </div>
                )}
              </div>
            </div>

            {/* GRID OF STUDENT SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* SECTION 1: PROFILE & CONTACT */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-blue-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                  <User className="w-4 h-4" />
                  <span>Profile Information</span>
                </div>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p><strong>Email:</strong> {studentDetail.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {studentDetail.phone || 'Not provided'}</p>
                  <p><strong>College:</strong> {studentDetail.collegeName || 'Not provided'}</p>
                  <p><strong>Branch:</strong> {studentDetail.branch || 'Not provided'}</p>
                  <p><strong>Academic Year:</strong> {studentDetail.academicYear} (Section {studentDetail.section})</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  {studentDetail.resumeUrl || studentDetail.resume_url || studentDetail.resume_storage_path ? (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await apiService.viewResume(studentId);
                          } catch (err) {
                            showToast('Error viewing resume: ' + err.message, 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Resume</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await apiService.downloadResume(studentId, `${studentDetail.fullName || 'student'}_resume.pdf`);
                          } catch (err) {
                            showToast('Error downloading resume: ' + err.message, 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No resume uploaded</span>
                  )}
                </div>
              </div>

              {/* SECTION 2: ACADEMICS */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Standing</span>
                </div>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p><strong>CGPA:</strong> {studentDetail.cgpa !== null && studentDetail.cgpa !== undefined ? `${studentDetail.cgpa} / 10.0` : 'Not provided'}</p>
                  <p><strong>Current Semester:</strong> {studentDetail.semester !== null && studentDetail.semester !== undefined ? `Semester ${studentDetail.semester}` : 'Not provided'}</p>
                  <p><strong>Graduation Year:</strong> {studentDetail.graduationYear || 'Not provided'}</p>
                </div>
              </div>

              {/* SECTION 3: SKILLS */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Code className="w-4 h-4" />
                  <span>Technical & Focus Skills</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Technical Skills:</span>
                    {Array.isArray(studentDetail.technicalSkills) && studentDetail.technicalSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {studentDetail.technicalSkills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-medium text-[11px] border border-purple-500/20">
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Focus Career Skills:</span>
                    {Array.isArray(studentDetail.focusSkills) && studentDetail.focusSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {studentDetail.focusSkills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium text-[11px] border border-blue-500/20">
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: CAREER GOALS */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Target className="w-4 h-4" />
                  <span>Career Aspirations</span>
                </div>
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p><strong>Target Role:</strong> {studentDetail.targetRole || 'Not provided'}</p>
                  <p><strong>Target Company:</strong> {studentDetail.targetCompany || 'Not provided'}</p>
                  <div className="flex items-center gap-3 pt-2">
                    {studentDetail.linkedinUrl ? (
                      <a href={studentDetail.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> LinkedIn Profile
                      </a>
                    ) : (
                      <span className="text-slate-400">LinkedIn: Not provided</span>
                    )}
                    {studentDetail.githubUrl ? (
                      <a href={studentDetail.githubUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" /> GitHub Profile
                      </a>
                    ) : (
                      <span className="text-slate-400">GitHub: Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 5: PROJECTS & CERTIFICATIONS */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-cyan-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
                  <FolderGit2 className="w-4 h-4" />
                  <span>Projects & Certifications</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Projects:</span>
                    {Array.isArray(studentDetail.projects) && studentDetail.projects.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {studentDetail.projects.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Certifications:</span>
                    {Array.isArray(studentDetail.certificates) && studentDetail.certificates.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {studentDetail.certificates.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 6: FACULTY NOTES & OBSERVATIONS */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold">
                    <FileText className="w-4 h-4" />
                    <span>Faculty Observation Notes & Feedback ({facultyNotes.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Confidential</span>
                </div>

                {facultyNotes.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                    {facultyNotes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-emerald-500">{n.category || 'Academic'}</span>
                          <span className="text-slate-400">{new Date(n.created_at || n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 font-medium">{n.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No faculty observation notes recorded for this student yet.</p>
                )}

                {/* Add Quick Note */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Add a confidential faculty note/observation for this student..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all disabled:opacity-50 shrink-0"
                  >
                    {submittingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </form>
              </div>
            </div>

            {/* READINESS & RESUME FOOTER */}
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Standardized Readiness Index</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{studentDetail.readinessScore}%</span>
                  <span className="text-xs font-semibold text-slate-400">({studentDetail.rank} Tier &bull; {studentDetail.attemptsCount} Attempts)</span>
                </div>
              </div>

              {(secureResumeUrl || studentDetail.resumeUrl) ? (
                <a
                  href={secureResumeUrl || studentDetail.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>View / Download Resume</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Resume PDF: Not uploaded</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
