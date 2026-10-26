import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Shield,
  Scale,
  Users,
  Award,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  Layers
} from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = "October 26, 2026";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: CheckCircle2,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            Welcome to <strong>AYOJAN Event Management Platform</strong> ("AYOJAN", "we", "us", or "our"). By registering, accessing, browsing, or utilizing any features of our platform—including participant portals, team collaboration boards, hackathon evaluation systems, and ID pass issuance—you agree to be bound by these Terms of Service ("Terms").
          </p>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-zinc-300">
            If you do not agree to these Terms, you must immediately cease accessing or using our services. For student participants registering as a team or under institutional invitations, the team leader warrants that they possess authorization to bind their team members to these conditions.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "2. User Eligibility & Account Integrity",
      icon: Users,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            To register and participate in competitions hosted on AYOJAN, you must satisfy the following criteria:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li>You must provide accurate, current, and verifiable registration details (including college roll number, legal name, and institutional email when requested).</li>
            <li>You are solely responsible for maintaining the confidentiality of your authentication credentials and account tokens.</li>
            <li>Duplicate accounts, identity impersonation, or forging identity badges will result in immediate disqualification and ban across all registered events.</li>
          </ul>
        </>
      ),
    },
    {
      id: "code-of-conduct",
      title: "3. Hackathon Conduct & Academic Integrity",
      icon: Scale,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            AYOJAN is committed to fostering an inclusive, merit-driven, and ethical innovation ecosystem. All crafters and organizers agree to uphold the highest standards of integrity:
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Original Work
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
                All software, hardware prototypes, and code submitted during competitions must be crafted within the declared event timeline, unless explicitly authorized as open-source starter templates.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" /> Zero Tolerance for Plagiarism
              </h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">
                Plagiarizing existing commercial products or uncredited repositories will result in immediate voiding of eligibility, zero evaluation scores, and institutional reporting.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property & Ownership",
      icon: Layers,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            We firmly believe that <strong>crafters own what they create</strong>. Unless explicitly stated in a specific competition’s sponsored problem brief:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li>Participants retain 100% intellectual property (IP) and copyright ownership over their source code, designs, and pitch presentations.</li>
            <li>By participating, teams grant event organizers and AYOJAN a worldwide, royalty-free, non-exclusive license to display, summarize, record, and promote event submissions for marketing and portfolio purposes.</li>
            <li>Organizer-provided proprietary problem statement datasets or corporate APIs remain the sole property of their respective creators.</li>
          </ul>
        </>
      ),
    },
    {
      id: "prizes",
      title: "5. Prize Distribution & Evaluations",
      icon: Award,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            Prize allocations, sponsor bounties, and awards published on event landing pages are administered by designated Event Organizers under AYOJAN verification standards:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li>Jury scores, rubric evaluations, and final track rankings entered via our Jury Portal are final and binding once ratified by organizers.</li>
            <li>Monetary awards, trophies, and merchandise are disbursed according to organizer terms. Recipients are responsible for any statutory tax compliances applicable to prize winnings.</li>
            <li>Failure to check in physically or comply with verification checkpoints can lead to prize forfeiture.</li>
          </ul>
        </>
      ),
    },
    {
      id: "termination",
      title: "6. Platform Availability & Termination",
      icon: Shield,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            AYOJAN reserves the right to suspend or terminate access to any user or organizer account without notice in the event of security breaches, spam distribution, disruptive bot activities, or violation of these Terms.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Background Subtle Glow - pure emerald & dark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Effective: {lastUpdated}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 text-center sm:text-left border-b border-slate-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl">
            Please read these terms carefully before registering for competitions, creating teams, or hosting events on the AYOJAN platform.
          </p>
        </div>

        {/* Quick Jump Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
            Table of Contents
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-zinc-700 transition shadow-2xs"
              >
                {sec.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <motion.section
                id={section.id}
                key={section.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="text-sm leading-relaxed">{section.content}</div>
              </motion.section>
            );
          })}
        </div>

        {/* Contact & Support Section */}
        <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <Mail className="w-4 h-4 text-emerald-500" /> Questions about our Terms?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Reach out to our legal and event integrity team for clarifications.
            </p>
          </div>
          <a
            href="mailto:support@ayojan.live"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer shrink-0"
          >
            Contact Legal Team
          </a>
        </div>
      </div>
    </div>
  );
}
