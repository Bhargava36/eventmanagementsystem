import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  CalendarDays,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Building2,
  User,
  X,
  MapPin,
  Mic,
  FileText,
  ExternalLink,
  Search,
  Layers,
  Award,
  Sparkles
} from 'lucide-react';
export default function SeminarAgendaPage() {
  const toast = useToast();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = admin?.EventId;
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    SessionTitle: '',
    SessionDate: '',
    DayNumber: 1,
    StartTime: '09:30 AM',
    EndTime: '10:30 AM',
    SpeakerName: '',
    HallName: 'Main Auditorium',
    Description: '',
    ResourcesUrl: '',
    OrderIndex: 0
  });
  const fetchData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [sesRes, spkRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/sessions`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/speakers`)
      ]);
      if (sesRes.ok) {
        const sesData = await sesRes.json();
        setSessions(sesData.sessions || []);
      }
      if (spkRes.ok) {
        const spkData = await spkRes.json();
        setSpeakers(spkData.speakers || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load seminar schedule');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Extract distinct days list
  const daysList = useMemo(() => {
    const days = new Set([1]);
    sessions.forEach((s) => {
      const d = Number(s.DayNumber);
      if (!isNaN(d) && d > 0) days.add(d);
    });
    return Array.from(days).sort((a, b) => a - b);
  }, [sessions]);
  // Filter sessions by activeDay and search query
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchDay = Number(s.DayNumber || 1) === Number(activeDay);
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchDay;
      const matchSearch =
        (s.SessionTitle || '').toLowerCase().includes(q) ||
        (s.SpeakerName || '').toLowerCase().includes(q) ||
        (s.HallName || '').toLowerCase().includes(q) ||
        (s.Description || '').toLowerCase().includes(q);
      return matchDay && matchSearch;
    });
  }, [sessions, activeDay, searchQuery]);
  // Distinct halls count
  const hallsCount = useMemo(() => {
    const halls = new Set();
    sessions.forEach((s) => {
      if (s.HallName && s.HallName.trim()) halls.add(s.HallName.trim());
    });
    return halls.size || 1;
  }, [sessions]);
  const handleOpenModal = (session = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        SessionTitle: session.SessionTitle || '',
        SessionDate: session.SessionDate ? session.SessionDate.split('T')[0] : '',
        DayNumber: Number(session.DayNumber) || activeDay,
        StartTime: session.StartTime || '09:30 AM',
        EndTime: session.EndTime || '10:30 AM',
        SpeakerName: session.SpeakerName || '',
        HallName: session.HallName || 'Main Auditorium',
        Description: session.Description || '',
        ResourcesUrl: session.ResourcesUrl || '',
        OrderIndex: session.OrderIndex || 0
      });
    } else {
      setEditingSession(null);
      setFormData({
        SessionTitle: '',
        SessionDate: '',
        DayNumber: activeDay,
        StartTime: '09:30 AM',
        EndTime: '10:30 AM',
        SpeakerName: speakers[0]?.Name || '',
        HallName: 'Main Auditorium',
        Description: '',
        ResourcesUrl: '',
        OrderIndex: sessions.length
      });
    }
    setIsModalOpen(true);
  };
  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!eventId) return;
    if (!formData.SessionTitle.trim()) {
      toast.error('Session Title is required');
      return;
    }
    try {
      setSaving(true);
      const url = editingSession
        ? `${API_BASE_URL}/api/seminars/sessions/${editingSession.Id}`
        : `${API_BASE_URL}/api/seminars/${eventId}/sessions`;
      const method = editingSession ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save session');
      toast.success(editingSession ? 'Agenda slot updated' : 'Agenda slot scheduled');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Could not save session');
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this session slot from the agenda?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/seminars/sessions/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete session');
      toast.success('Session removed');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Could not delete session');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Seminar Timeline & Schedule &bull; {sessions.length} Slots Scheduled
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Conference Agenda & Proceedings
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Configure keynotes, paper discussions, tea breaks, and valedictory ceremony slots.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh agenda"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session Slot</span>
          </button>
        </div>
      </div>
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Keynote Slots</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="bg-white dark:bg-black border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Keynote Speakers</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{speakers.length}</p>
        </div>
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Auditorium Halls</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{hallsCount}</p>
        </div>
        <div className="bg-white dark:bg-black border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Conference Days</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{daysList.length}</p>
        </div>
      </div>
      {/* Website Signature Theme Folder Tabs for Multi-Day Agenda */}
      {daysList.length > 1 && (
        <div className="relative pt-2">
          <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto scrollbar-none">
            {daysList.map((day) => {
              const isActive = activeDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="seminarAgendaTabFolder"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-slate-100/90 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 z-0 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors" />
                  )}
                  <span
                    className={`relative z-20 flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'text-slate-950 dark:text-white font-bold'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Calendar
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <span>Day {day} Keynotes</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search talk title, speaker, or auditorium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Showing {filteredSessions.length} sessions on Day {activeDay}</span>
        </div>
      </div>
      {/* Agenda Timeline List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 dark:text-zinc-500 text-sm gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Loading agenda timeline...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Sessions Scheduled on Day {activeDay}</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              Set up the conference schedule including keynote talks, panel discussions, and breaks.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Session</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.Id || index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 transition shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-base shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {session.StartTime} – {session.EndTime}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{session.HallName || 'Main Auditorium'}</span>
                    </span>
                    {session.SessionDate && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[11px] font-mono">
                        {session.SessionDate.split('T')[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {session.SessionTitle}
                    </h3>
                    {session.Description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {session.Description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-zinc-400 pt-1">
                    {session.SpeakerName && (
                      <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-zinc-200">
                        <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Keynote: {session.SpeakerName}</span>
                      </div>
                    )}
                    {session.ResourcesUrl && (
                      <a
                        href={session.ResourcesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Slide Deck / Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleOpenModal(session)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Edit session slot"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSession(session.Id)}
                  className="p-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Add / Edit Session Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {editingSession ? 'Edit Conference Session' : 'Schedule Conference Session'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Configure talk timing, assigned keynote speaker, and auditorium hall.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Session / Keynote Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inaugural Keynote: Scalable Artificial Intelligence"
                    value={formData.SessionTitle}
                    onChange={(e) => setFormData({ ...formData, SessionTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Day Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.DayNumber}
                      onChange={(e) => setFormData({ ...formData, DayNumber: Number(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Start Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="09:30 AM"
                      value={formData.StartTime}
                      onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      End Time *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="10:30 AM"
                      value={formData.EndTime}
                      onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Keynote Speaker
                    </label>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Dr. Arvind Ramanathan"
                        value={formData.SpeakerName}
                        onChange={(e) => setFormData({ ...formData, SpeakerName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                      />
                      {speakers.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) setFormData({ ...formData, SpeakerName: e.target.value });
                          }}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                        >
                          <option value="">Quick select from registered speakers...</option>
                          {speakers.map((s) => (
                            <option key={s.Id} value={s.Name}>
                              {s.Name} ({s.Designation || s.Organization || 'Keynote'})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Auditorium Hall / Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Auditorium or Plenary Hall"
                      value={formData.HallName}
                      onChange={(e) => setFormData({ ...formData, HallName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Presentation Deck / Slide URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or https://example.com/slides.pdf"
                    value={formData.ResourcesUrl}
                    onChange={(e) => setFormData({ ...formData, ResourcesUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Session Abstract & Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the topics covered in this talk..."
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 resize-none transition-all"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    {saving ? 'Saving...' : editingSession ? 'Save Changes' : 'Schedule Slot'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
