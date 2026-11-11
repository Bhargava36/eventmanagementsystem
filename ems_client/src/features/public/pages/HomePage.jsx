import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from '../../../components/ui/HeroSection';
import FeaturedHackathonsSection from '../components/home/FeaturedHackathonsSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import TechTracksBentoSection from '../components/home/TechTracksBentoSection';
import LogisticsAutomationSection from '../components/home/LogisticsAutomationSection';
import PlatformStatsSection from '../components/home/PlatformStatsSection';
import OrganizerCtaSection from '../components/home/OrganizerCtaSection';
import HomeFaqSection from '../components/home/HomeFaqSection';
import PlatformTestimonialsSection from '../components/home/PlatformTestimonialsSection';
import ParallaxStoryBackdrop from '../components/home/ParallaxStoryBackdrop';
gsap.registerPlugin(ScrollTrigger);
// HomePage Continuous storytelling landing page powered by Lenis smooth scrolling
export default function HomePage() {
  // Lenis Smooth Scroll Integration with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCb = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCb);
    // Smooth lag compensation (max 500ms lag smoothed over 33ms steps)
    gsap.ticker.lagSmoothing(500, 33);
    // Initial trigger recalibration
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
    return () => {
      clearTimeout(refreshTimer);
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
      {/* 5. Physical & Virtual Operational Infrastructure with Live Simulators */}
      <LogisticsAutomationSection />
      {/* 6. Proven Track Record: Real-world Platform Metrics & Growth */}
      <PlatformStatsSection />
      {/* 7. Community Voices: Real Crafter Testimonials & Reviews */}
      <PlatformTestimonialsSection />
      {/* 8. Knowledge Base: Transparent Operations FAQ */}
      <HomeFaqSection />
      {/* 7. Command Center: Interactive Three.js 3D Globe for Organizers */}
      <OrganizerCtaSection />
    </div>
  );
}
