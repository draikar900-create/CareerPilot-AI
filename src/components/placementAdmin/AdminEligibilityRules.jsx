import React, { useState } from 'react';
import { usePlacementAdmin } from '../../context/PlacementAdminContext';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

const BRANCH_OPTIONS = ['CSE', 'ISE', 'AIML', 'ECE', 'EEE', 'Mechanical', 'Civil'];

export default function AdminEligibilityRules() {
  const { eligibilityRules, addEligibilityRule, updateEligibilityRule, deleteEligibilityRule } =
    usePlacementAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    jobRole: '',
    minCgpa: 7.5,
    eligibleBranches: ['CSE', 'ISE', 'AIML'],
    maxBacklogs: 0,
    requiredSkills: ''
  });

  const openAddModal = () => {
    setFormData({
      companyName: '',
      jobRole: '',
      minCgpa: 7.5,
      eligibleBranches: ['CSE', 'ISE', 'AIML'],
      maxBacklogs: 0,
      requiredSkills: ''
    });
    setShowAddModal(true);
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      companyName: rule.companyName,
      jobRole: rule.jobRole,
      minCgpa: rule.minCgpa,
      eligibleBranches: Array.isArray(rule.eligibleBranches) ? rule.eligibleBranches : [],
      maxBacklogs: rule.maxBacklogs,
      requiredSkills: rule.requiredSkills
    });
  };

  const toggleBranchOption = (branch) => {
    setFormData((prev) => {
      const exists = prev.eligibleBranches.includes(branch);
      return {
        ...prev,
        eligibleBranches: exists
          ? prev.eligibleBranches.filter((b) => b !== branch)
          : [...prev.eligibleBranches, branch]
      };
    });
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.jobRole.trim()) return;

    if (editingRule) {
      updateEligibilityRule(editingRule.id, formData);
      setEditingRule(null);
    } else {
      addEligibilityRule(formData);
      setShowAddModal(false);
    }
  };

  const confirmDelete = () => {
    if (deletingRule) {
      deleteEligibilityRule(deletingRule.id);
      setDeletingRule(null);
    }
  };

  const filteredRules = eligibilityRules.filter(
    (r) =>
      r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requiredSkills.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(r.eligibleBranches)
        ? r.eligibleBranches.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()))
        : false)
  );

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Recruiting Criteria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Eligibility Rules Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define institutional cutoffs for CGPA, eligible branch cohorts, backlogs tolerances, and required competencies.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Eligibility Rule</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, job role, required skills, or eligible branch..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
          {filteredRules.length} Rules Active
        </span>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/75 dark:bg-slate-900/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Company Name</th>
                <th className="py-3.5 px-4">Job Role</th>
                <th className="py-3.5 px-3">Minimum CGPA</th>
                <th className="py-3.5 px-4">Eligible Branches</th>
                <th className="py-3.5 px-3 text-center">Max Backlogs</th>
                <th className="py-3.5 px-4">Required Skills</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No eligibility rules found matching your query.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>{rule.companyName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {rule.jobRole}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                        {rule.minCgpa.toFixed(2)}+
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(rule.eligibleBranches) && rule.eligibleBranches.length > 0 ? (
                          rule.eligibleBranches.map((branch, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {branch}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">All Branches</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          rule.maxBacklogs === 0
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {rule.maxBacklogs === 0 ? '0 (Strict)' : `Max ${rule.maxBacklogs}`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {rule.requiredSkills}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors flex items-center gap-1"
                          title="Edit Rules"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Rules</span>
                        </button>
                        <button
                          onClick={() => setDeletingRule(rule)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Eligibility Rule Modal */}
      {(showAddModal || editingRule) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                <span>{editingRule ? 'Edit Eligibility Criteria' : 'Add Eligibility Rule'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRule(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Microsoft"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Minimum CGPA (0.00 - 10.00)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Maximum Backlogs Allowed
                  </label>
                  <select
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData({ ...formData, maxBacklogs: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  >
                    <option value={0}>0 (Strictly No Standing Backlogs)</option>
                    <option value={1}>Max 1 Standing Backlog</option>
                    <option value={2}>Max 2 Standing Backlogs</option>
                    <option value={3}>Max 3 Standing Backlogs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Eligible Branches
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BRANCH_OPTIONS.map((branch) => {
                    const isSelected = formData.eligibleBranches.includes(branch);
                    return (
                      <div
                        key={branch}
                        onClick={() => toggleBranchOption(branch)}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors text-xs font-semibold ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{branch}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Required Skills / Keywords
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="e.g. DSA, System Design, Java, Docker"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 shadow-md shadow-rose-500/20"
                >
                  {editingRule ? 'Update Rules' : 'Save Eligibility Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl border border-rose-500/30 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Rule?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to remove the eligibility criteria for <strong className="text-slate-900 dark:text-white">{deletingRule.companyName} ({deletingRule.jobRole})</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingRule(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
