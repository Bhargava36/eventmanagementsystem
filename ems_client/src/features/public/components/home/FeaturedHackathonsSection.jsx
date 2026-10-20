import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { animate } from 'animejs';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function FeaturedHackathonsSection() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardsRef = useRef([]);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/events');
      const data = await res.json();
      if (res.ok) {
        setEvents((data.events || []).slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load featured events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventPosterUrl = (posters) => {
    if (!posters) return null;
    let url = null;
    if (Array.isArray(posters) && posters.length > 0) {
      url = typeof posters[0] === 'string' ? posters[0] : posters[0]?.url || null;
    } else if (typeof posters === 'string') {
      try {
        const parsed = JSON.parse(posters);
        if (Array.isArray(parsed) && parsed.length > 0) {
          url = typeof parsed[0] === 'string' ? parsed[0] : parsed[0]?.url || null;
        } else {
          url = parsed;
        }
      } catch {
        url = posters;
      }
    }
    if (url && typeof url === 'string' && url.startsWith('/uploads')) {
      return `http://localhost:3000${url}`;
    }
    return url;
  };

  const formatDate = (start, end) => {
    if (!start) return 'Dates Announced Soon';
    try {
      const s = new Date(start).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      if (!end) return s;
      const e = new Date(end).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${s} – ${e}`;
    } catch {
      return 'Upcoming Dates';
    }
  };

  // GSAP: Parallax zoom and card elevation
  useEffect(() => {
    if (loading || !events.length) return;
    const cleanups = [];

    cardsRef.current.forEach((card) => {
      if (!card) return;

      const img = card.querySelector('img');
      const arrow = card.querySelector('.view-arrow');

      const onEnter = () => {
        gsap.to(card, { y: -8, borderColor: '#10b981', duration: 0.3, ease: 'power2.out' });
        if (img) gsap.to(img, { scale: 1.08, duration: 0.45, ease: 'power2.out' });
        if (arrow) gsap.to(arrow, { x: 4, duration: 0.25, ease: 'power2.out' });
      };

      const onLeave = () => {
        gsap.to(card, { y: 0, borderColor: 'var(--card-border, rgba(39, 39, 42, 1))', duration: 0.35, ease: 'power2.out' });
        if (img) gsap.to(img, { scale: 1, duration: 0.45, ease: 'power2.out' });
        if (arrow) gsap.to(arrow, { x: 0, duration: 0.25, ease: 'power2.out' });
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      cleanups.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, [loading, events]);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header without badges or dividers */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Live & Upcoming Hackathons
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Discover active competitions, form a squad with fellow builders, and compete for verified bounties.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors self-start md:self-auto group"
        >
          <span>View all hackathons</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 p-8 space-y-2">
          <Trophy className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-zinc-200">No hackathons available right now</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-500">New events will be announced shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, idx) => {
            const posterUrl = getEventPosterUrl(event.Posters);
            const mode = String(event.HackathonMode || 'Virtual');
            const prize = event.PrizeMoney || event.PhysicalPrizeMoney || 'TBD';

            return (
              <div
                key={event.Id || idx}
                ref={(el) => (cardsRef.current[idx] = el)}
                onClick={() => navigate(`/events/${event.Id}`)}
                className="group rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 flex flex-col justify-between shadow-sm hover:shadow-xl"
              >
                {/* Poster Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-zinc-950">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={event.EventName}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600">
                      <Trophy className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {event.EventName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {event.Description || 'Join teams to build real-world software, AI prototypes, and hardware solutions.'}
                    </p>
                  </div>

                  {/* Attributes */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        <span>{formatDate(event.StartDate, event.EndDate)}</span>
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{prize}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 dark:text-zinc-500 text-[11px] pt-1">
                      <span>{mode} Track</span>
                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors inline-flex items-center gap-1">
                        <span>View Details</span>
                        <ArrowRight className="view-arrow w-3 h-3 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
