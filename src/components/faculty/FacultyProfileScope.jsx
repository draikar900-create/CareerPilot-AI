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
  BookOpen,
  Award,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
  IdCard,
  GraduationCap,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export default function FacultyProfileScope({ isOnboardingMode = false, onOnboardingComplete }) {
  const { showToast } = useToast();
  const { currentUser, syncUserWithRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [facultyData, setFacultyData] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [bio, setBio] = useState('');
  const [subjectsTaught, setSubjectsTaught] = useState([]);
  const [subjectTagInput, setSubjectTagInput] = useState('');
  const [assignments, setAssignments] = useState([]);

  // New assignment entry state
  const [newYear, setNewYear] = useState('3rd Year');
  const [newSection, setNewSection] = useState('A');
  const [newSubject, setNewSubject] = useState('');

  const loadFacultyProfile = async () => {
    setLoading(true);
    try {
      const res = await apiService.getFacultyProfile();
      if (res && res.success && res.faculty) {
        const f = res.faculty;
        setFacultyData(f);
        setFullName(f.fullName || currentUser?.user_metadata?.full_name || currentUser?.name || '');
        setEmployeeId(f.employeeId || currentUser?.user_metadata?.employee_id || '');
        setPhone(f.phone || currentUser?.phone || currentUser?.user_metadata?.phone || '');
        setCollegeName(f.collegeName || currentUser?.user_metadata?.college_name || '');
        setDepartment(f.department || currentUser?.user_metadata?.department || '');
        setDesignation(f.designation || currentUser?.user_metadata?.designation || 'Assistant Professor');
        setQualification(f.qualification || '');
        setSpecialization(f.specialization || '');
        setYearsOfExperience(f.yearsOfExperience || '');
        setBio(f.bio || '');
        setSubjectsTaught(Array.isArray(f.subjectsTaught) ? f.subjectsTaught : []);
        setAssignments(Array.isArray(f.assignments) ? f.assignments : []);
      } else {
        showToast(res?.message || 'Could not load faculty profile.', 'error');
      }
    } catch (err) {
      console.error('Error fetching faculty profile & scope:', err);
      showToast('Unable to load faculty profile from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacultyProfile();
  }, []);

  const handleAddSubjectTag = () => {
    if (!subjectTagInput.trim()) return;
    if (!subjectsTaught.includes(subjectTagInput.trim())) {
      setSubjectsTaught(prev => [...prev, subjectTagInput.trim()]);
    }
    setSubjectTagInput('');
  };

  const handleRemoveSubjectTag = (idx) => {
    setSubjectsTaught(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddAssignment = () => {
    if (!newSubject.trim()) {
      showToast('Please enter a subject name for the assignment.', 'info');
      return;
    }
    const newItem = {
      academic_year: newYear,
      section: newSection,
      batch: 'All',
      subject: newSubject.trim()
    };
    setAssignments((prev) => [...prev, newItem]);
    setNewSubject('');
    showToast(`Added assignment scope: ${newYear} Sec ${newSection} (${newItem.subject})`, 'success');
  };

  const handleRemoveAssignment = (index) => {
    setAssignments((prev) => prev.filter((_, idx) => idx !== index));
    showToast('Assignment scope removed.', 'info');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Full name is required.', 'error');
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
      if (res && res.success && res.faculty) {
        setFacultyData(res.faculty);
        showToast('Faculty profile and instructional scope saved successfully!', 'success');
        if (typeof syncUserWithRole === 'function' && currentUser) {
          await syncUserWithRole(currentUser);
        }
        if (typeof onOnboardingComplete === 'function') {
          onOnboardingComplete();
        }
      } else {
        showToast(res?.message || 'Failed to save faculty profile.', 'error');
      }
    } catch (err) {
      console.error('Error saving faculty profile:', err);
      showToast('Error persisting profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400 animate-pulse">
          Retrieving Faculty Profile & Instructional Scope from Database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Official Faculty Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Faculty Profile & Scope Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Server-authoritative record of your academic designation, qualification, specialization, and assigned teaching scope.
          </p>
        </div>

        <button
          onClick={loadFacultyProfile}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload DB Scope</span>
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <IdCard className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Academic & Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Full Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Faculty / Employee ID
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. FAC-2026-088"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email (Read only auth email) */}
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-200/50 dark:bg-slate-950 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>

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
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Academic Designation
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Associate Professor"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* College Name (Institutional Scope) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                College / Institution
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="College Name"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Department / Branch Scope
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Qualification & Bio Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Qualification, Bio & Subjects
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Qualification */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Highest Qualification
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Ph.D. in Computer Science"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Area of Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Artificial Intelligence & Cloud Systems"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Years of Experience
              </label>
              <input
                type="text"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                placeholder="e.g. 12 Years"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none"
              />
            </div>

            {/* Subjects Taught */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Subjects Taught
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subjectTagInput}
                  onChange={(e) => setSubjectTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubjectTag(); } }}
                  placeholder="Type subject name and press Enter"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none text-xs"
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
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <span>{sub}</span>
                      <button type="button" onClick={() => handleRemoveSubjectTag(idx)} className="hover:text-rose-400">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Professional Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Brief summary of academic background, publications, or teaching experience..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Assigned Instructional Scopes Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Instructional & Class Assignments Scope
              </h2>
            </div>
            <span className="text-xs text-blue-500 font-bold">
              {assignments.length} Active Scope Scopes
            </span>
          </div>

          {/* Current Assignments List */}
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                No active class assignment scopes configured yet. Add your teaching scopes below.
              </div>
            ) : (
              assignments.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {item.academic_year} &bull; Section {item.section}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {item.batch || 'All Batches'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Subject: <strong>{item.subject}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveAssignment(idx)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all shrink-0 cursor-pointer"
                    title="Remove assignment scope"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New Scope Form */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Add New Teaching Scope Assignment
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-3">
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none"
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
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none"
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
                  placeholder="Subject / Course Name (e.g. System Design)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddAssignment}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Scope</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-glow flex items-center gap-2 transition-all cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving to Supabase Database...' : 'Save Faculty Profile & Scope'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
