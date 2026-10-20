import React from 'react';
import HeroSection from '../../../components/ui/HeroSection';
import FeaturedHackathonsSection from '../components/home/FeaturedHackathonsSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import TechTracksBentoSection from '../components/home/TechTracksBentoSection';
import LogisticsAutomationSection from '../components/home/LogisticsAutomationSection';
import OrganizerCtaSection from '../components/home/OrganizerCtaSection';
import HomeFaqSection from '../components/home/HomeFaqSection';

/**
 * HomePage
 * Premium Landing Page composed of modular, high-performance components:
 * 1. HeroSection - 3D Circular Dot Matrix & Real-time Platform Metrics Strip
 * 2. FeaturedHackathonsSection - Dynamic live/upcoming competitions from MySQL
 * 3. HowItWorksSection - 4-step interactive builder pathway
 * 4. TechTracksBentoSection - Domains & specializations Bento grid
 * 5. LogisticsAutomationSection - Campus ID Passes, Food Tokens & Room Allocations
 * 6. OrganizerCtaSection - University & Enterprise Host Hackathon invitation
 * 7. HomeFaqSection - Smooth accordion FAQ answers
 */
export default function HomePage() {
  return (
    <div className="bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 selection:bg-emerald-500 selection:text-white overflow-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Competitions */}
      <FeaturedHackathonsSection />

      {/* 3. The Builder Pathway (How It Works) */}
      <HowItWorksSection />

      {/* 4. Tech Tracks Bento Grid */}
      <TechTracksBentoSection />

      {/* 5. End-to-End Logistics & Automation */}
      <LogisticsAutomationSection />

      {/* 6. University & Corporate Organizer CTA */}
      <OrganizerCtaSection />

      {/* 7. Frequently Asked Questions */}
      <HomeFaqSection />
    </div>
  );
}
