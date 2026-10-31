import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react';
import { getEventTypeInfo } from '../../../../lib/utils';

/**
 * SteppedTabShape
 * Separate fixed-geometry contour cap (top 60px) + body fill.
 * Guaranteed pixel-perfect curves that never stretch or distort during height transitions.
 */
const SteppedTabShape = ({ className = "" }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    {/* Stepped Contour Cap (Fixed 60px height) */}
    <svg
      viewBox="0 0 360 60"
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 h-[60px] w-full fill-current"
    >
      <path
        d="M 0 0 
           L 165 0 
           C 182 0, 192 10, 192 24 
           L 192 34 
           C 192 48, 202 58, 218 58 
           L 360 58 
           L 360 60 
           L 0 60 
           Z"
      />
    </svg>
    {/* Solid Body Fill from y=58px to bottom */}
    <div className="absolute inset-x-0 top-[58px] bottom-0 bg-current" />
  </div>
);

export default function FeaturedHackathonsSection() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState({});

  // Unified fallback events
  const defaultEvents = [
    {
      Id: 'evt-1',
      EventName: 'HackMatrix 2026: AI & Systems',
      Description: 'Build high-throughput autonomous agents, edge computing rails, and real-time distributed pipelines.',
      StartDate: '2026-10-09',
      EndDate: '2026-10-11',
      HackathonMode: 'Hybrid',
      PrizeMoney: '₹2,50,000',
      EventType: 'Hackathon',
    },
    {
      Id: 'evt-2',
      EventName: 'NextGen Web3 & Security Summit',
      Description: 'Architect resilient smart contracts, decentralized privacy layers, and audited zero-knowledge protocols.',
      StartDate: '2026-10-16',
      EndDate: '2026-10-18',
      HackathonMode: 'Virtual',
      PrizeMoney: '₹1,50,000',
      EventType: 'Hackathon',
    },
    {
      Id: 'evt-3',
      EventName: 'CloudNative Turnstile Hackathon',
      Description: 'Scale zero-trust event infrastructure, biometric turnstiles, and sub-second attendance validation.',
      StartDate: '2026-10-24',
      EndDate: '2026-10-26',
      HackathonMode: 'Physical',
      PrizeMoney: '₹3,00,000',
      EventType: 'Hackathon',
    },
  ];

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/events`);
      const data = await res.json();
      if (res.ok && data.events && data.events.length > 0) {
        const loaded = data.events.slice(0, 3);
        if (loaded.length < 3) {
          setEvents([...loaded, ...defaultEvents.slice(loaded.length, 3)]);
        } else {
          setEvents(loaded);
        }
      } else {
        setEvents(defaultEvents);
      }
    } catch {
      setEvents(defaultEvents);
    } finally {
      setLoading(false);
    }
  };

  const getEventPosterUrl = (posters) => {
    if (!posters) return null;
    let url = null;
    if (Array.isArray(posters) && posters.length > 0) {
      url = typeof posters[0] === 'string' ? posters[0] : posters[0]?.url || null;
    } else if (typeof posters === 'string') {
      try {
        const parsed = JSON.parse(posters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          url = typeof parsed[0] === 'string' ? parsed[0] : parsed[0]?.url || null;
        } else {
          url = parsed;
        }
      } catch {
        url = posters;
      }
    }
    if (url && typeof url === 'string' && url.startsWith('/uploads')) {
      return `${API_BASE_URL}${url}`;
    }
    return url;
  };

  const formatDate = (start, end) => {
    if (!start) return '09–11 OCT';
    try {
      const s = new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      if (!end) return s;
      const e = new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return `${s} – ${e}`;
    } catch {
      return 'Upcoming Dates';
    }
  };

  return (
    <section
      id="arena"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20 selection:bg-emerald-500 selection:text-white"
    >
      {/* Section Header with Staggered Scroll Reveal */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16"
      >
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Flagship Events
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Curated high-stakes challenges designed for student squads, solo developers, and university chapters.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors self-start md:self-auto group"
          >
            <span>Explore all competitions</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </motion.div>

      {/* 3 Stepped Folder-Tab Cards with Cascading Scroll Reveals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, idx) => {
          const posterUrl = getEventPosterUrl(event.Posters);
          const rawPrize = event.PrizeMoney || event.PhysicalPrizeMoney || event.VirtualPrizeMoney;
          const prize = (() => {
            if (!rawPrize) return '₹2,50,000';
            const str = String(rawPrize).trim();
            const num = Number(str.replace(/[^0-9.-]+/g, ''));
            if (!isNaN(num) && num > 0) return `₹${num.toLocaleString('en-IN')}`;
            return str.startsWith('₹') ? str : `₹${str}`;
          })();

          const cardNum = String(idx + 1).padStart(2, '0');

          return (
            <motion.div
              key={event.Id || idx}
              initial={{ opacity: 0, y: 55, scale: 0.94, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{
                duration: 0.85,
                delay: idx * 0.16,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              onClick={() => navigate(`/events/${event.Id}`)}
              className="group relative rounded-[32px] overflow-hidden cursor-pointer bg-white dark:bg-black shadow-md hover:shadow-2xl transition-shadow duration-500 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white h-[500px] select-none"
            >
              {/* TOP VISUAL LAYER (Clean - NO pills on image, Expanded Height ~ 300px) */}
              <div className="absolute inset-x-0 top-0 h-[300px] w-full overflow-hidden bg-black">
                {posterUrl && !brokenImages[event.Id || idx] ? (
                  <div className="relative w-full h-full">
                    <img
                      src={posterUrl}
                      alt={event.EventName}
                      onError={() => setBrokenImages((prev) => ({ ...prev, [event.Id || idx]: true }))}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                ) : (
                  /* Unified AYOJAN Brand Theme Visual */
                  <div className="relative w-full h-full bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-black overflow-hidden flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105">
                    {/* Background grid */}
                    <div 
                      className="absolute inset-0 opacity-[0.15]"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(16, 185, 129, 0.3) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: "28px 28px",
                      }}
                    />
                    
                    {/* 3D Liquid Chrome Sculpture */}
                    <img
                      src="/assets/chrome_sculpture_card.jpg"
                      alt="AYOJAN Event Sculpture"
                      className="w-full h-full object-cover filter contrast-110 brightness-[0.95] mix-blend-screen opacity-85"
                    />

                    {/* Ambient Emerald Glow Beam */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent opacity-80" />
                  </div>
                )}
              </div>

              {/* STEPPED FOLDER TAB DRAWER */}
              {/* 
                - Pinned to bottom-0!
                - Resting height: h-[420px] (tab top at y=80px, text anchored at bottom).
                - Hover height: h-[280px] (tab top slides down to y=220px, image fully reveals).
                - Uses Pure White (#ffffff in light mode) and Pure Black (#000000 in dark mode)!
              */}
              <div 
                className="absolute inset-x-0 bottom-0 h-[420px] group-hover:h-[280px] z-20 flex flex-col justify-between text-white dark:text-black transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
              >
                {/* Stepped Tab SVG Path automatically adopting pure white / pure black */}
                <SteppedTabShape />

                {/* TAB HEADER (Big Number on Left + Clean Arrow ↗ on Right Shelf) */}
                <div className="relative z-10 px-6 pt-2 flex items-start justify-between">
                  {/* Big Stepped Number (01, 02, 03) */}
                  <div
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    className="text-5xl sm:text-6xl font-black tracking-tight text-black dark:text-white select-none leading-none pt-1 transition-colors duration-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                  >
                    {cardNum}
                  </div>

                  {/* Slanted Arrow ↗ on the Lower Right Shelf */}
                  <div className="pt-16 pr-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-black dark:text-white transition-all duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1">
                      <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* BOTTOM CONTENT AREA: Title, Description & Telemetry anchored to the bottom */}
                <div className="relative z-10 px-6 pb-6 pt-2 space-y-3">
                  <div>
                    <h3
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                      className="text-xl sm:text-2xl font-bold flex justify-between items-center tracking-tight text-black dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    >
                      {event.EventName}
                       <span className="text-xs bg-emerald-400/30 rounded-full px-3 py-1  border border-emerald-400 text-emerald-600 dark:text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{event.HackathonMode || 'Hybrid'}</span>


                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mt-1">
                      {event.Description || 'Collaborate with world-class crafters to build verifiable solutions.'}
                    </p>
                  </div>

                  {/* BOTTOM TELEMETRY STRIP (Date + Clean Mode Text + Prize) — Displays ONLY on Hover */}
                  <div className="overflow-hidden transition-all duration-400 ease-out max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100">
                    <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono select-none">
                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-black/70 dark:text-white/70">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{formatDate(event.StartDate, event.EndDate)}</span>
                      </div>

                      {/* Mode (Clean text, NO pill) */}
                      
                      {/* Prize */}
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{prize}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
