import { useState } from 'react';
import { Calendar, MessageSquare, Send, Star } from 'lucide-react';

export default function UserFeedback() {
  const [formData, setFormData] = useState({
    name: '',
    eventName: '',
    category: '',
    rating: 0,
    comments: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({...prevData, [name]: value,}));
  };
  const handleRating = (rating) => { setFormData((prevData) => ({...prevData, rating,})); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    if (!formData.name.trim() || !formData.eventName.trim() || !formData.category.trim()) {
      setMessage('Please fill in all required fields.');
      setMessageType('error');
      return;
    }
    if (formData.rating < 1 || formData.rating > 5) {
      setMessage('Please select a star rating from 1 to 5.');
      setMessageType('error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          eventName: formData.eventName.trim(),
          category: formData.category.trim(),
          rating: formData.rating,
          comments: formData.comments.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback.');
      }
      setMessage(data.message || 'Feedback submitted successfully!');
      setMessageType('success');
      setFormData({
        name: '',
        eventName: '',
        category: '',
        rating: 0,
        comments: '',
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      setMessage(error.message || 'Unable to submit feedback. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-10 font-sans transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <MessageSquare className="h-8 w-8" strokeWidth={2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Event Feedback
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                Participant
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Share your experience with an event you registered for.
            </p>
          </div>
        </div>

        <section className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Tell us how it went
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Your feedback helps organizers make future events even better.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Name <span className="text-red-500">*</span>
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Event Name <span className="text-red-500">*</span>
                  </span>

                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    placeholder="Enter event name"
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Feedback Category <span className="text-red-500">*</span>
                </span>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Event Organization, Technical Issues"
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />

                <span className="block text-xs text-slate-500 dark:text-zinc-500">
                  Enter the category related to your feedback.
                </span>
              </label>

              <fieldset className="space-y-3">
                <legend className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  5 Star Rating <span className="text-red-500">*</span>
                </legend>

                <div className="flex flex-wrap items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRating(value)}
                      aria-label={`Rate ${value} ${value === 1 ? 'star' : 'stars'}`}
                      aria-pressed={formData.rating === value}
                      className="rounded-lg p-1.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          value <= formData.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}

                  <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {formData.rating > 0
                      ? `${formData.rating}/5 Stars`
                      : 'Select a rating'}
                  </span>
                </div>
              </fieldset>

              <label className="block space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Comments{' '}
                  <span className="font-normal text-slate-400 dark:text-zinc-500">
                    (optional)
                  </span>
                </span>

                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell us what you liked or what could be improved..."
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-y"
                />

                <span className="block text-right text-xs text-slate-400 dark:text-zinc-500">
                  {formData.comments.length}/2000
                </span>
              </label>

              {message && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                    messageType === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400'
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex justify-end border-t border-slate-100 dark:border-zinc-800 pt-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}