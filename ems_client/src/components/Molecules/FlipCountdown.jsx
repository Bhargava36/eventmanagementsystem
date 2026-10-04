import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Precision Time Segment
 * Renders a clean, official digit card with smooth, non-blocking motion.
 */
const TimeSegment = ({ value, label, isAccent = false }) => {
  const formattedVal = String(Math.max(0, value || 0)).padStart(2, '0');

  return (
    <div
      className={`flex flex-col items-center justify-center min-w-[58px] sm:min-w-[68px] px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border transition-colors duration-200 select-none ${
        isAccent
          ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
          : 'bg-white dark:bg-[#111115] border-slate-200/90 dark:border-zinc-800 shadow-sm'
      }`}
    >
      {/* Number Display with smooth micro-nudge */}
      <div className="h-8 sm:h-9 flex items-center justify-center overflow-hidden">
        <motion.span
          key={formattedVal}
          initial={{ opacity: 0.5, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={`font-mono text-2xl sm:text-3xl font-black tracking-tight tabular-nums leading-none ${
            isAccent
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {formattedVal}
        </motion.span>
      </div>

      {/* Segment Label */}
      <span
        className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-widest mt-1 ${
          isAccent
            ? 'text-emerald-700/90 dark:text-emerald-400/90'
            : 'text-slate-600 dark:text-zinc-300'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Subtle Official Colon Separator
 */
const ColonSeparator = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 h-12 sm:h-14 px-0.5 select-none self-center">
    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
  </div>
);

/**
 * Official Smooth Countdown Display
 * Self-manages its timer so parent pages NEVER re-render on every tick.
 */
export default function FlipCountdown({ targetDate, timeLeft: externalTimeLeft }) {
  const [internalTimeLeft, setInternalTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      try {
        const target = new Date(targetDate).getTime();
        const now = Date.now();
        const diff = target - now;

        if (isNaN(diff) || diff <= 0) {
          setInternalTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        setInternalTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } catch (e) {
        console.error('Countdown error:', e);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const tl = targetDate ? internalTimeLeft : (externalTimeLeft || internalTimeLeft);

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-slate-100/90 dark:bg-[#09090c] border border-slate-200/90 dark:border-zinc-800 shadow-inner backdrop-blur-sm">
      <TimeSegment value={tl.days} label="Days" />
      <ColonSeparator />
      <TimeSegment value={tl.hours} label="Hours" />
      <ColonSeparator />
      <TimeSegment value={tl.minutes} label="Mins" />
      <ColonSeparator />
      <TimeSegment value={tl.seconds} label="Secs" isAccent={true} />
    </div>
  );
}
