"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  QrCode,
  ScanLine,
  Hotel,
  LayoutGrid,
  Scale,
  Presentation,
  Camera,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Pause,
  Play,
} from "lucide-react";

const INFRASTRUCTURE_CARDS = [
  {
    id: "id-passes",
    num: "01",
    category: "Identity",
    stubCode: "ID-PASS // 01",
    title: "ID Card & Pass Designer",
    desc: "Create custom participant and team ID badges paired with public QR lookup verification.",
    actionLabel: "Verify pass",
    href: "/verify-id",
    icon: QrCode,
  },
  {
    id: "gate-meals",
    num: "02",
    category: "Check-In",
    stubCode: "SCANNER // 02",
    title: "Gate & Meal Scanner",
    desc: "Validate participant QR passes at entry checkpoints and track physical event meals.",
    actionLabel: "Browse events",
    href: "/events",
    icon: ScanLine,
  },
  {
    id: "accommodation",
    num: "03",
    category: "Accommodation",
    stubCode: "LODGING // 03",
    title: "Hostel & Room Allocation",
    desc: "Assign hostel blocks and rooms to outstation attendees with organized stay rosters.",
    actionLabel: "Host console",
    href: "/admin/register",
    icon: Hotel,
  },
  {
    id: "expo-booths",
    num: "04",
    category: "Exhibitions",
    stubCode: "BOOTHS // 04",
    title: "Expo Booths & Layout",
    desc: "Manage exhibition floor zones and assign booth stalls cleanly across project expos.",
    actionLabel: "Explore expos",
    href: "/events",
    icon: LayoutGrid,
  },
  {
    id: "jury-scoring",
    num: "05",
    category: "Evaluation",
    stubCode: "JURY // 05",
    title: "Jury & Rubric Evaluation",
    desc: "Coordinate evaluator logins, round-wise scoring matrices, and published track results.",
    actionLabel: "Jury portal",
    href: "/evaluator/login",
    icon: Scale,
  },
  {
    id: "sessions-qa",
    num: "06",
    category: "Sessions",
    stubCode: "SESSIONS // 06",
    title: "Workshops & Seminars",
    desc: "Publish agendas, speaker rosters, downloadable files, attendance logs, and Q&A.",
    actionLabel: "Open directory",
    href: "/explore",
    icon: Presentation,
  },
  {
    id: "alumni-wall",
    num: "07",
    category: "Community",
    stubCode: "ALUMNI // 07",
    title: "Alumni Meets & Gallery",
    desc: "Run reunion invitations, check-in tracking, and curated campus memory walls.",
    actionLabel: "View meets",
    href: "/events",
    icon: Camera,
  },
  {
    id: "emailer-feedback",
    num: "08",
    category: "Dispatch",
    stubCode: "MAILER // 08",
    title: "Broadcast & Feedback",
    desc: "Send targeted bulk announcements via email and collect structured attendee reviews.",
    actionLabel: "Get started",
    href: "/admin/register",
    icon: Mail,
  },
];

const PASS_PATH =
  "M 27 1 L 309 1 A 26 26 0 0 1 335 27 L 335 347 A 11 11 0 0 0 335 369 L 335 403 A 26 26 0 0 1 309 429 L 27 429 A 26 26 0 0 1 1 403 L 1 369 A 11 11 0 0 0 1 347 L 1 27 A 26 26 0 0 1 27 1 Z";

// Precision 336x430 SVG pass shell with twin side punches & traveling emerald border gradient
function DieCutPassShell({ gradId, setGradRef, setOverlayRef }) {
  return (
    <svg
      viewBox="0 0 336 430"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          ref={setGradRef}
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="-310"
          y1="215"
          x2="310"
          y2="215"
        >
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="18%" stopColor="#10b981" stopOpacity="0.88" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
          <stop offset="82%" stopColor="#10b981" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d={PASS_PATH}
        strokeWidth="1.25"
        className="fill-white dark:fill-black stroke-slate-200 dark:stroke-zinc-800 group-hover/card:stroke-emerald-500/70 transition-colors duration-200"
      />
      <line
        x1="18"
        y1="358"
        x2="318"
        y2="358"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="stroke-slate-200 dark:stroke-zinc-800"
      />

      {/* Traveling emerald border light beam shifting continuously card-to-card */}
      <g ref={setOverlayRef} style={{ opacity: 0 }}>
        <path
          d={PASS_PATH}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="1.85"
        />
        <line
          x1="18"
          y1="358"
          x2="318"
          y2="358"
          stroke={`url(#${gradId})`}
          strokeWidth="1.25"
          strokeDasharray="4 4"
        />
      </g>
    </svg>
  );
}

const CARD_WIDTH = 336;
const CARD_GAP = 20;
const SLOT_WIDTH = CARD_WIDTH + CARD_GAP;
const TOTAL_CARDS = INFRASTRUCTURE_CARDS.length;
const SINGLE_SET_WIDTH = TOTAL_CARDS * SLOT_WIDTH;
const HALF_RING = SINGLE_SET_WIDTH / 2;

function wrapMod(val, span) {
  const m = val % span;
  return m < 0 ? m + span : m;
}

export default function LogisticsAutomationSection() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const cardRefs = useRef([]);
  const gradRefs = useRef([]);
  const overlayRefs = useRef([]);
  const animFrameId = useRef(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(containerRef, { margin: "120px" });

  // Single continuous modular ring offset across 8 persistent card nodes (zero batch swap)
  const scrollPosRef = useRef(0);
  const targetOffsetRef = useRef(null);
  const velocityRef = useRef(0);
  const currentSpeedRef = useRef(104);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const lastDragTimeRef = useRef(0);
  const lastDragXRef = useRef(0);
  const wasDraggedRef = useRef(false);

  const isHoveredRef = useRef(false);
  const isPausedRef = useRef(false);
  const hasInitializedCenterRef = useRef(false);
  const lastReportedCenterRef = useRef(-1);

  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const updateCardTransforms = useCallback(
    (rawPos) => {
      const containerCenter = containerWidth / 2;
      const wrappedPos = wrapMod(rawPos, SINGLE_SET_WIDTH);
      let closestIdx = 0;
      let closestDist = Infinity;

      for (let idx = 0; idx < TOTAL_CARDS; idx++) {
        const el = cardRefs.current[idx];
        if (!el) continue;

        // Shortest signed distance along circular ring [-HALF_RING, +HALF_RING]
        const rawDist = idx * SLOT_WIDTH + CARD_WIDTH / 2 - wrappedPos - containerCenter;
        const dist = wrapMod(rawDist + HALF_RING, SINGLE_SET_WIDTH) - HALF_RING;
        const absDist = Math.abs(dist);

        if (absDist < closestDist) {
          closestDist = absDist;
          closestIdx = idx;
        }

        const screenX = containerCenter + dist - CARD_WIDTH / 2;
        const norm = dist / Math.max(containerWidth * 0.42, 330);
        const clampedNorm = Math.max(-1.85, Math.min(1.85, norm));
        const rotateY = clampedNorm * -22;
        const translateZ = -Math.pow(Math.abs(clampedNorm), 1.55) * 78;
        const scale = Math.max(0.84, 1 - Math.abs(clampedNorm) * 0.055);
        // Smooth fade out to 0 before wrapping behind +-HALF_RING
        const opacity = Math.max(
          0,
          Math.min(1, 1 - Math.max(0, absDist - CARD_WIDTH * 0.6) / (SINGLE_SET_WIDTH * 0.34))
        );

        el.style.transform = `translate3d(${screenX.toFixed(
          2
        )}px, 0, 0) perspective(1300px) rotateY(${rotateY.toFixed(
          2
        )}deg) translateZ(${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)})`;

        const opacityStr = opacity > 0.005 ? opacity.toFixed(3) : "0";
        if (el.style.opacity !== opacityStr) {
          el.style.opacity = opacityStr;
        }

        const zStr = String(Math.round(100 - Math.abs(clampedNorm) * 20));
        if (el.style.zIndex !== zStr) {
          el.style.zIndex = zStr;
        }

        // Update traveling SVG border beam strictly on the 2-3 cards straddling center
        const overlayEl = overlayRefs.current[idx];
        const gradEl = gradRefs.current[idx];
        if (overlayEl && gradEl) {
          const beamOpacity = Math.max(0, Math.min(1, 1.18 - absDist / SLOT_WIDTH));
          if (beamOpacity > 0.01) {
            const localBeamX = CARD_WIDTH / 2 - dist;
            gradEl.setAttribute("gradientTransform", `translate(${localBeamX.toFixed(1)}, 0)`);
            overlayEl.style.opacity = beamOpacity.toFixed(3);
          } else if (overlayEl.style.opacity !== "0") {
            overlayEl.style.opacity = "0";
          }
        }
      }

      if (closestIdx !== lastReportedCenterRef.current) {
        lastReportedCenterRef.current = closestIdx;
        if (counterRef.current) {
          counterRef.current.textContent = String(closestIdx + 1).padStart(2, "0");
        }
      }
    },
    [containerWidth]
  );

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!hasInitializedCenterRef.current && containerWidth > 0) {
      hasInitializedCenterRef.current = true;
      scrollPosRef.current = wrapMod(CARD_WIDTH / 2 - containerWidth / 2, SINGLE_SET_WIDTH);
    }
    updateCardTransforms(scrollPosRef.current);
  }, [containerWidth, updateCardTransforms]);

  useEffect(() => {
    if (!isInView) return;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!isDraggingRef.current) {
        if (targetOffsetRef.current !== null) {
          const diff = targetOffsetRef.current;
          if (Math.abs(diff) < 0.75) {
            scrollPosRef.current += diff;
            targetOffsetRef.current = null;
          } else {
            const factor = 1 - Math.exp(-11 * dt);
            const step = diff * factor;
            scrollPosRef.current += step;
            targetOffsetRef.current -= step;
          }
        } else if (Math.abs(velocityRef.current) > 0.08) {
          scrollPosRef.current += velocityRef.current * (dt * 60);
          velocityRef.current *= Math.pow(0.92, dt * 60);
        } else {
          const targetSpeed =
            reduceMotion || isPausedRef.current
              ? 0
              : isHoveredRef.current
              ? 22
              : 104;
          const blend = 1 - Math.exp(-5 * dt);
          currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * blend;
          scrollPosRef.current += currentSpeedRef.current * dt;
        }

        scrollPosRef.current = wrapMod(scrollPosRef.current, SINGLE_SET_WIDTH);
        updateCardTransforms(scrollPosRef.current);
      }

      animFrameId.current = requestAnimationFrame(tick);
    };

    animFrameId.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isInView, reduceMotion, updateCardTransforms]);

  const handlePointerStart = (clientX) => {
    isDraggingRef.current = true;
    wasDraggedRef.current = false;
    targetOffsetRef.current = null;
    dragStartXRef.current = clientX;
    dragStartScrollRef.current = scrollPosRef.current;
    lastDragXRef.current = clientX;
    lastDragTimeRef.current = performance.now();
    velocityRef.current = 0;
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (clientX) => {
      if (!isDraggingRef.current) return;
      const diff = dragStartXRef.current - clientX;
      if (Math.abs(diff) > 6) {
        wasDraggedRef.current = true;
      }
      scrollPosRef.current = wrapMod(dragStartScrollRef.current + diff, SINGLE_SET_WIDTH);

      const now = performance.now();
      const dt = Math.max(1, now - lastDragTimeRef.current);
      velocityRef.current = ((lastDragXRef.current - clientX) / dt) * 14;
      lastDragTimeRef.current = now;
      lastDragXRef.current = clientX;

      updateCardTransforms(scrollPosRef.current);
    },
    [updateCardTransforms]
  );

  const handlePointerEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const scrollStep = (direction) => {
    velocityRef.current = 0;
    const shift = SLOT_WIDTH;
    if (reduceMotion) {
      scrollPosRef.current = wrapMod(scrollPosRef.current + direction * shift, SINGLE_SET_WIDTH);
      updateCardTransforms(scrollPosRef.current);
      return;
    }
    targetOffsetRef.current = (targetOffsetRef.current || 0) + direction * shift;
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      return next;
    });
  };

  return (
    <section
      id="logistics"
      className="relative w-full py-20 sm:py-28 overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 select-none"
    >
      {/* Header aligned consistently with homepage md:max-w-[80%] rhythm */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full md:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Campus & Virtual Event Infrastructure
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Integrated tools built for participant ID passes, venue check-ins, session coordination, and jury evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          

          <button
            type="button"
            onClick={togglePause}
            aria-label={isPaused ? "Resume carousel rotation" : "Pause carousel rotation"}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => scrollStep(-1)}
            aria-label="Previous platform module"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => scrollStep(1)}
            aria-label="Next platform module"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* 8-Card Circular Ring 3D Coverflow Stage */}
      <div
        ref={containerRef}
        onMouseDown={(e) => handlePointerStart(e.pageX)}
        onMouseMove={(e) => handlePointerMove(e.pageX)}
        onMouseUp={handlePointerEnd}
        onMouseLeave={() => {
          handlePointerEnd();
          isHoveredRef.current = false;
        }}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onTouchStart={(e) => {
          if (e.touches?.[0]) handlePointerStart(e.touches[0].pageX);
        }}
        onTouchMove={(e) => {
          if (e.touches?.[0]) handlePointerMove(e.touches[0].pageX);
        }}
        onTouchEnd={handlePointerEnd}
        onTouchCancel={handlePointerEnd}
        className={`relative w-full h-[470px] sm:h-[500px] overflow-hidden flex items-center ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          perspective: "1300px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Lightweight Edge Fade Overlays */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-white dark:from-black to-transparent z-30"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-white dark:from-black to-transparent z-30"
          aria-hidden="true"
        />

        <div
          className="relative w-full h-[430px]"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {INFRASTRUCTURE_CARDS.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className="group/card absolute top-0 left-0 shrink-0 select-none"
                style={{
                  width: `${CARD_WIDTH}px`,
                  height: "430px",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                  willChange: "transform, opacity",
                }}
              >
                <Link
                  to={card.href}
                  onClick={(e) => {
                    if (wasDraggedRef.current) {
                      e.preventDefault();
                    }
                  }}
                  draggable={false}
                  className="relative w-full h-full flex flex-col justify-between"
                >
                  <DieCutPassShell
                    gradId={`pass-beam-${uid}-${idx}`}
                    setGradRef={(el) => {
                      gradRefs.current[idx] = el;
                    }}
                    setOverlayRef={(el) => {
                      overlayRefs.current[idx] = el;
                    }}
                  />

                  {/* Upper Pass Content */}
                  <div className="relative z-10 px-7 pt-5 flex-1 flex flex-col">
                    {/* Lanyard Cutout Slot Detail */}
                    <div
                      className="mx-auto mb-4 w-12 h-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950"
                      aria-hidden="true"
                    />

                    {/* Pass Top Header Metadata */}
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.16em]">
                      
                      <span className="text-slate-400 dark:text-zinc-500">
                        {card.category}
                      </span>
                    </div>

                    {/* Optical Viewfinder Specimen Stage */}
                    <div className="relative my-5 h-[112px] flex items-center justify-center">
                      <span
                        className="absolute inset-x-4 top-1/2 h-px bg-slate-100 dark:bg-zinc-900"
                        aria-hidden="true"
                      />
                      <span
                        className="absolute inset-y-2 left-1/2 w-px bg-slate-100 dark:bg-zinc-900"
                        aria-hidden="true"
                      />

                      <div
                        className="relative w-24 h-24 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="absolute top-0 left-0 w-3 h-3 border-t-[1.5px] border-l-[1.5px] border-slate-300 dark:border-zinc-700 group-hover/card:border-emerald-500 transition-colors duration-200" />
                        <span className="absolute top-0 right-0 w-3 h-3 border-t-[1.5px] border-r-[1.5px] border-slate-300 dark:border-zinc-700 group-hover/card:border-emerald-500 transition-colors duration-200" />
                        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-[1.5px] border-l-[1.5px] border-slate-300 dark:border-zinc-700 group-hover/card:border-emerald-500 transition-colors duration-200" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-[1.5px] border-r-[1.5px] border-slate-300 dark:border-zinc-700 group-hover/card:border-emerald-500 transition-colors duration-200" />

                        <IconComponent
                          strokeWidth={1.35}
                          className="relative z-10 w-10 h-10 text-slate-800 dark:text-zinc-200 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Title & Concise Copy */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors duration-200">
                        {card.title}
                      </h3>
                      <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  {/* Perforated Ticket Stub Action Zone */}
                  <div className="relative z-10 h-[72px] px-7 flex items-center justify-between shrink-0">
                    
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors duration-200">
                      <span>{card.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/card:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
