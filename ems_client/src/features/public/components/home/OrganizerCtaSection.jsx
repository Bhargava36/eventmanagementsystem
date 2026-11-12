"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  QrCode,
  CalendarPlus,
  Compass,
  Scale,
  Check,
} from "lucide-react";

const LAUNCH_TRACKS = [
  {
    id: "organizer",
    num: "01",
    tabLabel: "Host Event",
    icon: CalendarPlus,
    eyebrow: "FOR COLLEGES & ORGANIZERS",
    serial: "GATE // ADMIN-HOST",
    headline: "Launch Your Next Event",
    accentWord: "From Concept to Crowds.",
    summary:
      "Configure event pages, accept solo or team entries, design QR participant badges, coordinate rooms and meals, and publish jury scores.",
    features: [
      "Registration portals",
      "Custom QR badge builder",
      "Room & meal rosters",
      "Email broadcasts",
    ],
    stubTag: "ORGANIZER ENTRY",
    ctaLabel: "Create Your Event",
    ctaHref: "/admin/register",
    secondaryLabel: "Organizer Portal Sign In",
    secondaryHref: "/admin/login",
  },
  {
    id: "participant",
    num: "02",
    tabLabel: "Participant",
    icon: Compass,
    eyebrow: "FOR STUDENTS & TEAMS",
    serial: "GATE // BUILDER-PASS",
    headline: "Step Into Open Arenas",
    accentWord: "Build, Pitch & Compete.",
    summary:
      "Browse open hackathons, project expos, workshops, and alumni meets across virtual and on-campus tracks with one digital ID pass.",
    features: [
      "Solo & team enrollment",
      "Shareable invite codes",
      "Digital QR pass wallet",
      "Track standings",
    ],
    stubTag: "PARTICIPANT ENTRY",
    ctaLabel: "Explore Open Events",
    ctaHref: "/events",
    secondaryLabel: "Verify an ID Pass",
    secondaryHref: "/verify-id",
  },
  {
    id: "evaluator",
    num: "03",
    tabLabel: "Jury Portal",
    icon: Scale,
    eyebrow: "FOR JURY & EVALUATORS",
    serial: "GATE // JURY-BENCH",
    headline: "Evaluate Every Round",
    accentWord: "Structured & Transparent.",
    summary:
      "Sign in to your dedicated evaluator desk, score assigned project teams or expo booths against organizer criteria, and lock round rankings.",
    features: [
      "Assigned round queues",
      "Weighted rubric criteria",
      "Project & booth lookup",
      "Instant tally sync",
    ],
    stubTag: "EVALUATOR ENTRY",
    ctaLabel: "Jury Sign In",
    ctaHref: "/evaluator/login",
    secondaryLabel: "Browse Open Events",
    secondaryHref: "/events",
  },
];

// Precision observed SVG die-cut shell so notched geometry matches fluid HTML height
function CredentialSvgFrame({
  containerRef,
  side,
  isVertical,
  variant = "body",
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      if (w > 0 && h > 0) {
        setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  if (box.w === 0 || box.h === 0) return null;

  const { w, h } = box;
  const r = 26;
  const nr = 12;
  let pathD = "";

  if (!isVertical && side === "left") {
    // Rounded left corners, notched right corners meeting the perforated seam
    pathD = `M ${r} 1 L ${w - nr} 1 A ${nr - 1} ${nr - 1} 0 0 0 ${w - 1} ${nr} L ${
      w - 1
    } ${h - nr} A ${nr - 1} ${nr - 1} 0 0 0 ${w - nr} ${h - 1} L ${r} ${
      h - 1
    } A ${r - 1} ${r - 1} 0 0 1 1 ${h - r} L 1 ${r} A ${r - 1} ${r - 1} 0 0 1 ${r} 1 Z`;
  } else if (!isVertical && side === "right") {
    // Notched left corners meeting the perforated seam, rounded right corners
    pathD = `M ${nr} 1 L ${w - r} 1 A ${r - 1} ${r - 1} 0 0 1 ${w - 1} ${r} L ${
      w - 1
    } ${h - r} A ${r - 1} ${r - 1} 0 0 1 ${w - r} ${h - 1} L ${nr} ${
      h - 1
    } A ${nr - 1} ${nr - 1} 0 0 0 1 ${h - nr} L 1 ${nr} A ${nr - 1} ${
      nr - 1
    } 0 0 0 ${nr} 1 Z`;
  } else if (isVertical && side === "left") {
    // Mobile top pass body: rounded top corners, notched bottom corners
    pathD = `M ${r} 1 L ${w - r} 1 A ${r - 1} ${r - 1} 0 0 1 ${w - 1} ${r} L ${
      w - 1
    } ${h - nr} A ${nr - 1} ${nr - 1} 0 0 0 ${w - nr} ${h - 1} L ${nr} ${
      h - 1
    } A ${nr - 1} ${nr - 1} 0 0 0 1 ${h - nr} L 1 ${r} A ${r - 1} ${
      r - 1
    } 0 0 1 ${r} 1 Z`;
  } else {
    // Mobile bottom stub: notched top corners, rounded bottom corners
    pathD = `M ${nr} 1 L ${w - nr} 1 A ${nr - 1} ${nr - 1} 0 0 0 ${w - 1} ${nr} L ${
      w - 1
    } ${h - r} A ${r - 1} ${r - 1} 0 0 1 ${w - r} ${h - 1} L ${r} ${
      h - 1
    } A ${r - 1} ${r - 1} 0 0 1 1 ${h - r} L 1 ${nr} A ${nr - 1} ${
      nr - 1
    } 0 0 0 ${nr} 1 Z`;
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <path
        d={pathD}
        strokeWidth="1.25"
        className={
          variant === "stub"
            ? "fill-emerald-600 dark:fill-emerald-600 stroke-emerald-500 dark:stroke-emerald-400/70"
            : "fill-white dark:fill-black stroke-slate-200 dark:stroke-zinc-800"
        }
      />
    </svg>
  );
}

export default function OrganizerCtaSection() {
  const layoutUid = useId();
  const reduceMotion = useReducedMotion();
  const bodyRef = useRef(null);
  const stubRef = useRef(null);

  const [activeId, setActiveId] = useState("organizer");
  const [isStubActive, setIsStubActive] = useState(false);
  const [isVertical, setIsVertical] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsVertical(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const currentTrack =
    LAUNCH_TRACKS.find((t) => t.id === activeId) || LAUNCH_TRACKS[0];

  return (
    <section
      id="command"
      className="relative w-full py-24 sm:py-32 bg-white dark:bg-black text-slate-900 dark:text-white border-t border-slate-200/70 dark:border-zinc-800/80 transition-colors duration-300 selection:bg-emerald-500 selection:text-white overflow-hidden scroll-mt-20"
    >
  

      <div className="relative z-10 w-full md:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimalist Section Intro Cue */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2.5"
        >
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Ready When You Are.
          </h2>
        </motion.div>

        {/* Two-Piece Tear-Off Boarding Credential Pass */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto flex flex-col md:flex-row items-stretch md:min-h-[410px]"
        >
          {/* PIECE 1: Left Credential Pass Body */}
          <div
            ref={bodyRef}
            className="relative flex-1 min-w-0 flex"
          >
            <CredentialSvgFrame
              containerRef={bodyRef}
              side="left"
              isVertical={isVertical}
              variant="body"
            />

            <div className="relative z-10 w-full p-7 sm:p-10 lg:p-11 flex flex-col justify-between">
              <div className="space-y-6">
              {/* Role Gate Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <LayoutGroup id={`cta-gate-${layoutUid}`}>
                  <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950">
                    {LAUNCH_TRACKS.map((track) => {
                      const IconComponent = track.icon;
                      const isActive = track.id === activeId;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => setActiveId(track.id)}
                          className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? "text-white"
                              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="cta-boarding-pill"
                              transition={{
                                type: "spring",
                                stiffness: 360,
                                damping: 30,
                              }}
                              className="absolute inset-0 rounded-full bg-emerald-600"
                            />
                          )}
                          <IconComponent className="relative z-10 w-3.5 h-3.5 shrink-0" />
                          <span className="relative z-10">{track.tabLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>

               
              </div>

              {/* Morphing Editorial Pass Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTrack.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4 pt-1"
                >
                  <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                    {currentTrack.eyebrow}
                  </p>

                  <h3 className="text-2xl sm:text-3xl lg:text-[38px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                    {currentTrack.headline}{" "}
                    <span className="font-heading italic font-bold text-emerald-600 dark:text-emerald-400 block sm:inline">
                      {currentTrack.accentWord}
                    </span>
                  </h3>

                  <p className="text-sm sm:text-[15px] text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl font-normal">
                    {currentTrack.summary}
                  </p>

                  {/* Compact Feature Tags */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {currentTrack.features.map((feat) => (
                      <div
                        key={feat}
                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Secondary Quick Route at Bottom of Pass Body */}
              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between gap-4">
                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                  PASS #{currentTrack.num} • AYOJAN ACCESS
                </span>
                <Link
                  to={currentTrack.secondaryHref}
                  className="group/sec inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{currentTrack.secondaryLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/sec:translate-x-0.5 motion-safe:group-hover/sec:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Perforated Tear Seam Divider between Pass Body & Action Stub */}
          <div
            className="relative flex md:flex-col items-center justify-center px-4 md:px-0 py-0 md:py-4 shrink-0"
            aria-hidden="true"
          >
            <span
              className={`w-full h-px md:w-px md:h-full border-t md:border-t-0 md:border-l border-dashed transition-colors duration-200 ${
                isStubActive
                  ? "border-emerald-500 dark:border-emerald-400"
                  : "border-slate-300 dark:border-zinc-700"
              }`}
            />
          </div>

          {/* PIECE 2: Stationary Hit Wrapper + Detachable Emerald Launch Stub */}
          <div
            onMouseEnter={() => setIsStubActive(true)}
            onMouseLeave={() => setIsStubActive(false)}
            onFocus={() => setIsStubActive(true)}
            onBlur={() => setIsStubActive(false)}
            className="relative w-full md:w-[290px] lg:w-[320px] shrink-0 flex"
          >
            <motion.div
              ref={stubRef}
              animate={
                reduceMotion
                  ? undefined
                  : isStubActive
                  ? isVertical
                    ? { y: 14, rotate: 1.2, scale: 1.01 }
                    : { x: 24, y: -6, rotate: 3.2, scale: 1.015 }
                  : { x: 0, y: 0, rotate: 0, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformOrigin: isVertical ? "50% 0%" : "0% 50%" }}
              className="relative w-full flex"
            >
              <CredentialSvgFrame
                containerRef={stubRef}
                side="right"
                isVertical={isVertical}
                variant="stub"
              />

              <Link
                to={currentTrack.ctaHref}
                className="group/stub relative z-10 h-full w-full p-7 sm:p-8 flex flex-row md:flex-col items-center md:items-stretch justify-between gap-6 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-[26px]"
              >
              {/* Stub Top Meta + Viewfinder QR Token */}
              <div className="flex md:w-full items-center justify-between gap-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-100">
                  {currentTrack.stubTag}
                </span>
                <div className="hidden sm:flex relative w-11 h-11 items-center justify-center shrink-0">
                 
                  <QrCode className="w-10 h-10 text-white/90" strokeWidth={1.5} />
                </div>
              </div>

              {/* Stub Center Action Prompt */}
              <div className="hidden md:block my-auto py-4 space-y-1.5">
                <span className="block text-[11px] font-mono uppercase tracking-[0.16em] text-emerald-100/90">
                  Tear To Launch
                </span>
                <p className="font-heading text-2xl font-bold leading-snug text-white">
                  {currentTrack.ctaLabel}
                </p>
              </div>

              {/* Tactile Slot-Roll Launch Pill */}
              <div className="inline-flex items-center justify-between gap-3 px-5 py-3.5 rounded-full bg-white text-slate-900 font-semibold text-sm shadow-xs shrink-0 md:w-full">
                <span className="inline-flex flex-col overflow-hidden h-[20px]">
                  <span className="flex flex-col motion-safe:transition-transform motion-safe:duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/stub:-translate-y-[20px]">
                    <span className="h-[20px] leading-[20px] truncate">
                      {currentTrack.ctaLabel}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-[20px] leading-[20px] text-emerald-600 truncate"
                    >
                      {currentTrack.ctaLabel}
                    </span>
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/stub:translate-x-1" />
              </div>
            </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
