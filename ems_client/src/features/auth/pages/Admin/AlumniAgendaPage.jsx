import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  CalendarDays,
  Mic,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Globe,
  Building,
  GraduationCap,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
export default function AlumniAgendaPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = admin?.EventId;
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'speakers'
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  // Session Modal State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    SessionTitle: '',
    SessionDate: '',
    StartTime: '10:00',
    EndTime: '11:00',
    SpeakerName: '',
    VenueHall: 'Main Campus Auditorium',
    Description: '',
    OrderIndex: 0
  });
  // Speaker Modal State
  const [speakerModalOpen, setSpeakerModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [speakerForm, setSpeakerForm] = useState({
    Name: '',
    GraduationYear: '2016',
    Branch: 'CSE',
    Designation: 'VP of Engineering',
    Company: 'Google',
    Topic: 'Scaling Systems & Lessons from Campus to Cloud',
    Bio: '',
    PhotoUrl: '',
    LinkedinUrl: '',
    OrderIndex: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [sesRes, spkRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/agenda`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/speakers`)
      ]);
      if (sesRes.ok) {
        const sData = await sesRes.json();
        setSessions(sData.sessions || sData.agenda || (Array.isArray(sData) ? sData : []));
      }
      if (spkRes.ok) {
        const spData = await spkRes.json();
        setSpeakers(spData.speakers || []);
      }
    } catch (err) {
      console.error('Failed to load agenda & speakers:', err);
      toast.error('Failed to load agenda');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  // Session CRUD Handlers
  const handleOpenAddSession = () => {
    setEditingSession(null);
    setSessionForm({
      SessionTitle: '',
      SessionDate: '',
      StartTime: '10:00',
      EndTime: '11:00',
      SpeakerName: '',
      VenueHall: 'Main Campus Auditorium',
      Description: '',
      OrderIndex: sessions.length
    });
    setSessionModalOpen(true);
  };
  const handleOpenEditSession = (s) => {
    setEditingSession(s);
    setSessionForm({
      SessionTitle: s.SessionTitle || '',
      SessionDate: s.SessionDate ? s.SessionDate.split('T')[0] : '',
      StartTime: s.StartTime || '10:00',
      EndTime: s.EndTime || '11:00',
      SpeakerName: s.SpeakerName || '',
      VenueHall: s.VenueHall || 'Main Campus Auditorium',
      Description: s.Description || '',
      OrderIndex: s.OrderIndex || 0
    });
    setSessionModalOpen(true);
  };
  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.SessionTitle.trim()) {
      toast.error('Please enter session title');
      return;
    }
    try {
      setSubmitting(true);
      const url = editingSession
        ? `${API_BASE_URL}/api/alumni/agenda/${editingSession.Id}`
        : `${API_BASE_URL}/api/alumni/${eventId}/agenda`;
      const method = editingSession ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionForm)
      });
      if (!res.ok) throw new Error('Failed to save session');
      toast.success(editingSession ? 'Session updated' : 'Session added');
      setSessionModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving session');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/agenda/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete session');
      toast.success('Activity removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error deleting session');
    }
  };
  // Speaker CRUD Handlers
  const handleOpenAddSpeaker = () => {
    setEditingSpeaker(null);
    setSpeakerForm({
      Name: '',
      GraduationYear: '2016',
      Branch: 'CSE',
      Designation: '',
      Company: '',
      Topic: '',
      Bio: '',
      PhotoUrl: '',
      LinkedinUrl: '',
      OrderIndex: speakers.length
    });
    setSpeakerModalOpen(true);
  };
  const handleOpenEditSpeaker = (spk) => {
    setEditingSpeaker(spk);
    setSpeakerForm({
      Name: spk.Name || '',
      GraduationYear: spk.GraduationYear || '',
      Branch: spk.Branch || '',
      Designation: spk.Designation || '',
      Company: spk.Company || '',
      Topic: spk.Topic || '',
      Bio: spk.Bio || '',
      PhotoUrl: spk.PhotoUrl || '',
      LinkedinUrl: spk.LinkedinUrl || '',
      OrderIndex: spk.OrderIndex || 0
    });
    setSpeakerModalOpen(true);
  };
  const handleSaveSpeaker = async (e) => {
    e.preventDefault();
    if (!speakerForm.Name.trim()) {
      toast.error('Please enter speaker name');
      return;
    }
    try {
      setSubmitting(true);
      const url = editingSpeaker
        ? `${API_BASE_URL}/api/alumni/speakers/${editingSpeaker.Id}`
        : `${API_BASE_URL}/api/alumni/${eventId}/speakers`;
      const method = editingSpeaker ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(speakerForm)
      });
      if (!res.ok) throw new Error('Failed to save speaker');
      toast.success(editingSpeaker ? 'Speaker updated' : 'Speaker added');
      setSpeakerModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving speaker');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteSpeaker = async (id) => {
    if (!window.confirm('Are you sure you want to remove this distinguished speaker?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/speakers/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete speaker');
      toast.success('Speaker removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error deleting speaker');
    }
  };
  const tabs = [
    { id: 'sessions', label: 'Activities & Agenda', count: sessions.length, icon: CalendarDays },
    { id: 'speakers', label: 'Keynote Alumni', count: speakers.length, icon: Mic },
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Reunion Program Builder</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-slate-900 dark:text-white">
            Meet Activities &amp; Distinguished Speakers
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Build the day-long schedule of events, nostalgia tours, keynote addresses, and networking dinners.
          </p>
        </div>
        <button
          onClick={activeTab === 'sessions' ? handleOpenAddSession : handleOpenAddSpeaker}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'sessions' ? 'Add Activity' : 'Add Keynote Alumni'}
        </button>
      </div>
      {/* Application Signature Folder Tabs */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative h-12 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
              >
                {isActive ? (
                  <motion.div
                    layoutId="alumniAgendaTabActiveFolder"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 z-0" />
                )}
                <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
                }`}>
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className="text-xs text-slate-400">
                    ({tab.count})
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {/* Tab Content Box with matching border */}
        <div className="rounded-3xl rounded-tl-none border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 shadow-sm">
          {/* SESSIONS VIEW */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Reunion Day Schedule ({sessions.length} Activities)
                </h2>
              </div>
              {sessions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-zinc-900/30 border border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
                  <CalendarDays className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base">No Activities Scheduled Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                    Add your reunion activities such as registration breakfast, department tours, keynote addresses, and the gala dinner.
                  </p>
                  <button
                    onClick={handleOpenAddSession}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Activity
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s, idx) => (
                    <div
                      key={s.Id || idx}
                      className="p-5 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20 font-mono">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold mt-0.5">{s.StartTime || '--:--'}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {s.SessionTitle}
                            </h4>
                            {s.SpeakerName && (
                              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                • Host: {s.SpeakerName}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {s.StartTime} - {s.EndTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              {s.VenueHall || 'Main Auditorium'}
                            </span>
                          </div>
                          {s.Description && (
                            <p className="text-xs text-slate-600 dark:text-gray-400 pt-1 leading-relaxed">
                              {s.Description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => handleOpenEditSession(s)}
                          className="p-2 rounded-xl text-slate-600 dark:text-gray-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(s.Id)}
                          className="p-2 rounded-xl text-slate-600 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* SPEAKERS VIEW */}
          {activeTab === 'speakers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Distinguished Keynote Alumni ({speakers.length})
                </h2>
              </div>
              {speakers.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-zinc-900/30 border border-dashed border-slate-300 dark:border-zinc-800 space-y-3">
                  <Mic className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="font-bold text-base">No Keynote Speakers Listed</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto">
                    Highlight successful alumni innovators, entrepreneurs, and leaders speaking at this reunion.
                  </p>
                  <button
                    onClick={handleOpenAddSpeaker}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Add Distinguished Speaker
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {speakers.map((spk, idx) => (
                    <div
                      key={spk.Id || idx}
                      className="p-5 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-xs transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {spk.PhotoUrl ? (
                            <img
                              src={spk.PhotoUrl}
                              alt={spk.Name}
                              className="w-14 h-14 rounded-2xl object-cover border border-emerald-500/30"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg">
                              {spk.Name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {spk.Name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              <GraduationCap className="w-3.5 h-3.5" />
                              Class of {spk.GraduationYear || 'Alumnus'} {spk.Branch && `(${spk.Branch})`}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-gray-400">
                              {spk.Designation} {spk.Company && `@ ${spk.Company}`}
                            </p>
                          </div>
                        </div>
                        {spk.Topic && (
                          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500">Keynote Topic</span>
                            <p className="text-xs font-semibold text-slate-800 dark:text-gray-200">
                              "{spk.Topic}"
                            </p>
                          </div>
                        )}
                        {spk.Bio && (
                          <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                            {spk.Bio}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 pt-3">
                        {spk.LinkedinUrl ? (
                          <a
                            href={spk.LinkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            LinkedIn Profile
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">No profile link</span>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSpeaker(spk)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-gray-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpeaker(spk.Id)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* SESSION MODAL */}
      <AnimatePresence>
        {sessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
                <h3 className="font-bold text-base">
                  {editingSession ? 'Edit Reunion Activity' : 'Add New Activity'}
                </h3>
                <button
                  onClick={() => setSessionModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveSession} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Activity Title</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.SessionTitle}
                    onChange={(e) => setSessionForm({ ...sessionForm, SessionTitle: e.target.value })}
                    placeholder="e.g. Welcome Coffee &amp; Campus Tour"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Start Time</label>
                    <input
                      type="time"
                      value={sessionForm.StartTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, StartTime: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">End Time</label>
                    <input
                      type="time"
                      value={sessionForm.EndTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, EndTime: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Host / Speaker (Optional)</label>
                    <input
                      type="text"
                      value={sessionForm.SpeakerName}
                      onChange={(e) => setSessionForm({ ...sessionForm, SpeakerName: e.target.value })}
                      placeholder="e.g. Dean / Alumni President"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Hall / Location</label>
                    <input
                      type="text"
                      value={sessionForm.VenueHall}
                      onChange={(e) => setSessionForm({ ...sessionForm, VenueHall: e.target.value })}
                      placeholder="e.g. North Lawns"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Description / Details</label>
                  <textarea
                    rows={2}
                    value={sessionForm.Description}
                    onChange={(e) => setSessionForm({ ...sessionForm, Description: e.target.value })}
                    placeholder="Brief description of activity..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSessionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                  >
                    {submitting ? 'Saving...' : 'Save Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* SPEAKER MODAL */}
      <AnimatePresence>
        {speakerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
                <h3 className="font-bold text-base">
                  {editingSpeaker ? 'Edit Keynote Alumni' : 'Add Distinguished Keynote Alumni'}
                </h3>
                <button
                  onClick={() => setSpeakerModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSaveSpeaker} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={speakerForm.Name}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, Name: e.target.value })}
                    placeholder="e.g. Sundararajan V"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Graduation Year</label>
                    <input
                      type="text"
                      value={speakerForm.GraduationYear}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, GraduationYear: e.target.value })}
                      placeholder="e.g. 2015"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Branch / Major</label>
                    <input
                      type="text"
                      value={speakerForm.Branch}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, Branch: e.target.value })}
                      placeholder="e.g. CSE / ECE"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Current Designation</label>
                    <input
                      type="text"
                      value={speakerForm.Designation}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, Designation: e.target.value })}
                      placeholder="e.g. Principal Architect"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Current Organization / Company</label>
                    <input
                      type="text"
                      value={speakerForm.Company}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, Company: e.target.value })}
                      placeholder="e.g. Microsoft / Startup Founder"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Keynote Topic / Address Title</label>
                  <input
                    type="text"
                    value={speakerForm.Topic}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, Topic: e.target.value })}
                    placeholder="e.g. From Dorm Room to Series B"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={speakerForm.LinkedinUrl}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, LinkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={speakerForm.PhotoUrl}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, PhotoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Bio / Accomplishments</label>
                  <textarea
                    rows={2}
                    value={speakerForm.Bio}
                    onChange={(e) => setSpeakerForm({ ...speakerForm, Bio: e.target.value })}
                    placeholder="Brief career highlights..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSpeakerModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                  >
                    {submitting ? 'Saving...' : 'Save Speaker'}
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
