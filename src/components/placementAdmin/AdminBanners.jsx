import React, { useState } from 'react';
import { useBanners, BANNER_CATEGORIES, BANNER_REDIRECT_OPTIONS } from '../../context/BannerContext';
import {
  Sliders,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Briefcase,
  Building2,
  Milestone,
  Bell,
  BookOpen,
  FolderGit2,
  Award,
  Zap,
  Tag,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';

const ICON_OPTIONS = [
  { id: 'Calendar', label: 'Calendar (Events)', icon: Calendar },
  { id: 'Briefcase', label: 'Briefcase (Internships)', icon: Briefcase },
  { id: 'Building2', label: 'Building (Placements/Jobs)', icon: Building2 },
  { id: 'Milestone', label: 'Milestone (Roadmaps)', icon: Milestone },
  { id: 'Bell', label: 'Bell (Announcements)', icon: Bell },
  { id: 'BookOpen', label: 'Book (Resources)', icon: BookOpen },
  { id: 'FolderGit2', label: 'Folder (Projects)', icon: FolderGit2 },
  { id: 'Award', label: 'Award (Certificates)', icon: Award },
  { id: 'Sparkles', label: 'Sparkles (General)', icon: Sparkles }
];

const GRADIENT_PRESETS = [
  { label: 'Indigo Purple', value: 'from-indigo-600 via-purple-600 to-brand-500', preview: 'from-indigo-600 to-purple-600' },
  { label: 'Blue Cyan', value: 'from-blue-600 via-indigo-600 to-cyan-500', preview: 'from-blue-600 to-cyan-500' },
  { label: 'Emerald Teal', value: 'from-emerald-600 via-teal-600 to-cyan-600', preview: 'from-emerald-600 to-teal-600' },
  { label: 'Purple Pink', value: 'from-purple-600 via-indigo-600 to-pink-500', preview: 'from-purple-600 to-pink-500' },
  { label: 'Amber Rose', value: 'from-amber-600 via-orange-600 to-rose-600', preview: 'from-amber-600 to-rose-600' },
  { label: 'Violet Indigo', value: 'from-violet-600 via-purple-600 to-indigo-700', preview: 'from-violet-600 to-indigo-700' }
];

export default function AdminBanners() {
  const {
    banners,
    activeBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    resetBannersToDefault
  } = useBanners();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Events',
    buttonText: 'Explore Now',
    redirectLink: 'events',
    status: 'Active',
    gradient: GRADIENT_PRESETS[0].value,
    iconName: 'Sparkles',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  // Handle Form Change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Events',
      buttonText: 'View Events',
      redirectLink: 'events',
      status: 'Active',
      gradient: GRADIENT_PRESETS[0].value,
      iconName: 'Calendar',
      imageUrl: ''
    });
    setImagePreview('');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      category: banner.category || 'Events',
      buttonText: banner.buttonText || 'Explore Now',
      redirectLink: banner.redirectLink || 'dashboard',
      status: banner.status || 'Active',
      gradient: banner.gradient || GRADIENT_PRESETS[0].value,
      iconName: banner.iconName || 'Sparkles',
      imageUrl: banner.imageUrl || ''
    });
    setImagePreview(banner.imageUrl || '');
  };

  // Handle Image File Upload Preview
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        handleChange('imageUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Add
  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    addBanner(formData);
    setIsAddModalOpen(false);
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !editingBanner) return;
    updateBanner(editingBanner.id, formData);
    setEditingBanner(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (bannerToDelete) {
      deleteBanner(bannerToDelete.id);
      setBannerToDelete(null);
    }
  };

  // Filtered banners list
  const filteredBanners = banners.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Placement Team Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard Banner Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Control the rotating promotional and informational carousel displayed at the top of the Student Dashboard. Only active banners appear to students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={resetBannersToDefault}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Restore Default System Banners"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-600 hover:opacity-95 shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Banners</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{banners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active (In Carousel)</p>
            <p className="text-2xl font-black text-emerald-500 mt-1">{activeBanners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inactive (Hidden)</p>
            <p className="text-2xl font-black text-slate-400 mt-1">{banners.length - activeBanners.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {BANNER_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Banner Management Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4 sm:px-6">Banner Title</th>
                <th className="py-3.5 px-4">Banner Category</th>
                <th className="py-3.5 px-4 text-center">Banner Status</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Created Date</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Last Updated</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Sliders className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No banners match the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner) => {
                  const isActive = banner.status === 'Active';

                  return (
                    <tr
                      key={banner.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Banner Title & Preview Pill */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-r ${
                              banner.gradient || 'from-indigo-600 to-brand-500'
                            } flex items-center justify-center text-white shrink-0 shadow-sm`}
                          >
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {banner.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {banner.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Banner Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <Tag className="w-3 h-3" />
                          <span>{banner.category}</span>
                        </span>
                      </td>

                      {/* Banner Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleBannerStatus(banner.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-300'
                          }`}
                          title={`Click to ${isActive ? 'Disable' : 'Enable'}`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
                        {banner.createdAt || 'System Default'}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap hidden lg:table-cell">
                        {banner.updatedAt || 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Preview Action */}
                          <button
                            onClick={() => setPreviewBanner(banner)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Preview Banner"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Action */}
                          <button
                            onClick={() => handleOpenEdit(banner)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Banner"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Enable/Disable Quick Button */}
                          <button
                            onClick={() => toggleBannerStatus(banner.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                            title={isActive ? 'Disable Banner' : 'Enable Banner'}
                          >
                            {isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => setBannerToDelete(banner)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                            title="Delete Banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD BANNER MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Banner</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 mt-4">
              {/* Banner Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Banner Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. National Hackathon 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Banner Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Banner Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter a compelling description for students..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {BANNER_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Active">Active (Display in Carousel)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Button Text & Redirect Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                    placeholder="e.g. Explore Now"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Redirect Link / Section
                  </label>
                  <select
                    value={formData.redirectLink}
                    onChange={(e) => handleChange('redirectLink', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {BANNER_REDIRECT_OPTIONS.map(opt => (
                      <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gradient Theme Preset */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Visual Gradient Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleChange('gradient', preset.value)}
                      className={`h-9 rounded-xl bg-gradient-to-r ${preset.preview} transition-all cursor-pointer flex items-center justify-center ${
                        formData.gradient === preset.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      {formData.gradient === preset.value && (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Image Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Banner Image Upload <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 hover:file:bg-indigo-500/20 cursor-pointer"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        handleChange('imageUrl', '');
                      }}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT BANNER MODAL */}
      {/* ========================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Banner</h2>
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4">
              {/* Banner Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Banner Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Banner Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Banner Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {BANNER_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Banner Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Active">Active (Display in Carousel)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Button Text & Redirect Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Redirect Link
                  </label>
                  <select
                    value={formData.redirectLink}
                    onChange={(e) => handleChange('redirectLink', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {BANNER_REDIRECT_OPTIONS.map(opt => (
                      <option key={opt.value + opt.label} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gradient Theme Preset */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Visual Gradient Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleChange('gradient', preset.value)}
                      className={`h-9 rounded-xl bg-gradient-to-r ${preset.preview} transition-all cursor-pointer flex items-center justify-center ${
                        formData.gradient === preset.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={preset.label}
                    >
                      {formData.gradient === preset.value && (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Image Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Change Banner Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-600 hover:file:bg-indigo-500/20 cursor-pointer"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        handleChange('imageUrl', '');
                      }}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Student Dashboard Preview
                </h2>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Student Carousel Simulation Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 text-white bg-gradient-to-r ${
                previewBanner.gradient || 'from-indigo-600 via-purple-600 to-brand-500'
              } relative overflow-hidden shadow-xl`}
            >
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  {previewBanner.category}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  previewBanner.status === 'Active' ? 'bg-emerald-400/30 text-white' : 'bg-rose-500/30 text-white'
                }`}>
                  Status: {previewBanner.status}
                </span>
              </div>

              <div className="relative z-10 my-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {previewBanner.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed max-w-xl">
                  {previewBanner.description}
                </p>
              </div>

              <div className="relative z-10 pt-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-md">
                  <span>{previewBanner.buttonText || 'Explore Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <span className="text-[11px] text-white/70">
                  Target: #{previewBanner.redirectLink}
                </span>
              </div>
            </div>

            <div className="text-right pt-2">
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Banner?
                </h3>
                <p className="text-xs text-slate-400">Action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this banner?
              <br />
              <strong className="text-slate-900 dark:text-white">"{bannerToDelete.title}"</strong>
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-500/25 transition-all"
              >
                Yes, Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
