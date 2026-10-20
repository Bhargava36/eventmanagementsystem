import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import gsap from 'gsap';
import {
  QrCode,
  Utensils,
  Hotel,
  Scale,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';

export default function LogisticsAutomationSection() {
  const laserRef = useRef(null);
  const progressBar1Ref = useRef(null);
  const progressBar2Ref = useRef(null);
  const dotsRef = useRef([]);
  const cardsRef = useRef([]);

  // 1. Anime.js: Laser Scan Animation for Digital Pass
  useEffect(() => {
    const laser = laserRef.current;
    if (!laser) return;

    try {
      animate(laser, {
        translateY: [0, 48],
        duration: 1800,
        alternate: true,
        loop: true,
        ease: 'inOutSine',
      });
    } catch (e) {}
  }, []);

  // 2. Anime.js: Live Score Rubrics Bar Fill Animation
  useEffect(() => {
    const b1 = progressBar1Ref.current;
    const b2 = progressBar2Ref.current;
    if (!b1 || !b2) return;

    try {
      animate([b1, b2], {
        scaleX: [0, 1],
        transformOrigin: 'left',
        duration: 1600,
        delay: (el, i) => i * 300,
        ease: 'outExpo',
        loop: true,
      });
    } catch (e) {}
  }, []);

  // 3. Anime.js: Staggered Hostel Bed Allocation Matrix
  useEffect(() => {
    if (!dotsRef.current.length) return;

    try {
      animate(dotsRef.current, {
        opacity: [0.3, 1],
        scale: [0.85, 1.15, 1],
        delay: (el, i) => i * 150,
        duration: 1200,
        loop: true,
        alternate: true,
        ease: 'inOutQuad',
      });
    } catch (e) {}
  }, []);

  // 4. GSAP: Smooth Card Elevation on Hover
  useEffect(() => {
    const cleanups = [];
    cardsRef.current.forEach((card) => {
      if (!card) return;

      const onEnter = () => gsap.to(card, { y: -6, borderColor: '#10b981', duration: 0.3, ease: 'power2.out' });
      const onLeave = () => gsap.to(card, { y: 0, borderColor: 'var(--card-border, rgba(39, 39, 42, 1))', duration: 0.3, ease: 'power2.out' });

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      cleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header without badges */}
      <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          Campus & Virtual Event Infrastructure
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
          Integrated tools built specifically for handling registrations, on-site campus logistics, and jury evaluations.
        </p>
      </div>

      {/* 4 Clean Capability Cards with Anime.js Micro-Simulations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Digital Passes */}
        <div
          ref={(el) => (cardsRef.current[0] = el)}
          className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">LIVE SCAN</span>
            </div>

            {/* Anime.js Laser Scan Simulation */}
            <div className="relative h-16 w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-2.5 overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800/60 flex items-center justify-center text-zinc-400">
                  <ScanLine className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">#HKH-9281</div>
                  <div className="text-[9px] text-emerald-500">Fast-Track Gate 1</div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />

              {/* Animated Laser Line */}
              <div
                ref={laserRef}
                className="absolute left-0 right-0 top-1 h-[2px] bg-emerald-400 shadow-[0_0_8px_#10b981] pointer-events-none"
              />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Automated Digital Passes
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                Encrypted QR badges with offline-capable verification at campus checkpoints and security gates.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Meal Coupons */}
        <div
          ref={(el) => (cardsRef.current[1] = el)}
          className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">FOOD TOKENS</span>
            </div>

            {/* Anime.js Meal Token Simulation */}
            <div className="h-16 w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-2.5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">Midnight Fuel Pass</div>
                <div className="text-[9px] text-zinc-400">Breakfast • Lunch • Dinner</div>
              </div>
              <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-bold">
                VALID
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Cafeteria Meal Tokens
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                Single-tap digital food coupons preventing queue congestion and duplicate claims in dining halls.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Hostel Allocations */}
        <div
          ref={(el) => (cardsRef.current[2] = el)}
          className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                <Hotel className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">BLOCK ALLOCATION</span>
            </div>

            {/* Anime.js Bed Occupancy Matrix Simulation */}
            <div className="h-16 w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Block B (Wing 3)</span>
                <span className="text-emerald-400 font-mono">92% Filled</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    ref={(el) => (dotsRef.current[i] = el)}
                    className="flex-1 h-3 rounded-sm bg-emerald-500/80"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hostel & Bed Allocations
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                Intelligent squad-based room grouping, gender-segregated dorms, and instant key issuance tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Multi-Round Scoring */}
        <div
          ref={(el) => (cardsRef.current[3] = el)}
          className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-5 shadow-sm hover:shadow-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">JURY RUBRICS</span>
            </div>

            {/* Anime.js Scoring Bar Simulation */}
            <div className="h-16 w-full rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-2.5 flex flex-col justify-center space-y-1.5">
              <div>
                <div className="flex justify-between text-[10px] text-zinc-300 pb-0.5">
                  <span>Architecture</span>
                  <span className="text-emerald-400 font-mono">98%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div ref={progressBar1Ref} className="h-full bg-emerald-400 rounded-full w-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-zinc-300 pb-0.5">
                  <span>Innovation</span>
                  <span className="text-emerald-400 font-mono">94%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div ref={progressBar2Ref} className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Round Scoring
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                Weighted scoring rubrics, blind judging parameters, and automated live bounty leaderboards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
