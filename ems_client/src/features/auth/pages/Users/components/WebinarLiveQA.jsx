import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ThumbsUp,
  Send,
  HelpCircle,
  CheckCircle2,
  Pin,
  User,
  Clock,
  Filter,
  Mic,
  Share2
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../../Hooks/useToast';
export default function WebinarLiveQA({ eventId, user, speakers = [] }) {
  const toast = useToast();
  const [questionText, setQuestionText] = useState('');
  const [targetSpeaker, setTargetSpeaker] = useState('All Speakers & Panel');
  const [submitting, setSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState('top'); // 'top' | 'recent' | 'mine'
  const currentUserId = user?.Id || user?.id || user?.UserId || null;
  const storageKey = `webinar_live_qa_${eventId}`;
  const [questions, setQuestions] = useState([]);
  const fetchQuestions = useCallback(async () => {
    if (!eventId) return;
    try {
      const url = currentUserId
        ? `${API_BASE_URL}/api/webinars/${eventId}/questions?userId=${currentUserId}`
        : `${API_BASE_URL}/api/webinars/${eventId}/questions`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions)) {
          const mapped = data.questions.map((q) => ({
            id: q.Id,
            authorName: q.AuthorName,
            authorId: q.UserId,
            authorPhoto: q.AuthorPhoto,
            targetSpeaker: q.TargetSpeaker,
            text: q.QuestionText,
            upvotes: q.Upvotes,
            hasUpvoted: Boolean(q.HasUpvoted),
            status: q.Status,
            createdAt: q.CreatedAt,
            answer: q.Answer,
            answeredBy: q.AnsweredBy,
            answeredAt: q.AnsweredAt
          }));
          setQuestions(mapped);
          try {
            localStorage.setItem(storageKey, JSON.stringify(mapped));
          } catch {}
          return;
        }
      }
    } catch (err) {
      console.warn('Could not load live webinar questions from API, using fallback:', err);
    }
    // Fallback to localStorage if API unavailable
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
        }
      }
    } catch {}
  }, [eventId, currentUserId, storageKey]);
  useEffect(() => {
    fetchQuestions();
    const interval = setInterval(fetchQuestions, 10000);
    return () => clearInterval(interval);
  }, [fetchQuestions]);
  const handlePostQuestion = async (e) => {
    if (e) e.preventDefault();
    const clean = questionText.trim();
    if (!clean) {
      toast.error('Please type your question before submitting');
      return;
    }
    if (clean.length < 10) {
      toast.error('Question should be at least 10 characters long');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          AuthorName: user?.Name || user?.name || user?.Username || 'Webinar Delegate',
          UserId: currentUserId,
          TargetSpeaker: targetSpeaker,
          QuestionText: clean
        })
      });
      if (res.ok) {
        toast.success('Question submitted to Keynote Panel!');
        setQuestionText('');
        fetchQuestions();
      } else {
        toast.error('Could not submit question');
      }
    } catch {
      // Local fallback
      const newQuestion = {
        id: `q-${Date.now()}`,
        authorName: user?.Name || user?.name || user?.Username || 'Webinar Delegate',
        authorId: currentUserId || 999,
        targetSpeaker: targetSpeaker,
        text: clean,
        upvotes: 1,
        status: 'open',
        createdAt: new Date().toISOString()
      };
      setQuestions((prev) => [newQuestion, ...prev]);
      setQuestionText('');
      toast.success('Question submitted to Keynote Panel!');
    } finally {
      setSubmitting(false);
    }
  };
  const handleToggleUpvote = async (questionId) => {
    try {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          const wasUpvoted = Boolean(q.hasUpvoted);
          return {
            ...q,
            hasUpvoted: !wasUpvoted,
            upvotes: wasUpvoted ? Math.max(1, q.upvotes - 1) : q.upvotes + 1
          };
        })
      );
      await fetch(`${API_BASE_URL}/api/webinars/questions/${questionId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
    } catch (err) {
      console.warn('Upvote error:', err);
    }
  };
  const filteredQuestions = useMemo(() => {
    let list = [...questions];
    if (filterMode === 'mine') {
      list = list.filter((q) => q.authorId === currentUserId);
    } else if (filterMode === 'top') {
      list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  }, [questions, filterMode, currentUserId]);
  return (
    <div className="space-y-6">
      {/* Ask Question Card */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ask a Live Keynote Question
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Your question will be prioritized for keynote speakers and moderator review.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Live Stream Q&amp;A
          </span>
        </div>
        <form onSubmit={handlePostQuestion} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={targetSpeaker}
              onChange={(e) => setTargetSpeaker(e.target.value)}
              className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer sm:w-60"
            >
              <option value="All Speakers & Panel">Addressed to: All Speakers &amp; Panel</option>
              {speakers.map((spk, idx) => (
                <option key={spk.Id || idx} value={spk.Name || spk.FullName}>
                  To: {spk.Name || spk.FullName} {spk.Designation ? `(${spk.Designation})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              maxLength={400}
              placeholder="Ask a question about the keynote topic, system design, or presentation slides..."
              className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none transition-all"
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-mono">
              {questionText.length}/400
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-500" />
              <span>Questions are read aloud during dedicated Q&amp;A breaks</span>
            </span>
            <button
              type="submit"
              disabled={submitting || !questionText.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : 'Post Question'}</span>
            </button>
          </div>
        </form>
      </div>
      {/* Questions Filter and Counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            Delegate Questions ({questions.length})
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
          {[
            { id: 'top', label: 'Top Upvoted' },
            { id: 'recent', label: 'Most Recent' },
            { id: 'mine', label: 'My Questions' }
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setFilterMode(mode.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterMode === mode.id
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" />
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
              No questions found under this filter
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              Be the first to ask a live keynote question using the form above.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const hasUpvoted = (q.upvotedBy || []).includes(currentUserId);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-emerald-500/30 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 font-bold text-xs">
                      {q.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {q.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                        To: {q.targetSpeaker}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {q.status === 'answered' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Answered Live</span>
                      </span>
                    )}
                    {q.status === 'pinned' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {q.text}
                </p>
                {q.answer && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-slate-700 dark:text-zinc-300 space-y-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                      Speaker Response:
                    </span>
                    <p className="text-xs leading-relaxed">{q.answer}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleUpvote(q.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      hasUpvoted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-600'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-white' : ''}`} />
                    <span>{q.upvotes}</span>
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
