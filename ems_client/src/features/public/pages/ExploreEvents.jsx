import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WaveDots from '../../../components/Atoms/WaveDots';
import useTheme from '../../../Hooks/useTheme';
import ByteEmptyState from '../../../components/Molecules/ByteEmptyState';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Eye,
  ArrowRight,
  Clock,
  CheckCircle2,
  Monitor,
  Building2,
  Tag,
  X,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  Radio,
  Layers
} from 'lucide-react';

function ExploreEvents() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('date-asc');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await fetch('http://localhost:3000/api/events');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }

      setEvents(data.events || []);
    } catch (err) {
      setFetchError(err.message || 'Unable to connect to events service');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (e, event) => {
    e.stopPropagation();
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed?.role === 'user' || parsed?.Role === 'user' || parsed?.Id || parsed?.id) {
          navigate(`/user/events/${event.Id}`);
          return;
        }
      } catch (err) {
      }
    }
    navigate('/user/login', { state: { redirectTo: `/user/events/${event.Id}` } });
  };

  const eventTypes = useMemo(() => {
    const types = new Set();
    events.forEach((ev) => {
      if (ev.EventType) types.add(ev.EventType);
    });
    return Array.from(types);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !query ||
          (ev.EventName && ev.EventName.toLowerCase().includes(query)) ||
          (ev.Description && ev.Description.toLowerCase().includes(query)) ||
          (ev.Location && ev.Location.toLowerCase().includes(query)) ||
          (ev.EventType && ev.EventType.toLowerCase().includes(query));

        const modeNormalized = (ev.HackathonMode || '').toLowerCase();
        const matchesMode =
          selectedMode === 'ALL' ||
          (selectedMode === 'VIRTUAL' && modeNormalized === 'virtual') ||
          (selectedMode === 'PHYSICAL' && modeNormalized === 'physical') ||
          (selectedMode === 'VIRTUAL_AND_PHYSICAL' && (modeNormalized === 'virtual and physical' || modeNormalized === 'both')) ||
          (selectedMode === 'HYBRID' && modeNormalized === 'hybrid');

        const statusNormalized = (ev.EventStatus || '').toLowerCase();
        const matchesStatus =
          selectedStatus === 'ALL' ||
          (selectedStatus === 'UPCOMING' && statusNormalized === 'upcoming') ||
          (selectedStatus === 'ONGOING' && statusNormalized === 'ongoing') ||
          (selectedStatus === 'COMPLETED' && statusNormalized === 'completed');

        const matchesType =
          selectedType === 'ALL' ||
          ev.EventType?.toLowerCase() === selectedType.toLowerCase();

        return matchesSearch && matchesMode && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc') {
          return new Date(a.StartDate || 0) - new Date(b.StartDate || 0);
        }
        if (sortBy === 'date-desc') {
          return new Date(b.StartDate || 0) - new Date(a.StartDate || 0);
        }
        if (sortBy === 'name-asc') {
          return (a.EventName || '').localeCompare(b.EventName || '');
        }
        if (sortBy === 'team-asc') {
          return (parseInt(a.TeamSize, 10) || 0) - (parseInt(b.TeamSize, 10) || 0);
        }
        return 0;
      });
  }, [events, searchTerm, selectedMode, selectedStatus, selectedType, sortBy]);

  const stats = useMemo(() => {
    const total = events.length;
    const virtual = events.filter((e) => (e.HackathonMode || '').toLowerCase() === 'virtual').length;
    const physical = events.filter((e) => (e.HackathonMode || '').toLowerCase() === 'physical').length;
    const virtualAndPhysical = events.filter((e) => {
      const m = (e.HackathonMode || '').toLowerCase();
      return m === 'virtual and physical' || m === 'both';
    }).length;
    const hybrid = events.filter((e) => (e.HackathonMode || '').toLowerCase() === 'hybrid').length;
    const ongoing = events.filter((e) => (e.EventStatus || '').toLowerCase() === 'ongoing').length;

    return { total, virtual, physical, virtualAndPhysical, hybrid, ongoing };
  }, [events]);

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getEventPosterUrl = (posters) => {
    if (!posters) return null;
    if (Array.isArray(posters) && posters.length > 0) {
      return typeof posters[0] === 'string' ? posters[0] : posters[0]?.url || null;
    }
    if (typeof posters === 'string') {
      try {
        const parsed = JSON.parse(posters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch {
        return posters;
      }
    }
    return null;
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedMode('ALL');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setSortBy('date-asc');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedMode !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedType !== 'ALL';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070908] text-slate-900 dark:text-white pt-28 sm:pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white shadow-sm"
        >
          <WaveDots
            dotColor={theme === 'dark' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(16, 185, 129, 0.3)'}
            glowColor={theme === 'dark' ? 'bg-emerald-500/15' : 'bg-emerald-400/10'}
            className="absolute right-0 top-0 bottom-0 w-3/5 z-0"
          />

          <div className="relative z-10 max-w-2xl space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Explore Events
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
              Discover technical hackathons, coding challenges, and innovation competitions. Connect with teams and build solutions.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-slate-500 dark:text-zinc-400 font-mono">
              <div>
                <span className="text-slate-900 dark:text-white font-bold text-base mr-1.5">{stats.total}</span>
                <span>Events</span>
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800" />
              <div>
                <span className="text-slate-900 dark:text-white font-bold text-base mr-1.5">{stats.virtual}</span>
                <span>Virtual</span>
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800" />
              <div>
                <span className="text-slate-900 dark:text-white font-bold text-base mr-1.5">{stats.physical}</span>
                <span>Physical</span>
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800" />
              <div>
                <span className="text-slate-900 dark:text-white font-bold text-base mr-1.5">{stats.virtualAndPhysical}</span>
                <span>Virtual & Physical</span>
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800" />
              <div>
                <span className="text-slate-900 dark:text-white font-bold text-base mr-1.5">{stats.hybrid}</span>
                <span>Hybrid</span>
              </div>
              {stats.ongoing > 0 && (
                <>
                  <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800" />
                  <div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base mr-1.5">{stats.ongoing}</span>
                    <span>Live</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-400" />
              <input
                type="text"
                placeholder="Search events by title, description, or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-slate-500 dark:text-zinc-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="date-asc" className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">Soonest</option>
                  <option value="date-desc" className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">Latest</option>
                  <option value="name-asc" className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">Name</option>
                  <option value="team-asc" className="bg-white dark:bg-zinc-950 text-slate-900 dark:text-white">Team Size</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}

              <button
                onClick={fetchEvents}
                disabled={loading}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-zinc-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              Mode:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'VIRTUAL', label: 'Virtual' },
              { id: 'PHYSICAL', label: 'Physical' },
              { id: 'VIRTUAL_AND_PHYSICAL', label: 'Virtual & Physical' },
              { id: 'HYBRID', label: 'Hybrid' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedMode === m.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}

            <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800 mx-1.5 hidden sm:block" />

            <span className="text-slate-500 dark:text-zinc-500 mr-1 flex items-center gap-1 font-medium">
              Status:
            </span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'ONGOING', label: 'Live' },
              { id: 'COMPLETED', label: 'Concluded' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedStatus === s.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}

            {eventTypes.length > 0 && (
              <>
                <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800 mx-1.5 hidden md:block" />
                <span className="text-slate-500 dark:text-zinc-500 mr-1 flex items-center gap-1 font-medium">
                  Type:
                </span>
                <button
                  onClick={() => setSelectedType('ALL')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedType === 'ALL'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Types
                </button>
                {eventTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedType === t
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[450px] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-end space-y-3 animate-pulse shadow-sm"
              >
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-7 w-3/4 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="rounded-2xl p-8 border border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-950/20 text-center space-y-3 max-w-lg mx-auto">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Events Feed Temporarily Unavailable</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              {fetchError}. Please ensure the backend server and database are active.
            </p>
            <button
              onClick={fetchEvents}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <ByteEmptyState
            searchTerm={searchTerm}
            hasActiveFilters={hasActiveFilters}
            onReset={clearAllFilters}
            onQuickSearch={(term) => setSearchTerm(term)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => {
              const posterUrl = getEventPosterUrl(event.Posters);
              const customBg = event.PrimaryColor || '#059669';

              const isOngoing = (event.EventStatus || '').toLowerCase() === 'ongoing';
              const isCompleted = (event.EventStatus || '').toLowerCase() === 'completed';
              const mode = (event.HackathonMode || 'Virtual');

              return (
                <motion.div
                  key={event.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  onClick={() => navigate(`/events/${event.Id}`)}
                  className="group relative h-[450px] sm:h-[460px] rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-400 ease-out select-none"
                >
                  <div className="absolute inset-0 w-full h-full">
                    {posterUrl ? (
                      <img
                        src={posterUrl}
                        alt={event.EventName}
                        className="w-full h-full object-cover object-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:brightness-[0.2] group-hover:blur-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center relative transition-transform duration-700 group-hover:scale-105"
                        style={{
                          background:
                            theme === 'dark'
                              ? `radial-gradient(circle at 50% 40%, ${customBg}30 0%, #09090b 85%)`
                              : `radial-gradient(circle at 50% 40%, ${customBg}25 0%, #e2e8f0 85%)`
                        }}
                      >
                        <Tag className={`h-14 w-14 mb-2 ${theme === 'dark' ? 'text-emerald-400/60' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-emerald-400/70' : 'text-emerald-700'}`}>
                          {event.EventType || 'CHALLENGE'}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent transition-opacity duration-400 group-hover:opacity-0" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 z-10 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:translate-y-4">
                    <div className="h-0.5 w-8 bg-emerald-400 mb-2" />
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                      {event.EventName}
                    </h3>
                  </div>

                  <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white/95 dark:bg-black/90 backdrop-blur-md">

                    <div className="flex items-center justify-between gap-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      {(() => {
                        const m = (mode || '').toLowerCase();
                        if (m === 'virtual and physical' || m === 'both') {
                          return (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-300">
                              <Layers className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Virtual & Physical</span>
                            </div>
                          );
                        }
                        if (m === 'hybrid') {
                          return (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 dark:bg-zinc-900 border border-teal-200 dark:border-zinc-800 text-teal-700 dark:text-teal-300">
                              <Radio className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                              <span>Hybrid</span>
                            </div>
                          );
                        }
                        if (m === 'physical') {
                          return (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-300">
                              <Building2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Physical</span>
                            </div>
                          );
                        }
                        return (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 text-emerald-700 dark:text-emerald-300">
                            <Monitor className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Virtual</span>
                          </div>
                        );
                      })()}

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                        {isOngoing ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live</span>
                        ) : isCompleted ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-slate-500 dark:text-zinc-400" />
                            <span>Concluded</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                            <span className="text-amber-600 dark:text-amber-300">Upcoming</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 my-auto transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {event.EventType || 'Hackathon'}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                          {event.EventName}
                        </h3>
                      </div>

                      {event.Description && (
                        <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                          {event.Description}
                        </p>
                      )}

                      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800/60">
                          <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 text-[11px]">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Schedule</span>
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{formatDate(event.StartDate)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800/60">
                          <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 text-[11px]">
                            <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Team Size</span>
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{event.TeamSize ? `${event.TeamSize} Members` : 'Flexible'}</span>
                        </div>

                        {event.Location && (
                          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-zinc-800/60">
                            <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 text-[11px]">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Venue</span>
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{event.Location}</span>
                          </div>
                        )}

                        {(event.HackathonMode === 'Both' || event.HackathonMode === 'Virtual and Physical') && (event.VirtualPrizeMoney || event.PhysicalPrizeMoney) ? (
                          <div className="flex flex-col gap-1 py-1 text-xs">
                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="flex items-center gap-1.5">
                                <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                                <span>Track Prizes</span>
                              </span>
                              {event.PrizeMoney && (
                                <span className="font-extrabold text-amber-600 dark:text-amber-300">
                                  Pool: {event.PrizeMoney}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                              {event.PhysicalPrizeMoney && (
                                <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400">Physical Track</span>
                                  <span className="font-extrabold text-xs">{event.PhysicalPrizeMoney}</span>
                                </div>
                              )}
                              {event.VirtualPrizeMoney && (
                                <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 flex flex-col">
                                  <span className="text-[9px] uppercase font-bold text-blue-700 dark:text-blue-400">Virtual Track</span>
                                  <span className="font-extrabold text-xs">{event.VirtualPrizeMoney}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (event.PrizeMoney || event.PhysicalPrizeMoney || event.VirtualPrizeMoney) ? (
                          <div className="flex items-center justify-between text-xs py-1">
                            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-[11px] font-bold">
                              <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                              <span>Prize Pool</span>
                            </span>
                            <span className="font-black text-amber-600 dark:text-amber-300 text-sm">{event.PrizeMoney || event.PhysicalPrizeMoney || event.VirtualPrizeMoney}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/events/${event.Id}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Quick View</span>
                      </button>

                      <button
                        onClick={(e) => handleActionClick(e, event)}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <span>Participate</span>
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExploreEvents;
