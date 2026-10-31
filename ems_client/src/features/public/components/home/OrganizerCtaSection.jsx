"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Check,
  ArrowRight,
  Sparkles,
  QrCode,
  ScanLine,
  Sliders,
  Radio,
  ShieldCheck,
  Zap,
  Building2,
  Users2,
  Clock,
  Send,
  Lock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function OrganizerCtaSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, margin: "-60px" });

  // Mouse tracking for ambient laser glow
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // Station 1: Turnstile Gate Scan Simulator State
  const [scanCount, setScanCount] = useState(148);
  const [isScanning, setIsScanning] = useState(false);
  const [recentPass, setRecentPass] = useState({
    name: "Arjun Verma",
    roll: "22A91A0582",
    track: "AI & Neural Systems",
    status: "PASS_VERIFIED",
  });

  const triggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    const mockNames = [
      { name: "Sneha Reddy", roll: "22A91A05F4", track: "Fullstack Cloud" },
      { name: "Rohit Nair", roll: "22A91A0512", track: "Cybersecurity" },
      { name: "Pooja Sharma", roll: "22A91A0599", track: "FinTech & Web3" },
      { name: "Kiran Kumar", roll: "22A91A0536", track: "Open Innovation" },
    ];
    const picked = mockNames[Math.floor(Math.random() * mockNames.length)];
    setTimeout(() => {
      setScanCount((prev) => prev + 1);
      setRecentPass({ ...picked, status: "PASS_VERIFIED" });
      setIsScanning(false);
    }, 450);
  };

  // Station 2: Live Jury Rubric Interactive Sliders State
  const [scores, setScores] = useState({
    tech: 94,
    ux: 90,
    impact: 95,
  });
  const compositeScore = (
    (scores.tech * 0.4 + scores.ux * 0.3 + scores.impact * 0.3)
  ).toFixed(1);

  // Station 3: Emergency Dispatch & Broadcast Simulator State
  const [dispatchLog, setDispatchLog] = useState([
    {
      id: 1,
      title: "Round 2 Shortlist Published",
      time: "2m ago",
      channel: "SMS + Push + Portal",
    },
    {
      id: 2,
      title: "Mentorship Lab 03 Doors Open",
      time: "8m ago",
      channel: "Digital Displays",
    },
    {
      id: 3,
      title: "Hostel Meal Tokens Activated",
      time: "24m ago",
      channel: "Turnstile Badge",
    },
  ]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const triggerBroadcast = () => {
    if (isBroadcasting) return;
    setIsBroadcasting(true);
    setTimeout(() => {
      setDispatchLog((prev) => [
        {
          id: Date.now(),
          title: "Flash Notice: Jury Evaluation Commenced",
          time: "Just now",
          channel: "Omni-Channel Broadcast",
        },
        ...prev.slice(0, 2),
      ]);
      setIsBroadcasting(false);
    }, 500);
  };

  // Database Stats
  const [stats, setStats] = useState({
    eventsCount: 6,
    collegesCount: 4,
    buildersCount: 44,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      const endpoints = [
        `${API_BASE_URL}/api/events/public-stats`,
        "/api/events/public-stats",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data?.stats && isMounted) {
              setStats({
                eventsCount: Math.max(1, Number(data.stats.eventsCount || 6)),
                collegesCount: Math.max(1, Number(data.stats.collegesCount || 4)),
                buildersCount: Math.max(1, Number(data.stats.buildersCount || 44)),
              });
              return;
            }
          }
        } catch {}
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="command"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full py-32 sm:py-32 overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300"
    >
      {/* ======================================================== */}
      {/* 1. EDGE-TO-EDGE AMBIENT HORIZON & GLOWING MATRIX         */}
      {/* ======================================================== */}
      
      {/* Top 100% Width Laser Horizon Accent Line */}
     
      {/* Interactive Cursor Spotlight (spans edge to edge across entire screen) */}
      {/* <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 opacity-60 dark:opacity-80"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}% ${mousePos.y}%, rgba(16, 185, 129, 0.12), transparent 45%)`,
        }}
      /> */}

      {/* Subtle Perspective Cyber Grid Background */}
      {/* <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      /> */}

      {/* Ambient Radial Depth Lights */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* ======================================================== */}
      {/* 2. CENTER STAGE: MONUMENTAL CINEMATIC HERO CTA           */}
      {/* ======================================================== */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Grand Headline with Cinematic Blur Reveal */}
        <motion.h2
          initial={{ opacity: 0, y: 25, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white"
        >
          Scale Your Next Event <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200">
            From Concept to Crowds.
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed font-normal"
        >
          The authoritative operating system engineered for university chapters, tech clubs, and enterprise hosts. Automate participant registrations, issue NFC-compatible gate passes, coordinate hostel lodging, and execute multi-round jury scoring on one unified bridge.
        </motion.p>

        {/* High-Impact Conversion Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3"
        >
          <Link
            to="/admin/register"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 group"
          >
            <span>Create Your Event</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/admin/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full border border-slate-300 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-800 dark:text-white font-semibold text-sm tracking-wide backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
          >
            Organizer Portal Sign In
          </Link>
        </motion.div>

        {/* Key Operational Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-600 dark:text-zinc-400"
        >
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>100% Free for Student Chapters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>Instant Digital ID Badge Generator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>Zero-Variance Rubric Consensus</span>
          </div>
        </motion.div>

      </div>

      {/* ======================================================== */}
      {/* 3. FULL-WIDTH PANORAMIC 3-STATION INTERACTIVE COCKPIT    */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        
        {/* Terminal Header Bar with Animated Node Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between pb-4 border-b border-slate-300 dark:border-white/10 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase">
              AYOJAN MISSION CONTROL // INTERACTIVE LAB
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>SYSTEMS NOMINAL</span>
          </div>
        </motion.div>

        {/* 3 Full-Width Side-by-Side Interactive Terminals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20 sm:gap-8">
          
          {/* -------------------------------------------------------- */}
          {/* TERMINAL 01: Turnstile Gate QR Scanner Simulation        */}
          {/* -------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 50, x: -30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white/95 dark:bg-[#070c14]/90 border border-slate-200 dark:border-white/10 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-colors duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Station 01: Turnstile Scanner
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  GATE B-02
                </span>
              </div>

              {/* Simulated ID Card with Laser Scanner */}
              <div className="relative rounded-xl bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-white/10 p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                  <span>TOKEN ID #8921-AYO</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {recentPass.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 py-3">
                  <div className="relative w-16 h-16 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    <QrCode className="w-full h-full text-slate-800 dark:text-white opacity-85" />
                    {/* Laser Scanner Beam */}
                    <motion.div
                      animate={{ y: [-24, 24] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {recentPass.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                      {recentPass.roll}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                      {recentPass.track}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  <span>Throughput: 0.14s</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {scanCount} Passed
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <button
                onClick={triggerScan}
                disabled={isScanning}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isScanning ? "Verifying Token..." : "Simulate Live Gate Check-in"}</span>
              </button>
            </div>
          </motion.div>

          {/* -------------------------------------------------------- */}
          {/* TERMINAL 02: Interactive Jury Rubric Consensus Engine    */}
          {/* -------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.94, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white/95 dark:bg-[#070c14]/90 border border-slate-200 dark:border-white/10 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-colors duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Station 02: Jury Consensus
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block">
                    Composite
                  </span>
                  <span className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {compositeScore}/100
                  </span>
                </div>
              </div>

              {/* Interactive Scoring Sliders */}
              <div className="space-y-3 rounded-xl bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-white/10 p-4">
                {/* Criterion 1: Technical Rigor */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-zinc-300">Technical Rigor (40%)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scores.tech}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={scores.tech}
                    onChange={(e) => setScores({ ...scores, tech: Number(e.target.value) })}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Criterion 2: Architecture & UX */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-zinc-300">Architecture &amp; UX (30%)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scores.ux}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={scores.ux}
                    onChange={(e) => setScores({ ...scores, ux: Number(e.target.value) })}
                    className="w-full accent-teal-500 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Criterion 3: Practical Impact */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-zinc-300">Practical Feasibility (30%)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scores.impact}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={scores.impact}
                    onChange={(e) => setScores({ ...scores, impact: Number(e.target.value) })}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 border-t border-slate-200 dark:border-white/10">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Blind Jury Sealed
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Hash: #9A2C-VERIFIED
              </span>
            </div>
          </motion.div>

          {/* -------------------------------------------------------- */}
          {/* TERMINAL 03: Omni-Channel Live Emergency Broadcast Dispatch */}
          {/* -------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 50, x: 30, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white/95 dark:bg-[#070c14]/90 border border-slate-200 dark:border-white/10 p-6 shadow-xl backdrop-blur-md flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 transition-colors duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Station 03: Event Announcer
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Simulated Live Broadcast Queue */}
              <div className="space-y-2.5 rounded-xl bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-white/10 p-3.5">
                {dispatchLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-white/5 space-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {log.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                        {log.time}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      Target: {log.channel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-2">
              <button
                onClick={triggerBroadcast}
                disabled={isBroadcasting}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs tracking-wide transition-all hover:bg-slate-800 dark:hover:bg-zinc-200 shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? "Transmitting..." : "Send Test Flash Broadcast"}</span>
              </button>
            </div>
          </motion.div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. EDGE-TO-EDGE 100% WIDTH CONTINUOUS TELEMETRY TICKER    */}
      {/* ======================================================== */}
      

    </section>
  );
}
