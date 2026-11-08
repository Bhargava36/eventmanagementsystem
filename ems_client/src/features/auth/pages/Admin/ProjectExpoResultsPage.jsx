import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import {
  Trophy,
  Award,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Building2,
  Printer,
  Loader2,
  AlertTriangle,
  X,
  Medal,
  ChevronRight,
  ChevronDown
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

  const [rankings, setRankings] = useState([]);
  const [results, setResults] = useState([]);
  const [scores, setScores] = useState([]);
  const [expandedTeamIds, setExpandedTeamIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState('');

  // Declare winners modal state
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [winnersForm, setWinnersForm] = useState([]);
  const [publishing, setPublishing] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [rankRes, resRes, scrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/rankings`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/results`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/scores`)
      ]);

      const rankData = await rankRes.json();
      const resData = await resRes.json();
      const scrData = await scrRes.json();

      if (rankData.success && Array.isArray(rankData.rankings)) {
        setRankings(rankData.rankings);
      }
      if (resData.success && Array.isArray(resData.results)) {
        setResults(resData.results);
      }
      if (scrData.success && Array.isArray(scrData.scores)) {
        setScores(scrData.scores);
      }
    } catch (err) {
      toast.error('Failed to load project expo rankings');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isResultsPublished = results.length > 0;

  const filteredRankings = useMemo(() => {
    return rankings.filter((r) => {
      return (
        !search ||
        (r.TeamName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.ProjectTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.DomainName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.BoothNumber || '').toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [rankings, search]);

  const toggleExpand = (teamId) => {
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
    if (expandedTeamIds.size === filteredRankings.length) {
      setExpandedTeamIds(new Set());
    } else {
      setExpandedTeamIds(new Set(filteredRankings.map((r) => r.TeamId)));
    }
  };

  // Group scores by TeamId -> JudgeId -> Criteria list & Criteria summary
  const teamScoresMap = useMemo(() => {
    const map = {};
    scores.forEach((s) => {
      const tId = s.TeamId;
      if (!map[tId]) {
        map[tId] = {
          judges: {},
          criteriaSummary: {}
        };
      }
      const tEntry = map[tId];

      const jId = s.JudgeId;
      if (!tEntry.judges[jId]) {
        tEntry.judges[jId] = {
          judgeId: jId,
          judgeName: s.JudgeName || `Judge #${jId}`,
          judgeDesignation: s.JudgeDesignation || 'Technical Jury',
          totalScore: 0,
          maxScore: 0,
          feedback: '',
          criteria: []
        };
      }
      const jEntry = tEntry.judges[jId];
      const scoreVal = parseFloat(s.Score) || 0;
      const maxVal = parseFloat(s.MaxMarks) || 20;

      jEntry.totalScore += scoreVal;
      jEntry.maxScore += maxVal;
      if (s.Feedback && !jEntry.feedback) {
        jEntry.feedback = s.Feedback;
      }

      jEntry.criteria.push({
        criteriaId: s.CriteriaId,
        criteriaName: s.CriteriaName,
        score: scoreVal,
        maxMarks: maxVal,
        feedback: s.Feedback
      });

      // Criteria summary across all judges
      const cId = s.CriteriaId;
      if (!tEntry.criteriaSummary[cId]) {
        tEntry.criteriaSummary[cId] = {
          criteriaId: cId,
          criteriaName: s.CriteriaName,
          maxMarks: maxVal,
          total: 0,
          count: 0
        };
      }
      tEntry.criteriaSummary[cId].total += scoreVal;
      tEntry.criteriaSummary[cId].count += 1;
    });
    return map;
  }, [scores]);

  const handleOpenDeclare = () => {
    const top3 = rankings.slice(0, 3);
    const initialWinners = top3.map((team, idx) => ({
      TeamId: team.TeamId,
      TeamName: team.TeamName,
      ProjectTitle: team.ProjectTitle,
      TotalScore: team.TotalScore,
      RankPosition: idx + 1,
      Category:
        idx === 0
          ? '1st Prize Champion'
          : idx === 1
          ? '1st Runner-Up'
          : '2nd Runner-Up',
      PrizeAmount:
        idx === 0
          ? '₹50,000 Cash + Trophy'
          : idx === 1
          ? '₹30,000 Cash + Trophy'
          : '₹20,000 Cash + Trophy'
    }));

    setWinnersForm(initialWinners);
    setShowDeclareModal(true);
  };

  const handleAddWinnerRow = () => {
    if (rankings.length === 0) return;
    const available = rankings.find((r) => !winnersForm.some((w) => w.TeamId === r.TeamId)) || rankings[0];
    setWinnersForm((prev) => [
      ...prev,
      {
        TeamId: available.TeamId,
        TeamName: available.TeamName,
        ProjectTitle: available.ProjectTitle,
        TotalScore: available.TotalScore,
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
      setPublishing(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/results/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winners: winnersForm })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish winners');
      }

      toast.success('Project Expo awards successfully declared and published!');
      setShowDeclareModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error publishing results');
    } finally {
      setPublishing(false);
    }
  };

  const handlePrintLeaderboard = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading leaderboard & winners...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 pt-6 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Results & Winner Declarations
          </h1>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
            Review aggregated jury evaluations, leaderboard scores, and publish official expo awards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrintLeaderboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Print Results</span>
          </button>

          <button
            type="button"
            onClick={handleOpenDeclare}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition shadow-sm cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>{isResultsPublished ? 'Re-publish Winners' : 'Declare & Publish Winners'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── PUBLISHED WINNERS PODIUM ── */}
        {isResultsPublished && (
          <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Official Award Winners
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Published and visible on participant dashboards and public expo board
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Published
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.slice(0, 3).map((win, idx) => (
                <div
                  key={win.Id || idx}
                  className="bg-white dark:bg-black p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {win.Category}
                      </span>
                      <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">
                        Rank #{win.RankPosition}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {win.TeamName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {win.ProjectTitle}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Score: <strong className="text-gray-900 dark:text-white font-semibold">{win.TotalScore}</strong></span>
                    {win.PrizeAmount && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {win.PrizeAmount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH BAR ── */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leaderboard by team name, project title, domain, or booth..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* ── AGGREGATED LEADERBOARD ── */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Live Evaluation Leaderboard ({filteredRankings.length} Teams)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Calculated from all jury rubric evaluations across the 5 judging criteria. Click any team row to inspect individual judge scorecards.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleAll}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{expandedTeamIds.size === filteredRankings.length ? 'Collapse All Details' : 'Expand All Jury Details'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="py-4 px-3 w-10 text-center"></th>
                  <th className="py-4 px-4 w-16 text-center">Rank</th>
                  <th className="py-4 px-6">Exhibiting Team</th>
                  <th className="py-4 px-6">Project Title & Domain</th>
                  <th className="py-4 px-6">Stall</th>
                  <th className="py-4 px-6 text-center">Juries</th>
                  <th className="py-4 px-6 text-right">Avg / Judge</th>
                  <th className="py-4 px-6 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {filteredRankings.map((team, idx) => {
                  const isExpanded = expandedTeamIds.has(team.TeamId);
                  const teamData = teamScoresMap[team.TeamId] || { judges: {}, criteriaSummary: {} };
                  const judgeList = Object.values(teamData.judges);
                  const summaryList = Object.values(teamData.criteriaSummary);

                  return (
                    <React.Fragment key={team.TeamId}>
                      <tr
                        onClick={() => toggleExpand(team.TeamId)}
                        className={`hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                        }`}
                      >
                        <td className="py-4 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(team.TeamId);
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                            title={isExpanded ? 'Collapse' : 'Expand Details'}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-emerald-600' : ''
                              }`}
                            />
                          </button>
                        </td>

                        <td className="py-4 px-4 text-center font-bold text-gray-500">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{team.TeamName}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{team.LeaderName}</p>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{team.ProjectTitle || 'No Title'}</p>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                            • {team.DomainName || 'General Engineering'}
                          </span>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium text-xs">
                            <Building2 className="w-3 h-3 text-emerald-600" />
                            <span>{team.BoothNumber || 'Pending'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800/80 text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {team.JudgesEvaluatedCount || 0} Juries
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right font-medium text-gray-600 dark:text-gray-300">
                          <span className="font-mono">{parseFloat(team.AvgScore || 0).toFixed(1)}</span>
                          <span className="text-xs text-gray-400"> / 100</span>
                        </td>

                        <td className="py-4 px-6 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="font-mono text-base">{parseFloat(team.TotalScore || 0).toFixed(1)}</span>
                        </td>
                      </tr>

                      {/* ── EXPANDED DETAILED BREAKDOWN ROW ── */}
                      {isExpanded && (
                        <tr className="bg-gray-50/80 dark:bg-zinc-950/90 border-b border-gray-200 dark:border-zinc-800">
                          <td colSpan={8} className="p-4 sm:p-6 lg:p-8">
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-6 max-w-6xl mx-auto"
                            >
                              {/* Sub-header info bar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Award className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                      Comprehensive Jury Scorecards for {team.TeamName}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                                      Detailed rubric marks and comments submitted by each evaluating judge
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                  <span className="text-gray-600 dark:text-zinc-300">
                                    Total: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{team.TotalScore}</strong> / {judgeList.length * 100}
                                  </span>
                                  <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                    Avg: {(parseFloat(team.TotalScore) / Math.max(1, judgeList.length)).toFixed(1)} / 100 per Judge
                                  </span>
                                </div>
                              </div>

                              {/* Judge Cards Grid */}
                              {judgeList.length === 0 ? (
                                <div className="p-8 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 text-center">
                                  <p className="text-xs text-gray-500">
                                    No individual judge marks submitted yet for this team.
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                  {judgeList.map((j) => (
                                    <div
                                      key={j.judgeId}
                                      className="bg-white dark:bg-black rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-colors"
                                    >
                                      <div className="space-y-3">
                                        {/* Judge Header */}
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block truncate max-w-[190px]">
                                              • {j.judgeDesignation}
                                            </span>
                                            <h5 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                              {j.judgeName}
                                            </h5>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800/50">
                                              {j.totalScore.toFixed(1)} <span className="text-[10px] font-normal text-emerald-600/70">/ {j.maxScore}</span>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Criteria Marks List */}
                                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
                                          {j.criteria.map((c) => (
                                            <div key={c.criteriaId} className="flex items-center justify-between text-xs py-0.5">
                                              <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[200px]" title={c.criteriaName}>
                                                {c.criteriaName}
                                              </span>
                                              <span className="font-semibold text-gray-900 dark:text-white shrink-0 font-mono">
                                                <span className="text-emerald-600 dark:text-emerald-400">{c.score}</span>
                                                <span className="text-gray-400 text-[10px]"> / {c.maxMarks}</span>
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Feedback */}
                                      {j.feedback && (
                                        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                                          <p className="text-[11px] text-gray-600 dark:text-zinc-400 italic bg-gray-50/80 dark:bg-zinc-900/50 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 leading-relaxed">
                                            "{j.feedback}"
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Criteria Cross-Judge Average Bar */}
                              {summaryList.length > 0 && (
                                <div className="bg-white dark:bg-black rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h6 className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                                      <Award className="w-4 h-4 text-emerald-500" />
                                      <span>Rubric Breakdown Across All {judgeList.length} Juries</span>
                                    </h6>
                                    <span className="text-[11px] text-gray-500">
                                      Average marks awarded per evaluation criterion
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {summaryList.map((cs) => {
                                      const avg = cs.count > 0 ? (cs.total / cs.count).toFixed(1) : 0;
                                      const pct = Math.min(100, Math.round((avg / (cs.maxMarks || 20)) * 100));
                                      return (
                                        <div
                                          key={cs.criteriaId}
                                          className="p-3 rounded-xl bg-gray-50/80 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800"
                                        >
                                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate font-medium" title={cs.criteriaName}>
                                            {cs.criteriaName}
                                          </p>
                                          <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                                              {avg} <span className="text-[10px] text-gray-400 font-normal">/ {cs.maxMarks}</span>
                                            </span>
                                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                              {pct}%
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── DECLARE & PUBLISH WINNERS MODAL ── */}
        <AnimatePresence>
          {showDeclareModal && (
            <div key="publish-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !publishing && setShowDeclareModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative w-full max-w-3xl bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Declare & Publish Project Expo Awards
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Configure winning teams, prize amounts, and award titles.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={publishing}
                    onClick={() => setShowDeclareModal(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePublishWinners} className="space-y-5">
                  <div className="space-y-4">
                    {winnersForm.map((win, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Position #{idx + 1}
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Winning Team
                            </label>
                            <select
                              value={win.TeamId}
                              onChange={(e) => {
                                const selectedId = parseInt(e.target.value, 10);
                                const match = rankings.find((r) => r.TeamId === selectedId);
                                const updated = [...winnersForm];
                                updated[idx] = {
                                  ...updated[idx],
                                  TeamId: selectedId,
                                  TeamName: match?.TeamName || '',
                                  ProjectTitle: match?.ProjectTitle || '',
                                  TotalScore: match?.TotalScore || 0
                                };
                                setWinnersForm(updated);
                              }}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                            >
                              {rankings.map((r) => (
                                <option key={r.TeamId} value={r.TeamId}>
                                  {r.TeamName} (Score: {r.TotalScore})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Award Category
                            </label>
                            <input
                              type="text"
                              value={win.Category}
                              onChange={(e) => {
                                const updated = [...winnersForm];
                                updated[idx].Category = e.target.value;
                                setWinnersForm(updated);
                              }}
                              placeholder="e.g. 1st Prize Champion"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              Prize Amount / Citation
                            </label>
                            <input
                              type="text"
                              value={win.PrizeAmount}
                              onChange={(e) => {
                                const updated = [...winnersForm];
                                updated[idx].PrizeAmount = e.target.value;
                                setWinnersForm(updated);
                              }}
                              placeholder="e.g. ₹50,000 Cash + Trophy"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
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
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition cursor-pointer"
                    >
                      + Add Additional Award Winner
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={() => setShowDeclareModal(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={publishing}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Publish Official Results</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
