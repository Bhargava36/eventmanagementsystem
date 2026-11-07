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
  QrCode,
  Send,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Save,
  UserCheck,
  HeartHandshake,
  DollarSign,
  Shirt,
  MapPin,
  ArrowRight,
  Plus
} from 'lucide-react';

const PRESET_BATCHES = [
  '2010', '2011', '2012', '2013', '2014', '2015',
  '2016', '2017', '2018', '2019', '2020', '2021',
  '2022', '2023', '2024', '2025'
];

export default function AlumniOverviewPage() {
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
  const [registrations, setRegistrations] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [newBatchInput, setNewBatchInput] = useState('');

  // Alumni Configuration State
  const [config, setConfig] = useState({
    TargetBatches: '2015,2016,2017,2018,2019,2020,2021,2022,2023,2024',
    AllowGuests: true,
    MaxGuests: 1,
    VenueHall: 'Main Campus Auditorium & Lawns',
    DressCode: 'Smart Casual / Festive Traditional',
    WelcomeNote: 'Welcome back home! We are thrilled to celebrate your journey, reconnect with old classmates, and build lifelong bonds.',
    AlumniFundLink: ''
  });

  const loadAllData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [evRes, cfgRes, regRes, spkRes, sesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/${eventId}`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/config`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/registrations`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/speakers`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/agenda`)
      ]);

      if (evRes.ok) {
        const ev = await evRes.json();
        const cur = Array.isArray(ev) ? ev[0] : (ev.event || ev);
        setEventData(cur);
      }

      if (cfgRes.ok) {
        const cData = await cfgRes.json();
        const curCfg = cData.config || cData;
        if (curCfg && (curCfg.EventId || curCfg.VenueHall)) {
          setConfig({
            TargetBatches: curCfg.TargetBatches || '',
            AllowGuests: Boolean(curCfg.AllowGuests === 1 || curCfg.AllowGuests === true),
            MaxGuests: Number(curCfg.MaxGuests) || 1,
            VenueHall: curCfg.VenueHall || 'Main Campus Auditorium & Lawns',
            DressCode: curCfg.DressCode || 'Smart Casual / Festive Traditional',
            WelcomeNote: curCfg.WelcomeNote || '',
            AlumniFundLink: curCfg.AlumniFundLink || ''
          });
        }
      }

      if (regRes.ok) {
        const rData = await regRes.json();
        setRegistrations(rData.registrations || []);
      }

      if (spkRes.ok) {
        const sData = await spkRes.json();
        setSpeakers(sData.speakers || []);
      }

      if (sesRes.ok) {
        const sesData = await sesRes.json();
        setSessions(sesData.sessions || sesData.agenda || (Array.isArray(sesData) ? sesData : []));
      }
    } catch (err) {
      console.error('Failed to load alumni overview data:', err);
      toast.error('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Derived Batches Array
  const selectedBatches = useMemo(() => {
    return (config.TargetBatches || '')
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
  }, [config.TargetBatches]);

  const toggleBatch = (batch) => {
    let updated;
    if (selectedBatches.includes(batch)) {
      updated = selectedBatches.filter((b) => b !== batch);
    } else {
      updated = [...selectedBatches, batch].sort();
    }
    setConfig((prev) => ({ ...prev, TargetBatches: updated.join(',') }));
  };

  const handleAddCustomBatch = (e) => {
    e.preventDefault();
    const b = newBatchInput.trim();
    if (!b) return;
    if (!selectedBatches.includes(b)) {
      const updated = [...selectedBatches, b].sort();
      setConfig((prev) => ({ ...prev, TargetBatches: updated.join(',') }));
    }
    setNewBatchInput('');
  };

  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    if (!eventId) return;
    try {
      setSavingConfig(true);
      const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error('Failed to save configuration');
      toast.success('Alumni configuration saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error saving configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = registrations.length;
    const attending = registrations.filter((r) => (r.RsvpStatus || 'ATTENDING').toUpperCase() === 'ATTENDING').length;
    const totalGuests = registrations.reduce((acc, r) => acc + (Number(r.GuestCount) || 0), 0);
    const checkedIn = registrations.filter((r) => r.GateCheckInStatus === 'CheckedIn').length;
    const foodServed = registrations.filter((r) => Boolean(r.FoodTokenScanned)).length;
    const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return { total, attending, totalGuests, checkedIn, foodServed, checkInRate };
  }, [registrations]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header Banner in Solid Theme - No Gradients */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 text-slate-900 dark:text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Alumni Meet Operations Room</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {eventData?.EventName || 'Grand Alumni Reunion'}
            </h1>
            <p className="text-slate-600 dark:text-zinc-400 text-sm max-w-2xl">
              Manage reunion configuration, target graduating batches, track alumni RSVPs, deploy camera QR check-ins, and celebrate lifelong camaraderie.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admin/alumni/attendance')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 shadow-sm transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-emerald-500" />
              Gate Scanner
            </button>
            <button
              onClick={() => navigate('/admin/alumni/invites')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              Dispatch Invites
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/admin/alumni/registrations')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Total Registered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{stats.total}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Alumni</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
            {stats.attending} confirmed RSVPs
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/admin/alumni/registrations')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Accompanying Guests</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{stats.totalGuests}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+Guests</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
            {stats.total + stats.totalGuests} total banquet attendees
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/admin/alumni/attendance')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Gate Check-in</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{stats.checkedIn}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{stats.checkInRate}% arrived</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.checkInRate}%` }} />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => navigate('/admin/alumni/agenda')}
          className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">Reunion Agenda</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold">{sessions.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Activities</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
            {speakers.length} distinguished keynote speakers
          </p>
        </motion.div>
      </div>

      {/* Main Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold">Reunion Configuration &amp; Policies</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Configure target batches, guest permissions, banquet hall venue, and personalized welcome messaging.
            </p>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {savingConfig ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* Target Batches Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-gray-200 uppercase tracking-wider block">
              Target Graduating Batches (Class of ...)
            </label>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Click to toggle graduating batches targeted for this meet or add custom batches below:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_BATCHES.map((batch) => {
                const isSelected = selectedBatches.includes(batch);
                return (
                  <button
                    type="button"
                    key={batch}
                    onClick={() => toggleBatch(batch)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    Class of {batch}
                    {isSelected && ' ✓'}
                  </button>
                );
              })}
            </div>

            {/* Custom Batch input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add other batch (e.g. 2005 or 1999)"
                value={newBatchInput}
                onChange={(e) => setNewBatchInput(e.target.value)}
                className="w-64 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomBatch}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Batch
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Venue Hall */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                Venue Hall &amp; Gathering Area
              </label>
              <input
                type="text"
                value={config.VenueHall}
                onChange={(e) => setConfig({ ...config, VenueHall: e.target.value })}
                placeholder="e.g. Main Campus Auditorium &amp; North Lawns"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Dress Code */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-2">
                <Shirt className="w-3.5 h-3.5 text-emerald-500" />
                Dress Code Recommendation
              </label>
              <input
                type="text"
                value={config.DressCode}
                onChange={(e) => setConfig({ ...config, DressCode: e.target.value })}
                placeholder="e.g. Smart Casual / Festive Traditional"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Guest Policy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                  Allow Guests / Spouse (+1 Option)
                </label>
                <input
                  type="checkbox"
                  checked={config.AllowGuests}
                  onChange={(e) => setConfig({ ...config, AllowGuests: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Permit alumni to bring a partner, family member, or friend to the reunion banquet.
              </p>
              {config.AllowGuests && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-slate-600 dark:text-gray-400">Max Allowed Guests:</span>
                  <select
                    value={config.MaxGuests}
                    onChange={(e) => setConfig({ ...config, MaxGuests: Number(e.target.value) })}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1 Guest (+1)</option>
                    <option value={2}>2 Guests (+2)</option>
                    <option value={3}>3 Guests (Family)</option>
                    <option value={4}>4 Guests (Family)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Alumni Fund / Giving Link */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Alumni Scholarship / Endowment Fund URL
              </label>
              <input
                type="url"
                value={config.AlumniFundLink}
                onChange={(e) => setConfig({ ...config, AlumniFundLink: e.target.value })}
                placeholder="https://giving.college.edu/alumni-fund"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Welcome Note */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
              Personalized Welcome Note (Displayed on Passes &amp; Invitations)
            </label>
            <textarea
              rows={3}
              value={config.WelcomeNote}
              onChange={(e) => setConfig({ ...config, WelcomeNote: e.target.value })}
              placeholder="A heartfelt message to your returning alumni..."
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-sm leading-relaxed"
            />
          </div>
        </form>
      </div>

      {/* Quick Launchpad to 11 Steps */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-500" />
          Alumni Event Operations Hub
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/admin/alumni/agenda')}
            className="p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 shadow-sm cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <CalendarDays className="w-5 h-5 text-emerald-500" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm">Agenda &amp; Distinguished Speakers</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Schedule activities, keynote talks, campus tours, and distinguished alumni sessions.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/alumni/registrations')}
            className="p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 shadow-sm cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-emerald-500" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm">Registrations &amp; Directory</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Filter by batch, inspect accompanying guest lists, view attendee profiles, and export CSV.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/alumni/attendance')}
            className="p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 shadow-sm cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <QrCode className="w-5 h-5 text-emerald-500" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm">Live Gate &amp; Banquet Scanner</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Instant camera QR check-in at gate and meal voucher validation with audio feedback.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/alumni/invites')}
            className="p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 shadow-sm cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Send className="w-5 h-5 text-emerald-500" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm">Batch Invites &amp; WhatsApp Dispatcher</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Compose custom invitations and broadcast them to previous alumni batches.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/alumni/memories')}
            className="p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 shadow-sm cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Camera className="w-5 h-5 text-emerald-500" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm">Memory Wall &amp; Nostalgia Gallery</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Curate nostalgic photos, batch moments, and reunion highlights for attendees.
            </p>
          </div>

          <div
            onClick={() => navigate('/admin/feedback')}
            className="p-5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 hover:border-emerald-500/60 shadow-sm cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h4 className="font-bold text-sm">Alumni Feedback &amp; Ratings</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Review post-reunion feedback, ratings, and testimonials from attending alumni.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
