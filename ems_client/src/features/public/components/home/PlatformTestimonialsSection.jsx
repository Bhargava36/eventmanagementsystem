import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquareQuote
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';



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
              const formatted = rawList.map((item, idx) => ({
                id: item.Id || `db-review-${idx}`,
                name: item.UserName || `Builder #${idx + 1}`,
                role: item.Category || (item.EventName ? `Participant (${item.EventName})` : 'Event Participant'),
                quote: item.Comments || 'Great platform for collegiate innovation.',
                rating: Number(item.Rating) || 5,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.UserName || 'AY')}&backgroundColor=10b981,059669,047857`,
              }));

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

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Gentle auto-rotation every 6 seconds when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6500);
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
   * 3D Cylindrical arc transform calculation
   */
  const getCardTransform = (idx) => {
    let diff = idx - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    const nearX = isMobile ? 140 : isTablet ? 210 : 270;
    const farX = isMobile ? 250 : isTablet ? 380 : 490;

    if (diff === 0) {
      // CENTER HERO CARD: Swoops forward in 3D space with high Z-depth
      return {
        x: 0,
        y: isMobile ? -6 : -16,
        z: isMobile ? 80 : 150,
        scale: isMobile ? 1.02 : 1.08,
        rotateY: 0,
        rotateZ: 0,
        zIndex: 40,
        opacity: 1,
        blur: 'blur(0px)',
      };
    } else if (diff === -1) {
      // NEAR LEFT
      return {
        x: -nearX,
        y: isMobile ? 4 : 6,
        z: isMobile ? -20 : -40,
        scale: isMobile ? 0.85 : 0.88,
        rotateY: isMobile ? 24 : 32,
        rotateZ: 2,
        zIndex: 25,
        opacity: 0.9,
        blur: 'blur(0.3px)',
      };
    } else if (diff === 1) {
      // NEAR RIGHT
      return {
        x: nearX,
        y: isMobile ? 4 : 6,
        z: isMobile ? -20 : -40,
        scale: isMobile ? 0.85 : 0.88,
        rotateY: isMobile ? -24 : -32,
        rotateZ: -2,
        zIndex: 25,
        opacity: 0.9,
        blur: 'blur(0.3px)',
      };
    } else if (diff === -2) {
      // FAR LEFT
      return {
        x: -farX,
        y: isMobile ? 12 : 20,
        z: isMobile ? -80 : -170,
        scale: isMobile ? 0.7 : 0.74,
        rotateY: isMobile ? 40 : 50,
        rotateZ: 3.5,
        zIndex: 10,
        opacity: isMobile ? 0.35 : 0.65,
        blur: 'blur(1px)',
      };
    } else if (diff === 2) {
      // FAR RIGHT
      return {
        x: farX,
        y: isMobile ? 12 : 20,
        z: isMobile ? -80 : -170,
        scale: isMobile ? 0.7 : 0.74,
        rotateY: isMobile ? -40 : -50,
        rotateZ: -3.5,
        zIndex: 10,
        opacity: isMobile ? 0.35 : 0.65,
        blur: 'blur(1px)',
      };
    } else {
      return {
        x: diff < 0 ? -farX * 1.3 : farX * 1.3,
        y: 35,
        z: -320,
        scale: 0.55,
        rotateY: diff < 0 ? 60 : -60,
        rotateZ: 0,
        zIndex: 5,
        opacity: 0,
        blur: 'blur(4px)',
      };
    }
  };

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-black select-none border-t border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Delicate, soft Emerald Ambient Glow (Toned down) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[280px] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-10 sm:space-y-14">
        
        {/* ===================== HEADER SECTION ===================== */}
        <div className="text-center max-w-2xl mx-auto space-y-3">

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
        </div>

        {/* ===================== 3D CAROUSEL STAGE ===================== */}
        <div 
          className="relative min-h-[420px] sm:min-h-[460px] flex items-center justify-center py-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
        >
          {/* Subtle Ground Ring (Delicate and non-intrusive) */}
          <div 
            className="absolute -bottom-2 w-[750px] max-w-[95vw] h-[150px] rounded-[100%] border border-zinc-200 dark:border-zinc-800/80 pointer-events-none"
            style={{
              transform: 'rotateX(72deg)',
              background: 'radial-gradient(circle, rgba(16,185,129,0.02) 0%, transparent 70%)',
            }}
          />

          {/* 3D Carousel Cards Container with dynamic cursor parallax */}
          <motion.div 
            animate={{
              rotateX: mouseTilt.x,
              rotateY: mouseTilt.y,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full max-w-[980px] h-[370px] sm:h-[390px] flex items-center justify-center"
          >
            {testimonials.map((item, idx) => {
              const transform = getCardTransform(idx);
              const isCenter = idx === activeIndex;

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    setActiveIndex(idx);
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
                  }}
                  className={`absolute w-[290px] sm:w-[360px] md:w-[380px] h-[320px] sm:h-[340px] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-colors duration-300 overflow-hidden select-none ${
                    isCenter
                      ? 'bg-white dark:bg-black border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/5 dark:shadow-black'
                      : 'bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-md hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Dedicated full-card click target for non-center cards */}
                  {!isCenter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(idx);
                      }}
                      className="absolute inset-0 w-full h-full z-30 cursor-pointer bg-transparent focus:outline-none"
                      aria-label={`Select testimonial by ${item.name}`}
                    />
                  )}

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
                      className={`leading-relaxed ${
                        isCenter
                          ? 'text-zinc-900 dark:text-white text-[14px] sm:text-[15px] font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-normal'
                      }`}
                    >
                      "{item.quote}"
                    </p>
                  </div>

                  {/* Customer Avatar & Bio */}
                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800 shadow-xs shrink-0"
                    />
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

          {/* Desktop Floating Left Navigation Arrow Button (z-50) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous Testimonial"
            style={{ transform: 'translateZ(200px)' }}
            className="hidden md:flex absolute left-4 lg:left-8 z-50 w-11 h-11 rounded-full bg-white dark:bg-black shadow-lg hover:shadow-xl border border-zinc-200 dark:border-zinc-800 items-center justify-center text-black dark:text-white hover:text-emerald-500 hover:border-emerald-500 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Desktop Floating Right Navigation Arrow Button (z-50) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next Testimonial"
            style={{ transform: 'translateZ(200px)' }}
            className="hidden md:flex absolute right-4 lg:right-8 z-50 w-11 h-11 rounded-full bg-white dark:bg-black shadow-lg hover:shadow-xl border border-zinc-200 dark:border-zinc-800 items-center justify-center text-black dark:text-white hover:text-emerald-500 hover:border-emerald-500 transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Navigation & Pagination Controls (Prominently visible on Mobile and Desktop) */}
        <div className="flex items-center justify-center gap-4 pt-2 relative z-30">
          {/* Mobile & Tablet Left Arrow Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous Testimonial"
            className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Pagination Indicators */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? 'w-6 bg-emerald-500 dark:bg-emerald-400 shadow-xs'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>

          {/* Mobile & Tablet Right Arrow Button */}
          <button
            onClick={handleNext}
            aria-label="Next Testimonial"
            className="md:hidden w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 active:scale-90 transition-transform"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </section>
  );
}
