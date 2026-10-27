import { Calendar, MessageSquare, Send, Star } from 'lucide-react';

const fieldClassName = 'w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-colors focus:border-emerald-500';
const eventOptions = ['Hacksprint', 'Ideathon', 'Avishkaar 4'];

export default function UserFeedback() {
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
              <form className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Name</span>
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={255}
                      placeholder="Enter your name"
                      className={fieldClassName}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Event name</span>
                    <select
                      required
                      className={fieldClassName}
                    >
                      <option value="" disabled>Select an event</option>
                      {eventOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    5 star rating <span className="text-red-500">*</span>
                  </legend>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value}>
                        <input
                          id={`feedback-rating-${value}`}
                          className="peer sr-only"
                          type="radio"
                          name="rating"
                          value={value}
                          aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                          required={value === 1}
                        />
                        <label
                          htmlFor={`feedback-rating-${value}`}
                          className="inline-flex cursor-pointer rounded-lg p-1.5 transition-transform hover:scale-110 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-500 peer-checked:[&>svg]:fill-amber-400 peer-checked:[&>svg]:text-amber-400"
                        >
                          <Star className="h-7 w-7 text-slate-300 dark:text-zinc-700" />
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <label className="block space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Comments <span className="font-normal text-slate-400 dark:text-zinc-500">(optional)</span>
                  </span>
                  <textarea
                    rows={5}
                    maxLength={2000}
                    placeholder="Tell us what you liked or what could be improved..."
                    className={`${fieldClassName} resize-y`}
                  />
                </label>

                <div className="flex justify-end border-t border-slate-100 dark:border-zinc-800 pt-5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-500"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit feedback
                  </button>
                </div>
              </form>
          </div>
        </section>
      </div>
    </div>
  );
}
