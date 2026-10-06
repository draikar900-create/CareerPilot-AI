import React, { useState, useEffect } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useProfile } from '../../context/ProfileContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import Modal from '../common/Modal';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  CheckCircle2,
  Bookmark,
  Eye,
  Send,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function Internships() {
  const { currentRole } = useCareer();
  const { profile } = useProfile();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'saved'
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applyModalItem, setApplyModalItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch real internships and applications from Supabase API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [intRes, appRes, savedRes] = await Promise.all([
        apiService.getInternships(),
        apiService.getMyApplications().catch(() => ({ success: true, applications: [] })),
        apiService.getSavedOpportunities().catch(() => ({ success: true, savedOpportunities: [] }))
      ]);

      if (intRes.success) setInternships(intRes.internships || []);
      if (appRes.success) setMyApplications(appRes.applications || []);
      if (savedRes.success) setSavedItems(savedRes.savedOpportunities || []);
    } catch (err) {
      showToast('Error loading internships: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const appliedMap = (myApplications || []).reduce((acc, app) => {
    if (app.internship_id) acc[app.internship_id] = app.status || 'Applied';
    return acc;
  }, {});

  const savedIds = (savedItems || [])
    .filter(item => item.opportunity_type === 'internship')
    .map(item => item.internship_id);

  const toggleSaveInternship = async (item) => {
    const isSaved = savedIds.includes(item.id);
    try {
      if (isSaved) {
        setSavedItems(prev => prev.filter(s => s.internship_id !== item.id));
        showToast(`Removed from Saved`, 'info');
      } else {
        await apiService.saveOpportunity({ opportunity_type: 'internship', internship_id: item.id });
        setSavedItems(prev => [...prev, { opportunity_type: 'internship', internship_id: item.id }]);
        showToast(`Internship saved!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save opportunity', 'error');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();

    if (!profile.resume) {
      showToast('Please upload your resume in your Student Profile before applying.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiService.applyOpportunity({
        opportunity_type: 'internship',
        internship_id: applyModalItem.id,
        company_id: applyModalItem.company_id
      });

      if (res.success) {
        showToast(`Application successfully submitted!`, 'success');
        setApplyModalItem(null);
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Application failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedInternships = activeSection === 'saved'
    ? internships.filter(item => savedIds.includes(item.id))
    : internships;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Real Opportunities Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Verified Internship Opportunities
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Live internships published directly by company recruiters and placement officers for <strong className="text-slate-800 dark:text-slate-200">{currentRole?.title || 'Engineering Students'}</strong>.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
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
            <span>Published Internships</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {internships.length}
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
            <Bookmark className={`w-3.5 h-3.5 ${savedIds.length > 0 ? 'fill-current' : ''}`} />
            <span>Saved Internships</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'saved' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {savedIds.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {displayedInternships.length} {activeSection === 'saved' ? 'Saved' : 'Active'} Opportunities
        </span>
      </div>

      {loading ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10">
          <div className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Fetching live database opportunities...</p>
        </div>
      ) : displayedInternships.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeSection === 'saved' ? 'No saved internships yet.' : 'No internships available yet.'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {activeSection === 'saved'
              ? 'Click Save on any internship card to bookmark it for later review.'
              : 'Placement officers and recruiters have not published any internships yet. Check back soon!'}
          </p>
        </div>
      ) : (
        /* Internships List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedInternships.map((item) => {
            const currentStatus = appliedMap[item.id];
            const isApplied = !!currentStatus;
            const isSaved = savedIds.includes(item.id);
            const companyName = item.companies?.name || 'Company';

            return (
              <div
                key={item.id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  {/* Company & Role Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm bg-white flex items-center justify-center font-bold text-brand-600">
                      {item.companies?.logo_url ? (
                        <img src={item.companies.logo_url} alt={companyName} className="w-full h-full object-cover" />
                      ) : (
                        companyName.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">
                          {companyName}
                        </span>
                        {isApplied && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {currentStatus}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {item.role_title || item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Location & Stipend & Duration */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location || 'On-site'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.stipend || 'Stipend Unspecified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.duration || '3 Months'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-500">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Due: {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'Open'}</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  {(item.required_skills || item.requirements || []).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Required Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(item.required_skills || item.requirements || []).map((sk) => (
                          <span
                            key={sk}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3 Action Buttons */}
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
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-600 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
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
          title={`${selectedInternship.companies?.name || 'Company'} – ${selectedInternship.role_title || selectedInternship.title}`}
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
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedInternship.description || 'No detailed description provided.'}
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
        </Modal>
      )}

      {/* Apply Modal */}
      {applyModalItem && (
        <Modal
          isOpen={!!applyModalItem}
          onClose={() => setApplyModalItem(null)}
          title={`Apply to ${applyModalItem.companies?.name || 'Opportunity'}`}
        >
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-600 dark:text-brand-300">
              Applying for <strong>{applyModalItem.role_title || applyModalItem.title}</strong> with profile: <strong>{profile.fullName}</strong>.
            </div>

            {/* Resume Status */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {profile.resume ? profile.resume.name : 'No Resume Uploaded'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {profile.resume ? 'Attached from Student Profile' : 'Upload in profile required'}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase ${profile.resume ? 'text-emerald-500' : 'text-rose-500'}`}>
                {profile.resume ? 'Attached' : 'Required'}
              </span>
            </div>

            {!profile.resume && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Please upload your resume in the Student Profile tab before applying.</span>
              </div>
            )}

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
                disabled={submitting || !profile.resume}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
