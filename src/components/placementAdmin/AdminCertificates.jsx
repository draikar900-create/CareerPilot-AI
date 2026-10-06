import React, { useState } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import { Award, Plus, Edit2, Trash2, Search, X, AlertTriangle } from 'lucide-react';

export default function AdminCertificates() {
  const { certificates, addCertificate, updateCertificate, deleteCertificate } = usePlacementAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [deletingCertificate, setDeletingCertificate] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    category: 'Course',
    credential_url: ''
  });

  const openAddModal = () => {
    setFormData({
      title: '',
      provider: '',
      category: 'Course',
      credential_url: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      title: certificate.title || '',
      provider: certificate.provider || '',
      category: certificate.category || 'Course',
      credential_url: certificate.credential_url || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.provider.trim()) return;

    if (editingCertificate) {
      updateCertificate(editingCertificate.id, formData);
    } else {
      addCertificate(formData);
    }
    setShowAddModal(false);
    setEditingCertificate(null);
  };

  const confirmDelete = () => {
    if (deletingCertificate) {
      deleteCertificate(deletingCertificate.id);
      setDeletingCertificate(null);
    }
  };

  const filtered = (certificates || []).filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.provider?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Certifications Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Certificates
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certificate</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificates..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {filtered.length} Certificates
        </span>
      </div>

      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">Title</th>
                <th className="py-3.5 px-6">Provider</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No certificates found.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      <div className="text-sm">{cert.title}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      {cert.provider}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
                        {cert.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditModal(cert)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingCertificate(cert)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-card rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-500" />
                <span>{editingCertificate ? 'Edit Certificate' : 'Add Certificate'}</span>
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingCertificate(null); }} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Title *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-rose-500/50" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Provider *</label>
                <input required value={formData.provider} onChange={e => setFormData({ ...formData, provider: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-rose-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Category</label>
                  <input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-rose-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Credential URL</label>
                  <input value={formData.credential_url} onChange={e => setFormData({ ...formData, credential_url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-rose-500/50" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 shadow-md">
                  {editingCertificate ? 'Save Changes' : 'Add Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-3xl p-6 bg-white dark:bg-slate-900">
            <div className="flex gap-3 text-rose-600 mb-3"><AlertTriangle className="w-6 h-6"/> <h3 className="font-bold">Delete Certificate?</h3></div>
            <p className="text-xs text-slate-400">Are you sure you want to remove this certificate?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDeletingCertificate(null)} className="px-4 py-2 rounded-xl text-xs hover:bg-slate-800">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-xl text-xs text-white bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
