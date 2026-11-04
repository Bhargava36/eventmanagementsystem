import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ThumbsUp,
  Pin,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Search,
  X,
  Send,
  User,
  Clock,
  Mic,
  SlidersHorizontal,
  AlertCircle,
  HelpCircle,
  Radio
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useAuth from '../../../../Hooks/useAuth';
import useToast from '../../../../Hooks/useToast';

export default function WebinarQAModeration() {
  const { user } = useAuth();
  const toast = useToast();

  const [eventsList, setEventsList] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtration state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'pinned' | 'answered'
  const [speakerFilter, setSpeakerFilter] = useState('all');

  // Inline answering state
  const [activeAnswerId, setActiveAnswerId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Initialize active event
  useEffect(() => {
    let isMounted = true;
    const initEvent = async () => {
      try {
        const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
        const adminEvId = storedAdmin?.EventId || user?.EventId;

        const res = await fetch(`${API_BASE_URL}/api/events`);
        if (res.ok && isMounted) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.events || []);
          const webinarEvents = list.filter((e) => {
            const type = (e.EventType || '').toLowerCase();
            return type.includes('webinar');
          });

          const activeList = webinarEvents.length > 0 ? webinarEvents : list;
          setEventsList(activeList);

          const defaultId = adminEvId ? Number(adminEvId) : (activeList[0]?.Id || null);
          setSelectedEventId(defaultId);
        }
      } catch (err) {
        console.error('Error loading events for Q&A moderation:', err);
      }
    };

    initEvent();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch questions for selected event
  const fetchQuestions = useCallback(async (showSpin = false) => {
    if (!selectedEventId || isNaN(Number(selectedEventId))) {
      setLoading(false);
      return;
    }
    if (showSpin) setRefreshing(true);

    try {
      // Fetch event info (decoupled)
      try {
        const evRes = await fetch(`${API_BASE_URL}/api/events/${selectedEventId}`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setCurrentEvent(Array.isArray(evData) ? evData[0] : (evData.event || evData));
        }
      } catch (evErr) {
        console.warn('Non-critical: could not refresh event info in Q&A:', evErr);
      }

      // Fetch questions
      const qRes = await fetch(`${API_BASE_URL}/api/webinars/${selectedEventId}/questions`);
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(Array.isArray(qData.questions) ? qData.questions : []);
      }
    } catch (err) {
      console.error('Error fetching webinar questions:', err);
      if (showSpin) {
        toast.error('Unable to fetch questions. Please check server.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedEventId, toast]);

  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(() => {
      fetchQuestions(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchQuestions]);

  // Question moderation actions
  const handleTogglePin = async (question) => {
    const nextStatus = question.Status === 'pinned' ? 'open' : 'pinned';
    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars/questions/${question.Id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: nextStatus })
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.Id === question.Id ? { ...q, Status: nextStatus } : q))
        );
        toast.success(nextStatus === 'pinned' ? 'Question pinned to Live Stage!' : 'Question unpinned.');
      } else {
        toast.error('Failed to update question status');
      }
    } catch {
      toast.error('Network error updating question status');
    }
  };

  const handleOpenAnswer = (question) => {
    setActiveAnswerId(question.Id);
    setAnswerText(question.Answer || '');
  };

  const handleSaveAnswer = async (questionId) => {
    const cleanAnswer = answerText.trim();
    if (!cleanAnswer) {
      toast.error('Please enter an answer before submitting');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const res = await fetch(`${API_BASE_URL}/api/webinars/questions/${questionId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Status: 'answered',
          Answer: cleanAnswer,
          AnsweredBy: user?.Name || user?.name || 'Session Moderator'
        })
      });

      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.Id === questionId
              ? {
                  ...q,
                  Status: 'answered',
                  Answer: cleanAnswer,
                  AnsweredBy: user?.Name || user?.name || 'Session Moderator',
                  AnsweredAt: new Date().toISOString()
                }
              : q
          )
        );
        setActiveAnswerId(null);
        setAnswerText('');
        toast.success('Answer published live for delegates!');
      } else {
        toast.error('Failed to save answer');
      }
    } catch {
      toast.error('Network error saving answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to dismiss this question from the live panel?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars/questions/${questionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.Id !== questionId));
        toast.success('Question removed from session.');
      } else {
        toast.error('Failed to delete question');
      }
    } catch {
      toast.error('Network error deleting question');
    }
  };

  // Distinct speakers list for filter
  const targetSpeakersList = useMemo(() => {
    const set = new Set();
    questions.forEach((q) => {
      if (q.TargetSpeaker) set.add(q.TargetSpeaker);
    });
    return Array.from(set);
  }, [questions]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: questions.length,
      open: questions.filter((q) => q.Status === 'open').length,
      pinned: questions.filter((q) => q.Status === 'pinned').length,
      answered: questions.filter((q) => q.Status === 'answered').length
    };
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (statusFilter !== 'all' && q.Status !== statusFilter) {
        return false;
      }
      if (speakerFilter !== 'all' && q.TargetSpeaker !== speakerFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const textMatch = (q.QuestionText || '').toLowerCase().includes(query);
        const authorMatch = (q.AuthorName || '').toLowerCase().includes(query);
        const speakerMatch = (q.TargetSpeaker || '').toLowerCase().includes(query);
        if (!textMatch && !authorMatch && !speakerMatch) {
          return false;
        }
      }
      return true;
    });
  }, [questions, statusFilter, speakerFilter, searchQuery]);

  const getTimeAgo = (dateValue) => {
    if (!dateValue) return 'Recently';
    const timestamp = new Date(dateValue).getTime();
    if (isNaN(timestamp)) return 'Recently';
    const seconds = Math.floor(Math.max(0, Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Webinar Live Moderation
            </span>
            {currentEvent?.VirtualStatus === 'LIVE' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live Broadcast On-Air
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            Live Q&amp;A Moderation Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Real-time delegate questions feed. Review audience inquiries, pin priority topics to the speaker stage, and broadcast verified panel answers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {eventsList.length > 1 && (
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              {eventsList.map((ev) => (
                <option key={ev.Id} value={ev.Id}>
                  {ev.EventName}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => fetchQuestions(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'all'
              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Total Questions</span>
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{counts.total}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('open')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'open'
              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Pending Review</span>
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{counts.open}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pinned')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'pinned'
              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Pinned for Stage</span>
            <Pin className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{counts.pinned}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('answered')}
          className={`p-4 rounded-2xl border text-left transition ${
            statusFilter === 'answered'
              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Answered Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{counts.answered}</p>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by question text, delegate name, speaker..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Target Speaker Filter */}
            {targetSpeakersList.length > 0 && (
              <select
                value={speakerFilter}
                onChange={(e) => setSpeakerFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Addressed Speakers</option>
                {targetSpeakersList.map((spk) => (
                  <option key={spk} value={spk}>
                    {spk}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-900">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Questions', count: counts.total },
              { id: 'open', label: 'Pending Review', count: counts.open },
              { id: 'pinned', label: 'Pinned for Stage', count: counts.pinned },
              { id: 'answered', label: 'Answered', count: counts.answered }
            ].map(({ id, label, count }) => (
              <button
                key={id}
                type="button"
                onClick={() => setStatusFilter(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                  statusFilter === id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === id
                      ? 'bg-emerald-700/60 text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-14 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading Live Q&amp;A Feed...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Questions in this View</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No inquiries match your keyword criteria.'
                : 'Questions submitted by registered webinar delegates during the live stream will appear here in real-time.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-900">
            <AnimatePresence mode="popLayout">
              {filteredQuestions.map((q) => {
                const isPinned = q.Status === 'pinned';
                const isAnswered = q.Status === 'answered';
                const isAnswering = activeAnswerId === q.Id;

                return (
                  <motion.div
                    key={q.Id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-5 sm:p-6 transition ${
                      isPinned
                        ? 'bg-amber-500/5 dark:bg-amber-500/5 border-l-4 border-l-amber-500'
                        : isAnswered
                        ? 'bg-emerald-500/5 dark:bg-emerald-500/5'
                        : 'hover:bg-slate-50/70 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Upvote Pill */}
                      <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                        <ThumbsUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-black mt-1">{q.Upvotes || 1}</span>
                      </div>

                      {/* Question Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {q.AuthorName}
                            </span>
                            <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(q.CreatedAt)}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              @{q.TargetSpeaker || 'All Speakers'}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {isPinned && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                <Pin className="w-3 h-3" /> Pinned Live
                              </span>
                            )}
                            {isAnswered && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Answered
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 leading-relaxed">
                          {q.QuestionText}
                        </p>

                        {/* Existing Answer Box if already answered */}
                        {isAnswered && q.Answer && !isAnswering && (
                          <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Answered by {q.AnsweredBy || 'Speaker'}
                              </span>
                              {q.AnsweredAt && <span className="font-normal text-slate-400">{getTimeAgo(q.AnsweredAt)}</span>}
                            </div>
                            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {q.Answer}
                            </p>
                          </div>
                        )}

                        {/* Inline Answer Composer */}
                        {isAnswering && (
                          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                              Publish Official Keynote Answer for Delegates:
                            </label>
                            <textarea
                              rows={3}
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              placeholder="Type the speaker's live answer or key takeaways here..."
                              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveAnswerId(null);
                                  setAnswerText('');
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveAnswer(q.Id)}
                                disabled={submittingAnswer}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{submittingAnswer ? 'Publishing...' : 'Publish Answer'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Moderation Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePin(q)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              isPinned
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                            <span>{isPinned ? 'Unpin from Stage' : 'Pin to Stage'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAnswer(q)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40 border border-emerald-500/30 text-xs font-bold transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isAnswered ? 'Edit Answer' : 'Answer Live'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.Id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs font-bold transition ml-auto"
                            title="Dismiss question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
