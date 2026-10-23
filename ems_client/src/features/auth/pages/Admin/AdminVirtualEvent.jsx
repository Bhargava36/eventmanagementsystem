import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
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
  RefreshCw,
  Building2,
  Mail,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  FileText,
  Target,
  Zap,
  Eye,
  EyeOff,
  Hash,
  Layers,
  Timer,
  Shuffle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Settings2,
  BookOpen,
  Lightbulb,
  ListChecks,
  Tag,
  FolderPlus,
  FolderGit2,
  Globe,
  Code2
} from 'lucide-react';
import useToast from '../../../../Hooks/useToast';

function formatDate(date) {
  if (!date) return 'Not set';
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

export default function AdminVirtualEvent() {
  const toast = useToast();
  const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
  const [currentEventId, setCurrentEventId] = useState(storedAdmin?.EventId || null);

  const [event, setEvent] = useState(null);
  const [teams, setTeams] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [meetUrlInput, setMeetUrlInput] = useState('');
  const [savingMeetUrl, setSavingMeetUrl] = useState(false);
  const [copiedMeet, setCopiedMeet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Problem Statement & Themes Tab
  const [psTab, setPsTab] = useState('themes'); // 'themes' | 'manage' | 'selections' | 'settings'

  // Themes State
  const [themes, setThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [showThemeForm, setShowThemeForm] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [themeForm, setThemeForm] = useState({
    ThemeName: '',
    Description: '',
    DisplayOrder: 0
  });
  const [themeSaving, setThemeSaving] = useState(false);

  // Problem Statements State
  const [problemStatements, setProblemStatements] = useState([]);
  const [selections, setSelections] = useState([]);
  const [psLoading, setPsLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState({
    ThemePublished: 0,
    ProblemStatementsPublished: 0,
    PSSelectionDeadline: null,
    PSMaxTeamsPerStatement: 5
  });

  // PS CRUD Form
  const [showPsForm, setShowPsForm] = useState(false);
  const [editingPsId, setEditingPsId] = useState(null);
  const [psForm, setPsForm] = useState({
    ProblemCode: '',
    Title: '',
    Description: '',
    Category: '',
    Theme: '',
    MaxTeams: 5,
    DisplayOrder: 0
  });
  const [psSaving, setPsSaving] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Grouping / filtering
  const [psThemeFilter, setPsThemeFilter] = useState('ALL');
  const [expandedThemes, setExpandedThemes] = useState({});

  // PS Settings Form - Selection Timer in minutes
  const [deadlineMinutes, setDeadlineMinutes] = useState(15);
  const [adminTimerLeft, setAdminTimerLeft] = useState(null);
  const [maxTeamsInput, setMaxTeamsInput] = useState(5);

  // Live countdown for admin
  useEffect(() => {
    const deadlineStr = publishStatus?.PSSelectionDeadline;
    if (!deadlineStr) {
      setAdminTimerLeft(null);
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
      setAdminTimerLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0) {
        setAdminTimerLeft({ expired: true, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setAdminTimerLeft({ expired: false, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [publishStatus?.PSSelectionDeadline]);

  useEffect(() => {
    const init = async () => {
      let eid = currentEventId;
      if (!eid && (storedAdmin?.Id || storedAdmin?.id)) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/${storedAdmin.Id || storedAdmin.id}`);
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
  }, []);

  const loadData = async (eid) => {
    try {
      setLoading(true);
      const [evRes, teamsRes, timeRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/events/${eid}`),
        fetch(`${API_BASE_URL}/api/teams/event/${eid}`),
        fetch(`${API_BASE_URL}/api/event_timelines/event/${eid}`)
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

  // Load Problem Statement & Themes Data
  const loadPSData = useCallback(async () => {
    if (!currentEventId) return;
    try {
      setPsLoading(true);
      const [psRes, selRes, statusRes, themesRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/selections`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/publish-status`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/themes`)
      ]);

      if (psRes.status === 'fulfilled' && psRes.value.ok) {
        const data = await psRes.value.json();
        setProblemStatements(data.problemStatements || []);
      }

      if (selRes.status === 'fulfilled' && selRes.value.ok) {
        const data = await selRes.value.json();
        setSelections(data.selections || []);
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.ok) {
        const data = await statusRes.value.json();
        setPublishStatus(data);
        if (data.PSSelectionDeadline) {
          const diffMs = new Date(data.PSSelectionDeadline).getTime() - Date.now();
          if (diffMs > 0) {
            setDeadlineMinutes(Math.max(1, Math.round(diffMs / 60000)));
          }
        }
        setMaxTeamsInput(data.PSMaxTeamsPerStatement || 5);
      }

      if (themesRes.status === 'fulfilled' && themesRes.value.ok) {
        const data = await themesRes.value.json();
        setThemes(data.themes || []);
      }
    } catch (err) {
      console.error('Failed to load PS data:', err);
    } finally {
      setPsLoading(false);
    }
  }, [currentEventId]);

  useEffect(() => {
    if (currentEventId) {
      loadPSData();
    }
  }, [currentEventId, loadPSData]);

  // Real-time updates via WebSocket (Auto-sync when teams make selections or admin actions take place)
  useEffect(() => {
    if (!currentEventId) return;

    let socket = null;
    let reconnectTimer = null;
    let isMounted = true;

    const connectWS = () => {
      try {
        const wsBase = (API_BASE_URL || 'http://localhost:3000').replace(/^http/, 'ws');
        socket = new WebSocket(wsBase);

        socket.onopen = () => {
          socket.send(JSON.stringify({ type: 'JOIN_EVENT', eventId: currentEventId }));
        };

        socket.onmessage = (msgEvent) => {
          try {
            const data = JSON.parse(msgEvent.data);
            if (!data.eventId || String(data.eventId) === String(currentEventId)) {
              loadPSData();
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
  }, [currentEventId, loadPSData]);

  const handleUpdateStatus = async (newStatus) => {
    if (!currentEventId) return;
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${currentEventId}/virtual-status`, {
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
      const res = await fetch(`${API_BASE_URL}/api/events/${currentEventId}/virtual-meet`, {
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

  // =============================================
  // THEME MANAGEMENT HANDLERS
  // =============================================

  const resetThemeForm = () => {
    setThemeForm({ ThemeName: '', Description: '', DisplayOrder: 0 });
    setEditingThemeId(null);
    setShowThemeForm(false);
  };

  const handleSaveTheme = async () => {
    if (!themeForm.ThemeName.trim()) {
      toast.error('Theme Name is required');
      return;
    }
    try {
      setThemeSaving(true);
      const url = editingThemeId
        ? `${API_BASE_URL}/api/problem-statements/themes/${editingThemeId}`
        : `${API_BASE_URL}/api/problem-statements/event/${currentEventId}/themes`;
      const method = editingThemeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save theme');
      }

      toast.success(editingThemeId ? 'Theme updated successfully!' : 'Theme added successfully!');
      resetThemeForm();
      loadPSData();
    } catch (err) {
      toast.error(err.message || 'Failed to save theme');
    } finally {
      setThemeSaving(false);
    }
  };

  const handleEditTheme = (theme) => {
    setThemeForm({
      ThemeName: theme.ThemeName,
      Description: theme.Description || '',
      DisplayOrder: theme.DisplayOrder || 0
    });
    setEditingThemeId(theme.Id);
    setShowThemeForm(true);
  };

  const handleDeleteTheme = async (themeId, themeName) => {
    if (!confirm(`Are you sure you want to delete theme "${themeName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/themes/${themeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete theme');
      toast.success('Theme deleted successfully');
      loadPSData();
    } catch {
      toast.error('Failed to delete theme');
    }
  };

  // Quick action: Add Problem Statement directly to a specific theme
  const handleAddStatementToTheme = (themeName) => {
    resetPsForm();
    setPsForm(prev => ({ ...prev, Theme: themeName }));
    setShowPsForm(true);
    setPsTab('manage');
  };

  // =============================================
  // PROBLEM STATEMENT HANDLERS
  // =============================================

  const handlePublishTheme = async (publish) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/publish-theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish })
      });
      if (!res.ok) throw new Error('Failed');
      setPublishStatus(prev => ({ ...prev, ThemePublished: publish ? 1 : 0 }));
      toast.success(`Themes ${publish ? 'published to participants' : 'hidden (draft)'}!`);
    } catch {
      toast.error('Failed to update theme status');
    }
  };

  const handlePublishPS = async (publish) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/publish-statements`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: publish })
      });
      if (!res.ok) throw new Error('Failed');
      setPublishStatus(prev => ({ ...prev, ProblemStatementsPublished: publish ? 1 : 0 }));
      toast.success(`Problem statements ${publish ? 'published and open for selection' : 'hidden (draft)'}!`);
    } catch {
      toast.error('Failed to update problem statement status');
    }
  };

  const handleSetDeadlineByMinutes = async (mins) => {
    if (!currentEventId) return;
    const minutesToUse = Number(mins !== undefined ? mins : deadlineMinutes);
    if (!minutesToUse || minutesToUse <= 0) {
      toast.error('Please enter a valid number of minutes (e.g. 15)');
      return;
    }
    try {
      const targetTime = new Date(Date.now() + minutesToUse * 60 * 1000);
      const isoDeadline = targetTime.toISOString();
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/selection-deadline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: isoDeadline })
      });
      if (!res.ok) throw new Error('Failed to set deadline');
      setPublishStatus(prev => ({ ...prev, PSSelectionDeadline: isoDeadline }));
      toast.success(`Selection timer started for ${minutesToUse} minutes!`);
    } catch {
      toast.error('Failed to set deadline timer');
    }
  };

  const handleClearDeadline = async () => {
    if (!currentEventId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/selection-deadline`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadline: null })
      });
      if (!res.ok) throw new Error('Failed to clear timer');
      setPublishStatus(prev => ({ ...prev, PSSelectionDeadline: null }));
      toast.success('Selection timer cleared');
    } catch {
      toast.error('Failed to clear timer');
    }
  };

  const handleSaveMaxTeams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/max-teams`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxTeams: maxTeamsInput })
      });
      if (!res.ok) throw new Error('Failed');
      setPublishStatus(prev => ({ ...prev, PSMaxTeamsPerStatement: maxTeamsInput }));
      toast.success('Max teams limit updated!');
    } catch {
      toast.error('Failed to set max teams');
    }
  };

  const resetPsForm = () => {
    setPsForm({ ProblemCode: '', Title: '', Description: '', Category: '', Theme: '', MaxTeams: 5, DisplayOrder: 0 });
    setEditingPsId(null);
    setShowPsForm(false);
  };

  const handleSaveProblemStatement = async () => {
    if (!psForm.ProblemCode.trim() || !psForm.Title.trim()) {
      toast.error('Problem Code and Title are required');
      return;
    }
    try {
      setPsSaving(true);
      const url = editingPsId
        ? `${API_BASE_URL}/api/problem-statements/${editingPsId}`
        : `${API_BASE_URL}/api/problem-statements/event/${currentEventId}`;
      const method = editingPsId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(psForm)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed');
      }

      toast.success(editingPsId ? 'Problem statement updated!' : 'Problem statement created!');
      resetPsForm();
      loadPSData();
    } catch (err) {
      toast.error(err.message || 'Failed to save problem statement');
    } finally {
      setPsSaving(false);
    }
  };

  const handleEditPS = (ps) => {
    setPsForm({
      ProblemCode: ps.ProblemCode,
      Title: ps.Title,
      Description: ps.Description || '',
      Category: ps.Category || '',
      Theme: ps.Theme || '',
      MaxTeams: ps.MaxTeams || 5,
      DisplayOrder: ps.DisplayOrder || 0
    });
    setEditingPsId(ps.Id);
    setShowPsForm(true);
  };

  const handleDeletePS = async (id) => {
    if (!confirm('Delete this problem statement? Associated team selections will also be removed.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Problem statement deleted');
      loadPSData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAutoAssign = async () => {
    if (!confirm('Auto-assign problem statements to all unselected virtual teams?')) return;
    try {
      setAutoAssigning(true);
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${currentEventId}/auto-assign`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      toast.success(data.message || `Auto-assigned ${data.assigned} teams`);
      loadPSData();
    } catch (err) {
      toast.error(err.message || 'Auto-assignment failed');
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleRemoveSelection = async (selId, teamName) => {
    if (!confirm(`Remove selection for "${teamName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/selection/${selId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Selection removed');
      loadPSData();
    } catch {
      toast.error('Failed to remove selection');
    }
  };

  // Group problem statements by Theme
  const statementsByTheme = useMemo(() => {
    const map = {};
    // Ensure all defined themes exist in the map
    themes.forEach(t => {
      map[t.ThemeName] = [];
    });

    // Populate problem statements
    problemStatements.forEach(ps => {
      const themeKey = ps.Theme?.trim() || 'General / Uncategorized';
      if (!map[themeKey]) map[themeKey] = [];
      map[themeKey].push(ps);
    });

    return map;
  }, [themes, problemStatements]);

  // Derived Values
  const isLive = event?.VirtualStatus === 'LIVE';
  const isCompleted = event?.VirtualStatus === 'COMPLETED';
  const isNotStarted = !isLive && !isCompleted;

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

  const themePublished = !!publishStatus.ThemePublished;
  const psPublished = !!publishStatus.ProblemStatementsPublished;
  const unselectedTeamCount = Math.max(0, virtualTeams.length - selections.length);

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
    <div className="min-h-screen bg-slate-50/60 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Virtual Event Control Room
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {event.EventName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Real-time management for virtual hackathon rooms, live Google Meet sessions, themes, and problem statement distribution.
          </p>
        </div>

        {/* Status Pill & Refresh */}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-black border dark:border-zinc-800 text-slate-600 dark:text-zinc-300 font-bold text-sm">
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
            onClick={() => { loadData(currentEventId); loadPSData(); }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh details"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Action Banner: START VIRTUAL EVENT */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isLive
          ? 'bg-white dark:bg-black border-emerald-500/40 shadow-sm'
          : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isLive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-black border dark:border-zinc-800 text-slate-700 dark:text-zinc-300'}`}>
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-rose-600/30 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Conclude Event</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus('NOT_STARTED')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset Status</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('LIVE')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reopen Virtual Event</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Meet & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Meet Configuration */}
        <div className="lg:col-span-2 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="h-4 w-4 text-emerald-500" />
              Live Virtual Meeting Link (Google Meet / Zoom)
            </h3>
            {event.VirtualMeetUrl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Check className="h-3 w-3" /> Configured
              </span>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs text-slate-500 dark:text-zinc-400">
              Provide the meeting link where mentors, juries, and participants will connect.
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="url"
                  value={meetUrlInput}
                  onChange={(e) => setMeetUrlInput(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc-def"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="button"
                disabled={savingMeetUrl}
                onClick={handleSaveMeetUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-black text-white font-bold text-xs transition cursor-pointer"
              >
                {savingMeetUrl ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>Save Link</span>
              </button>

              {event.VirtualMeetUrl && (
                <>
                  <button
                    type="button"
                    onClick={copyMeetLink}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedMeet ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={event.VirtualMeetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold text-xs transition cursor-pointer"
                  >
                    <span>Test</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Virtual Track Overview */}
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-500" />
            Virtual Track Stats
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Virtual Teams</span>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{virtualTeams.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-zinc-800">
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

      {/* ============================================================ */}
      {/* PROBLEM STATEMENTS & THEMES MANAGEMENT SECTION */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Target className="h-3.5 w-3.5" />
                Themes & Problem Statements Hub
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Hackathon Themes & Problem Statements
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Add innovation themes, assign problem statements under each theme, set selection limits, and control publishing.
              </p>
            </div>

            {/* Publish Status Badges */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                themePublished
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-black text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
              }`}>
                {themePublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                Themes {themePublished ? 'Published' : 'Draft'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                psPublished
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-100 dark:bg-black text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700'
              }`}>
                {psPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                Statements {psPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* 4 Main Inner Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5 bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-fit">
            {[
              { key: 'themes', label: `1. Manage Themes (${themes.length})`, icon: Layers },
              { key: 'manage', label: `2. Problem Statements (${problemStatements.length})`, icon: FileText },
              { key: 'selections', label: `3. Team Selections (${selections.length})`, icon: ListChecks },
              { key: 'settings', label: '4. Publish & Deadlines', icon: Settings2 },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPsTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  psTab === tab.key
                    ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: THEMES & DOMAINS MANAGEMENT */}
        {/* ============================================================ */}
        {psTab === 'themes' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Hackathon Innovation Themes
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Define overarching domains (e.g. AI/ML, Web3, FinTech). You can attach multiple problem statements to each theme.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { resetThemeForm(); setShowThemeForm(true); }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Theme</span>
              </button>
            </div>

            {/* Theme Form (Modal/Inline) */}
            <AnimatePresence>
              {showThemeForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-emerald-500/30 rounded-2xl p-5 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      {editingThemeId ? 'Edit Hackathon Theme' : 'Create Hackathon Theme'}
                    </h4>
                    <button onClick={resetThemeForm} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Theme Name *
                      </label>
                      <input
                        type="text"
                        value={themeForm.ThemeName}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, ThemeName: e.target.value }))}
                        placeholder="e.g. Artificial Intelligence & Machine Learning"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={themeForm.DisplayOrder}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, DisplayOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                      Theme Description
                    </label>
                    <textarea
                      rows={2}
                      value={themeForm.Description}
                      onChange={(e) => setThemeForm(prev => ({ ...prev, Description: e.target.value }))}
                      placeholder="Brief overview of challenges, technologies, or objectives for this theme..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetThemeForm}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={themeSaving}
                      onClick={handleSaveTheme}
                      className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
                    >
                      {themeSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>{editingThemeId ? 'Save Changes' : 'Create Theme'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Themes Grid */}
            {themes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => {
                  const statementsForTheme = problemStatements.filter(
                    (p) => (p.Theme || '').trim().toLowerCase() === theme.ThemeName.trim().toLowerCase()
                  );
                  return (
                    <div
                      key={theme.Id}
                      className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-bold">
                            Theme
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {statementsForTheme.length} {statementsForTheme.length === 1 ? 'Statement' : 'Statements'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {theme.ThemeName}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                          {theme.Description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Theme Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleAddStatementToTheme(theme.ThemeName)}
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Problem Statement Here</span>
                        </button>

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleEditTheme(theme)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                            title="Edit Theme"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTheme(theme.Id, theme.ThemeName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                            title="Delete Theme"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                <Layers className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Themes Added Yet</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Click the "Add New Theme" button above to create hackathon tracks (e.g. AI/ML, Web3, FinTech).
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PROBLEM STATEMENTS ORGANIZED BY THEME */}
        {/* ============================================================ */}
        {psTab === 'manage' && (
          <div className="p-6 space-y-6">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {problemStatements.length} Total Problem Statement{problemStatements.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Organized under official event themes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { resetPsForm(); setShowPsForm(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Problem Statement</span>
                </button>
              </div>
            </div>

            {/* PS Form (Inline) */}
            <AnimatePresence>
              {showPsForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border border-emerald-500/30 rounded-2xl p-5 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-emerald-500" />
                      {editingPsId ? 'Edit Problem Statement' : 'New Problem Statement'}
                    </h4>
                    <button onClick={resetPsForm} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer">
                      <X className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Problem Code *
                      </label>
                      <input
                        type="text"
                        value={psForm.ProblemCode}
                        onChange={(e) => setPsForm(prev => ({ ...prev, ProblemCode: e.target.value.toUpperCase() }))}
                        placeholder="e.g. PS-01 or AI-101"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Theme / Track *
                      </label>
                      <div className="relative">
                        <input
                          list="theme-suggestions"
                          type="text"
                          value={psForm.Theme}
                          onChange={(e) => setPsForm(prev => ({ ...prev, Theme: e.target.value }))}
                          placeholder="Select or enter theme..."
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                        />
                        <datalist id="theme-suggestions">
                          {themes.map(t => (
                            <option key={t.Id} value={t.ThemeName} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Category / Domain
                      </label>
                      <input
                        type="text"
                        value={psForm.Category}
                        onChange={(e) => setPsForm(prev => ({ ...prev, Category: e.target.value }))}
                        placeholder="e.g. Software, Hardware, Open"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                      Problem Statement Title *
                    </label>
                    <input
                      type="text"
                      value={psForm.Title}
                      onChange={(e) => setPsForm(prev => ({ ...prev, Title: e.target.value }))}
                      placeholder="e.g. Autonomous AI-Powered Smart Traffic Optimization"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                      Description & Deliverables
                    </label>
                    <textarea
                      rows={3}
                      value={psForm.Description}
                      onChange={(e) => setPsForm(prev => ({ ...prev, Description: e.target.value }))}
                      placeholder="Explain the background problem, requirements, expected output, and evaluation criteria..."
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Max Teams Allowed (Limit)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={psForm.MaxTeams}
                        onChange={(e) => setPsForm(prev => ({ ...prev, MaxTeams: parseInt(e.target.value) || 5 }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={psForm.DisplayOrder}
                        onChange={(e) => setPsForm(prev => ({ ...prev, DisplayOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={resetPsForm}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={psSaving}
                      onClick={handleSaveProblemStatement}
                      className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      {psSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      <span>{editingPsId ? 'Save Changes' : 'Create Statement'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STATEMENTS GROUPED UNDER EACH THEME */}
            <div className="space-y-6">
              {Object.keys(statementsByTheme).map((themeName) => {
                const list = statementsByTheme[themeName] || [];
                return (
                  <div
                    key={themeName}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800/80">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <Layers className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            Theme: {themeName}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {list.length} Problem Statement{list.length !== 1 ? 's' : ''} in this theme
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddStatementToTheme(themeName)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Statement under this theme</span>
                      </button>
                    </div>

                    {list.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {list.map((ps) => {
                          const count = ps.SelectedTeams || 0;
                          const max = ps.MaxTeams || 5;
                          const isFull = count >= max;
                          return (
                            <div
                              key={ps.Id}
                              className="p-4 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/40 shadow-sm transition space-y-2.5 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-black">
                                    {ps.ProblemCode}
                                  </span>
                                  {ps.Category && (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[10px] font-medium">
                                      {ps.Category}
                                    </span>
                                  )}
                                </div>

                                <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                  {ps.Title}
                                </h5>

                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                  {ps.Description || 'No description.'}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs">
                                <span className={`font-semibold ${isFull ? 'text-rose-500' : 'text-slate-500 dark:text-zinc-400'}`}>
                                  {count} / {max} teams selected {isFull && '(Full)'}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditPS(ps)}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition cursor-pointer"
                                    title="Edit Statement"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePS(ps.Id)}
                                    className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                    title="Delete Statement"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-xs text-slate-400 italic">
                        No problem statements added under this theme yet.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: TEAM SELECTIONS LIST & AUTO-ASSIGN */}
        {/* ============================================================ */}
        {psTab === 'selections' && (
          <div className="p-6 space-y-5">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-emerald-500" />
                  Team Selection Audit List
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {selections.length} teams have selected • {unselectedTeamCount} teams pending
                </p>
              </div>

              {unselectedTeamCount > 0 && (
                <button
                  type="button"
                  disabled={autoAssigning}
                  onClick={handleAutoAssign}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                >
                  {autoAssigning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shuffle className="h-3.5 w-3.5" />}
                  <span>Auto-Assign Remaining {unselectedTeamCount} Teams</span>
                </button>
              )}
            </div>

            {/* Selections Table */}
            {selections.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4">College</th>
                      <th className="py-3 px-4">Problem Code</th>
                      <th className="py-3 px-4">Statement Title</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Project Submission</th>
                      <th className="py-3 px-4">Selected At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {selections.map((sel) => (
                      <tr key={sel.Id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/40 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {sel.TeamName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                          {sel.College || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-[11px]">
                            {sel.ProblemCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-800 dark:text-zinc-200 font-medium">
                          {sel.ProblemTitle}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sel.SelectionType === 'auto'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {sel.SelectionType === 'auto' ? 'Auto-Assigned' : 'Manual Pick'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {sel.GithubRepoUrl || sel.LiveDemoUrl || sel.DrivePptUrl ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {sel.GithubRepoUrl && (
                                <a
                                  href={sel.GithubRepoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-zinc-800 hover:bg-slate-800 text-[10px] font-bold"
                                  title="Open GitHub Repository"
                                >
                                  <FolderGit2 className="w-3 h-3" />
                                  <span>Repo</span>
                                </a>
                              )}
                              {sel.LiveDemoUrl && (
                                <a
                                  href={sel.LiveDemoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-[10px] font-bold"
                                  title="Open Live Hosted Demo"
                                >
                                  <Globe className="w-3 h-3" />
                                  <span>Demo</span>
                                </a>
                              )}
                              {sel.DrivePptUrl && (
                                <a
                                  href={sel.DrivePptUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-slate-400 text-[10px] font-bold"
                                  title="Open Presentation Deck"
                                >
                                  <FileText className="w-3 h-3 text-amber-500" />
                                  <span>Deck</span>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {formatDate(sel.SelectedAt)} {formatTime(sel.SelectedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSelection(sel.Id, sel.TeamName)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Remove Selection"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                <ListChecks className="h-8 w-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Team Selections Yet</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Teams will select their problem statement once you publish them.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PUBLISH WORKFLOW & SELECTION SETTINGS */}
        {/* ============================================================ */}
        {psTab === 'settings' && (
          <div className="p-6 space-y-6 max-w-3xl">
            {/* Step 1: Themes Publishing */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Publish Hackathon Themes
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      When published, participants can preview the innovation tracks ({themes.length} themes defined).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishTheme(!themePublished)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    themePublished
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100'
                      : 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20'
                  }`}
                >
                  {themePublished ? 'Unpublish Themes' : 'Publish Themes Now'}
                </button>
              </div>
            </div>

            {/* Step 2: Problem Statements Publishing */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Publish Problem Statements & Open Selection
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {themePublished
                        ? 'Opening this will allow registered teams to select their problem statement.'
                        : '⚠️ Hackathon themes must be published first before publishing problem statements.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!themePublished}
                  onClick={() => handlePublishPS(!psPublished)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer ${
                    !themePublished
                      ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                      : psPublished
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 hover:bg-rose-100'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {psPublished ? 'Close & Unpublish' : 'Publish Statements'}
                </button>
              </div>
            </div>

            {/* Selection Deadline Setting in Minutes */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Timer className="h-4 w-4 text-emerald-500" />
                    Problem Statement Selection Timer
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Set timer duration in minutes. Participants will see a live ticking countdown badge in their dashboard.
                  </p>
                </div>

                {adminTimerLeft && !adminTimerLeft.expired && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black animate-pulse">
                    <Timer className="h-3.5 w-3.5" />
                    <span>
                      {adminTimerLeft.hours > 0 ? `${adminTimerLeft.hours}h ` : ''}
                      {adminTimerLeft.minutes}m {adminTimerLeft.seconds}s remaining
                    </span>
                  </div>
                )}
                {adminTimerLeft && adminTimerLeft.expired && (
                  <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
                    Timer Expired
                  </div>
                )}
              </div>

              {/* Expired & Unassigned Teams Callout */}
              {adminTimerLeft && adminTimerLeft.expired && unselectedTeamCount > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold">Selection Window Closed</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400/80">
                        {unselectedTeamCount} teams have not selected a problem statement yet.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={autoAssigning}
                    onClick={handleAutoAssign}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-sm"
                  >
                    {autoAssigning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Shuffle className="h-3 w-3" />}
                    <span>Auto-Assign Remaining {unselectedTeamCount} Teams</span>
                  </button>
                </div>
              )}

              {/* Quick Minutes Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Quick Presets:</span>
                {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setDeadlineMinutes(mins);
                      handleSetDeadlineByMinutes(mins);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      deadlineMinutes === mins
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                        : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500/50'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>

              {/* Custom Minutes Input & Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={deadlineMinutes}
                    onChange={(e) => setDeadlineMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="15"
                    className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-bold text-center focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Minutes</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSetDeadlineByMinutes(deadlineMinutes)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Start Timer ({deadlineMinutes} Min)
                </button>

                {publishStatus?.PSSelectionDeadline && (
                  <button
                    type="button"
                    onClick={handleClearDeadline}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 font-bold text-xs transition cursor-pointer border border-rose-500/20"
                  >
                    Clear Timer
                  </button>
                )}
              </div>
            </div>

            {/* Max Teams Per Statement Limit */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-emerald-500" />
                Max Teams Per Problem Statement (Default Limit)
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Prevents too many teams from picking the same challenge. Standard limit is 5 teams per statement.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxTeamsInput}
                  onChange={(e) => setMaxTeamsInput(parseInt(e.target.value) || 5)}
                  className="w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={handleSaveMaxTeams}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Save Limit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Virtual Teams List */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                All Virtual Track Registered Teams
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Teams registered with Participation Mode set to Virtual or Both
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, leader, college..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            No virtual teams found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-zinc-900/40 text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Leader</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Problem Statement</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {filteredTeams.map((team) => {
                  const teamSel = selections.find(s => s.TeamId === (team.Id || team.TeamId));
                  return (
                    <tr key={team.Id || team.TeamId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60 transition">
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
                        {teamSel ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Hash className="h-2.5 w-2.5" />
                            {teamSel.ProblemCode}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Not selected</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                          Virtual Track
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Virtual Timelines / Day Milestones Preview */}
      {timelines.length > 0 && (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-500" />
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
                className="p-4 rounded-2xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-1.5"
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
