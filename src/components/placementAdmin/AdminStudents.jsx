import React, { useState, useMemo } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import Modal from '../common/Modal';
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
  AlertCircle,
  Plus,
  Eye,
  FileText
} from 'lucide-react';

export default function AdminStudents() {
  const { students, fetchPlacementAdminData } = usePlacementAdmin();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [cgpaFilter, setCgpaFilter] = useState('ALL');
  const [readinessFilter, setReadinessFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStudentData, setAddStudentData] = useState({
    full_name: '',
    email: '',
    college_name: '',
    branch: '',
    semester: '',
    cgpa: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlacementStatus, setSelectedPlacementStatus] = useState('Placed');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleUpdatePlacementStatus = async (sId, statusToUpdate) => {
    setUpdatingStatus(true);
    try {
      const res = await apiService.updatePlacementStatus(sId, statusToUpdate);
      if (res.success) {
        showToast(`Official Placement status updated to '${statusToUpdate}'`, 'success');
        setStudentDetail(prev => prev ? { ...prev, placementStatus: statusToUpdate, isPlaced: statusToUpdate === 'Placed' } : prev);
        if (fetchPlacementAdminData) fetchPlacementAdminData();
      } else {
        showToast(res.message || 'Failed to update placement status', 'error');
      }
    } catch (err) {
      showToast('Error updating placement status: ' + err.message, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSelectStudent = async (sId) => {
    setSelectedStudentId(sId);
    setLoadingDetail(true);
    try {
      const res = await apiService.getAdminStudentDetail(sId);
      if (res && res.success) {
        setStudentDetail(res.studentDetail);
      } else {
        showToast('Failed to load student profile', 'error');
        setSelectedStudentId(null);
      }
    } catch (err) {
      showToast('Error loading student profile: ' + err.message, 'error');
      setSelectedStudentId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiService.createAdminStudent(addStudentData);
      if (res.success) {
        showToast('Student added successfully!', 'success');
        setIsAddModalOpen(false);
        setAddStudentData({ full_name: '', email: '', college_name: '', branch: '', semester: '', cgpa: '' });
        if (fetchPlacementAdminData) fetchPlacementAdminData();
      } else {
        showToast(res.message || 'Failed to add student.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error adding student', 'error');
    } finally {
      setSubmitting(false);
    }
  };


  // Filtering
  const filteredStudents = useMemo(() => {
    return (students || []).filter((student) => {
      const name = student.name || student.full_name || 'Unnamed Student';
      const email = student.email || '';
      const careerGoal = student.careerGoal || student.career_goal || '';
      const branch = (student.branch || 'CSE').toUpperCase();
      const academicYear = student.academic_year || student.academicYear || '';
      const cgpa = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa || 0);
      const readinessScore = student.readinessScore || student.readiness_score || 80;

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        careerGoal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === 'ALL' || branch === branchFilter.toUpperCase();

      const matchesYear =
        yearFilter === 'ALL' || academicYear.toLowerCase().includes(yearFilter.toLowerCase());

      let matchesCgpa = true;
      if (cgpaFilter === 'HIGH') matchesCgpa = cgpa >= 8.5;
      else if (cgpaFilter === 'MID') matchesCgpa = cgpa >= 7.5 && cgpa < 8.5;
      else if (cgpaFilter === 'PASS') matchesCgpa = cgpa >= 6.5 && cgpa < 7.5;
      else if (cgpaFilter === 'NEEDS_IMP') matchesCgpa = cgpa < 6.5;

      let matchesReadiness = true;
      if (readinessFilter === 'READY') {
        matchesReadiness = readinessScore >= 85;
      } else if (readinessFilter === 'DEVELOPING') {
        matchesReadiness = readinessScore >= 75 && readinessScore < 85;
      } else if (readinessFilter === 'NEEDS_PREP') {
        matchesReadiness = readinessScore < 75;
      }

      return matchesSearch && matchesBranch && matchesYear && matchesCgpa && matchesReadiness;
    });
  }, [students, searchQuery, branchFilter, yearFilter, cgpaFilter, readinessFilter]);

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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          
          {/* Branch Filter */}
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

          {/* Academic Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
          >
            <option value="ALL">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          {/* CGPA Filter */}
          <select
            value={cgpaFilter}
            onChange={(e) => {
              setCgpaFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
          >
            <option value="ALL">All CGPA</option>
            <option value="HIGH">CGPA ≥ 8.5</option>
            <option value="MID">CGPA 7.5 - 8.4</option>
            <option value="PASS">CGPA 6.5 - 7.4</option>
            <option value="NEEDS_IMP">CGPA &lt; 6.5</option>
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
                      onClick={() => handleSelectStudent(s.id || s.user_id)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer"
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

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Student"
        >
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={addStudentData.full_name}
                onChange={(e) => setAddStudentData({ ...addStudentData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={addStudentData.email}
                onChange={(e) => setAddStudentData({ ...addStudentData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  value={addStudentData.college_name}
                  onChange={(e) => setAddStudentData({ ...addStudentData, college_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g. ABC Engineering College"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={addStudentData.branch}
                  onChange={(e) => setAddStudentData({ ...addStudentData, branch: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g. CSE"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={addStudentData.semester}
                  onChange={(e) => setAddStudentData({ ...addStudentData, semester: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g. 6"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={addStudentData.cgpa}
                  onChange={(e) => setAddStudentData({ ...addStudentData, cgpa: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="e.g. 8.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Student Detail Modal */}
      {selectedStudentId && (
        <Modal
          isOpen={Boolean(selectedStudentId)}
          onClose={() => {
            setSelectedStudentId(null);
            setStudentDetail(null);
          }}
          title="TPO Student Profile Analysis"
        >
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading authorized student database profile...</p>
            </div>
          ) : !studentDetail ? (
            <div className="py-8 text-center text-slate-400">
              Failed to load student details or unauthorized access.
            </div>
          ) : (
            <div className="space-y-5 text-slate-900 dark:text-white">
              {/* Header Info */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold">{studentDetail.full_name || studentDetail.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{studentDetail.email}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {studentDetail.branch} &bull; {studentDetail.academicYear}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Section: {studentDetail.section}</p>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">CGPA</span>
                  <p className="text-base font-extrabold text-indigo-500">{(studentDetail.cgpa || 0).toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Readiness Index</span>
                  <p className="text-base font-extrabold text-emerald-500">{studentDetail.readinessScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Projects</span>
                  <p className="text-base font-extrabold text-blue-500 font-mono">{(studentDetail.projects || []).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Certificates</span>
                  <p className="text-base font-extrabold text-purple-500 font-mono">{(studentDetail.certificates || []).length}</p>
                </div>
              </div>

              {/* Placement Status & Records */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
                  <span>Official Placement Status & Records</span>
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={studentDetail.placementStatus?.includes('Placed') ? 'Placed' : (studentDetail.placementStatus || 'Not Started')}
                      onChange={(e) => setSelectedPlacementStatus(e.target.value)}
                      className="py-1 px-2.5 text-xs rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Eligible">Eligible</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Placed">Placed</option>
                      <option value="Not Placed">Not Placed</option>
                    </select>
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={() => handleUpdatePlacementStatus(selectedStudentId, selectedPlacementStatus || 'Placed')}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {updatingStatus ? 'Saving...' : 'Update Status'}
                    </button>
                  </div>
                </div>

                {(!studentDetail?.applications || studentDetail.applications.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No placement applications submitted yet.</p>
                ) : (
                  <div className="space-y-1 pt-1">
                    {(studentDetail.applications || []).map((app, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-t border-slate-200/40 dark:border-slate-800/40">
                        <span className="font-semibold">{app?.company_name || 'Drive'}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 font-bold">{app?.status || 'Active'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resume Document Access */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Candidate Resume Document</span>
                {(studentDetail.resume_url || studentDetail.resumeUrl || studentDetail.resume_storage_path) ? (
                  <div className="flex items-center gap-3 pt-1">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Resume Document Uploaded</p>
                      <p className="text-[11px] text-slate-400">Authenticated TPO scope granted</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await apiService.viewResume(selectedStudentId);
                          } catch (err) {
                            showToast('Error viewing resume: ' + err.message, 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await apiService.downloadResume(selectedStudentId, `${studentDetail.full_name || 'student'}_resume.pdf`);
                          } catch (err) {
                            showToast('Error downloading resume: ' + err.message, 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No resume document uploaded by student.</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Technical Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {(studentDetail.skills || []).length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No skills listed yet</span>
                  ) : (
                    (studentDetail.skills || []).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 font-medium">
                        {sk}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentDetail(null);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
