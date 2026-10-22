import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Radio,
  ExternalLink,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Code,
  Sparkles,
  Lock,
  Unlock,
  Check,
  Search,
  Filter,
  Layers,
  Timer,
  AlertTriangle,
  Lightbulb,
  Target,
  Hash,
  X
} from 'lucide-react';
import useAuth from '../../../../Hooks/useAuth';
import useToast from '../../../../Hooks/useToast';

function formatDate(date) {
  if (!date) return 'TBA';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return date;
  }
}

function formatTime(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
}

export default function ParticipantVirtualEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Problem Statements & Publishing states
  const [publishStatus, setPublishStatus] = useState({
    ThemePublished: 0,
    ProblemStatementsPublished: 0,
    PSSelectionDeadline: null,
    PSMaxTeamsPerStatement: 5
  });
  const [problemStatements, setProblemStatements] = useState([]);
  const [themes, setThemes] = useState([]);
  const [teamSelection, setTeamSelection] = useState(null);
  const [selectedPSToConfirm, setSelectedPSToConfirm] = useState(null);
  const [submittingSelection, setSubmittingSelection] = useState(false);

  // Filters
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(null);

  const userId = user?.Id || user?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      loadAll();
    }
  }, [id, userId]);

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [evRes, timeRes, psRes, statusRes, themesRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/events/${id}`),
        fetch(`${API_BASE_URL}/api/event_timelines/event/${id}`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${id}`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${id}/publish-status`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${id}/themes`)
      ]);

      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const evData = await evRes.value.json();
        const evObj = Array.isArray(evData) ? evData[0] : (evData.event || evData);
        setEvent(evObj);
      }

      if (timeRes.status === 'fulfilled' && timeRes.value.ok) {
        const tlData = await timeRes.value.json();
        const list = Array.isArray(tlData) ? tlData : (tlData.timelines || []);
        setTimelines(list.filter((t) => t.Track === 'Virtual' || t.Track === 'General'));
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const stData = await statusRes.value.json();
        setPublishStatus(stData);
      }

      if (psRes.status === 'fulfilled' && psRes.value.ok) {
        const psData = await psRes.value.json();
        setProblemStatements(psData.problemStatements || []);
      }

      if (themesRes.status === 'fulfilled' && themesRes.value.ok) {
        const thData = await themesRes.value.json();
        setThemes(thData.themes || []);
      }

      // Load user's registered team for this event
      if (userId) {
        try {
          const teamsRes = await fetch(`${API_BASE_URL}/api/teams/my-teams/${userId}`);
          if (teamsRes.ok) {
            const data = await teamsRes.json();
            const list = data.teams || [];
            const myTeam = list.find((t) => Number(t.EventId) === Number(id));
            if (myTeam) {
              setTeam(myTeam);
              const teamIdentifier = myTeam.Id || myTeam.TeamId;
              if (teamIdentifier) {
                // Fetch members
                const infoRes = await fetch(`${API_BASE_URL}/api/teams/info/${teamIdentifier}/${userId}`);
                if (infoRes.ok) {
                  const infoData = await infoRes.json();
                  setTeamMembers(infoData.members || []);
                }

                // Fetch team's problem statement selection
                const selRes = await fetch(`${API_BASE_URL}/api/problem-statements/event/${id}/team/${teamIdentifier}`);
                if (selRes.ok) {
                  const selData = await selRes.json();
                  setTeamSelection(selData.selection || null);
                }
              }
            }
          }
        } catch (e) {
          console.error('Failed to load team data:', e);
        }
      }
    } catch (err) {
      console.error('Virtual event load error:', err);
      toast.error('Failed to load virtual event details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Live countdown timer for problem statement selection deadline
  useEffect(() => {
    const deadlineStr = publishStatus.PSSelectionDeadline || event?.PSSelectionDeadline;
    if (!deadlineStr) {
      setTimeLeft(null);
      return;
    }

    const targetDate = new Date(deadlineStr).getTime();
    if (isNaN(targetDate)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ expired: true, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ expired: false, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [publishStatus.PSSelectionDeadline, event?.PSSelectionDeadline]);

  // Real-time updates via WebSocket (Auto-sync when themes/problem statements are published or changed)
  useEffect(() => {
    if (!id) return;

    let socket = null;
    let reconnectTimer = null;
    let isMounted = true;

    const connectWS = () => {
      try {
        const wsBase = (API_BASE_URL || 'http://localhost:3000').replace(/^http/, 'ws');
        socket = new WebSocket(wsBase);

        socket.onopen = () => {
          socket.send(JSON.stringify({ type: 'JOIN_EVENT', eventId: id }));
        };

        socket.onmessage = (msgEvent) => {
          try {
            const data = JSON.parse(msgEvent.data);
            if (!data.eventId || String(data.eventId) === String(id)) {
              // Trigger reload in background without page refresh
              loadAll();
            }
          } catch (e) {
            // Ignore parse error
          }
        };

        socket.onclose = () => {
          if (isMounted) {
            reconnectTimer = setTimeout(connectWS, 3000);
          }
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (e) {
        console.warn('WebSocket connection failed:', e);
      }
    };

    connectWS();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [id, userId]);

  // Handle Team Selection submission
  const handleConfirmSelection = async () => {
    if (!selectedPSToConfirm || !team) return;
    const teamIdentifier = team.Id || team.TeamId;

    try {
      setSubmittingSelection(true);
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${id}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: teamIdentifier,
          problemStatementId: selectedPSToConfirm.Id
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to select problem statement');
      }

      toast.success(`Successfully locked in: ${selectedPSToConfirm.ProblemCode}`);
      setSelectedPSToConfirm(null);
      // Reload selections and counts
      loadAll();
    } catch (err) {
      console.error('Selection error:', err);
      toast.error(err.message || 'Failed to select problem statement');
    } finally {
      setSubmittingSelection(false);
    }
  };

  // Combined list of themes (from event_themes table or statements)
  const displayThemes = useMemo(() => {
    const list = [...themes];
    problemStatements.forEach((ps) => {
      if (ps.Theme && ps.Theme.trim() && !list.some(t => t.ThemeName?.toLowerCase() === ps.Theme.trim().toLowerCase())) {
        list.push({ Id: ps.Theme, ThemeName: ps.Theme.trim(), Description: '' });
      }
    });
    return list;
  }, [themes, problemStatements]);

  const uniqueThemes = useMemo(() => {
    return displayThemes.map(t => t.ThemeName);
  }, [displayThemes]);

  // Filtered problem statements
  const filteredStatements = useMemo(() => {
    return problemStatements.filter((ps) => {
      const matchesTheme =
        selectedThemeFilter === 'ALL' ||
        (ps.Theme && ps.Theme.toLowerCase() === selectedThemeFilter.toLowerCase());

      const matchesSearch =
        !searchQuery ||
        ps.Title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.ProblemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.Description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.Category?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTheme && matchesSearch;
    });
  }, [problemStatements, selectedThemeFilter, searchQuery]);

  const isThemePublished = Boolean(
    publishStatus.ThemePublished === 1 ||
    publishStatus.ThemePublished === true ||
    event?.ThemePublished === 1 ||
    event?.ThemePublished === true
  );

  const isPSPublished = Boolean(
    publishStatus.ProblemStatementsPublished === 1 ||
    publishStatus.ProblemStatementsPublished === true ||
    event?.ProblemStatementsPublished === 1 ||
    event?.ProblemStatementsPublished === true
  );

  const isLive = event?.VirtualStatus === 'LIVE';
  const meetUrl = event?.VirtualMeetUrl;
  const maxTeamsPerPS = publishStatus.PSMaxTeamsPerStatement || event?.PSMaxTeamsPerStatement || 5;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Loading Virtual Event Hub...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Event Not Found</h2>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Explore Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-zinc-100 p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
        <Link
          to={`/user/events/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Event Details</span>
        </Link>

        <button
          type="button"
          onClick={loadAll}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Hero Live Status Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isLive
          ? 'bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-slate-950 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              {isLive ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>LIVE VIRTUAL HACKATHON IN PROGRESS</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Scheduled • Waiting for Start</span>
                </div>
              )}
              <span className="text-xs text-slate-400 font-medium">Virtual Track Room</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {event.EventName}
            </h1>

            <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {isLive
                ? 'The virtual hackathon is now in session! Click below to join the Google Meet room and connect with mentors and jury panels.'
                : 'Welcome to the Virtual Hackathon Hub. On event day, when organizers initiate the session, the live meeting room will activate here.'}
            </p>
          </div>

          {/* Action Button: JOIN GOOGLE MEET */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isLive ? (
              meetUrl ? (
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
                >
                  <Video className="h-4 w-4" />
                  <span>JOIN GOOGLE MEET ROOM</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-600 dark:text-zinc-400">
                  <p className="font-bold text-slate-900 dark:text-white">Event is LIVE</p>
                  <p className="text-[11px] mt-0.5">Organizers will provide the meeting URL shortly.</p>
                </div>
              )
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs">
                <Clock className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                <p className="font-bold text-slate-900 dark:text-white">Starts {formatDate(event.VirtualStartDate || event.StartDate)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Room goes LIVE once organizers begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: PUBLISHED THEMES SHOWCASE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Hackathon Themes
                {isThemePublished ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                    Published
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                    Awaiting Announcement
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Official innovation domains and tracks announced by organizers
              </p>
            </div>
          </div>
        </div>

        {isThemePublished ? (
          displayThemes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayThemes.map((themeObj, idx) => {
                const themeName = themeObj.ThemeName;
                const count = problemStatements.filter(
                  (p) => (p.Theme || '').trim().toLowerCase() === themeName.trim().toLowerCase()
                ).length;
                return (
                  <div
                    key={idx}
                    className="group relative p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm transition-all overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                        Theme #{idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {count} {count === 1 ? 'Statement' : 'Statements'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {themeName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-3">
                      {themeObj.Description || `Official hackathon innovation track for ${event.EventName}.`}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
              <Sparkles className="h-8 w-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Themes Officially Published</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                Organizers have opened the theme phase. Detailed problem statements will be displayed below.
              </p>
            </div>
          )
        ) : (
          <div className="p-8 rounded-3xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <Lock className="h-7 w-7 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Themes Locked</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500 max-w-md mx-auto">
              Organizers will officially publish the hackathon themes here prior to opening problem statement selection.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: PROBLEM STATEMENTS & SELECTION WORKFLOW */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Problem Statements
                {isPSPublished ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                    Live & Selection Open
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-500 text-[10px] font-extrabold uppercase">
                    Locked
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Choose one problem statement for your team. Max {maxTeamsPerPS} teams per statement.
              </p>
            </div>
          </div>

          {/* Selection Deadline & Live Countdown */}
          {isPSPublished && (
            <div className="flex flex-wrap items-center gap-2">
              {timeLeft && (
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-bold ${
                  timeLeft.expired
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse'
                }`}>
                  <Timer className="h-3.5 w-3.5" />
                  {timeLeft.expired ? (
                    <span>Selection Window Closed • Auto-assignment Active</span>
                  ) : (
                    <span>
                      Selection Deadline: {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s left
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* TEAM'S CURRENT SELECTION STATUS BANNER */}
        {isPSPublished && team && (
          <div className="p-4 sm:p-5 rounded-3xl border transition-all">
            {teamSelection ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                      <CheckCircle2 className="h-3 w-3" />
                      Locked In For Team {team.TeamName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                      {teamSelection.SelectionType === 'auto' ? '🤖 System Auto-Assigned' : '✓ Manual Selection'}
                    </span>
                    {teamSelection.Theme && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 text-[10px] font-bold">
                        Theme: {teamSelection.Theme}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {teamSelection.ProblemCode}: {teamSelection.ProblemTitle}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-3xl">
                    {teamSelection.Description}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Selected at: {formatDate(teamSelection.SelectedAt)} {formatTime(teamSelection.SelectedAt)}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20">
                    Active Assignment
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                      Team {team.TeamName} has not selected a problem statement yet!
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      Please pick a problem statement from the list below before the timer runs out. If not selected in time, a statement will be automatically assigned to your team!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROBLEM STATEMENTS LISTING */}
        {isPSPublished ? (
          <div className="space-y-4">
            {/* Search & Theme Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Theme Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedThemeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedThemeFilter === 'ALL'
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-white'
                  }`}
                >
                  All Themes ({problemStatements.length})
                </button>
                {uniqueThemes.map((themeName) => (
                  <button
                    key={themeName}
                    type="button"
                    onClick={() => setSelectedThemeFilter(themeName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedThemeFilter.toLowerCase() === themeName.toLowerCase()
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:text-white'
                    }`}
                  >
                    {themeName}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problem statements..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Statements Grid */}
            {filteredStatements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStatements.map((ps) => {
                  const currentCount = ps.SelectedTeamsCount || 0;
                  const maxLimit = ps.MaxTeams || maxTeamsPerPS;
                  const isFull = currentCount >= maxLimit;
                  const isSelectedByMyTeam = teamSelection && teamSelection.ProblemStatementId === ps.Id;
                  const isDeadlinePassed = Boolean(timeLeft && timeLeft.expired);

                  // Progress percentage
                  const percent = Math.min(100, Math.round((currentCount / maxLimit) * 100));

                  return (
                    <div
                      key={ps.Id}
                      className={`p-6 rounded-3xl bg-white dark:bg-zinc-950 border transition-all flex flex-col justify-between space-y-4 ${
                        isSelectedByMyTeam
                          ? 'border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                          : isFull
                          ? 'border-slate-200 dark:border-zinc-800 opacity-75'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                              {ps.ProblemCode}
                            </span>
                            {ps.Theme && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-[10px] font-bold">
                                {ps.Theme}
                              </span>
                            )}
                            {ps.Category && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-medium">
                                {ps.Category}
                              </span>
                            )}
                          </div>

                          {isSelectedByMyTeam && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                              <Check className="h-3 w-3" /> Your Team's Pick
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {ps.Title}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-4">
                          {ps.Description}
                        </p>
                      </div>

                      {/* Capacity Bar & Action Button */}
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                        {/* Slot Capacity indicator */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-500 dark:text-zinc-400">
                              Team Slots: {currentCount} / {maxLimit} filled
                            </span>
                            <span className={`font-bold ${
                              isFull ? 'text-rose-500' : percent > 60 ? 'text-amber-500' : 'text-emerald-500'
                            }`}>
                              {isFull ? 'SLOT FULL' : `${maxLimit - currentCount} slots left`}
                            </span>
                          </div>

                          {/* Progress track */}
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isFull
                                  ? 'bg-rose-500'
                                  : percent > 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Action: Select button */}
                        {team ? (
                          isSelectedByMyTeam ? (
                            <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs text-center flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Currently Selected for {team.TeamName}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedPSToConfirm(ps)}
                              disabled={isFull || isDeadlinePassed}
                              className={`w-full py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-2 ${
                                isFull
                                  ? 'bg-slate-200 dark:bg-zinc-900 text-slate-400 cursor-not-allowed'
                                  : isDeadlinePassed
                                  ? 'bg-slate-200 dark:bg-zinc-900 text-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 active:scale-[0.99]'
                              }`}
                            >
                              <Target className="h-3.5 w-3.5" />
                              <span>
                                {isFull
                                  ? 'Slot Limit Reached (Max 5)'
                                  : isDeadlinePassed
                                  ? 'Selection Window Closed'
                                  : 'Select This Problem Statement'}
                              </span>
                            </button>
                          )
                        ) : (
                          <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-400 text-xs font-semibold text-center">
                            You must be part of a registered team to select
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
                <Target className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Problem Statements Found</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Try adjusting your search query or theme filter.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-center space-y-3">
            <Lock className="h-8 w-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Problem Statements Are Locked
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Organizers will officially publish problem statements following the theme announcement. Once published, all registered teams will have a dedicated selection window to choose their preferred statement.
            </p>
          </div>
        )}
      </div>

      {/* CONFIRMATION SELECTION MODAL */}
      <AnimatePresence>
        {selectedPSToConfirm && team && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedPSToConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="my-auto w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-emerald-500/30 p-6 text-slate-900 dark:text-white shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Confirm Problem Statement
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPSToConfirm(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                    {selectedPSToConfirm.ProblemCode}
                  </span>
                  {selectedPSToConfirm.Theme && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-[10px] font-bold">
                      {selectedPSToConfirm.Theme}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedPSToConfirm.Title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                  {selectedPSToConfirm.Description}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <span>Selected For:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{team.TeamName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Once confirmed, this problem statement will be recorded as your team's official challenge for {event.EventName}.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPSToConfirm(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  disabled={submittingSelection}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center gap-2"
                >
                  {submittingSelection ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Locking in...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm & Lock In</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION 3: REGISTERED TEAM & VIRTUAL SPRINT RESOURCES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User's Registered Team Details */}
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Your Registered Team
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              Virtual Track
            </span>
          </div>

          {team ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Name</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{team.TeamName}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{team.College || 'Registered Team'}</p>
              </div>

              {teamMembers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Members ({teamMembers.length})</span>
                  <div className="space-y-1.5">
                    {teamMembers.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs border border-slate-100 dark:border-zinc-800"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{m.UserName}</p>
                          <p className="text-[10px] text-slate-400">{m.Email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                          {m.Role === 'TeamLead' ? 'Lead' : 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              <p>You are participating as an individual or your team is being assigned.</p>
            </div>
          )}
        </div>

        {/* Problem Statements & Guidelines */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Virtual Sprint Resources & Protocol
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Virtual Requirements</span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {event.VirtualRequirements || 'Stable internet connection, GitHub repository, functioning webcam and microphone for virtual pitching.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Virtual Facilities Provided</span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {event.VirtualFacilities || 'Online Discord / Meet technical support channels, mentor review slots, digital submission portal.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Virtual Submission Protocol:</strong> All commits made during the virtual sprint must be pushed to your team's designated repository before the code freeze deadline.
            </span>
          </div>
        </div>
      </div>

      {/* Virtual Schedule / Timelines */}
      {timelines.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Virtual Track Live Timeline & Milestones
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {timelines.length} Phases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {timelines.map((tl, index) => (
              <div
                key={tl.Id || index}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-emerald-500/40 transition"
              >
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{tl.TimelineDate}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tl.Heading}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
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
