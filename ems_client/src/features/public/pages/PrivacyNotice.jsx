import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  KeyRound,
  UserCheck,
  ArrowLeft,
  Clock,
  Mail,
  CheckCircle2
} from 'lucide-react';

export default function PrivacyNotice() {
  const lastUpdated = "October 26, 2026";

  const privacySections = [
    {
      id: "information-collection",
      title: "1. Information We Collect",
      icon: Database,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            We collect only the minimum required data necessary to orchestrate smooth, authenticated, and secure hackathon experiences:
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Personal Details</span>
              <p className="text-slate-600 dark:text-zinc-400">
                Full legal name, email address, contact phone number, institution name, student roll number, and profile/badge photographs.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Team & Project Records</span>
              <p className="text-slate-600 dark:text-zinc-400">
                Team names, member rosters, chosen problem statements, GitHub repository links, pitch decks, and submission videos.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">On-Site Logistics</span>
              <p className="text-slate-600 dark:text-zinc-400">
                Accommodation preferences, meal distribution tokens, QR attendance scans, and lab table assignments.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Technical Analytics</span>
              <p className="text-slate-600 dark:text-zinc-400">
                Browser metadata, IP address for cheat prevention during online quizzes/rounds, and system error diagnostic logs.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "2. How We Use Your Information",
      icon: UserCheck,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            Your data is strictly utilized to operate event infrastructure and power fair evaluations:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li><strong>Badge & Verification:</strong> Generating scannable physical and digital ID badges, team placards, and QR attendance passes.</li>
            <li><strong>Jury Scoring:</strong> Equipping evaluators with submission links and team metadata for rubric grading.</li>
            <li><strong>Event Communication:</strong> Sending critical schedule announcements, round qualification alerts, and prize notifications.</li>
            <li><strong>Food & Logistics:</strong> Ensuring accurate meal verification and hostel accommodation tracking for physical attendees.</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-protection",
      title: "3. Data Security & Encryption",
      icon: Lock,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            Security is paramount in AYOJAN's engineering:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li>User passwords and authentication tokens are salted and hashed with modern cryptographic standards.</li>
            <li>Database transactions and API requests run strictly over SSL/TLS encrypted HTTPS endpoints.</li>
            <li>QR codes encoded onto ID cards contain signed identifier tokens to prevent badge counterfeiting.</li>
          </ul>
        </>
      ),
    },
    {
      id: "sharing",
      title: "4. Third-Party Sharing & Sponsoring",
      icon: Eye,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            <strong>We do not sell personal student data to data brokers.</strong>
          </p>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-zinc-300">
            Data is only shared with verified event organizers hosting the specific competition you registered for, or official corporate sponsors offering recruitment fast-tracks when you explicitly opt-in during team registration.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "5. Your Privacy Rights & Data Control",
      icon: KeyRound,
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            You maintain full rights to inspect, update, or request deletion of your profile data. When an event concludes, participants may request an export of their verified participation records or certificate credentials anytime.
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
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 text-center sm:text-left border-b border-slate-200 dark:border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Data Protection
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Privacy Notice
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl">
            Learn how AYOJAN respects your privacy, safeguards your identity badges, and handles hackathon submission assets.
          </p>
        </div>

        {/* Quick Jump Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
            Quick Navigation
          </p>
          <div className="flex flex-wrap gap-2">
            {privacySections.map((sec) => (
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
          {privacySections.map((section, idx) => {
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

        {/* Security Contact */}
        <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <Lock className="w-4 h-4 text-emerald-500" /> Privacy & Security Officers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              For privacy queries, GDPR/DPA inquiries, or data purge requests, contact our security desk.
            </p>
          </div>
          <a
            href="mailto:privacy@ayojan.live"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer shrink-0"
          >
            Email Privacy Desk
          </a>
        </div>
      </div>
    </div>
  );
}
