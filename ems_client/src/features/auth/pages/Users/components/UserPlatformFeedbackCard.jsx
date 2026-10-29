import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquare, Laptop, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

export default function UserPlatformFeedbackCard({ user }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('Platform UI/UX');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Platform UI/UX',
    'Feature Request',
    'Speed & Performance',
    'General Experience',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comments.trim()) {
      setError('Please enter a short comment about your experience.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/platform-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.Id || user?.id,
          userName: user?.UserName || user?.name || 'EMS Innovator',
          userEmail: user?.Email || user?.email || '',
          rating,
          category,
          comments: comments.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setSubmitted(true);
      setComments('');
    } catch (err) {
      setError(err.message || 'Unable to submit review right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Rate Your EMS Experience
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Your feedback is displayed as testimonials on our landing page
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          Super Admin Review
        </span>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Thank you for your feedback!
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Your review has been submitted to the Super Admin team and will be showcased in the platform testimonials.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Submit another review
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stars rating */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/80">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Overall Platform Rating:
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 dark:text-zinc-700 hover:scale-115 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 ml-1">
                  {rating}/5
                </span>
              </div>
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    category === cat
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Comment field */}
            <div>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What do you enjoy about EMS, or what features would you like to see?..."
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-colors placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                <span>{comments.length}/500</span>
                {error && <span className="text-red-500 font-medium">{error}</span>}
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Send Platform Review'}</span>
              </button>
            </div>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
