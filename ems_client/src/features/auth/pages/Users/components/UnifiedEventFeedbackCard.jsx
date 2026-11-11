import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Star,
  Send,
  CheckCircle2,
  MessageSquare,
  Edit3,
  Calendar,
  ThumbsUp,
  User as UserIcon,
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useToast from '../../../../../Hooks/useToast';
import { API_BASE_URL } from '@/lib/api';
const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair Experience',
  3: 'Good & Satisfactory',
  4: 'Very Good & Engaging',
  5: 'Outstanding & Exceptional'
};
const DEFAULT_CATEGORIES = [
  'Overall Experience',
  'Keynotes & Sessions',
  'Event Organization',
  'Content & Learning',
  'Venue & Facilities'
];
export default function UnifiedEventFeedbackCard({
  eventId,
  user,
  compact = false,
  title = null,
  onFeedbackSubmitted = null
}) {
  const toast = useToast();
  const [eventData, setEventData] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  // Feedbacks data
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('Overall Experience');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Active view toggle between 'your_review' and 'community_reviews'
  const [viewTab, setViewTab] = useState('form'); // 'form' | 'reviews'
  // Resolve current username
  const currentUserName = useMemo(() => {
    return (
      user?.UserName ||
      user?.name ||
      user?.FullName ||
      user?.fullName ||
      ''
    ).trim();
  }, [user]);
  // Fetch Event details
  useEffect(() => {
    if (!eventId) return;
    let isMounted = true;
    const fetchEvent = async () => {
      setEventLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          const ev = data.event || data.data?.event || data.data || data;
          if (isMounted) setEventData(ev);
        }
      } catch (err) {
        console.error('Error fetching event for feedback:', err);
      } finally {
        if (isMounted) setEventLoading(false);
      }
    };
    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [eventId]);
  // Fetch Event Feedbacks
  const fetchFeedbacks = useCallback(async () => {
    if (!eventId) return;
    setLoadingFeedbacks(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/feedback/event/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.feedback)
          ? data.feedback
          : Array.isArray(data.data)
          ? data.data
          : [];
        setFeedbacks(list);
      }
    } catch (err) {
      console.error('Error fetching event feedbacks:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  }, [eventId]);
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);
  // Check if current user has already submitted feedback
  const userFeedback = useMemo(() => {
    if (!currentUserName || feedbacks.length === 0) return null;
    return (
      feedbacks.find(
        (f) =>
          f.UserName &&
          f.UserName.toLowerCase().trim() === currentUserName.toLowerCase()
      ) || null
    );
  }, [feedbacks, currentUserName]);
  // Populate form with existing review if available
  useEffect(() => {
    if (userFeedback && !isEditing) {
      setRating(userFeedback.Rating || 5);
      setCategory(userFeedback.Category || 'Overall Experience');
      setComments(userFeedback.Comments || '');
    }
  }, [userFeedback, isEditing]);
  // Dynamic category list based on event type
  const categories = useMemo(() => {
    const type = (eventData?.EventType || '').toLowerCase();
    if (type.includes('seminar')) {
      return [
        'Seminar Experience',
        'Keynote Presentations',
        'Audio & Venue Quality',
        'Speaker Delivery',
        'Overall Organization'
      ];
    }
    if (type.includes('webinar')) {
      return [
        'Webinar Experience',
        'Keynote & Topics',
        'Audio / Video Streaming',
        'Content & Insights',
        'Q&A Session'
      ];
    }
    if (type.includes('hackathon')) {
      return [
        'Hackathon Experience',
        'Mentorship & Judging',
        'Problem Statements',
        'Facilities & Venue',
        'Event Organization'
      ];
    }
    return DEFAULT_CATEGORIES;
  }, [eventData]);
  // Default category sync
  useEffect(() => {
    if (categories.length > 0 && !userFeedback) {
      setCategory(categories[0]);
    }
  }, [categories, userFeedback]);
  // Stats calculation
  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return { count: 0, average: 0, fiveStars: 0 };
    }
    const sum = feedbacks.reduce((acc, curr) => acc + (Number(curr.Rating) || 0), 0);
    const avg = (sum / feedbacks.length).toFixed(1);
    const fiveStars = feedbacks.filter((f) => Number(f.Rating) === 5).length;
    return {
      count: feedbacks.length,
      average: avg,
      fiveStars
    };
  }, [feedbacks]);
  // Handle Submit / Update Feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserName) {
      toast.error('Participant name is required to submit feedback');
      return;
    }
    if (!comments.trim()) {
      toast.error('Please share a few thoughts in the comments');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: currentUserName,
        eventId: Number(eventId),
        eventName: eventData?.EventName || null,
        category: category.trim(),
        rating: Number(rating),
        comments: comments.trim()
      };
      const res = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }
      toast.success(
        userFeedback
          ? 'Feedback updated successfully!'
          : 'Thank you! Your feedback has been recorded.'
      );
      setIsEditing(false);
      await fetchFeedbacks();
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(data.feedback);
      }
    } catch (err) {
      console.error('Feedback submit error:', err);
      toast.error(err.message || 'Could not submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };
  const activeStarCount = hoverRating || rating;
  const ratingDescription = RATING_LABELS[activeStarCount] || 'Rate this event';
  const cardTitle =
    title ||
    (eventData?.EventType
      ? `${eventData.EventType} Delegate & Attendee Feedback`
      : 'Attendee Experience & Feedback');
  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm dark:shadow-2xl overflow-hidden transition-all duration-300 ${
        compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8'
      }`}
    >
      {/* Header with Event Context & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Official Event Feedback</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {cardTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xl">
            {eventData?.EventName
              ? `Share your review for ${eventData.EventName}. Your input is reviewed directly by the organizers.`
              : 'Help us enhance upcoming sessions by rating keynotes, facilities, and overall management.'}
          </p>
        </div>
        {/* Aggregate Stats Badge */}
        {stats.count > 0 && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 px-4 py-2.5 rounded-2xl shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {stats.average}
                </span>
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                {stats.count} {stats.count === 1 ? 'Review' : 'Verified Reviews'}
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Main Content Area */}
      <div className="pt-6">
        {/* If user already submitted and is NOT editing -> Show Verified Review View */}
        {userFeedback && !isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-7 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Your Feedback is Recorded
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Submitted under delegate identity{' '}
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      {userFeedback.UserName}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Your Review</span>
              </button>
            </div>
            {/* Review Details Card */}
            <div className="rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800/80 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Number(userFeedback.Rating)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 dark:text-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {userFeedback.Rating} / 5 Stars
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {RATING_LABELS[userFeedback.Rating] || 'Good'}
                  </span>
                </div>
                {userFeedback.Category && (
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                    {userFeedback.Category}
                  </span>
                )}
              </div>
              {userFeedback.Comments ? (
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed italic">
                  &ldquo;{userFeedback.Comments}&rdquo;
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">No additional comments provided.</p>
              )}
              {userFeedback.CreatedAt && (
                <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Recorded on {new Date(userFeedback.CreatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Feedback Submission / Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interactive Star Rating */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Experience Rating <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
                  {ratingDescription}
                </span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 w-fit">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= activeStarCount;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      id={`feedback-star-${starValue}`}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-lg transition-transform active:scale-90 hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'text-amber-500 fill-amber-500 filter drop-shadow'
                            : 'text-slate-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 pl-2">
                  {rating} of 5
                </span>
              </div>
            </div>
            {/* Category Selector Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Evaluation Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-black text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Comments Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`feedback_comments_${eventId}`}
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300"
                >
                  Key Takeaways, Speaker Feedback &amp; Suggestions{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {comments.length} characters
                </span>
              </div>
              <textarea
                id={`feedback_comments_${eventId}`}
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your detailed impressions regarding keynote topics, session quality, technical setup, or improvements for subsequent events..."
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
              />
            </div>
            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                id={`submit_feedback_btn_${eventId}`}
                disabled={isSubmitting || !comments.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Submitting...'
                    : isEditing
                    ? 'Update Feedback'
                    : 'Submit Feedback'}
                </span>
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-3 rounded-2xl text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        {/* Community Reviews List (collapsible or below) */}
        {feedbacks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Recent Attendee Feedback ({feedbacks.length})
              </h5>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {feedbacks.slice(0, 6).map((item) => (
                <div
                  key={item.Id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.UserPhoto ? (
                        <img
                          src={item.UserPhoto}
                          alt={item.UserName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                          {item.UserName ? item.UserName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">
                          {item.UserName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {item.Category || 'General'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= Number(item.Rating)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-slate-200 dark:text-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {item.Comments && (
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                      &ldquo;{item.Comments}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
