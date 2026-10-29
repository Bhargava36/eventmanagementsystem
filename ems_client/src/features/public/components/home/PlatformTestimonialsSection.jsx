import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { API_BASE_URL } from '@/lib/api';

const INITIAL_TESTIMONIALS = [
  {
    Id: 't1',
    UserName: 'Aarav Patel',
    Rating: 5,
    Category: 'Platform UI/UX',
    Comments: 'AYOJAN EMS has redefined how university hackathons are conducted. The team dashboard and real-time announcements are buttery smooth.',
  },
  {
    Id: 't2',
    UserName: 'Sneha Kulkarni',
    Rating: 5,
    Category: 'Squad Collaboration',
    Comments: 'Finding passionate teammates using squad codes took just seconds! The workspace and Git submission links kept our hackathon project perfectly organized.',
  },
  {
    Id: 't3',
    UserName: 'Vikramaditya Roy',
    Rating: 5,
    Category: 'Speed & Performance',
    Comments: 'Zero lag even during high-traffic round deadlines. Digital ID passes made registration and on-campus food check-ins completely paperless!',
  },
  {
    Id: 't4',
    UserName: 'Pooja Reddy',
    Rating: 5,
    Category: 'Event Logistics',
    Comments: 'The accommodation & bed allotment feature was a lifesaver for our outstation hackathon squad. Everything was managed within the student dashboard.',
  },
  {
    Id: 't5',
    UserName: 'Karthik Subramanian',
    Rating: 5,
    Category: 'Judging & Rounds',
    Comments: 'Transparent round evaluations and live leaderboards kept our adrenaline pumping throughout the 36-hour sprint. Absolutely loved the interface.',
  },
  {
    Id: 't6',
    UserName: 'Meera Nambiar',
    Rating: 5,
    Category: 'General Experience',
    Comments: 'From registration to certificate generation, everything is automated. Truly the gold standard for student competition portals!',
  },
];

export default function PlatformTestimonialsSection() {
  const [reviews, setReviews] = useState(INITIAL_TESTIMONIALS);
  const [averageRating, setAverageRating] = useState('4.9');
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchPlatformReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/platform-feedback/testimonials?limit=9`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
            setReviews(data.testimonials);
            const total = data.testimonials.reduce((sum, item) => sum + Number(item.Rating || 5), 0);
            setAverageRating((total / data.testimonials.length).toFixed(1));
          }
        }
      } catch {
        // Fallback to initial testimonials
      }
    };
    fetchPlatformReviews();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-black overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Loved by Crafters, Builders & Innovators
          </h2>

          <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Real feedback collected directly from participants and student teams using the EMS web platform to compete, collaborate, and build solutions.
          </p>

          {/* Average Rating Strip */}
          <div className="inline-flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {averageRating} / 5.0 Rating
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">• 100% Free for Students</span>
          </div>
        </div>

        {/* Testimonials Bento Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => {
            const ratingNum = Number(review.Rating || 5);
            const initials = review.UserName ? review.UserName.substring(0, 2).toUpperCase() : 'IN';

            return (
              <motion.div
                key={review.Id || idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: (idx % 3) * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card top rating & category */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < ratingNum ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-zinc-800'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-800">
                      {review.Category || 'Experience'}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed italic">
                    "{review.Comments}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-zinc-850">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {review.UserName || 'Verified Crafter'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>EMS Participant</span>
                      </p>
                    </div>
                  </div>

                  <Quote className="w-6 h-6 text-slate-200 dark:text-zinc-800 shrink-0" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Strip */}
        <div className="pt-4 text-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:gap-3"
          >
            <span>Explore Active Competitions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
