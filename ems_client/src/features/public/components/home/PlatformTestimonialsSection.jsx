"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  BadgeCheck,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const resolveAvatarUrl = (photo, name) => {
  if (photo && typeof photo === "string" && photo.trim().length > 0) {
    let trimmed = photo.trim();
    if (
      trimmed.startsWith("http://localhost:3000") &&
      API_BASE_URL !== "http://localhost:3000"
    ) {
      trimmed = trimmed.replace("http://localhost:3000", API_BASE_URL);
    }
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:")
    ) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${API_BASE_URL}${cleanPath}`;
  }
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name || "AY"
  )}&backgroundColor=10b981,059669,047857`;
};

const DEFAULT_TESTIMONIALS = [
  {
    id: "t-1",
    name: "Amit Verma",
    role: "Full Stack Developer",
    quote:
      "Amazing community and structured learning path. Highly recommended for anyone serious about tech.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "t-2",
    name: "Priya Sharma",
    role: "UI/UX Designer",
    quote:
      "The projects and hands-on approach helped me gain real skills. Now I feel confident building my own products.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "t-3",
    name: "Rohan Mehta",
    role: "Frontend Developer",
    quote:
      "This platform completely changed the way I learn and build. The resources, community and mentorship are just amazing!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "t-4",
    name: "Sneha Reddy",
    role: "Computer Science Student",
    quote:
      "Clean content, practical examples and a supportive community. It helped me land my first internship!",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  },
  {
    id: "t-5",
    name: "Karthik N",
    role: "Product Designer",
    quote:
      "The best place for learning, building and growing with like-minded people.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80",
  },
];

// Precision die-cut testimonial pass shell matching the AYOJAN pass geometry above
function DieCutQuoteShell({ width, height, notchY, gradId, isCenter }) {
  const r = 24;
  const nr = 10;
  const passPath = `M ${r} 1 L ${width - r} 1 A ${r - 1} ${r - 1} 0 0 1 ${
    width - 1
  } ${r} L ${width - 1} ${notchY - nr} A ${nr} ${nr} 0 0 0 ${width - 1} ${
    notchY + nr
  } L ${width - 1} ${height - r} A ${r - 1} ${r - 1} 0 0 1 ${width - r} ${
    height - 1
  } L ${r} ${height - 1} A ${r - 1} ${r - 1} 0 0 1 1 ${height - r} L 1 ${
    notchY + nr
  } A ${nr} ${nr} 0 0 0 1 ${notchY - nr} L 1 ${r} A ${r - 1} ${r - 1} 0 0 1 ${r} 1 Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      <path
        d={passPath}
        strokeWidth="1.25"
        className="fill-white dark:fill-black stroke-white/60 dark:stroke-zinc-800 group-hover/tcard:stroke-slate-900/30 dark:group-hover/tcard:stroke-emerald-400 transition-colors duration-300"
      />

      {/* Perforated tear-line aligned with twin semicircular punches */}
      <line
        x1="18"
        y1={notchY}
        x2={width - 18}
        y2={notchY}
        strokeWidth="1"
        strokeDasharray="4 4"
        className="stroke-slate-200 dark:stroke-zinc-800"
      />

      {/* Active perimeter highlight for the focused center pass */}
      <g
        className="transition-opacity duration-300"
        style={{ opacity: isCenter ? 1 : 0 }}
      >
        <path
          d={passPath}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="1.75"
        />
        <line
          x1="18"
          y1={notchY}
          x2={width - 18}
          y2={notchY}
          stroke={`url(#${gradId})`}
          strokeWidth="1.15"
          strokeDasharray="4 4"
        />
      </g>
    </svg>
  );
}

export default function PlatformTestimonialsSection() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduceMotion = useReducedMotion();
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const total = testimonials.length;
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const cardW = isMobile ? 316 : isTablet ? 380 : 420;
  const cardH = isMobile ? 344 : 356;
  const notchY = cardH - 92;

  useEffect(() => {
    let isMounted = true;
    const fetchLiveFeedback = async () => {
      const endpoints = [
        `${API_BASE_URL}/api/platform-feedback/testimonials?limit=12`,
        "/api/platform-feedback/testimonials?limit=12",
        `${API_BASE_URL}/api/feedback`,
        "/api/feedback",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const rawList =
              data.testimonials ||
              data.feedback ||
              (Array.isArray(data) ? data : null);
            if (Array.isArray(rawList) && rawList.length > 0 && isMounted) {
              const formatted = rawList.map((item, idx) => {
                const photoSrc = item.UserPhoto || item.Photo || item.photo;
                const hasPhoto = Boolean(
                  photoSrc &&
                    typeof photoSrc === "string" &&
                    photoSrc.trim().length > 0
                );
                return {
                  id: item.Id || `db-review-${idx}`,
                  name: item.UserName || `Builder #${idx + 1}`,
                  role:
                    item.Category ||
                    (item.EventName
                      ? `Participant (${item.EventName})`
                      : "Event Participant"),
                  quote: item.Comments || "Great platform for collegiate innovation.",
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

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  useEffect(() => {
    if (isPaused || reduceMotion) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, reduceMotion, handleNext]);

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

  const handleMouseMove = (e) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseTilt({
      x: -y * 7,
      y: x * 12,
    });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setMouseTilt({ x: 0, y: 0 });
  };

  const getCardTransform = (idx) => {
    let diff = idx - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    const screenHalf = windowWidth / 2;
    const nearX = isMobile ? 150 : isTablet ? 260 : Math.min(screenHalf * 0.44, 450);
    const farX = isMobile ? 280 : isTablet ? 490 : Math.min(screenHalf * 0.84, 860);
    const extremeX = isMobile
      ? 400
      : isTablet
      ? 680
      : Math.min(screenHalf * 1.2, 1250);

    if (diff === 0) {
      return {
        x: 0,
        y: isMobile ? -6 : -14,
        z: isMobile ? 70 : 140,
        scale: isMobile ? 1.01 : 1.06,
        rotateY: 0,
        rotateZ: 0,
        zIndex: 40,
        opacity: 1,
        pointerEvents: "auto",
      };
    } else if (diff === -1) {
      return {
        x: -nearX,
        y: isMobile ? 4 : 8,
        z: isMobile ? -20 : -40,
        scale: isMobile ? 0.86 : 0.9,
        rotateY: isMobile ? 20 : 26,
        rotateZ: 1.5,
        zIndex: 25,
        opacity: 0.92,
        pointerEvents: "auto",
      };
    } else if (diff === 1) {
      return {
        x: nearX,
        y: isMobile ? 4 : 8,
        z: isMobile ? -20 : -40,
        scale: isMobile ? 0.86 : 0.9,
        rotateY: isMobile ? -20 : -26,
        rotateZ: -1.5,
        zIndex: 25,
        opacity: 0.92,
        pointerEvents: "auto",
      };
    } else if (diff === -2) {
      return {
        x: -farX,
        y: isMobile ? 12 : 20,
        z: isMobile ? -80 : -150,
        scale: isMobile ? 0.72 : 0.78,
        rotateY: isMobile ? 34 : 40,
        rotateZ: 3,
        zIndex: 15,
        opacity: isMobile ? 0.35 : 0.72,
        pointerEvents: "auto",
      };
    } else if (diff === 2) {
      return {
        x: farX,
        y: isMobile ? 12 : 20,
        z: isMobile ? -80 : -150,
        scale: isMobile ? 0.72 : 0.78,
        rotateY: isMobile ? -34 : -40,
        rotateZ: -3,
        zIndex: 15,
        opacity: isMobile ? 0.35 : 0.72,
        pointerEvents: "auto",
      };
    }
    return {
      x: diff < 0 ? -extremeX : extremeX,
      y: 35,
      z: -300,
      scale: 0.6,
      rotateY: diff < 0 ? 50 : -50,
      rotateZ: 0,
      zIndex: 5,
      opacity: 0,
      pointerEvents: "none",
    };
  };

  return (
    <section
      id="testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      className="relative py-20 sm:py-28 overflow-hidden bg-emerald-600 dark:bg-emerald-600 text-white transition-colors duration-300 select-none border-t border-emerald-500/40 dark:border-emerald-800/60"
    >
      {/* Header matching homepage md:max-w-[80%] editorial rhythm */}
      <div className="w-full md:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 relative z-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Loved by Builders,
            <br />
            <span className="">
              Trusted by Teams
            </span>
          </h2>
          <p className="text-sm sm:text-base text-emerald-50 dark:text-emerald-50 leading-relaxed font-normal">
            See what our participants say about organizing, competing, and collaborating on AYOJAN.
          </p>
        </motion.div>
      </div>

      {/* Full-Width 3D Pass Carousel Stage */}
      <div className="relative w-full overflow-hidden">
        {/* Clean edge fade masks matching emerald backdrop */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-14 sm:w-28 lg:w-44 bg-gradient-to-r from-emerald-600 dark:from-emerald-600 to-transparent z-30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-14 sm:w-28 lg:w-44 bg-gradient-to-l from-emerald-600 dark:from-emerald-600 to-transparent z-30"
          aria-hidden="true"
        />

        {/* Floating Left Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous Testimonial"
          className="absolute left-3 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white dark:bg-black border border-white/80 dark:border-emerald-800 flex items-center justify-center text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-400 transition-colors shadow-sm active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Floating Right Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next Testimonial"
          className="absolute right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white dark:bg-black border border-white/80 dark:border-emerald-800 flex items-center justify-center text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-400 transition-colors shadow-sm active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full min-h-[430px] sm:min-h-[460px] flex items-center justify-center py-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
        >
          {/* Architectural Horizon Ring */}
          <div
            className="absolute -bottom-2 w-[1100px] lg:w-[1500px] max-w-[96vw] h-[140px] rounded-[100%] border border-white/25 dark:border-emerald-400/20 pointer-events-none"
            style={{
              transform: "rotateX(72deg)",
            }}
            aria-hidden="true"
          />

          {/* 3D Carousel Cards Container */}
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    rotateX: mouseTilt.x,
                    rotateY: mouseTilt.y,
                  }
            }
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full h-[370px] sm:h-[395px] flex items-center justify-center"
          >
            {testimonials.map((item, idx) => {
              const transform = getCardTransform(idx);
              const isCenter = idx === activeIndex;
              const starCount = Math.min(5, Math.max(1, Math.round(item.rating)));

              return (
                <motion.div
                  key={item.id}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex(idx);
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
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    mass: 0.85,
                  }}
                  style={{
                    width: `${cardW}px`,
                    height: `${cardH}px`,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    pointerEvents: transform.pointerEvents,
                  }}
                  className={`group/tcard absolute flex flex-col justify-between select-none ${
                    isCenter ? "cursor-default" : "cursor-pointer"
                  }`}
                >
                  {/* Custom Die-Cut Pass SVG Shell matching LogisticsAutomationSection */}
                  <DieCutQuoteShell
                    width={cardW}
                    height={cardH}
                    notchY={notchY}
                    gradId={`quote-pass-${uid}-${idx}`}
                    isCenter={isCenter}
                  />

                  {/* Upper Testimonial Pass Chamber */}
                  <div className="relative z-10 flex-1 px-6 sm:px-7 pt-5 pb-4 flex flex-col justify-between">
                    {/* Lanyard Cutout Slot */}
                    <div
                      className="mx-auto w-11 h-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-emerald-600"
                      aria-hidden="true"
                    />

                    {/* Top Pass Header: Viewfinder Quote Mark + Star Score */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                          
                          <Quote
                            strokeWidth={1.6}
                            className={`w-8 h-8 transition-colors duration-200 ${
                              isCenter
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-600 dark:text-zinc-400 group-hover/tcard:text-emerald-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < starCount
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200 dark:text-zinc-800"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[11px] font-mono font-semibold text-slate-500 dark:text-zinc-400"
                          style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                          {starCount}.0
                        </span>
                      </div>
                    </div>

                    {/* Editorial Quote Body */}
                    <div className="my-auto pt-3 pb-1">
                      <p
                        className={`leading-[1.6] line-clamp-4 ${
                          isCenter
                            ? "text-slate-900 dark:text-white text-[14.5px] sm:text-[16px] font-medium"
                            : "text-slate-600 dark:text-zinc-400 text-[13px] sm:text-[14px] font-normal"
                        }`}
                      >
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Perforated Ticket Stub: Optical Avatar Frame + Builder Identity */}
                  <div className="relative z-10 h-[92px] px-6 sm:px-7 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Viewfinder Framed Portrait */}
                      <div className="relative p-1 shrink-0">
                        <span
                          className={`absolute top-0 left-0 w-2 h-2 border-t-[1.5px] border-l-[1.5px] transition-colors duration-200 ${
                            isCenter
                              ? "border-emerald-500"
                              : "border-slate-300 dark:border-zinc-700"
                          }`}
                        />
                        <span
                          className={`absolute top-0 right-0 w-2 h-2 border-t-[1.5px] border-r-[1.5px] transition-colors duration-200 ${
                            isCenter
                              ? "border-emerald-500"
                              : "border-slate-300 dark:border-zinc-700"
                          }`}
                        />
                        <span
                          className={`absolute bottom-0 left-0 w-2 h-2 border-b-[1.5px] border-l-[1.5px] transition-colors duration-200 ${
                            isCenter
                              ? "border-emerald-500"
                              : "border-slate-300 dark:border-zinc-700"
                          }`}
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2 h-2 border-b-[1.5px] border-r-[1.5px] transition-colors duration-200 ${
                            isCenter
                              ? "border-emerald-500"
                              : "border-slate-300 dark:border-zinc-700"
                          }`}
                        />

                        <img
                          src={item.avatar}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              item.name || "AY"
                            )}&backgroundColor=10b981,059669,047857`;
                          }}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-zinc-900 block"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 leading-tight mt-0.5 truncate font-normal">
                          {item.role}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase tracking-[0.12em] ${
                        isCenter
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500"
                      }`}
                    >
                      <BadgeCheck className="w-3 h-3 shrink-0" />
                      <span>Verified</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Pagination Indicators with Active Countdown Bar */}
        <div className="flex items-center justify-center pt-5 relative z-40">
          <style>{`
            @keyframes testimonialProgressFill {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
          <div className="flex items-center h-5 gap-2">
            {testimonials.map((_, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                  className={`relative h-2.5 rounded-full transition-all duration-300 overflow-hidden cursor-pointer ${
                    isActive
                      ? "w-7 sm:w-10 bg-emerald-800/45 dark:bg-emerald-900/70 ring-1 ring-white/80 dark:ring-white/80"
                      : "w-2.5 sm:w-3 bg-white/45 dark:bg-emerald-800 hover:bg-white/75 dark:hover:bg-emerald-600"
                  }`}
                >
                  {isActive && (
                    <div
                      key={`progress-fill-${activeIndex}`}
                      className="absolute left-0 top-0 bottom-0 bg-white dark:bg-emerald-400 rounded-full"
                      style={{
                        animation: reduceMotion
                          ? "none"
                          : "testimonialProgressFill 6000ms linear forwards",
                        animationPlayState: isPaused ? "paused" : "running",
                        width: reduceMotion ? "100%" : undefined,
                      }}
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
