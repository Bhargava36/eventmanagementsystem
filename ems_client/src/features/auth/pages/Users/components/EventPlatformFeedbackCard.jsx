
import React, { useState, useEffect } from 'react';
import {
    Star,
    Send,
    CheckCircle2,
    Calendar,
    Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';

export default function EventPlatformFeedbackCard({ eventId, user }) {

    const [eventName, setEventName] = useState('');
    const [eventLoading, setEventLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: user?.UserName || user?.name || '',
        category: 'Event Organization',
        rating: 5,
        comments: '',
    });

    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // Fetch Event Name
    useEffect(() => {
        const fetchEventName = async () => {
            setEventLoading(true);
            setEventName('');

            try {
                if (!eventId) {
                    throw new Error('Event ID is missing');
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/events/${eventId}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to fetch event'
                    );
                }

                const event =
                    data.event ||
                    data.data?.event ||
                    data.data ||
                    data;

                const name =
                    event.EventName ||
                    event.eventName ||
                    '';

                if (!name) {
                    throw new Error('Event name not found');
                }

                setEventName(name);

            } catch (error) {
                console.error('Event Fetch Error:', error);
                setMessage(error.message);
                setMessageType('error');
            } finally {
                setEventLoading(false);
            }
        };

        fetchEventName();
    }, [eventId]);

    // Update user name
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            name: user?.UserName || user?.name || '',
        }));
    }, [user]);

    const eventCategories = [
        'Event Organization',
        'Judging & Mentorship',
        'Facilities & Venue',
        'Problem Statements',
        'Overall Event Rating',
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRating = (rating) => {
        setFormData((prev) => ({
            ...prev,
            rating,
        }));
    };

    // Submit Feedback
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('');
        setMessageType('');

        if (!formData.name.trim()) {
            setMessage('Please enter your name.');
            setMessageType('error');
            return;
        }

        if (!eventName) {
            setMessage('Event information is unavailable.');
            setMessageType('error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/feedback`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        eventName,
                        category: formData.category,
                        rating: formData.rating,
                        comments: formData.comments.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to submit feedback'
                );
            }

            setSubmitted(true);

            setFormData((prev) => ({
                ...prev,
                comments: '',
            }));

        } catch (error) {
            setMessage(error.message);
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Award className="w-5 h-5" />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Rate Your Event Experience
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Share your experience with event organizers.
                        </p>
                    </div>
                </div>

                <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    Event Feedback
                </span>
            </div>

            <AnimatePresence mode="wait">
                {submitted ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-8 text-center space-y-3"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Thank you for your feedback!
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Your feedback has been submitted for {eventName}.
                        </p>

                        <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                            Submit another review
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Event Name */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Event Name
                            </label>

                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 px-3.5 py-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                <Calendar className="w-4 h-4 text-emerald-500" />
                                <span>
                                    {eventLoading
                                        ? 'Loading event...'
                                        : eventName || 'Event unavailable'}
                                </span>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Your Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                placeholder="Enter your name"
                                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                Overall Event Rating:
                            </span>

                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            className={`w-5 h-5 ${
                                                star <= (hoverRating || formData.rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'text-slate-300 dark:text-zinc-700'
                                            }`}
                                        />
                                    </button>
                                ))}

                                <span className="text-xs font-bold ml-1 text-slate-600 dark:text-zinc-400">
                                    {formData.rating}/5
                                </span>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Feedback Category
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {eventCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                category: cat,
                                            }))
                                        }
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                                            formData.category === cat
                                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-xs font-bold mb-2 text-slate-700 dark:text-zinc-300">
                                Your Comments
                            </label>

                            <textarea
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                                rows={3}
                                maxLength={500}
                                placeholder="Share your experience about this event..."
                                className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
                            />

                            <div className="text-right text-[11px] text-slate-400 mt-1">
                                {formData.comments.length}/500
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`rounded-xl border px-4 py-3 text-sm ${
                                messageType === 'error'
                                    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}>
                                {message}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || eventLoading || !eventName}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-3.5 h-3.5" />
                                {loading ? 'Submitting...' : 'Send Event Feedback'}
                            </button>
                        </div>
                    </form>
                )}
            </AnimatePresence>
        </div>
    );
}
