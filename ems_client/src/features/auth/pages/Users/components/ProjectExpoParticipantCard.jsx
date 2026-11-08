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

  const loadExpoData = useCallback(async () => {
    if (!eventId || !teamId) return;
    try {
      setLoading(true);
      const [subRes, cfgRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/submissions/${teamId}`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/config`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/results`)
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
    } catch (err) {
      console.warn('Failed to load expo participant details:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, teamId]);

  useEffect(() => {
    loadExpoData();
  }, [loadExpoData]);

  const teamWinnerRecord = useMemo(() => {
    if (!results || results.length === 0 || !teamId) return null;
    return results.find((r) => String(r.TeamId) === String(teamId));
  }, [results, teamId]);

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
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              • Project Expo Exhibitor
            </span>
            {submission?.Status && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  submission.Status === 'APPROVED'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : submission.Status === 'CHANGES_REQUESTED'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500'
                }`}
              >
                • {submission.Status.replace('_', ' ')}
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
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
        {[
          { id: 'pass', label: 'QR Entry & Stall Pass', icon: QrCode },
          { id: 'project', label: 'Deliverables & Abstract', icon: FileText },
          { id: 'guidelines', label: 'Exhibition Guidelines', icon: Info },
          ...(results.length > 0 ? [{ id: 'results', label: 'Official Results & Honors', icon: Trophy }] : []),
          { id: 'feedback', label: 'Event Feedback', icon: CheckCircle2 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
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
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    • Verified Ready
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

      {/* ── TAB 4: OFFICIAL RESULTS & HONORS ── */}
      {activeTab === 'results' && results.length > 0 && (
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Official Expo Results & Winners
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {results.map((win, idx) => {
              const isThisTeam = String(win.TeamId) === String(teamId);
              return (
                <div
                  key={win.Id || idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isThisTeam
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {win.Category}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                      {win.TeamName}
                    </h4>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{win.ProjectTitle}</p>
                  </div>
                  {win.PrizeAmount && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-gray-100 dark:border-gray-800/40 mt-3 block">
                      {win.PrizeAmount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
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
