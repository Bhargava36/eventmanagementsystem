"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  QrCode,
  Utensils,
  Hotel,
  Scale,
  Cpu,
  Radio,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ScanLine,
} from "lucide-react";

// The 7 Official Campus & Virtual Event Infrastructure Capabilities (Theme-native normal cards)
const INFRASTRUCTURE_CARDS = [
  {
    id: "card-1",
    tag: "LIVE SCAN",
    title: "Automated Digital Passes",
    desc: "Encrypted QR badges with offline-capable verification at campus checkpoints and security gates.",
    icon: QrCode,
    badgeText: "LIVE SCAN",
    previewType: "qr",
  },
  {
    id: "card-2",
    tag: "FOOD TOKENS",
    title: "Cafeteria Meal Tokens",
    desc: "Single-tap digital food coupons preventing queue congestion and duplicate claims in dining halls.",
    icon: Utensils,
    badgeText: "FOOD TOKENS",
    previewType: "meal",
  },
  {
    id: "card-3",
    tag: "BLOCK ALLOCATION",
    title: "Hostel & Bed Allocations",
    desc: "Intelligent squad-based room grouping, gender-segregated dorms, and instant key issuance tracking.",
    icon: Hotel,
    badgeText: "BLOCK ALLOCATION",
    previewType: "hostel",
  },
  {
    id: "card-4",
    tag: "JURY RUBRICS",
    title: "Multi-Round Scoring",
    desc: "Weighted scoring rubrics, blind judging parameters, and automated live bounty leaderboards.",
    icon: Scale,
    badgeText: "JURY RUBRICS",
    previewType: "rubric",
  },
  {
    id: "card-5",
    tag: "ASSET DESK",
    title: "Hardware & IoT Inventory",
    desc: "Automated microcontroller and sensor checkout with QR tracking and return management.",
    icon: Cpu,
    badgeText: "HARDWARE DESK",
    previewType: "hardware",
  },
  {
    id: "card-6",
    tag: "LIVE BROADCAST",
    title: "Instant Push Broadcasts",
    desc: "One-click multi-channel dispatch sending SMS, email, and live in-app alerts to participants.",
    icon: Radio,
    badgeText: "DISPATCH",
    previewType: "broadcast",
  },
  {
    id: "card-7",
    tag: "CREDENTIALS",
    title: "Automated Certificate Engine",
    desc: "Instant cryptographic digital certificates with verifiable badge generation for every attendee.",
    icon: Award,
    badgeText: "CERTIFICATES",
    previewType: "certificate",
  },
];

export default function LogisticsAutomationSection() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const animFrameId = useRef(null);

  // Position and scrolling state
  const [scrollPos, setScrollPos] = useState(0);
  const scrollPosRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const velocity = useRef(0);
  const lastDragTime = useRef(0);
  const lastDragX = useRef(0);

  // Responsive card measurements:
  // Tight gap (10px) so cards sit side-by-side like the reference image
  const [containerWidth, setContainerWidth] = useState(1200);
  const cardWidth = 285;
  const cardGap = 10;
  const singleSetWidth = INFRASTRUCTURE_CARDS.length * (cardWidth + cardGap);

  // Triplicate cards so the 3D loop repeats infinitely without seam
  const loopCards = [...INFRASTRUCTURE_CARDS, ...INFRASTRUCTURE_CARDS, ...INFRASTRUCTURE_CARDS];

  // Measure container dimensions
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

  // Continuous silky smooth auto-scroll loop
  useEffect(() => {
    const baseSpeed = 0.8;

    const animateLoop = () => {
      if (!isDragging) {
        const currentSpeed = isHovered ? 0.2 : baseSpeed;

        if (Math.abs(velocity.current) > 0.05) {
          scrollPosRef.current += velocity.current;
          velocity.current *= 0.94;
        } else {
          scrollPosRef.current += currentSpeed;
        }

        // Infinite seamless loop wrapping
        if (scrollPosRef.current >= singleSetWidth) {
          scrollPosRef.current -= singleSetWidth;
        } else if (scrollPosRef.current < 0) {
          scrollPosRef.current += singleSetWidth;
        }

        setScrollPos(scrollPosRef.current);
      }
      animFrameId.current = requestAnimationFrame(animateLoop);
    };

    animFrameId.current = requestAnimationFrame(animateLoop);
    return () => cancelAnimationFrame(animFrameId.current);
  }, [isDragging, isHovered, singleSetWidth]);

  // Mouse Drag / Touch Swipe Handlers (Hand cursor dragging like reference image)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartX.current = e.pageX || (e.touches && e.touches[0].pageX);
    dragStartScroll.current = scrollPosRef.current;
    lastDragX.current = dragStartX.current;
    lastDragTime.current = performance.now();
    velocity.current = 0;
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const currentX = e.pageX || (e.touches && e.touches[0].pageX);
      const diff = dragStartX.current - currentX;
      scrollPosRef.current = dragStartScroll.current + diff;

      // Track release velocity for flicking momentum
      const now = performance.now();
      const dt = Math.max(1, now - lastDragTime.current);
      velocity.current = ((lastDragX.current - currentX) / dt) * 14;
      lastDragTime.current = now;
      lastDragX.current = currentX;

      // Wrap if exceeded bounds
      if (scrollPosRef.current >= singleSetWidth) {
        scrollPosRef.current -= singleSetWidth;
        dragStartScroll.current -= singleSetWidth;
      } else if (scrollPosRef.current < 0) {
        scrollPosRef.current += singleSetWidth;
        dragStartScroll.current += singleSetWidth;
      }

      setScrollPos(scrollPosRef.current);
    },
    [isDragging, singleSetWidth]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Nav Arrows
  const scrollStep = (direction) => {
    const shift = (cardWidth + cardGap) * 1.5;
    scrollPosRef.current += direction * shift;
    if (scrollPosRef.current >= singleSetWidth) scrollPosRef.current -= singleSetWidth;
    if (scrollPosRef.current < 0) scrollPosRef.current += singleSetWidth;
    setScrollPos(scrollPosRef.current);
  };

  return (
    <section
      id="logistics"
      className="relative w-full py-20 sm:py-28 overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 select-none"
    >
      {/* Background Subtle Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      {/* Header Container with Staggered Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight font-serif md:font-sans">
            Campus & Virtual Event Infrastructure
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Integrated tools built specifically for handling registrations, on-site campus logistics, and jury evaluations.
          </p>
        </div>

        {/* Navigation Controls with Spring Reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => scrollStep(-1)}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollStep(1)}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-sm active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>

      {/* ======================================================== */}
      {/* 3D CYLINDRICAL CURVED CAROUSEL CONTAINER (CoverFlow Arc) */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setIsHovered(false);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        className={`relative w-full h-[500px] sm:h-[540px] overflow-hidden flex items-center ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          perspective: "1300px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        {/* Horizontal Moving Ribbon */}
        <div
          ref={trackRef}
          className="absolute left-0 top-0 h-full flex items-center"
          style={{
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {loopCards.map((card, idx) => {
            // Absolute X position of this card in the infinite track
            const cardX = idx * (cardWidth + cardGap) - scrollPos;
            const cardCenter = cardX + cardWidth / 2;
            const containerCenter = containerWidth / 2;

            // Distance from center of screen (-1 to +1 normalized)
            const dist = cardCenter - containerCenter;
            const norm = dist / (containerWidth * 0.45);
            const clampedNorm = Math.max(-1.8, Math.min(1.8, norm));

            // Cylindrical Arc Math:
            // Tight side-by-side spacing with smooth curved rotation
            const rotateY = clampedNorm * -20;
            const translateZ = -Math.pow(Math.abs(clampedNorm), 1.6) * 75;
            const scale = Math.max(0.84, 1 - Math.abs(clampedNorm) * 0.05);
            const opacity = Math.max(0.5, 1 - Math.abs(clampedNorm) * 0.2);

            const IconComponent = card.icon;

            return (
              <div
                key={`${card.id}-${idx}`}
                className="absolute shrink-0 select-none transition-shadow duration-300"
                style={{
                  width: `${cardWidth}px`,
                  height: "440px",
                  left: `${idx * (cardWidth + cardGap)}px`,
                  transform: `translateX(${-scrollPos}px) perspective(1300px) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
                  transformStyle: "preserve-3d",
                  opacity,
                  zIndex: Math.round(100 - Math.abs(clampedNorm) * 20),
                  willChange: "transform, opacity",
                }}
              >
                {/* CARD BODY: Normal Theme Card (White in Light Mode, Black in Dark Mode - NO artificial colors) */}
                <div
                  className="w-full h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden relative bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl dark:shadow-none hover:border-emerald-500 dark:hover:border-emerald-500/80 transition-all duration-300 group"
                >
                  {/* TOP: Header & Capability Icon */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                        <IconComponent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Normal Theme Micro-Simulator Box */}
                    <div className="h-28 w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-3 flex flex-col justify-between overflow-hidden">
                      {card.previewType === "qr" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-zinc-800/60 flex items-center justify-center text-slate-700 dark:text-zinc-400">
                                <ScanLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                #HKH-9281
                              </span>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          </div>
                          {/* Animated Scan Line */}
                          <div className="relative w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                              className="w-1/2 h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Fast-Track Gate 1 Verified
                          </div>
                        </div>
                      )}

                      {card.previewType === "meal" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                              Midnight Fuel Pass
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                              VALID
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300">
                              Breakfast ✓
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                              Lunch ●
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-[10px] text-slate-500 dark:text-zinc-400">
                              Dinner
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Breakfast • Lunch • Dinner
                          </div>
                        </div>
                      )}

                      {card.previewType === "hostel" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                            <span>Block B (Wing 3)</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">92% Filled</span>
                          </div>
                          <div className="grid grid-cols-8 gap-1.5 py-1">
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-2.5 rounded-sm ${
                                  i < 7 ? "bg-emerald-500" : "bg-slate-200 dark:bg-zinc-800"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            Squad Rooms Auto-Paired
                          </div>
                        </div>
                      )}

                      {card.previewType === "rubric" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-zinc-300">
                            <span>Architecture</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">98%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="w-[98%] h-full bg-emerald-500 rounded-full" />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-zinc-300">
                            <span>Innovation</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">94%</span>
                          </div>
                        </div>
                      )}

                      {card.previewType === "hardware" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">ESP32 & Sensors</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">ACTIVE</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300">
                              Checked Out: 24
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                              Stock: 12
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                            Digital Liability Receipt Active
                          </div>
                        </div>
                      )}

                      {card.previewType === "broadcast" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">Campus Alert</span>
                            <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                          <div className="p-1.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300 truncate">
                            "Pitch Round in Main Auditorium in 10 mins"
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            100% Delivery • 450 Nodes
                          </div>
                        </div>
                      )}

                      {card.previewType === "certificate" && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">Verifiable Badge</span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">SHA-256</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-[10px] text-slate-700 dark:text-zinc-300 font-medium">
                              Merit of Excellence
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                            Hash: 0x8f2a...c941
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM: Normal Card Typography */}
                  <div className="space-y-1.5 pt-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal line-clamp-3">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
