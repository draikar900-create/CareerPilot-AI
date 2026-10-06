import React, { useState, useEffect } from 'react';
import { useCareer } from '../../context/CareerContext';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/api';
import Modal from '../common/Modal';
import {
  Building,
  MapPin,
  Globe,
  Briefcase,
  Users
} from 'lucide-react';

export default function Companies() {
  const { currentRole } = useCareer();
  const { showToast } = useToast();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Fetch real companies from Supabase API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCompanies();
      if (res.success) {
        setCompanies(res.companies || res.data || []);
      }
    } catch (err) {
      showToast('Error loading companies: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/15 via-brand-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-500 border border-brand-500/20 mb-2">
            <Building className="w-3.5 h-3.5" />
            <span>Verified Employers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Explore companies hiring for <strong className="text-slate-800 dark:text-slate-200">{currentRole?.title || 'Engineering Students'}</strong>.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {companies.length} Companies Listed
        </span>
      </div>

      {loading ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10">
          <div className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-400">Fetching live companies from database...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-white/10 space-y-4 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
            <Building className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No companies available yet.
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Placement officers have not added any companies yet. Check back soon!
          </p>
        </div>
      ) : (
        /* Companies List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => {
            return (
              <div
                key={company.id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between cursor-pointer"
                onClick={() => setSelectedCompany(company)}
              >
                <div>
                  {/* Company Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm bg-white flex items-center justify-center font-bold text-brand-600 text-xl">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        company.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">
                        {company.name}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {company.location || 'Location Not Specified'}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                      {company.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {company.industry && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Briefcase className="w-3.5 h-3.5" />
                      {company.industry}
                    </span>
                  )}
                  {company.company_size && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <Users className="w-3.5 h-3.5" />
                      {company.company_size}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {selectedCompany && (
        <Modal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          title={selectedCompany.name}
        >
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
               <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white flex items-center justify-center font-bold text-brand-600 text-3xl">
                 {selectedCompany.logo_url ? (
                   <img src={selectedCompany.logo_url} alt={selectedCompany.name} className="w-full h-full object-cover" />
                 ) : (
                   selectedCompany.name.charAt(0).toUpperCase()
                 )}
               </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCompany.location || 'Not Specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Industry:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCompany.industry || 'Not Specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company Size:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCompany.company_size || 'Not Specified'}</span>
              </div>
              {selectedCompany.website && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400">Website:</span>
                  <a href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-semibold text-brand-500 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> Visit Site
                  </a>
                </div>
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-4">About {selectedCompany.name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedCompany.description || 'No detailed description provided.'}
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
