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
  FileText
} from 'lucide-react';

export default function UserManagement() {
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminStudents();
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      showToast('Error fetching students: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
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

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Real Student Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Registered Students
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Inspect verified student profiles registered in Supabase PostgreSQL, view resumes, and monitor academic standings.
            </p>
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
            placeholder="Search by student name, email, branch, or college..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Total Registered Students: <strong>{students.length}</strong>
        </span>
      </div>

      {/* Users Data Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading student registry from database...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No students registered yet.
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
                  <tr
                    key={s.user_id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
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
                      <div className="text-xs text-slate-400">
                        {s.branch || 'Branch Unspecified'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.semester ? `Semester ${s.semester}` : 'N/A'}
                      </div>
                      <div className="text-xs text-emerald-500 font-bold">
                        {s.cgpa ? `CGPA: ${s.cgpa}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(s.technical_skills || []).length > 0 ? (
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
                      {s.resume_url ? (
                        <a
                          href={s.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View PDF</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Resume</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
