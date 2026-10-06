import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { apiService } from '../services/api';

const BannerContext = createContext();

export const BANNER_CATEGORIES = [
  'Events',
  'Internships',
  'Placements',
  'Roadmaps',
  'Announcements',
  'Resources',
  'Projects',
  'Certifications'
];

export const BANNER_REDIRECT_OPTIONS = [
  { value: 'events', label: 'Events Section' },
  { value: 'internships', label: 'Internships Section' },
  { value: 'internships', label: 'Jobs / Placement Section' },
  { value: 'roadmap', label: 'Career Roadmap' },
  { value: 'notifications', label: 'Notifications / Announcements' },
  { value: 'resources', label: 'Resources Section' },
  { value: 'projects', label: 'Projects Section' },
  { value: 'certificates', label: 'Certificates Section' },
  { value: 'skill-insights', label: 'Skill Insights' },
  { value: 'readiness-test', label: 'Readiness Test' },
  { value: 'career-goals', label: 'Career Goals' },
  { value: 'profile', label: 'Student Profile' }
];

export const DEFAULT_BANNERS = [
  {
    id: 'banner-01',
    title: 'Upcoming Events',
    description: 'Discover hackathons, ideathons, workshops, technical fests, and competitions relevant to your career journey.',
    category: 'Events',
    buttonText: 'View Events',
    redirectLink: 'events',
    status: 'Active',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    accentColor: 'blue',
    iconName: 'Calendar',
    imageUrl: '',
    createdAt: '2026-08-15',
    updatedAt: '2026-09-01'
  },
  {
    id: 'banner-02',
    title: 'Internship Opportunities',
    description: 'Explore internships aligned with your skills, branch, and career goals.',
    category: 'Internships',
    buttonText: 'Explore Internships',
    redirectLink: 'internships',
    status: 'Active',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    accentColor: 'emerald',
    iconName: 'Briefcase',
    imageUrl: '',
    createdAt: '2026-08-18',
    updatedAt: '2026-09-01'
  },
  {
    id: 'banner-03',
    title: 'New Placement Drives Open',
    description: 'Check the latest placement opportunities, eligibility criteria, and application deadlines.',
    category: 'Placements',
    buttonText: 'View Placements',
    redirectLink: 'internships',
    status: 'Active',
    gradient: 'from-purple-600 via-indigo-600 to-pink-500',
    accentColor: 'purple',
    iconName: 'Building2',
    imageUrl: '',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-02'
  },
  {
    id: 'banner-04',
    title: 'Continue Your Learning Journey',
    description: 'Follow your personalized roadmap and complete the next recommended learning topics.',
    category: 'Roadmaps',
    buttonText: 'View Roadmap',
    redirectLink: 'roadmap',
    status: 'Active',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    accentColor: 'cyan',
    iconName: 'Milestone',
    imageUrl: '',
    createdAt: '2026-08-22',
    updatedAt: '2026-09-03'
  },
  {
    id: 'banner-05',
    title: 'Important Announcements',
    description: 'Stay updated with placement notices, internship alerts, event announcements, and important updates.',
    category: 'Announcements',
    buttonText: 'Read More',
    redirectLink: 'notifications',
    status: 'Active',
    gradient: 'from-amber-600 via-orange-600 to-rose-600',
    accentColor: 'amber',
    iconName: 'Bell',
    imageUrl: '',
    createdAt: '2026-08-25',
    updatedAt: '2026-09-03'
  },
  {
    id: 'banner-06',
    title: 'New Learning Resources Available',
    description: 'Explore newly added notes, PDFs, tutorials, videos, and learning materials.',
    category: 'Resources',
    buttonText: 'Explore Resources',
    redirectLink: 'resources',
    status: 'Active',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-600',
    accentColor: 'teal',
    iconName: 'BookOpen',
    imageUrl: '',
    createdAt: '2026-08-28',
    updatedAt: '2026-09-04'
  },
  {
    id: 'banner-07',
    title: 'Recommended Projects',
    description: 'Discover projects tailored to your target career role and current skill level.',
    category: 'Projects',
    buttonText: 'View Projects',
    redirectLink: 'projects',
    status: 'Active',
    gradient: 'from-indigo-600 via-purple-600 to-rose-600',
    accentColor: 'indigo',
    iconName: 'FolderGit2',
    imageUrl: '',
    createdAt: '2026-08-30',
    updatedAt: '2026-09-04'
  },
  {
    id: 'banner-08',
    title: 'Recommended Certifications',
    description: 'Earn industry-recognized certifications to strengthen your profile and improve placement readiness.',
    category: 'Certifications',
    buttonText: 'View Certificates',
    redirectLink: 'certificates',
    status: 'Active',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700',
    accentColor: 'violet',
    iconName: 'Award',
    imageUrl: '',
    createdAt: '2026-09-01',
    updatedAt: '2026-09-04'
  }
];

export function BannerProvider({ children }) {
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBannersData = async () => {
    setLoading(true);
    try {
      let res = await apiService.getAdminBanners().catch(() => null);
      if (!res || !res.success) {
        res = await apiService.getBanners().catch(() => ({ success: true, banners: [] }));
      }
      const rawList = res?.banners || res?.data || [];
      const formatted = (rawList || []).map(b => ({
        id: b.id,
        title: b.title || 'Announcement',
        description: b.description || '',
        category: b.category || 'Announcements',
        buttonText: b.button_text || b.buttonText || 'Learn More',
        redirectLink: b.redirect_link || b.redirectLink || 'dashboard',
        status: b.status || 'Active',
        gradient: b.gradient || 'from-indigo-600 via-purple-600 to-brand-500',
        accentColor: b.accent_color || b.accentColor || 'indigo',
        iconName: b.icon_name || b.iconName || 'Sparkles',
        imageUrl: b.image_url || b.imageUrl || '',
        createdAt: b.created_at ? b.created_at.split('T')[0] : '2026-09-01',
        updatedAt: b.updated_at ? b.updated_at.split('T')[0] : '2026-09-01'
      }));
      setBanners(formatted);
    } catch (err) {
      console.warn('Failed to load banners:', err.message);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannersData();
  }, []);

  const activeBanners = useMemo(() => {
    return (banners || []).filter(b => b.status === 'Active');
  }, [banners]);

  const addBanner = async (newBannerData) => {
    try {
      const res = await apiService.createAdminBanner(newBannerData);
      if (res && res.success) {
        showToast(`Banner "${newBannerData.title}" created!`, 'success');
        fetchBannersData();
        return res.banner;
      } else {
        showToast(res?.error || 'Failed to create banner', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error creating banner', 'error');
    }
  };

  const updateBanner = async (id, updatedFields) => {
    try {
      const res = await apiService.updateAdminBanner(id, updatedFields);
      if (res && res.success) {
        showToast('Banner updated successfully!', 'success');
        fetchBannersData();
      } else {
        showToast(res?.error || 'Failed to update banner', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating banner', 'error');
    }
  };

  const deleteBanner = async (id) => {
    try {
      const res = await apiService.deleteAdminBanner(id);
      if (res && res.success) {
        showToast('Banner removed from database.', 'info');
        fetchBannersData();
      } else {
        showToast(res?.error || 'Failed to delete banner', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error deleting banner', 'error');
    }
  };

  const toggleBannerStatus = async (id) => {
    const target = banners.find(b => b.id === id);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    await updateBanner(id, { status: nextStatus });
  };

  const resetBannersToDefault = () => {
    fetchBannersData();
    showToast('Banners synced with database.', 'info');
  };

  return (
    <BannerContext.Provider
      value={{
        banners,
        activeBanners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        resetBannersToDefault,
        loading
      }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBanners() {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
}
