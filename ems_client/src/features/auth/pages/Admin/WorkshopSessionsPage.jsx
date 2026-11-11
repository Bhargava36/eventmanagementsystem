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
  BookOpen,
  MapPin,
  Video,
  User,
  CheckCircle2,
  RefreshCw,
  Building,
  Layers,
  ChevronRight,
  X,
  Link as LinkIcon
} from 'lucide-react';
export default function WorkshopSessionsPage() {
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
    EndTime: '12:00 PM',
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
      const res = await fetch(`${API_BASE_URL}/api/workshops/${eventId}/sessions`);
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load workshop sessions');
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
      EndTime: '12:00 PM',
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
      toast.error('Session title is required');
      return;
    }
    try {
      setSaving(true);
      const url = editingSession
        ? `${API_BASE_URL}/api/workshops/sessions/${editingSession.Id}`
        : `${API_BASE_URL}/api/workshops/${eventId}/sessions`;
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
      toast.success(editingSession ? 'Session updated successfully' : 'Session scheduled successfully');
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
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/workshops/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Session deleted');
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete session');
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum & Agenda Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Workshop Sessions & Schedule
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Design your day-by-day learning track, assign instructors, specify lab rooms or Google Meet links, and attach session slides.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSessions}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh sessions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>
      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {daysList.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeDay === day
                ? 'bg-emerald-700 dark:bg-emerald-500 text-white dark:text-black shadow-sm font-extrabold'
                : 'bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day {day}</span>
          </button>
        ))}
        <button
          onClick={() => {
            const nextDay = Math.max(...daysList, 0) + 1;
            setActiveDay(nextDay);
            handleOpenAddModal();
          }}
          className="px-4 py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Day</span>
        </button>
      </div>
      {/* Sessions Timeline List */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading curriculum...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-black border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No sessions scheduled for Day {activeDay}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5">
            Outline lectures, coding labs, break times, and hands-on activities for your attendees.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 text-white font-bold text-xs transition cursor-pointer"
          >
            Schedule Day {activeDay} Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, idx) => (
            <motion.div
              key={session.Id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {session.StartTime} – {session.EndTime}
                    </span>
                    {session.SessionDate && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-xs font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.SessionDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                    {session.SessionTitle}
                  </h3>
                  {session.Description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                      {session.Description}
                    </p>
                  )}
                  {/* Speaker & Venue Info */}
                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 dark:text-zinc-400">
                    {session.SpeakerName && (
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {session.SpeakerName}
                          {session.SpeakerDesignation ? ` (${session.SpeakerDesignation}${session.SpeakerCompany ? `, ${session.SpeakerCompany}` : ''})` : ''}
                        </span>
                      </div>
                    )}
                    {session.VenueOrMeetLink && (
                      <div className="flex items-center gap-1.5">
                        {session.VenueOrMeetLink.startsWith('http') ? (
                          <a
                            href={session.VenueOrMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meeting</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{session.VenueOrMeetLink}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {session.ResourcesUrl && (
                      <a
                        href={session.ResourcesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Handout / Slides</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => handleOpenEditModal(session)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                    title="Edit session"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(session.Id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* Add / Edit Session Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingSession ? 'Edit Session' : 'Schedule New Session'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.SessionTitle}
                    onChange={(e) => setFormData({ ...formData, SessionTitle: e.target.value })}
                    placeholder="e.g. Hands-on Machine Learning Pipeline"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Day Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.DayNumber}
                      onChange={(e) => setFormData({ ...formData, DayNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      value={formData.StartTime}
                      onChange={(e) => setFormData({ ...formData, StartTime: e.target.value })}
                      placeholder="10:00 AM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={formData.EndTime}
                      onChange={(e) => setFormData({ ...formData, EndTime: e.target.value })}
                      placeholder="12:00 PM"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Speaker / Trainer Name
                    </label>
                    <input
                      type="text"
                      value={formData.SpeakerName}
                      onChange={(e) => setFormData({ ...formData, SpeakerName: e.target.value })}
                      placeholder="Dr. Rajesh Kumar"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Designation / Company
                    </label>
                    <input
                      type="text"
                      value={formData.SpeakerDesignation}
                      onChange={(e) => setFormData({ ...formData, SpeakerDesignation: e.target.value })}
                      placeholder="Senior AI Engineer, Microsoft"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Venue (Room / Lab) OR Google Meet / Zoom URL
                  </label>
                  <input
                    type="text"
                    value={formData.VenueOrMeetLink}
                    onChange={(e) => setFormData({ ...formData, VenueOrMeetLink: e.target.value })}
                    placeholder="Lab 304 or https://meet.google.com/xyz-abc"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Session Slides / Notes Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.ResourcesUrl}
                    onChange={(e) => setFormData({ ...formData, ResourcesUrl: e.target.value })}
                    placeholder="https://drive.google.com/... or https://github.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Session Description / Topics Covered
                  </label>
                  <textarea
                    rows={3}
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    placeholder="Key concepts, prerequisites, and practical exercises for this session..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : editingSession ? 'Update Session' : 'Save Session'}
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
