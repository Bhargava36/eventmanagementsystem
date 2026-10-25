import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Plus,
  Code,
  Cpu,
  Layers,
  Lock,
  Timer,
  Check,
  RefreshCw,
  X
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

/**
 * PhysicalTeamPSActionCard
 * 
 * Rendered exclusively on participant EventRedirectPage for registered teams
 * to manage their problem statement selection (Organizer mode) or submission (Participant mode).
 */
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

  // Countdown timer for organizer statements selection
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

  // Modal state for participant-defined mode
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ThemeName: participantStatement?.ThemeName || (themes[0]?.ThemeName || ''),
    Category: participantStatement?.Category || 'Software',
    Title: participantStatement?.Title || '',
    Description: participantStatement?.Description || '',
    TechStack: participantStatement?.TechStack || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const openModal = () => {
    setFormData({
      ThemeName: participantStatement?.ThemeName || (themes[0]?.ThemeName || ''),
      Category: participantStatement?.Category || 'Software',
      Title: participantStatement?.Title || '',
      Description: participantStatement?.Description || '',
      TechStack: participantStatement?.TechStack || ''
    });
    setSubmitError('');
    setSubmitSuccess('');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const teamId = registeredTeam.TeamId || registeredTeam.Id;
    if (!teamId) {
      setSubmitError('Team information not found. Please register first.');
      return;
    }
    if (!formData.Title.trim()) {
      setSubmitError('Please enter a title for your problem statement.');
      return;
    }
    if (!formData.Description.trim()) {
      setSubmitError('Please provide a brief description of the problem and your solution.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');
      const token = localStorage.getItem('token');
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
          TechStack: formData.TechStack.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit problem statement');

      setSubmitSuccess('Problem statement submitted successfully!');
      if (onParticipantStatementSaved) {
        onParticipantStatementSaved({
          ...participantStatement,
          TeamId: teamId,
          ThemeName: formData.ThemeName,
          Category: formData.Category || 'Software',
          Title: formData.Title.trim(),
          Description: formData.Description.trim(),
          TechStack: formData.TechStack.trim(),
          Status: 'Approved'
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
        SelectedAt: new Date().toISOString()
      };
      setCurrentSelection(locked);
      if (onSelectOrganizerStatement) onSelectOrganizerStatement(locked);
      alert(`Successfully locked in: ${ps.ProblemCode} - ${ps.Title}`);
    } catch (err) {
      alert(err.message || 'Failed to select problem statement');
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111613] p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: eventTheme?.iconBg || 'rgba(16, 185, 129, 0.1)',
              borderColor: eventTheme?.badgeBorder || 'rgba(16, 185, 129, 0.25)',
              color: eventTheme?.iconColor || '#10b981'
            }}
          >
            {isParticipantDefined ? <Target className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Team Problem Statement: {registeredTeam.TeamName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {isParticipantDefined
                ? 'Open Innovation Track: Submit your team’s custom problem statement under any theme'
                : 'Organizer Challenge Track: Select from the officially published hackathon problem statements'}
            </p>
          </div>
        </div>

        {isParticipantDefined && (
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition hover:opacity-90 active:scale-95 cursor-pointer self-start sm:self-auto"
            style={{ backgroundColor: eventTheme?.accent || '#10b981' }}
          >
            {participantStatement ? <Edit3 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{participantStatement ? 'Update Proposal' : 'Submit Problem Statement'}</span>
          </button>
        )}
      </div>

      {/* Participant-Defined Status */}
      {isParticipantDefined ? (
        participantStatement ? (
          <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">
                  Theme: <strong className="text-slate-900 dark:text-white">{participantStatement.ThemeName || 'General'}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  (participantStatement.Category || '').toLowerCase() === 'hardware'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : (participantStatement.Category || '').toLowerCase() === 'both'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                }`}>
                  {participantStatement.Category === 'Both' ? 'Hardware & Software' : (participantStatement.Category || 'Software')}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{participantStatement.Status || 'Submitted'}</span>
              </span>
            </div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
              {participantStatement.Title}
            </h5>
            {participantStatement.Description && (
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {participantStatement.Description}
              </p>
            )}
            {participantStatement.TechStack && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                <Code className="h-3.5 w-3.5" />
                <span>Tech Stack: <strong>{participantStatement.TechStack}</strong></span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Your team has not submitted a problem statement yet. Submit your proposal before the deadline.</span>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="font-bold underline cursor-pointer hover:opacity-80"
            >
              Submit Now &rarr;
            </button>
          </div>
        )
      ) : (
        /* Organizer-Provided Status & Selection */
        currentSelection ? (
          <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-black border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {currentSelection.ProblemCode}
                </span>
                {currentSelection.Theme && (
                  <span className="text-slate-500 dark:text-zinc-400">
                    • Theme: <strong className="text-slate-900 dark:text-white">{currentSelection.Theme}</strong>
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Selected & Locked In
              </span>
            </div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
              {currentSelection.ProblemTitle || currentSelection.Title}
            </h5>
            {currentSelection.Description && (
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {currentSelection.Description}
              </p>
            )}
            {isPSPublished && timerLeft && !timerLeft.expired && (
              <div className="pt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> Selection window open: {timerLeft.hours > 0 ? `${timerLeft.hours}h ` : ''}{timerLeft.minutes}m {timerLeft.seconds}s remaining
              </div>
            )}
          </div>
        ) : (
          isPSPublished ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="font-bold">Problem statements are published! Please select your challenge below.</span>
                </div>
                {timerLeft && !timerLeft.expired && (
                  <span className="font-mono font-black text-xs text-amber-600 flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    {timerLeft.hours > 0 ? `${timerLeft.hours}h ` : ''}{timerLeft.minutes}m {timerLeft.seconds}s remaining
                  </span>
                )}
              </div>

              {/* Selection cards list */}
              <div className="space-y-2">
                {organizerStatements.map((ps) => (
                  <div
                    key={ps.Id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {ps.ProblemCode}
                        </span>
                        {ps.Theme && (
                          <span className="text-slate-400 dark:text-zinc-500">
                            • {ps.Theme}
                          </span>
                        )}
                      </div>
                      <h6 className="text-sm font-bold text-slate-900 dark:text-white">{ps.Title}</h6>
                      {ps.Description && (
                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{ps.Description}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={selectingId === ps.Id || (timerLeft && timerLeft.expired)}
                      onClick={() => handleSelectStatement(ps)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                    >
                      {selectingId === ps.Id ? 'Selecting...' : 'Select Statement'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-slate-400" />
              <span>Organizer problem statements will be officially unlocked and published during the on-campus hackathon kickoff. Themes are displayed above in advance.</span>
            </div>
          )
        )
      )}

      {/* Participant Submission Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {participantStatement ? 'Update Problem Statement' : 'Submit Problem Statement'}
                </h4>
                <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs">
                  {submitSuccess}
                </div>
              )}

              <form onSubmit={handleModalSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Select Theme *</label>
                  <select
                    value={formData.ThemeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ThemeName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {themes.map((t) => (
                      <option key={t.Id || t.ThemeName} value={t.ThemeName}>{t.ThemeName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">Project Domain / Category *</label>
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
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
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
                  <label className="text-xs font-bold text-slate-500 block mb-1">Statement Title *</label>
                  <input
                    type="text"
                    value={formData.Title}
                    onChange={(e) => setFormData(prev => ({ ...prev, Title: e.target.value }))}
                    placeholder="e.g. AI-Powered Smart Campus Energy Management"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Problem Description & Proposed Solution *</label>
                  <textarea
                    rows={4}
                    value={formData.Description}
                    onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
                    placeholder="Describe the challenge you are addressing and the approach you plan to implement..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Proposed Tech Stack</label>
                  <input
                    type="text"
                    value={formData.TechStack}
                    onChange={(e) => setFormData(prev => ({ ...prev, TechStack: e.target.value }))}
                    placeholder="e.g. React, Node.js, Python, TensorFlow, IoT sensors"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
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
