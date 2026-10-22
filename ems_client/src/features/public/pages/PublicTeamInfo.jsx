import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import useTheme from '../../../Hooks/useTheme';
import { getEventTheme, isSoloTeamSize } from '../../../lib/utils';
import {
  Users,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Check,
  Printer,
  ExternalLink,
  ShieldCheck,
  Building2,
  Cpu,
  FileText,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Trophy,
  QrCode,
  Tag,
  Share2,
  Mail,
  Phone,
  Crown
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function PublicTeamInfo() {
  const { teamId } = useParams();
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const [teamData, setTeamData] = useState(null);
  const [members, setMembers] = useState([]);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedRoundId, setExpandedRoundId] = useState(null);

  // Fetch Public Team Information
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch public team info
        const res = await fetch(`http://localhost:3000/api/teams/public/${teamId}`);
        const data = await res.json();

        if (!res.ok || !data.team) {
          throw new Error(data.message || 'Team pass not found');
        }

        setTeamData(data.team);
        setMembers(data.members || []);

        // 2. Fetch published evaluation results (if published by organizer)
        try {
          const evalRes = await fetch(`http://localhost:3000/api/evaluators/teams/${teamId}/published-results`);
          if (evalRes.ok) {
            const evalJson = await evalRes.json();
            if (evalJson.success && evalJson.data) {
              setEvaluationResults(evalJson.data);
              if (evalJson.data.publishedRounds && evalJson.data.publishedRounds.length > 0) {
                setExpandedRoundId(evalJson.data.publishedRounds[0].roundId);
              }
            }
          }
        } catch (evalErr) {
          console.warn('Could not fetch evaluation results:', evalErr);
        }

      } catch (err) {
        console.error('Error fetching public team info:', err);
        setError(err.message || 'Failed to load team credentials');
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchPublicData();
    }
  }, [teamId]);

  // Derived event theme and flags
  const theme = useMemo(() => getEventTheme(teamData, isDark), [teamData, isDark]);

  const isIndividual = useMemo(() => {
    if (!teamData) return false;
    return isSoloTeamSize(teamData.TeamSize) || isSoloTeamSize(teamData.EventTeamSize);
  }, [teamData]);

  const displayName = useMemo(() => {
    if (!teamData) return '';
    if (isIndividual) {
      const lead = members.find((m) => String(m.Role).toLowerCase() === 'teamlead') || members[0];
      return lead?.UserName || teamData.TeamName?.replace(/\s*\(Individual\)/gi, '') || 'Participant';
    }
    return teamData.TeamName || 'Team';
  }, [teamData, isIndividual, members]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard && shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract clean 2-letter initials
  const getInitials = (name = '') => {
    if (!name) return 'M';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Skeleton Loader that matches the theme of PublicEventDetails
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-28 sm:pt-32 pb-24 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 rounded-lg bg-slate-200 dark:bg-zinc-900" />
            <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-zinc-900" />
          </div>

          {/* Pass Card Skeleton */}
          <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="h-10 w-3/4 rounded-xl bg-slate-200 dark:bg-zinc-900" />
                <div className="h-5 w-1/2 rounded-lg bg-slate-200 dark:bg-zinc-900" />
              </div>
              <div className="w-32 h-32 rounded-2xl bg-slate-200 dark:bg-zinc-900 shrink-0" />
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="h-12 rounded-xl bg-slate-100 dark:bg-zinc-900/60" />
              <div className="h-12 rounded-xl bg-slate-100 dark:bg-zinc-900/60" />
              <div className="h-12 rounded-xl bg-slate-100 dark:bg-zinc-900/60" />
              <div className="h-12 rounded-xl bg-slate-100 dark:bg-zinc-900/60" />
            </div>
          </div>

          {/* Member Profiles Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-56 rounded-3xl bg-slate-200 dark:bg-zinc-900" />
            <div className="h-56 rounded-3xl bg-slate-200 dark:bg-zinc-900" />
            <div className="h-56 rounded-3xl bg-slate-200 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  // Error State matching website theme
  if (error || !teamData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-32 pb-24 flex items-center justify-center px-4 transition-colors">
        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Team Pass Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {error || 'This team registration credentials could not be found or has expired.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/events"
              style={{ backgroundColor: theme.buttonBg, color: theme.buttonText }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all hover:opacity-90"
            >
              <ArrowLeft className="w-4 h-4" />
              Explore Events
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-28 sm:pt-32 pb-24 transition-colors duration-300">
      {/* Print-specific style override */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; background: white !important; color: black !important; }
        }
      `}} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10"
      >
        {/* Navigation Breadcrumb & Action Toolbar */}
        <motion.div
          variants={itemVariants}
          className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium overflow-x-auto py-1">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 font-medium transition-colors hover:opacity-80 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Events
            </Link>
            <span>/</span>
            {teamData.EventId && (
              <>
                <Link
                  to={`/events/${teamData.EventId}`}
                  className="hover:opacity-80 transition-opacity truncate max-w-[180px] sm:max-w-xs shrink-0"
                >
                  {teamData.EventName || 'Event Details'}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-800 dark:text-zinc-200 font-semibold truncate shrink-0">
              {displayName}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-zinc-700 transition-all shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  <span className="font-semibold" style={{ color: theme.accent }}>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>

          
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* OFFICIAL EVENT HERO PASS (WITH EVENT THEME COLORS) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="print-card relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl"
          style={{ borderColor: theme.cardBorder }}
        >
          {/* Top Edge Color Accent Line */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary || theme.accent}, ${theme.primary})`
            }}
          />

          {/* Ambient Theme Gradient Highlights */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 opacity-20"
            style={{
              background: `radial-gradient(circle, ${theme.primary} 0%, transparent 70%)`
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16 opacity-15"
            style={{
              background: `radial-gradient(circle, ${theme.secondary || theme.accent} 0%, transparent 70%)`
            }}
          />

          {/* Top Pass Header Banner */}
          <div className="relative z-10 p-6 sm:p-8 lg:p-10 border-b border-slate-100 dark:border-zinc-800/80 bg-gradient-to-b from-slate-50/60 dark:from-zinc-900/40 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                {/* Team / Participant Title */}
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {displayName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 font-medium">
                    {isIndividual ? 'Individual Competitor Official Registration' : 'Team Pass & Credential Verification Record'}
                    {teamData.TeamId && (
                      <span className="ml-2 font-mono font-semibold" style={{ color: theme.accent }}>
                        • #{teamData.TeamId}
                      </span>
                    )}
                  </p>
                </div>

                {/* Event & Location Meta Strip (Sparkles removed) */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-600 dark:text-zinc-300 pt-1">
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: theme.accent }}>
                    <span>{teamData.EventName || 'Hackathon Event'}</span>
                  </span>

                  {teamData.ParticipationMode && (
                    <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                      <span>•</span>
                      <span>{teamData.ParticipationMode} Track</span>
                    </span>
                  )}

                  {teamData.College && (
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{teamData.College}</span>
                    </span>
                  )}

                  {teamData.State && (
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{teamData.State}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* QR Code Presentation Box (Download and save buttons removed, scan-only) */}
              <div className="shrink-0 flex flex-col items-center sm:items-end">
                <div
                  className="p-3.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border flex flex-col items-center justify-center transition-all duration-200"
                  style={{ borderColor: theme.badgeBorder }}
                >
                  <QRCodeSVG
                    value={shareUrl}
                    size={120}
                    level="H"
                    includeMargin={false}
                    bgColor={isDark ? '#18181b' : '#ffffff'}
                    fgColor={isDark ? '#ffffff' : '#000000'}
                  />
                  <div
                    className="mt-2.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: theme.accent }}
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Team #{teamData.TeamId}</span>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mt-2">
                  Scan for check-in & scores
                </span>
              </div>
            </div>
          </div>

          {/* Key Event Metrics Strip */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Event Date
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                  {teamData.StartDate ? new Date(teamData.StartDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
              >
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Venue
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 truncate" title={teamData.Location}>
                  {teamData.Location || 'Campus Hub'}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
              >
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  {isIndividual ? 'Registration Type' : 'Team Members'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                  {isIndividual ? 'Solo Participant' : `${members.length || teamData.TeamSize || 'Team'} Members`}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Pass Status
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <p
                    className="text-xs sm:text-sm font-bold capitalize truncate"
                    style={{ color: theme.accent }}
                  >
                    {teamData.RegistrationStatus || 'Approved'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* DETAILED TEAM MEMBERS PROFILES (WITH PHOTOS & RICH DETAILS) */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
              >
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isIndividual ? 'Participant Profile' : 'Team Member Profiles'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {isIndividual
                    ? 'Verified individual competitor credentials & affiliation'
                    : `Official squad roster featuring ${members.length} verified participant${members.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto border"
              style={{
                backgroundColor: theme.badgeBg,
                borderColor: theme.badgeBorder,
                color: theme.badgeText
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isIndividual ? 'Solo Competitor' : `${members.length} Squad Members Confirmed`}</span>
            </span>
          </div>

          {/* Members Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, idx) => {
              const isLead = String(member.Role).toLowerCase() === 'teamlead' || (idx === 0 && isIndividual);

              return (
                <motion.div
                  key={member.Id || member.UserId || idx}
                  variants={itemVariants}
                  className="relative rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  style={{
                    borderColor: isLead ? theme.badgeBorder : undefined
                  }}
                >
                  {/* Decorative Banner Header */}
                  <div
                    className="relative h-28 sm:h-32 w-full p-4 flex items-start justify-between overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}25 0%, ${theme.secondary || theme.accent}12 100%)`
                    }}
                  >
                    {/* Subtle banner glow */}
                    <div
                      className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
                      style={{ backgroundColor: theme.primary }}
                    />

                    {/* Verified Tag on Top-Left */}
                    <span className="relative z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Verified</span>
                    </span>

                    {/* Role Pill on Top-Right */}
                    <span
                      className="relative z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-2xs"
                      style={{
                        backgroundColor: isLead ? theme.primary : undefined,
                        color: isLead ? theme.buttonText : undefined
                      }}
                    >
                      {isLead ? (
                        <>
                          <Crown className="w-3.5 h-3.5" />
                          <span>Team Lead</span>
                        </>
                      ) : (
                        <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-slate-700 dark:text-zinc-300 border border-slate-200/50 dark:border-zinc-800 font-semibold text-[11px]">
                          Member #{idx + 1}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Centered Elevated Avatar (Bigger & Prominent) */}
                      <div className="relative mx-auto -mt-14 sm:-mt-16 mb-3.5 w-26 h-26 sm:w-28 sm:h-28 rounded-full ring-4 sm:ring-[5px] ring-white dark:ring-zinc-950 shadow-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                        {member.Photo ? (
                          <img
                            src={member.Photo}
                            alt={member.UserName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center font-black text-2xl sm:text-3xl text-white tracking-wider select-none shadow-inner"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary || theme.accent})`
                            }}
                          >
                            {getInitials(member.UserName)}
                          </div>
                        )}
                      </div>

                      {/* Member Name */}
                      <h4
                        className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white text-center tracking-tight truncate px-2"
                        title={member.UserName}
                      >
                        {member.UserName}
                      </h4>

                      {/* College & State Subtitle */}
                      <p
                        className="text-xs font-medium text-slate-500 dark:text-zinc-400 text-center mt-1 truncate px-2"
                        title={member.College || teamData.College}
                      >
                        {member.College || teamData.College || 'Institution'}
                        {(member.Location || member.State || teamData.State) && (
                          <span className="text-slate-400 dark:text-zinc-500">
                            {' '}• {[member.Location, member.State || teamData.State].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </p>

                      {/* Micro Tags Strip */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                        {member.Gender && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                            {member.Gender}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                          {teamData.ParticipationMode || 'Physical'} Track
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                          Pass #{teamData.TeamId}
                        </span>
                      </div>
                    </div>

                    {/* Quick Action Contact Strip */}
                    <div className="pt-2 flex items-center gap-2">
                      {member.Email && (
                        <a
                          href={`mailto:${member.Email}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 shadow-2xs hover:opacity-90 truncate cursor-pointer"
                          style={{
                            backgroundColor: theme.buttonBg,
                            color: theme.buttonText,
                            borderColor: theme.border
                          }}
                          title={`Email ${member.UserName}`}
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{member.Email}</span>
                        </a>
                      )}

                      {member.Mobile && (
                        <a
                          href={`tel:${member.Mobile}`}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors shadow-2xs shrink-0 cursor-pointer"
                          title={`Call ${member.Mobile}`}
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{member.Mobile}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta Bar */}
                  <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{member.CreatedAt ? `Joined ${new Date(member.CreatedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : 'Confirmed'}</span>
                    </span>
                    <span className="font-semibold text-slate-600 dark:text-zinc-400">
                      {isLead ? 'Lead Credential' : 'Member Credential'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* DETAILS SECTION: PROBLEM STATEMENT & SCORES */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Problem Statement Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: theme.accent }} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Selected Problem Statement
                </h3>
              </div>

              {teamData.ProblemCode && (
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border"
                  style={{
                    backgroundColor: theme.badgeBg,
                    borderColor: theme.badgeBorder,
                    color: theme.badgeText
                  }}
                >
                  {teamData.ProblemCode}
                </span>
              )}
            </div>

            {teamData.ProblemStatement ? (
              <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-normal">
                {teamData.ProblemStatement}
              </p>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800 text-center">
                <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                  General Track • Problem statement assigned on-site by event organizers.
                </p>
              </div>
            )}

            {teamData.Tech_Stack && (
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <Cpu className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                  <span>Technologies & Frameworks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teamData.Tech_Stack.split(',').map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 shadow-2xs"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Official Scores & Results */}
          <motion.div variants={itemVariants}>
            {evaluationResults && evaluationResults.publishedRounds && evaluationResults.publishedRounds.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" style={{ color: theme.accent }} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Evaluation Scorecard
                    </h3>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                    style={{
                      backgroundColor: theme.badgeBg,
                      borderColor: theme.badgeBorder,
                      color: theme.badgeText
                    }}
                  >
                    Published Results
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Total Score
                    </p>
                    <p
                      className="text-2xl font-black mt-1"
                      style={{ color: theme.statNumberColor || theme.accent }}
                    >
                      {evaluationResults.totalPublishedScore ?? evaluationResults.cumulativeScore ?? '0'}
                      <span className="text-xs text-slate-400 font-normal">
                        {' '}/ {evaluationResults.totalPublishedMaxMarks ?? evaluationResults.maxPossibleScore ?? '100'}
                      </span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Current Rank
                    </p>
                    <p className="text-2xl font-black mt-1" style={{ color: theme.accent }}>
                      {(evaluationResults.isOverallPublished || evaluationResults.overallPublished) && (evaluationResults.overallRank || evaluationResults.rank) ? (
                        <span>
                          #{evaluationResults.overallRank || evaluationResults.rank}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
                          Evaluated
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Rounds Graded
                    </p>
                    <p
                      className="text-2xl font-black mt-1"
                      style={{ color: theme.statNumberColor || theme.accent }}
                    >
                      {evaluationResults.publishedRounds.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {evaluationResults.publishedRounds.map((rnd) => {
                    const isExpanded = expandedRoundId === rnd.roundId;
                    const roundScore = rnd.score !== undefined && rnd.score !== null 
                      ? rnd.score 
                      : (rnd.averageScore !== undefined && rnd.averageScore !== null ? rnd.averageScore : '-');
                    const reviewerList = rnd.submissions || rnd.evaluations || [];

                    return (
                      <div
                        key={rnd.roundId}
                        className="rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50/60 dark:bg-zinc-900/30"
                      >
                        <div
                          onClick={() => setExpandedRoundId(isExpanded ? null : rnd.roundId)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border shadow-2xs"
                              style={{
                                backgroundColor: theme.subtleBg,
                                color: theme.accent,
                                borderColor: theme.badgeBorder
                              }}
                            >
                              {rnd.roundOrder}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {rnd.roundName}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                                Max Marks: {rnd.maxMarks} pts {reviewerList.length > 0 ? `• ${reviewerList.length} Reviewer${reviewerList.length > 1 ? 's' : ''}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold" style={{ color: theme.accent }}>
                              {roundScore} / {rnd.maxMarks}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 space-y-4">
                            {/* Question Rubric Breakdown */}
                            {rnd.questions && rnd.questions.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                  Scoring Rubric Breakdown
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {rnd.questions.map((q, qIdx) => (
                                    <div
                                      key={q.Id || qIdx}
                                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between gap-2"
                                    >
                                      <span className="truncate text-slate-700 dark:text-zinc-300 font-medium" title={q.QuestionText}>
                                        {q.QuestionText}
                                      </span>
                                      <span className="font-bold shrink-0" style={{ color: theme.accent }}>
                                        {q.marksAwarded !== undefined && q.marksAwarded !== null ? q.marksAwarded : '-'} / {q.MaxMarks}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reviewer Details */}
                            {reviewerList.length > 0 && (
                              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                  Evaluator Reviews ({reviewerList.length})
                                </p>
                                {reviewerList.map((ev, evIdx) => (
                                    <div
                                      key={ev.scoreId || evIdx}
                                      className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-2.5"
                                    >
                                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        <span className="flex items-center gap-1.5">
                                          <span
                                            className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px]"
                                            style={{ backgroundColor: theme.iconBg, color: theme.iconColor }}
                                          >
                                            {evIdx + 1}
                                          </span>
                                          <span>{ev.evaluatorName || `Reviewer #${evIdx + 1}`}</span>
                                          {ev.evaluatorRole && (
                                            <span className="text-[11px] font-normal text-slate-400 dark:text-zinc-500">
                                              ({ev.evaluatorRole})
                                            </span>
                                          )}
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                          {ev.totalScore} / {rnd.maxMarks} pts
                                        </span>
                                      </div>

                                      {ev.scoresData && ev.scoresData.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                          {ev.scoresData.map((q, qIdx) => (
                                            <div
                                              key={qIdx}
                                              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2"
                                            >
                                              <span className="truncate text-slate-600 dark:text-zinc-400 text-[11px]" title={q.questionText}>
                                                {q.questionText}
                                              </span>
                                              <span className="font-bold shrink-0 text-[11px]" style={{ color: theme.accent }}>
                                                {q.marks} / {q.maxMarks}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {ev.feedback && (
                                        <p className="text-xs italic text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                                          "{ev.feedback}"
                                        </p>
                                      )}
                                    </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex items-center gap-4 shadow-sm">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: theme.iconBg,
                    color: theme.iconColor,
                    borderColor: theme.badgeBorder
                  }}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Evaluation in Progress
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Jury evaluations and round results will appear here once finalized by organizers.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Official Footer Note & Event Link */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" style={{ color: theme.accent }} />
            <span>Official Event Registration Pass • Verified Entry Credentials</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            {teamData.EventId && (
              <>
                <Link
                  to={`/events/${teamData.EventId}`}
                  className="hover:opacity-80 transition-opacity font-semibold"
                  style={{ color: theme.accent }}
                >
                  View Event Details
                </Link>
                <span>•</span>
              </>
            )}
            <Link to="/events" className="hover:opacity-80 transition-opacity">
              Explore Events
            </Link>
            <span>•</span>
            <Link to="/" className="hover:opacity-80 transition-opacity">
              Hack_Hub Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
