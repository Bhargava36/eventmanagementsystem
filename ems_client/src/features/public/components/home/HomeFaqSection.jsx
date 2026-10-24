import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const FAQS = [
  {
    q: 'Who is eligible to participate in AYOJAN competitions?',
    a: 'AYOJAN hackathons are open to students, developers, designers, and innovators globally. Each competition details whether participation is virtual (open globally online) or on-campus (in-person attendance).',
  },
  {
    q: 'Are hackathons on AYOJAN completely free for students?',
    a: 'Yes, 100%. All student registrations, squad submissions, and participation are free. We never charge entry fees to participate, access mentors, or receive bounty rewards.',
  },
  {
    q: 'Can I register as an individual builder without an existing team?',
    a: 'Yes. Solo hackers can sign up and participate individually, or take advantage of squad codes and open squad listings on the event page to team up with fellow participants before hacking starts.',
  },
  {
    q: 'How are meals, accommodation, and campus logistics handled?',
    a: 'For physical on-campus hackathons that offer meals and lodging, registered attendees receive automated Digital ID Passes, cafeteria food tokens, and hostel block room allocations within their dashboard.',
  },
  {
    q: 'How does multi-round judging and prize disbursement work?',
    a: 'Submissions are evaluated through structured judging rubrics across rounds. Winners are published on transparent leaderboards, and prize bounties are disbursed directly via bank transfer or verified credentials.',
  },
  {
    q: 'How can universities and student chapters host events on AYOJAN?',
    a: 'Colleges and clubs can register directly through our Organizer Portal. You gain access to manage registrations, assign mentors, review Git submissions, allocate lodging, and score participants.',
  },
];

export default function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const supportCardRef = useRef(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const sectionRef = useRef(null);
  const sidebarRef = useRef(null);
  const faqListRef = useRef(null);

  // GSAP ScrollTrigger Scroll-Reveal & Support Card Hover
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sidebar reveal (re-triggers whenever on screen)
      if (sidebarRef.current) {
        gsap.from(sidebarRef.current, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 88%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      }

      // FAQ Rows Stagger reveal (re-triggers whenever on screen)
      const items = faqListRef.current?.children;
      if (items && items.length) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: faqListRef.current,
            start: 'top 85%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
          },
          y: 35,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    const card = supportCardRef.current;
    if (!card) return () => ctx.revert();

    const onEnter = () => gsap.to(card, { y: -4, borderColor: '#10b981', duration: 0.3, ease: 'power2.out' });
    const onLeave = () => gsap.to(card, { y: 0, borderColor: 'var(--card-border, rgba(39, 39, 42, 1))', duration: 0.3, ease: 'power2.out' });

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);

    return () => {
      ctx.revert();
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Sticky Title & Direct Support Box with ScrollReveal */}
        <div ref={sidebarRef} className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Frequently Asked Questions.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
              Everything you need to know about squad creation, campus stays, evaluations, and hosting hackathons.
            </p>
          </div>

          {/* Clean Support Card */}
          <div
            ref={supportCardRef}
            className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Have a specific question?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
              Our organizers and developer community are ready to assist with squad formation, rulebooks, or accommodation queries.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
            >
              <span>Explore events & community</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Framer Motion Spring Accordions with ScrollReveal */}
        <div ref={faqListRef} className="lg:col-span-7 divide-y divide-slate-200 dark:divide-zinc-800">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="py-6 first:pt-0 last:pb-0 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left flex items-start justify-between gap-4 group cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-base sm:text-lg font-semibold transition-colors ${
                      isOpen
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isOpen
                        ? 'bg-emerald-500/20 text-emerald-500 rotate-180'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 group-hover:text-white'
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                        transition: {
                          height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.25, delay: 0.05 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
                          opacity: { duration: 0.15 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
