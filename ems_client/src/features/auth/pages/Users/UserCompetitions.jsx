import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ByteEmptyState from '../../../../components/Molecules/ByteEmptyState';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Clock,
  Tag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

/* ── dot-pulse (shared style, injected once) ── */
const DotStyle = () => (
  <style>{`
    @keyframes ucDotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.55); }
    }
    .uc-dp1 { animation: ucDotPulse 1.8s ease-in-out infinite; }
    .uc-dp2 { animation: ucDotPulse 1.8s ease-in-out 0.32s infinite; }
    .uc-dp3 { animation: ucDotPulse 1.8s ease-in-out 0.64s infinite; }
  `}</style>
);

const CardDots = () => (
  <span className="flex items-center gap-[3px] shrink-0">
    <span className="uc-dp1 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
    <span className="uc-dp2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
    <span className="uc-dp3 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
  </span>
);

const FILTERS = [
  { k: 'all',      l: 'All'      },
  { k: 'dual',     l: 'Dual Track' },
  { k: 'upcoming', l: 'Upcoming' },
  { k: 'live',     l: 'Live'     },
];

export default function UserCompetitions() {
  const navigate = useNavigate();

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res  = await fetch('http://localhost:3000/api/events');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setEvents(data.events || []);
    } catch (e) {
      setError(e.message || 'Unable to connect to events service.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const filteredEvents = useMemo(() => events.filter(ev => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      (ev.EventName   || '').toLowerCase().includes(q) ||
      (ev.EventType   || '').toLowerCase().includes(q) ||
      (ev.Location    || '').toLowerCase().includes(q) ||
      (ev.Description || '').toLowerCase().includes(q);
    if (!matchQ) return false;
    const mode   = (ev.HackathonMode || '').toLowerCase();
    const status = (ev.EventStatus   || '').toLowerCase();
    if (filter === 'dual')     return mode === 'both' || mode === 'virtual and physical';
    if (filter === 'upcoming') return status === 'upcoming';
    if (filter === 'live')     return status === 'live' || status === 'ongoing';
    return true;
  }), [events, search, filter]);

  const hasActiveFilters = filter !== 'all' || search.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      <DotStyle />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pb-6 border-b border-slate-200 dark:border-zinc-800"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            Explore
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Competitions &amp; Hackathons
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Browse all open tracks, check prize pools and register your team.
          </p>
        </motion.div>

        {/* ── SEARCH + FILTER BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          {/* search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, type, location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-sm transition-colors"
            />
          </div>

          {/* filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm self-start sm:self-auto">
            {FILTERS.map(t => (
              <button
                key={t.k}
                onClick={() => setFilter(t.k)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === t.k
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* event count */}
          <span className="text-xs text-slate-400 dark:text-zinc-500 self-center whitespace-nowrap">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </motion.div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="py-24 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">Loading events…</p>
          </div>
        ) : error ? (
          <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/40 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
            <ByteEmptyState
              searchTerm={search}
              hasActiveFilters={hasActiveFilters}
              onReset={() => { setSearch(''); setFilter('all'); }}
              onQuickSearch={(term) => setSearch(term)}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-5"
          >
            {filteredEvents.map((ev, idx) => {
              const isDual     = ev.HackathonMode === 'Both' || ev.HackathonMode === 'Virtual and Physical';
              const prize      = ev.PrizeMoney || ev.PhysicalPrizeMoney || ev.VirtualPrizeMoney;
              const statusL    = (ev.EventStatus || '').toLowerCase();
              const isLive     = statusL === 'live' || statusL === 'ongoing';
              const isUpcoming = statusL === 'upcoming';

              return (
                <motion.div
                  key={ev.Id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                >
                  <div className="p-6 sm:p-7 space-y-5 flex-1">

                    {/* badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Live
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Clock className="h-3 w-3" /> Upcoming
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                          <Tag className="h-3 w-3 text-emerald-500" />
                          {ev.EventType || 'Hackathon'}
                        </span>
                        {isDual && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                            Dual Track
                          </span>
                        )}
                      </div>
                      <CardDots />
                    </div>

                    {/* title + desc */}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                        {ev.EventName}
                      </h2>
                      {ev.Description && (
                        <p className="mt-1.5 text-sm text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                          {ev.Description}
                        </p>
                      )}
                    </div>

                    {/* meta grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(ev.StartDate || ev.EndDate) && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"><Calendar className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Dates</span>
                            <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{fmt(ev.StartDate)} – {fmt(ev.EndDate)}</span>
                          </div>
                        </div>
                      )}
                      {prize && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"><Trophy className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Prize Pool</span>
                            <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{prize}</span>
                          </div>
                        </div>
                      )}
                      {ev.Location && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"><MapPin className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Venue</span>
                            <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">{ev.Location}</span>
                          </div>
                        </div>
                      )}
                      {ev.TeamSize && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0"><Users className="h-4 w-4" /></div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Team Size</span>
                            <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">{ev.TeamSize} Members</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="px-6 sm:px-7 py-4 bg-slate-50/80 dark:bg-zinc-900/40 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/user/events/${ev.Id}`)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      Register Team <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/events/${ev.Id}`)}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </div>
    </div>
  );
}
