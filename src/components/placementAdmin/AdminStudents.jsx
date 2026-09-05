import React, { useState, useMemo } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminStudents() {
  const { students } = usePlacementAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [readinessFilter, setReadinessFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = student.name || student.full_name || 'Unnamed Student';
      const careerGoal = student.careerGoal || student.career_goal || 'Software Engineer';
      const branch = student.branch || 'CSE';
      const readinessScore = student.readinessScore || student.readiness_score || 80;

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        careerGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === 'ALL' || branch.toUpperCase() === branchFilter.toUpperCase();

      let matchesReadiness = true;
      if (readinessFilter === 'READY') {
        matchesReadiness = readinessScore >= 85;
      } else if (readinessFilter === 'DEVELOPING') {
        matchesReadiness = readinessScore >= 75 && readinessScore < 85;
      } else if (readinessFilter === 'NEEDS_PREP') {
        matchesReadiness = readinessScore < 75;
      }

      return matchesSearch && matchesBranch && matchesReadiness;
    });
  }, [students, searchQuery, branchFilter, readinessFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getBranchBadge = (branch) => {
    const colors = {
      CSE: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      ISE: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      AIML: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      ECE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      EEE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      Mechanical: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      Civil: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20'
    };
    return colors[branch] || 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Candidate Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Registered Students Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse student profiles, branch performance, CGPA records, and AI interview readiness benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {filteredStudents.length} Students Listed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, branch, or career goal..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="ISE">ISE</option>
            <option value="AIML">AIML</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
          </select>

          {/* Readiness Score Filter */}
          <select
            value={readinessFilter}
            onChange={(e) => {
              setReadinessFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
          >
            <option value="ALL">All Readiness</option>
            <option value="READY">Placement Ready (≥85%)</option>
            <option value="DEVELOPING">Intermediate (75-84%)</option>
            <option value="NEEDS_PREP">Needs Prep (&lt;75%)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-3">Branch</th>
                <th className="py-3.5 px-3">CGPA</th>
                <th className="py-3.5 px-4">Career Goal</th>
                <th className="py-3.5 px-3">Readiness Score</th>
                <th className="py-3.5 px-3 text-center">Number of Projects</th>
                <th className="py-3.5 px-3 text-center">Number of Certificates</th>
                <th className="py-3.5 px-3">Resume Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const sName = s.name || s.full_name || 'Unnamed Student';
                  const sBranch = s.branch || 'CSE';
                  const sCgpa = typeof s.cgpa === 'number' ? s.cgpa : parseFloat(s.cgpa || 8.0);
                  const sGoal = s.careerGoal || s.career_goal || 'Software Engineer';
                  const sReadiness = s.readinessScore || s.readiness_score || 80;
                  const sProj = s.projectsCount || s.projects_count || 0;
                  const sCert = s.certificatesCount || s.certificates_count || 0;
                  const sResume = s.resumeScore || s.resume_score || 85;

                  return (
                    <tr
                      key={s.id || s.user_id || s.email}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sName}
                        </div>
                        <span className="text-[10px] text-slate-400">{s.email || s.id}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getBranchBadge(
                            sBranch
                          )}`}
                        >
                          {sBranch}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {sCgpa.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {sGoal}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold ${
                              sReadiness >= 85
                                ? 'text-emerald-500'
                                : sReadiness >= 75
                                ? 'text-indigo-500'
                                : 'text-amber-500'
                            }`}
                          >
                            {sReadiness}%
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                sReadiness >= 85
                                  ? 'bg-emerald-500'
                                  : sReadiness >= 75
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${sReadiness}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                          {sProj}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                          {sCert}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            sResume >= 85
                              ? 'text-emerald-500'
                              : 'text-indigo-500'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          {sResume}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-bold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalPages}</span> ({filteredStudents.length} total students)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
