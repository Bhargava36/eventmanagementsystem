import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import useTheme from '../../../Hooks/useTheme';

function NotFound() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isPetted, setIsPetted] = useState(false);

  const handleMascotClick = () => {
    setIsPetted(true);
    setTimeout(() => {
      setIsPetted(false);
    }, 2400);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center pt-24 sm:pt-28 pb-20 px-4 sm:px-6 select-none">
      <div className="max-w-xl w-full text-center space-y-7">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2.5"
        >
          <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            ERROR 404
          </span>
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
            •
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 tracking-wide">
            {isPetted ? 'Byte is so happy!' : 'Lost in the venue!'}
          </span>
        </motion.div>

        <div className="relative w-64 h-56 mx-auto flex items-center justify-center cursor-pointer" onClick={handleMascotClick}>
          
          <AnimatePresence>
            {isPetted && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-3 z-30 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 pointer-events-none whitespace-nowrap"
              >
                <span>Beep boop! You found me! (◕‿◕)</span>
              </motion.div>
            )}
          </AnimatePresence>

          <svg
            viewBox="0 0 240 200"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="botChassisDark" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#27272a" />
                <stop offset="100%" stopColor="#18181b" />
              </linearGradient>
              <linearGradient id="botChassisLight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>

              <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#09090b" />
                <stop offset="100%" stopColor="#040405" />
              </linearGradient>

              <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </radialGradient>
            </defs>

            <motion.ellipse
              cx="120"
              cy="182"
              rx="48"
              ry="7"
              className="fill-slate-300 dark:fill-black"
              animate={{
                rx: isPetted ? [48, 38, 48] : [48, 40, 48, 54, 48],
                opacity: [0.25, 0.12, 0.25, 0.35, 0.25]
              }}
              transition={{
                duration: isPetted ? 0.6 : 3.6,
                repeat: isPetted ? 1 : Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.g
              animate={
                isPetted
                  ? {
                      y: [0, -22, 0, -10, 0],
                      rotate: [0, -10, 10, -5, 0]
                    }
                  : {
                      y: [0, -9, 0, 9, 0],
                      rotate: [0, -2, 0, 2, 0]
                    }
              }
              transition={
                isPetted
                  ? { duration: 0.8, ease: "easeOut" }
                  : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
              }
              className="origin-bottom"
            >
              <line x1="120" y1="42" x2="120" y2="22" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <motion.circle
                cx="120"
                cy="18"
                r="7"
                fill="url(#beaconGlow)"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <rect
                x="64"
                y="65"
                width="8"
                height="18"
                rx="3"
                className="fill-slate-400 dark:fill-zinc-700"
              />
              <rect
                x="168"
                y="65"
                width="8"
                height="18"
                rx="3"
                className="fill-slate-400 dark:fill-zinc-700"
              />

              <rect
                x="70"
                y="40"
                width="100"
                height="74"
                rx="22"
                fill={theme === 'dark' ? 'url(#botChassisDark)' : 'url(#botChassisLight)'}
                stroke={theme === 'dark' ? '#3f3f46' : '#cbd5e1'}
                strokeWidth="2.5"
              />

              <rect
                x="79"
                y="49"
                width="82"
                height="56"
                rx="14"
                fill="url(#screenGrad)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              {isPetted ? (
                <g>
                  <path
                    d="M 93 72 C 93 64 105 64 105 72"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 135 72 C 135 64 147 64 147 72"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse cx="88" cy="80" rx="4" ry="2.5" fill="#f43f5e" opacity="0.8" />
                  <ellipse cx="152" cy="80" rx="4" ry="2.5" fill="#f43f5e" opacity="0.8" />
                  <path
                    d="M 115 84 Q 120 90 125 84"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>
              ) : (
                <g>
                  <motion.g
                    animate={{
                      scaleY: [1, 1, 1, 0.1, 1, 1, 1]
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      times: [0, 0.45, 0.48, 0.5, 0.53, 0.8, 1]
                    }}
                  >
                    <circle cx="98" cy="72" r="6" fill="#10b981" />
                    <circle cx="96" cy="70" r="2" fill="#ffffff" />
                    <circle cx="142" cy="72" r="6" fill="#10b981" />
                    <circle cx="140" cy="70" r="2" fill="#ffffff" />
                  </motion.g>

                  <ellipse cx="87" cy="80" rx="3.5" ry="2" fill="#fb7185" opacity="0.6" />
                  <ellipse cx="153" cy="80" rx="3.5" ry="2" fill="#fb7185" opacity="0.6" />

                  <motion.path
                    d="M 116 84 Q 120 80 124 84"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    animate={{
                      d: [
                        "M 116 84 Q 120 80 124 84",
                        "M 116 85 Q 120 82 124 85",
                        "M 116 84 Q 120 80 124 84"
                      ]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </g>
              )}

              <rect
                x="82"
                y="120"
                width="76"
                height="44"
                rx="16"
                fill={theme === 'dark' ? 'url(#botChassisDark)' : 'url(#botChassisLight)'}
                stroke={theme === 'dark' ? '#3f3f46' : '#cbd5e1'}
                strokeWidth="2.5"
              />

              <g transform="translate(104, 134)">
                <rect x="0" y="0" width="32" height="12" rx="4" className="fill-slate-200 dark:fill-zinc-800" />
                <motion.rect
                  x="2"
                  y="2"
                  width="18"
                  height="8"
                  rx="3"
                  className="fill-emerald-500"
                  animate={{ width: [10, 28, 10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </g>

              <g transform="translate(54, 126)">
                <motion.g
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <rect x="0" y="0" width="22" height="28" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="4" y1="6" x2="18" y2="6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="4" y1="11" x2="15" y2="11" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                  <text x="7" y="22" fill="#ef4444" fontSize="11" fontWeight="bold">?</text>
                </motion.g>
              </g>

              <g transform="translate(162, 130)">
                <motion.path
                  d="M 2 4 C 12 4 18 14 16 22"
                  stroke={theme === 'dark' ? '#52525b' : '#94a3b8'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </g>

              <motion.g
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="origin-center"
              >
                <circle cx="178" cy="36" r="10" className="fill-amber-400" />
                <text x="174" y="41" fill="#78350f" fontSize="14" fontWeight="black">?</text>
              </motion.g>
            </motion.g>
          </svg>
        </div>

        <div className="space-y-2.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Oops! Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Byte searched everywhere, but this page doesn't exist or was moved.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default NotFound;
