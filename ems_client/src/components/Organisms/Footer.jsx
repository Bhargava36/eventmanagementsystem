import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

// Social SVG Icons (Clean minimal monochrome style)
const GithubIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
  </svg>
);

const DiscordIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  /**
   * 100% Authentic AYOJAN Navigation Structure
   * Modeled after LangChain's four-column layout.
   */
  const footerNavigation = {
    platform: [
      { name: "Flagship Events", href: "/events" },
      { name: "Squad Formation & Codes", href: "/user/login" },
      { name: "Round Problem Statements", href: "/events" },
      { name: "Live Evaluation Leaderboard", href: "/evaluator/login" },
      { name: "Digital ID & Pass Designer", href: "/id-designer" },
      { name: "Pass QR Verification", href: "/verify-id" },
      { name: "Campus Accommodation Desk", href: "/events" },
      { name: "Food & Turnstile Scanning", href: "/events" },
    ],
    portals: [
      { name: "Participant Dashboard", href: "/user/login" },
      { name: "Squad Workspace (My Teams)", href: "/user/login" },
      { name: "Organizer Command Center", href: "/admin/login" },
      { name: "Jury & Evaluator Portal", href: "/evaluator/login" },
      { name: "SuperAdmin Governance", href: "/super-admin/dashboard" },
      { name: "Test Accounts & Sandboxes", href: "/test-credentials" },
      { name: "Automated Certificate Engine", href: "/policies" },
      { name: "Broadcast Announcer", href: "/admin/login" },
    ],
    ecosystem: [
      { name: "About AYOJAN EMS", href: "/events" },
      { name: "AITAM Tekkali Chapter", href: "/policies" },
      { name: "Competition Guidelines", href: "/policies" },
      { name: "Platform Rules of Conduct", href: "/terms" },
      { name: "Student Data Privacy", href: "/privacy" },
      { name: "Crafter Reviews & Feedback", href: "/#testimonials" },
      { name: "Frequently Asked Questions", href: "/#faq" },
    ],
    social: [
      { name: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
      { name: "Twitter / X", href: "https://twitter.com", icon: TwitterIcon },
      { name: "GitHub", href: "https://github.com", icon: GithubIcon },
      { name: "Discord", href: "https://discord.com", icon: DiscordIcon },
    ],
  };

  return (
    <footer className="relative z-20 bg-white dark:bg-black text-zinc-900 dark:text-white  overflow-hidden select-none transition-colors duration-300">
      
      {/* Top subtle emerald hairline accent */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 dark:via-emerald-500/40 to-transparent" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-8">
        
        {/* ======================================================== */}
        {/* 1. TOP 4 COLUMNS (LangChain Layout Structure)            */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 sm:pb-16">
          
          {/* Column 1: Platform (3 cols) */}
          <div className="lg:col-span-3 pt-3 border-t border-zinc-200 dark:border-white/10">
            <h3 className="text-sm font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 font-sans mb-3.5">
              Platform
            </h3>
            <ul className="space-y-2">
              {footerNavigation.platform.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors duration-150 block leading-relaxed"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Portals & Access (3 cols) */}
          <div className="lg:col-span-3 pt-3 border-t border-zinc-200 dark:border-white/10">
            <h3 className="text-sm font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 font-sans mb-3.5">
              Portals &amp; Access
            </h3>
            <ul className="space-y-2">
              {footerNavigation.portals.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors duration-150 block leading-relaxed"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Ecosystem (2 cols) */}
          <div className="lg:col-span-2 pt-3 border-t border-zinc-200 dark:border-white/10">
            <h3 className="text-sm font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 font-sans mb-3.5">
              Ecosystem
            </h3>
            <ul className="space-y-2">
              {footerNavigation.ecosystem.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors duration-150 block leading-relaxed"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter Box (4 cols) */}
          <div className="lg:col-span-4 pt-3 border-t border-zinc-200 dark:border-white/10 space-y-3.5">
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white leading-snug">
              Sign up for our newsletter to stay up to date
            </h3>

            <form onSubmit={handleSubscribe} className="space-y-3 max-w-sm">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-zinc-100 dark:bg-[#0b1017] text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/15 rounded-md px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                required
              />

              <div className="flex items-center justify-between gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-emerald-600 dark:bg-white dark:text-black dark:hover:bg-emerald-400 dark:hover:text-black text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer shadow-sm active:scale-95"
                >
                  Subscribe
                </button>

                {/* Social icons next to button */}
                <div className="flex items-center gap-3">
                  {footerNavigation.social.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors p-1"
                        aria-label={item.name}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {subscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium pt-1"
                >
                  <Check className="w-3.5 h-3.5" /> Subscribed to AYOJAN announcements!
                </motion.p>
              )}
            </form>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. MASSIVE BRAND WATERMARK: [ 4 DOTS LOGO + AYOJAN ]    */}
        {/* Exact Navbar Typography & Logo Style — Scaled Up         */}
        {/* ======================================================== */}
        <div className="relative my-8 sm:my-14  flex items-center justify-center">
          
          <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 h-32  z-10">
            {/* Scaled AYOJAN 4-Dot Brand Logo (Exact Navbar Match) */}
            <div className="relative w-8 h-8 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center shrink-0">
              <span className="absolute w-2 h-2 sm:w-3.5 sm:h-3.5 md:w-7 md:h-7 rounded-full bg-gray-600 dark:bg-emerald-600 top-0 left-1/2 transform -translate-x-1/2 opacity-90 transition-colors" />
              <span className="absolute w-2 h-2 sm:w-3.5 sm:h-3.5 md:w-7 md:h-7 rounded-full bg-emerald-600 dark:bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-90 transition-colors" />
              <span className="absolute w-2 h-2 sm:w-3.5 sm:h-3.5 md:w-7 md:h-7 rounded-full bg-emerald-600 dark:bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-90 transition-colors" />
              <span className="absolute w-2 h-2 sm:w-3.5 sm:h-3.5 md:w-7 md:h-7 rounded-full bg-gray-600 dark:bg-emerald-600 bottom-0 left-1/2 transform -translate-x-1/2 opacity-90 transition-colors" />
            </div>

            {/* AYOJAN Text in exact Navbar Typography & Style */}
            <h5 className="text-3xl sm:text-6xl md:text-8xl  lg:text-[155px] font-bold text-gray-700 dark:text-white tracking-widest whitespace-nowrap leading-none hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300">
              AYOJAN
            </h5>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. BOTTOM BAR: SYSTEM STATUS & LEGAL LINKS               */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-zinc-600 dark:text-zinc-400">
          
          {/* Operational Status (Matching LangChain's "● All systems operational") */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-600 dark:text-zinc-400">
              All systems operational
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
            <Link to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">
              Privacy policy
            </Link>
            <Link to="/terms" className="hover:text-black dark:hover:text-white transition-colors">
              Terms of service
            </Link>
            <Link to="/policies" className="hover:text-black dark:hover:text-white transition-colors">
              Policies
            </Link>
            <Link to="/test-credentials" className="hover:text-black dark:hover:text-white transition-colors">
              Demo Access
            </Link>
          </div>

        </div>

      </div>

    </footer>
  );
}

export default Footer;

