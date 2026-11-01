import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquareQuote
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';



const resolveAvatarUrl = (photo, name) => {
  if (photo && typeof photo === 'string' && photo.trim().length > 0) {
    let trimmed = photo.trim();
    if (trimmed.startsWith('http://localhost:3000') && API_BASE_URL !== 'http://localhost:3000') {
      trimmed = trimmed.replace('http://localhost:3000', API_BASE_URL);
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${API_BASE_URL}${cleanPath}`;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'AY')}&backgroundColor=10b981,059669,047857`;
};

/**
 * 5 Testimonials styled exclusively with Emerald, Pure White & Black
 */
const DEFAULT_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Amit Verma',
    role: 'Full Stack Developer',
    quote:
      'Amazing community and structured learning path. Highly recommended for anyone serious about tech.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 't-2',
    name: 'Priya Sharma',
    role: 'UI/UX Designer',
    quote:
      'The projects and hands-on approach helped me gain real skills. Now I feel confident building my own products.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 't-3',
    name: 'Rohan Mehta',
    role: 'Frontend Developer',
    quote:
      'This platform completely changed the way I learn and build. The resources, community and mentorship are just amazing!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 't-4',
    name: 'Sneha Reddy',
    role: 'Computer Science Student',
    quote:
      'Clean content, practical examples and a supportive community. It helped me land my first internship!',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 't-5',
    name: 'Karthik N',
    role: 'Product Designer',
    quote:
      'The best place for learning, building and growing with like-minded people.',
    rating: 5,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
  },
];

export default function PlatformTestimonialsSection() {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(2); // Center card (Rohan Mehta)
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const total = testimonials.length;

  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Fetch live reviews directly from database
  useEffect(() => {
    let isMounted = true;
    const fetchLiveFeedback = async () => {
      const endpoints = [
        `${API_BASE_URL}/api/platform-feedback/testimonials?limit=12`,
        `/api/platform-feedback/testimonials?limit=12`,
        `${API_BASE_URL}/api/feedback`,
        `/api/feedback`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const rawList = data.testimonials || data.feedback || (Array.isArray(data) ? data : null);
            if (Array.isArray(rawList) && rawList.length > 0 && isMounted) {
              const formatted = rawList.map((item, idx) => {
                const photoSrc = item.UserPhoto || item.Photo || item.photo;
                const hasPhoto = Boolean(photoSrc && typeof photoSrc === 'string' && photoSrc.trim().length > 0);
                return {
                  id: item.Id || `db-review-${idx}`,
                  name: item.UserName || `Builder #${idx + 1}`,
                  role: item.Category || (item.EventName ? `Participant (${item.EventName})` : 'Event Participant'),
                  quote: item.Comments || 'Great platform for collegiate innovation.',
                  rating: Number(item.Rating) || 5,
                  avatar: resolveAvatarUrl(photoSrc, item.UserName),
                  hasPhoto,
                };
              });

              if (formatted.length >= 3) {
                setTestimonials(formatted);
                setActiveIndex(Math.min(2, Math.floor(formatted.length / 2)));
                return;
              }
            }
          }
        } catch {
          // Fall through to next endpoint
        }
      }
    };
    fetchLiveFeedback();
    return () => {
      isMounted = false;
    };
  }, []);

  const AUTOPLAY_DURATION = 6000; // 6 seconds per testimonial
  const [progress, setProgress] = useState(0);

  const selectTestimonial = useCallback((idx) => {
    setActiveIndex(idx);
    setProgress(0);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setProgress(0);
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    setProgress(0);
  }, [total]);

  // Live timer interval driving both the animated countdown bar and automatic advancement
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 50; // update every 50ms for fluid progress
    const step = (intervalStep / AUTOPLAY_DURATION) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalStep);

    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  // Subtle interactive 3D mouse parallax
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({
      x: -y * 8, // subtle vertical tilt (-4° to +4°)
      y: x * 14, // subtle horizontal pan (-7° to +7°)
    });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  /**
   * 3D Cylindrical arc transform calculation (Full-Width Responsive Spread)
   */
  const getCardTransform = (idx) => {
    let diff = idx - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    // Dynamically scale distances according to windowWidth so cards fill the entire screen
    const screenHalf = windowWidth / 2;
    const nearX = isMobile ? 150 : isTablet ? 260 : Math.min(screenHalf * 0.44, 450);
    const farX = isMobile ? 280 : isTablet ? 490 : Math.min(screenHalf * 0.84, 860);
    const extremeX = isMobile ? 400 : isTablet ? 680 : Math.min(screenHalf * 1.2, 1250);

    if (diff === 0) {
      // CENTER HERO CARD: Swoops forward in 3D space with high Z-depth
      return {
        x: 0,
        y: isMobile ? -6 : -16,
        z: isMobile ? 80 : 160,
        scale: isMobile ? 1.02 : 1.08,
        rotateY: 0,
        rotateZ: 0,
        zIndex: 40,
        opacity: 1,
        blur: 'blur(0px)',
        pointerEvents: 'auto',
      };
    } else if (diff === -1) {
      // NEAR LEFT
      return {
        x: -nearX,
        y: isMobile ? 4 : 8,
        z: isMobile ? -20 : -40,
        scale: isMobile ? 0.86 : 0.9,
        rotateY: isMobile ? 22 : 28,
        rotateZ: 2,
        zIndex: 25,
        opacity: 0.92,
        blur: 'blur(0px)',
        pointerEvents: 'auto',
      };
    } else if (diff === 1) {
      // NEAR RIGHT
      return {
        x: nearX,
        y: isMobile ? 4 : 8,
        z: isMobile ? -20 : -40,
        scale: isMobile ? 0.86 : 0.9,
        rotateY: isMobile ? -22 : -28,
        rotateZ: -2,
        zIndex: 25,
        opacity: 0.92,
        blur: 'blur(0px)',
        pointerEvents: 'auto',
      };
    } else if (diff === -2) {
      // FAR LEFT (Spreads toward left screen edge)
      return {
        x: -farX,
        y: isMobile ? 12 : 20,
        z: isMobile ? -80 : -160,
        scale: isMobile ? 0.72 : 0.78,
        rotateY: isMobile ? 36 : 42,
        rotateZ: 3.5,
        zIndex: 15,
        opacity: isMobile ? 0.35 : 0.75,
        blur: 'blur(0.5px)',
        pointerEvents: 'auto',
      };
    } else if (diff === 2) {
      // FAR RIGHT (Spreads toward right screen edge)
      return {
        x: farX,
        y: isMobile ? 12 : 20,
        z: isMobile ? -80 : -160,
        scale: isMobile ? 0.72 : 0.78,
        rotateY: isMobile ? -36 : -42,
        rotateZ: -3.5,
        zIndex: 15,
        opacity: isMobile ? 0.35 : 0.75,
        blur: 'blur(0.5px)',
        pointerEvents: 'auto',
      };
    } else {
      return {
        x: diff < 0 ? -extremeX : extremeX,
        y: 35,
        z: -320,
        scale: 0.6,
        rotateY: diff < 0 ? 55 : -55,
        rotateZ: 0,
        zIndex: 5,
        opacity: 0,
        blur: 'blur(4px)',
        pointerEvents: 'none',
      };
    }
  };

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-black select-none border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Soft Emerald Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1200px] h-[350px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

      {/* ===================== HEADER SECTION ===================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black dark:text-white tracking-tight leading-tight">
            Loved by Builders,<br />
            <span className="text-emerald-600 dark:text-emerald-400">
              Trusted by Teams
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            See what our users say about their experience, growth, and the impact we've made in their journey.
          </p>
        </motion.div>
      </div>

      {/* ===================== FULL-WIDTH 3D CAROUSEL STAGE ===================== */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge fade masks for seamless full-bleed depth */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-r from-white dark:from-black to-transparent z-30" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-l from-white dark:from-black to-transparent z-30" />

        {/* Floating Left Navigation Arrow Button (Middle) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous Testimonial"
          className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-xl hover:shadow-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 hover:border-emerald-500 transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Floating Right Navigation Arrow Button (Middle) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next Testimonial"
          className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-xl hover:shadow-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 hover:border-emerald-500 transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 60, scale: 0.94, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full min-h-[440px] sm:min-h-[480px] flex items-center justify-center py-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
        >
          {/* Subtle Ground Ring (Full width) */}
          <div 
            className="absolute -bottom-2 w-[1200px] lg:w-[1600px] max-w-[98vw] h-[160px] rounded-[100%] border border-zinc-200 dark:border-zinc-800/80 pointer-events-none"
            style={{
              transform: 'rotateX(72deg)',
              background: 'radial-gradient(circle, rgba(16,185,129,0.025) 0%, transparent 70%)',
            }}
          />

          {/* 3D Carousel Cards Container with dynamic cursor parallax (Spans full width) */}
          <motion.div 
            animate={{
              rotateX: mouseTilt.x,
              rotateY: mouseTilt.y,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full h-[380px] sm:h-[410px] flex items-center justify-center"
          >
            {testimonials.map((item, idx) => {
              const transform = getCardTransform(idx);
              const isCenter = idx === activeIndex;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (!isCenter) {
                      selectTestimonial(idx);
                    }
                  }}
                  animate={{
                    x: transform.x,
                    y: transform.y,
                    z: transform.z,
                    scale: transform.scale,
                    rotateY: transform.rotateY,
                    rotateZ: transform.rotateZ,
                    opacity: transform.opacity,
                    zIndex: transform.zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 190,
                    damping: 24,
                    mass: 0.85,
                  }}
                  style={{
                    filter: transform.blur,
                    transformStyle: 'preserve-3d',
                    pointerEvents: transform.pointerEvents,
                  }}
                  className={`absolute w-[300px] sm:w-[380px] md:w-[420px] h-[330px] sm:h-[350px] rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-colors duration-300 overflow-hidden select-none ${
                    isCenter
                      ? 'bg-white dark:bg-black border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-2xl shadow-emerald-500/10 dark:shadow-black cursor-default'
                      : 'bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-xl cursor-pointer hover:scale-[1.01]'
                  }`}
                >
                  {/* Top Bar: Decorative Quote Icon & 5 Gold Stars */}
                  <div className="relative z-20 flex items-center justify-between">
                    {/* Quotation Mark: Soft Clean Emerald Badge */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-serif font-black shadow-xs bg-emerald-500/5 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
                      <MessageSquareQuote />
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            i < item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-zinc-200 dark:text-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Quote Text */}
                  <div className="my-auto py-2">
                    <p
                      className={`leading-relaxed line-clamp-4 ${
                        isCenter
                          ? 'text-zinc-900 dark:text-white text-[14px] sm:text-[15px] font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-normal'
                      }`}
                    >
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Customer Avatar & Bio (With User Photo Support & Fallback) */}
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="relative shrink-0">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name || 'AY')}&backgroundColor=10b981,059669,047857`;
                        }}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shadow-xs shrink-0 bg-zinc-100 dark:bg-zinc-800 transition-all ${
                          item.hasPhoto
                            ? 'ring-2 ring-emerald-500/60 dark:ring-emerald-400/70'
                            : 'ring-2 ring-zinc-200 dark:ring-zinc-800'
                        }`}
                      />
                      {item.hasPhoto && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full shadow-xs"
                          title="Verified User Profile"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 truncate font-normal">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Pagination Indicators with Active Live Countdown Progress Bar */}
        <div className="flex items-center justify-center pt-5 relative z-40">
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => selectTestimonial(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`relative h-2.5 rounded-full transition-all duration-300 overflow-hidden cursor-pointer ${
                    isActive
                      ? 'w-5 sm:w-8 bg-zinc-200 dark:bg-zinc-800 ring-1 ring-emerald-500/40'
                      : 'w-2.5 sm:w-3 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                  }`}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-75 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
