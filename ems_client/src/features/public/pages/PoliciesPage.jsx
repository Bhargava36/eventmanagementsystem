import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  ShieldAlert,
  HeartHandshake,
  Utensils,
  BedDouble,
  Award,
  ArrowLeft,
  Clock,
  Mail,
  CheckCircle2,
  AlertOctagon,
  Users
} from 'lucide-react';

export default function PoliciesPage() {
  const lastUpdated = "October 26, 2026";

  const policies = [
    {
      id: "community-code",
      title: "1. Community Guidelines & Anti-Harassment",
      icon: HeartHandshake,
      badge: "Inclusivity",
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            AYOJAN is dedicated to providing a safe, respectful, and empowering hackathon environment for everyone, regardless of gender, sexual orientation, disability, physical appearance, race, ethnicity, or technical experience level.
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li>Harassment, intimidation, offensive verbal comments, or inappropriate physical contact will not be tolerated in any form.</li>
            <li>Online community spaces, team chat boards, and submission comments are continuously monitored. Violators face immediate disqualification and platform exclusion.</li>
            <li>If you experience or witness unacceptable behavior, report it immediately to the on-site event marshals or via the anonymous grievance hotline.</li>
          </ul>
        </>
      ),
    },
    {
      id: "submission-rules",
      title: "2. Project Submission & Round Deadlines",
      icon: Award,
      badge: "Competitions",
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            To ensure parity across participating teams, all competition submissions must adhere strictly to declared timeline checkpoints:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li><strong>Hard Freeze Deadlines:</strong> Code commits and deck uploads submitted after the designated round freeze timer will not be factored into preliminary judging.</li>
            <li><strong>Repository Verification:</strong> Public repositories must include a reproducible README, clear setup instructions, and legitimate commit histories originating within the hackathon window.</li>
            <li><strong>Live Demonstrations:</strong> Finalists must be prepared to present live prototype demos to jury panels upon request. Pre-recorded mockups without working backends will be penalized.</li>
          </ul>
        </>
      ),
    },
    {
      id: "physical-services",
      title: "3. Campus Accommodation & Food Distribution Policy",
      icon: BedDouble,
      badge: "On-Site Logistics",
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            For on-campus physical hackathons, logistical facilities are managed directly through AYOJAN QR tokens:
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <Utensils className="w-4 h-4 text-emerald-500" /> Meal Token Verification
              </h4>
              <p className="text-slate-600 dark:text-zinc-400">
                Breakfast, lunch, and dinner rations are allotted per registered badge. QR scans at cafeteria counters prevent duplicate claims and ensure fair distribution for all attending crafters.
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                <BedDouble className="w-4 h-4 text-emerald-500" /> Hostel Stay Guidelines
              </h4>
              <p className="text-slate-600 dark:text-zinc-400">
                Accommodation allocations are reserved exclusively for approved outstation teams. Attendees must strictly adhere to host institution curfews and campus security protocols.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "disqualification",
      title: "4. Disqualification & Fraud Prevention",
      icon: AlertOctagon,
      badge: "Integrity",
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            Organizers and AYOJAN reserve the right to void team registrations and blacklist participants for:
          </p>
          <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600 dark:text-zinc-300">
            <li>Submitting previously built commercial products or projects entered in other concurrent hackathons without substantial new development.</li>
            <li>Tampering with QR validation codes, cafeteria food logs, or RFID check-in readers.</li>
            <li>Unauthorized substitution of team members after roster freeze without organizer approval.</li>
          </ul>
        </>
      ),
    },
    {
      id: "refunds",
      title: "5. Fee & Cancellation Policies",
      icon: FileText,
      badge: "Financial",
      content: (
        <>
          <p className="leading-relaxed text-slate-600 dark:text-zinc-300">
            <strong>100% Free for Students:</strong> AYOJAN does not levy entry fees on student participants for standard platform hackathons.
          </p>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-zinc-300">
            Where institutional organizers levy third-party kit fees or nominal security deposits for physical equipment, refund processing and cancellation requests are governed exclusively by that institution’s finance committee as noted on the event registration brochure.
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
            <ShieldAlert className="w-3.5 h-3.5" />
            Platform Standards
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Policies & Code of Conduct
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl">
            Our guiding principles, venue safety standards, meal token rules, and submission protocols for all crafters and organizers.
          </p>
        </div>

        {/* Quick Jump Bar */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
            Policies Index
          </p>
          <div className="flex flex-wrap gap-2">
            {policies.map((pol) => (
              <a
                key={pol.id}
                href={`#${pol.id}`}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-zinc-700 transition shadow-2xs"
              >
                {pol.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {policies.map((policy, idx) => {
            const IconComponent = policy.icon;
            return (
              <motion.section
                id={policy.id}
                key={policy.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {policy.title}
                    </h2>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                    {policy.badge}
                  </span>
                </div>
                <div className="text-sm leading-relaxed">{policy.content}</div>
              </motion.section>
            );
          })}
        </div>

        {/* Grievance & Reporting Section */}
        <div className="p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <ShieldAlert className="w-4 h-4 text-emerald-500" /> Grievance & Conduct Hotline
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Need to report a policy breach, code plagiarism, or on-site harassment incident?
            </p>
          </div>
          <a
            href="mailto:grievance@ayojan.live"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer shrink-0"
          >
            File Confidential Report
          </a>
        </div>
      </div>
    </div>
  );
}
