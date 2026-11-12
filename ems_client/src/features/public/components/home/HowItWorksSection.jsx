import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import { Search, Users, QrCode, Award, ArrowRight, Check } from "lucide-react";

const STEPS = [
  {
    num: "01",
    side: "left",
    title: "Find an Event",
    description:
      "Browse open hackathons, project expos, workshops, seminars, and alumni meets across virtual and on-campus formats.",
    detail: "Open Event Directory",
    icon: Search,
    stageTitle: "Explore Published Events",
    stageSummary:
      "Check participation mode, venue details, schedules, and registration deadlines on one public listing.",
    highlights: [
      "Hackathons, Project Expos & Workshops",
      "Seminars, Webinars & Alumni Meets",
      "Virtual, On-Campus & Hybrid Modes",
    ],
    ctaLabel: "Browse Open Events",
    ctaHref: "/events",
  },
  {
    num: "02",
    side: "left",
    title: "Register Your Entry",
    description:
      "Sign up once and enroll individually for sessions or create and join a team using a shared invite code.",
    detail: "Solo & Team Enrollment",
    icon: Users,
    stageTitle: "Individual or Team Entry",
    stageSummary:
      "Complete registration cleanly whether participating solo or collaborating as a team.",
    highlights: [
      "Solo entry for talks & workshops",
      "Team creation with invite codes",
      "Unified participant dashboard access",
    ],
    ctaLabel: "Create Student Account",
    ctaHref: "/user/register",
  },
  {
    num: "03",
    side: "right",
    title: "Digital ID & Check-In",
    description:
      "Use your event ID pass for gate verification, workshop attendance tracking, and on-campus logistics coordination.",
    detail: "QR Pass & Logistics",
    icon: QrCode,
    stageTitle: "Venue & Session Passes",
    stageSummary:
      "Keep entry credentials and campus allocations organized in your participant profile.",
    highlights: [
      "QR pass verification at entry gates",
      "Session & workshop attendance logs",
      "Room & accommodation assignments",
    ],
    ctaLabel: "Verify an ID Pass",
    ctaHref: "/verify-id",
  },
  {
    num: "04",
    side: "right",
    title: "Evaluation & Results",
    description:
      "Present submissions or stalls to assigned jury evaluators and review official round results and event feedback.",
    detail: "Jury Scoring & Results",
    icon: Award,
    stageTitle: "Structured Review & Results",
    stageSummary:
      "Evaluators score rounds against organizer-configured criteria before results are published.",
    highlights: [
      "Dedicated jury evaluation portal",
      "Published round & track standings",
      "Post-event participant feedback",
    ],
    ctaLabel: "Participant Sign In",
    ctaHref: "/user/login",
  },
];

const stageSlideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -28 : 28,
    opacity: 0,
  }),
};

function StepCard({ step, isActive, onActivate, delayIndex, reduceMotion }) {
  const IconComp = step.icon;

  return (
    <motion.button
      type="button"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.48,
        delay: delayIndex * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      aria-pressed={isActive}
      className={`group w-full text-left relative p-6 sm:p-7 rounded-[24px] bg-white dark:bg-black border transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        isActive
          ? "border-emerald-500/70 dark:border-emerald-500/60 shadow-lg shadow-emerald-500/5"
          : "border-slate-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-colors duration-200 ${
            isActive
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
          }`}
        >
          <IconComp className="w-5 h-5" />
        </div>

        <span
          className={`font-mono text-4xl sm:text-5xl font-bold leading-none select-none transition-colors duration-200 ${
            isActive
              ? "text-emerald-500/35 dark:text-emerald-400/30"
              : "text-slate-200 dark:text-zinc-800 group-hover:text-emerald-500/25"
          }`}
          aria-hidden="true"
        >
          {step.num}
        </span>
      </div>

      <div className="space-y-2">
        <span
          className={`font-heading block text-lg font-bold tracking-tight transition-colors duration-200 ${
            isActive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
          }`}
        >
          {step.title}
        </span>
        <span className="block text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
          {step.description}
        </span>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-medium">
        <span className="text-slate-500 dark:text-zinc-400">{step.detail}</span>
        
      </div>
    </motion.button>
  );
}

export default function HowItWorksSection() {
  const [{ stepIndex, direction }, setStageState] = useState({
    stepIndex: 0,
    direction: 1,
  });
  const reduceMotion = useReducedMotion();

  const selectStep = (nextIndex) => {
    setStageState((prev) => {
      if (prev.stepIndex === nextIndex) return prev;
      return {
        stepIndex: nextIndex,
        direction: nextIndex > prev.stepIndex ? 1 : -1,
      };
    });
  };

  const activeStep = STEPS[stepIndex] || STEPS[0];
  const ActiveIcon = activeStep.icon;

  return (
    <section
      id="blueprint"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 w-full md:max-w-[80%] mx-auto relative scroll-mt-20 overflow-hidden"
    >
      {/* Section Header */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-3"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          How AYOJAN Works
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed max-w-2xl mx-auto">
          Four steps covering event discovery, registration, digital gate passes, and result publishing.
        </p>
      </motion.div>

      {/* Four Step Cards Framing the Central Arched Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Steps 01 & 02 */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          {STEPS.filter((s) => s.side === "left").map((step, idx) => (
            <StepCard
              key={step.num}
              step={step}
              isActive={stepIndex === idx}
              onActivate={() => selectStep(idx)}
              delayIndex={idx}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        {/* Center Column: Sculpted Arched Stage */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-4 flex justify-center order-1 lg:order-2 my-2 lg:my-0"
        >
          <div className="relative w-full max-w-[365px]">
            <div className="rounded-t-[190px] sm:rounded-t-[210px] rounded-b-[28px] p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
              <div className="relative w-full rounded-t-[180px] sm:rounded-t-[200px] rounded-b-[22px] overflow-hidden border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-950 flex flex-col justify-between p-6 pt-10 min-h-[480px] sm:min-h-[500px]">
                {/* Dot-Matrix Surface Texture matching Featured Cards */}
                <div
                  className="absolute inset-0 opacity-[0.06] dark:opacity-[0.12] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)",
                    backgroundSize: "20px 20px",
                  }}
                  aria-hidden="true"
                />

                {/* Top Arch Apex: Smooth Icon Swap + Step Indicator */}
                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-xs overflow-hidden">
                    <AnimatePresence initial={false}>
                      <motion.span
                        key={activeStep.num}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.78 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.78 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 flex items-center justify-center will-change-transform"
                      >
                        <ActiveIcon className="w-5 h-5" />
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  
                </div>

                {/* Butter-smooth Fixed-Box Cross-Slide Stage (zero height jump, GPU transform + opacity) */}
                <div
                  id={`how-it-works-panel-${activeStep.num}`}
                  role="tabpanel"
                  aria-labelledby={`how-it-works-tab-${activeStep.num}`}
                  className="relative z-10 h-[288px] sm:h-[296px] my-3 overflow-hidden"
                >
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={activeStep.num}
                      custom={direction}
                      variants={reduceMotion ? undefined : stageSlideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              x: {
                                type: "spring",
                                stiffness: 320,
                                damping: 32,
                                mass: 0.75,
                              },
                              opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                            }
                      }
                      className="absolute inset-0 flex flex-col justify-center space-y-4 will-change-transform"
                    >
                      <div className="text-center space-y-1.5 px-1">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                          {activeStep.stageTitle}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed min-h-[2.4rem]">
                          {activeStep.stageSummary}
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {activeStep.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-medium text-slate-700 dark:text-zinc-300"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-1 flex justify-center">
                        <Link
                          to={activeStep.ctaHref}
                          className="group/cta inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                        >
                          <span>{activeStep.ctaLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/cta:translate-x-0.5" />
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Buttery Sliding Pill Tab Bar */}
                <LayoutGroup id="how-it-works-tabs">
                  <div
                    className="relative z-10 grid grid-cols-4 gap-1 p-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black"
                    role="tablist"
                    aria-label="Workflow steps"
                  >
                    {STEPS.map((s, idx) => {
                      const selected = idx === stepIndex;
                      return (
                        <button
                          key={s.num}
                          id={`how-it-works-tab-${s.num}`}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          aria-controls={`how-it-works-panel-${s.num}`}
                          onClick={() => selectStep(idx)}
                          className={`relative z-10 py-1.5 rounded-full text-xs font-mono font-semibold transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                            selected
                              ? "text-white"
                              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="howItWorksTabIndicator"
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : {
                                      type: "spring",
                                      stiffness: 480,
                                      damping: 36,
                                      mass: 0.85,
                                    }
                              }
                              className="absolute inset-0 rounded-full bg-emerald-600 -z-10"
                              aria-hidden="true"
                            />
                          )}
                          {s.num}
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Steps 03 & 04 */}
        <div className="lg:col-span-4 space-y-6 order-3">
          {STEPS.filter((s) => s.side === "right").map((step, idx) => {
            const globalIdx = idx + 2;
            return (
              <StepCard
                key={step.num}
                step={step}
                isActive={stepIndex === globalIdx}
                onActivate={() => selectStep(globalIdx)}
                delayIndex={globalIdx}
                reduceMotion={reduceMotion}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
