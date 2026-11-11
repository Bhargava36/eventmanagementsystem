import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Building2,
  Users,
  Mic,
  CalendarDays,
  CalendarCheck,
  QrCode,
  FileText,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Save
} from 'lucide-react';
export default function SeminarOverviewPage() {
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
  const [eventData, setEventData] = useState(null);
  const [delegates, setDelegates] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingVenue, setSavingVenue] = useState(false);
  // Editable venue state
  const [venueForm, setVenueForm] = useState({
    AuditoriumVenue: '',
    MaxCapacity: 200,
    Location: ''
  });
  const loadAllData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [evRes, delRes, spkRes, sesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/${eventId}`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/delegates`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/speakers`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/sessions`)
      ]);
      if (evRes.ok) {
        const ev = await evRes.json();
        const cur = Array.isArray(ev) ? ev[0] : (ev.event || ev);
        setEventData(cur);
        setVenueForm({
          AuditoriumVenue: cur.AuditoriumVenue || cur.Location || 'Main Campus Auditorium',
          MaxCapacity: Number(cur.MaxCapacity) || 200,
          Location: cur.Location || ''
        });
      }
      if (delRes.ok) {
        const dData = await delRes.json();
        setDelegates(dData.delegates || []);
      }
      if (spkRes.ok) {
        const sData = await spkRes.json();
        setSpeakers(sData.speakers || []);
      }
      if (sesRes.ok) {
        const seData = await sesRes.json();
        setSessions(seData.sessions || []);
      }
    } catch (err) {
      console.error('Error loading seminar overview:', err);
      toast.error('Unable to load seminar overview');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  // Save venue settings
  const handleSaveVenue = async (e) => {
    e.preventDefault();
    if (!eventId) return;
    try {
      setSavingVenue(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          AuditoriumVenue: venueForm.AuditoriumVenue,
          MaxCapacity: Number(venueForm.MaxCapacity) || 200
        })
      });
      if (!res.ok) throw new Error('Failed to update venue info');
      toast.success('Auditorium details updated successfully');
      loadAllData();
    } catch (err) {
      console.error(err);
      toast.error('Could not save venue details');
    } finally {
      setSavingVenue(false);
    }
  };
  const checkedInCount = useMemo(() => {
    return delegates.filter((d) => d.CheckInStatus === 'CheckedIn').length;
  }, [delegates]);
  const capacity = Number(venueForm.MaxCapacity) || 200;
  const fillPercentage = Math.min(100, Math.round((delegates.length / capacity) * 100));
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Seminar Control Hub &bull; Solo Delegates
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {eventData?.EventName || 'Seminar Overview & Operations'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Auditorium venue logistics, keynote speaker coordination, delegate gate check-in, and conference proceedings.
          </p>
        </div>
        <button
          onClick={loadAllData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer self-start md:self-auto flex items-center gap-2"
          title="Refresh seminar overview"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          <span className="text-xs font-semibold">Refresh</span>
        </button>
      </div>
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Registered Delegates</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{delegates.length}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Cap: {capacity} seats</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Gate Checked-In</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{checkedInCount}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                {delegates.length > 0 ? `${Math.round((checkedInCount / delegates.length) * 100)}% attendance rate` : 'Awaiting check-in'}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${delegates.length > 0 ? Math.round((checkedInCount / delegates.length) * 100) : 0}%` }}
            />
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Keynote Speakers</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{speakers.length}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Invited dignitaries & speakers</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Mic className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Agenda Sessions</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1.5">{sessions.length}</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Talks, panels & breaks scheduled</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
        </div>
      </div>
      {/* Main Grid: Venue Setup & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Venue & Seating Capacity Config */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Auditorium & Seating Capacity</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Configure physical seminar hall details and entry constraints</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSaveVenue} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Auditorium / Hall Name
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={venueForm.AuditoriumVenue}
                    onChange={(e) => setVenueForm({ ...venueForm, AuditoriumVenue: e.target.value })}
                    placeholder="e.g. Dr. APJ Abdul Kalam Central Auditorium"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                  Maximum Seating Capacity
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    required
                    value={venueForm.MaxCapacity}
                    onChange={(e) => setVenueForm({ ...venueForm, MaxCapacity: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Auditorium Seating Occupancy</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {delegates.length} delegates registered out of {capacity} seats capacity ({Math.max(0, capacity - delegates.length)} seats remaining)
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                delegates.length >= capacity
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {delegates.length >= capacity ? 'Capacity Full' : `${fillPercentage}% Reserved`}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingVenue}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingVenue ? 'Saving...' : 'Update Hall Settings'}</span>
              </button>
            </div>
          </form>
        </div>
        {/* Quick Module Navigation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Seminar Modules</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Direct access to seminar operations</p>
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/admin/seminar/speakers')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Keynote Speakers</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{speakers.length} speakers profile added</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </button>
            <button
              onClick={() => navigate('/admin/seminar/agenda')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Conference Agenda</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{sessions.length} sessions scheduled</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </button>
            <button
              onClick={() => navigate('/admin/seminar/attendance')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Seminar Attendance</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Live QR Gate Scanner & Hall Attendance</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </button>
            <button
              onClick={() => navigate('/admin/seminar/resources')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-zinc-900/40 transition group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Proceedings & Slides</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Decks, presentation files & notes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
