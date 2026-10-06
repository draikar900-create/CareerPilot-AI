import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import {
  Users,
  Search,
  GraduationCap,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  UserCheck,
  BookOpen
} from 'lucide-react';

export default function UserManagement() {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('students'); // 'students' | 'faculty'
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [stRes, facRes] = await Promise.all([
        apiService.getAdminStudents().catch(() => ({ success: true, students: [] })),
        apiService.getAdminFaculty().catch(() => ({ success: true, faculty: [] }))
      ]);
      if (stRes.success) setStudents(stRes.students || []);
      if (facRes.success) setFaculty(facRes.faculty || []);
    } catch (err) {
      showToast('Error loading user directory: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredStudents = students.filter((s) => {
    const name = s.full_name || '';
    const email = s.email || '';
    const college = s.college_name || '';
    const branch = s.branch || '';
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      college.toLowerCase().includes(query) ||
      branch.toLowerCase().includes(query)
    );
  });

  const filteredFaculty = faculty.filter((f) => {
    const name = f.full_name || '';
    const email = f.email || '';
    const college = f.college_name || '';
    const dept = f.department || f.designation || '';
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      college.toLowerCase().includes(query) ||
      dept.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Platform Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              User Management & Directory
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Inspect registered students, faculty members, academic credentials, and instructional assignments.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setActiveSubTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'students'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Students ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('faculty')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'faculty'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Faculty ({faculty.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'students'
                ? 'Search students by name, email, branch, or college...'
                : 'Search faculty by name, email, designation, or department...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing: <strong>{activeSubTab === 'students' ? filteredStudents.length : filteredFaculty.length}</strong> {activeSubTab}
        </span>
      </div>

      {/* Data Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading directory from PostgreSQL database...</p>
          </div>
        ) : activeSubTab === 'students' ? (
          filteredStudents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No students found.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Real student accounts created via Supabase Auth will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-xs uppercase bg-slate-100/70 dark:bg-slate-900/70 text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">College & Branch</th>
                    <th className="px-6 py-4">Semester / CGPA</th>
                    <th className="px-6 py-4">Skills</th>
                    <th className="px-6 py-4">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.map((s) => (
                    <tr key={s.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{s.full_name || 'Student'}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{s.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.college_name || 'College Unspecified'}
                        </div>
                        <div className="text-xs text-slate-400">{s.branch || 'Branch Unspecified'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {s.semester ? `Semester ${s.semester}` : 'N/A'}
                        </div>
                        <div className="text-xs text-emerald-500 font-bold">{s.cgpa ? `CGPA: ${s.cgpa}` : ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(s?.technical_skills) && s.technical_skills.length > 0 ? (
                            s.technical_skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                                {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No skills listed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {(s.resume_url || s.resume_storage_path) ? (
                          <button
                            type="button"
                            onClick={() => apiService.viewResume(s.user_id || s.id)}
                            className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Resume</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No Resume</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Faculty Directory */
          filteredFaculty.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No faculty members registered yet.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Authorized faculty accounts will appear here along with their course assignments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="text-xs uppercase bg-slate-100/70 dark:bg-slate-900/70 text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Faculty Member</th>
                    <th className="px-6 py-4">Department & Designation</th>
                    <th className="px-6 py-4">College</th>
                    <th className="px-6 py-4">Active Assignments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredFaculty.map((f) => {
                    const assignments = f.faculty_assignments || f.assignments || [];
                    return (
                      <tr key={f.user_id || f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{f.full_name || 'Faculty Member'}</span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{f.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {f.department || 'Computer Science & Engineering'}
                          </div>
                          <div className="text-xs text-purple-500 font-semibold">
                            {f.designation || 'Associate Professor'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {f.college_name || 'College A Institute of Technology'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {Array.isArray(assignments) && assignments.length > 0 ? (
                              assignments.map((a, idx) => (
                                <span
                                  key={a.id || idx}
                                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-medium"
                                >
                                  <span>{a?.academic_year || a?.academicYear || 'Year'} Sec {a?.section || 'A'}: {a?.subject || 'Class'}</span>
                                  {a?.id && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm('Remove this faculty assignment?')) {
                                          try {
                                            const res = await apiService.deleteFacultyAssignment(a.id);
                                            if (res.success) {
                                              showToast('Faculty assignment removed', 'success');
                                              fetchUsers();
                                            } else {
                                              showToast(res.message || 'Failed to delete assignment', 'error');
                                            }
                                          } catch (err) {
                                            showToast(err.message, 'error');
                                          }
                                        }
                                      }}
                                      className="text-rose-500 hover:text-rose-700 ml-1 font-bold"
                                      title="Remove assignment"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No assigned classes</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}


