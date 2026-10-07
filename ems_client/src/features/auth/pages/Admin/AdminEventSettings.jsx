import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  Settings,
  CheckCircle2,
  AlertCircle,
  Users,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Video,
  Info,
  ChevronRight
} from 'lucide-react';
import useToast from '../../../../Hooks/useToast';
import useAuth from '../../../../Hooks/useAuth';

export default function AdminEventSettings() {
  const toast = useToast();
  const { user } = useAuth();

  const storedAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  })();

  const adminEventId = storedAdmin?.EventId || user?.EventId;

  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(adminEventId ? Number(adminEventId) : null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable settings form state
  const [settingsForm, setSettingsForm] = useState({
    VirtualRegistrationOpen: 1,
    PhysicalRegistrationOpen: 1,
    RegistrationOpen: 1,
    VirtualRegistrationStart: '',
    VirtualRegistrationEnd: '',
    PhysicalRegistrationStart: '',
    PhysicalRegistrationEnd: '',
    RegistrationStart: '',
    RegistrationEnd: '',
    TeamSize: '4',
    VirtualStatus: 'NOT_STARTED',
    VirtualMeetUrl: '',
    HackathonMode: 'Both'
  });

  useEffect(() => {
    loadAllEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventSettings(selectedEventId);
    }
  }, [selectedEventId]);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/events');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.events || []);
        setEventsList(list);

        if (!selectedEventId && list.length > 0) {
          const defaultId = adminEventId ? Number(adminEventId) : list[0].Id;
          setSelectedEventId(defaultId);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events list');
    } finally {
      setLoading(false);
    }
  };

  const loadEventSettings = async (id) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/events/${id}`);
      if (!res.ok) throw new Error('Failed to load event details');
      const data = await res.json();
      const ev = Array.isArray(data) ? data[0] : (data.event || data);

      setEventData(ev);
      setSettingsForm({
        VirtualRegistrationOpen: ev.VirtualRegistrationOpen !== undefined ? (ev.VirtualRegistrationOpen ? 1 : 0) : 1,
        PhysicalRegistrationOpen: ev.PhysicalRegistrationOpen !== undefined ? (ev.PhysicalRegistrationOpen ? 1 : 0) : 1,
        RegistrationOpen: ev.RegistrationOpen !== undefined ? (ev.RegistrationOpen ? 1 : 0) : 1,
        VirtualRegistrationStart: ev.VirtualRegistrationStart || '',
        VirtualRegistrationEnd: ev.VirtualRegistrationEnd || '',
        PhysicalRegistrationStart: ev.PhysicalRegistrationStart || '',
        PhysicalRegistrationEnd: ev.PhysicalRegistrationEnd || '',
        RegistrationStart: ev.RegistrationStart || '',
        RegistrationEnd: ev.RegistrationEnd || '',
        TeamSize: ev.TeamSize || '4',
        VirtualStatus: ev.VirtualStatus || 'NOT_STARTED',
        VirtualMeetUrl: ev.VirtualMeetUrl || '',
        HackathonMode: ev.HackathonMode || 'Both'
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not load event settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettingsForm((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettingsForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedEventId) return;

    // Validate TeamSize
    const ts = String(settingsForm.TeamSize).trim();
    if (!ts) {
      toast.error('Please enter a valid Team Size (e.g. "4" or "2-4")');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`http://localhost:3000/api/events/${selectedEventId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update settings');
      }

      const resData = await res.json();
      if (resData.event) {
        setEventData(resData.event);
      }
      toast.success('Event settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save event settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-zinc-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Event Settings & Registration Controls
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Manage track registrations, pause/resume controls, and team size formation policies.
              </p>
            </div>
          </div>
        </div>

        {/* Event Selector Dropdown if multiple events */}
        {eventsList.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Event:</span>
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {eventsList.map((ev) => (
                <option key={ev.Id} value={ev.Id}>
                  {ev.EventName} (ID: {ev.Id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 dark:text-zinc-500 text-sm">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <span>Loading event settings...</span>
        </div>
      ) : !eventData ? (
        <div className="p-8 text-center rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Event Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Please select an event to configure settings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Event Banner */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active Event Target
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {eventData.EventName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Mode: <strong className="text-slate-700 dark:text-zinc-300">{eventData.HackathonMode || 'Virtual and Physical'}</strong> • Status: <strong className="text-slate-700 dark:text-zinc-300">{eventData.EventStatus || 'Active'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadEventSettings(selectedEventId)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 transition"
              >
                Reset
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save All Settings</span>
              </button>
            </div>
          </div>

          {/* Section 1: Track-Specific Registration Control Hub */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Registration Pause & Resume Controls
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Instantly pause or open registrations independently for Virtual and Physical tracks.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Virtual Track Card */}
              <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
                settingsForm.VirtualRegistrationOpen === 1
                  ? 'bg-slate-50/60 dark:bg-zinc-900/60 border-emerald-500/30'
                  : 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Virtual Track Registration</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    settingsForm.VirtualRegistrationOpen === 1
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {settingsForm.VirtualRegistrationOpen === 1 ? 'Open' : 'Paused by Admin'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  When paused, participants cannot register new teams for the Virtual track, and the UI displays registration paused.
                </p>

                {/* Toggle Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleToggle('VirtualRegistrationOpen')}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                      settingsForm.VirtualRegistrationOpen === 1
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                    }`}
                  >
                    {settingsForm.VirtualRegistrationOpen === 1 ? (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Pause Virtual Registrations</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Resume / Open Virtual Registrations</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Deadlines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Virtual Reg Start</label>
                    <input
                      type="date"
                      name="VirtualRegistrationStart"
                      value={settingsForm.VirtualRegistrationStart ? settingsForm.VirtualRegistrationStart.split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Virtual Reg Deadline</label>
                    <input
                      type="date"
                      name="VirtualRegistrationEnd"
                      value={settingsForm.VirtualRegistrationEnd ? settingsForm.VirtualRegistrationEnd.split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Track Card */}
              <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
                settingsForm.PhysicalRegistrationOpen === 1
                  ? 'bg-slate-50/60 dark:bg-zinc-900/60 border-amber-500/30'
                  : 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Physical / Campus Track Registration</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    settingsForm.PhysicalRegistrationOpen === 1
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {settingsForm.PhysicalRegistrationOpen === 1 ? 'Open' : 'Paused by Admin'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  When paused, campus registrations stop immediately, preventing teams from signing up for the on-ground track.
                </p>

                {/* Toggle Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleToggle('PhysicalRegistrationOpen')}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
                      settingsForm.PhysicalRegistrationOpen === 1
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                    }`}
                  >
                    {settingsForm.PhysicalRegistrationOpen === 1 ? (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Pause Physical Registrations</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Resume / Open Physical Registrations</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Deadlines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Physical Reg Start</label>
                    <input
                      type="date"
                      name="PhysicalRegistrationStart"
                      value={settingsForm.PhysicalRegistrationStart ? settingsForm.PhysicalRegistrationStart.split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Physical Reg Deadline</label>
                    <input
                      type="date"
                      name="PhysicalRegistrationEnd"
                      value={settingsForm.PhysicalRegistrationEnd ? settingsForm.PhysicalRegistrationEnd.split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Strict Team Formation Constraint Rules */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Team Formation Rules & Size Policy
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Enforces strict participant count per team. Teams cannot register without meeting this rule.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Allowed Team Size Specification
                </label>
                <input
                  type="text"
                  name="TeamSize"
                  value={settingsForm.TeamSize}
                  onChange={handleInputChange}
                  placeholder="e.g. 4 or 2-4"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <p className="text-[11px] text-slate-400">
                  Set a single number (e.g. <strong className="text-slate-600 dark:text-zinc-300">4</strong>) or range (e.g. <strong className="text-slate-600 dark:text-zinc-300">2-4</strong>).
                </p>
              </div>

              <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Enforcement Guarantee:</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                  <li>Participants must provide exactly 1 Team Lead + required members to form a team.</li>
                  <li>Incomplete teams (e.g. fewer members than specified) will be rejected automatically.</li>
                  <li>Duplicate registrations within the same track remain strictly disallowed.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Virtual Hackathon Event Settings */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Virtual Hackathon Hub & Meeting URL
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Set meeting room links and control event day live state.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Google Meet / Video Conference Link
                </label>
                <input
                  type="url"
                  name="VirtualMeetUrl"
                  value={settingsForm.VirtualMeetUrl}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Virtual Track Status
                </label>
                <select
                  name="VirtualStatus"
                  value={settingsForm.VirtualStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="NOT_STARTED">NOT STARTED (Scheduled)</option>
                  <option value="LIVE">LIVE (Participants Can Join)</option>
                  <option value="COMPLETED">COMPLETED (Concluded)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Ensure you click <strong>Save All Settings</strong> after modifying registration toggles or team sizes.
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save All Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
