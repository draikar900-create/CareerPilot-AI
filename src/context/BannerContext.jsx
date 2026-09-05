import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';

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

  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('cp_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_BANNERS;
  });

  // Persist banners to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cp_banners', JSON.stringify(banners));
    } catch (e) {}
  }, [banners]);

  // Derived: Only active banners for the student dashboard carousel
  const activeBanners = useMemo(() => {
    return banners.filter(banner => banner.status === 'Active');
  }, [banners]);

  // Add new banner
  const addBanner = (newBannerData) => {
    const today = new Date().toISOString().split('T')[0];
    const createdBanner = {
      id: `banner-${Date.now()}`,
      title: newBannerData.title?.trim() || 'New Banner Announcement',
      description: newBannerData.description?.trim() || 'Exciting career opportunities and updates.',
      category: newBannerData.category || 'Announcements',
      buttonText: newBannerData.buttonText?.trim() || 'Learn More',
      redirectLink: newBannerData.redirectLink || 'dashboard',
      status: newBannerData.status === 'Inactive' ? 'Inactive' : 'Active',
      gradient: newBannerData.gradient || 'from-indigo-600 via-purple-600 to-brand-500',
      accentColor: newBannerData.accentColor || 'indigo',
      iconName: newBannerData.iconName || 'Sparkles',
      imageUrl: newBannerData.imageUrl || '',
      createdAt: today,
      updatedAt: today
    };

    setBanners(prev => [createdBanner, ...prev]);
    showToast(`Banner "${createdBanner.title}" created successfully!`, 'success');
    return createdBanner;
  };

  // Edit / Update banner
  const updateBanner = (id, updatedFields) => {
    const today = new Date().toISOString().split('T')[0];
    setBanners(prev =>
      prev.map(banner => {
        if (banner.id === id) {
          return {
            ...banner,
            ...updatedFields,
            updatedAt: today
          };
        }
        return banner;
      })
    );
    showToast('Banner updated successfully!', 'success');
  };

  // Delete banner
  const deleteBanner = (id) => {
    const bannerToDelete = banners.find(b => b.id === id);
    setBanners(prev => prev.filter(banner => banner.id !== id));
    showToast(`Banner "${bannerToDelete?.title || 'Selected'}" deleted.`, 'info');
  };

  // Enable / Disable status toggle
  const toggleBannerStatus = (id) => {
    const today = new Date().toISOString().split('T')[0];
    setBanners(prev =>
      prev.map(banner => {
        if (banner.id === id) {
          const nextStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
          showToast(
            `Banner "${banner.title}" marked as ${nextStatus}.`,
            nextStatus === 'Active' ? 'success' : 'info'
          );
          return {
            ...banner,
            status: nextStatus,
            updatedAt: today
          };
        }
        return banner;
      })
    );
  };

  // Reset to default banners
  const resetBannersToDefault = () => {
    setBanners(DEFAULT_BANNERS);
    showToast('Banners restored to system default!', 'info');
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
        resetBannersToDefault
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
