import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Target, CheckCircle2, AlertCircle, Edit3, Plus,
  Code, Cpu, Layers, Lock, Timer, X, ArrowLeftRight,
  Upload, ExternalLink, Paperclip, Clock, Search, Filter, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

// PhysicalTeamPSActionCard: Rendered for physical hackathons on Team Dashboard (TeamInfo) & EventRedirectPage
export default function PhysicalTeamPSActionCard({
  event = {},
  eventTheme = {},
  registeredTeam = null,
  isRegistered = false,
  participantStatement = null,
  onParticipantStatementSaved = null,
  organizerStatements = [],
  selectedStatement = null,
  onSelectOrganizerStatement = null,
  themes = []
}) {
  if (!isRegistered || !registeredTeam) return null;
  const isHackathon = (event?.EventType || '').toLowerCase() === 'hackathon';
  if (!isHackathon) return null;

  const psMode = event?.PhysicalPSMode || 'organizer_provided';
  const isParticipantDefined = psMode === 'participant_defined';
  const isPSPublished = Boolean(
    event?.PhysicalPSPublished === 1 ||
    event?.PhysicalPSPublished === true ||
    event?.ProblemStatementsPublished === 1 ||
    event?.ProblemStatementsPublished === true
  );

  const [currentSelection, setCurrentSelection] = useState(selectedStatement);
  useEffect(() => {
    if (selectedStatement) setCurrentSelection(selectedStatement);
  }, [selectedStatement]);

  const [selectingId, setSelectingId] = useState(null);
  const [isChangingPS, setIsChangingPS] = useState(false);

  // Search and filter for organizer statements
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [themeFilter, setThemeFilter] = useState('ALL');

  // Countdown timer for organizer statements selection / release
  const activeDeadline = event?.PhysicalPSSelectionDeadline || event?.PSSelectionDeadline;
  const [timerLeft, setTimerLeft] = useState(null);

  useEffect(() => {
    if (!activeDeadline) {
      setTimerLeft(null);
      return;
    }
    const checkTimer = () => {
      const now = Date.now();
      const s = String(activeDeadline).trim();
      const normalized = s.includes('T') ? (s.endsWith('Z') ? s : s + 'Z') : s.replace(' ', 'T') + 'Z';
      let targetMs = new Date(normalized).getTime();
      if (isNaN(targetMs)) targetMs = new Date(s).getTime();
      const diff = targetMs - now;
      if (diff <= 0) {
        setTimerLeft({ expired: true, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimerLeft({ expired: false, hours, minutes, seconds });
      }
    };
    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [activeDeadline]);

  // Modal & form state for participant-defined mode
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [formData, setFormData] = useState({
    ThemeName: participantStatement?.ThemeName || (themes[0]?.ThemeName || ''),
    Category: participantStatement?.Category || 'Software',
    Title: participantStatement?.Title || '',
    Description: participantStatement?.Description || '',
    TechStack: participantStatement?.TechStack || '',
    DocumentUrl: participantStatement?.DocumentUrl || '',
    DocumentName: participantStatement?.DocumentName || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const openModal = () => {
    setFile(null);
    setFormData({
      ThemeName: participantStatement?.ThemeName || (themes[0]?.ThemeName || ''),
      Category: participantStatement?.Category || 'Software',
      Title: participantStatement?.Title || '',
      Description: participantStatement?.Description || '',
      TechStack: participantStatement?.TechStack || '',
      DocumentUrl: participantStatement?.DocumentUrl || '',
      DocumentName: participantStatement?.DocumentName || ''
    });
    setSubmitError('');
    setSubmitSuccess('');
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 25 * 1024 * 1024) {
        setSubmitError('File size exceeds 25MB limit.');
        return;
      }
      setFile(selected);
      setFormData(prev => ({
        ...prev,
        DocumentName: selected.name
      }));
    }
  };

  const handleModalSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const teamId = registeredTeam.TeamId || registeredTeam.Id;
    if (!teamId) {
      setSubmitError('Team information not found. Please register first.');
      return;
    }
    if (!formData.Title.trim()) {
      setSubmitError('Please enter a title for your problem statement proposal.');
      return;
    }
    if (!formData.Description.trim()) {
      setSubmitError('Please provide a brief description of the challenge and your planned solution.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      const token = localStorage.getItem('token');
      let finalDocUrl = formData.DocumentUrl || '';
      let finalDocName = formData.DocumentName || '';

      // Upload file if selected
      if (file) {
        setUploadProgress(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        const upRes = await fetch(`${API_BASE_URL}/api/upload/single`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: uploadData
        });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.message || 'Proposal file upload failed');
        finalDocUrl = upJson.fileUrl || upJson.url || '';
        finalDocName = file.name;
        setUploadProgress(false);
      }

      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${event.Id}/participant-statement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          teamId,
          ThemeName: formData.ThemeName,
          Category: formData.Category || 'Software',
          Title: formData.Title.trim(),
          Description: formData.Description.trim(),
          TechStack: formData.TechStack.trim(),
          DocumentUrl: finalDocUrl,
          DocumentName: finalDocName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit problem statement');
      setSubmitSuccess('Problem statement proposal and documentation saved successfully!');
      if (onParticipantStatementSaved) {
        onParticipantStatementSaved({
          ...participantStatement,
          TeamId: teamId,
          ThemeName: formData.ThemeName,
          Category: formData.Category || 'Software',
          Title: formData.Title.trim(),
          Description: formData.Description.trim(),
          TechStack: formData.TechStack.trim(),
          DocumentUrl: finalDocUrl,
          DocumentName: finalDocName,
          Status: participantStatement?.Status || 'Approved'
        });
      }
      setTimeout(() => {
        setModalOpen(false);
        setSubmitSuccess('');
      }, 1200);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit problem statement');
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  const handleSelectStatement = async (ps) => {
    const teamId = registeredTeam.TeamId || registeredTeam.Id;
    if (!teamId) {
      alert('Team information not found. Please ensure your registration is active.');
      return;
    }
    try {
      setSelectingId(ps.Id);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/event/${event.Id}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ teamId, problemStatementId: ps.Id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to select problem statement');
      const locked = {
        ProblemStatementId: ps.Id,
        ProblemCode: ps.ProblemCode,
        ProblemTitle: ps.Title,
        Theme: ps.Theme,
        Description: ps.Description,
        Category: ps.Category,
        SelectedAt: new Date().toISOString()
      };
      setCurrentSelection(locked);
      setIsChangingPS(false);
      if (onSelectOrganizerStatement) onSelectOrganizerStatement(locked);
    } catch (err) {
      alert(err.message || 'Failed to select problem statement');
    } finally {
      setSelectingId(null);
    }
  };

  const filteredOrganizerStatements = useMemo(() => {
    return organizerStatements.filter((ps) => {
      if (categoryFilter !== 'ALL' && (ps.Category || 'Software').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (themeFilter !== 'ALL' && (ps.Theme || '').trim().toLowerCase() !== themeFilter.trim().toLowerCase()) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchCode = (ps.ProblemCode || '').toLowerCase().includes(q);
        const matchTitle = (ps.Title || '').toLowerCase().includes(q);
        const matchDesc = (ps.Description || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [organizerStatements, categoryFilter, themeFilter, searchQuery]);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111613] p-5 sm:p-7 space-y-5 shadow-xs">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: eventTheme?.iconBg || 'rgba(16, 185, 129, 0.1)',
              borderColor: eventTheme?.badgeBorder || 'rgba(16, 185, 129, 0.25)',
              color: eventTheme?.iconColor || '#10b981'
            }}
          >
            {isParticipantDefined ? <Target className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Team Challenge: {registeredTeam.TeamName}
              </h4>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isParticipantDefined
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {isParticipantDefined ? 'Open Innovation Track' : 'Organizer Challenges Track'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {isParticipantDefined
                ? 'Submit your team proposal with abstract and document under the event themes.'
                : 'Select from official problem statements published by organizers.'}
            </p>
          </div>
        </div>

        {isParticipantDefined && (
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
            style={{ backgroundColor: eventTheme?.accent || '#10b981' }}
          >
            {participantStatement ? <Edit3 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{participantStatement ? 'Edit Proposal & Document' : 'Submit Problem Statement'}</span>
          </button>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── TRACK 1: PARTICIPANT SUBMITTED (OPEN INNOVATION) ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isParticipantDefined ? (
        participantStatement ? (
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-black/50 border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  Theme: <strong className="text-slate-900 dark:text-white">{participantStatement.ThemeName || 'General'}</strong>
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                  (participantStatement.Category || '').toLowerCase() === 'hardware'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : (participantStatement.Category || '').toLowerCase() === 'both'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                }`}>
                  {participantStatement.Category === 'Both' ? 'Hardware & Software' : (participantStatement.Category || 'Software')}
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                participantStatement.Status === 'Needs_Revision'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}>
                {participantStatement.Status === 'Needs_Revision' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span>{participantStatement.Status === 'Needs_Revision' ? 'Revision Requested' : (participantStatement.Status || 'Approved')}</span>
              </span>
            </div>

            {/* Admin Remarks if revision requested */}
            {participantStatement.AdminRemarks && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Organizer Feedback & Remarks:</span>
                </div>
                <p className="leading-relaxed pl-5">{participantStatement.AdminRemarks}</p>
              </div>
            )}

            <div>
              <h5 className="text-base font-bold text-slate-900 dark:text-white">
                {participantStatement.Title}
              </h5>
              {participantStatement.Description && (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line mt-1.5">
                  {participantStatement.Description}
                </p>
              )}
            </div>

            {participantStatement.TechStack && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                <Code className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Tech Stack: <strong className="text-slate-800 dark:text-zinc-200">{participantStatement.TechStack}</strong></span>
              </div>
            )}

            {/* Uploaded Document / Presentation */}
            {participantStatement.DocumentUrl ? (
              <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Uploaded Proposal Document
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block max-w-sm">
                      {participantStatement.DocumentName || 'Project_Abstract_or_Presentation'}
                    </span>
                  </div>
                </div>
                <a
                  href={participantStatement.DocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition shrink-0"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-500" />
                  <span>View / Download Document</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>No document or presentation uploaded yet.</span>
                <button
                  type="button"
                  onClick={openModal}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Upload File &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Custom Problem Statement Proposal Required
                </p>
                <p className="text-slate-600 dark:text-amber-300 mt-0.5">
                  This hackathon runs in Open Innovation format. Please select an innovation theme and submit your challenge proposal along with your presentation or document.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Submit Now</span>
            </button>
          </div>
        )
      ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* ── TRACK 2: ORGANIZER PROVIDED CHALLENGES ── */
        /* ───────────────────────────────────────────────────────────── */
        currentSelection ? (
          /* Selection Locked / Active */
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-black/50 border border-slate-200 dark:border-zinc-800 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {currentSelection.ProblemCode}
                  </span>
                  {currentSelection.Theme && (
                    <span className="text-xs text-slate-600 dark:text-zinc-300">
                      Theme: <strong className="text-slate-900 dark:text-white">{currentSelection.Theme}</strong>
                    </span>
                  )}
                  {currentSelection.Category && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {currentSelection.Category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Selected</span>
                  </span>
                  {isPSPublished && (!timerLeft || !timerLeft.expired) && (
                    <button
                      type="button"
                      onClick={() => setIsChangingPS(!isChangingPS)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:border-emerald-500 transition cursor-pointer"
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                      <span>{isChangingPS ? 'Close' : 'Switch Challenge'}</span>
                    </button>
                  )}
                </div>
              </div>

              <h5 className="text-base font-bold text-slate-900 dark:text-white">
                {currentSelection.ProblemTitle || currentSelection.Title}
              </h5>

              {currentSelection.Description && (
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {currentSelection.Description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                {isPSPublished && timerLeft && !timerLeft.expired ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-emerald-500" />
                    <span>
                      Selection timer active: {timerLeft.hours > 0 ? `${timerLeft.hours}h ` : ''}{timerLeft.minutes}m {timerLeft.seconds}s remaining to switch
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">
                    Selection window closed. Your problem statement is locked and final.
                  </span>
                )}
                {currentSelection.SelectedAt && (
                  <span className="text-slate-400 text-[11px]">
                    Locked on: {new Date(currentSelection.SelectedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* In-place challenge switcher if user clicks Switch */}
            {isChangingPS && isPSPublished && (!timerLeft || !timerLeft.expired) && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                    <span>Select Another Challenge Statement to Switch:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangingPS(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {organizerStatements.filter(ps => ps.Id !== currentSelection.ProblemStatementId).map((ps) => (
                    <div
                      key={ps.Id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs hover:border-emerald-500/40 transition"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-600 mr-1">{ps.ProblemCode}</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate">{ps.Title}</span>
                        </div>
                        {ps.Theme && <p className="text-slate-400 text-[11px]">Theme: {ps.Theme} • {ps.Category || 'Software'}</p>}
                      </div>
                      <button
                        type="button"
                        disabled={selectingId === ps.Id}
                        onClick={() => handleSelectStatement(ps)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                      >
                        {selectingId === ps.Id ? 'Switching...' : 'Switch to This'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* When team has NOT selected yet */
          isPSPublished ? (
            <div className="space-y-4">
              {/* Notification Banner with live selection deadline timer */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold block">Problem statements are officially published!</span>
                    <span className="text-slate-600 dark:text-zinc-300 text-[11px]">Review the challenge statements below and select one for your squad.</span>
                  </div>
                </div>
                {timerLeft && !timerLeft.expired && (
                  <div className="font-mono font-black text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 self-start sm:self-auto shrink-0">
                    <Timer className="h-3.5 w-3.5" />
                    <span>
                      {timerLeft.hours > 0 ? `${timerLeft.hours}h ` : ''}{timerLeft.minutes}m {timerLeft.seconds}s remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by code or title..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Domains</option>
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Both">Both (Hybrid)</option>
                  </select>
                  <select
                    value={themeFilter}
                    onChange={(e) => setThemeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Themes</option>
                    {themes.map((t, idx) => (
                      <option key={t.Id || idx} value={t.ThemeName}>{t.ThemeName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Statements Cards Grid */}
              <div className="space-y-3">
                {filteredOrganizerStatements.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                    No problem statements found matching your search.
                  </div>
                ) : (
                  filteredOrganizerStatements.map((ps) => (
                    <div
                      key={ps.Id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black/50 space-y-3 hover:border-emerald-500/40 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            {ps.ProblemCode}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                            {ps.Category || 'Software'}
                          </span>
                          {ps.Theme && (
                            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                              Theme: <strong className="text-slate-800 dark:text-zinc-200">{ps.Theme}</strong>
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={selectingId === ps.Id || (timerLeft && timerLeft.expired)}
                          onClick={() => handleSelectStatement(ps)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto shadow-sm"
                        >
                          {selectingId === ps.Id ? 'Selecting...' : 'Select & Lock In'}
                        </button>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {ps.Title}
                      </h5>

                      {ps.Description && (
                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                          {ps.Description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Problem Statements Unpublished: Show Countdown Timer if scheduled or draft note */
            timerLeft && !timerLeft.expired ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                      <Timer className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        Problem Statements Release Countdown
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        The organizers will release all challenge statements live. Review the Innovation Themes below in advance to prepare your stack!
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 font-mono text-base font-black text-amber-700 dark:text-amber-300 flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-2xs">
                    <Clock className="h-4 w-4 text-amber-500 animate-spin" />
                    <span>
                      {String(timerLeft.hours).padStart(2, '0')}:{String(timerLeft.minutes).padStart(2, '0')}:{String(timerLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-3">
                <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Problem Statements Locked (Draft Mode)</p>
                  <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                    Organizers will officially unlock and publish problem statements during the physical hackathon kickoff ceremony. Themes are available below in advance.
                  </p>
                </div>
              </div>
            )
          )
        )
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── MODAL: PARTICIPANT PROPOSAL & DOCUMENT SUBMISSION ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {participantStatement ? 'Update Problem Statement Proposal' : 'Submit Problem Statement Proposal'}
                    </h4>
                    <p className="text-xs text-slate-400">Physical Hackathon • Open Innovation Track</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Select Innovation Theme *
                  </label>
                  <select
                    value={formData.ThemeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ThemeName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {themes.length === 0 ? (
                      <option value="General Innovation">General Innovation</option>
                    ) : (
                      themes.map((t, idx) => (
                        <option key={t.Id || idx} value={t.ThemeName}>{t.ThemeName}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">
                    Project Domain / Category *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Software', label: 'Software', icon: Code },
                      { id: 'Hardware', label: 'Hardware', icon: Cpu },
                      { id: 'Both', label: 'Both (Hybrid)', icon: Layers }
                    ].map((cat) => {
                      const CatIcon = cat.icon;
                      const isSelected = (formData.Category || 'Software') === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, Category: cat.id }))}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border font-bold transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                          }`}
                        >
                          <CatIcon className="h-3.5 w-3.5" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Problem Statement Title *
                  </label>
                  <input
                    type="text"
                    value={formData.Title}
                    onChange={(e) => setFormData(prev => ({ ...prev, Title: e.target.value }))}
                    placeholder="e.g. Autonomous Drone for Precision Agriculture & Weed Detection"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Problem Statement & Solution Abstract *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.Description}
                    onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
                    placeholder="Clearly explain the real-world problem you are addressing, your proposed engineering approach, and key expected deliverables..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    Proposed Tech Stack
                  </label>
                  <input
                    type="text"
                    value={formData.TechStack}
                    onChange={(e) => setFormData(prev => ({ ...prev, TechStack: e.target.value }))}
                    placeholder="e.g. React, Node.js, Python, OpenCV, Arduino, ESP32"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Proposal File Upload & Link */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Upload Proposal Document / Presentation (PDF, PPT, DOCX)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Max 25MB</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer transition">
                      <Upload className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="truncate">
                        {file ? file.name : (formData.DocumentName || 'Click to browse and upload proposal document')}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {(file || formData.DocumentName) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFormData(prev => ({ ...prev, DocumentName: '', DocumentUrl: '' }));
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        title="Clear file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400 shrink-0">Or document link:</span>
                    <input
                      type="url"
                      value={formData.DocumentUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, DocumentUrl: e.target.value }))}
                      placeholder="https://drive.google.com/... or Figma / Notion URL"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (uploadProgress ? 'Uploading Document...' : 'Saving Proposal...') : (participantStatement ? 'Update Proposal' : 'Submit Proposal')}
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

