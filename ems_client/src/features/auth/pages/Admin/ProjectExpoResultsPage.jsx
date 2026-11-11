import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import Pagination from '../../../../components/Molecules/Pagination';
import {
  Trophy,
  Award,
  Search,
  CheckCircle2,
  Users,
  Building2,
  Printer,
  Loader2,
  AlertTriangle,
  X,
  Medal,
  ChevronDown,
  ChevronUp,
  Layers,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Download,
  Share2,
  Clock,
  ShieldCheck,
  Check,
  Lock
} from 'lucide-react';

export default function ProjectExpoResultsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { eventId: urlEventId } = useParams();

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = urlEventId || admin?.EventId || 34;

  // ── SUB-TABS: 'overall' | `round_${id}` ──
  const [activeTab, setActiveTab] = useState('overall');

  // ── DATA STATES ──
  const [resultsData, setResultsData] = useState(null);
  const [declaredWinners, setDeclaredWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── SEARCH & FILTER ──
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'fully' | 'partially' | 'none'
  const [expandedTeamIds, setExpandedTeamIds] = useState(new Set());

  // ── PAGINATION ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── DECLARE WINNERS MODAL ──
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [winnersForm, setWinnersForm] = useState([]);
  const [publishingWinners, setPublishingWinners] = useState(false);

  // ── ROUND PUBLISHING LOADING ──
  const [publishingRoundId, setPublishingRoundId] = useState(null);

  // ── LOAD DATA ──
  const loadData = useCallback(async (isSilent = false) => {
    if (!eventId) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [evalRes, expoWinRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/results?track=Physical&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/results?all=true&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ]);

      if (evalRes.ok) {
        const json = await evalRes.json();
        setResultsData(json.data || json.results || json);
      }

      if (expoWinRes.ok) {
        const winJson = await expoWinRes.json();
        if (winJson.success && Array.isArray(winJson.results)) {
          setDeclaredWinners(winJson.results);
        }
      }
    } catch (err) {
      console.error('Failed to load project expo results:', err);
      toast.error('Failed to load evaluation results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, activeTab, pageSize]);

  const rounds = resultsData?.rounds || [];
  const allTeams = resultsData?.teams || resultsData?.leaderboard || [];
  const isOverallPublished = Boolean(resultsData?.overallResultsPublished || declaredWinners.length > 0);
  const isOverallPublishReady = Boolean(resultsData?.isOverallPublishReady);

  // Compute total marks
  const totalRoundsMarks = useMemo(() => {
    return (rounds || []).reduce((sum, r) => sum + (Number(r.totalMaxMarks) || 0), 0);
  }, [rounds]);

  // Selected Round Object if on a round tab
  const selectedRound = useMemo(() => {
    if (activeTab === 'overall') return null;
    const rId = activeTab.replace('round_', '');
    return rounds.find((r) => String(r.Id) === String(rId)) || rounds[0] || null;
  }, [rounds, activeTab]);

  const isSelectedRoundReady = Boolean(selectedRound?.evaluatorProgress?.isFullyEvaluated);

  // ── TOGGLE PUBLISH FOR A SINGLE ROUND ──
  const handleTogglePublishRound = async (round) => {
    try {
      const isCurrentlyPub = round.IsPublished === 1 || round.IsPublished === true;
      const nextPub = !isCurrentlyPub;

      // Guard: when publishing, ensure all evaluators have submitted
      if (nextPub && round.evaluatorProgress && !round.evaluatorProgress.isFullyEvaluated) {
        toast.error('Cannot publish round: All evaluators must finish submitting scores for all teams first.');
        return;
      }

      setPublishingRoundId(round.Id);

      const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${round.Id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextPub })
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update round publication status');
      }

      toast.success(
        nextPub
          ? `Round "${round.RoundName}" results successfully published to participant teams!`
          : `Round "${round.RoundName}" results unpublished (hidden from teams).`
      );
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error updating round publication status');
    } finally {
      setPublishingRoundId(null);
    }
  };

  // ── FILTERED TEAMS BASED ON SEARCH, STATUS, & ACTIVE TAB ──
  const filteredTeams = useMemo(() => {
    return allTeams.filter((t) => {
      // 1. Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const tName = (t.TeamName || '').toLowerCase();
        const pTitle = (t.ExpoProjectTitle || t.ProblemStatementTitle || '').toLowerCase();
        const dom = (t.ExpoDomainName || '').toLowerCase();
        const booth = (t.BoothNumber || '').toLowerCase();
        const lead = (t.TeamLeadName || '').toLowerCase();
        if (!tName.includes(q) && !pTitle.includes(q) && !dom.includes(q) && !booth.includes(q) && !lead.includes(q)) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'all') return true;
      if (activeTab === 'overall') {
        if (statusFilter === 'fully') return t.isFullyEvaluated;
        if (statusFilter === 'partially') return t.isPartiallyEvaluated;
        if (statusFilter === 'none') return t.isNotEvaluated;
      } else if (selectedRound) {
        const rb = (t.roundBreakdown || []).find((b) => b.roundId === selectedRound.Id);
        const hasEval = rb && rb.hasEvaluated;
        if (statusFilter === 'fully') return Boolean(hasEval);
        if (statusFilter === 'none') return !hasEval;
      }
      return true;
    });
  }, [allTeams, search, statusFilter, activeTab, selectedRound]);

  // ── SORTED TEAMS (BY SCORE IN CURRENT TAB) ──
  const sortedTeams = useMemo(() => {
    const list = [...filteredTeams];
    if (selectedRound) {
      // Sort by this specific round's average score descending
      return list.sort((a, b) => {
        const scoreA = (a.roundBreakdown || []).find((r) => r.roundId === selectedRound.Id)?.roundAverageScore || 0;
        const scoreB = (b.roundBreakdown || []).find((r) => r.roundId === selectedRound.Id)?.roundAverageScore || 0;
        return scoreB - scoreA;
      });
    }
    // Overall: sort by totalScore descending
    return list.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }, [filteredTeams, selectedRound]);

  const totalPages = Math.max(1, Math.ceil(sortedTeams.length / pageSize));
  const paginatedTeams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTeams.slice(start, start + pageSize);
  }, [sortedTeams, currentPage, pageSize]);

  // Expand / Collapse team details row
  const toggleExpandTeam = (teamId) => {
    setExpandedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (expandedTeamIds.size === sortedTeams.length) {
      setExpandedTeamIds(new Set());
    } else {
      setExpandedTeamIds(new Set(sortedTeams.map((t) => t.Id)));
    }
  };

  // ── DECLARE & PUBLISH WINNERS MODAL LOGIC ──
  const handleOpenDeclare = () => {
    if (!isOverallPublishReady) {
      toast.error('Cannot declare winners: All evaluators must finish scoring all teams in every round first.');
      return;
    }
    const top3 = allTeams.slice(0, 3);
    const initialWinners = top3.map((team, idx) => ({
      TeamId: team.Id,
      TeamName: team.TeamName,
      ProjectTitle: team.ExpoProjectTitle || team.ProblemStatementTitle || team.TeamName,
      TotalScore: team.totalScore || 0,
      RankPosition: idx + 1,
      Category:
        idx === 0
          ? '1st Prize Champion'
          : idx === 1
          ? '1st Runner-Up'
          : '2nd Runner-Up',
      PrizeAmount:
        idx === 0
          ? '₹50,000 Cash + Gold Trophy'
          : idx === 1
          ? '₹30,000 Cash + Silver Trophy'
          : '₹20,000 Cash + Bronze Trophy'
    }));
    setWinnersForm(initialWinners);
    setShowDeclareModal(true);
  };

  const handleAddWinnerRow = () => {
    if (allTeams.length === 0) return;
    const available = allTeams.find((r) => !winnersForm.some((w) => w.TeamId === r.Id)) || allTeams[0];
    setWinnersForm((prev) => [
      ...prev,
      {
        TeamId: available.Id,
        TeamName: available.TeamName,
        ProjectTitle: available.ExpoProjectTitle || available.ProblemStatementTitle || available.TeamName,
        TotalScore: available.totalScore || 0,
        RankPosition: prev.length + 1,
        Category: 'Special Category Award',
        PrizeAmount: '₹10,000 Cash'
      }
    ]);
  };

  const handleRemoveWinnerRow = (idx) => {
    setWinnersForm((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePublishWinners = async (e) => {
    e.preventDefault();
    if (!eventId || winnersForm.length === 0) return;
    try {
      setPublishingWinners(true);
      // 1. Publish official declared winners to project_expo_results
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/results/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: winnersForm })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish winners');
      }

      // 2. Also publish overall results on the events table
      await fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/publish-overall`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: 'Physical', isPublished: true })
      });

      toast.success('Project Expo official awards successfully declared & published to all teams!');
      setShowDeclareModal(false);
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error publishing winners');
    } finally {
      setPublishingWinners(false);
    }
  };

  const [unpublishingOverall, setUnpublishingOverall] = useState(false);

  const handleUnpublishOverall = async () => {
    try {
      setUnpublishingOverall(true);
      const res = await fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/publish-overall`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: 'Physical', isPublished: false })
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to unpublish overall results');
      }
      toast.success('Overall awards unpublished (hidden from participant dashboards).');
      loadData(true);
    } catch (err) {
      toast.error(err.message || 'Error unpublishing overall results');
    } finally {
      setUnpublishingOverall(false);
    }
  };

  const handlePrintLeaderboard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
          Loading evaluation results & awards...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors"
    >
      {/* ── TOP HEADER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Project Expo Results Center
              </span>
              <span className="text-gray-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">Physical Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
              Results &amp; Winner Declarations
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
              Review round-by-round evaluations, publish stage scorecards to teams, and declare official awards
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-600 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700 transition cursor-pointer"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            
            {isOverallPublished && (
              <button
                type="button"
                onClick={handleUnpublishOverall}
                disabled={unpublishingOverall}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 transition shadow-sm cursor-pointer disabled:opacity-50"
                title="Hide overall podium and winners from participant dashboards"
              >
                <EyeOff className="w-4 h-4" />
                <span>{unpublishingOverall ? 'Unpublishing...' : 'Unpublish Overall'}</span>
              </button>
            )}

            <button
              type="button"
              disabled={!isOverallPublishReady}
              onClick={handleOpenDeclare}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-sm ${
                isOverallPublishReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-400 dark:text-zinc-500 cursor-not-allowed border border-gray-300 dark:border-zinc-800'
              }`}
              title={
                isOverallPublishReady
                  ? 'Declare and publish official event podium winners'
                  : 'Declare Winners is locked until all evaluators finish scoring every round'
              }
            >
              {isOverallPublishReady ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>
                {declaredWinners.length > 0
                  ? 'Re-publish Winners'
                  : isOverallPublishReady
                  ? 'Declare & Publish Winners'
                  : 'Declare Winners (Locked)'}
              </span>
            </button>
          </div>
        </div>

        {/* ── TABS: OVERALL LEADERBOARD + ROUND 1, ROUND 2, ... ── */}
        <div className="relative pt-6">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-zinc-800 pointer-events-none z-0" />
          <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none z-10 -mb-px">
            {/* OVERALL TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('overall')}
              className="relative h-11 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
            >
              {activeTab === 'overall' ? (
                <motion.div
                  layoutId="projectExpoResultsTabActive"
                  className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                >
                  <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                  <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                </motion.div>
              ) : (
                <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
              )}
              <span
                className={`relative z-30 flex items-center gap-2 ${
                  activeTab === 'overall'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <Trophy className="w-4 h-4 text-emerald-500" />
                <span>Overall Standings</span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                    activeTab === 'overall'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-300/40 dark:border-zinc-700'
                  }`}
                >
                  {allTeams.length} Teams
                </span>
              </span>
            </button>

            {/* ROUND TABS */}
            {rounds.map((r, idx) => {
              const isSelected = activeTab === `round_${r.Id}`;
              const isPub = r.IsPublished === 1 || r.IsPublished === true;
              return (
                <button
                  key={r.Id}
                  type="button"
                  onClick={() => setActiveTab(`round_${r.Id}`)}
                  className="relative h-11 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                >
                  {isSelected ? (
                    <motion.div
                      layoutId="projectExpoResultsTabActive"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                  )}
                  <span
                    className={`relative z-30 flex items-center gap-2 ${
                      isSelected
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Layers className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-500' : 'text-gray-400 dark:text-zinc-500'}`} />
                    <span>Round #{r.RoundOrder || idx + 1}: {r.RoundName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-300/40 dark:border-zinc-700'
                      }`}
                    >
                      {r.totalMaxMarks}M
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                        isPub
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {isPub ? 'Live' : 'Draft'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">

        {/* ============================================================== */}
        {/* VIEW 1: OVERALL WINNERS & AGGREGATE LEADERBOARD */}
        {/* ============================================================== */}
        {activeTab === 'overall' && (
          <div className="space-y-6">
            {/* Overall Winner Declarations Locked Banner (if not ready) */}
            {!isOverallPublishReady && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 text-xs space-y-2 shadow-sm">
                <div className="flex items-center gap-2.5 font-bold text-amber-600 dark:text-amber-400">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Winner Declarations Locked: Awaiting All Evaluators</span>
                </div>
                <p className="text-gray-600 dark:text-zinc-300 leading-relaxed">
                  Official tournament winners and prizes can only be declared and published after all evaluators complete scoring for every round.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                  {(resultsData?.overallPendingRounds || []).map((pr) => (
                    <span
                      key={pr.id}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{pr.roundName}: {pr.pendingCount} Evaluator(s) Pending</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Official Winners Podium (if declared) */}
            {declaredWinners.length > 0 ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-white dark:bg-black p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        Official Project Expo Award Winners
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                        Published live and visible on participant dashboards and public expo portals
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live Published</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {declaredWinners.slice(0, 3).map((win, idx) => (
                    <div
                      key={win.Id || idx}
                      className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black p-6 shadow-sm hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            {win.Category}
                          </span>
                          <span className="text-xs font-bold font-mono text-gray-400 dark:text-zinc-500">
                            Rank #{win.RankPosition}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {win.TeamName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">
                          {win.ProjectTitle}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Score: <strong className="text-gray-900 dark:text-white font-mono font-bold">{win.TotalScore}</strong>
                        </span>
                        {win.PrizeAmount && (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {win.PrizeAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Official Awards Not Yet Declared
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Click "Declare &amp; Publish Winners" to award trophies and cash prizes to the top-scoring teams on the live leaderboard.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isOverallPublishReady}
                  onClick={handleOpenDeclare}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 ${
                    isOverallPublishReady
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-gray-200 dark:bg-zinc-900 text-gray-400 dark:text-zinc-500 cursor-not-allowed border border-gray-300 dark:border-zinc-800'
                  }`}
                  title={
                    isOverallPublishReady
                      ? 'Click to declare official award winners and cash prizes'
                      : 'Locked: All evaluators must finish scoring all teams in every round first'
                  }
                >
                  {isOverallPublishReady ? <Award className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isOverallPublishReady ? 'Declare Winners' : 'Declare Winners (Locked)'}</span>
                </button>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter leaderboard by team name, stall number (STALL-XX), domain, project..."
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-gray-700 dark:text-zinc-300 outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  <option value="all">All Teams Status</option>
                  <option value="fully">Fully Evaluated</option>
                  <option value="partially">Partially Evaluated</option>
                  <option value="none">Pending / Not Evaluated</option>
                </select>

                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-xs font-semibold text-gray-600 dark:text-zinc-300 transition cursor-pointer whitespace-nowrap"
                >
                  {expandedTeamIds.size === sortedTeams.length ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>

            {/* Overall Live Leaderboard Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 dark:bg-black border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="py-4 px-4 w-16 text-center">Rank</th>
                      <th className="py-4 px-6">Exhibiting Team &amp; Stall</th>
                      <th className="py-4 px-6">Project Title &amp; Domain</th>
                      <th className="py-4 px-6 text-center">Rounds Progress</th>
                      <th className="py-4 px-6 text-center">Cumulative Score</th>
                      <th className="py-4 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {paginatedTeams.map((team, idx) => {
                      const rankNum = (currentPage - 1) * pageSize + idx + 1;
                      const isExpanded = expandedTeamIds.has(team.Id);
                      const rbList = team.roundBreakdown || [];

                      return (
                        <React.Fragment key={team.Id}>
                          <tr
                            onClick={() => toggleExpandTeam(team.Id)}
                            className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition cursor-pointer"
                          >
                            {/* Rank */}
                            <td className="py-4 px-4 text-center">
                              {rankNum === 1 ? (
                                <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-xs mx-auto">
                                  <Trophy className="w-4 h-4" />
                                </span>
                              ) : rankNum === 2 ? (
                                <span className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-400 border border-slate-300/30 flex items-center justify-center font-bold text-xs mx-auto">
                                  <Medal className="w-4 h-4" />
                                </span>
                              ) : rankNum === 3 ? (
                                <span className="w-8 h-8 rounded-full bg-amber-700/15 text-amber-600 border border-amber-700/30 flex items-center justify-center font-bold text-xs mx-auto">
                                  <Medal className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                  #{rankNum}
                                </span>
                              )}
                            </td>

                            {/* Exhibitor Team & Stall */}
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {team.TeamName}
                                  </span>
                                  {team.BoothNumber && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      {team.BoothNumber}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                  Lead: {team.TeamLeadName || 'N/A'} {team.College ? `• ${team.College}` : ''}
                                </p>
                              </div>
                            </td>

                            {/* Project Title & Domain */}
                            <td className="py-4 px-6">
                              <div className="space-y-1 max-w-sm">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {team.ExpoProjectTitle || team.ProblemStatementTitle || team.TeamName}
                                </p>
                                {team.ExpoDomainName && (
                                  <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                    {team.ExpoDomainName}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Rounds Progress */}
                            <td className="py-4 px-6 text-center">
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  {team.roundsEvaluatedCount || 0} / {rounds.length} Rounds
                                </span>
                                <div className="flex items-center gap-1">
                                  {rounds.map((r, rIdx) => {
                                    const rb = rbList.find((b) => b.roundId === r.Id);
                                    const hasEv = rb && rb.hasEvaluated;
                                    return (
                                      <span
                                        key={r.Id}
                                        className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center font-mono ${
                                          hasEv
                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 border border-gray-200 dark:border-zinc-700'
                                        }`}
                                        title={`Round ${r.RoundOrder || rIdx + 1}: ${hasEv ? `${rb.roundAverageScore}/${r.totalMaxMarks} pts` : 'Not evaluated'}`}
                                      >
                                        R{r.RoundOrder || rIdx + 1}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>

                            {/* Cumulative Score */}
                            <td className="py-4 px-6 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                  {team.totalScore || 0}
                                </span>
                                <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                                  / {totalRoundsMarks} Marks
                                </span>
                              </div>
                            </td>

                            {/* Accordion Toggle */}
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandTeam(team.Id);
                                }}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Breakdown Row */}
                          {isExpanded && (
                            <tr className="bg-gray-50/70 dark:bg-black border-t border-b border-gray-200 dark:border-zinc-800">
                              <td colSpan={6} className="p-6">
                                <div className="space-y-4 max-w-6xl mx-auto">
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-300">
                                      Stage-by-Stage Evaluation for {team.TeamName}
                                    </h4>
                                    <span className="text-xs text-gray-400 font-mono">
                                      Stall: {team.BoothNumber || 'Unassigned'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {rounds.map((round) => {
                                      const rb = rbList.find((b) => b.roundId === round.Id);
                                      const hasEval = rb && rb.hasEvaluated;
                                      const submissions = rb?.submissions || [];
                                      const isRoundPub = round.IsPublished === 1 || round.IsPublished === true;

                                      return (
                                        <div
                                          key={round.Id}
                                          className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-xs text-gray-900 dark:text-white">
                                                {round.RoundName}
                                              </span>
                                              {isRoundPub && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                  Live
                                                </span>
                                              )}
                                            </div>
                                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                              {hasEval ? `${rb.roundAverageScore} / ${round.totalMaxMarks}` : 'Pending'}
                                            </span>
                                          </div>

                                          {submissions.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">No score submitted for this round yet.</p>
                                          ) : (
                                            <div className="space-y-2">
                                              {submissions.map((sub, sIdx) => (
                                                <div
                                                  key={sub.scoreId || sIdx}
                                                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-200/60 dark:border-zinc-800 text-xs space-y-1"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-800 dark:text-zinc-200">
                                                      {sub.evaluatorName}
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-500">
                                                      {sub.totalScore} pts
                                                    </span>
                                                  </div>
                                                  {sub.feedback && (
                                                    <p className="text-[11px] text-gray-600 dark:text-zinc-400 italic pt-1 border-t border-gray-200/50 dark:border-zinc-800">
                                                      "{sub.feedback}"
                                                    </p>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 dark:border-zinc-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedTeams.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                  itemName="exhibitor teams"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INDIVIDUAL ROUND EVALUATION & PUBLISHING */}
        {/* ============================================================== */}
        {selectedRound && (
          <div className="space-y-6">
            {/* Round Control & Publishing Banner */}
            <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-base shrink-0">
                  #{selectedRound.RoundOrder}
                </span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      {selectedRound.RoundName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                      {selectedRound.totalMaxMarks || 0} Marks
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                      {(selectedRound.questions || []).length} Rubric Questions
                    </span>
                  </div>
                  {selectedRound.Description && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                      {selectedRound.Description}
                    </p>
                  )}
                </div>
              </div>

              {/* Publish Action & Status */}
              <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0 self-start md:self-auto">
                {selectedRound.IsPublished === 1 || selectedRound.IsPublished === true ? (
                  <>
                    <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Live Published to Teams</span>
                    </div>
                    <button
                      type="button"
                      disabled={publishingRoundId === selectedRound.Id}
                      onClick={() => handleTogglePublishRound(selectedRound)}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-rose-500/40 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-rose-500 transition cursor-pointer disabled:opacity-50"
                    >
                      {publishingRoundId === selectedRound.Id ? 'Updating...' : 'Unpublish Round'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 text-xs font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Unpublished Draft</span>
                    </div>
                    <button
                      type="button"
                      disabled={publishingRoundId === selectedRound.Id || !isSelectedRoundReady}
                      onClick={() => handleTogglePublishRound(selectedRound)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 ${
                        isSelectedRoundReady
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                          : 'bg-gray-200 dark:bg-zinc-900 text-gray-400 dark:text-zinc-500 cursor-not-allowed border border-gray-300 dark:border-zinc-800'
                      }`}
                      title={
                        isSelectedRoundReady
                          ? 'Publish round scores to participant dashboards'
                          : `Publishing locked: All evaluators must finish scoring all teams in this round first (${selectedRound?.evaluatorProgress?.pendingEvaluators?.length || 0} evaluators pending)`
                      }
                    >
                      {isSelectedRoundReady ? <Share2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>
                        {publishingRoundId === selectedRound.Id
                          ? 'Publishing...'
                          : isSelectedRoundReady
                          ? 'Publish Round Results to Teams'
                          : 'Publish Locked (Awaiting Scores)'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Evaluator Progress Tracker for Round */}
            {selectedRound.evaluatorProgress && (
              <div
                className={`rounded-2xl border p-4 sm:p-5 text-xs transition shadow-sm ${
                  isSelectedRoundReady
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    {isSelectedRoundReady ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white">
                        {isSelectedRoundReady
                          ? 'All Evaluators Have Submitted Scores for This Round'
                          : 'Awaiting Evaluator Scores Before Publishing'}
                      </h5>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                        {isSelectedRoundReady
                          ? `All ${selectedRound.evaluatorProgress.totalEvaluators} active evaluators have graded all ${selectedRound.evaluatorProgress.totalTeams} teams. Round is ready to publish!`
                          : `Publishing will be enabled once all ${selectedRound.evaluatorProgress.totalEvaluators} evaluators submit scores for all ${selectedRound.evaluatorProgress.totalTeams} teams.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                    <span className="font-mono font-bold text-gray-700 dark:text-zinc-300">
                      {selectedRound.evaluatorProgress.completedEvaluators?.length || 0} of{' '}
                      {selectedRound.evaluatorProgress.totalEvaluators} Evaluators Complete
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase font-mono ${
                        isSelectedRoundReady
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {selectedRound.evaluatorProgress.totalSubmittedScores} /{' '}
                      {selectedRound.evaluatorProgress.totalRequiredScores} Scores
                    </span>
                  </div>
                </div>

                {/* Evaluator Status Pills */}
                <div className="pt-3 flex flex-wrap gap-2">
                  {(selectedRound.evaluatorProgress.completedEvaluators || []).map((ev) => (
                    <span
                      key={ev.id}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3" />
                      <span>
                        {ev.name}: {ev.evaluatedTeamsCount}/{ev.totalTeams} Teams Done
                      </span>
                    </span>
                  ))}
                  {(selectedRound.evaluatorProgress.pendingEvaluators || []).map((ev) => (
                    <span
                      key={ev.id}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-[11px] flex items-center gap-1.5"
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {ev.name}: {ev.evaluatedTeamsCount}/{ev.totalTeams} Teams Scored (Pending)
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Filter and Search Bar for Round */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search teams evaluated in ${selectedRound.RoundName}...`}
                  className="w-full pl-11 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                  Showing {sortedTeams.length} teams in this stage
                </span>
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-xs font-semibold text-gray-600 dark:text-zinc-300 transition cursor-pointer whitespace-nowrap"
                >
                  {expandedTeamIds.size === sortedTeams.length ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>

            {/* Round Specific Leaderboard Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 dark:bg-black border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="py-4 px-4 w-16 text-center">Rank</th>
                      <th className="py-4 px-6">Exhibiting Team &amp; Stall</th>
                      <th className="py-4 px-6">Project Title &amp; Domain</th>
                      <th className="py-4 px-6 text-center">Round Score</th>
                      <th className="py-4 px-6 text-center">Jury Evaluations</th>
                      <th className="py-4 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {paginatedTeams.map((team, idx) => {
                      const rankNum = (currentPage - 1) * pageSize + idx + 1;
                      const isExpanded = expandedTeamIds.has(team.Id);
                      const rb = (team.roundBreakdown || []).find((b) => b.roundId === selectedRound.Id);
                      const hasEval = rb && rb.hasEvaluated;
                      const submissions = rb?.submissions || [];

                      return (
                        <React.Fragment key={team.Id}>
                          <tr
                            onClick={() => toggleExpandTeam(team.Id)}
                            className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/40 transition cursor-pointer"
                          >
                            {/* Rank */}
                            <td className="py-4 px-4 text-center font-mono font-bold text-xs text-gray-500">
                              {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`}
                            </td>

                            {/* Exhibiting Team & Stall */}
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {team.TeamName}
                                  </span>
                                  {team.BoothNumber && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      {team.BoothNumber}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-zinc-400">
                                  Lead: {team.TeamLeadName || 'N/A'} {team.College ? `• ${team.College}` : ''}
                                </p>
                              </div>
                            </td>

                            {/* Project Title & Domain */}
                            <td className="py-4 px-6">
                              <div className="space-y-1 max-w-sm">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {team.ExpoProjectTitle || team.ProblemStatementTitle || team.TeamName}
                                </p>
                                {team.ExpoDomainName && (
                                  <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                                    {team.ExpoDomainName}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Round Score */}
                            <td className="py-4 px-6 text-center">
                              {hasEval ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                    {rb.roundAverageScore}
                                  </span>
                                  <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                                    / {selectedRound.totalMaxMarks} Marks
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Not evaluated</span>
                              )}
                            </td>

                            {/* Jury Reviews Count */}
                            <td className="py-4 px-6 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                submissions.length > 0
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'
                              }`}>
                                {submissions.length} Review{submissions.length !== 1 ? 's' : ''}
                              </span>
                            </td>

                            {/* Accordion Toggle */}
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandTeam(team.Id);
                                }}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Judge Review Details for this Round */}
                          {isExpanded && (
                            <tr className="bg-gray-50/70 dark:bg-black border-t border-b border-gray-200 dark:border-zinc-800">
                              <td colSpan={6} className="p-6">
                                <div className="space-y-4 max-w-6xl mx-auto">
                                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-zinc-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-300">
                                      {selectedRound.RoundName} — Jury Scorecards for {team.TeamName}
                                    </h4>
                                    <span className="text-xs text-gray-400 font-mono">
                                      Stall: {team.BoothNumber || 'Unassigned'}
                                    </span>
                                  </div>

                                  {submissions.length === 0 ? (
                                    <div className="p-6 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 text-center">
                                      <p className="text-xs text-gray-400 italic">No judge has graded this stall for {selectedRound.RoundName} yet.</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {submissions.map((sub, sIdx) => (
                                        <div
                                          key={sub.scoreId || sIdx}
                                          className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black space-y-3"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
                                                {sub.evaluatorRole || 'Technical Jury'}
                                              </span>
                                              <h5 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                                {sub.evaluatorName}
                                              </h5>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                                              {sub.totalScore} / {selectedRound.totalMaxMarks} pts
                                            </span>
                                          </div>

                                          {/* Rubric Criteria Breakdown */}
                                          {Array.isArray(selectedRound.questions) && selectedRound.questions.length > 0 && (
                                            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-1.5">
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                                                Criteria Marks Awarded:
                                              </span>
                                              <div className="space-y-1">
                                                {selectedRound.questions.map((q) => {
                                                  const mark = sub.scoresData?.[q.Id] ?? sub.scoresData?.[String(q.Id)] ?? null;
                                                  return (
                                                    <div key={q.Id} className="flex items-center justify-between text-[11px] py-0.5">
                                                      <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[170px]" title={q.QuestionText}>
                                                        {q.QuestionText}
                                                      </span>
                                                      <span className="font-mono font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                                                        {mark !== null && mark !== undefined ? mark : '—'}{' '}
                                                        <span className="text-gray-400 dark:text-zinc-500 font-normal">/ {q.MaxMarks}</span>
                                                      </span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          )}

                                          {/* Feedback */}
                                          {sub.feedback && (
                                            <p className="text-[11px] text-gray-600 dark:text-zinc-400 italic bg-gray-50 dark:bg-black p-2.5 rounded-xl border border-gray-200/60 dark:border-zinc-800 leading-relaxed">
                                              "{sub.feedback}"
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-200 dark:border-zinc-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedTeams.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[5, 10, 20, 50]}
                  itemName="teams in stage"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DECLARE & PUBLISH WINNERS MODAL ── */}
      <AnimatePresence>
        {showDeclareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !publishingWinners && setShowDeclareModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-heading">
                      Declare Official Project Expo Winners
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Configure cash prizes, titles, and publish live to public &amp; team dashboards
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeclareModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePublishWinners} className="space-y-4">
                <div className="space-y-3">
                  {winnersForm.map((win, idx) => (
                    <div
                      key={win.TeamId || idx}
                      className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          #{win.RankPosition} Podium Standing
                        </span>
                        {winnersForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWinnerRow(idx)}
                            className="text-xs text-rose-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                            Select Winning Team
                          </label>
                          <select
                            value={win.TeamId}
                            onChange={(e) => {
                              const tId = Number(e.target.value);
                              const match = allTeams.find((t) => t.Id === tId);
                              const updated = [...winnersForm];
                              updated[idx] = {
                                ...updated[idx],
                                TeamId: tId,
                                TeamName: match?.TeamName || '',
                                ProjectTitle: match?.ExpoProjectTitle || match?.ProblemStatementTitle || match?.TeamName || '',
                                TotalScore: match?.totalScore || 0
                              };
                              setWinnersForm(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                          >
                            {allTeams.map((t, tIdx) => (
                              <option key={t.Id} value={t.Id}>
                                #{tIdx + 1}: {t.TeamName} {t.BoothNumber ? `(${t.BoothNumber})` : ''} — {t.totalScore} pts
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                            Award Title / Category
                          </label>
                          <input
                            type="text"
                            value={win.Category}
                            onChange={(e) => {
                              const updated = [...winnersForm];
                              updated[idx].Category = e.target.value;
                              setWinnersForm(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-gray-700 dark:text-zinc-300 mb-1">
                            Cash Prize / Honors Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. ₹50,000 Cash + Gold Trophy + Incubation Grant"
                            value={win.PrizeAmount}
                            onChange={(e) => {
                              const updated = [...winnersForm];
                              updated[idx].PrizeAmount = e.target.value;
                              setWinnersForm(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleAddWinnerRow}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Add Another Award Category</span>
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowDeclareModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={publishingWinners}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {publishingWinners ? 'Publishing Awards...' : 'Publish Official Winners to Platform'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
