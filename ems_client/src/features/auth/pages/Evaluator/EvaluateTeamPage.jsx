import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  Trophy,
  CheckCircle2,
  Clock,
  Save,
  Building2,
  User,
  Users,
  FileText,
  AlertCircle,
  HelpCircle,
  Check,
  MapPin,
  Laptop,
  ChevronRight,
  ShieldCheck,
  MessageSquare,
  Lock,
  Unlock,
  Edit3,
  FolderGit2,
  Globe,
  ExternalLink,
  Code2
} from 'lucide-react';
import useAuth from '../../../../Hooks/useAuth';
import useTheme from '../../../../Hooks/useTheme';
import useToast from '../../../../Hooks/useToast';
import { getEventTheme } from '../../../../lib/utils';
import ThemeToggle from '../../../../components/Organisms/ThemeToggler';

function EvaluateTeamPage() {
  const { roundId, teamId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { theme: appTheme } = useTheme();

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
  const [round, setRound] = useState(null);
  const [team, setTeam] = useState(null);
  const [existingScore, setExistingScore] = useState(null);
  const [scores, setScores] = useState({}); // questionId -> marks
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dynamic Event Color Theme
  const theme = useMemo(() => {
    return getEventTheme(eventData || {}, isDark);
  }, [eventData, isDark]);

  // Fetch Event, Round, Team and Existing Score
  const loadData = useCallback(async () => {
    if (!eventId || !roundId || !teamId) return;
    try {
      setLoading(true);

      // 1. Fetch Event Info for Color Theme & Details
      const eventPromise = fetch(`${API_BASE_URL}/api/events/${eventId}`)
        .then((r) => r.json())
        .then((d) => (d.event || d.data || d))
        .catch(() => null);

      // 2. Fetch Rounds and Questions for this Track
      const roundsPromise = fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/rounds?track=${track}`)
        .then((r) => r.json())
        .then((d) => (Array.isArray(d) ? d : d.data || []))
        .catch(() => []);

      // 3. Fetch Team Details
      const teamPromise = fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/teams?track=${track}`)
        .then((r) => r.json())
        .then((d) => {
          const list = Array.isArray(d) ? d : d.data || [];
          return list.find((t) => Number(t.Id) === Number(teamId)) || null;
        })
        .catch(() => null);

      // 4. Fetch Any Existing Score for this Evaluator + Round
      const scorePromise = fetch(`${API_BASE_URL}/api/evaluators/rounds/${roundId}/scores?evaluatorId=${evaluator?.Id}`)
        .then((r) => r.json())
        .then((d) => {
          const list = Array.isArray(d) ? d : d.data || [];
          return list.find((s) => Number(s.TeamId) === Number(teamId)) || null;
        })
        .catch(() => null);

      const [evData, allRounds, currentTeam, scoreData] = await Promise.all([
        eventPromise,
        roundsPromise,
        teamPromise,
        scorePromise
      ]);

      if (evData) setEventData(evData);

      const targetRound = allRounds.find((r) => Number(r.Id) === Number(roundId));
      setRound(targetRound || null);
      setTeam(currentTeam || null);

      if (scoreData) {
        setExistingScore(scoreData);
        setFeedback(scoreData.Feedback || '');
        if (scoreData.CriterionScores) {
          try {
            const parsed = typeof scoreData.CriterionScores === 'string'
              ? JSON.parse(scoreData.CriterionScores)
              : scoreData.CriterionScores;
            setScores(parsed || {});
          } catch (e) {
            console.error('Failed to parse CriterionScores:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error loading evaluation sheet:', err);
      toast.error('Failed to load evaluation sheet details');
    } finally {
      setLoading(false);
    }
  }, [eventId, roundId, teamId, track, evaluator, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Round Max Marks calculation
  const roundMaxMarks = useMemo(() => {
    if (!round || !Array.isArray(round.questions)) return 0;
    return round.questions.reduce((sum, q) => sum + (Number(q.MaxMarks) || 0), 0);
  }, [round]);

  // Calculated current total score
  const currentTotalScore = useMemo(() => {
    let sum = 0;
    Object.values(scores).forEach((val) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        sum += num;
      }
    });
    // Format to 1 decimal place if floating point
    return Math.round(sum * 10) / 10;
  }, [scores]);

  const scorePercentage = roundMaxMarks > 0 ? Math.round((currentTotalScore / roundMaxMarks) * 100) : 0;

  // Calculated Round & Score Permissions
  const isRoundClosed = Boolean(round && round.IsOpen === 0);
  const isScoreLocked = Boolean(existingScore && round && round.AllowScoreEdit !== 1);
  const isReadOnly = isRoundClosed || isScoreLocked;

  // Save Score Handler
  const handleSaveScore = async () => {
    if (isRoundClosed) {
      toast.error('This round has been closed by the event admin. Scores cannot be submitted or changed.');
      return;
    }
    if (isScoreLocked) {
      toast.error('Score editing is locked by admin for this round. Evaluators do not have permission to modify submitted scores.');
      return;
    }
    if (!round || !team || !evaluator) {
      toast.error('Missing required evaluation data');
      return;
    }

    // Validate that questions have been scored
    const questionList = round.questions || [];
    if (questionList.length === 0) {
      toast.error('This round has no scoring questions rubric');
      return;
    }

    // Check for negative numbers or scores exceeding max
    for (const q of questionList) {
      const given = scores[q.Id];
      if (given !== undefined && given !== '') {
        const num = parseFloat(given);
        if (num < 0 || num > Number(q.MaxMarks)) {
          toast.error(`Score for "${q.QuestionText}" must be between 0 and ${q.MaxMarks}`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      const payload = {
        roundId: Number(round.Id),
        teamId: Number(team.Id),
        evaluatorId: Number(evaluator.Id),
        totalScore: currentTotalScore,
        maxPossibleScore: roundMaxMarks,
        criterionScores: scores,
        feedback: feedback.trim()
      };

      const res = await fetch(`${API_BASE_URL}/api/evaluators/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit score');
      }

      toast.success(`Score submitted successfully for ${team.TeamName}!`);
      setTimeout(() => {
        navigate('/evaluator/dashboard');
      }, 500);
    } catch (err) {
      console.error('Error saving score:', err);
      toast.error(err.message || 'Failed to save score');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col items-center justify-center gap-3">
        <div
          className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: theme.border, borderTopColor: 'transparent' }}
        />
        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">Loading evaluation sheet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 selection:bg-emerald-500 selection:text-black pb-28">
      {/* Top Fixed Header with Event Theme & Theme Toggle */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Link
            to="/evaluator/dashboard"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                {eventData?.EventName || 'Assigned Event'}
              </span>
              <span
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.badgeBorder,
                  color: theme.badgeText,
                  borderWidth: '1px'
                }}
              >
                {track} Track
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>Round #{round?.RoundOrder}: {round?.RoundName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              <span style={{ color: theme.accent }}>{team?.TeamName}</span>
            </h1>
          </div>
        </div>

        {/* Live Score Pill & Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="px-3.5 py-1.5 rounded-xl border flex items-center gap-2"
            style={{
              backgroundColor: theme.subtleBg,
              borderColor: theme.cardBorder
            }}
          >
            <span className="text-xs text-slate-500 dark:text-gray-400 hidden sm:inline">Calculated Score:</span>
            <span className="text-sm font-extrabold" style={{ color: theme.accent }}>
              {currentTotalScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-500">/ {roundMaxMarks} pts</span>
          </div>

          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {isReadOnly ? (
            <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              <span>{isRoundClosed ? 'Round Closed' : 'Score Locked'}</span>
            </div>
          ) : (
            <button
              onClick={handleSaveScore}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: theme.buttonBg,
                color: theme.buttonText
              }}
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{existingScore ? 'Update Score' : 'Save Score'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Page Container */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Permission Notice Banners */}
        {isRoundClosed ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <strong className="font-bold text-sm block text-rose-900 dark:text-rose-200">
                Round Closed by Administrator
              </strong>
              <span>
                This round ({round?.RoundName}) is currently closed. Scoring is disabled and marks cannot be submitted or changed.
              </span>
            </div>
          </div>
        ) : isScoreLocked ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <strong className="font-bold text-sm block text-amber-900 dark:text-amber-200">
                Score Editing Locked by Admin
              </strong>
              <span>
                You have already evaluated this team. The event administrator has restricted score modifications for this round.
              </span>
            </div>
          </div>
        ) : existingScore && round?.AllowScoreEdit === 1 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <strong className="font-bold text-sm block text-emerald-900 dark:text-emerald-200">
                Score Editing Enabled
              </strong>
              <span>
                The administrator has enabled score editing for this round. You can adjust the rubric marks and re-submit your evaluation.
              </span>
            </div>
          </div>
        ) : null}

        {/* Team Overview Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden bg-white dark:bg-zinc-950/70 border-slate-200/80 dark:border-white/10 shadow-sm"
          style={{
            borderColor: theme.cardBorder,
            boxShadow: `0 10px 40px -10px ${theme.glow}`
          }}
        >
          {/* Subtle gradient backdrop */}
          <div
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: theme.primary }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.badgeBorder,
                    color: theme.badgeText,
                    borderWidth: '1px'
                  }}
                >
                  Round #{round?.RoundOrder || 1} Evaluation
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-zinc-700">
                  {team?.TeamSize || 1} Member{(team?.TeamSize || 1) > 1 ? 's' : ''}
                </span>
                {existingScore && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Previously Scored ({existingScore.TotalScore}/{roundMaxMarks} pts)
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {team?.TeamName}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-gray-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                  <span>Team Lead: <strong className="text-slate-900 dark:text-white">{team?.TeamLeadName || team?.UserName || 'Lead'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                  <span>College: <strong className="text-slate-900 dark:text-white">{team?.College || 'Institution'}</strong></span>
                </div>
                {team?.State && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                    <span>State: <strong className="text-slate-900 dark:text-white">{team.State}</strong></span>
                  </div>
                )}
              </div>

              {/* Problem Statement Card if available */}
              {(team?.ProblemStatementTitle || team?.ProblemStatement) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 mt-3 space-y-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest block"
                    style={{ color: theme.accent }}
                  >
                    Challenge / Problem Statement:
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-gray-200 leading-relaxed">
                    {team?.ProblemStatementTitle || team?.ProblemStatement}
                  </p>
                </div>
              )}

              {/* Team's Project Submission & Code Artifacts */}
              {(team?.GithubRepoUrl || team?.LiveDemoUrl || team?.DrivePptUrl || team?.TechStack) && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 mt-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest block text-emerald-600 dark:text-emerald-400">
                    Project Submission & Demo Links:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {team.GithubRepoUrl && (
                      <a
                        href={team.GithubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-xs font-semibold transition shadow-xs"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                    {team.LiveDemoUrl && (
                      <a
                        href={team.LiveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold transition shadow-xs"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                    {team.DrivePptUrl && (
                      <a
                        href={team.DrivePptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-slate-400 text-xs font-semibold transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pitch Deck</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    )}
                  </div>
                  {team.TechStack && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 pt-1">
                      <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Tech Stack: <strong className="text-slate-800 dark:text-zinc-200">{team.TechStack}</strong></span>
                    </div>
                  )}
                  {team.ProjectDescription && (
                    <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 pt-1 border-t border-emerald-500/10">
                      {team.ProjectDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Score Tally Summary Box */}
            <div
              className="p-5 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 min-w-[180px] bg-slate-50 dark:bg-zinc-900/90 border-slate-200 dark:border-white/10"
              style={{
                borderColor: theme.cardBorder
              }}
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                Total Score
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-4xl font-black" style={{ color: theme.accent }}>
                  {currentTotalScore}
                </span>
                <span className="text-sm text-slate-500 dark:text-gray-500 font-bold">/ {roundMaxMarks}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${scorePercentage}%`,
                    backgroundColor: theme.primary
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold mt-1.5">
                {scorePercentage}% of Max Points
              </span>
            </div>
          </div>
        </motion.div>

        {/* Round Rubric Guidelines Notice */}
        {round?.Description && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-start gap-3">
            <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                Round Evaluation Guidelines
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                {round.Description}
              </p>
            </div>
          </div>
        )}

        {/* Evaluation Rubrics Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: theme.accent }} />
              Scoring Criteria Rubric ({round?.questions?.length || 0} Questions)
            </h3>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{
                backgroundColor: theme.badgeBg,
                borderColor: theme.badgeBorder,
                color: theme.badgeText
              }}
            >
              Round Total: {roundMaxMarks} Marks
            </span>
          </div>

          {/* Question Cards List */}
          {(!round?.questions || round.questions.length === 0) ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800">
              <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400/80 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-gray-300">No criteria defined for this round</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                The event administrator has not added any question rubrics with marks for this round yet.
              </p>
            </div>
          ) : (
            round.questions.map((q, idx) => {
              const max = q.MaxMarks || 10;
              const val = scores[q.Id] !== undefined ? scores[q.Id] : '';
              const numVal = Number(val) || 0;
              const isFilled = val !== '' && !isNaN(numVal);

              return (
                <motion.div
                  key={q.Id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-3xl border p-6 space-y-4 transition-all bg-white dark:bg-zinc-900/70 border-slate-200/80 dark:border-white/10 shadow-sm"
                  style={{
                    borderColor: isFilled ? theme.border : undefined
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText
                          }}
                        >
                          {idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {q.QuestionText}
                        </h4>
                      </div>
                      {q.Description && (
                        <p className="text-xs text-slate-500 dark:text-gray-400 pl-8 leading-relaxed">
                          {q.Description}
                        </p>
                      )}
                    </div>

                    <div
                      className="shrink-0 px-3 py-1 rounded-xl border text-xs font-bold self-start"
                      style={{
                        backgroundColor: theme.badgeBg,
                        borderColor: theme.badgeBorder,
                        color: theme.badgeText
                      }}
                    >
                      Max: {max} pts
                    </div>
                  </div>

                  {/* Interactive Score Selector & Presets */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Quick Percentage Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium mr-1">Quick Select:</span>
                      {[
                        { label: '0 Pts', ratio: 0 },
                        { label: '25%', ratio: 0.25 },
                        { label: '50%', ratio: 0.5 },
                        { label: '75%', ratio: 0.75 },
                        { label: 'Full (100%)', ratio: 1 }
                      ].map((preset) => {
                        const calculated = Math.round(max * preset.ratio * 10) / 10;
                        const isSelected = isFilled && numVal === calculated;

                        return (
                          <button
                            key={preset.label}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => {
                              if (isReadOnly) return;
                              setScores((prev) => ({ ...prev, [q.Id]: calculated }));
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                            }`}
                            style={{
                              backgroundColor: isSelected ? theme.buttonBg : (isDark ? 'rgba(39, 39, 42, 0.7)' : '#F1F5F9'),
                              color: isSelected ? theme.buttonText : (isDark ? '#9ca3af' : '#475569'),
                              borderColor: isSelected ? theme.border : (isDark ? 'transparent' : '#E2E8F0'),
                              borderWidth: '1px'
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Numerical Score Input with RegExp (Numbers and Floats Only) */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs text-slate-700 dark:text-gray-300 font-semibold">Marks Awarded:</span>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*[.]?[0-9]*"
                          autoComplete="off"
                          disabled={isReadOnly}
                          readOnly={isReadOnly}
                          value={val}
                          onChange={(e) => {
                            if (isReadOnly) return;
                            const raw = e.target.value;
                            if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                              if (raw === '' || raw === '.') {
                                setScores((prev) => ({ ...prev, [q.Id]: raw }));
                              } else {
                                const num = parseFloat(raw);
                                if (!isNaN(num) && num > max) {
                                  setScores((prev) => ({ ...prev, [q.Id]: max.toString() }));
                                } else {
                                  setScores((prev) => ({ ...prev, [q.Id]: raw }));
                                }
                              }
                            }
                          }}
                          onBlur={() => {
                            if (isReadOnly) return;
                            if (val === '.' || val === '') {
                              setScores((prev) => ({ ...prev, [q.Id]: '' }));
                            } else {
                              const num = parseFloat(val);
                              if (!isNaN(num)) {
                                setScores((prev) => ({
                                  ...prev,
                                  [q.Id]: Math.min(max, Math.max(0, num)).toString()
                                }));
                              }
                            }
                          }}
                          placeholder="0"
                          className={`w-24 px-3 py-2 rounded-xl border text-base font-extrabold text-center focus:outline-none transition-colors ${
                            isReadOnly
                              ? 'cursor-not-allowed opacity-80 bg-slate-100 dark:bg-zinc-800'
                              : 'bg-slate-50 dark:bg-zinc-900'
                          }`}
                          style={{
                            borderColor: isFilled ? theme.border : (isDark ? '#3f3f46' : '#CBD5E1'),
                            color: theme.accent
                          }}
                        />
                        <span className="text-xs text-slate-400 dark:text-gray-500 font-bold ml-2">/ {max}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Qualitative Feedback Section */}
        <div
          className="rounded-3xl border p-6 space-y-3 bg-white dark:bg-zinc-900/70 border-slate-200/80 dark:border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: theme.accent }} />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Jury Feedback & Evaluation Remarks (Optional)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Provide personalized constructive notes on the team's presentation, architecture, UI/UX, or technical feasibility.
          </p>
          <textarea
            rows={4}
            value={feedback}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => {
              if (isReadOnly) return;
              setFeedback(e.target.value);
            }}
            placeholder={isReadOnly ? 'No feedback recorded or feedback is locked.' : 'Write constructive evaluation notes, areas of improvement, or outstanding innovations observed during the round...'}
            className={`w-full border rounded-2xl p-4 text-xs placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
              isReadOnly
                ? 'cursor-not-allowed opacity-80 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800'
                : 'bg-slate-50 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-gray-200'
            }`}
            style={{ focusBorderColor: theme.border }}
          />
        </div>
      </main>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800/90 px-4 sm:px-8 py-4 shadow-lg transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block">
                Total Score Awarded:
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black" style={{ color: theme.accent }}>
                  {currentTotalScore}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-gray-500">
                  / {roundMaxMarks} Maximum Marks
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/evaluator/dashboard"
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors text-center"
            >
              {isReadOnly ? 'Back to Dashboard' : 'Cancel'}
            </Link>

            {isReadOnly ? (
              <div className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border border-slate-300 dark:border-zinc-800 flex items-center justify-center gap-2 cursor-not-allowed">
                <Lock className="w-4 h-4" />
                <span>{isRoundClosed ? 'Round Closed by Admin' : 'Score Editing Locked by Admin'}</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveScore}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: theme.buttonBg,
                  color: theme.buttonText,
                  boxShadow: `0 4px 20px -2px ${theme.glow}`
                }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Score...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{existingScore ? 'Update Evaluation Score' : 'Submit Evaluation Score'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluateTeamPage;
