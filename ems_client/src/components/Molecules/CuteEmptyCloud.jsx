import React from 'react';
import { motion } from 'framer-motion';
import { Search, RotateCcw, Compass } from 'lucide-react';
import useTheme from '../../Hooks/useTheme';

function CuteEmptyCloud({ searchTerm, hasActiveFilters, onReset, onQuickSearch }) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm"
    >
      <div className="relative w-52 h-40 mx-auto flex items-center justify-center select-none">
        <svg
          viewBox="0 0 200 150"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cloudGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
            <linearGradient id="cloudGradLight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <motion.ellipse
            cx="100"
            cy="132"
            rx="54"
            ry="7"
            className="fill-slate-300 dark:fill-black"
            animate={{
              rx: [54, 46, 54, 60, 54],
              opacity: [0.25, 0.12, 0.25, 0.35, 0.25]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.g
            animate={{
              y: [0, -7, 0, 7, 0],
              rotate: [0, -1.5, 0, 1.5, 0]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path
              d="M 50 96 
                 C 32 96 22 82 25 66 
                 C 28 50 43 44 54 49 
                 C 59 32 80 20 102 24 
                 C 119 28 132 40 135 54 
                 C 146 46 164 49 171 63 
                 C 178 79 170 96 150 96 
                 Z"
              fill={theme === 'dark' ? 'url(#cloudGradDark)' : 'url(#cloudGradLight)'}
              stroke={theme === 'dark' ? '#3f3f46' : '#cbd5e1'}
              strokeWidth="2.5"
              strokeLinejoin="round"
              filter="url(#softGlow)"
            />

            <motion.path
              d="M 68 56 Q 74 53 80 57"
              stroke={theme === 'dark' ? '#a1a1aa' : '#64748b'}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={{ y: [0, -1, 0, 1, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 120 57 Q 126 53 132 56"
              stroke={theme === 'dark' ? '#a1a1aa' : '#64748b'}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={{ y: [0, -1, 0, 1, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <g transform="translate(74, 67)">
              <motion.g
                animate={{
                  scaleY: [1, 1, 1, 0.1, 1, 1, 1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.45, 0.48, 0.5, 0.52, 0.55, 0.9, 1]
                }}
              >
                <circle cx="0" cy="0" r="5" className="fill-slate-800 dark:fill-zinc-100" />
                <circle cx="-1.5" cy="-1.5" r="1.6" fill="#ffffff" />
              </motion.g>
            </g>

            <g transform="translate(126, 67)">
              <motion.g
                animate={{
                  scaleY: [1, 1, 1, 0.1, 1, 1, 1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.45, 0.48, 0.5, 0.52, 0.55, 0.9, 1]
                }}
              >
                <circle cx="0" cy="0" r="5" className="fill-slate-800 dark:fill-zinc-100" />
                <circle cx="-1.5" cy="-1.5" r="1.6" fill="#ffffff" />
              </motion.g>
            </g>

            <motion.ellipse
              cx="63"
              cy="73"
              rx="4.5"
              ry="3"
              className="fill-rose-400/60 dark:fill-rose-500/50"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.ellipse
              cx="137"
              cy="73"
              rx="4.5"
              ry="3"
              className="fill-rose-400/60 dark:fill-rose-500/50"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.path
              d="M 94 77 Q 100 71 106 77"
              stroke={theme === 'dark' ? '#d4d4d8' : '#475569'}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  "M 94 77 Q 100 71 106 77",
                  "M 94 78 Q 100 73 106 78",
                  "M 94 77 Q 100 71 106 77"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.path
              d="M 70 82 C 70 82 66 89 66 92 C 66 95 68 97 70.5 97 C 73 97 75 95 75 92 C 75 89 70 82 70 82 Z"
              fill="#38bdf8"
              animate={{
                y: [0, 26],
                opacity: [0, 0.85, 0],
                scale: [0.6, 1, 0.8]
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeIn"
              }}
            />

            <motion.g
              animate={{
                rotate: [-6, 6, -6],
                y: [-2, 2, -2]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="origin-center"
            >
              <circle
                cx="156"
                cy="44"
                r="11"
                fill={theme === 'dark' ? '#18181b' : '#ffffff'}
                stroke="#10b981"
                strokeWidth="2.5"
              />
              <line
                x1="164"
                y1="52"
                x2="174"
                y2="62"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 152 40 A 5 5 0 0 1 157 39"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>
          </motion.g>
        </svg>
      </div>

      <div className="space-y-2 mt-2">
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          No Matches Found
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {searchTerm ? (
            <>
              Our cloud searched everywhere, but found zero events matching{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                "{searchTerm}"
              </span>
              .
            </>
          ) : (
            'Our cloud searched everywhere, but no events matched your selected filter criteria.'
          )}
        </p>
      </div>

      <div className="pt-4 flex flex-col items-center gap-3">
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all duration-200 active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}

        {onQuickSearch && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mr-1 flex items-center gap-1">
              <Compass className="h-3 w-3" />
              Try exploring:
            </span>
            {['Hackathon', 'Coding', 'Innovation', 'AI'].map((term) => (
              <button
                key={term}
                onClick={() => onQuickSearch(term)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CuteEmptyCloud;
