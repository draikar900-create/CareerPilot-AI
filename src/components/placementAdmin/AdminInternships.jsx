import React, { useState } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import { useToast } from '../../context/ToastContext';
import { Briefcase, Plus, Edit2, Trash2, Search, X, AlertTriangle } from 'lucide-react';

export default function AdminInternships() {
  const { internships, companies, addInternship, updateInternship, deleteInternship } = usePlacementAdmin();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [deletingInternship, setDeletingInternship] = useState(null);

  const [formData, setFormData] = useState({
    company_id: '',
    role_title: '',
    description: '',
    location: 'Remote',
    stipend: 'Unpaid',
    duration: '3 Months',
    status: 'Published'
  });

  const openAddModal = () => {
    setFormData({
      company_id: companies?.[0]?.id || '',
      role_title: '',
      description: '',
      location: 'Remote',
      stipend: 'Unpaid',
      duration: '3 Months',
      status: 'Published'
    });
    setShowAddModal(true);
  };

  const openEditModal = (internship) => {
    setEditingInternship(internship);
    setFormData({
      company_id: internship.company_id || '',
      role_title: internship.role_title || internship.title || '',
      description: internship.description || '',
      location: internship.location || 'Remote',
      stipend: internship.stipend || 'Unpaid',
      duration: internship.duration || '3 Months',
      status: internship.status || 'Published'
    });
    setShowAddModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.role_title.trim()) {
      showToast('Role Title is required', 'error');
      return;
    }
    if (!formData.company_id) {
      showToast('Please select a Company. If none exist, add one first.', 'error');
      return;
    }

    if (editingInternship) {
      updateInternship(editingInternship.id, formData);
    } else {
      addInternship(formData);
    }
    setShowAddModal(false);
    setEditingInternship(null);
  };

  const confirmDelete = () => {
    if (deletingInternship) {
      deleteInternship(deletingInternship.id);
      setDeletingInternship(null);
    }
  };

  const filtered = (internships || []).filter(
    (i) =>
      i.role_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.companies?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Internships Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Internships
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Internship</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search internships..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {filtered.length} Internships
        </span>
      </div>

      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">Role / Company</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Duration & Stipend</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No internships found.
                  </td>
                </tr>
              ) : (
                filtered.map((internship) => (
                  <tr key={internship.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      <div className="text-sm">{internship.role_title || internship.title}</div>
                      <div className="text-xs text-slate-500">{internship.companies?.name || internship.company_name}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      {internship.location}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      <div>{internship.duration}</div>
                      <div className="text-slate-500">{internship.stipend}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${internship.status === 'Published' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20'}`}>
                        {internship.status || 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditModal(internship)} className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingInternship(internship)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600">
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
          <div className="w-full max-w-xl glass-card rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                <span>{editingInternship ? 'Edit Internship' : 'Add Internship'}</span>
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingInternship(null); }} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Company *</label>
                <select required value={formData.company_id} onChange={e => setFormData({ ...formData, company_id: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent">
                  <option value="" disabled>Select Company</option>
                  {(companies || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Role Title *</label>
                <input required value={formData.role_title} onChange={e => setFormData({ ...formData, role_title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Location</label>
                  <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Duration</label>
                  <input value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Stipend</label>
                  <input value={formData.stipend} onChange={e => setFormData({ ...formData, stipend: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent">
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md">
                  {editingInternship ? 'Save Changes' : 'Add Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingInternship && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-3xl p-6 bg-white dark:bg-slate-900">
            <div className="flex gap-3 text-rose-600 mb-3"><AlertTriangle className="w-6 h-6"/> <h3 className="font-bold">Delete Internship?</h3></div>
            <p className="text-xs text-slate-400">Are you sure you want to remove this internship?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDeletingInternship(null)} className="px-4 py-2 rounded-xl text-xs hover:bg-slate-800">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-xl text-xs text-white bg-rose-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
