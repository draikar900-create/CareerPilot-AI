import React, { useState, useEffect } from 'react';
import { RECOMMENDED_INTERNSHIPS } from '../../data/mockData';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  Building2,
  ExternalLink,
  FileText,
  Bookmark,
  Eye,
  Send
} from 'lucide-react';

export default function Internships() {
  const { currentRole } = useCareer();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'saved'
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applyModalItem, setApplyModalItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [appliedIds, setAppliedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_applied_internships');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_applied_internships', JSON.stringify(appliedIds));
    } catch (e) {}
  }, [appliedIds]);

  const [savedInternshipIds, setSavedInternshipIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_saved_internships');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_saved_internships', JSON.stringify(savedInternshipIds));
    } catch (e) {}
  }, [savedInternshipIds]);

  const toggleSaveInternship = (item) => {
    if (savedInternshipIds.includes(item.id)) {
      setSavedInternshipIds(prev => prev.filter(id => id !== item.id));
      showToast(`Removed "${item.company}" internship from Saved`, 'info');
    } else {
      setSavedInternshipIds(prev => [...prev, item.id]);
      showToast(`"${item.company}" internship saved successfully!`, 'success');
    }
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!profile.resume && Number(profile.currentSemester) > 1) {
      showToast('Please upload your resume in the Student Profile before applying.', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setAppliedIds(prev => ({ ...prev, [applyModalItem.id]: true }));
      showToast(`Application successfully submitted to ${applyModalItem.company}!`, 'success');
      setApplyModalItem(null);
    }, 900);
  };

  const displayedInternships = activeSection === 'saved'
    ? RECOMMENDED_INTERNSHIPS.filter(item => savedInternshipIds.includes(item.id))
    : RECOMMENDED_INTERNSHIPS;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recommended Tier-1 Internships
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Live internships matched against your verified skills, current semester standing, and target role of <strong className="text-slate-800 dark:text-slate-200">{currentRole?.title || 'Engineering'}</strong>.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs (All Internships vs Saved Internships) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>All Internships</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {RECOMMENDED_INTERNSHIPS.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'saved'
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedInternshipIds.length > 0 ? 'fill-current' : ''}`} />
            <span>Saved Internships</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'saved' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {savedInternshipIds.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {displayedInternships.length} {activeSection === 'saved' ? 'Saved' : 'Available'} Opportunities
        </span>
      </div>

      {/* Empty State for Saved Internships */}
      {activeSection === 'saved' && displayedInternships.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No saved internships yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Explore active openings and click Save on any internship card to bookmark it for later review.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveSection('all')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Browse All Internships</span>
            </button>
          </div>
        </div>
      ) : (
        /* Internships List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedInternships.map((item) => {
            const isApplied = !!appliedIds[item.id];
            const isSaved = savedInternshipIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  {/* Company & Role Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
                      <img src={item.logo} alt={item.company} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
                          {item.company}
                        </span>
                        {isApplied && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Applied
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {item.role}
                      </h3>
                    </div>
                  </div>

                  {/* Location & Stipend & Duration */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.stipend}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Due: {item.deadline}</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3 Action Buttons: View, Apply, Save */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setSelectedInternship(item)}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    disabled={isApplied}
                    onClick={() => setApplyModalItem(item)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isApplied
                        ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed'
                        : 'bg-brand-600 text-white shadow-glow hover:bg-brand-500'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Applied' : 'Apply'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSaveInternship(item)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                        : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-600 hover:text-white'
                    }`}
                    title={isSaved ? 'Click to remove from saved' : 'Save internship'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved ✓' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {selectedInternship && (
        <Modal
          isOpen={!!selectedInternship}
          onClose={() => setSelectedInternship(null)}
          title={`${selectedInternship.company} – ${selectedInternship.role}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInternship.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Compensation:</span>
                <span className="font-semibold text-emerald-500">{selectedInternship.stipend}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInternship.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Applicants:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedInternship.applicants}+ applied</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedInternship.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => toggleSaveInternship(selectedInternship)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  savedInternshipIds.includes(selectedInternship.id)
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedInternshipIds.includes(selectedInternship.id) ? 'fill-current' : ''}`} />
                <span>{savedInternshipIds.includes(selectedInternship.id) ? 'Saved ✓' : 'Save'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInternship(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const item = selectedInternship;
                    setSelectedInternship(null);
                    setApplyModalItem(item);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow cursor-pointer"
                >
                  Proceed to Apply
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Apply Modal */}
      {applyModalItem && (
        <Modal
          isOpen={!!applyModalItem}
          onClose={() => setApplyModalItem(null)}
          title={`Apply to ${applyModalItem.company}`}
        >
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-600 dark:text-brand-300">
              Applying for <strong>{applyModalItem.role}</strong> with profile: <strong>{profile.fullName}</strong>.
            </div>

            {/* Attached Resume confirmation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {profile.resume ? profile.resume.name : 'No Resume Uploaded'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {profile.resume ? `ATS Score: ${profile.resume.atsScore}%` : 'Upload in profile required'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Attached</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cover Note / Why this internship?
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what excites you about this role..."
                defaultValue={`I am a Semester ${profile.currentSemester || 1} student at ${profile.collegeName || 'University'} specializing in ${currentRole?.title || 'Software Engineering'}. I have demonstrated experience in ${(profile.skills || []).slice(0, 3).join(', ')} and would love to contribute to ${applyModalItem.company}.`}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApplyModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Confirm Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
