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
  X,
  FolderGit2,
  Globe,
  UploadCloud,
  Send,
  Edit3
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
  const { user, token } = useAuth();

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

  // Project submission state
  const [projectSubmission, setProjectSubmission] = useState(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    githubRepoUrl: '',
    liveDemoUrl: '',
    drivePptUrl: '',
    techStack: '',
    description: ''
  });
  const [submittingProject, setSubmittingProject] = useState(false);

  // Filters
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState('problems');

  const userId = user?.Id || user?.id;

  // Determine if this is an individual event / individual participant registration
  const isIndividual = useMemo(() => {
    return Boolean(
      team?.IsIndividual ||
      (team?.TeamName && team.TeamName.toLowerCase().includes('(individual)')) ||
      Number(team?.TeamSize) === 1 ||
      (event?.MinTeamMembers === 1 && event?.MaxTeamMembers === 1) ||
      Number(event?.TeamSize) === 1 ||
      (event?.TeamSize && String(event.TeamSize).toLowerCase() === 'individual')
    );
  }, [team, event]);

  const displayName = useMemo(() => {
    if (!team) return user?.Name || 'Participant';
    if (isIndividual) {
      return team.TeamLeadName || team.TeamName?.replace(/\s*\(Individual\)/gi, '') || user?.Name || 'Participant';
    }
    return team.TeamName;
  }, [team, isIndividual, user]);

  // Determine if logged in user is the Team Leader (or individual participant)
  const isTeamLead = useMemo(() => {
    if (!team || isIndividual) return true;
    const currentUid = user?.Id || user?.id;
    if (!currentUid) return false;
    if (team.TeamLeadUserId && String(team.TeamLeadUserId) === String(currentUid)) return true;
    if (team.Role && (team.Role.toLowerCase() === 'teamlead' || team.Role.toLowerCase() === 'lead')) return true;
    if (Array.isArray(teamMembers) && teamMembers.length > 0) {
      const myMem = teamMembers.find(m => String(m.UserId || m.id) === String(currentUid));
      if (myMem && (myMem.Role?.toLowerCase() === 'teamlead' || myMem.Role?.toLowerCase() === 'lead')) return true;
    }
    return false;
  }, [team, user, teamMembers, isIndividual]);

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

                // Fetch team's project submission
                try {
                  const subRes = await fetch(`${API_BASE_URL}/api/project-submissions/event/${id}/team/${teamIdentifier}`);
                  if (subRes.ok) {
                    const subData = await subRes.json();
                    setProjectSubmission(subData.submission || null);
                  }
                } catch {
                  // ignore
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

  // Live countdown timer for problem statement selection deadline (Timezone-safe)
  useEffect(() => {
    const deadlineStr = publishStatus.PSSelectionDeadline || event?.PSSelectionDeadline;
    if (!deadlineStr) {
      setTimeLeft(null);
      return;
    }

    let targetDate;
    if (deadlineStr instanceof Date) {
      targetDate = deadlineStr.getTime();
    } else {
      const s = String(deadlineStr).trim();
      const normalized = s.includes('T') ? (s.endsWith('Z') ? s : s + 'Z') : s.replace(' ', 'T') + 'Z';
      targetDate = new Date(normalized).getTime();
      if (isNaN(targetDate)) targetDate = new Date(s).getTime();
    }

    if (isNaN(targetDate)) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
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
    if (teamSelection?.ProblemStatementId) {
      toast.error('A problem statement is already locked in for this event. Only an event admin can modify your selection.');
      setSelectedPSToConfirm(null);
      return;
    }
    const teamIdentifier = team.Id || team.TeamId;
    const authToken = token || localStorage.getItem('token');

    try {
      setSubmittingSelection(true);
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${id}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
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

  const handleOpenSubmissionModal = () => {
    if (projectSubmission) {
      setSubmissionForm({
        githubRepoUrl: projectSubmission.GithubRepoUrl || '',
        liveDemoUrl: projectSubmission.LiveDemoUrl || '',
        drivePptUrl: projectSubmission.DrivePptUrl || '',
        techStack: projectSubmission.TechStack || '',
        description: projectSubmission.Description || ''
      });
    } else {
      setSubmissionForm({
        githubRepoUrl: '',
        liveDemoUrl: '',
        drivePptUrl: '',
        techStack: '',
        description: ''
      });
    }
    setSubmissionModalOpen(true);
  };

  const handleSubmitProject = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!submissionForm.githubRepoUrl && !submissionForm.liveDemoUrl && !submissionForm.drivePptUrl) {
      toast.error('Please provide at least one link (GitHub Repo, Live Demo, or Deck).');
      return;
    }
    const teamIdentifier = team?.Id || team?.TeamId;
    if (!teamIdentifier) {
      toast.error('No registered team found');
      return;
    }

    try {
      setSubmittingProject(true);
      const authToken = token || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/project-submissions/event/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          teamId: teamIdentifier,
          ...submissionForm
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit project');
      }

      toast.success(projectSubmission ? 'Project submission updated!' : 'Project submitted successfully!');
      setProjectSubmission(data.submission || null);
      setSubmissionModalOpen(false);
      loadAll();
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Failed to submit project');
    } finally {
      setSubmittingProject(false);
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

  const tabs = [
    {
      key: 'problems',
      label: `Problem Statements (${problemStatements.length})`,
      icon: Target,
      badge: null
    },
    {
      key: 'submission',
      label: 'Project Deliverables',
      icon: UploadCloud,
      badge: projectSubmission ? 'Submitted' : (teamSelection ? 'Pending' : null)
    },
    {
      key: 'meeting',
      label: 'Live Meet & Agenda',
      icon: Video,
      badge: isLive ? 'LIVE' : null
    },
    {
      key: 'team',
      label: isIndividual ? 'Participant & Guidelines' : `Team & Guidelines (${teamMembers.length})`,
      icon: Users,
      badge: null
    }
  ];

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
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-zinc-100 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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
                ? 'The virtual hackathon is now in session! Connect with mentors and jury panels in the live meeting room.'
                : 'Welcome to the Virtual Hackathon Hub. Select your problem statement, track deadlines, submit deliverables, and join live rooms.'}
            </p>
          </div>

          {/* Quick Meet / Status Action */}
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
                  <span>JOIN LIVE ROOM</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-600 dark:text-zinc-400">
                  <p className="font-bold text-slate-900 dark:text-white">Event is LIVE</p>
                  <p className="text-[11px] mt-0.5">Meeting URL will appear shortly</p>
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

      {/* Folder Tabs Navigation (Matching Prize / Track Tabs in screenshot) */}
      <div className="space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10 -mb-px">
          <div className="flex items-end gap-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="relative h-11 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="participantVirtualFolderTabActive"
                      className="absolute inset-0 -bottom-[2px] rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      {/* Seamless bottom mask */}
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-zinc-800 z-0 hover:bg-slate-200/60 dark:hover:bg-zinc-900 transition" />
                  )}

                  <span className={`relative z-20 flex items-center gap-2 ${
                    isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}>
                    <IconComp className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.badge !== null && tab.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connected Card Container matching exact screenshot */}
        <div className={`p-6 sm:p-8 rounded-3xl ${activeTab === tabs[0].key ? 'rounded-tl-none rounded-tr-none' : 'rounded-tl-none rounded-tr-none'} bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm relative z-0`}>
          {/* TAB 1: PROBLEM STATEMENTS & THEMES */}
          {activeTab === 'problems' && (
        <div className="space-y-6">
          {/* TEAM'S CURRENT SELECTION STATUS BANNER */}
          {isPSPublished && team && (
            <div className="p-4 sm:p-5 rounded-3xl border transition-all">
              {teamSelection ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                        <CheckCircle2 className="h-3 w-3" />
                        Locked In For {isIndividual ? displayName : `Team ${team.TeamName}`}
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
                    <button
                      type="button"
                      onClick={() => setActiveTab('submission')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <span>Proceed to Deliverables</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                        {isIndividual ? 'You have not selected a problem statement yet!' : `Team ${team.TeamName} has not selected a problem statement yet!`}
                      </h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        {isIndividual 
                          ? 'Please pick a problem statement from the list below before the timer runs out. If not selected in time, a statement will be automatically assigned to you!'
                          : 'Please pick a problem statement from the list below before the timer runs out. If not selected in time, a statement will be automatically assigned to your team!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* HACKATHON THEMES PREVIEW */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Layers className="h-4 w-4" />
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
                  <Layers className="h-8 w-8 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Themes Officially Published</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    Organizers have opened the theme phase. Detailed problem statements are displayed below.
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

          {/* PROBLEM STATEMENTS LISTING */}
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
                    {isIndividual ? 'Choose one problem statement to build and submit your project.' : 'Choose one problem statement for your team to build and submit your project.'}
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

            {isPSPublished ? (
              <div className="space-y-4">
                {!isIndividual && !isTeamLead && team && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                      <strong>Team Member View:</strong> You are viewing problem statements as a team member. Only your <strong>Team Leader</strong> ({team.TeamLeadName || 'team leader'}) can officially lock in your team's selection.
                    </span>
                  </div>
                )}

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
                      const isSelectedByMyTeam = teamSelection && Number(teamSelection.ProblemStatementId) === Number(ps.Id);
                      const hasExistingSelection = Boolean(teamSelection && teamSelection.ProblemStatementId);
                      const isDeadlinePassed = Boolean(timeLeft && timeLeft.expired);

                      return (
                        <div
                          key={ps.Id}
                          className={`p-6 rounded-3xl bg-white dark:bg-zinc-950 border transition-all flex flex-col justify-between space-y-4 ${
                            isSelectedByMyTeam
                              ? 'border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
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
                                  <Check className="h-3 w-3" /> {isIndividual ? "Your Pick" : "Your Team's Pick"}
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

                          {/* Action Button */}
                          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                            {team ? (
                              isSelectedByMyTeam ? (
                                <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs text-center flex flex-col items-center justify-center gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>{isIndividual ? `Locked In for ${displayName}` : `Locked In for Team ${team.TeamName}`}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                                    (Contact Admin to modify)
                                  </span>
                                </div>
                              ) : hasExistingSelection ? (
                                <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-semibold text-center flex items-center justify-center gap-1.5 cursor-not-allowed">
                                  <Lock className="h-3.5 w-3.5" />
                                  <span>Locked • Contact Admin to change</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPSToConfirm(ps)}
                                  disabled={isDeadlinePassed || (!isIndividual && !isTeamLead)}
                                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition flex items-center justify-center gap-2 ${
                                    isDeadlinePassed || (!isIndividual && !isTeamLead)
                                      ? 'bg-slate-200 dark:bg-zinc-900 text-slate-400 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/25 active:scale-[0.99] cursor-pointer'
                                  }`}
                                >
                                  <Target className="h-3.5 w-3.5" />
                                  <span>
                                    {isDeadlinePassed
                                      ? 'Selection Window Closed'
                                      : !isIndividual && !isTeamLead
                                      ? 'Leader Only: Awaiting Leader Selection'
                                      : 'Select This Problem Statement'}
                                  </span>
                                </button>
                              )
                            ) : (
                              <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-400 text-xs font-semibold text-center">
                                {isIndividual ? 'You must be registered to select' : 'You must be part of a registered team to select'}
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
        </div>
      )}

      {/* TAB 2: PROJECT DELIVERABLES */}
      {activeTab === 'submission' && (
        <div className="space-y-6">
          {/* Active Statement Summary Card */}
          {teamSelection ? (
            <div className="p-5 rounded-3xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                    Assigned Problem Statement
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {teamSelection.ProblemCode}
                  </span>
                  {teamSelection.Theme && (
                    <span className="text-[10px] text-slate-400">
                      • {teamSelection.Theme}
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {teamSelection.ProblemTitle}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('problems')}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 transition self-start sm:self-auto cursor-pointer"
              >
                View Problem Details
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    No Problem Statement Selected Yet
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    You must pick or be assigned a problem statement before submitting project deliverables.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('problems')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto shrink-0"
              >
                Choose Problem Statement
              </button>
            </div>
          )}

          {/* PROJECT SUBMISSION SECTION */}
          {team ? (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      Project Submission & Deliverables
                      {projectSubmission ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                          Submitted • Ready for Judging
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase">
                          Pending Submission
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Submit your GitHub source code repository, live hosted deployment, presentation deck, and technical stack.
                    </p>
                  </div>
                </div>

                {isIndividual || isTeamLead ? (
                  <button
                    type="button"
                    onClick={handleOpenSubmissionModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    {projectSubmission ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Update Submission</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Project Work</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Team Leader submission access only
                  </span>
                )}
              </div>

              {projectSubmission ? (
                <div className="space-y-4 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {projectSubmission.GithubRepoUrl && (
                      <a
                        href={projectSubmission.GithubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-xs font-bold transition shadow-xs"
                      >
                        <FolderGit2 className="w-4 h-4" />
                        <span>View GitHub Repository</span>
                        <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                      </a>
                    )}
                    {projectSubmission.LiveDemoUrl && (
                      <a
                        href={projectSubmission.LiveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-bold transition shadow-xs"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Live Hosted Application</span>
                        <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                      </a>
                    )}
                    {projectSubmission.DrivePptUrl && (
                      <a
                        href={projectSubmission.DrivePptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-slate-400 text-xs font-bold transition shadow-xs"
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span>Presentation / Demo Deck</span>
                        <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
                      </a>
                    )}
                  </div>

                  {projectSubmission.TechStack && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300 pt-1">
                      <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Tech Stack:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-[11px]">
                        {projectSubmission.TechStack}
                      </span>
                    </div>
                  )}

                  {projectSubmission.Description && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold block text-slate-900 dark:text-white mb-1.5">Project Solution Overview:</span>
                      {projectSubmission.Description}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 pt-0.5">
                    Last updated: {formatDate(projectSubmission.UpdatedAt || projectSubmission.SubmittedAt)} {formatTime(projectSubmission.UpdatedAt || projectSubmission.SubmittedAt)}
                    {projectSubmission.SubmittedByName && ` • by ${projectSubmission.SubmittedByName}`}
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-dashed border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <span>
                      No project deliverables submitted yet. Once {isIndividual ? 'you finish' : 'your team finishes'} coding, click <strong>"Submit Project Work"</strong> to provide your links before evaluation begins.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
              Registration required to submit deliverables.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIVE MEET & AGENDA */}
      {activeTab === 'meeting' && (
        <div className="space-y-6">
          {/* Detailed Meeting Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Live Virtual Hackathon Room
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Direct meeting connection for check-ins, mentor support, and final project pitch
                  </p>
                </div>
              </div>

              {isLive ? (
                meetUrl ? (
                  <a
                    href={meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Video className="h-4 w-4" />
                    <span>Join Meeting Now</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-bold">
                    Link Being Configured
                  </span>
                )
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-500 text-xs font-bold">
                  Scheduled • Starts {formatDate(event.VirtualStartDate || event.StartDate)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session Status</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isLive ? '🟢 Room is Currently Active' : '⚪ Waiting for Organizer Launch'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Meet / Zoom
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Required Hardware</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Working Webcam & Microphone
                </p>
              </div>
            </div>
          </div>

          {/* Virtual Schedule / Timelines */}
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

            {timelines.length > 0 ? (
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
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Timelines and sprint milestone schedule will be published by organizers.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PARTICIPANT / TEAM & GUIDELINES */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User's Registered Details */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                {isIndividual ? 'Your Registered Details' : 'Your Registered Team'}
              </h3>
            </div>

            {team ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {isIndividual ? 'Participant Name' : 'Team Name'}
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{displayName}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {team.College || (isIndividual ? 'Individual Competitor' : 'Registered Team')}
                  </p>
                </div>

                {!isIndividual && teamMembers.length > 0 && (
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
                <p>You are participating as an individual or your registration is being assigned.</p>
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
                <strong>Virtual Submission Protocol:</strong> All commits made during the virtual sprint must be pushed to {isIndividual ? 'your designated repository' : "your team's designated repository"} before the code freeze deadline.
              </span>
            </div>
          </div>
        </div>
      )}
        </div>
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
                  <span className="font-bold text-slate-900 dark:text-white">{displayName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Once confirmed, this problem statement will be officially locked for {isIndividual ? 'you' : `team ${team.TeamName}`}. Only an event admin can modify your selection after confirmation.
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

      {/* PROJECT SUBMISSION MODAL */}
      <AnimatePresence>
        {submissionModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={() => setSubmissionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="my-auto w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-emerald-500/30 p-6 text-slate-900 dark:text-white shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {projectSubmission ? 'Update Project Deliverables' : 'Submit Project Deliverables'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitProject} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    GitHub / Git Repository URL
                  </label>
                  <div className="relative">
                    <FolderGit2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://github.com/organization/project-name"
                      value={submissionForm.githubRepoUrl}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, githubRepoUrl: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Live Demo / Hosted Web URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://my-virtual-hackathon-project.vercel.app"
                      value={submissionForm.liveDemoUrl}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, liveDemoUrl: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Presentation Deck / Google Drive URL
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      placeholder="https://docs.google.com/presentation/d/..."
                      value={submissionForm.drivePptUrl}
                      onChange={(e) => setSubmissionForm({ ...submissionForm, drivePptUrl: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Tech Stack & Tools Used
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, Node.js, Express, TailwindCSS, PostgreSQL"
                    value={submissionForm.techStack}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, techStack: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Solution Overview / Implementation Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isIndividual ? "Briefly describe what you built, key architectural decisions, and how it addresses the challenge..." : "Briefly describe what your team built, key architectural decisions, and how it addresses the challenge..."}
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSubmissionModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingProject}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingProject ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>{projectSubmission ? 'Update Deliverables' : 'Submit Project'}</span>
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
