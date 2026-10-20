import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import gsap from 'gsap';
import {
  Search,
  Users,
  Code2,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Find a Challenge',
    description:
      'Browse through verified virtual and on-campus hackathons. Filter by tech stacks, prize pools, or submission deadlines.',
    icon: Search,
    detail: 'Over 50+ tracks available',
  },
  {
    num: '02',
    title: 'Form Your Squad',
    description:
      'Team up with friends using shareable squad codes, or connect with fellow developers and designers looking for teammates.',
    icon: Users,
    detail: 'Instant squad join codes',
  },
  {
    num: '03',
    title: 'Build & Submit',
    description:
      'Access cloud resources, join scheduled mentor review sessions, and submit your code repositories before the countdown ends.',
    icon: Code2,
    detail: 'Automated GitHub sync',
  },
  {
    num: '04',
    title: 'Pitch & Win Bounties',
    description:
      'Demonstrate your prototype live to the judging panel, earn verified certificates, and claim cash bounties directly.',
    icon: Trophy,
    detail: 'Transparent multi-round jury',
  },
];

export default function HowItWorksSection() {
  const cardsRef = useRef([]);
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const pathRef = useRef(null);

  // 1. GSAP ScrollTrigger Scroll-Reveal & Hover Interactions
  useEffect(() => {
    let animInstance = null;
    const triggerAnime = () => {
      const path = pathRef.current;
      if (!path) return;
      try {
        if (animInstance) animInstance.pause();
        animInstance = animate(path, {
          strokeDashoffset: [200, 0],
          duration: 2200,
          ease: 'linear',
          loop: true,
        });
      } catch (e) {}
    };

    const ctx = gsap.context(() => {
      // Header reveal (re-triggers whenever on screen)
      if (headerRef.current) {
        gsap.from(headerRef.current, {
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

      // 4 Steps Stagger reveal (re-triggers whenever on screen)
      const cards = cardsRef.current.filter(Boolean);
      if (cards.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: gridRef.current || sectionRef.current,
            start: 'top 85%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
            onEnter: triggerAnime,
            onEnterBack: triggerAnime,
          },
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    // Initial Anime.js Animated Connection Beam
    triggerAnime();

    // 3. Hover Micro-Interactions
    const cleanupFns = [];
    cardsRef.current.forEach((card) => {
      if (!card) return;

      const iconEl = card.querySelector('.step-icon');
      const numEl = card.querySelector('.step-num');

      const onEnter = () => {
        gsap.to(card, {
          y: -8,
          borderColor: '#10b981',
          duration: 0.3,
          ease: 'power2.out',
        });
        if (iconEl) {
          gsap.to(iconEl, {
            scale: 1.15,
            rotate: 6,
            duration: 0.3,
            ease: 'back.out(2)',
          });
        }
        if (numEl) {
          gsap.to(numEl, {
            color: '#10b981',
            duration: 0.2,
          });
        }
      };

      const onLeave = () => {
        gsap.to(card, {
          y: 0,
          borderColor: 'var(--card-border, rgba(39, 39, 42, 1))',
          duration: 0.35,
          ease: 'power2.out',
        });
        if (iconEl) {
          gsap.to(iconEl, {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
        if (numEl) {
          gsap.to(numEl, {
            color: 'var(--num-color, rgba(82, 82, 91, 1))',
            duration: 0.2,
          });
        }
      };

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);

      cleanupFns.push(() => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      ctx.revert();
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="blueprint"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative scroll-mt-20"
    >
      {/* Header with ScrollReveal */}
      <div ref={headerRef} className="max-w-3xl mb-12 sm:mb-16 space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          How HackHub Works
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
          A straightforward, transparent pathway from discovering an event to presenting your final project.
        </p>
      </div>

      {/* SVG Connecting Flow Beam (Visible on desktop) */}
      <div className="hidden lg:block w-full h-8 mb-4 relative overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 32" fill="none">
          {/* Base Track */}
          <line
            x1="100"
            y1="16"
            x2="1100"
            y2="16"
            stroke="currentColor"
            className="text-slate-200 dark:text-zinc-800"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          {/* Animated Energy Beam with Anime.js */}
          <line
            ref={pathRef}
            x1="100"
            y1="16"
            x2="1100"
            y2="16"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 160"
            strokeDashoffset="0"
          />
        </svg>
      </div>

      {/* 4 Clean Step Cards */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div
              key={step.num}
              ref={(el) => (cardsRef.current[idx] = el)}
              className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-xl cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="step-icon w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                  <IconComp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="step-num font-mono text-xl font-bold text-slate-400 dark:text-zinc-600 transition-colors">
                  {step.num}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500">
                <span>{step.detail}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
