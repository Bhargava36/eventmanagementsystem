import React, { useState, useEffect, useCallback } from 'react';
import {
    Star,
    Send,
    CheckCircle2,
    Calendar,
    Award,
    Mic,
    Video,
    Sparkles,
    MessageSquare,
    Radio,
    ThumbsUp,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

export default function WebinarDelegateFeedbackCard({ eventId, user }) {
    const [eventName, setEventName] = useState('');
    const [eventLoading, setEventLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.UserName || user?.name || '',
        email: user?.Email || user?.email || '',
        keynoteRating: 5,
        audioVideoRating: 5,
        contentQuality: 5,
        overallRating: 5,
        favoriteSpeaker: '',
        comments: '',
        suggestions: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Recent reviews & stats
    const [feedbackStats, setFeedbackStats] = useState(null);
    const [recentFeedbacks, setRecentFeedbacks] = useState([]);
    const [feedbacksLoading, setFeedbacksLoading] = useState(false);

    // Fetch Event Details
    useEffect(() => {
        const fetchEvent = async () => {
            setEventLoading(true);
            try {
                if (!eventId) return;
                const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
                const data = await response.json();
                if (response.ok) {
                    const ev = data.event || data.data?.event || data.data || data;
                    setEventName(ev.EventName || ev.eventName || 'Live Webinar');
                }
            } catch (err) {
                console.error('Error fetching webinar event:', err);
            } finally {
                setEventLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

    // Fetch Existing Webinar Feedbacks & Stats
    const fetchFeedbacks = useCallback(async () => {
        if (!eventId) return;
        setFeedbacksLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/feedback`);
            if (res.ok) {
                const data = await res.json();
                setFeedbackStats(data.stats || null);
                setRecentFeedbacks(data.feedbacks || []);
            }
        } catch (err) {
            console.error('Error fetching webinar feedbacks:', err);
        } finally {
            setFeedbacksLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

    // Update user info if user changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.UserName || user.name || prev.name,
                email: user.Email || user.email || prev.email
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!formData.name.trim()) {
            setErrorMsg('Please enter your full delegate name.');
            return;
        }

        if (!formData.comments.trim()) {
            setErrorMsg('Please provide your webinar feedback comments.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                EventId: Number(eventId),
                UserId: user?.Id || user?.id || null,
                UserName: formData.name.trim(),
                UserEmail: formData.email.trim() || null,
                UserPhoto: user?.Photo || null,
                KeynoteRating: Number(formData.keynoteRating),
                AudioVideoRating: Number(formData.audioVideoRating),
                ContentQuality: Number(formData.contentQuality),
                OverallRating: Number(formData.overallRating),
                FavoriteSpeaker: formData.favoriteSpeaker.trim() || null,
                Comments: formData.comments.trim(),
                Suggestions: formData.suggestions.trim() || null
            };

            const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit webinar feedback');
            }

            setSubmitted(true);
            setFormData(prev => ({
                ...prev,
                favoriteSpeaker: '',
                comments: '',
                suggestions: ''
            }));
            fetchFeedbacks();
        } catch (err) {
            setErrorMsg(err.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRatingInput = ({ label, value, onChange, icon: Icon }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-emerald-500" />}
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    {label}
                </span>
            </div>
            <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                        <Star
                            className={`w-4 h-4 ${
                                star <= value
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-zinc-700'
                            }`}
                        />
                    </button>
                ))}
                <span className="text-xs font-bold ml-1 text-slate-700 dark:text-zinc-300">
                    {value}/5
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-7 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Webinar Delegate Review &amp; Feedback
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Rate keynote speakers, broadcast quality, and share your delegate takeaways.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        Live Keynote Hub
                    </span>
                </div>
            </div>

            {/* Performance Stats Cards (if any reviews exist) */}
            {feedbackStats && Number(feedbackStats.TotalFeedbacks) > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                            <span>Overall Rating</span>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {feedbackStats.AvgOverall || '0.0'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                        </div>
                        <span className="text-[10px] text-slate-400">From {feedbackStats.TotalFeedbacks} delegates</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                            <span>Keynote Quality</span>
                            <Mic className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {feedbackStats.AvgKeynote || '0.0'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Speaker performance</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                            <span>Stream Quality</span>
                            <Video className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {feedbackStats.AvgAudioVideo || '0.0'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Audio/video stream</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                            <span>Content Depth</span>
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            {feedbackStats.AvgContent || '0.0'} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Slides &amp; insights</span>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {submitted ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-8 text-center space-y-3"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Webinar Feedback Submitted
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                            Thank you for your feedback for {eventName}. Your insights help speakers and organizers deliver world-class webinar broadcasts.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                        >
                            Submit another delegate response
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Event Name */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Webinar Event
                            </label>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                <span>{eventLoading ? 'Loading webinar...' : eventName || 'Webinar'}</span>
                            </div>
                        </div>

                        {/* Delegate Name & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                    Delegate Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    placeholder="Enter your name"
                                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                    Favorite Keynote Speaker
                                </label>
                                <input
                                    type="text"
                                    value={formData.favoriteSpeaker}
                                    onChange={(e) => setFormData(prev => ({ ...prev, favoriteSpeaker: e.target.value }))}
                                    placeholder="e.g. Dr. John Doe (Keynote 1)"
                                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Detailed Star Ratings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <StarRatingInput
                                label="Keynote Speakers & Delivery"
                                value={formData.keynoteRating}
                                onChange={(val) => setFormData(prev => ({ ...prev, keynoteRating: val }))}
                                icon={Mic}
                            />
                            <StarRatingInput
                                label="Live Stream Audio & Video Quality"
                                value={formData.audioVideoRating}
                                onChange={(val) => setFormData(prev => ({ ...prev, audioVideoRating: val }))}
                                icon={Video}
                            />
                            <StarRatingInput
                                label="Content Quality & Presentation Slides"
                                value={formData.contentQuality}
                                onChange={(val) => setFormData(prev => ({ ...prev, contentQuality: val }))}
                                icon={Sparkles}
                            />
                            <StarRatingInput
                                label="Overall Webinar Experience"
                                value={formData.overallRating}
                                onChange={(val) => setFormData(prev => ({ ...prev, overallRating: val }))}
                                icon={Award}
                            />
                        </div>

                        {/* Comments & Takeaways */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Delegate Comments &amp; Key Takeaways
                            </label>
                            <textarea
                                value={formData.comments}
                                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                                rows={3}
                                maxLength={600}
                                required
                                placeholder="What did you learn? How was the keynote delivery and panel discussion?"
                                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
                            />
                            <div className="text-right text-[11px] text-slate-400 mt-0.5">
                                {formData.comments.length}/600
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Suggestions for Future Webinar Topics &amp; Speakers (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.suggestions}
                                onChange={(e) => setFormData(prev => ({ ...prev, suggestions: e.target.value }))}
                                placeholder="Topics or speakers you would like to see in upcoming editions"
                                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 px-4 py-3 text-sm text-red-700">
                                {errorMsg}
                            </div>
                        )}

                        {/* Submit Action */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={submitting || eventLoading || !eventName}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{submitting ? 'Submitting...' : 'Submit Delegate Feedback'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </AnimatePresence>

            {/* Recent Delegate Reviews Section */}
            {recentFeedbacks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-500" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Recent Delegate Reviews ({recentFeedbacks.length})
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={fetchFeedbacks}
                            disabled={feedbacksLoading}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                            title="Refresh reviews"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${feedbacksLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentFeedbacks.slice(0, 3).map((item) => (
                            <div
                                key={item.Id}
                                className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-2"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[11px]">
                                            {item.UserName ? item.UserName.charAt(0).toUpperCase() : 'D'}
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {item.UserName}
                                        </span>
                                        {item.FavoriteSpeaker && (
                                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                                Speaker: {item.FavoriteSpeaker}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3 h-3 ${
                                                    star <= Number(item.OverallRating || 5)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-300 dark:text-zinc-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                                    {item.Comments}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
