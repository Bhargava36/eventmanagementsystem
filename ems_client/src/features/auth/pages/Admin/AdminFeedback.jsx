import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Search
} from 'lucide-react';

const renderStars = (rating) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-3.5 h-3.5 ${
          star <= Number(rating)
            ? 'fill-emerald-600 dark:fill-emerald-500 text-emerald-600 dark:text-emerald-500'
            : 'text-slate-300 dark:text-zinc-700'
        }`}
      />
    ))}
  </div>
);

export default function AdminFeedback() {
  const [adminData, setAdminData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  });

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const eventId = adminData?.EventId;
  const eventName = adminData?.EventName;
  const adminId = adminData?.Id;

  // Listen for active event updates from sidebar or switcher
  useEffect(() => {
    const handleEventUpdated = (e) => {
      try {
        const stored = JSON.parse(localStorage.getItem('admin') || '{}');
        const updated = e?.detail ? { ...stored, ...e.detail } : stored;
        setAdminData(updated);
      } catch (err) {
        console.error('Error updating admin event in AdminFeedback:', err);
      }
    };

    window.addEventListener('admin-event-updated', handleEventUpdated);
    window.addEventListener('storage', handleEventUpdated);
    return () => {
      window.removeEventListener('admin-event-updated', handleEventUpdated);
      window.removeEventListener('storage', handleEventUpdated);
    };
  }, []);

  const getFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      if (eventId) {
        // Strict event-level isolation: show only this specific event's feedback
        url = `${API_BASE_URL}/api/feedback/event/${encodeURIComponent(eventId)}`;
      } else if (adminId) {
        url = `${API_BASE_URL}/api/feedback/admin/${encodeURIComponent(adminId)}`;
      } else {
        throw new Error('No active event or admin found in session');
      }

      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `Feedback fetch failed (Status ${response.status})`);
      }
      const feedback = Array.isArray(data)
        ? data
        : Array.isArray(data.feedback)
        ? data.feedback
        : Array.isArray(data.data)
        ? data.data
        : [];
      setFeedbackList(feedback);
    } catch (err) {
      console.error('Admin feedback fetch error:', err);
      setError(err.message || 'Unable to fetch feedback.');
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  }, [eventId, adminId]);

  useEffect(() => {
    getFeedback();
  }, [getFeedback]);

  const getRating = (item) => Number(item.Rating ?? item.rating ?? 0);
  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback
    ? (feedbackList.reduce((total, item) => total + getRating(item), 0) / totalFeedback).toFixed(1)
    : '0.0';
  const positiveFeedback = feedbackList.filter((item) => getRating(item) >= 4).length;
  const negativeFeedback = feedbackList.filter((item) => getRating(item) <= 2).length;

  const stats = [
    { title: 'Total Feedback', value: totalFeedback, icon: MessageSquare },
    { title: 'Average Rating', value: `${averageRating} / 5`, icon: Star },
    { title: 'Positive Feedback', value: positiveFeedback, icon: ThumbsUp },
    { title: 'Negative Feedback', value: negativeFeedback, icon: ThumbsDown }
  ];

  const filteredFeedback = feedbackList.filter((item) => {
    const userName = String(item.UserName || item.name || '');
    const email = String(item.Email || item.email || '');
    const evName = String(item.EventName || item.eventName || '');
    const category = String(item.Category || item.category || '');
    const comments = String(item.Comments || item.comments || '');
    const searchText = search.toLowerCase();
    return (
      userName.toLowerCase().includes(searchText) ||
      email.toLowerCase().includes(searchText) ||
      evName.toLowerCase().includes(searchText) ||
      category.toLowerCase().includes(searchText) ||
      comments.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return String(date);
    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name) =>
    String(name || 'User')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen transition-colors text-slate-900 dark:text-white">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Event Feedback
            </h1>
            {eventName && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {eventName}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {eventName
              ? `Displaying feedback records collected specifically for "${eventName}".`
              : 'Monitor feedback submitted by participants for your active event.'}
          </p>
        </div>

        <button
          type="button"
          onClick={getFeedback}
          disabled={loading}
          className="flex items-center gap-2 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-900 transition disabled:opacity-50 w-fit cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 md:p-10 space-y-6">
        {/* Metric Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800/80 shadow-sm transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {stat.title}
                </p>

                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feedback List Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Feedback Responses
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {filteredFeedback.length} feedback record{filteredFeedback.length === 1 ? '' : 's'} for this event
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, category, comment..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
              Loading feedback...
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-xs text-rose-500 font-semibold mb-3">
                {error}
              </p>
              <button
                type="button"
                onClick={getFeedback}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="py-16 text-center space-y-2 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-8">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700" />
              <p className="text-sm text-slate-700 dark:text-zinc-300 font-bold">
                {search ? 'No matching feedback found' : 'No feedback submitted yet'}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? 'Try searching with different keywords.'
                  : `Attendees participating in ${eventName || 'this event'} have not submitted feedback yet.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-zinc-800">
                    <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[10px]">User</th>
                    <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[10px]">Event</th>
                    <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[10px]">Category</th>
                    <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[10px]">Rating</th>
                    <th className="pb-3 pr-4 font-bold uppercase tracking-wider text-[10px]">Feedback</th>
                    <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {filteredFeedback.map((item, index) => {
                    const userName = item.UserName || item.name || 'User';
                    const rating = getRating(item);
                    const comments = item.Comments || item.comments || '';

                    return (
                      <motion.tr
                        key={item.Id || item.id || index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition"
                      >
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            {item.UserPhoto ? (
                              <img
                                src={item.UserPhoto}
                                alt={userName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                                {getInitials(userName)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {userName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Feedback #{item.Id || item.id || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 pr-4 text-slate-700 dark:text-zinc-300 font-medium">
                          {item.EventName || item.eventName || eventName || 'Workshop'}
                        </td>

                        <td className="py-3.5 pr-4">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/50 dark:border-zinc-700/50">
                            {item.Category || item.category || 'General'}
                          </span>
                        </td>

                        <td className="py-3.5 pr-4">
                          {renderStars(rating)}
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                            {rating}/5
                          </span>
                        </td>

                        <td className="py-3.5 pr-4 text-slate-600 dark:text-zinc-300 max-w-xs">
                          <p className="line-clamp-3 text-xs leading-relaxed">
                            {comments || 'No comments provided'}
                          </p>
                        </td>

                        <td className="py-3.5 text-slate-500 dark:text-zinc-400 whitespace-nowrap text-xs font-mono">
                          {formatDate(item.CreatedAt || item.createdAt)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}