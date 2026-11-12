"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, HelpCircle, Mail } from "lucide-react";

const FAQS = [
  {
    id: "eligibility",
    num: "01",
    q: "Who can participate in events hosted on AYOJAN?",
    a: "AYOJAN lists hackathons, project expos, workshops, seminars, webinars, and alumni meets across on-campus, virtual, and hybrid formats. Open eligibility varies by each host chapter and is shown clearly on every public event page.",
    linkLabel: "Browse open events",
    linkHref: "/events",
  },
  {
    id: "solo-or-team",
    num: "02",
    q: "Can I register individually or form a team?",
    a: "Both options are supported. Workshops, talks, and solo tracks accept individual sign-ups, while team competitions allow squad creation with shareable invite codes so teammates can join under one entry.",
    linkLabel: "Create student account",
    linkHref: "/user/register",
  },
  {
    id: "qr-and-stays",
    num: "03",
    q: "How do digital ID passes, meals, and accommodation work?",
    a: "Participants receive custom digital ID passes paired with verifiable QR verification for entry checkpoints. On physical events that enable catering or lodging, organizers also coordinate meal scan tracking and room assignments.",
    linkLabel: "Verify an ID pass",
    linkHref: "/verify-id",
  },
  {
    id: "jury-scoring",
    num: "04",
    q: "How does multi-round jury evaluation work?",
    a: "Organizers set structured evaluation criteria per round and grant access to assigned evaluators through the Jury Portal. Evaluators score participating teams or exhibition booths directly before standings are published.",
    linkLabel: "Jury evaluation portal",
    linkHref: "/evaluator/login",
  },
  {
    id: "host-events",
    num: "05",
    q: "How can student chapters and colleges host events?",
    a: "Institutional coordinators and club leads can register an organizer account to publish event pages, manage registrations, design custom ID passes, assign rooms or expo booths, and send targeted email broadcasts.",
    linkLabel: "Register as organizer",
    linkHref: "/admin/register",
  },
  {
    id: "policies-support",
    num: "06",
    q: "Where can I review event guidelines and privacy policies?",
    a: "Platform terms, privacy notices, event guidelines, and official support desks are published openly so attendees, evaluators, and host institutions share clear expectations before registering.",
    linkLabel: "Read platform policies",
    linkHref: "/policies",
  },
];

export default function HomeFaqSection() {
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState("eligibility");

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative w-full py-20 sm:py-28 bg-white dark:bg-black text-slate-900 dark:text-white border-t border-slate-200/70 dark:border-zinc-800/80 transition-colors duration-300 selection:bg-emerald-500 selection:text-white scroll-mt-20"
    >
      <div className="w-full md:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: Sticky Header & Viewfinder Support Desk */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 lg:sticky lg:top-28 space-y-7"
          >
            <div className="space-y-3.5">
              

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Questions, <br />
                <span className="font-heading italic text-emerald-600 dark:text-emerald-400">
                  Answered Clearly.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed max-w-md">
                Key operational details across event registrations, QR check-ins, jury rubrics, and hosting workflows.
              </p>
            </div>

            {/* Architectural Viewfinder Support Card */}
            <div className="group/help rounded-[24px] border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950 p-6 space-y-4 hover:border-emerald-500/60 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  
                  <HelpCircle
                    strokeWidth={1.6}
                    className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Need direct assistance?
                  </h3>
                  
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                Reach the platform desk for institution onboarding, schedule clarifications, or participant access questions.
              </p>

              <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                <a
                  href="mailto:support@ayojan.live"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>support@ayojan.live</span>
                </a>

                <Link
                  to="/events"
                  className="group/ev inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                >
                  <span>Browse Events</span>
                  <ArrowUpRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/ev:translate-x-0.5 motion-safe:group-hover/ev:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Indexed Architectural Question Cards */}
          <div className="lg:col-span-7 space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.42,
                    delay: reduceMotion ? 0 : idx * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`rounded-2xl border transition-colors duration-200 ${
                    isOpen
                      ? "border-emerald-500/60 bg-slate-50/70 dark:bg-zinc-950"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-2xl group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Monospace Tabular Index Pill */}
                      <span
                        className={`w-8 h-8 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-center shrink-0 transition-colors duration-200 ${
                          isOpen
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 group-hover:border-emerald-500/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                        }`}
                      >
                        {faq.num}
                      </span>

                      <h3
                        className={`text-base sm:text-[17px] font-semibold leading-snug transition-colors ${
                          isOpen
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                        }`}
                      >
                        {faq.q}
                      </h3>
                    </div>

                    {/* Crisp Rotating Crosshair + / - Indicator */}
                    <span
                      className={`relative w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-200 ${
                        isOpen
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-slate-500 dark:text-zinc-400 group-hover:border-emerald-500/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      }`}
                      aria-hidden="true"
                    >
                      <span className="w-3 h-[1.5px] bg-current rounded-full" />
                      <span
                        className={`absolute w-[1.5px] h-3 bg-current rounded-full motion-safe:transition-transform motion-safe:duration-250 ${
                          isOpen ? "rotate-90 scale-y-0" : "rotate-0 scale-y-100"
                        }`}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={
                          reduceMotion
                            ? { opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        animate={{
                          height: "auto",
                          opacity: 1,
                          transition: reduceMotion
                            ? { duration: 0 }
                            : {
                                height: {
                                  duration: 0.28,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                                opacity: { duration: 0.2, delay: 0.04 },
                              },
                        }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : {
                                height: 0,
                                opacity: 0,
                                transition: {
                                  height: {
                                    duration: 0.22,
                                    ease: [0.22, 1, 0.36, 1],
                                  },
                                  opacity: { duration: 0.14 },
                                },
                              }
                        }
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[68px] sm:pl-[76px] space-y-3">
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                            {faq.a}
                          </p>

                          <Link
                            to={faq.linkHref}
                            className="group/flink inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
                          >
                            <span>{faq.linkLabel}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover/flink:translate-x-0.5 motion-safe:group-hover/flink:-translate-y-0.5" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
