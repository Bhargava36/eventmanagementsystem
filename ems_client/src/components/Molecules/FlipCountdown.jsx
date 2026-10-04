import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Single Flip Card Component
 * Uses the gold-standard 200% height container split technique so the top and bottom
 * halves seamlessly slice the digit with zero alignment drift.
 */
const FlipCard = ({ value, label, isAccent = false }) => {
  const formattedVal = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3D Flip Card Container */}
      <div
        className={`relative w-14 sm:w-16 h-16 sm:h-20 rounded-xl overflow-hidden shadow-md flex items-center justify-center border transition-all duration-200 ${
          isAccent
            ? 'bg-[#06130e] border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
            : 'bg-slate-100 dark:bg-[#121215] border-slate-300 dark:border-zinc-800 shadow-sm'
        }`}
        style={{ perspective: '600px' }}
      >
        {/* Animated digit with 3D flip effect on change */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={formattedVal}
            initial={{ rotateX: -65, opacity: 0, scale: 0.96 }}
            animate={{ rotateX: 0, opacity: 1, scale: 1 }}
            exit={{ rotateX: 65, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
            className="w-full h-full relative transform-gpu"
          >
            {/* ── TOP HALF ── */}
            <div
              className={`absolute inset-x-0 top-0 h-1/2 overflow-hidden border-b ${
                isAccent
                  ? 'bg-emerald-50 dark:bg-[#0c221a] text-emerald-700 dark:text-emerald-400 border-emerald-500/20 dark:border-black/60'
                  : 'bg-slate-100 dark:bg-[#1c1c22] text-slate-900 dark:text-zinc-100 border-black/10 dark:border-black/60'
              }`}
            >
              {/* Inner container 200% card height pinned to top */}
              <div className="absolute top-0 inset-x-0 h-[200%] flex items-center justify-center">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums">
                  {formattedVal}
                </span>
              </div>
              {/* Top glass sheen */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/60 dark:bg-white/10" />
            </div>

            {/* ── BOTTOM HALF ── */}
            <div
              className={`absolute inset-x-0 bottom-0 h-1/2 overflow-hidden ${
                isAccent
                  ? 'bg-emerald-100 dark:bg-[#071711] text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-200 dark:bg-[#141418] text-slate-900 dark:text-zinc-100'
              }`}
            >
              {/* Inner container 200% card height pinned to bottom */}
              <div className="absolute bottom-0 inset-x-0 h-[200%] flex items-center justify-center">
                <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums">
                  {formattedVal}
                </span>
              </div>
              {/* Bottom inner shadow */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/5 dark:bg-black/40" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Center Split Horizontal Crease Line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-[0.5px] h-[1.5px] bg-slate-900/20 dark:bg-black/90 z-20 pointer-events-none shadow-[0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]" />

        {/* Left Side Pin Notch Cutout */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2.5 rounded-r-full bg-slate-200 dark:bg-[#09090b] border-r border-slate-300 dark:border-zinc-700 z-30" />

        {/* Right Side Pin Notch Cutout */}
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2.5 rounded-l-full bg-slate-200 dark:bg-[#09090b] border-l border-slate-300 dark:border-zinc-700 z-30" />
      </div>

      {/* Unit Micro Label */}
      <span
        className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-2 ${
          isAccent
            ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
            : 'text-slate-500 dark:text-zinc-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Animated Dual LED Colon Separator
 */
const FlipSeparator = () => (
  <div className="flex flex-col items-center justify-center gap-2 h-16 sm:h-20 px-0.5 sm:px-1 select-none">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
    <span className="text-[9px] opacity-0 mt-2 select-none">.</span>
  </div>
);

/**
 * FlipCountdown Main Component
 */
export default function FlipCountdown({ timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 } }) {
  return (
    <div className="flex items-start gap-1.5 sm:gap-2">
      <FlipCard value={timeLeft.days} label="Days" />
      <FlipSeparator />
      <FlipCard value={timeLeft.hours} label="Hours" />
      <FlipSeparator />
      <FlipCard value={timeLeft.minutes} label="Mins" />
      <FlipSeparator />
      <FlipCard value={timeLeft.seconds} label="Secs" isAccent={true} />
    </div>
  );
}
