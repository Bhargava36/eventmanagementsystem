import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Medal,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Building2,
  User,
  Star,
  Sparkles,
  FileText,
  AlertCircle,
  HelpCircle,
  MapPin,
  Laptop,
  Check,
  TrendingUp,
  UserCheck,
  UserX,
  MessageSquare,
  Layers,
  ChevronRight,
  ClipboardList,
  Globe,
  Lock,
  Unlock,
  Edit3
} from 'lucide-react';
import { getTrackVisibility, isSoloTeamSize } from '../../../../lib/utils';
import useTheme from '../../../../Hooks/useTheme';
import useToast from '../../../../Hooks/useToast';

function AdminResultsPage({ track = 'Physical' }) {
  const toast = useToast();
  const { theme: appTheme } = useTheme();

  const isDark = appTheme === 'dark';

  const storedAdmin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = storedAdmin?.EventId || storedAdmin?.eventId;

  const [eventData, setEventData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('round_1'); // 'round_1', 'round_2', 'overall'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'evaluated', 'pending'
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [updatingRound, setUpdatingRound] = useState(false);

  // Standard Admin Portal Emerald & Neutral Design System (Independent of event colors)
  const theme = useMemo(() => {
    return {
      primary: isDark ? '#10b981' : '#059669', // Emerald-500 / Emerald-600
      accent: isDark ? '#34d399' : '#047857',
      glow: 'rgba(16, 185, 129, 0.2)',
      badgeBg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      badgeBorder: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
      badgeText: isDark ? '#34d399' : '#047857',
      buttonBg: isDark ? '#10b981' : '#059669',
      buttonText: '#ffffff',
      subtleBg: isDark ? 'rgba(6, 78, 59, 0.25)' : '#ecfdf5',
      cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
      border: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)',
      iconBg: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)',
      iconColor: isDark ? '#34d399' : '#059669',
    };
  }, [isDark]);

  const rawMode = eventData?.HackathonMode || storedAdmin?.HackathonMode;
  const { isBoth } = getTrackVisibility(rawMode, eventData?.Location || storedAdmin?.Location);
  const isIndividual = isSoloTeamSize(eventData?.TeamSize || storedAdmin?.TeamSize);

  // Fetch Event Branding Data
  useEffect(() => {
    if (!eventId) return;
    fetch(`http://localhost:3000/api/events/${eventId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.event) setEventData(d.event);
      })
      .catch((err) => console.error('Failed to load event for results:', err));
  }, [eventId]);

  // Fetch Comprehensive Evaluation Results & Breakdown
  const fetchResults = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/evaluators/event/${eventId}/results?track=${track}`);
      const json = await res.json();
      if (res.ok && (json.success || json.data)) {
        const resultData = json.data || json.results;
        setResultsData(resultData);
        // Default to first round tab if active tab isn't set or rounds exist
        const roundList = resultData?.rounds || [];
        if (roundList.length > 0) {
          setActiveTab((prev) => {
            if (prev === 'overall') return 'overall';
            const exists = roundList.some((r) => `round_${r.Id}` === prev);
            return exists ? prev : `round_${roundList[0].Id}`;
          });
        } else {
          setActiveTab('overall');
        }
      } else {
        console.error('Failed to load results:', json.message);
        toast.error('Failed to load results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      toast.error('Network error loading results');
    } finally {
      setLoading(false);
    }
  }, [eventId, track, toast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const rounds = resultsData?.rounds || [];
  const teams = resultsData?.teams || resultsData?.leaderboard || [];
  const summary = resultsData?.summary || {};
  const allEvaluators = resultsData?.evaluators || resultsData?.allEvaluators || [];

  // Active Selected Round Object (if current tab is a round)
  const selectedRound = useMemo(() => {
    if (activeTab === 'overall') return null;
    const roundId = activeTab.replace('round_', '');
    return rounds.find((r) => String(r.Id) === String(roundId)) || rounds[0] || null;
  }, [rounds, activeTab]);

  // Filtered Teams for Display
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const teamName = (t.TeamName || '').toLowerCase();
        const lead = (t.TeamLeadName || '').toLowerCase();
        const college = (t.College || '').toLowerCase();
        const ps = (t.ProblemStatementTitle || '').toLowerCase();
        if (!teamName.includes(q) && !lead.includes(q) && !college.includes(q) && !ps.includes(q)) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter === 'all') return true;

      if (selectedRound) {
        // Specific round status
        const rb = (t.roundBreakdown || []).find((b) => b.roundId === selectedRound.Id);
        const hasEvaluated = rb && rb.hasEvaluated;
        if (statusFilter === 'evaluated') return Boolean(hasEvaluated);
        if (statusFilter === 'pending') return !hasEvaluated;
      } else {
        // Overall tab status
        const isEvaluated = t.roundsEvaluatedCount > 0;
        if (statusFilter === 'evaluated') return isEvaluated;
        if (statusFilter === 'pending') return !isEvaluated;
      }

      return true;
    });
  }, [teams, searchQuery, statusFilter, selectedRound]);

  // Sorted Teams based on Active Tab
  const sortedDisplayTeams = useMemo(() => {
    const list = [...filteredTeams];

    if (selectedRound) {
      // Sort by this round's average score descending
      return list.sort((a, b) => {
        const scoreA = (a.roundBreakdown || []).find((r) => r.roundId === selectedRound.Id)?.roundAverageScore || 0;
        const scoreB = (b.roundBreakdown || []).find((r) => r.roundId === selectedRound.Id)?.roundAverageScore || 0;
        return scoreB - scoreA;
      });
    }

    // Overall Tab: Sort by total score descending
    return list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }, [filteredTeams, selectedRound]);

  // Overall Podium Winners (Top 3)
  const topThreeOverall = useMemo(() => {
    return [...teams]
      .filter((t) => (t.totalScore || 0) > 0)
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, 3);
  }, [teams]);

  // Export Results as CSV
  const handleExportCSV = () => {
    if (!teams || teams.length === 0) {
      toast.error('No results data to export');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    // Header
    const headers = [
      'Rank',
      'Team Name',
      'Team Lead',
      'College',
      'Participation Mode',
      ...rounds.map((r) => `${r.RoundName} Score (Max: ${r.totalMaxMarks})`),
      'Cumulative Score',
      'Max Possible Score',
      'Percentage (%)'
    ];
    csvContent += headers.map((h) => `"${h}"`).join(',') + '\r\n';

    // Rows
    teams.forEach((t) => {
      const row = [
        t.rank || '',
        t.TeamName || '',
        t.TeamLeadName || '',
        t.College || '',
        t.ParticipationMode || track,
        ...rounds.map((r) => {
          const rb = (t.roundBreakdown || []).find((b) => b.roundId === r.Id);
          return rb && rb.hasEvaluated ? rb.roundAverageScore : 'N/A';
        }),
        t.totalScore || 0,
        t.maxPossibleScore || 0,
        t.percentage ? `${t.percentage}%` : '0%'
      ];
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${eventData?.EventName || 'Hackathon'}_${track}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Results exported to CSV successfully');
  };

  // Toggle Round Publish Live
  const handleTogglePublishRound = async (round) => {
    if (!round) return;
    try {
      setPublishing(true);
      const nextState = !round.IsPublished;
      const res = await fetch(`http://localhost:3000/api/evaluators/rounds/${round.Id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextState })
      });
      if (!res.ok) throw new Error('Failed to update publication status');
      toast.success(`Round #${round.RoundOrder} ${nextState ? 'published live' : 'unpublished'}!`);
      fetchResults();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  // Toggle Round Open / Close (Evaluators can grade when Open)
  const handleToggleRoundOpen = async (round) => {
    if (!round) return;
    const isCurrentlyOpen = round.IsOpen !== 0;
    const nextOpen = !isCurrentlyOpen;
    try {
      setUpdatingRound(true);
      const res = await fetch(`http://localhost:3000/api/evaluators/rounds/${round.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IsOpen: nextOpen ? 1 : 0 })
      });
      if (!res.ok) throw new Error('Failed to update round status');
      toast.success(`Round #${round.RoundOrder} is now ${nextOpen ? 'OPEN (Evaluators can grade)' : 'CLOSED (Scoring locked)'}`);
      fetchResults();
    } catch (err) {
      toast.error(err.message || 'Failed to update round status');
    } finally {
      setUpdatingRound(false);
    }
  };

  // Toggle Evaluator Score Edit Permission (Allow / Lock Score Edits)
  const handleToggleAllowScoreEdit = async (round) => {
    if (!round) return;
    const isCurrentlyAllowed = round.AllowScoreEdit === 1;
    const nextAllowed = !isCurrentlyAllowed;
    try {
      setUpdatingRound(true);
      const res = await fetch(`http://localhost:3000/api/evaluators/rounds/${round.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ AllowScoreEdit: nextAllowed ? 1 : 0 })
      });
      if (!res.ok) throw new Error('Failed to update score edit permission');
      toast.success(nextAllowed ? 'Evaluator Score Editing is now ALLOWED' : 'Evaluator Score Editing is now LOCKED');
      fetchResults();
    } catch (err) {
      toast.error(err.message || 'Failed to update edit permission');
    } finally {
      setUpdatingRound(false);
    }
  };

  // Toggle Overall Leaderboard Publish Live
  const handleTogglePublishOverall = async () => {
    if (!eventId) return;
    try {
      setPublishing(true);
      const nextState = !resultsData?.overallResultsPublished;
      const res = await fetch(`http://localhost:3000/api/evaluators/event/${eventId}/publish-overall`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, isPublished: nextState })
      });
      if (!res.ok) throw new Error('Failed to update overall publication status');
      toast.success(`Overall ${track} leaderboard ${nextState ? 'published live' : 'unpublished'}!`);
      fetchResults();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6 font-sans transition-colors duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 4px 20px -2px ${theme.glow}`
              }}
            >
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isBoth ? `${track} Evaluation Results & Leaderboard` : 'Evaluation Results & Leaderboard'}
                </h1>
                {isBoth && (
                  <span
                    className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: theme.badgeBg,
                      borderColor: theme.badgeBorder,
                      color: theme.badgeText
                    }}
                  >
                    {track} Track
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {eventData?.EventName || 'Assigned Hackathon'} &bull; Round-wise jury grading, multi-evaluator breakdown &amp; cumulative totals
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchResults}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-zinc-800 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            style={{
              backgroundColor: theme.buttonBg,
              color: theme.buttonText,
              boxShadow: `0 4px 15px -2px ${theme.glow}`
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: theme.iconBg,
              borderColor: theme.cardBorder,
              color: theme.iconColor
            }}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{isIndividual ? 'Total Participants' : 'Total Teams'}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{summary.totalRegisteredTeams || 0}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: theme.iconBg,
              borderColor: theme.cardBorder,
              color: theme.iconColor
            }}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">{isIndividual ? 'Evaluated Participants' : 'Evaluated Teams'}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {summary.totalEvaluatedTeams || 0}
              <span className="text-xs font-normal text-slate-400 dark:text-gray-500 ml-1">
                / {summary.totalRegisteredTeams || 0}
              </span>
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: theme.iconBg,
              borderColor: theme.cardBorder,
              color: theme.iconColor
            }}
          >
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Active Rounds</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{rounds.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: theme.iconBg,
              borderColor: theme.cardBorder,
              color: theme.iconColor
            }}
          >
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Jury Members</p>
            <h3 className="text-2xl font-black mt-0.5" style={{ color: theme.accent }}>
              {allEvaluators.length}
              <span className="text-xs font-normal text-slate-400 dark:text-gray-500 ml-1">Evaluators</span>
            </h3>
          </div>
        </div>
      </div>

      {/* ── WEBSITE SIGNATURE THEME TABS ── */}
      <div className="relative pt-4">
        <div className="relative z-10 -mb-px flex items-end gap-2 overflow-x-auto scrollbar-thin">
          {rounds.map((round) => {
            const tabKey = `round_${round.Id}`;
            const isActive = activeTab === tabKey;

            return (
              <button
                key={round.Id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tabKey);
                  setExpandedTeamId(null);
                }}
                className="relative flex h-12 shrink-0 items-center gap-2 rounded-t-2xl px-5 text-xs font-bold tracking-wide outline-none transition-colors sm:px-6 sm:text-sm cursor-pointer"
              >
                {isActive ? (
                  <motion.div
                    layoutId="resultsActiveTab"
                    className="absolute inset-0 -bottom-[2px] z-20 rounded-t-2xl border-x border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="pointer-events-none absolute -bottom-[2px] left-0 right-0 z-30 h-1 bg-white dark:bg-zinc-950" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 z-0 rounded-t-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-100/90 dark:bg-zinc-900/60 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors" />
                )}

                <span className={`relative z-20 flex items-center gap-2 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>
                  <ClipboardList className="h-4 w-4" style={{ color: isActive ? theme.accent : undefined }} />
                  <span>{round.RoundName}</span>
                  {round.IsOpen === 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Closed</span>
                    </span>
                  )}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                    style={{
                      backgroundColor: isActive ? theme.badgeBg : (isDark ? 'rgba(39, 39, 42, 0.6)' : '#E2E8F0'),
                      borderColor: isActive ? theme.badgeBorder : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1'),
                      color: isActive ? theme.badgeText : (isDark ? '#a1a1aa' : '#475569')
                    }}
                  >
                    {round.totalMaxMarks} pts
                  </span>
                  {isActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                  )}
                </span>
              </button>
            );
          })}

          {/* OVERALL LEADERBOARD TAB (LAST TAB) */}
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overall'}
            onClick={() => {
              setActiveTab('overall');
              setExpandedTeamId(null);
            }}
            className="relative flex h-12 shrink-0 items-center gap-2 rounded-t-2xl px-6 text-xs font-bold tracking-wide outline-none transition-colors sm:px-7 sm:text-sm cursor-pointer ml-auto"
          >
            {activeTab === 'overall' ? (
              <motion.div
                layoutId="resultsActiveTab"
                className="absolute inset-0 -bottom-[2px] z-20 rounded-t-2xl border-x border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.5)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              >
                <div className="pointer-events-none absolute -bottom-[2px] left-0 right-0 z-30 h-1 bg-white dark:bg-zinc-950" />
              </motion.div>
            ) : (
              <div className="absolute inset-0 z-0 rounded-t-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-100/90 dark:bg-zinc-900/60 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors" />
            )}

            <span className={`relative z-20 flex items-center gap-2 ${activeTab === 'overall' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Overall Leaderboard</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                style={{
                  backgroundColor: activeTab === 'overall' ? theme.badgeBg : (isDark ? 'rgba(39, 39, 42, 0.6)' : '#E2E8F0'),
                  borderColor: activeTab === 'overall' ? theme.badgeBorder : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1'),
                  color: activeTab === 'overall' ? theme.badgeText : (isDark ? '#a1a1aa' : '#475569')
                }}
              >
                All Rounds ({resultsData?.totalPossibleMarks || 0} pts)
              </span>
              {activeTab === 'overall' && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </span>
          </button>
        </div>

        {/* ── TAB CONTENT PANEL ── */}
        <section
          role="tabpanel"
          className="relative z-10 -mt-[1px] rounded-3xl rounded-tl-none border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-2xl"
        >
          {/* Selected Round Header (When a round tab is active) */}
          {selectedRound && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: theme.badgeBg,
                      borderColor: theme.badgeBorder,
                      color: theme.badgeText
                    }}
                  >
                    Round #{selectedRound.RoundOrder}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedRound.RoundName} Results
                  </h2>
                </div>
                {selectedRound.Description && (
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {selectedRound.Description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-gray-300 shadow-xs">
                  <strong className="text-slate-900 dark:text-white">{selectedRound.questions?.length || 0}</strong> Evaluation Criteria
                </div>
                <div
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.badgeBorder,
                    color: theme.badgeText
                  }}
                >
                  Max Marks: {selectedRound.totalMaxMarks} pts
                </div>

                {/* Open / Close Round Status Toggle */}
                <button
                  type="button"
                  disabled={updatingRound}
                  onClick={() => handleToggleRoundOpen(selectedRound)}
                  title={selectedRound.IsOpen !== 0 ? 'Click to Close Round (Evaluators cannot score)' : 'Click to Open Round (Evaluators can grade)'}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                    selectedRound.IsOpen !== 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                  }`}
                >
                  {selectedRound.IsOpen !== 0 ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Round Open</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Round Closed</span>
                    </>
                  )}
                </button>

                {/* Evaluator Score Edit Permission Toggle */}
                <button
                  type="button"
                  disabled={updatingRound}
                  onClick={() => handleToggleAllowScoreEdit(selectedRound)}
                  title={selectedRound.AllowScoreEdit === 1 ? 'Click to Lock Score Editing for evaluators' : 'Click to Allow evaluators to edit submitted scores'}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                    selectedRound.AllowScoreEdit === 1
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {selectedRound.AllowScoreEdit === 1 ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Score Edit: Allowed</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>Score Edit: Locked</span>
                    </>
                  )}
                </button>

                {/* Publish Round Results Button */}
                <button
                  type="button"
                  disabled={publishing}
                  onClick={() => handleTogglePublishRound(selectedRound)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                    selectedRound.IsPublished
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-gray-300 hover:border-slate-300 dark:hover:border-zinc-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {selectedRound.IsPublished ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                      <span>Published Live</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                      <span>Publish Round</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Overall Publish & Status Bar */}
          {activeTab === 'overall' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.badgeBorder,
                    color: theme.badgeText
                  }}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overall Hackathon Final Rankings</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    {resultsData?.overallResultsPublished
                      ? 'Final leaderboard and winners podium are currently published live to all participants.'
                      : 'Publish final rankings so participants can see their overall position and score on their dashboard.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={publishing}
                onClick={handleTogglePublishOverall}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border shrink-0 shadow-xs ${
                  resultsData?.overallResultsPublished
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                {resultsData?.overallResultsPublished ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span>Overall Published Live (Click to Unpublish)</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>Publish Overall Leaderboard &amp; Podium</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Overall Podium Showcase (When 'overall' tab is active) */}
          {activeTab === 'overall' && topThreeOverall.length > 0 && (
            <div
              className="rounded-2xl border p-6 sm:p-8 relative overflow-hidden bg-slate-50 dark:bg-zinc-950/70 border-slate-200 dark:border-zinc-800 shadow-sm"
              style={{
                borderColor: theme.cardBorder
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {isBoth ? `Overall Hackathon Winners Podium (${track} Track)` : 'Overall Hackathon Winners Podium'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThreeOverall.map((team, idx) => {
                  const medals = [
                    { rank: '1st Place (Winner)', badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40' },
                    { rank: '2nd Place (Runner Up)', badge: 'bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-400/40' },
                    { rank: '3rd Place', badge: 'bg-amber-700/20 text-amber-700 dark:text-amber-500 border-amber-700/40' }
                  ];
                  const medal = medals[idx] || medals[0];

                  return (
                    <div
                      key={team.Id}
                      className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-5 flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${medal.badge}`}>
                          {medal.rank}
                        </span>
                        <span className="text-2xl font-black" style={{ color: theme.accent }}>
                          {team.totalScore} <span className="text-xs font-normal text-slate-400 dark:text-gray-500">/ {team.maxPossibleScore} pts</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {isIndividual ? (team.TeamLeadName || team.TeamName?.replace(/\s*\(Individual\)/gi, '')) : team.TeamName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                          <span className="truncate">{team.College || 'Institution'}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
                        {!isIndividual ? (
                          <span>Lead: <strong className="text-slate-800 dark:text-gray-200">{team.TeamLeadName || 'Unknown'}</strong></span>
                        ) : (
                          <span className="text-slate-500 dark:text-gray-400">{team.College || 'Institution'}</span>
                        )}
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {team.roundsEvaluatedCount} / {rounds.length} Rounds Scored
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder={isIndividual ? "Search participant or college..." : "Search team, lead, or college..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
              {[
                { label: isIndividual ? 'All Participants' : 'All Teams', id: 'all' },
                { label: 'Evaluated', id: 'evaluated' },
                { label: 'Pending Evaluation', id: 'pending' },
              ].map((f) => {
                const isActive = statusFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className="px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                    style={{
                      backgroundColor: isActive ? theme.buttonBg : 'transparent',
                      color: isActive ? theme.buttonText : (isDark ? '#9ca3af' : '#64748b')
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results List */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 gap-3">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: theme.border, borderTopColor: 'transparent' }}
              />
              <p className="text-xs">Loading evaluation results...</p>
            </div>
          ) : sortedDisplayTeams.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
              <Trophy className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">No teams found</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                {searchQuery ? 'Try matching another team name or lead' : 'No teams match the current criteria'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDisplayTeams.map((team, idx) => {
                const isExpanded = expandedTeamId === team.Id;

                // If viewing specific round
                const currentRoundData = selectedRound
                  ? (team.roundBreakdown || []).find((rb) => rb.roundId === selectedRound.Id)
                  : null;

                const isRoundEvaluated = currentRoundData?.hasEvaluated;

                return (
                  <div
                    key={team.Id}
                    className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 transition-all overflow-hidden shadow-xs hover:shadow-sm"
                  >
                    {/* Team Card Main Row */}
                    <div
                      onClick={() => setExpandedTeamId(isExpanded ? null : team.Id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-zinc-900/90 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Indicator */}
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold shrink-0 border"
                          style={{
                            backgroundColor: team.rank === 1 ? 'rgba(245, 158, 11, 0.15)' : theme.subtleBg,
                            borderColor: team.rank === 1 ? '#f59e0b' : theme.cardBorder,
                            color: team.rank === 1 ? '#d97706' : theme.accent
                          }}
                        >
                          {team.rank ? `#${team.rank}` : idx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                              {isIndividual ? (team.TeamLeadName || team.TeamName?.replace(/\s*\(Individual\)/gi, '')) : team.TeamName}
                            </h3>
                            {!isIndividual && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-zinc-700/80">
                                {team.TeamSize || 1} Member{(team.TeamSize || 1) > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                            {!isIndividual && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                                {team.TeamLeadName || 'Lead'}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                              {team.College || 'Institution'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Score Status or Marks */}
                      <div className="flex items-center justify-between sm:justify-end gap-5">
                        {/* WHEN A SPECIFIC ROUND TAB IS ACTIVE */}
                        {selectedRound && (
                          <div>
                            {isRoundEvaluated ? (
                              <div className="text-right">
                                <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-black" style={{ color: theme.accent }}>
                                    {currentRoundData.roundAverageScore}
                                  </span>
                                  <span className="text-xs text-slate-400 dark:text-gray-500 font-bold">
                                    / {currentRoundData.maxMarks} pts
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 dark:text-gray-400 block">
                                  Evaluated by {currentRoundData.submissionCount} {currentRoundData.submissionCount === 1 ? 'Jury' : 'Juries'}
                                </span>
                              </div>
                            ) : (
                              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Not Evaluated Yet
                              </span>
                            )}
                          </div>
                        )}

                        {/* WHEN OVERALL TAB IS ACTIVE */}
                        {activeTab === 'overall' && (
                          <div className="flex items-center gap-4">
                            {/* Round Pills Overview */}
                            <div className="hidden lg:flex items-center gap-2">
                              {(team.roundBreakdown || []).map((rb) => (
                                <div
                                  key={rb.roundId}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1"
                                  style={{
                                    backgroundColor: rb.hasEvaluated ? theme.badgeBg : (isDark ? 'rgba(39, 39, 42, 0.5)' : '#F1F5F9'),
                                    borderColor: rb.hasEvaluated ? theme.badgeBorder : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'),
                                    color: rb.hasEvaluated ? theme.badgeText : (isDark ? '#71717a' : '#64748b')
                                  }}
                                >
                                  <span>R#{rb.roundOrder}:</span>
                                  <span>{rb.hasEvaluated ? `${rb.roundAverageScore}/${rb.maxMarks}` : 'Pending'}</span>
                                </div>
                              ))}
                            </div>

                            {/* Overall Score */}
                            <div className="text-right">
                              {team.roundsEvaluatedCount > 0 ? (
                                <>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black" style={{ color: theme.accent }}>
                                      {team.totalScore}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-gray-500 font-bold">
                                      / {team.maxPossibleScore} pts
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                    {team.roundsEvaluatedCount} of {rounds.length} rounds scored
                                  </span>
                                </>
                              ) : (
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  Not Evaluated Yet
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expand / Collapse Chevron */}
                        <button
                          type="button"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Multi-Evaluator Breakdown Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-5 pb-5 pt-2 border-t border-slate-200 dark:border-zinc-800/80 space-y-4 bg-slate-50/70 dark:bg-zinc-950/60"
                        >
                          {team.ProblemStatementTitle && (
                            <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-gray-400 mb-0.5">
                                Problem Statement:
                              </span>
                              <p className="text-slate-800 dark:text-gray-200 font-medium">{team.ProblemStatementTitle}</p>
                            </div>
                          )}

                          {/* If in Specific Round Tab: Show all Evaluators who scored this round */}
                          {selectedRound && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <UserCheck className="w-4 h-4" style={{ color: theme.accent }} />
                                  Evaluator Submissions for Round #{selectedRound.RoundOrder} ({currentRoundData?.submissionCount || 0} Submissions)
                                </h4>
                                {currentRoundData?.hasEvaluated && (
                                  <span className="text-xs font-bold" style={{ color: theme.accent }}>
                                    Round Average: {currentRoundData.roundAverageScore} / {currentRoundData.maxMarks} pts
                                  </span>
                                )}
                              </div>

                              {(!currentRoundData?.submissions || currentRoundData.submissions.length === 0) ? (
                                <div className="p-6 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 shadow-xs">
                                  <Clock className="w-6 h-6 text-amber-500 dark:text-amber-400 mx-auto mb-1.5" />
                                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Pending Jury Evaluation</p>
                                  <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-0.5">
                                    Marks will appear here automatically once an assigned evaluator submits their rubric score.
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {currentRoundData.submissions.map((sub, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs"
                                    >
                                      <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">{sub.evaluatorName}</h5>
                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-gray-400">
                                              {sub.evaluatorRole || 'Evaluator'}
                                            </span>
                                          </div>
                                          {sub.evaluatorCollege && (
                                            <p className="text-[10px] text-slate-400 dark:text-gray-500">{sub.evaluatorCollege}</p>
                                          )}
                                        </div>

                                        <span
                                          className="px-2.5 py-1 rounded-xl text-xs font-extrabold border"
                                          style={{
                                            backgroundColor: theme.badgeBg,
                                            borderColor: theme.badgeBorder,
                                            color: theme.badgeText
                                          }}
                                        >
                                          Awarded: {sub.totalScore} / {sub.maxPossibleScore} pts
                                        </span>
                                      </div>

                                      {/* Question by question rubric score */}
                                      {sub.scoresData && sub.scoresData.length > 0 ? (
                                        <div className="space-y-1.5 pt-1">
                                          {sub.scoresData.map((qScore, qIdx) => (
                                            <div
                                              key={qIdx}
                                              className="flex items-center justify-between text-xs text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-850"
                                            >
                                              <span className="truncate pr-2">{qScore.questionText}</span>
                                              <span className="font-extrabold text-slate-900 dark:text-white shrink-0">
                                                {qScore.marks} <span className="text-slate-400 dark:text-gray-500 font-normal">/ {qScore.maxMarks}</span>
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : null}

                                      {/* Qualitative Feedback */}
                                      {sub.feedback && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-gray-300 space-y-0.5">
                                          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
                                            Evaluator Feedback:
                                          </span>
                                          <p className="italic text-slate-800 dark:text-gray-200">"{sub.feedback}"</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* If in Overall Tab: Show all rounds and their evaluators */}
                          {activeTab === 'overall' && (
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
                                All Rounds Detailed Scoring History
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(team.roundBreakdown || []).map((rb) => (
                                  <div
                                    key={rb.roundId}
                                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 space-y-2.5 shadow-xs"
                                  >
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Round #{rb.roundOrder}: {rb.roundName}
                                      </h5>
                                      {rb.hasEvaluated ? (
                                        <span
                                          className="text-xs font-extrabold"
                                          style={{ color: theme.accent }}
                                        >
                                          {rb.roundAverageScore} / {rb.maxMarks} pts
                                        </span>
                                      ) : (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                          Not Evaluated Yet
                                        </span>
                                      )}
                                    </div>

                                    {rb.hasEvaluated ? (
                                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-gray-400">
                                        <p className="text-[11px]">
                                          Evaluated by: <strong className="text-slate-800 dark:text-gray-200">{rb.submissions?.map(s => s.evaluatorName).join(', ')}</strong>
                                        </p>
                                        {rb.submissions?.[0]?.feedback && (
                                          <p className="italic text-slate-700 dark:text-gray-300 line-clamp-2">
                                            "{rb.submissions[0].feedback}"
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-slate-400 dark:text-gray-500 italic">
                                        No jury has entered marks for this round yet.
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminResultsPage;
