import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Video,
  FileText,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  X,
  Play
} from 'lucide-react';

export default function FacultyResourceManagement() {
  const { showToast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyScope, setFacultyScope] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'Video',
    branch: 'CSE',
    academicYear: '3rd Year',
    section: 'A',
    subject: '',
    topic: ''
  });

  const [urlPreview, setUrlPreview] = useState('');

  // Load faculty profile & resources on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, resRes] = await Promise.all([
        apiService.getFacultyProfile(),
        apiService.getFacultyResources()
      ]);

      if (profRes?.success && profRes.faculty) {
        setFacultyScope(profRes.faculty);
        // Default branch/year from faculty primary assignment if available
        const primaryBranch = profRes.faculty.department || profRes.faculty.assignments?.[0]?.branch || 'CSE';
        const primaryYear = profRes.faculty.assignments?.[0]?.academic_year || '3rd Year';
        setFormData(prev => ({
          ...prev,
          branch: primaryBranch,
          academicYear: primaryYear
        }));
      }

      if (resRes?.success) {
        setResources(resRes.resources || []);
      }
    } catch (err) {
      console.error('Error loading faculty resources:', err);
      showToast('Failed to load resources: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to test YouTube normalization on frontend preview
  const getYouTubeEmbedPreview = (urlStr) => {
    if (!urlStr) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlStr.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, url: val });
    const embed = getYouTubeEmbedPreview(val);
    setUrlPreview(embed || '');
  };

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title || '',
        description: resource.description || '',
        url: resource.url || '',
        type: resource.type || 'Video',
        branch: resource.branch || 'CSE',
        academicYear: resource.academicYear || resource.academic_year || '3rd Year',
        section: resource.section || 'A',
        subject: resource.subject || '',
        topic: resource.topic || ''
      });
      setUrlPreview(getYouTubeEmbedPreview(resource.url || ''));
    } else {
      setEditingResource(null);
      const primaryBranch = facultyScope?.department || facultyScope?.assignments?.[0]?.branch || 'CSE';
      const primaryYear = facultyScope?.assignments?.[0]?.academic_year || '3rd Year';
      setFormData({
        title: '',
        description: '',
        url: '',
        type: 'Video',
        branch: primaryBranch,
        academicYear: primaryYear,
        section: 'A',
        subject: '',
        topic: ''
      });
      setUrlPreview('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      showToast('Title and Resource URL are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingResource) {
        const res = await apiService.updateFacultyResource(editingResource.id, formData);
        if (res?.success) {
          showToast('Resource updated successfully.', 'success');
          setIsModalOpen(false);
          loadData();
        } else {
          showToast(res?.message || 'Failed to update resource.', 'error');
        }
      } else {
        const res = await apiService.createFacultyResource(formData);
        if (res?.success) {
          showToast('Learning resource published to assigned students!', 'success');
          setIsModalOpen(false);
          loadData();
        } else {
          showToast(res?.message || 'Failed to publish resource.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning resource?')) return;
    try {
      const res = await apiService.deleteFacultyResource(id);
      if (res?.success) {
        showToast('Resource deleted successfully.', 'success');
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        showToast(res?.message || 'Failed to delete resource.', 'error');
      }
    } catch (err) {
      showToast('Error deleting resource: ' + err.message, 'error');
    }
  };

  // Filter logic
  const filteredResources = resources.filter(r => {
    const matchesSearch = searchQuery === '' ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topic?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === 'ALL' || r.branch === selectedBranch;
    const matchesType = selectedType === 'ALL' || r.type === selectedType;

    return matchesSearch && matchesBranch && matchesType;
  });

  const availableBranches = Array.from(new Set(
    (facultyScope?.assignments || []).map(a => a.branch).concat(facultyScope?.department ? [facultyScope.department] : ['CSE'])
  )).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
              FACULTY RESOURCE CENTER
            </span>
            <span className="text-xs text-slate-400 font-medium">YouTube & Study Materials</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Learning Resources & Video Portal
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Publish YouTube lectures, tutorials, and study materials scoped strictly to your authorized academic branches and classes.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Resource</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources by title, subject, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Authorized Branches</option>
            {availableBranches.map((b, i) => (
              <option key={i} value={b}>{b}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Formats</option>
            <option value="Video">YouTube Videos</option>
            <option value="Document">Study Material / PDF</option>
            <option value="Link">Web Links</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400 animate-pulse">
            Loading authorized learning resources...
          </p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <Video className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Learning Resources Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedBranch !== 'ALL' || selectedType !== 'ALL'
              ? 'No learning resources matched your search query or filters.'
              : 'You have not published any learning resources or YouTube links yet. Click "Publish New Resource" to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isVideo = res.type === 'Video' || res.url?.includes('youtube') || res.url?.includes('youtu.be');
            const embedUrl = getYouTubeEmbedPreview(res.url);

            return (
              <div
                key={res.id}
                className="group rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Scope & Type Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {res.branch || 'CSE'} &bull; {res.academic_year || res.academicYear || 'All Years'} {res.section ? `(Sec ${res.section})` : ''}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isVideo
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {isVideo ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      <span>{res.type || (isVideo ? 'Video' : 'Material')}</span>
                    </span>
                  </div>

                  {/* Video Embed or Link Thumbnail Preview */}
                  {isVideo && embedUrl ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 relative group-hover:border-blue-500/40 transition-colors">
                      <iframe
                        src={embedUrl}
                        title={res.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:border-blue-500/40 transition-colors">
                      <FileText className="w-8 h-8 opacity-60" />
                    </div>
                  )}

                  {/* Subject / Topic Tag */}
                  {(res.subject || res.topic) && (
                    <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{res.subject || 'General'} {res.topic ? `— ${res.topic}` : ''}</span>
                    </div>
                  )}

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-500 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {res.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Resource</span>
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(res)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Resource"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(res.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT RESOURCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="glass-card w-full max-w-xl rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 space-y-6 my-auto relative text-slate-900 dark:text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                {editingResource ? 'EDIT RESOURCE' : 'PUBLISH LEARNING RESOURCE'}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {editingResource ? 'Update Learning Resource' : 'Publish YouTube Link or Study Material'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Scope Selection Row */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="font-bold text-slate-500 block mb-1">Target Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    {availableBranches.map((b, i) => (
                      <option key={i} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Academic Year</label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 block mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Resource Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master DBMS Normalization (1NF to BCNF)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="Video">YouTube Video</option>
                    <option value="Document">PDF / Study Note</option>
                    <option value="Link">Web Reference</option>
                  </select>
                </div>
              </div>

              {/* Resource URL with Live YouTube Preview */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Resource URL (YouTube watch, shorts, or share link) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={formData.url}
                  onChange={handleUrlChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                />
                {urlPreview && (
                  <div className="mt-2.5 rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video max-h-40">
                    <iframe
                      src={urlPreview}
                      title="YouTube Preview"
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>

              {/* Subject & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Database Management Systems"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. BCNF Decomposition"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description / Key Learnings</label>
                <textarea
                  rows={3}
                  placeholder="Provide guidance on what students should focus on while reviewing this resource..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingResource ? 'Update Resource' : 'Publish Resource'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
