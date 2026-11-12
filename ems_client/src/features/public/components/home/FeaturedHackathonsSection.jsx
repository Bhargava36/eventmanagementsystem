import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Camera,
  Trophy,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Monitor,
  Layers,
  Code2,
  Wrench,
  Video,
  Mic,
  Presentation,
  Users,
  RefreshCw,
} from 'lucide-react';
import {
  getEventTypeInfo,
  normalizeHackathonMode,
} from '../../../../lib/utils';

// Stepped folder-tab surface with subtle top contour stroke for clean light/dark separation
const SteppedTabShape = () => (
  <div className="absolute inset-0 pointer-events-none">
    <svg
      viewBox="0 0 360 60"
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 h-[60px] w-full"
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
        className="fill-white dark:fill-black"
      />
      <path
        d="M 0 0.75
           L 165 0.75
           C 182 0.75, 192 10.75, 192 24
           L 192 34
           C 192 47.25, 202 57.25, 218 57.25
           L 360 57.25"
        fill="none"
        className="stroke-slate-200 dark:stroke-zinc-800"
        strokeWidth="1.25"
      />
    </svg>
    <div className="absolute inset-x-0 top-[58px] bottom-0 bg-white dark:bg-black" />
  </div>
);

function getEventPosterUrl(posters) {
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
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

function formatDateRange(start, end) {
  if (!start) return 'Schedule TBA';
  try {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) return 'Schedule TBA';
    const s = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    if (!end) return s;
    const endDate = new Date(end);
    if (isNaN(endDate.getTime())) return s;
    const sameDay =
      startDate.getFullYear() === endDate.getFullYear() &&
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getDate() === endDate.getDate();
    if (sameDay) return s;
    const e = endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return `${s} – ${e}`;
  } catch {
    return 'Schedule TBA';
  }
}

function formatPrize(event) {
  const raw = event?.PrizeMoney || event?.PhysicalPrizeMoney || event?.VirtualPrizeMoney;
  if (!raw) return null;
  const str = String(raw).trim();
  const num = Number(str.replace(/[^0-9.-]+/g, ''));
  if (!isNaN(num) && num > 0) return `₹${num.toLocaleString('en-IN')}`;
  return str || null;
}

function resolveModeLabel(event) {
  const raw = String(event?.HackathonMode || '').trim().toLowerCase();
  if (raw === 'hybrid') return 'Hybrid';
  const normalized = normalizeHackathonMode(event?.HackathonMode, event?.Location);
  if (normalized === 'both') return 'Virtual & Physical';
  if (normalized === 'virtual') return 'Virtual';
  return 'On-Campus';
}

function getEventIcon(typeInfo) {
  if (typeInfo.isWebinar) return Video;
  if (typeInfo.isWorkshop) return Wrench;
  if (typeInfo.isSeminar) return Mic;
  if (typeInfo.isProjectExpo) return Presentation;
  if (typeInfo.isAlumni) return Users;
  if (typeInfo.isCodingContest) return Code2;
  return Layers;
}

function getStatusRank(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'ongoing') return 0;
  if (s === 'upcoming') return 1;
  return 2;
}

export default function FeaturedHackathonsSection() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const fetchEventsFromApi = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/events`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || 'Unable to load events');
    }
    return Array.isArray(data?.events) ? data.events : [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchEventsFromApi()
      .then((list) => {
        if (!cancelled) {
          setEvents(list);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Unable to connect to events service');
          setEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchEventsFromApi]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchEventsFromApi();
      setEvents(list);
    } catch (err) {
      setError(err?.message || 'Unable to connect to events service');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const featuredEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const rankDiff = getStatusRank(a.EventStatus) - getStatusRank(b.EventStatus);
        if (rankDiff !== 0) return rankDiff;
        const timeA = new Date(a.StartDate || 0).getTime() || 0;
        const timeB = new Date(b.StartDate || 0).getTime() || 0;
        return getStatusRank(a.EventStatus) === 1 ? timeA - timeB : timeB - timeA;
      })
      .slice(0, 3);
  }, [events]);

  return (
    <section
      id="arena"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full md:max-w-[80%] mx-auto scroll-mt-20 selection:bg-emerald-500 selection:text-white"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14"
      >
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Flagship Events
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Upcoming and live collegiate competitions, project expos, workshops, and campus events.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors self-start md:self-auto group shrink-0"
        >
          <span>Explore all events</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </Link>
      </motion.div>

      {/* Loading Skeletons matching the folder card height */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="rounded-[28px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black h-[480px] p-6 flex flex-col justify-between animate-pulse"
            >
              <div className="h-36 rounded-2xl bg-slate-100 dark:bg-zinc-900" />
              <div className="space-y-3 pt-4">
                <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-7 w-4/5 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-4 w-full rounded bg-slate-100 dark:bg-zinc-900" />
                <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-zinc-900" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-10 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Could not load featured events
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : featuredEvents.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-10 text-center space-y-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Events Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Upcoming campus competitions, expos, workshops, and alumni meets published by organizers will appear here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/events"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
            >
              Browse Events
            </Link>
            <Link
              to="/admin/login"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50 text-xs font-semibold transition-colors"
            >
              Organizer Sign In
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.map((event, idx) => {
            const posterUrl = getEventPosterUrl(event.Posters);
            const hasValidPoster = Boolean(posterUrl && !brokenImages[event.Id || idx]);
            const prize = formatPrize(event);
            const cardNum = String(idx + 1).padStart(2, '0');
            const typeInfo = getEventTypeInfo(event.EventType);
            const TypeIcon = getEventIcon(typeInfo);
            const modeLabel = resolveModeLabel(event);
            const isVirtualOnly = modeLabel === 'Virtual';

            return (
              <motion.article
                key={event.Id || idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => navigate(`/events/${event.Id}`)}
                className="group relative rounded-[28px] overflow-hidden cursor-pointer bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 h-[480px] select-none"
              >
                {/* TOP VISUAL LAYER (Full-bleed poster or recessed architectural fallback behind stepped tab) */}
                <div className="absolute inset-x-0 top-0 h-[275px] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900/45">
                  {hasValidPoster ? (
                    <div className="relative w-full h-full">
                      <img
                        src={posterUrl}
                        alt={event.EventName}
                        onError={() =>
                          setBrokenImages((prev) => ({ ...prev, [event.Id || idx]: true }))
                        }
                        className="w-full h-full object-cover object-center will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    </div>
                  ) : (
                    /* Clean, theme-faithful fallback visual when no poster exists or image fails to load */
                    <div className="relative w-full h-full bg-slate-50 dark:bg-zinc-900/50 flex flex-col justify-between p-6 pb-20 overflow-hidden">
                      <div className="relative z-10 flex items-center justify-center gap-4 will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                        <div className="flex flex-col items-center justify-center shrink-0 text-emerald-600/50 dark:text-orange-400/50">
                          <Camera className="w-28 h-25" />

                          <p>No image Source Found</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SLIDING STEPPED FOLDER TAB (GPU transform instead of height reflow for smooth slide) */}
                <div className="absolute inset-x-0 top-[104px] h-[520px] z-20 will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-[96px]">
                  <SteppedTabShape />

                  {/* Stepped Shelf Header: Big Index on Left Tab + Arrow on Right Shelf */}
                  <div className="relative z-10 px-6 pt-2 flex items-start justify-between">
                    <div className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white select-none leading-none pt-1 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {cardNum}
                    </div>
                    <div className="pt-[60px] pr-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 dark:text-white transition-all duration-300 ease-out group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="w-5 h-5 stroke-[2.25]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ANCHORED BOTTOM CONTENT AREA (Always readable, cleanly aligned, 1-line truncated heading) */}
                <div className="relative z-30 h-full flex flex-col justify-end px-6 pb-6 pointer-events-none">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      {/* Clean Metadata Line: Event Type + Format */}
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <span className="truncate">{typeInfo.label}</span>
                        <span className="inline-flex items-center gap-1 text-slate-500 dark:text-zinc-400 shrink-0 normal-case">
                          {isVirtualOnly ? (
                            <Monitor className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <MapPin className="w-3 h-3 text-emerald-500" />
                          )}
                          <span>{modeLabel}</span>
                        </span>
                      </div>

                      {/* Event Title — strictly single-line truncated for uniform rhythm */}
                      <h3
                        title={event.EventName}
                        className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 truncate leading-snug"
                      >
                        {event.EventName}
                      </h3>

                      {/* Concise Description — clamped to 2 lines */}
                      {event.Description ? (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed min-h-[2.45rem]">
                          {event.Description}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-500 line-clamp-2 leading-relaxed min-h-[2.45rem]">
                          {event.Location ? `Hosted at ${event.Location}` : 'View schedule and participation guidelines.'}
                        </p>
                      )}
                    </div>

                    {/* Bottom Telemetry Row: Smooth GPU-friendly expand on hover */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]">
                      <div className="overflow-hidden">
                        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 truncate">
                            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{formatDateRange(event.StartDate, event.EndDate)}</span>
                          </div>
                          {prize ? (
                            <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Trophy className="w-3.5 h-3.5" />
                              <span>{prize}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 shrink-0">
                              {event.EventStatus || 'Upcoming'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
