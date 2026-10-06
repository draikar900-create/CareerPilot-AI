import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StudentDetailAnalysis from './StudentDetailAnalysis';
import {
  Users,
  Search,
  Filter,
  Award,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart2,
  ChevronRight
} from 'lucide-react';

export default function AssignedStudentsList() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  // Filters
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedRank, setSelectedRank] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected student for detailed analysis view
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const fetchAssignedStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedYear !== 'All') params.academic_year = selectedYear;
      if (selectedSection !== 'All') params.section = selectedSection;
      if (selectedRank !== 'All') params.rank = selectedRank;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiService.getFacultyStudents(params);
      if (res && res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      console.error('Error fetching assigned students:', err.message);
      showToast('Could not load assigned students.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedStudents();
  }, [selectedYear, selectedSection, selectedRank]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssignedStudents();
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Assigned Scope Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Assigned Students
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Server-scoped directory of students assigned to your department, academic year, and section.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assigned students by name, roll ID, email, or branch..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            {/* Academic Year Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shrink-0">
              <span className="text-slate-400 px-2 text-[10px] font-bold uppercase">Year:</span>
              {['All', '1st Year', '2nd Year', '3rd Year', '4th Year'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedYear === yr
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shrink-0">
              <span className="text-slate-400 px-2 text-[10px] font-bold uppercase">Sec:</span>
              {['All', 'A', 'B', 'C', 'D'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedSection === sec
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>

            {/* Rank Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold shrink-0">
              <span className="text-slate-400 px-2 text-[10px] font-bold uppercase">Rank:</span>
              {['All', 'Platinum', 'Gold', 'Silver', 'Unranked'].map((rk) => (
                <button
                  key={rk}
                  onClick={() => setSelectedRank(rk)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedRank === rk
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rk}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT CARDS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 animate-pulse">Retrieving authorized student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Assigned Students Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            No student records match your active college, branch, or selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((stu) => (
            <div
              key={stu.id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    {stu.academicYear} &bull; Sec {stu.section}
                  </span>

                  {/* Rank Badge */}
                  {stu.rank === 'Platinum' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>PLATINUM</span>
                    </span>
                  )}
                  {stu.rank === 'Gold' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>GOLD</span>
                    </span>
                  )}
                  {stu.rank === 'Silver' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
                      SILVER
                    </span>
                  )}
                  {stu.rank === 'Unranked' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      UNRANKED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {stu.fullName}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    ID: {stu.studentId} &bull; {stu.branch}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Readiness Index:</span>
                  <span className="font-extrabold text-blue-400">{stu.readinessScore}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => setSelectedStudentId(stu.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BarChart2 className="w-4 h-4" />
                  <span>Analyze Performance Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STUDENT DETAIL ANALYSIS MODAL */}
      {selectedStudentId && (
        <StudentDetailAnalysis
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}
    </div>
  );
}
