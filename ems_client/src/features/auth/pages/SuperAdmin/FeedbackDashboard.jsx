import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';

const renderStars = (rating) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          star <= Number(rating)
            ? 'fill-emerald-700 dark:fill-emerald-500 text-emerald-700 dark:text-emerald-500'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))}
  </div>
);

function SuperAdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const getFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch( 'http://localhost:3000/api/feedback');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch feedback.');
      }
      setFeedbackList( Array.isArray(data.feedback) ? data.feedback : Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedback();
  }, []);

  const getRating = (item) => Number(item.Rating ?? item.rating ?? 0);
  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback ? (feedbackList.reduce((total, item) => total + getRating(item), 0) / totalFeedback).toFixed(1): '0.0';
  const positiveFeedback = feedbackList.filter((item) => getRating(item) >= 4).length;
  const negativeFeedback = feedbackList.filter((item) => getRating(item) <= 2).length;

  const stats = [
    {
      title: 'Total Feedback',
      value: totalFeedback,
      icon: MessageSquare
    },
    {
      title: 'Average Rating',
      value: `${averageRating} / 5`,
      icon: Star
    },
    {
      title: 'Positive Feedback',
      value: positiveFeedback,
      icon: ThumbsUp
    },
    {
      title: 'Negative Feedback',
      value: negativeFeedback,
      icon: ThumbsDown
    }
  ];

  const filteredFeedback = feedbackList.filter((item) => {
    const userName = String(item.UserName || item.name || '');
    const email = String(item.Email || item.email || '');
    const eventName = String(item.EventName || item.eventName || '');
    const category = String(item.Category || item.category || '');
    const comments = String(item.Comments || item.comments || '');
    const searchText = search.toLowerCase();

    return (
      userName.toLowerCase().includes(searchText) ||
      email.toLowerCase().includes(searchText) ||
      eventName.toLowerCase().includes(searchText) ||
      category.toLowerCase().includes(searchText) ||
      comments.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name) => {
    return String(name || 'User').trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Website Feedback
          </h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Monitor feedback submitted by users across the platform.
          </p>
        </div>

        <button
          onClick={getFeedback}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-900 disabled:opacity-50 w-fit"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </motion.div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>

                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="bg-white dark:bg-black rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                All Website Feedback
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filteredFeedback.length} feedback record(s)
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users or feedback..."
              className="w-full sm:w-80 px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Loading feedback...
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>

              <button
                onClick={getFeedback}
                className="mt-3 text-sm text-emerald-700 dark:text-emerald-500 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />

              <p className="text-gray-700 dark:text-gray-300 font-medium">
                {search ? 'No matching feedback found' : 'No feedback found'}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {search
                  ? 'Try searching with different keywords.'
                  : 'User-submitted website feedback will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[650px]">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Event</th>
                    <th className="pb-3 pr-4 font-medium">Category</th>
                    <th className="pb-3 pr-4 font-medium">Rating</th>
                    <th className="pb-3 pr-4 font-medium">Feedback</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFeedback.map((item, index) => {
                    const userName = item.UserName || item.name || 'User';
                    const rating = getRating(item);
                    const comments = item.Comments || item.comments || '';

                    return (
                      <motion.tr
                        key={item.Id || item.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.03
                        }}
                        className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/60 dark:hover:bg-gray-900/30"
                      >
                        <td className="py-3 sm:py-4 pr-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-500 font-semibold text-xs shrink-0">
                              {getInitials(userName)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {userName}
                              </p>

                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                Feedback #{item.Id || item.id || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 sm:py-4 pr-4 text-gray-700 dark:text-gray-300">
                          {item.EventName || item.eventName || 'Website'}
                        </td>

                        <td className="py-3 sm:py-4 pr-4 text-gray-700 dark:text-gray-300">
                          {item.Category || item.category || 'General'}
                        </td>

                        <td className="py-3 sm:py-4 pr-4">
                          {renderStars(rating)}

                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                            {rating}/5
                          </span>
                        </td>

                        <td className="py-3 sm:py-4 pr-4 text-gray-600 dark:text-gray-300 max-w-xs">
                          <p className="line-clamp-3">
                            {comments || 'No comments provided'}
                          </p>
                        </td>

                        <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
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
export default SuperAdminFeedback;