import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import HeroSection from '../../../components/ui/HeroSection';
import FeaturedHackathonsSection from '../components/home/FeaturedHackathonsSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import TechTracksBentoSection from '../components/home/TechTracksBentoSection';
import LogisticsAutomationSection from '../components/home/LogisticsAutomationSection';
import OrganizerCtaSection from '../components/home/OrganizerCtaSection';
import HomeFaqSection from '../components/home/HomeFaqSection';
import ParallaxStoryBackdrop from '../components/home/ParallaxStoryBackdrop';

gsap.registerPlugin(ScrollTrigger);

/**
 * HomePage
 * Continuous storytelling landing page powered by Lenis smooth scrolling
 * and GSAP ScrollTrigger orchestrated reveals across every section.
 */
export default function HomePage() {
  // Lenis Smooth Scroll Integration with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* GSAP ScrollTrigger Parallax Ambient Depth Backdrop */}
      <ParallaxStoryBackdrop />

      {/* 1. The Vision & Real-time Platform Scale */}
      <HeroSection />

      {/* 2. The Arena: Live & Upcoming Hackathons with Staggered ScrollReveal */}
      <FeaturedHackathonsSection />

      {/* 3. The Builder Pathway: 4-Step Execution Blueprint with Scroll-driven Circuit */}
      <HowItWorksSection />

      {/* 4. Domain Mastery: 3D Perspective Bento Grid */}
      <TechTracksBentoSection />

      {/* 5. Physical & Virtual Operational Infrastructure with Live Simulators */}
      <LogisticsAutomationSection />

      {/* 6. Command Center: Interactive Three.js 3D Globe for Organizers */}
      <OrganizerCtaSection />

      {/* 7. Knowledge Base: Transparent Operations FAQ */}
      <HomeFaqSection />
    </div>
  );
}
