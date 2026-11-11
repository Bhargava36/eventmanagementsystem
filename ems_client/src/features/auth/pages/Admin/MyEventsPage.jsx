import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import { getEventTypeInfo } from '../../../../lib/utils';
import {
  Layers,
  Calendar,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sliders,
  Trophy,
  Users,
  ShieldCheck,
  RefreshCw,
  X,
  Radio,
  Building2,
  Zap,
} from 'lucide-react';
export default function MyEventsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [switchingId, setSwitchingId] = useState(null);
  // Create Event Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const adminId = admin?.Id || admin?.id;
  const currentActiveEventId = admin?.EventId || admin?.eventId;
  // Fetch admin profile and all assigned events
  const fetchAdminEvents = async () => {
    if (!adminId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/${adminId}`);
      if (!res.ok) throw new Error('Failed to load events');
      const data = await res.json();
      let fetchedEvents = [];
      if (Array.isArray(data.events) && data.events.length > 0 && data.events[0]?.EventName && !data.events[0]?.AdminName) {
        fetchedEvents = data.events;
      } else if (Array.isArray(data.admin?.events)) {
        fetchedEvents = data.admin.events;
      } else if (Array.isArray(data.events?.[0]?.events)) {
        fetchedEvents = data.events[0].events;
      }
      setEvents(fetchedEvents);
      const activeEventId = admin?.EventId || data.admin?.EventId;
      const activeEventObj = fetchedEvents.find((e) => Number(e.Id) === Number(activeEventId)) || fetchedEvents[0];
      // Keep localStorage in sync with full list
      const updatedAdmin = {
        ...admin,
        EventId: activeEventObj ? activeEventObj.Id : admin?.EventId,
        EventName: activeEventObj ? activeEventObj.EventName : admin?.EventName,
        HackathonMode: activeEventObj ? activeEventObj.HackathonMode : admin?.HackathonMode,
        EventType: activeEventObj ? activeEventObj.EventType : (admin?.EventType || 'Hackathon'),
        events: fetchedEvents,
      };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      setAdmin(updatedAdmin);
    } catch (err) {
      console.error('Error fetching admin events:', err);
      // Fallback to cached events from localStorage
      if (admin?.events && Array.isArray(admin.events)) {
        setEvents(admin.events);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAdminEvents();
  }, [adminId]);
  // Handle switching active event
  const handleSwitchEvent = async (targetEvent) => {
    if (!targetEvent) return;
    if (Number(targetEvent.Id) === Number(currentActiveEventId)) {
      toast.info(`Already managing ${targetEvent.EventName}`);
      navigate('/admin/dashboard');
      return;
    }
    setSwitchingId(targetEvent.Id);
    const updatedAdmin = {
      ...admin,
      EventId: targetEvent.Id,
      EventName: targetEvent.EventName,
      HackathonMode: targetEvent.HackathonMode,
      EventType: targetEvent.EventType || 'Hackathon',
      Location: targetEvent.Location,
    };
    localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    setAdmin(updatedAdmin);
    // Call backend switch-event to persist selection in users.EventId
    try {
      await fetch(`${API_BASE_URL}/api/admin/switch-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AdminId: adminId, EventId: targetEvent.Id }),
      });
    } catch (e) {
      console.warn('Backend switch failed:', e);
    }
    // Clear old caches
    try {
      localStorage.removeItem(`admin_dashboard_cache_${targetEvent.Id}`);
      localStorage.removeItem(`admin_dashboard_cache_${currentActiveEventId}`);
    } catch (e) {}
    // Notify all listeners
    window.dispatchEvent(new CustomEvent('admin-event-updated', { detail: targetEvent }));
    toast.success(`Switched workspace to: ${targetEvent.EventName}`);
    setTimeout(() => {
      navigate('/admin/dashboard');
      window.location.reload();
    }, 250);
  };
  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        (ev.EventName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.EventType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.Location || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'hackathons') {
        return (ev.EventType || '').toLowerCase() === 'hackathon';
      }
      if (activeFilter === 'workshops') {
        return (ev.EventType || '').toLowerCase().includes('workshop');
      }
      if (activeFilter === 'conferences') {
        return (ev.EventType || '').toLowerCase().includes('conference') || (ev.EventType || '').toLowerCase().includes('seminar');
      }
      return true;
    });
  }, [events, searchQuery, activeFilter]);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-6 sm:p-10 transition-colors">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              Multi-Event Command Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Hosted Events
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Switch between workspaces, oversee multiple hackathons and workshops, or launch a new event effortlessly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminEvents}
              title="Refresh list"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Events Assigned
              </p>
              <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                {events.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Workspace
              </p>
              <h3 className="text-lg font-bold mt-1 text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                {admin?.EventName || 'None Selected'}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Access Level
              </p>
              <h3 className="text-lg font-bold mt-1 text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Multi-Event Organizer
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 w-fit overflow-x-auto">
            {['all', 'hackathons', 'workshops', 'conferences'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeFilter === f
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative min-w-[260px] sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search your events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
        </div>
        {/* Events Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-3" />
            <p className="text-sm text-slate-400 font-medium">Loading your event portfolio...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-10 bg-white/40 dark:bg-slate-900/20">
            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Events Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No events match your search query.'
                : 'You have not been assigned to any events yet or no events created.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const isActive = Number(ev.Id) === Number(currentActiveEventId);
              const typeInfo = getEventTypeInfo(ev.EventType);
              return (
                <motion.div
                  key={ev.Id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className={`relative rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-zinc-900/90 dark:border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm'
                  }`}
                >
                  {/* Top Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${typeInfo.badgeColor}`}>
                        {typeInfo.label}
                      </span>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          Active Workspace
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                          ID #{ev.Id}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-2">
                      {ev.EventName}
                    </h3>
                    <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                      <div className="flex items-center gap-2">
                        <Radio className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mode: <strong className="text-slate-700 dark:text-slate-200">{ev.HackathonMode || 'Physical'}</strong></span>
                      </div>
                      {ev.Location && (
                        <div className="flex items-center gap-2 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.Location}</span>
                        </div>
                      )}
                      {(ev.StartDate || ev.EndDate) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {ev.StartDate ? new Date(ev.StartDate).toLocaleDateString() : 'TBD'} -{' '}
                            {ev.EndDate ? new Date(ev.EndDate).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                    {isActive ? (
                      <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition"
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSwitchEvent(ev)}
                        disabled={switchingId === ev.Id}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        {switchingId === ev.Id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Switch to This Event</span>
                            <Zap className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleSwitchEvent(ev);
                        setTimeout(() => navigate('/admin/settings'), 300);
                      }}
                      title="Event Settings"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition cursor-pointer"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      {/* Host New Event Modal */}
    </div>
  );
}
