import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Search,
  LogOut,
  ChevronRight,
  FileText,
  AlertCircle,
  Laptop,
  MapPin,
  Sparkles,
  Building2,
  User,
  Check,
  RefreshCw,
  Star,
  Lock,
  Unlock,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../../Hooks/useAuth';
import useTheme from '../../../../Hooks/useTheme';
import useToast from '../../../../Hooks/useToast';
import { getEventTheme } from '../../../../lib/utils';
import ThemeToggle from '../../../../components/Organisms/ThemeToggler';

function EvaluatorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme: appTheme } = useTheme();
  const toast = useToast();

  const isDark = appTheme === 'dark';

  const evaluator = useMemo(() => {
    try {
      const stored = localStorage.getItem('evaluator') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const eventId = evaluator?.EventId || evaluator?.eventId;
  const track = evaluator?.Track || evaluator?.track || 'Physical';

  const [eventData, setEventData] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({}); // teamId -> scoreObj
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'evaluated', 'pending'

  // Dynamic Event Color Theme adapting to light & dark mode
  const theme = useMemo(() => {
    return getEventTheme(eventData || {}, isDark);
  }, [eventData, isDark]);

  // Fetch Event Data for Branding & Theme
  useEffect(() => {
    if (!eventId) return;
    fetch(`http://localhost:3000/api/events/${eventId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.event) setEventData(d.event);
      })
      .catch((err) => console.error('Failed to load event:', err));
  }, [eventId]);

  // Fetch Rounds for this Event & Track
  const fetchRounds = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoadingRounds(true);
      const res = await fetch(`http://localhost:3000/api/evaluators/event/${eventId}/rounds?track=${track}`);
      if (res.ok) {
        const json = await res.json();
        const roundList = Array.isArray(json) ? json : (json.data || json.rounds || []);
        setRounds(roundList);
        if (roundList.length > 0) {
          setSelectedRoundId((prev) => (prev ? prev : roundList[0].Id));
        }
      }
    } catch (err) {
      console.error('Failed to fetch rounds:', err);
      toast.error('Failed to load evaluation rounds');
    } finally {
      setLoadingRounds(false);
    }
  }, [eventId, track, toast]);

  // Fetch Teams for this Event & Track
  const fetchTeams = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoadingTeams(true);
      const res = await fetch(`http://localhost:3000/api/evaluators/event/${eventId}/teams?track=${track}`);
      if (res.ok) {
        const json = await res.json();
        const teamList = Array.isArray(json) ? json : (json.data || json.teams || []);
        setTeams(teamList);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      toast.error('Failed to load teams for evaluation');
    } finally {
      setLoadingTeams(false);
    }
  }, [eventId, track, toast]);

  // Fetch Existing Scores for Selected Round
  const fetchRoundScores = useCallback(async (roundId) => {
    if (!roundId || !evaluator?.Id) return;
    try {
      const res = await fetch(`http://localhost:3000/api/evaluators/rounds/${roundId}/scores?evaluatorId=${evaluator.Id}`);
      if (res.ok) {
        const json = await res.json();
        const scoreList = Array.isArray(json) ? json : (json.data || []);
        const scoreMap = {};
        scoreList.forEach((s) => {
          scoreMap[s.TeamId] = s;
        });
        setScores(scoreMap);
      }
    } catch (err) {
      console.error('Failed to fetch existing scores:', err);
    }
  }, [evaluator]);

  useEffect(() => {
    fetchRounds();
    fetchTeams();
  }, [fetchRounds, fetchTeams]);

  useEffect(() => {
    if (selectedRoundId) {
      fetchRoundScores(selectedRoundId);
    }
  }, [selectedRoundId, fetchRoundScores]);

  // Active Selected Round
  const currentRound = useMemo(() => {
    return rounds.find((r) => Number(r.Id) === Number(selectedRoundId)) || rounds[0] || null;
  }, [rounds, selectedRoundId]);

  // Calculated Metrics
  const totalTeamsCount = teams.length;
  const evaluatedCount = useMemo(() => {
    return teams.filter((t) => Boolean(scores[t.Id])).length;
  }, [teams, scores]);

  const pendingCount = Math.max(0, totalTeamsCount - evaluatedCount);
  const progressPercent = totalTeamsCount > 0 ? Math.round((evaluatedCount / totalTeamsCount) * 100) : 0;

  // Filtered Teams based on Search & Status
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const isEvaluated = Boolean(scores[team.Id]);
      if (statusFilter === 'evaluated' && !isEvaluated) return false;
      if (statusFilter === 'pending' && isEvaluated) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (team.TeamName || '').toLowerCase();
      const lead = (team.TeamLeadName || '').toLowerCase();
      const college = (team.College || '').toLowerCase();
      const ps = (team.ProblemStatementTitle || team.ProblemStatement || '').toLowerCase();

      return name.includes(q) || lead.includes(q) || college.includes(q) || ps.includes(q);
    });
  }, [teams, scores, statusFilter, searchQuery]);

  // Current Round Total Max Marks
  const roundMaxMarks = useMemo(() => {
    if (!currentRound || !Array.isArray(currentRound.questions)) return 0;
    return currentRound.questions.reduce((sum, q) => sum + (Number(q.MaxMarks) || 0), 0);
  }, [currentRound]);

  const handleNavigateToEvaluation = (team) => {
    if (!currentRound) {
      toast.error('Please select an active evaluation round first');
      return;
    }
    const isEvaluated = Boolean(scores[team.Id]);
    if (currentRound.IsOpen === 0 && !isEvaluated) {
      toast.error('This round is currently closed by the admin. Scores cannot be submitted.');
      return;
    }
    navigate(`/evaluator/evaluate/${currentRound.Id}/${team.Id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/evaluator/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Bar with Event Theme & Theme Toggle */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform shrink-0"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 4px 20px -2px ${theme.glow}`
            }}
          >
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">HACK_HUB</span>
              <span
                className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.badgeBorder,
                  color: theme.badgeText,
                  borderWidth: '1px'
                }}
              >
                Jury Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
              {eventData?.EventName || evaluator?.EventName || 'Assigned Hackathon Event'}
            </p>
          </div>
        </div>

        {/* Evaluator Profile, Theme Toggle & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Track Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold"
            style={{
              backgroundColor: theme.subtleBg,
              borderColor: theme.cardBorder,
              color: theme.accent
            }}
          >
            {track === 'Virtual' ? (
              <Laptop className="w-4 h-4 text-sky-500" />
            ) : (
              <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
            )}
            <span>{track} Track</span>
          </div>

          {/* Theme Toggle Button */}
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase border shrink-0"
              style={{
                backgroundColor: theme.badgeBg,
                borderColor: theme.badgeBorder,
                color: theme.badgeText
              }}
            >
              {evaluator?.Name ? evaluator.Name.substring(0, 2) : 'EV'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{evaluator?.Name || 'Evaluator'}</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">{evaluator?.Role || 'Technical Jury'}</p>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-5 rounded-2xl border bg-white dark:bg-zinc-900/60 border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: theme.iconBg,
                borderColor: theme.cardBorder,
                color: theme.iconColor
              }}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total Teams</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalTeamsCount}</h3>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl border bg-white dark:bg-zinc-900/60 border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: theme.iconBg,
                borderColor: theme.cardBorder,
                color: theme.iconColor
              }}
            >
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Evaluated</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {evaluatedCount} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">/ {totalTeamsCount}</span>
              </h3>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl border bg-white dark:bg-zinc-900/60 border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-4 transition-all"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: theme.iconBg,
                borderColor: theme.cardBorder,
                color: theme.iconColor
              }}
            >
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Active Rounds</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{rounds.length}</h3>
            </div>
          </div>

          <div
            className="p-5 rounded-2xl border bg-white dark:bg-zinc-900/60 border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-center"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 dark:text-gray-400 uppercase tracking-wider font-medium">Evaluation Progress</span>
              <span className="font-bold" style={{ color: theme.accent }}>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: theme.primary
                }}
              />
            </div>
          </div>
        </div>

        {/* Round Navigation Bar */}
        <div
          className="rounded-3xl p-5 sm:p-6 space-y-5 border bg-white dark:bg-zinc-950/70 border-slate-200/80 dark:border-white/10 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
                Evaluation Rounds ({track} Track)
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Select a round below to view its criteria rubrics and evaluate teams
              </p>
            </div>
            <button
              onClick={() => {
                fetchRounds();
                fetchTeams();
                if (selectedRoundId) fetchRoundScores(selectedRoundId);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-gray-300 transition-colors w-fit cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Rounds Pills */}
          {loadingRounds ? (
            <div className="flex items-center gap-3 py-4 text-xs text-slate-500 dark:text-gray-400">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: theme.border, borderTopColor: 'transparent' }}
              />
              Loading rounds...
            </div>
          ) : rounds.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-zinc-950/60 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
              <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400/80 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-gray-300">No evaluation rounds created yet</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                The event administrator has not added any rounds for the {track} track yet.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {rounds.map((round) => {
                const isSelected = Number(selectedRoundId) === round.Id;
                const totalQMarks = (round.questions || []).reduce((s, q) => s + (Number(q.MaxMarks) || 0), 0);

                return (
                  <button
                    key={round.Id}
                    onClick={() => setSelectedRoundId(round.Id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? theme.subtleBg : (isDark ? 'rgba(24, 24, 28, 0.6)' : '#F8FAFC'),
                      borderColor: isSelected ? theme.border : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'),
                      boxShadow: isSelected ? `0 4px 20px -2px ${theme.glow}` : 'none'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: isSelected ? theme.primary : (isDark ? '#27272a' : '#E2E8F0'),
                        color: isSelected ? '#FFFFFF' : (isDark ? '#9ca3af' : '#475569')
                      }}
                    >
                      #{round.RoundOrder || 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{round.RoundName}</span>
                        {round.IsOpen === 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Closed
                          </span>
                        ) : round.Status && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: theme.badgeBg,
                              color: theme.badgeText
                            }}
                          >
                            {round.Status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                        {round.questions?.length || 0} Criteria &bull; {totalQMarks} Total Marks
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Current Round Rubric Details Accordion */}
          {currentRound && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: theme.accent }} />
                    Round #{currentRound.RoundOrder}: {currentRound.RoundName} Rubric
                  </h4>
                  {currentRound.Description && (
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{currentRound.Description}</p>
                  )}
                </div>
                <div
                  className="px-3.5 py-1 rounded-xl text-xs font-bold w-fit border"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.badgeBorder,
                    color: theme.badgeText
                  }}
                >
                  Round Total: {roundMaxMarks} Marks
                </div>
              </div>

              {/* Rubric Criteria Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(currentRound.questions || []).map((q, idx) => (
                  <div
                    key={q.Id}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-2 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-gray-200 line-clamp-1">
                        {idx + 1}. {q.QuestionText}
                      </p>
                      {q.Description && (
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 mt-0.5">{q.Description}</p>
                      )}
                    </div>
                    <span
                      className="shrink-0 px-2.5 py-0.5 rounded-lg text-xs font-bold border"
                      style={{
                        backgroundColor: theme.badgeBg,
                        borderColor: theme.badgeBorder,
                        color: theme.badgeText
                      }}
                    >
                      {q.MaxMarks} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Round Status Notice Banner */}
        {currentRound?.IsOpen === 0 ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <strong className="font-bold text-sm block text-rose-900 dark:text-rose-200">
                Round Closed by Administrator
              </strong>
              <span>
                Scoring for {currentRound?.RoundName} is currently closed. New evaluations cannot be submitted and existing evaluations are locked.
              </span>
            </div>
          </div>
        ) : currentRound?.AllowScoreEdit === 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-3">
            <Lock className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
            <span>
              <strong>Score Editing Restricted:</strong> Evaluator score editing is locked by admin for this round. Once submitted, marks cannot be altered unless admin grants edit access.
            </span>
          </div>
        )}

        {/* Teams Section */}
        <div
          className="rounded-3xl p-5 sm:p-6 space-y-5 border bg-white dark:bg-zinc-950/70 border-slate-200/80 dark:border-white/10 shadow-sm"
        >
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search teams by name, lead, college or problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                style={{ focusBorderColor: theme.border }}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 text-xs">
              {[
                { label: 'All Teams', id: 'all' },
                { label: 'Evaluated', id: 'evaluated' },
                { label: 'Pending', id: 'pending' },
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

          {/* Teams Grid */}
          {loadingTeams ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-gray-400 gap-3">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: theme.border, borderTopColor: 'transparent' }}
              />
              <p className="text-xs font-medium">Loading registered teams...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 dark:bg-zinc-950/60 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
              <Users className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">No teams found</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                {searchQuery ? 'Try matching another team name or keyword' : 'No teams registered in this track yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => {
                const scoreObj = scores[team.Id];
                const isEvaluated = Boolean(scoreObj);

                return (
                  <motion.div
                    key={team.Id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border p-5 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900/70 border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md"
                    style={{
                      borderColor: isEvaluated ? theme.border : undefined,
                      boxShadow: isEvaluated ? `0 4px 20px -5px ${theme.glow}` : undefined
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                            {team.TeamName || 'Unnamed Team'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-zinc-700 font-medium">
                              {team.TeamSize || 1} Member{(team.TeamSize || 1) > 1 ? 's' : ''}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                              {team.College || 'Institution'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isEvaluated ? (
                          <div
                            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 border"
                            style={{
                              backgroundColor: theme.badgeBg,
                              borderColor: theme.badgeBorder,
                              color: theme.badgeText
                            }}
                          >
                            <Check className="w-3.5 h-3.5" />
                            {scoreObj.TotalScore} / {scoreObj.MaxPossibleScore || roundMaxMarks} pts
                          </div>
                        ) : (
                          <div className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </div>
                        )}
                      </div>

                      {/* Problem Statement if available */}
                      {(team.ProblemStatementTitle || team.ProblemStatement) && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs space-y-0.5">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider block"
                            style={{ color: theme.accent }}
                          >
                            Problem Statement:
                          </span>
                          <p className="text-slate-800 dark:text-gray-200 font-medium line-clamp-2">
                            {team.ProblemStatementTitle || team.ProblemStatement}
                          </p>
                        </div>
                      )}

                      {/* Team Lead Info */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                        <span>Lead: <strong className="text-slate-800 dark:text-gray-200">{team.TeamLeadName || 'Unknown'}</strong></span>
                      </div>
                    </div>

                    {/* Bottom Action Button - Navigates to Dedicated Evaluation Page */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-gray-500 font-medium">
                        {isEvaluated
                          ? (currentRound?.AllowScoreEdit === 1 && currentRound?.IsOpen !== 0 ? 'Score submitted (Editable)' : 'Score submitted (Locked)')
                          : (currentRound?.IsOpen === 0 ? 'Round closed' : 'Awaiting round grading')}
                      </span>
                      <button
                        onClick={() => handleNavigateToEvaluation(team)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        style={{
                          backgroundColor: isEvaluated
                            ? theme.subtleBg
                            : (currentRound?.IsOpen === 0 ? (isDark ? '#27272a' : '#e2e8f0') : theme.buttonBg),
                          color: isEvaluated
                            ? theme.accent
                            : (currentRound?.IsOpen === 0 ? (isDark ? '#71717a' : '#94a3b8') : theme.buttonText),
                          borderColor: isEvaluated ? theme.border : 'transparent',
                          borderWidth: '1px'
                        }}
                      >
                        {isEvaluated ? (
                          currentRound?.AllowScoreEdit === 1 && currentRound?.IsOpen !== 0 ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Score</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Score</span>
                            </>
                          )
                        ) : currentRound?.IsOpen === 0 ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Round Closed</span>
                          </>
                        ) : (
                          <>
                            <span>Score Team</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EvaluatorDashboard;
