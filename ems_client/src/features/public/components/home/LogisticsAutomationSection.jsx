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
  ArrowUpRight,
} from "lucide-react";

// The 7 Official Campus & Virtual Event Infrastructure Capabilities (Clean & Spacious)
const INFRASTRUCTURE_CARDS = [
  {
    id: "card-1",
    num: "01",
    category: "Access & Security",
    title: "Automated Digital Passes",
    desc: "Encrypted QR credentials with instant offline verification for high-throughput campus security gates and admission checkpoints.",
    icon: QrCode,
  },
  {
    id: "card-2",
    num: "02",
    category: "Dining Operations",
    title: "Cafeteria Meal Tokens",
    desc: "Single-tap digital vouchers preventing queue congestion, duplicate meal redemptions, and dining hall bottlenecks.",
    icon: Utensils,
  },
  {
    id: "card-3",
    num: "03",
    category: "Hostel & Housing",
    title: "Hostel & Bed Allocations",
    desc: "Intelligent squad-based room allocation, gender-segregated blocks, and digital warden key issuance manifests.",
    icon: Hotel,
  },
  {
    id: "card-4",
    num: "04",
    category: "Evaluation Matrix",
    title: "Multi-Round Scoring Engine",
    desc: "Dynamic weighted rubrics, anonymous blind judging parameters, and automated live leaderboard recalculations.",
    icon: Scale,
  },
  {
    id: "card-5",
    num: "05",
    category: "Lab & Hardware",
    title: "Hardware & IoT Inventory",
    desc: "Automated microcontroller, sensor, and hardware tool checkout with QR asset binding and liability tracking.",
    icon: Cpu,
  },
  {
    id: "card-6",
    num: "06",
    category: "Push Dispatch",
    title: "Instant Push Broadcasts",
    desc: "High-priority multi-channel announcement engine reaching all participants instantly across web, email, and mobile.",
    icon: Radio,
  },
  {
    id: "card-7",
    num: "07",
    category: "Credential Registry",
    title: "Automated Certificate Engine",
    desc: "Instant cryptographic digital certificates with verifiable credentials and public authenticity proof records.",
    icon: Award,
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
  const cardWidth = 320;
  const cardGap = 16;
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
                {/* CARD BODY: Ultra-Spacious, Clean, Uncongested Modern Card (Zero Pills) */}
                <div
                  className="w-full h-full rounded-2xl p-8 sm:p-9 flex flex-col justify-between overflow-hidden relative bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl dark:shadow-none hover:border-emerald-500/80 dark:hover:border-emerald-500/70 transition-all duration-300 group"
                >
                  {/* TOP & MIDDLE: Icon, Index, Title, and Description */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-800 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-colors">
                        <IconComponent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-mono text-sm font-semibold text-slate-400 dark:text-zinc-600 tracking-widest">
                        {card.num}
                      </span>
                    </div>

                    <div className="pt-8 space-y-3.5">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM: Minimal Category & Subtle Hover Arrow (Zero Pills) */}
                  <div className="pt-6 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <span className="tracking-wide">{card.category}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
