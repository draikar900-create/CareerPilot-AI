import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useBanners } from '../../context/BannerContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Briefcase,
  Building2,
  Milestone,
  Bell,
  BookOpen,
  FolderGit2,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';

const ICON_MAP = {
  Calendar,
  Briefcase,
  Building2,
  Milestone,
  Bell,
  BookOpen,
  FolderGit2,
  Award,
  Sparkles,
  TrendingUp,
  Target,
  Zap
};

export default function BannerCarousel({ setActiveTab }) {
  const { activeBanners } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  // Safety check if active banners change dynamically
  useEffect(() => {
    if (activeBanners.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  const goToNext = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const goToPrev = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Auto-slide every 5 seconds (pauses on hover)
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused, goToNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
  };

  if (activeBanners.length === 0) {
    return null; // When no banners are active, collapse cleanly
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];
  const IconComponent = ICON_MAP[currentBanner.iconName] || Sparkles;

  const handleBannerAction = () => {
    if (currentBanner.redirectLink && setActiveTab) {
      setActiveTab(currentBanner.redirectLink);
    }
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10 group transition-all duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Dashboard Featured Banners"
    >
      {/* Dynamic Background with Gradients and Glow Accents */}
      <div
        className={`relative min-h-[220px] sm:min-h-[200px] md:min-h-[190px] w-full bg-gradient-to-r ${
          currentBanner.gradient || 'from-indigo-600 via-purple-600 to-brand-500'
        } p-6 sm:p-8 flex flex-col justify-between text-white transition-all duration-700`}
      >
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-white/[0.08] pointer-events-none hidden md:block">
          <IconComponent className="w-56 h-56 stroke-[1.2]" />
        </div>

        {/* Top Meta: Category Badge & Slide Count Indicator */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-bold tracking-wide uppercase shadow-sm">
            <IconComponent className="w-3.5 h-3.5" />
            <span>{currentBanner.category}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md text-[11px] font-mono font-medium text-white/90">
            <span>{currentIndex + 1}</span>
            <span className="text-white/50">/</span>
            <span>{activeBanners.length}</span>
          </div>
        </div>

        {/* Center Content: Title & Description */}
        <div className="relative z-10 my-3 max-w-2xl pr-4 sm:pr-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm line-clamp-2">
            {currentBanner.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1.5 leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-xl font-medium">
            {currentBanner.description}
          </p>
        </div>

        {/* Bottom CTA & Navigation Arrows */}
        <div className="relative z-10 flex items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={handleBannerAction}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-slate-900 hover:bg-white/95 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group/btn"
          >
            <span>{currentBanner.buttonText || 'Explore Now'}</span>
            <ArrowRight className="w-4 h-4 text-brand-600 transition-transform group-hover/btn:translate-x-1" />
          </button>

          {/* Previous / Next Controls (Always Accessible) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToPrev}
              className="p-2 sm:p-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md text-white border border-white/25 transition-all cursor-pointer"
              title="Previous Banner"
              aria-label="Previous Banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="p-2 sm:p-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-md text-white border border-white/25 transition-all cursor-pointer"
              title="Next Banner"
              aria-label="Next Banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Dots Bar */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 pointer-events-auto">
          {activeBanners.map((banner, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={banner.id || index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${index + 1}: ${banner.title}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
