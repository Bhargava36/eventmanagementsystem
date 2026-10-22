import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MapPin,
  Plus,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Ban,
  Search,
  Pencil,
  Eye,
  EyeOff,
  FileQuestion,
  Monitor,
  Laptop,
  Save,
  X,
  Mail,
  LockKeyhole,
  Building2,
  Trash2,
  Copy,
  Check,
  KeyRound,
  Award,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getTrackVisibility, isSoloTeamSize } from '../../../../lib/utils';

function Evaluators() {
  const storedAdmin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = storedAdmin?.EventId;

  const { isBoth, isVirtual, isPhysical } = getTrackVisibility(
    storedAdmin?.HackathonMode,
    storedAdmin?.Location
  );
  const isIndividual = isSoloTeamSize(storedAdmin?.TeamSize);

  // Tab indexing:
  // 0: Physical Evaluators
  // 1: Virtual Evaluators
  // 2: Physical Rounds
  // 3: Virtual Rounds
  const defaultTab = isVirtual && !isPhysical ? 1 : 0;
  const [activeSection, setActiveSection] = useState(defaultTab);

  // Evaluators state
  const [evaluators, setEvaluators] = useState([]);
  const [evaluatorStats, setEvaluatorStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loadingEvaluators, setLoadingEvaluators] = useState(false);
  const [evaluatorSearch, setEvaluatorSearch] = useState('');

  // Rounds & Questions state
  const [rounds, setRounds] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [expandedRoundIds, setExpandedRoundIds] = useState({});

  const toggleRoundExpanded = (roundId) => {
    setExpandedRoundIds(prev => ({
      ...prev,
      [roundId]: !prev[roundId]
    }));
  };

  // Modals state
  const [isAddEvaluatorOpen, setIsAddEvaluatorOpen] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState(null);
  const [credentialsModal, setCredentialsModal] = useState(null); // for viewing/copying credentials
  const [copiedKey, setCopiedKey] = useState(false);

  // Evaluator form state
  const [evaluatorForm, setEvaluatorForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    track: 'Physical',
    college: '',
    role: 'Technical Evaluator'
  });
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [evaluatorSubmitting, setEvaluatorSubmitting] = useState(false);
  const [evaluatorError, setEvaluatorError] = useState('');

  // Round modal/form state
  const [isRoundModalOpen, setIsRoundModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState(null);
  const [roundForm, setRoundForm] = useState({
    name: '',
    description: '',
    roundOrder: 1,
    status: 'Active'
  });
  const [roundSubmitting, setRoundSubmitting] = useState(false);

  // Question modal/form state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [activeRoundForQuestion, setActiveRoundForQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    maxMarks: 10,
    description: '',
    questionOrder: 1
  });
  const [questionSubmitting, setQuestionSubmitting] = useState(false);

  const isRoundsTab = activeSection === 2 || activeSection === 3;
  const currentTrack = activeSection === 1 || activeSection === 3 ? 'Virtual' : 'Physical';

  // Generate strong random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEvaluatorForm(prev => ({ ...prev, password: pwd }));
  };

  // Fetch evaluators
  const fetchEvaluators = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoadingEvaluators(true);
      const res = await fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}?track=${currentTrack}`);
      const data = await res.json();
      if (res.ok) {
        setEvaluators(data.data?.evaluators || []);
        setEvaluatorStats(data.data?.stats || { total: 0, active: 0, inactive: 0 });
      } else {
        console.error('Failed to load evaluators:', data.message);
      }
    } catch (err) {
      console.error('Error fetching evaluators:', err);
    } finally {
      setLoadingEvaluators(false);
    }
  }, [eventId, currentTrack]);

  // Fetch rounds
  const fetchRounds = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoadingRounds(true);
      const res = await fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}/rounds?track=${currentTrack}`);
      const data = await res.json();
      if (res.ok) {
        setRounds(data.rounds || []);
      } else {
        console.error('Failed to load rounds:', data.message);
      }
    } catch (err) {
      console.error('Error fetching rounds:', err);
    } finally {
      setLoadingRounds(false);
    }
  }, [eventId, currentTrack]);

  useEffect(() => {
    if (isRoundsTab) {
      fetchRounds();
    } else {
      fetchEvaluators();
    }
  }, [isRoundsTab, currentTrack, fetchEvaluators, fetchRounds]);

  // Handle Evaluator Create / Update
  const handleOpenAddEvaluator = () => {
    const defaultPwd = 'Eval@' + Math.floor(1000 + Math.random() * 9000);
    setEvaluatorForm({
      name: '',
      email: '',
      username: '',
      password: defaultPwd,
      track: currentTrack,
      college: storedAdmin?.College || '',
      role: 'Technical Evaluator'
    });
    setEvaluatorError('');
    setEditingEvaluator(null);
    setIsAddEvaluatorOpen(true);
  };

  const handleOpenEditEvaluator = (evaluator) => {
    setEditingEvaluator(evaluator);
    setEvaluatorForm({
      name: evaluator.Name || '',
      email: evaluator.Email || '',
      username: evaluator.Username || '',
      password: '',
      track: evaluator.Track || currentTrack,
      college: evaluator.College || '',
      role: evaluator.Role || 'Technical Evaluator',
      status: evaluator.Status || 'Active'
    });
    setEvaluatorError('');
    setIsAddEvaluatorOpen(true);
  };

  const handleSubmitEvaluator = async (e) => {
    e.preventDefault();
    if (!eventId) {
      alert('Event ID not found for this admin.');
      return;
    }

    try {
      setEvaluatorSubmitting(true);
      setEvaluatorError('');

      if (editingEvaluator) {
        // Update
        const payload = {
          Name: evaluatorForm.name,
          Email: evaluatorForm.email,
          Username: evaluatorForm.username || evaluatorForm.email,
          College: evaluatorForm.college,
          Role: evaluatorForm.role,
          Track: evaluatorForm.track,
          Status: evaluatorForm.status
        };
        if (evaluatorForm.password) {
          payload.Password = evaluatorForm.password;
        }

        const res = await fetch(`${API_BASE_URL}/api/evaluators/${editingEvaluator.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update evaluator');

        setIsAddEvaluatorOpen(false);
        fetchEvaluators();
      } else {
        // Create
        const payload = {
          EventId: Number(eventId),
          Name: evaluatorForm.name,
          Email: evaluatorForm.email,
          Username: evaluatorForm.username || evaluatorForm.email,
          Password: evaluatorForm.password,
          Track: evaluatorForm.track,
          College: evaluatorForm.college,
          Role: evaluatorForm.role
        };

        const res = await fetch(`${API_BASE_URL}/api/evaluators`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create evaluator');

        setIsAddEvaluatorOpen(false);
        fetchEvaluators();
        // Show credentials popup so admin can copy immediately
        setCredentialsModal({
          name: payload.Name,
          email: payload.Email,
          username: payload.Username,
          password: payload.Password,
          track: payload.Track,
          role: payload.Role
        });
      }
    } catch (err) {
      setEvaluatorError(err.message);
    } finally {
      setEvaluatorSubmitting(false);
    }
  };

  const handleDeleteEvaluator = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove evaluator "${name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/evaluators/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchEvaluators();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete evaluator');
      }
    } catch (err) {
      alert(err.message || 'Error deleting evaluator');
    }
  };

  // ── ROUNDS ACTIONS ──

  const handleOpenAddRound = () => {
    setEditingRound(null);
    setRoundForm({
      name: '',
      description: '',
      roundOrder: rounds.length + 1,
      status: 'Active'
    });
    setIsRoundModalOpen(true);
  };

  const handleOpenEditRound = (round) => {
    setEditingRound(round);
    setRoundForm({
      name: round.RoundName || '',
      description: round.Description || '',
      roundOrder: round.RoundOrder || 1,
      status: round.Status || 'Active'
    });
    setIsRoundModalOpen(true);
  };

  const handleSubmitRound = async (e) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      setRoundSubmitting(true);
      if (editingRound) {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${editingRound.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            RoundName: roundForm.name,
            Description: roundForm.description,
            RoundOrder: roundForm.roundOrder,
            Status: roundForm.status
          })
        });
        if (!res.ok) throw new Error('Failed to update round');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            EventId: Number(eventId),
            Track: currentTrack,
            RoundName: roundForm.name,
            Description: roundForm.description,
            RoundOrder: roundForm.roundOrder
          })
        });
        if (!res.ok) throw new Error('Failed to create round');
      }
      setIsRoundModalOpen(false);
      fetchRounds();
    } catch (err) {
      alert(err.message);
    } finally {
      setRoundSubmitting(false);
    }
  };

  const handleDeleteRound = async (roundId, roundName) => {
    if (!window.confirm(`Are you sure you want to delete "${roundName}" and all its questions?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${roundId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchRounds();
      } else {
        alert('Failed to delete round');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // ── QUESTIONS ACTIONS ──

  const handleOpenAddQuestion = (round) => {
    setActiveRoundForQuestion(round);
    setEditingQuestion(null);
    setQuestionForm({
      questionText: '',
      maxMarks: 10,
      description: '',
      questionOrder: (round.questions?.length || 0) + 1
    });
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (round, question) => {
    setActiveRoundForQuestion(round);
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.QuestionText || '',
      maxMarks: question.MaxMarks || 10,
      description: question.Description || '',
      questionOrder: question.QuestionOrder || 1
    });
    setIsQuestionModalOpen(true);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!activeRoundForQuestion) return;

    try {
      setQuestionSubmitting(true);
      if (editingQuestion) {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/questions/${editingQuestion.Id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            QuestionText: questionForm.questionText,
            MaxMarks: Number(questionForm.maxMarks),
            Description: questionForm.description,
            QuestionOrder: questionForm.questionOrder
          })
        });
        if (!res.ok) throw new Error('Failed to update question');
      } else {
        const res = await fetch(`${API_BASE_URL}/api/evaluators/rounds/${activeRoundForQuestion.Id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            QuestionText: questionForm.questionText,
            MaxMarks: Number(questionForm.maxMarks),
            Description: questionForm.description,
            QuestionOrder: questionForm.questionOrder
          })
        });
        if (!res.ok) throw new Error('Failed to add question');
      }
      setIsQuestionModalOpen(false);
      fetchRounds();
    } catch (err) {
      alert(err.message);
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this evaluation question?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/evaluators/questions/${questionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchRounds();
      } else {
        alert('Failed to delete question');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Filtered evaluators by search
  const filteredEvaluators = useMemo(() => {
    if (!evaluatorSearch.trim()) return evaluators;
    const term = evaluatorSearch.toLowerCase().trim();
    return evaluators.filter(e =>
      (e.Name || '').toLowerCase().includes(term) ||
      (e.Email || '').toLowerCase().includes(term) ||
      (e.Username || '').toLowerCase().includes(term) ||
      (e.College || '').toLowerCase().includes(term) ||
      (e.Role || '').toLowerCase().includes(term)
    );
  }, [evaluators, evaluatorSearch]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyCredentialsPackage = (creds) => {
    const payload = `=== EVENT EVALUATOR CREDENTIALS ===\nEvent: ${storedAdmin?.EventName || 'Event ID #' + eventId}\nTrack: ${creds.track}\nEvaluator: ${creds.name}\nUsername: ${creds.username || creds.email}\nEmail: ${creds.email}\nPassword: ${creds.password || creds.plainPassword || '(As set during creation)'}\nRole: ${creds.role}\nNote: Access is strictly restricted to this event.`;
    copyToClipboard(payload);
  };

  return (
    <main className="min-h-screen w-full min-w-0 bg-slate-50 p-3 font-sans text-slate-900 dark:bg-black dark:text-white sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col items-start justify-between gap-5 border-b border-slate-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Evaluator Management
                </h1>
                {storedAdmin?.EventName && (
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {storedAdmin.EventName}
                  </span>
                )}
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Create event-specific evaluators with credentials, set up rounds, and define rubrics with max marks.
              </p>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="space-y-0">
          <div className="relative z-10 -mb-px flex items-end gap-2 overflow-x-auto">
            {[
              ...(isBoth || isPhysical
                ? [
                    { id: 0, label: isBoth ? 'Physical Event' : 'Evaluators', icon: MapPin },
                    { id: 2, label: isBoth ? 'Physical Rounds' : 'Evaluation Rounds', icon: ClipboardList }
                  ]
                : []),
              ...(isBoth || isVirtual
                ? [
                    { id: 1, label: isBoth ? 'Virtual Event' : 'Evaluators', icon: Monitor },
                    { id: 3, label: isBoth ? 'Virtual Rounds' : 'Evaluation Rounds', icon: ClipboardList }
                  ]
                : [])
            ].map((tab) => {
              const isActive = activeSection === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSection(tab.id)}
                  className="relative flex h-11 shrink-0 items-center gap-2 rounded-t-2xl px-5 text-xs font-bold tracking-wide outline-none transition-colors sm:px-7 sm:text-sm"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="evaluatorActiveTab"
                      className="absolute inset-0 -bottom-[2px] z-20 rounded-t-2xl border-x border-t border-slate-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.03)] dark:border-zinc-800 dark:bg-black"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="pointer-events-none absolute -bottom-[2px] left-0 right-0 z-30 h-1 bg-white dark:bg-black" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 z-0 rounded-t-2xl border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-black" />
                  )}
                  <span className={`relative z-20 flex items-center gap-2 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── TAB PANEL ── */}
          <section
            role="tabpanel"
            className="relative z-0 space-y-6 border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-black sm:p-8"
          >
            {/* Panel Top Banner */}
            <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  {isRoundsTab ? (
                    <ClipboardList className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                  ) : currentTrack === 'Virtual' ? (
                    <Monitor className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                  ) : (
                    <MapPin className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {isRoundsTab
                      ? (isBoth ? `${currentTrack} Evaluation Rounds` : 'Evaluation Rounds')
                      : (isBoth ? `${currentTrack} Event Evaluator Management` : 'Evaluator Management')}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                    {isRoundsTab
                      ? (isBoth
                          ? `Create sequential evaluation rounds for ${currentTrack} track and attach question rubrics with marks.`
                          : 'Create sequential evaluation rounds and attach question rubrics with marks.')
                      : (isBoth
                          ? `Create and manage evaluators for ${currentTrack} event. Assign unique credentials valid only for this event.`
                          : 'Create and manage evaluators. Assign unique credentials valid only for this event.')}
                  </p>
                </div>
              </div>

              {isRoundsTab ? (
                <button
                  type="button"
                  onClick={handleOpenAddRound}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Round
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAddEvaluator}
                  className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Evaluator
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ══════════ EVALUATORS VIEW ══════════ */}
            {!isRoundsTab && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-zinc-800/80 dark:bg-black">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                        <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total {currentTrack} Evaluators</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{evaluatorStats.total}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-zinc-800/80 dark:bg-black">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                        <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Evaluators</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{evaluatorStats.active}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-zinc-800/80 dark:bg-black">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
                        <Ban className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inactive Evaluators</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{evaluatorStats.inactive}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Box */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 sm:items-center">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                        <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {currentTrack} Event Evaluators
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {evaluators.length} registered evaluator{evaluators.length === 1 ? '' : 's'} assigned to this event
                        </p>
                      </div>
                    </div>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={evaluatorSearch}
                        onChange={(e) => setEvaluatorSearch(e.target.value)}
                        placeholder="Search by name, email, or role..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto">
                    {loadingEvaluators ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <RefreshCw className="h-7 w-7 text-emerald-600 animate-spin" />
                        <p className="text-xs text-slate-400">Loading evaluators...</p>
                      </div>
                    ) : filteredEvaluators.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="h-10 w-10 text-slate-300 dark:text-zinc-700 mb-3" />
                        <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                          {evaluatorSearch ? 'No evaluators matching your search' : `No ${currentTrack} Evaluators Created Yet`}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">
                          Click &quot;Add Evaluator&quot; above to create username and password credentials for judges evaluating this event.
                        </p>
                        {!evaluatorSearch && (
                          <button
                            type="button"
                            onClick={handleOpenAddEvaluator}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add First Evaluator
                          </button>
                        )}
                      </div>
                    ) : (
                      <table className="w-full min-w-[900px] text-center text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:bg-black">
                            <th className="whitespace-nowrap px-5 py-4 text-left">Evaluator</th>
                            <th className="whitespace-nowrap px-5 py-4 text-left">Email / Username</th>
                            <th className="whitespace-nowrap px-5 py-4">College / Org</th>
                            <th className="whitespace-nowrap px-5 py-4">Role</th>
                            <th className="whitespace-nowrap px-5 py-4">Status</th>
                            <th className="whitespace-nowrap px-5 py-4">Credentials</th>
                            <th className="whitespace-nowrap px-5 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {filteredEvaluators.map((evaluator) => {
                            const initials = (evaluator.Name || 'EV')
                              .split(' ')
                              .map(p => p[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2);

                            return (
                              <tr key={evaluator.Id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                                <td className="whitespace-nowrap px-5 py-4 align-middle text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                      {initials}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900 dark:text-white">{evaluator.Name}</p>
                                      <span className="text-[11px] text-slate-400">ID #{evaluator.Id}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 align-middle text-left">
                                  <p className="font-medium text-slate-800 dark:text-slate-200">{evaluator.Email}</p>
                                  <p className="text-xs text-slate-400">User: {evaluator.Username || evaluator.Email}</p>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 align-middle text-slate-600 dark:text-slate-400">
                                  {evaluator.College || '—'}
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 align-middle">
                                  <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {evaluator.Role || 'Evaluator'}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 align-middle">
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    evaluator.Status === 'Active'
                                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                                  }`}>
                                    {evaluator.Status === 'Active' ? (
                                      <CheckCircle2 className="h-3 w-3" />
                                    ) : (
                                      <Ban className="h-3 w-3" />
                                    )}
                                    {evaluator.Status}
                                  </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 align-middle">
                                  <button
                                    type="button"
                                    onClick={() => setCredentialsModal({
                                      name: evaluator.Name,
                                      email: evaluator.Email,
                                      username: evaluator.Username || evaluator.Email,
                                      password: evaluator.PlainTextPassword,
                                      track: evaluator.Track,
                                      role: evaluator.Role
                                    })}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                                  >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    View / Copy
                                  </button>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 align-middle">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      title="Edit Evaluator"
                                      onClick={() => handleOpenEditEvaluator(evaluator)}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-slate-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      title="Delete Evaluator"
                                      onClick={() => handleDeleteEvaluator(evaluator.Id, evaluator.Name)}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 hover:border-rose-200 hover:bg-rose-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-rose-950/20 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ══════════ ROUNDS & QUESTIONS VIEW ══════════ */}
            {isRoundsTab && (
              <div className="space-y-6">
                {loadingRounds ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                    <p className="text-sm text-slate-400">Loading {currentTrack} rounds...</p>
                  </div>
                ) : rounds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 px-6 py-16 text-center">
                    <ClipboardList className="h-12 w-12 text-slate-300 dark:text-zinc-700 mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      No {currentTrack} Evaluation Rounds Added Yet
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                      Create rounds (e.g. Round 1: Screening, Round 2: Architecture, Round 3: Final Demo) and assign questions with maximum marks.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenAddRound}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create Round 1
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {rounds.map((round, rIdx) => {
                      const totalMarks = (round.questions || []).reduce((sum, q) => sum + Number(q.MaxMarks || 0), 0);
                      const isExpanded = Boolean(expandedRoundIds[round.Id]);

                      return (
                        <article
                          key={round.Id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-black sm:p-6 shadow-sm transition-all"
                        >
                          {/* Round Header (Clickable Dropdown Toggle) */}
                          <div
                            onClick={() => toggleRoundExpanded(round.Id)}
                            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold text-base">
                                #{round.RoundOrder || rIdx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                    {round.RoundName}
                                  </h3>
                                  {isBoth && (
                                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                      {round.Track} Track
                                    </span>
                                  )}
                                  <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    {round.questions?.length || 0} Questions
                                  </span>
                                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                    Total: {totalMarks} Marks
                                  </span>
                                </div>
                                {round.Description && (
                                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {round.Description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Outline Style Add Question Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAddQuestion(round);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/60 bg-emerald-500/5 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-500/15 hover:border-emerald-500 dark:border-emerald-500/40 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-all cursor-pointer shadow-2xs"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add Question &amp; Marks
                              </button>

                              <button
                                type="button"
                                title="Edit Round"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditRound(round);
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-900 cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Delete Round"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRound(round.Id, round.RoundName);
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 dark:border-zinc-800 dark:hover:bg-rose-950/20 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>

                              {/* Accordion / Dropdown Toggle Button */}
                              <button
                                type="button"
                                title={isExpanded ? "Collapse Questions" : "Expand Questions"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRoundExpanded(round.Id);
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-500' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Questions Dropdown Drawer */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-3 overflow-hidden mt-4"
                              >
                                {!round.questions || round.questions.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 text-center">
                                    <FileQuestion className="h-8 w-8 text-slate-300 dark:text-zinc-700 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                      No evaluation questions added to this round yet.
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      Add questions/rubrics with marks for evaluators to grade teams.
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenAddQuestion(round)}
                                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                    >
                                      <Plus className="h-3.5 w-3.5" /> Add First Question
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid gap-2.5">
                                    {round.questions.map((q, qIndex) => (
                                      <div
                                        key={q.Id}
                                        className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/70 dark:border-zinc-800/80 dark:bg-zinc-950 p-4 transition-colors hover:border-emerald-500/30"
                                      >
                                        <div className="flex items-start gap-3 min-w-0">
                                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
                                            {qIndex + 1}
                                          </span>
                                          <div className="min-w-0">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                                              {q.QuestionText}
                                            </p>
                                            {q.Description && (
                                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                {q.Description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                          {/* Outline Style Marks Badge */}
                                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-50/60 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            <Award className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                            {q.MaxMarks} Marks
                                          </span>

                                          <button
                                            type="button"
                                            title="Edit Question"
                                            onClick={() => handleOpenEditQuestion(round, q)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-200 dark:border-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-800 cursor-pointer"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            title="Delete Question"
                                            onClick={() => handleDeleteQuestion(q.Id)}
                                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 dark:border-zinc-800 dark:hover:bg-rose-950/20 cursor-pointer"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ══════════ MODAL: ADD / EDIT EVALUATOR ══════════ */}
      {isAddEvaluatorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsAddEvaluatorOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-black"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-zinc-800 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <UserCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingEvaluator ? 'Edit Evaluator Details' : (isBoth ? `Create ${currentTrack} Evaluator` : 'Create Evaluator')}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Evaluator credentials valid strictly for {storedAdmin?.EventName || `Event #${eventId}`}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEvaluatorOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluator} className="space-y-4 p-5 sm:p-6">
              {evaluatorError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{evaluatorError}</span>
                </div>
              )}

              {/* Name */}
              <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name *
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    value={evaluatorForm.name}
                    onChange={(e) => setEvaluatorForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </label>

              {/* Email & Username */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Address *
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={evaluatorForm.email}
                      onChange={(e) => setEvaluatorForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="rajesh@college.edu"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </label>

                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Username (Login ID)
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={evaluatorForm.username}
                      onChange={(e) => setEvaluatorForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder={evaluatorForm.email || "Same as email"}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </label>
              </div>

              {/* Password */}
              <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{editingEvaluator ? 'Change Password (leave blank to keep current)' : 'Password *'}</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showFormPassword ? "text" : "password"}
                    required={!editingEvaluator}
                    value={evaluatorForm.password}
                    onChange={(e) => setEvaluatorForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingEvaluator ? "Enter new password if changing" : "Enter or generate password"}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-20 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500 font-mono"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title={showFormPassword ? "Hide password" : "Show password"}
                    >
                      {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold"
                      title="Generate Strong Password"
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </label>

              {/* College & Role */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  College / Institution
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={evaluatorForm.college}
                      onChange={(e) => setEvaluatorForm(prev => ({ ...prev, college: e.target.value }))}
                      placeholder="e.g. AITAM"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                    />
                  </div>
                </label>

                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Evaluator Role
                  <select
                    value={evaluatorForm.role}
                    onChange={(e) => setEvaluatorForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  >
                    <option value="Technical Evaluator">Technical Evaluator</option>
                    <option value="Domain Expert">Domain Expert</option>
                    <option value="Design Judge">Design / UI-UX Judge</option>
                    <option value="Industry Mentor">Industry Mentor</option>
                    <option value="Chief Evaluator">Chief Evaluator</option>
                  </select>
                </label>
              </div>

              {/* Track & Status (for edit) */}
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Evaluation Track
                  <select
                    value={evaluatorForm.track}
                    onChange={(e) => setEvaluatorForm(prev => ({ ...prev, track: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  >
                    <option value="Physical">Physical Event</option>
                    <option value="Virtual">Virtual Event</option>
                  </select>
                </label>

                {editingEvaluator && (
                  <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    Status
                    <select
                      value={evaluatorForm.status}
                      onChange={(e) => setEvaluatorForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-zinc-900/60 p-3 text-xs text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-zinc-800/80">
                🔒 Evaluator will have access strictly restricted to <strong>{storedAdmin?.EventName || `Event #${eventId}`}</strong>.
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddEvaluatorOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={evaluatorSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 disabled:opacity-60 shadow-sm"
                >
                  {evaluatorSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingEvaluator ? 'Save Changes' : 'Create Evaluator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: VIEW / COPY CREDENTIALS ══════════ */}
      {credentialsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCredentialsModal(null);
          }}
        >
          <div className="my-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-black space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Evaluator Credentials
                  </h3>
                  <p className="text-xs text-slate-400">Valid only for this assigned event</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCredentialsModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 p-4 border border-slate-200 dark:border-zinc-800 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/60">
                <span className="text-slate-400 font-sans">Event</span>
                <span className="font-bold text-slate-800 dark:text-white">{storedAdmin?.EventName || `Event #${eventId}`}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/60">
                <span className="text-slate-400 font-sans">Track</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{credentialsModal.track}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/60">
                <span className="text-slate-400 font-sans">Evaluator</span>
                <span className="font-bold text-slate-800 dark:text-white">{credentialsModal.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-zinc-800/60">
                <span className="text-slate-400 font-sans">Username / Email</span>
                <span className="font-bold text-slate-800 dark:text-white">{credentialsModal.username || credentialsModal.email}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-sans">Password</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                  {credentialsModal.password || '(Stored securely)'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyCredentialsPackage(credentialsModal)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 transition-colors shadow-sm"
              >
                {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedKey ? 'Copied to Clipboard!' : 'Copy All Credentials'}
              </button>
              <button
                type="button"
                onClick={() => setCredentialsModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: ADD / EDIT ROUND ══════════ */}
      {isRoundModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsRoundModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-black"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-zinc-800 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <ClipboardList className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingRound ? 'Edit Evaluation Round' : `Create ${currentTrack} Round`}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Add round details for {currentTrack} track evaluation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoundModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRound} className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-1">
                  Order #
                  <input
                    type="number"
                    min="1"
                    value={roundForm.roundOrder}
                    onChange={(e) => setRoundForm(prev => ({ ...prev, roundOrder: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  />
                </label>

                <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-3">
                  Round Name *
                  <input
                    required
                    value={roundForm.name}
                    onChange={(e) => setRoundForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Round 1: Idea Pitch & Architecture"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                Description &amp; Guidelines (Optional)
                <textarea
                  rows={3}
                  value={roundForm.description}
                  onChange={(e) => setRoundForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Explain the criteria, objective, or instructions for this evaluation round..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsRoundModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roundSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 disabled:opacity-60 shadow-sm"
                >
                  {roundSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingRound ? 'Update Round' : 'Create Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: ADD / EDIT QUESTION (WITH MARKS) ══════════ */}
      {isQuestionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsQuestionModalOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-black"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-zinc-800 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                  <Award className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingQuestion ? 'Edit Evaluation Question' : 'Add Evaluation Question & Marks'}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Target: {activeRoundForQuestion?.RoundName || 'Current Round'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="space-y-4 p-5 sm:p-6">
              {/* Question Text */}
              <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                Evaluation Criterion / Question *
                <textarea
                  required
                  rows={2}
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder="e.g. Technical Feasibility & Innovation: Novelty and viability of the approach"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                />
              </label>

              {/* Max Marks */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Maximum Marks *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={questionForm.maxMarks}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                    className="w-32 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[5, 10, 15, 20, 25, 50].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setQuestionForm(prev => ({ ...prev, maxMarks: m }))}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          Number(questionForm.maxMarks) === m
                            ? 'bg-emerald-700 text-white dark:bg-emerald-500'
                            : 'border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300'
                        }`}
                      >
                        {m} pts
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rubric Description */}
              <label className="block space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                Grading Rubric / Guidelines (Optional)
                <textarea
                  rows={2}
                  value={questionForm.description}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. 0-5 pts: Basic concept; 6-12 pts: Working demo; 13-20 pts: Production-ready excellence"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={questionSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 disabled:opacity-60 shadow-sm"
                >
                  {questionSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

export default Evaluators;