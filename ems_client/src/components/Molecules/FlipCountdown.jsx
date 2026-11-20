import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Precision Time Segment with Butter-Smooth 3D Rotating Flip
const TimeSegment = ({ value, label, isAccent = false, eventTheme = null }) => {
  const formattedVal = String(Math.max(0, value || 0)).padStart(2, '0');

  const accentBoxStyle = isAccent && eventTheme ? {
    backgroundColor: eventTheme.badgeBg,
    borderColor: eventTheme.badgeBorder,
  } : {};

  const accentTextStyle = isAccent && eventTheme ? {
    color: eventTheme.accent,
  } : {};

  return (
    <div
      style={accentBoxStyle}
      className={`flex flex-col items-center justify-center min-w-[46px] xs:min-w-[50px] sm:min-w-[58px] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-colors duration-200 select-none ${
        isAccent
          ? eventTheme
            ? 'shadow-xs'
            : 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/30 shadow-xs'
          : 'bg-white dark:bg-black border-slate-200/80 dark:border-zinc-800/80 shadow-xs'
      }`}
    >
      {/* 3D Perspective Flip Stage */}
      <div
        className="h-6 sm:h-7 flex items-center justify-center overflow-hidden relative"
        style={{ perspective: 400 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formattedVal}
            initial={{ rotateX: -75, opacity: 0, y: -8 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            exit={{ rotateX: 75, opacity: 0, y: 8 }}
            transition={{
              duration: 0.42,
              ease: [0.16, 1, 0.3, 1], // Butter-smooth fluid deceleration
            }}
            style={{
              ...accentTextStyle,
              transformOrigin: '50% 50%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className={`font-mono text-lg sm:text-xl font-bold tracking-tight tabular-nums leading-none inline-block ${
              isAccent
                ? eventTheme
                  ? ''
                  : 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formattedVal}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Segment Label matching platform metadata typography */}
      <span
        style={accentTextStyle}
        className={`text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-wider mt-0.5 ${
          isAccent
            ? eventTheme
              ? ''
              : 'text-emerald-600/90 dark:text-emerald-400/90'
            : 'text-slate-400 dark:text-zinc-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

// Clean Platform Colon Separator
const ColonSeparator = () => (
  <div className="flex flex-col items-center justify-center gap-1 sm:gap-1.5 h-6 sm:h-7 px-0.5 select-none self-center shrink-0">
    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
  </div>
);

// Official Countdown Display - Matches Event Cards Glassmorphism with Smooth 3D Flip Rotation
export default function FlipCountdown({ targetDate, timeLeft: externalTimeLeft, eventTheme = null }) {
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
    <div className="inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs backdrop-blur-sm max-w-full">
      <TimeSegment value={tl.days} label="Days" eventTheme={eventTheme} />
      <ColonSeparator />
      <TimeSegment value={tl.hours} label="Hours" eventTheme={eventTheme} />
      <ColonSeparator />
      <TimeSegment value={tl.minutes} label="Mins" eventTheme={eventTheme} />
      <ColonSeparator />
      <TimeSegment value={tl.seconds} label="Secs" isAccent={true} eventTheme={eventTheme} />
    </div>
  );
}
