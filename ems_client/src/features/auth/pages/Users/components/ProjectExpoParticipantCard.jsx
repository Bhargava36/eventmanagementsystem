import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../../Hooks/useToast';
import UnifiedEventFeedbackCard from './UnifiedEventFeedbackCard';
import {
  QrCode,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FolderGit2,
  Globe,
  Upload,
  Trophy,
  Award,
  Download,
  ExternalLink,
  Edit2,
  Loader2,
  Info,
  Check,
  Copy,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  X
} from 'lucide-react';
export default function ProjectExpoParticipantCard({ eventId, team, user }) {
  const toast = useToast();
  const teamId = team?.Id || team?.id || team?.TeamId;
  const userId = user?.Id || user?.id;
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [expoConfig, setExpoConfig] = useState(null);
  const [results, setResults] = useState([]);
  const [publishedEvaluation, setPublishedEvaluation] = useState(null);
  const [expandedRoundIds, setExpandedRoundIds] = useState({});
  const [selectedResultTab, setSelectedResultTab] = useState('all'); // 'all' | roundId | 'overall'
  const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'project' | 'guidelines' | 'results' | 'feedback'

  // Submission edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    ProjectTitle: '',
    ProblemStatement: '',
    Abstract: '',
    ProposedSolution: '',
    TechnologiesUsed: '',
    GithubRepoUrl: '',
    LiveDemoUrl: '',
    PptUrl: '',
    DocumentationUrl: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const toggleRoundExpand = (roundId) => {
    setExpandedRoundIds((prev) => ({
      ...prev,
      [roundId]: !prev[roundId]
    }));
  };

  const loadExpoData = useCallback(async () => {
    if (!eventId || !teamId) return;
    try {
      setLoading(true);
      const [subRes, cfgRes, resRes, evalRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/submissions/${teamId}`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/config`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/results`),
        fetch(`${API_BASE_URL}/api/evaluators/teams/${teamId}/published-results`)
      ]);
      const subData = await subRes.json();
      const cfgData = await cfgRes.json();
      const resData = await resRes.json();

      if (subData.success && subData.submission) {
        setSubmission(subData.submission);
        setEditForm({
          ProjectTitle: subData.submission.ProjectTitle || '',
          ProblemStatement: subData.submission.ProblemStatement || '',
          Abstract: subData.submission.Abstract || '',
          ProposedSolution: subData.submission.ProposedSolution || '',
          TechnologiesUsed: subData.submission.TechnologiesUsed || '',
          GithubRepoUrl: subData.submission.GithubRepoUrl || '',
          LiveDemoUrl: subData.submission.LiveDemoUrl || '',
          PptUrl: subData.submission.PptUrl || '',
          DocumentationUrl: subData.submission.DocumentationUrl || ''
        });
      }
      if (cfgData.success && cfgData.config) {
        setExpoConfig(cfgData.config);
      }
      if (resData.success && Array.isArray(resData.results)) {
        setResults(resData.results);
      }
      if (evalRes.ok) {
        const evalJson = await evalRes.json();
        if (evalJson.success && evalJson.data) {
          setPublishedEvaluation(evalJson.data);
          if (evalJson.data.publishedRounds && evalJson.data.publishedRounds.length > 0) {
            setExpandedRoundIds({ [evalJson.data.publishedRounds[0].roundId]: true });
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load expo participant details:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, teamId]);
  useEffect(() => {
    loadExpoData();
  }, [loadExpoData]);
  const isOverallPublished = Boolean(
    publishedEvaluation?.isOverallPublished || publishedEvaluation?.overallPublished
  );

  const publishedRounds = useMemo(() => {
    return publishedEvaluation?.publishedRounds || [];
  }, [publishedEvaluation]);

  const officialWinners = useMemo(() => {
    if (!isOverallPublished || !Array.isArray(results)) return [];
    return results.filter((r) => r.IsPublished === 1 || isOverallPublished).slice(0, 3);
  }, [isOverallPublished, results]);

  const teamWinnerRecord = useMemo(() => {
    if (!isOverallPublished || !officialWinners.length || !teamId) return null;
    return officialWinners.find((r) => String(r.TeamId) === String(teamId));
  }, [isOverallPublished, officialWinners, teamId]);
  const qrPassValue = useMemo(() => {
    return `EXPO-PASS-EV${eventId}-TM${teamId}-US${userId}-${submission?.BoothNumber || 'STALL-TBD'}`;
  }, [eventId, teamId, userId, submission]);
  const handleSaveSubmission = async (e) => {
    e.preventDefault();
    if (!eventId || !teamId) return;
    try {
      setSavingEdit(true);
      const payload = {
        ...editForm,
        TeamId: teamId,
        SubmittedByUserId: userId
      };
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update project deliverables');
      toast.success('Project details and deliverables updated');
      setShowEditModal(false);
      await loadExpoData();
    } catch (err) {
      toast.error(err.message || 'Error updating deliverables');
    } finally {
      setSavingEdit(false);
    }
  };
  const handleCopyPass = () => {
    navigator.clipboard.writeText(qrPassValue);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };
  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-center">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading your project exhibition dashboard...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* ── TOP HERO CARD: STALL & SCHEDULE BANNER ── */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Project Expo Exhibitor
            </span>
            {submission?.Status && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  submission.Status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : submission.Status === 'CHANGES_REQUESTED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {submission.Status.replace('_', ' ')}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {submission?.ProjectTitle || team?.TeamName}
          </h2>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            {submission?.DomainName && (
              <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                {submission.DomainName}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Stall: <strong className="text-emerald-600 dark:text-emerald-400">{submission?.BoothNumber || 'Pending Allocation'}</strong>
            </span>
            {submission?.PresentationStartTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Demo: <strong className="text-gray-800 dark:text-gray-200">{submission.PresentationStartTime} - {submission.PresentationEndTime}</strong>
              </span>
            )}
          </div>
        </div>
        {teamWinnerRecord && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 text-center shrink-0">
            <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
              {teamWinnerRecord.Category}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Score: {teamWinnerRecord.TotalScore}
            </span>
          </div>
        )}
      </div>
      {/* ── NAVIGATION TABS ── */}
      <div className="relative pt-2">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-zinc-800 pointer-events-none z-0" />
        <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none z-10 -mb-px">
          {[
            { id: 'pass', label: 'QR Entry & Stall Pass', icon: QrCode },
            { id: 'project', label: 'Deliverables & Abstract', icon: FileText },
            {
              id: 'results',
              label: 'Evaluation Results & Scorecards',
              icon: Trophy,
              badge: Boolean(teamWinnerRecord) || ((publishedEvaluation?.publishedRounds || []).length > 0) || Boolean(publishedEvaluation?.isOverallPublished) ? 'Live Results' : null
            },
            { id: 'guidelines', label: 'Exhibition Guidelines', icon: Info },
            { id: 'feedback', label: 'Event Feedback', icon: CheckCircle2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative h-11 px-4 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
              >
                {isActive ? (
                  <motion.div
                    layoutId="projectExpoParticipantTabActive"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                )}
                <span
                  className={`relative z-30 flex items-center gap-2 ${
                    isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* ── TAB 1: QR ENTRY & STALL PASS ── */}
      {activeTab === 'pass' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* QR Code Pass Card */}
          <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm text-center flex flex-col items-center justify-between">
            <div className="w-full">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block mb-1">
                Official Exhibitor Pass
              </span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {team?.TeamName}
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Scan at entry & booth verification
              </p>
              <div className="my-6 p-4 rounded-2xl bg-white border border-gray-200 dark:border-gray-800 inline-block shadow-xs">
                <QRCodeSVG
                  value={qrPassValue}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="p-2 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="font-mono text-gray-500 dark:text-gray-400 truncate max-w-[170px]">
                  {submission?.BoothNumber || 'STALL-TBD'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyPass}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
              Present this digital pass at the registration desk for venue check-in.
            </p>
          </div>
          {/* Exhibition Stall & Schedule Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Allocated Exhibition Stall
              </h3>
              {submission?.BoothNumber ? (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-start justify-between">
                  <div>
                    <span className="text-xs text-gray-400">Assigned Stall Number:</span>
                    <h4 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {submission.BoothNumber}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Location: <strong>{submission.BoothZone || 'Exhibition Hall A'}</strong>
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Verified Ready
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ Stall allocation is currently in progress. Your stall number will appear here once allocated by event organizers.
                </div>
              )}
              {/* Presentation Demo Slot */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2 pt-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Jury Demonstration Schedule
              </h3>
              {submission?.PresentationStartTime ? (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Reporting Date:</span>
                    <strong className="text-gray-900 dark:text-white">
                      {submission.PresentationDate ? new Date(submission.PresentationDate).toLocaleDateString() : 'Event Day'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Scheduled Time Slot:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {submission.PresentationStartTime} - {submission.PresentationEndTime}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Venue / Location:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {submission.PresentationVenue || submission.BoothNumber || 'Assigned Stall'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-500">
                  Presentation time slots will be published prior to event commencement.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ── TAB 2: DELIVERABLES & PROJECT DETAILS ── */}
      {activeTab === 'project' && (
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Project Deliverables & Artifacts
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Ensure your presentation slides, prototype links, and abstracts are up to date.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Update Deliverables</span>
            </button>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Project Abstract:</span>
              <p className="text-gray-600 dark:text-gray-400 p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 leading-relaxed">
                {submission?.Abstract || 'No abstract uploaded yet.'}
              </p>
            </div>
            {submission?.ProposedSolution && (
              <div>
                <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Proposed Solution:</span>
                <p className="text-gray-600 dark:text-gray-400 p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 leading-relaxed">
                  {submission.ProposedSolution}
                </p>
              </div>
            )}
            {submission?.TechnologiesUsed && (
              <div>
                <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Technologies Used:</span>
                <p className="text-gray-600 dark:text-gray-400 p-2.5 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800">
                  {submission.TechnologiesUsed}
                </p>
              </div>
            )}
            {/* Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                href={submission?.GithubRepoUrl || '#'}
                target={submission?.GithubRepoUrl ? '_blank' : '_self'}
                rel="noreferrer"
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  submission?.GithubRepoUrl
                    ? 'border-gray-200 dark:border-gray-800 hover:border-emerald-500 text-gray-800 dark:text-gray-200'
                    : 'border-dashed border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs">GitHub Repository</span>
                </div>
                {submission?.GithubRepoUrl && <ExternalLink className="w-3.5 h-3.5 text-gray-400" />}
              </a>
              <a
                href={submission?.LiveDemoUrl || '#'}
                target={submission?.LiveDemoUrl ? '_blank' : '_self'}
                rel="noreferrer"
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  submission?.LiveDemoUrl
                    ? 'border-gray-200 dark:border-gray-800 hover:border-emerald-500 text-gray-800 dark:text-gray-200'
                    : 'border-dashed border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs">Live Deployment</span>
                </div>
                {submission?.LiveDemoUrl && <ExternalLink className="w-3.5 h-3.5 text-gray-400" />}
              </a>
              <a
                href={submission?.PptUrl || '#'}
                target={submission?.PptUrl ? '_blank' : '_self'}
                rel="noreferrer"
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  submission?.PptUrl
                    ? 'border-gray-200 dark:border-gray-800 hover:border-emerald-500 text-gray-800 dark:text-gray-200'
                    : 'border-dashed border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs">Presentation Slides</span>
                </div>
                {submission?.PptUrl && <ExternalLink className="w-3.5 h-3.5 text-gray-400" />}
              </a>
            </div>
          </div>
        </div>
      )}
      {/* ── TAB 3: GUIDELINES ── */}
      {activeTab === 'guidelines' && (
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Exhibition Guidelines & Instructions
          </h3>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 whitespace-pre-line text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
            {expoConfig?.Guidelines || 'No special guidelines posted for this exhibition yet.'}
          </div>
          {expoConfig?.RequiredDocuments && (
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Required Deliverables:
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {expoConfig.RequiredDocuments}
              </p>
            </div>
          )}
        </div>
      )}
      {/* ── TAB 4: OFFICIAL RESULTS & ROUND SCORECARDS ── */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Header & Sub-Tab Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Evaluation Scorecards &amp; Honors
                </span>
                {isOverallPublished && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Official Results Published
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
                Round-Wise Evaluations &amp; Official Results
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Inspect official rubric scores, judge comments, stage breakdowns, and published event podium
              </p>
            </div>

            {publishedRounds.length > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-semibold self-start sm:self-auto shrink-0">
                <span className="text-gray-400 mr-1.5">Published Cumulative:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {publishedEvaluation?.totalPublishedScore ?? 0}
                </strong>
                <span className="text-gray-400 font-normal"> / {publishedEvaluation?.totalPublishedMaxMarks ?? 100} pts</span>
              </div>
            )}
          </div>

          {/* Sub-Tabs: All Stages | Round 1 | Round 2 | ... | 🏆 Overall 3 Event Prizes */}
          {(publishedRounds.length > 0 || isOverallPublished) && (
            <div className="relative pt-2">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-zinc-800 pointer-events-none z-0" />
              <div className="relative flex items-end gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none z-10 -mb-px">
                <button
                  type="button"
                  onClick={() => setSelectedResultTab('all')}
                  className="relative h-11 px-4 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                >
                  {selectedResultTab === 'all' ? (
                    <motion.div
                      layoutId="projectExpoSubTabActive"
                      className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    >
                      <div className="absolute top-0 left-4 right-4 h-[2px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                      <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                  )}
                  <span
                    className={`relative z-30 flex items-center gap-2 ${
                      selectedResultTab === 'all'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Published Stages</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        selectedResultTab === 'all'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                      }`}
                    >
                      {publishedRounds.length}
                    </span>
                  </span>
                </button>

                {publishedRounds.map((round) => {
                  const isSel = selectedResultTab === round.roundId;
                  return (
                    <button
                      key={round.roundId}
                      type="button"
                      onClick={() => setSelectedResultTab(round.roundId)}
                      className="relative h-11 px-4 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                    >
                      {isSel ? (
                        <motion.div
                          layoutId="projectExpoSubTabActive"
                          className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        >
                          <div className="absolute top-0 left-4 right-4 h-[2px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                          <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                        </motion.div>
                      ) : (
                        <div className="absolute inset-0 rounded-t-2xl bg-gray-100/90 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 hover:bg-gray-200/80 dark:hover:bg-zinc-900 transition-colors z-0" />
                      )}
                      <span
                        className={`relative z-30 flex items-center gap-2 ${
                          isSel
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                        }`}
                      >
                        <span>Stage #{round.roundOrder}: {round.roundName.split(':')[0]}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isSel
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-200/60 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                          }`}
                        >
                          {round.score !== null ? round.score : '—'}/{round.maxMarks}
                        </span>
                      </span>
                    </button>
                  );
                })}

                {isOverallPublished && (
                  <button
                    type="button"
                    onClick={() => setSelectedResultTab('overall')}
                    className="relative h-11 px-4 sm:px-5 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                  >
                    {selectedResultTab === 'overall' ? (
                      <motion.div
                        layoutId="projectExpoSubTabActive"
                        className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-amber-500/50 dark:border-amber-500/50 z-20 shadow-[0_-2px_12px_rgba(245,158,11,0.08)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      >
                        <div className="absolute top-0 left-4 right-4 h-[2px] bg-amber-500 rounded-b-full shadow-[0_1px_6px_rgba(245,158,11,0.5)]" />
                        <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 rounded-t-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors z-0" />
                    )}
                    <span
                      className={`relative z-30 flex items-center gap-2 ${
                        selectedResultTab === 'overall'
                          ? 'text-amber-500 font-bold'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>3 Event Prizes &amp; Standing 🏆</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── CASE 1: EVALUATION IN PROGRESS (NO ROUNDS PUBLISHED & NOT OVERALL PUBLISHED) ── */}
          {publishedRounds.length === 0 && !isOverallPublished && (
            <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-8 sm:p-12 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
                  Evaluation In Progress
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  The jury panel is currently evaluating exhibition stalls, scoring prototypes across rubrics, and drafting written remarks. As soon as event organizers publish round scorecards, your stage marks and feedback will be displayed here in real time.
                </p>
              </div>

              {/* Stage Progression Pipeline Preview */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 max-w-2xl mx-auto">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-4">
                  Exhibition Evaluation Stages Pipeline
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Stage 1
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        30 Pts
                      </span>
                    </div>
                    <h5 className="font-semibold text-xs text-gray-800 dark:text-zinc-200">
                      Stall Showcase &amp; Concept
                    </h5>
                    <span className="inline-block text-[10px] text-gray-400">Awaiting Jury Publication</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Stage 2
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        40 Pts
                      </span>
                    </div>
                    <h5 className="font-semibold text-xs text-gray-800 dark:text-zinc-200">
                      Working Prototype Rigor
                    </h5>
                    <span className="inline-block text-[10px] text-gray-400">Awaiting Jury Publication</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Stage 3
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        30 Pts
                      </span>
                    </div>
                    <h5 className="font-semibold text-xs text-gray-800 dark:text-zinc-200">
                      Grand Jury Q&amp;A
                    </h5>
                    <span className="inline-block text-[10px] text-gray-400">Awaiting Jury Publication</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CASE 2: ROUND SCORECARDS (WHEN NOT IN 'overall' ONLY VIEW) ── */}
          {selectedResultTab !== 'overall' && publishedRounds.length > 0 && (
            <div className="space-y-5">
              {publishedRounds
                .filter((r) => selectedResultTab === 'all' || r.roundId === selectedResultTab)
                .map((round) => (
                  <div
                    key={round.roundId}
                    className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm"
                  >
                    {/* Stage Header */}
                    <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
                          #{round.roundOrder}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-gray-900 dark:text-white">
                              {round.roundName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Published
                            </span>
                          </div>
                          {round.description && (
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                              {round.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-right">
                          <span className="text-[11px] text-gray-400 block">Stage Score</span>
                          <strong className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {round.score !== null ? round.score : '—'}
                          </strong>
                          <span className="text-xs text-gray-400"> / {round.maxMarks} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Individual Evaluator Scorecards */}
                    {Array.isArray(round.submissions || round.evaluations) && (round.submissions || round.evaluations).length > 0 && (
                      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-zinc-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                              Jury Panel Scorecards &amp; Evaluator Marks
                            </span>
                            <p className="text-xs text-gray-500 dark:text-zinc-400">
                              Detailed marks and feedback awarded by each evaluator on the panel ({(round.submissions || round.evaluations).length} Evaluator{(round.submissions || round.evaluations).length !== 1 ? 's' : ''})
                            </p>
                          </div>
                          <span className="self-start sm:self-auto px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {(round.submissions || round.evaluations).length} Evaluator Scorecard{(round.submissions || round.evaluations).length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {(round.submissions || round.evaluations).map((sub, sIdx) => (
                            <div
                              key={sub.scoreId || sIdx}
                              className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
                                      {sub.evaluatorRole || 'Technical Jury'}
                                    </span>
                                    <h5 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                      {sub.evaluatorName}
                                    </h5>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20 whitespace-nowrap shrink-0">
                                    {sub.totalScore} / {round.maxMarks} pts
                                  </span>
                                </div>

                                {/* Rubric Criteria Breakdown for this Judge */}
                                {Array.isArray(round.questions) && round.questions.length > 0 && (
                                  <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-800 space-y-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">
                                      Criteria Marks Awarded:
                                    </span>
                                    <div className="space-y-1">
                                      {round.questions.map((q) => {
                                        let mark = null;
                                        if (Array.isArray(sub.scoresData)) {
                                          const item = sub.scoresData.find(i => Number(i.questionId || i.id || i.Id) === Number(q.Id));
                                          if (item) mark = item.marks ?? item.score ?? item.Marks ?? null;
                                        } else if (sub.scoresData && typeof sub.scoresData === 'object') {
                                          const val = sub.scoresData[q.Id] ?? sub.scoresData[String(q.Id)];
                                          if (val !== undefined && val !== null && val !== '') mark = val;
                                        }
                                        return (
                                          <div key={q.Id} className="flex items-center justify-between text-[11px] py-0.5">
                                            <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[170px]" title={q.QuestionText}>
                                              {q.QuestionText}
                                            </span>
                                            <span className="font-mono font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                                              {mark !== null && mark !== undefined ? mark : '—'}{' '}
                                              <span className="text-gray-400 dark:text-zinc-500 font-normal">/ {q.MaxMarks}</span>
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Feedback / Comments by this Evaluator */}
                              {sub.feedback ? (
                                <div className="pt-2 border-t border-gray-200/50 dark:border-zinc-800">
                                  <p className="text-[11px] text-gray-600 dark:text-zinc-300 italic bg-white dark:bg-black p-2.5 rounded-xl border border-gray-100 dark:border-zinc-800 leading-relaxed">
                                    "{sub.feedback}"
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rubric Breakdown Grid & Consensus */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-2.5">
                          Consolidated Rubric Criteria &amp; Average Marks Awarded
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {(round.questions || []).map((q, qIdx) => (
                            <div
                              key={q.Id || qIdx}
                              className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black flex flex-col justify-between gap-2.5 text-xs"
                            >
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {q.QuestionText}
                                </p>
                                {q.Description && (
                                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                                    {q.Description}
                                  </p>
                                )}
                              </div>
                              <div className="pt-2 border-t border-gray-200/50 dark:border-zinc-800/80 flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-gray-400">Awarded</span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                  {q.marksAwarded !== null && q.marksAwarded !== undefined ? `${q.marksAwarded}` : '—'}
                                  <span className="text-gray-400 text-xs font-normal"> / {q.MaxMarks}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* General Feedback / Comments from Jury */}
                      {round.feedback && (
                        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1.5">
                            Panel Consensus Guidance &amp; Highlights
                          </span>
                          <p className="text-xs text-gray-700 dark:text-zinc-300 italic bg-gray-50/60 dark:bg-black p-4 rounded-xl border border-gray-200/80 dark:border-zinc-800 leading-relaxed">
                            "{round.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ── CASE 3: OVERALL STANDING & THE 3 EVENT PRIZES PODIUM ── */}
          {/* Rendered when selectedResultTab === 'overall' OR (selectedResultTab === 'all' AND isOverallPublished) */}
          {isOverallPublished && (selectedResultTab === 'overall' || selectedResultTab === 'all') && (
            <div className="space-y-6 pt-2">
              {/* 1. Official Declared Winner Honor Card (if current team won 1st, 2nd, or 3rd) */}
              {teamWinnerRecord && (
                <div className="rounded-3xl border border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Official Exhibition Honors
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                          {teamWinnerRecord.Category} 🏆
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-500 dark:text-zinc-400">Awarded Prize</span>
                      <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {teamWinnerRecord.PrizeAmount || 'Excellence Award'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800">
                      <span className="text-gray-400 block text-[11px]">Official Rank</span>
                      <strong className="text-sm text-gray-900 dark:text-white font-mono">Rank #{teamWinnerRecord.RankPosition}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800">
                      <span className="text-gray-400 block text-[11px]">Total Score</span>
                      <strong className="text-sm text-emerald-600 dark:text-emerald-400 font-mono">{teamWinnerRecord.TotalScore} pts</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
                      <span className="text-gray-400 block text-[11px]">Assigned Stall</span>
                      <strong className="text-sm text-gray-900 dark:text-white font-mono">{submission?.BoothNumber || 'Allocated Stall'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Official Overall Standing Card */}
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg shrink-0">
                    #{publishedEvaluation?.overallRank || teamWinnerRecord?.RankPosition || 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Official Overall Tournament Standing
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                      {publishedEvaluation?.overallRank === 1 || teamWinnerRecord?.RankPosition === 1
                        ? '1st Place Champion 🏆'
                        : publishedEvaluation?.overallRank === 2 || teamWinnerRecord?.RankPosition === 2
                        ? '2nd Place Runner-Up 🥈'
                        : publishedEvaluation?.overallRank === 3 || teamWinnerRecord?.RankPosition === 3
                        ? '3rd Place Podium Finish 🥉'
                        : `Overall Rank #${publishedEvaluation?.overallRank || 1}`}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Final standing across all {publishedEvaluation?.totalRegistrations || 10} exhibiting teams.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:border-l sm:border-gray-200 dark:sm:border-zinc-800 sm:pl-6 text-left sm:text-right">
                  <div>
                    <span className="text-[11px] text-gray-400 block">Cumulative Score</span>
                    <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {publishedEvaluation?.totalPublishedScore ?? teamWinnerRecord?.TotalScore ?? 0}
                    </span>
                    <span className="text-xs text-gray-400"> / {publishedEvaluation?.totalPublishedMaxMarks ?? 100}</span>
                  </div>
                  {publishedEvaluation?.percentage !== undefined && (
                    <div>
                      <span className="text-[11px] text-gray-400 block">Performance</span>
                      <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">
                        {publishedEvaluation.percentage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. The 3 Official Event Prizes (Strictly 3 Prizes Podium) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                      <Medal className="w-4 h-4 text-amber-500" />
                      Official Event Prizes &amp; Top 3 Podium
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      The 3 officially recognized winners and cash prize awardees for this exhibition
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    3 Official Honors
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {officialWinners.map((win, idx) => {
                    const isThisTeam = String(win.TeamId) === String(teamId);
                    const rank = win.RankPosition || idx + 1;
                    const borderStyle =
                      rank === 1
                        ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent'
                        : rank === 2
                        ? 'border-slate-400/40 bg-gradient-to-b from-slate-400/10 to-transparent'
                        : 'border-amber-700/40 bg-gradient-to-b from-amber-700/10 to-transparent';

                    const iconColor =
                      rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-slate-300' : 'text-amber-600';

                    return (
                      <div
                        key={win.Id || idx}
                        className={`rounded-2xl border p-5 flex flex-col justify-between relative transition ${borderStyle} ${
                          isThisTeam ? 'ring-2 ring-emerald-500' : ''
                        } bg-white dark:bg-black`}
                      >
                        {isThisTeam && (
                          <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                            Your Team
                          </span>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Trophy className={`w-5 h-5 ${iconColor}`} />
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-200">
                                {win.Category}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-400">
                              Rank #{rank}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-base text-gray-900 dark:text-white truncate">
                              {win.TeamName}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                              {win.ProjectTitle}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Stall:</span>
                            <strong className="text-gray-700 dark:text-zinc-200 font-mono">
                              {win.BoothNumber || `STALL-0${rank}`}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Total Score:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {win.TotalScore} pts
                            </strong>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-center">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                              {win.PrizeAmount || 'Trophy & Citation'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ── TAB 5: EVENT FEEDBACK ── */}
      {activeTab === 'feedback' && (
        <UnifiedEventFeedbackCard eventId={eventId} user={user} team={team} />
      )}
      {/* ── EDIT DELIVERABLES MODAL ── */}
      <AnimatePresence>
        {showEditModal && (
          <div key="edit-deliverables-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              key="edit-deliverables-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !savingEdit && setShowEditModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            />
            <motion.div
              key="edit-deliverables-panel"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Update Project Deliverables
                </h3>
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSaveSubmission} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.ProjectTitle}
                    onChange={(e) => setEditForm({ ...editForm, ProjectTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Project Abstract *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={editForm.Abstract}
                    onChange={(e) => setEditForm({ ...editForm, Abstract: e.target.value })}
                    placeholder="Describe your prototype and working model..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Proposed Solution
                  </label>
                  <textarea
                    rows="2"
                    value={editForm.ProposedSolution}
                    onChange={(e) => setEditForm({ ...editForm, ProposedSolution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Technologies / Hardware Stack
                  </label>
                  <input
                    type="text"
                    value={editForm.TechnologiesUsed}
                    onChange={(e) => setEditForm({ ...editForm, TechnologiesUsed: e.target.value })}
                    placeholder="e.g. Arduino Uno, ESP32, Python, OpenCV, React"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={editForm.GithubRepoUrl}
                      onChange={(e) => setEditForm({ ...editForm, GithubRepoUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Live Demo / Video Link
                    </label>
                    <input
                      type="url"
                      value={editForm.LiveDemoUrl}
                      onChange={(e) => setEditForm({ ...editForm, LiveDemoUrl: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Presentation Deck (Drive / Cloud Link)
                  </label>
                  <input
                    type="url"
                    value={editForm.PptUrl}
                    onChange={(e) => setEditForm({ ...editForm, PptUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Deliverables</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
