import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Code2,
  Trophy,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const STEPS = [
  {
    num: '01',
    side: 'left',
    title: 'Find a Challenge',
    description:
      'Browse verified virtual and on-campus events. Filter by tech stacks, domains, prize pools, and schedules.',
    icon: Search,
    detail: '50+ Tracks Available',
    gradient: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    num: '02',
    side: 'left',
    title: 'Form Your Squad',
    description:
      'Team up using instant squad invite codes, or discover matching developers and designers seeking teammates.',
    icon: Users,
    detail: 'Instant Squad Codes',
    gradient: 'from-teal-500/10 to-emerald-500/5',
  },
  {
    num: '03',
    side: 'right',
    title: 'Build & Submit',
    description:
      'Access cloud credits, attend scheduled mentor checkpoints, and sync your Git repository before the countdown strikes.',
    icon: Code2,
    detail: 'Automated GitHub Sync',
    gradient: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    num: '04',
    side: 'right',
    title: 'Pitch & Win Bounties',
    description:
      'Demonstrate your prototype live to the judging panel, earn cryptographically verified credentials, and claim bounties.',
    icon: Trophy,
    detail: 'Transparent Jury Scoring',
    gradient: 'from-teal-500/10 to-emerald-500/5',
  },
];

export default function HowItWorksSection() {
  const leftSteps = STEPS.filter((s) => s.side === 'left');
  const rightSteps = STEPS.filter((s) => s.side === 'right');

  return (
    <section
      id="blueprint"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20 overflow-hidden"
    >
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-3xl mx-auto mb-14 sm:mb-20 space-y-4"
      >
        

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          From Registration to the Victory Podium
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
          Four structured milestones designed to empower your team from idea conceptualization to live prototype presentation on stage.
        </p>
      </motion.div>

      {/* React Bits Pro "How It Works 7" - Four Steps Around Arched Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        {/* Left Column: Steps 01 & 02 */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8 order-2 lg:order-1">
          {leftSteps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className=" text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <IconComp className="w-9 h-9" />
                  </div>

                  <span className="font-mono absolute top-1 right-4 text-8xl font-black text-slate-300/30 dark:text-zinc-700/60 group-hover:text-emerald-600/40 dark:group-hover:text-emerald-400/50 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  <span>{step.detail}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80 group-hover:scale-125 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center Column: The Focal Arched Frame with Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="lg:col-span-4 flex justify-center order-1 lg:order-2 my-2 lg:my-0"
        >
          <div className="relative w-full max-w-[340px] sm:max-w-[370px]">
            {/* Ambient Backdrop Aura */}
            <div className="absolute -inset-4 bg-gradient-to-t from-emerald-500/25 to-teal-500/15 rounded-t-[220px] rounded-b-3xl blur-2xl opacity-75 pointer-events-none" />

            {/* Arched Architectural Portal Frame */}
            <div className="relative p-2.5 rounded-t-[190px] sm:rounded-t-[220px] rounded-b-3xl bg-gradient-to-b from-emerald-500/40 via-slate-200 dark:via-zinc-800 to-emerald-500/20 shadow-2xl">
              <div className="w-full h-[460px] sm:h-[510px] rounded-t-[175px] sm:rounded-t-[205px] rounded-b-2xl overflow-hidden relative group bg-zinc-950">
                {/* 3D Campus / Hackathon Arena Image */}
                <img
                  src="/assets/hero/ayojan-campus-3d.jpg"
                  alt="AYOJAN Event Arena"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Dark Vignette Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                
                {/* Bottom Floating Info Pill */}
                {/* <div className="absolute bottom-6 inset-x-5 z-10 space-y-2">
                  <div className="p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> 48-Hour Sprint
                      </span>
                      <span>Verified Certificates</span>
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-tight">
                      Automated team management, evaluation rubrics, and direct bounty distribution.
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Steps 03 & 04 */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8 order-3">
          {rightSteps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className=" text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <IconComp className="w-9 h-9" />
                  </div>

                  <span className="font-mono absolute top-1 right-4 text-8xl font-black text-slate-300/30 dark:text-zinc-700/60 group-hover:text-emerald-600/50 dark:group-hover:text-emerald-400/50 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  <span>{step.detail}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80 group-hover:scale-125 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
