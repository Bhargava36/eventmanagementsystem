import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Video,
  Radio,
  User,
  CheckCircle2,
  RefreshCw,
  Building,
  ChevronRight,
  X,
  Presentation,
  Link as LinkIcon,
  Mic,
  Tv
} from 'lucide-react';
export default function WebinarAgendaPage() {
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
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    SessionTitle: '',
    DayNumber: 1,
    SessionDate: '',
    StartTime: '10:00 AM',
    EndTime: '11:30 AM',
    SpeakerName: '',
    SpeakerDesignation: '',
    SpeakerCompany: '',
    VenueOrMeetLink: '',
    Description: '',
    ResourcesUrl: ''
  });
  const fetchSessions = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/sessions`);
      if (!res.ok) throw new Error('Failed to load webinar agenda');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load webinar agenda');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions();
  }, [eventId]);
  const daysList = useMemo(() => {
    const days = new Set([1]);
    sessions.forEach((s) => days.add(Number(s.DayNumber) || 1));
    return Array.from(days).sort((a, b) => a - b);
  }, [sessions]);
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => Number(s.DayNumber || 1) === Number(activeDay));
  }, [sessions, activeDay]);
  const handleOpenAddModal = () => {
    setEditingSession(null);
    setFormData({
      SessionTitle: '',
      DayNumber: activeDay,
      SessionDate: '',
      StartTime: '10:00 AM',
      EndTime: '11:30 AM',
      SpeakerName: '',
      SpeakerDesignation: '',
      SpeakerCompany: '',
      VenueOrMeetLink: '',
      Description: '',
      ResourcesUrl: ''
    });
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      SessionTitle: session.SessionTitle || '',
      DayNumber: session.DayNumber || 1,
      SessionDate: session.SessionDate || '',
      StartTime: session.StartTime || '',
      EndTime: session.EndTime || '',
      SpeakerName: session.SpeakerName || '',
      SpeakerDesignation: session.SpeakerDesignation || '',
      SpeakerCompany: session.SpeakerCompany || '',
      VenueOrMeetLink: session.VenueOrMeetLink || '',
      Description: session.Description || '',
      ResourcesUrl: session.ResourcesUrl || ''
    });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.SessionTitle.trim()) {
      toast.error('Keynote title is required');
      return;
    }
    try {
      setSaving(true);
      const url = editingSession
        ? `${API_BASE_URL}/api/webinars/sessions/${editingSession.Id}`
        : `${API_BASE_URL}/api/webinars/${eventId}/sessions`;
      const method = editingSession ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Operation failed');
      }
      toast.success(editingSession ? 'Keynote session updated' : 'Keynote session scheduled');
      setIsModalOpen(false);
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save session');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to remove this keynote session from the webinar?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Keynote session removed');
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove keynote session');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5" />
            Live Broadcast & Keynote Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Webinar Keynote Agenda & Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Design real-time keynote sessions, assign guest speakers and panelists, attach virtual meeting rooms (Zoom, Google Meet, YouTube Live), and share presentation slide decks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSessions}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh agenda"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Keynote</span>
          </button>
        </div>
      </div>
      {/* ── WEBSITE SIGNATURE THEME TABS FOR MULTI-DAY AGENDA ── */}
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
                      layoutId="webinarAgendaTabFolder"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-zinc-950 border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-zinc-950 pointer-events-none z-20" />
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
      {/* Agenda Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 dark:text-zinc-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-sm">Loading webinar agenda...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
            <Presentation className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Keynotes Scheduled Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Get started by adding the opening keynote, guest speaker presentation, panel discussion, or Q&A segment.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Keynote</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, idx) => (
            <motion.div
              key={session.Id || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 hover:border-emerald-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {session.StartTime} – {session.EndTime}
                  </span>
                  {session.SessionDate && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {session.SessionDate}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                    Session #{idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {session.SessionTitle}
                  </h3>
                  {session.Description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {session.Description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-zinc-400 pt-1">
                  {session.SpeakerName && (
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-zinc-200">
                      <Mic className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{session.SpeakerName}</span>
                      {(session.SpeakerDesignation || session.SpeakerCompany) && (
                        <span className="text-slate-400 dark:text-zinc-500 font-normal">
                          ({[session.SpeakerDesignation, session.SpeakerCompany].filter(Boolean).join(' • ')})
                        </span>
                      )}
                    </div>
                  )}
                  {session.VenueOrMeetLink && (
                    <div className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {session.VenueOrMeetLink.startsWith('http') ? (
                        <a
                          href={session.VenueOrMeetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>Live Broadcast Room</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>{session.VenueOrMeetLink}</span>
                      )}
                    </div>
                  )}
                  {session.ResourcesUrl && (
                    <a
                      href={session.ResourcesUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Slide Deck</span>
                    </a>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleOpenEditModal(session)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Edit keynote session"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(session.Id)}
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
      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Radio className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingSession ? 'Edit Keynote Session' : 'Schedule Webinar Keynote'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Keynote / Talk Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Opening Keynote: The Future of Generative AI"
                    value={formData.SessionTitle}
                    onChange={(e) => setFormData({ ...formData, SessionTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={formData.StartTime}
                      onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="text"
                      placeholder="11:30 AM"
                      value={formData.EndTime}
                      onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Keynote Speaker Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Jane Doe"
                      value={formData.SpeakerName}
                      onChange={(e) => setFormData({ ...formData, SpeakerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chief AI Scientist"
                      value={formData.SpeakerDesignation}
                      onChange={(e) => setFormData({ ...formData, SpeakerDesignation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Speaker Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google DeepMind"
                      value={formData.SpeakerCompany}
                      onChange={(e) => setFormData({ ...formData, SpeakerCompany: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                      Live Stream / Meeting Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://meet.google.com/... or Zoom link"
                      value={formData.VenueOrMeetLink}
                      onChange={(e) => setFormData({ ...formData, VenueOrMeetLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Session Description & Discussion Topics
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief outline of topics covered, Q&A format, key takeaways..."
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                    Keynote Slides / Resource URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or slides link"
                    value={formData.ResourcesUrl}
                    onChange={(e) => setFormData({ ...formData, ResourcesUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    {saving ? 'Saving...' : editingSession ? 'Update Keynote' : 'Add Keynote'}
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
