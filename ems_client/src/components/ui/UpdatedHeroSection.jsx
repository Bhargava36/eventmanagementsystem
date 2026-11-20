import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ShieldCheck, Trophy, Users } from 'lucide-react';

export const UpdatedHeroSection = ({ className = '' }) => {
  return (
    <section
      className={`relative w-full min-h-[92vh] sm:min-h-screen bg-white dark:bg-black overflow-hidden flex flex-col justify-between transition-colors duration-300 select-none ${className}`}
    >
      {/* Top spacing to account for fixed/floating Navbar */}
      <div className="h-20 sm:h-28 w-full shrink-0 pointer-events-none" />

      {/* Subtle Central Grid & Lighting (Clean luxury minimal aesthetic - No radial/sparkle clutter) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-60 dark:opacity-40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/[0.08] blur-3xl pointer-events-none" />
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 flex flex-col items-center justify-center text-center">
        {/* Top Eyebrow Badge */}
        {/* <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide mb-6 sm:mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>AITAM Student Activity Center &bull; Official Platform</span>
        </motion.div> */}

        {/* Primary Title: AVISHKAAR */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3 sm:space-y-4"
        >
          <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-[112px] xl:text-[132px] font-black tracking-[0.06em] sm:tracking-[0.12em] leading-none text-slate-900 dark:text-white uppercase">
            AVISHKAAR
          </h1>

          {/* Subtitle: EVENT MANAGEMENT SYSTEM */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <span className="h-px w-8 sm:w-16 bg-slate-300 dark:bg-zinc-800" />
            <p className="font-heading text-xs sm:text-sm md:text-base lg:text-lg font-bold tracking-[0.24em] sm:tracking-[0.32em] text-emerald-600 dark:text-emerald-400 uppercase">
              Event Management System
            </p>
            <span className="h-px w-8 sm:w-16 bg-slate-300 dark:bg-zinc-800" />
          </div>
        </motion.div>

        {/* Value Proposition Statement */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 max-w-2xl text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-400 font-medium leading-relaxed px-4"
        >
          Where crafters connect, hackathons scale, and bold ideas take flight.
          Structured collegiate infrastructure for hackathons, project expos, and technical symposiums.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10"
        >
          {/* Explore Events */}
          <Link
            to="/events"
            className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          {/* Join Platform */}
          <Link
            to="/user/register"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 rounded-full border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850 text-slate-800 dark:text-white font-medium text-xs sm:text-sm tracking-wide transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
          >
            Join Free
          </Link>
        </motion.div>

        {/* Highlight Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16 w-full max-w-4xl"
        >
          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60 text-left">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Avishkaar 4</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Flagship Hackathon</p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60 text-left">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Dual Tracks</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Virtual & On-Campus</p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60 text-left">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Squad Engine</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Seamless Team Pairing</p>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60 text-left">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Gate Passes</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">QR Digital Verification</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom spacer */}
      <div className="h-6 sm:h-12 w-full shrink-0 pointer-events-none" />
    </section>
  );
};

export default UpdatedHeroSection;

