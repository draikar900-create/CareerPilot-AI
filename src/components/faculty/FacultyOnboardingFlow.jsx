import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  Building,
  Mail,
  Phone,
  Briefcase,
  Award,
  BookOpen,
  GraduationCap,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  BadgeCheck,
  IdCard,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export default function FacultyOnboardingFlow({ onComplete }) {
  const { showToast } = useToast();
  const { currentUser, syncUserWithRole } = useAuth();

  const [saving, setSaving] = useState(false);

  // REQUIRED FIELDS
  const [fullName, setFullName] = useState(currentUser?.user_metadata?.full_name || currentUser?.name || '');
  const [employeeId, setEmployeeId] = useState(currentUser?.user_metadata?.employee_id || '');
  const [collegeName, setCollegeName] = useState(currentUser?.user_metadata?.college_name || 'CareerPilot Institute of Technology');
  const [department, setDepartment] = useState(currentUser?.user_metadata?.department || 'Computer Science & Engineering');
  const [designation, setDesignation] = useState(currentUser?.user_metadata?.designation || 'Assistant Professor');

  // OPTIONAL FIELDS
  const [phone, setPhone] = useState(currentUser?.phone || currentUser?.user_metadata?.phone || '');
  const [qualification, setQualification] = useState(currentUser?.user_metadata?.qualification || '');
  const [specialization, setSpecialization] = useState(currentUser?.user_metadata?.specialization || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(currentUser?.user_metadata?.years_of_experience || '');
  const [bio, setBio] = useState(currentUser?.user_metadata?.bio || '');
  const [subjectsTaught, setSubjectsTaught] = useState(currentUser?.user_metadata?.subjects_taught || []);
  const [subjectInput, setSubjectInput] = useState('');

  // Teaching Assignments
  const [assignments, setAssignments] = useState([
    { academic_year: '3rd Year', section: 'A', batch: 'All', subject: 'Data Structures & Algorithms' }
  ]);
  const [newYear, setNewYear] = useState('3rd Year');
  const [newSection, setNewSection] = useState('A');
  const [newSubject, setNewSubject] = useState('');

  const handleAddSubjectTag = () => {
    if (!subjectInput.trim()) return;
    if (!subjectsTaught.includes(subjectInput.trim())) {
      setSubjectsTaught(prev => [...prev, subjectInput.trim()]);
    }
    setSubjectInput('');
  };

  const handleRemoveSubjectTag = (idx) => {
    setSubjectsTaught(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddAssignment = () => {
    if (!newSubject.trim()) {
      showToast('Please enter a subject name for the scope assignment.', 'info');
      return;
    }
    setAssignments(prev => [
      ...prev,
      { academic_year: newYear, section: newSection, batch: 'All', subject: newSubject.trim() }
    ]);
    setNewSubject('');
  };

  const handleRemoveAssignment = (idx) => {
    setAssignments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Full Name is required.', 'error');
      return;
    }
    if (!employeeId.trim()) {
      showToast('Employee / Faculty ID is required.', 'error');
      return;
    }
    if (!collegeName.trim()) {
      showToast('College / Institution Name is required.', 'error');
      return;
    }
    if (!department.trim()) {
      showToast('Department / Branch is required.', 'error');
      return;
    }
    if (!designation.trim()) {
      showToast('Academic Designation is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        employee_id: employeeId.trim(),
        college_name: collegeName.trim(),
        department: department.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        subjects_taught: subjectsTaught,
        years_of_experience: yearsOfExperience.trim(),
        bio: bio.trim(),
        assignments,
        onboarding_completed: true
      };

      const res = await apiService.saveFacultyOnboarding(payload);
      if (res && res.success) {
        showToast('Faculty onboarding completed successfully! Welcome to your Faculty Portal.', 'success');
        if (typeof syncUserWithRole === 'function' && currentUser) {
          await syncUserWithRole(currentUser);
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
      } else {
        showToast(res?.message || 'Failed to save onboarding information.', 'error');
      }
    } catch (err) {
      console.error('Error in faculty onboarding:', err);
      showToast('Failed to save onboarding: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Onboarding Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <UserCheck className="w-4 h-4" />
            <span>Faculty Onboarding & Instructional Scope</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to CareerPilot Faculty Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Please complete your official faculty credentials and teaching scope to activate your branch-scoped student management dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: REQUIRED ACADEMIC CREDENTIALS */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Required Faculty Identity & Institution
                </h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                REQUIRED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Faculty / Employee ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. FAC-2026-104"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Official Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Official Email (Auth Account)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-950/50 text-slate-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Academic Designation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Adjunct Faculty">Adjunct Faculty</option>
                  </select>
                </div>
              </div>

              {/* College Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  College / Institution Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Jain Institute of Technology"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    required
                  />
                </div>
              </div>

              {/* Department / Branch */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Department / Branch <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                    <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                    <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                    <option value="Electrical & Electronics Engineering">Electrical & Electronics (EEE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OPTIONAL PROFESSIONAL PROFILE */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Professional Qualification & Expertise
                </h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700">
                OPTIONAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Qualification */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Highest Academic Qualification
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. Ph.D. in Computer Science / M.Tech in Software Engineering"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Area of Specialization
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Distributed Systems, Machine Learning, Cloud Architecture"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Years of Experience */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Teaching / Industry Experience
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 10 Years"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Subjects Taught */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Subjects Taught
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubjectTag(); } }}
                    placeholder="Type subject name and press Enter (e.g. DBMS, Operating Systems)"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubjectTag}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>
                {subjectsTaught.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {subjectsTaught.map((sub, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubjectTag(idx)}
                          className="hover:text-rose-400"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Professional Bio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Professional Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Share a short introduction about your academic trajectory, research interests, or teaching methodology..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: INITIAL INSTRUCTIONAL ASSIGNMENT SCOPE */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Initial Teaching Scope & Class Assignments
                </h2>
              </div>
              <span className="text-xs text-blue-500 font-bold">
                {assignments.length} Active Scope Scopes
              </span>
            </div>

            {/* Assignments List */}
            <div className="space-y-3">
              {assignments.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                      {item.academic_year} &bull; Section {item.section}
                    </span>
                    <span className="text-xs text-slate-400">
                      Subject: <strong>{item.subject}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignment(idx)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Scope Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs pt-2">
              <div className="sm:col-span-3">
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="All">All Years</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-semibold focus:outline-none"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                  <option value="All">All Secs</option>
                </select>
              </div>

              <div className="sm:col-span-5">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Subject / Course Name (e.g. Web Tech)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddAssignment}
                  className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-700 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Completing Faculty Setup...' : 'Complete Faculty Setup & Open Portal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
