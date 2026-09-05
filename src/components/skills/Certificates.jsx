import React, { useState, useEffect } from 'react';
import { RECOMMENDED_CERTIFICATES } from '../../data/mockData';
import { useCareer } from '../../context/CareerContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import {
  Award,
  Clock,
  Star,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Bookmark
} from 'lucide-react';

export default function Certificates() {
  const { currentRole } = useCareer();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('all'); // 'all' | 'saved'
  const [selectedCert, setSelectedCert] = useState(null);

  const [savedCertificateIds, setSavedCertificateIds] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_saved_certificates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cp_saved_certificates', JSON.stringify(savedCertificateIds));
    } catch (e) {}
  }, [savedCertificateIds]);

  const toggleSaveCertificate = (cert) => {
    if (savedCertificateIds.includes(cert.id)) {
      setSavedCertificateIds(prev => prev.filter(id => id !== cert.id));
      showToast(`Removed "${cert.name}" from Saved Certificates`, 'info');
    } else {
      setSavedCertificateIds(prev => [...prev, cert.id]);
      showToast(`"${cert.name}" saved successfully!`, 'success');
    }
  };

  const displayedCertificates = activeSection === 'saved'
    ? RECOMMENDED_CERTIFICATES.filter(c => savedCertificateIds.includes(c.id))
    : RECOMMENDED_CERTIFICATES;

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Credentials Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Industry-Recognized Certifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Accredited certifications from AWS, Google Cloud, Meta, and DeepLearning.AI to validate your skills on LinkedIn and resumes.
          </p>
        </div>
      </div>

      {/* Module Navigation Tabs (All Certificates vs Saved Certificates) */}
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
            <Award className="w-3.5 h-3.5" />
            <span>All Certificates</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'all' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {RECOMMENDED_CERTIFICATES.length}
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
            <Bookmark className={`w-3.5 h-3.5 ${savedCertificateIds.length > 0 ? 'fill-current' : ''}`} />
            <span>Saved Certificates</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSection === 'saved' ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
              {savedCertificateIds.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {displayedCertificates.length} {activeSection === 'saved' ? 'Saved' : 'Featured'} Certifications
        </span>
      </div>

      {/* Empty State for Saved Certificates */}
      {activeSection === 'saved' && displayedCertificates.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No saved certificates yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Explore industry certifications from top tech providers and click Save to bookmark them for your study goals.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveSection('all')}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-glow transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Certifications</span>
            </button>
          </div>
        </div>
      ) : (
        /* Certifications Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCertificates.map((cert) => {
            const isSaved = savedCertificateIds.includes(cert.id);

            return (
              <div
                key={cert.id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                      {cert.badge}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{cert.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {cert.name}
                  </h3>

                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1">
                    Offered by: {cert.provider}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Difficulty</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{cert.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{cert.duration}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Skills Validated
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cert.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explore & Save Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-brand-600 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Explore</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSaveCertificate(cert)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30'
                        : 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-600 hover:text-white'
                    }`}
                    title={isSaved ? 'Click to remove from saved' : 'Save certification'}
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

      {/* Explore Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title={selectedCert.name}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-1">
              <p><strong>Provider:</strong> {selectedCert.provider}</p>
              <p><strong>Difficulty Level:</strong> {selectedCert.difficulty}</p>
              <p><strong>Study Commitment:</strong> {selectedCert.duration}</p>
              <p><strong>Satisfaction Rating:</strong> {selectedCert.rating} / 5.0 ⭐</p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This certification directly enhances candidate credibility when applying for {currentRole?.title || 'Engineering'} positions and matches our ATS scanning keywords.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => toggleSaveCertificate(selectedCert)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  savedCertificateIds.includes(selectedCert.id)
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${savedCertificateIds.includes(selectedCert.id) ? 'fill-current' : ''}`} />
                <span>{savedCertificateIds.includes(selectedCert.id) ? 'Saved ✓' : 'Save Certificate'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={selectedCert.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow flex items-center gap-2 cursor-pointer"
                >
                  <span>Visit Official Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
