import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Radio,
  Play,
  StopCircle,
  RotateCcw,
  Link as LinkIcon,
  ExternalLink,
  Users,
  Calendar,
  Clock,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Sparkles,
  RefreshCw,
  Building2,
  Mail,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import useToast from '../../../../Hooks/useToast';

function formatDate(date) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function AdminVirtualEvent() {
  const toast = useToast();
  const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
  const [currentEventId, setCurrentEventId] = useState(storedAdmin?.EventId || storedAdmin?.eventId || null);

  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [meetUrlInput, setMeetUrlInput] = useState('');
  const [savingMeetUrl, setSavingMeetUrl] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      let eid = currentEventId;
      if (!eid && (storedAdmin?.Id || storedAdmin?.id)) {
        try {
          const res = await fetch(`http://localhost:3000/api/admin/${storedAdmin.Id || storedAdmin.id}`);
          if (res.ok) {
            const data = await res.json();
            const adminData = data.events?.[0] || data.admin;
            if (adminData?.EventId) {
              eid = adminData.EventId;
              setCurrentEventId(eid);
              localStorage.setItem('admin', JSON.stringify({ ...storedAdmin, ...adminData }));
            }
          }
        } catch (e) {
          console.error('Failed to resolve admin event:', e);
        }
      }

      if (eid) {
        loadData(eid);
      } else {
        setLoading(false);
      }
    };

    init();
  }, [currentEventId]);

  const loadData = async (eid) => {
    try {
      setLoading(true);
      const [evRes, teamsRes, timeRes] = await Promise.allSettled([
        fetch(`http://localhost:3000/api/events/${eid}`),
        fetch(`http://localhost:3000/api/teams/event/${eid}`),
        fetch(`http://localhost:3000/api/event_timelines/event/${eid}`)
      ]);

      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const evData = await evRes.value.json();
        const evObj = Array.isArray(evData) ? evData[0] : (evData.event || evData);
        setEvent(evObj);
        setMeetUrlInput(evObj.VirtualMeetUrl || '');
      }

      if (teamsRes.status === 'fulfilled' && teamsRes.value.ok) {
        const tData = await teamsRes.value.json();
        const list = Array.isArray(tData) ? tData : (tData.teams || []);
        setTeams(list);
      }

      if (timeRes.status === 'fulfilled' && timeRes.value.ok) {
        const tlData = await timeRes.value.json();
        const list = Array.isArray(tlData) ? tlData : (tlData.timelines || []);
        setTimelines(list.filter((t) => t.Track === 'Virtual' || t.Track === 'General'));
      }
    } catch (err) {
      console.error('Failed to load virtual event details', err);
      toast.error('Failed to load virtual event data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!currentEventId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`http://localhost:3000/api/events/${currentEventId}/virtual-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ VirtualStatus: newStatus })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Status update failed');
      }

      const data = await res.json();
      setEvent((prev) => ({
        ...prev,
        VirtualStatus: newStatus,
        VirtualStartedAt: data.event?.VirtualStartedAt || (newStatus === 'LIVE' ? new Date().toISOString() : prev?.VirtualStartedAt)
      }));

      if (newStatus === 'LIVE') {
        toast.success('Virtual Event is now LIVE! Participants can join from the event page.');
      } else if (newStatus === 'COMPLETED') {
        toast.info('Virtual Event marked as Completed.');
      } else {
        toast.info('Virtual Event reset to Not Started.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update virtual status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveMeetUrl = async () => {
    if (!currentEventId) return;
    try {
      setSavingMeetUrl(true);
      const res = await fetch(`http://localhost:3000/api/events/${currentEventId}/virtual-meet`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ VirtualMeetUrl: meetUrlInput.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save meeting URL');
      }

      setEvent((prev) => ({ ...prev, VirtualMeetUrl: meetUrlInput.trim() }));
      toast.success('Virtual meeting link updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save meeting URL');
    } finally {
      setSavingMeetUrl(false);
    }
  };

  const copyMeetLink = () => {
    if (!meetUrlInput) return;
    navigator.clipboard.writeText(meetUrlInput);
    setCopiedMeet(true);
    toast.success('Meeting link copied to clipboard!');
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  const isLive = event?.VirtualStatus === 'LIVE';
  const isCompleted = event?.VirtualStatus === 'COMPLETED';
  const isNotStarted = !isLive && !isCompleted;

  // Filter virtual teams
  const virtualTeams = teams.filter((t) => {
    const mode = t.ParticipationMode || '';
    return mode.toLowerCase() === 'virtual' || (!mode && event?.HackathonMode === 'Virtual');
  });

  const filteredTeams = virtualTeams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (t.TeamName && t.TeamName.toLowerCase().includes(q)) ||
      (t.LeaderName && t.LeaderName.toLowerCase().includes(q)) ||
      (t.LeaderEmail && t.LeaderEmail.toLowerCase().includes(q)) ||
      (t.College && t.College.toLowerCase().includes(q))
    );
  });

  const totalVirtualParticipants = virtualTeams.reduce(
    (acc, t) => acc + Number(t.MemberCount || t.TeamSize || 1),
    0
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Loading Virtual Event Control...</p>
      </div>
    );
  }

  if (!currentEventId || !event) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Assigned Event Found</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-md">
          Your admin account is not currently linked to an active event. Please check your admin profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-black/60 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Virtual Event Control Room
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {event.EventName} • Virtual Day
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Start the virtual hackathon on event day, broadcast the Google Meet link, and coordinate online teams.
          </p>
        </div>

        {/* Live Badge status */}
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span>LIVE IN PROGRESS</span>
            </div>
          ) : isCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4 text-slate-500" />
              <span>Event Completed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-sm">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Not Started Yet</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => loadData(currentEventId)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
            title="Refresh details"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Action Banner: START VIRTUAL EVENT */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isLive
          ? 'bg-white dark:bg-zinc-950 border-emerald-500/40 shadow-sm'
          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isLive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'}`}>
                {isLive ? <Radio className="h-5 w-5 animate-pulse" /> : <Play className="h-5 w-5" />}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isLive ? 'Virtual Event is Currently Running' : 'Ready to Kick Off the Virtual Event?'}
              </h2>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {isLive ? (
                <>
                  Participants can now click <strong className="text-emerald-600 dark:text-emerald-400">"Open Virtual Event Page"</strong> from their event details page to join the Google Meet room and access the live agenda.
                  {event.VirtualStartedAt && (
                    <span className="block mt-1 text-xs text-slate-400">
                      Started on: {formatDate(event.VirtualStartedAt)} at {formatTime(event.VirtualStartedAt)}
                    </span>
                  )}
                </>
              ) : (
                <>
                  On the virtual event day, click the button below to turn the virtual track <strong className="text-slate-900 dark:text-white">LIVE</strong>.
                  Registered participants will immediately see the interactive <strong className="text-emerald-600 dark:text-emerald-400">"Open Virtual Event Page"</strong> button on their event screen!
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isNotStarted ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('LIVE')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {actionLoading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
                <span>START VIRTUAL EVENT</span>
              </button>
            ) : isLive ? (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Conclude Event</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('NOT_STARTED')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-slate-300 font-bold text-sm border border-zinc-700 hover:scale-[1.02] transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset to Not Started</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('LIVE')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Re-Open Virtual Event</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Meeting Link Manager + Virtual Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Meet / Video Conference Manager */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Google Meet / Video Conference Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Participants will join this meeting link from their Virtual Event page.
                </p>
              </div>
            </div>
            {event.VirtualMeetUrl && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Check className="h-3 w-3" /> Configured
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="h-4 w-4" />
              </div>
              <input
                type="url"
                value={meetUrlInput}
                onChange={(e) => setMeetUrlInput(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={savingMeetUrl}
                onClick={handleSaveMeetUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {savingMeetUrl ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save Link</span>
              </button>

              {event.VirtualMeetUrl && (
                <>
                  <button
                    type="button"
                    onClick={copyMeetLink}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition"
                    title="Copy Link"
                  >
                    {copiedMeet ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={event.VirtualMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition"
                  >
                    <span>Test</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Tip:</strong> You can paste any conference link here (Google Meet, Zoom, Microsoft Teams, Discord). When participants open their Virtual Event page, they will see a one-click <strong>"Join Live Room"</strong> button.
            </span>
          </div>
        </div>

        {/* Quick Virtual Track Overview */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-500" />
            Virtual Track Stats
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Virtual Teams</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{virtualTeams.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Participants</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{totalVirtualParticipants}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 border-t border-slate-100 dark:border-zinc-800 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Virtual Start Date:</span>
              <span className="font-semibold">{formatDate(event.VirtualStartDate || event.StartDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Virtual End Date:</span>
              <span className="font-semibold">{formatDate(event.VirtualEndDate || event.EndDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Virtual Prize Pool:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{event.VirtualPrizeMoney || event.PrizeMoney || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Virtual Teams Section */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Registered Virtual Teams ({virtualTeams.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Teams registered for the virtual phase of {event.EventName}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team or lead..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Users className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600" />
            No virtual teams found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 uppercase font-bold text-[10px] tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Team Lead</th>
                  <th className="py-3 px-4">College / State</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredTeams.map((team) => (
                  <tr key={team.Id || team.TeamId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {team.TeamName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-zinc-200">{team.LeaderName || 'Lead'}</div>
                      <div className="text-[11px] text-slate-400">{team.LeaderEmail}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{team.College || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400">{team.State}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Users className="h-3 w-3 text-slate-400" />
                        {team.MemberCount || team.TeamSize || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        Virtual Track
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                        {team.RegistrationStatus || 'Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Virtual Timelines / Day Milestones Preview */}
      {timelines.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                Virtual Day Agenda & Milestones
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Schedule of virtual rounds and evaluation phases
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {timelines.length} Milestones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {timelines.map((tl, index) => (
              <div
                key={tl.Id || index}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-1.5"
              >
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-3 w-3" />
                  <span>{tl.TimelineDate}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100">{tl.Heading}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {tl.Description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
