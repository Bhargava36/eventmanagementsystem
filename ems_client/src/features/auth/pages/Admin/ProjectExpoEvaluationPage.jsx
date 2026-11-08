import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  Users,
  Search,
  CheckCircle2,
  FileText,
  Star,
  Award,
  Loader2,
  Building2,
  Mail,
  Phone,
  X,
  UserCheck,
  ClipboardList
} from 'lucide-react';

export default function ProjectExpoEvaluationPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { eventId: urlEventId } = useParams();

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);

  const eventId = urlEventId || admin?.EventId || 34;

  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'CRITERIA' | 'JUDGES' | 'SCORES'
  const [activeTab, setActiveTab] = useState('CRITERIA');

  // Criteria Editing
  const [savingCriteria, setSavingCriteria] = useState(false);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaMarks, setNewCriteriaMarks] = useState(20);

  // Scores filter
  const [scoreSearch, setScoreSearch] = useState('');

  // Add Judge Modal
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [judgeForm, setJudgeForm] = useState({
    Name: '',
    Email: '',
    Mobile: '',
    Designation: 'Industry Expert / Jury',
    Password: ''
  });
  const [savingJudge, setSavingJudge] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [critRes, scrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/criteria`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/scores`)
      ]);

      const critData = await critRes.json();
      const scrData = await scrRes.json();

      if (critData.success && Array.isArray(critData.criteria)) {
        setCriteria(critData.criteria);
      }
      if (scrData.success && Array.isArray(scrData.scores)) {
        setScores(scrData.scores);
      }

      // Fetch Judges / Evaluators with robust fallback
      let judgeList = [];
      try {
        const jdgRes = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/judges`);
        const jdgData = await jdgRes.json();
        if (jdgData.success && Array.isArray(jdgData.judges)) {
          judgeList = jdgData.judges;
        } else if (Array.isArray(jdgData?.data)) {
          judgeList = jdgData.data;
        }
      } catch {
        try {
          const fbRes = await fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}`);
          const fbData = await fbRes.json();
          judgeList = Array.isArray(fbData) ? fbData : (fbData?.data || fbData?.evaluators || []);
        } catch {
          judgeList = [];
        }
      }
      setJudges(judgeList);
    } catch (err) {
      toast.error('Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalMaxMarks = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (parseInt(c.MaxMarks, 10) || 0), 0);
  }, [criteria]);

  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (!newCriteriaName.trim()) return;

    setCriteria([
      ...criteria,
      {
        Id: null,
        CriteriaName: newCriteriaName.trim(),
        MaxMarks: parseInt(newCriteriaMarks, 10) || 20,
        DisplayOrder: criteria.length + 1
      }
    ]);
    setNewCriteriaName('');
    setNewCriteriaMarks(20);
  };

  const handleRemoveCriteria = (index) => {
    setCriteria(criteria.filter((_, idx) => idx !== index));
  };

  const handleSaveCriteria = async () => {
    if (!eventId) return;
    if (criteria.length === 0) {
      toast.error('At least one evaluation criterion is required.');
      return;
    }

    try {
      setSavingCriteria(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save criteria');
      }

      toast.success('Evaluation rubrics saved successfully!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving criteria');
    } finally {
      setSavingCriteria(false);
    }
  };

  const handleCreateJudge = async (e) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      setSavingJudge(true);
      const res = await fetch(`${API_BASE_URL}/api/evaluators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EventId: eventId,
          Name: judgeForm.Name,
          Email: judgeForm.Email,
          Username: judgeForm.Email.split('@')[0] + `_${eventId}`,
          Password: judgeForm.Password || 'Password@123',
          PlainTextPassword: judgeForm.Password || 'Password@123',
          Track: 'Physical',
          College: 'Innovation Campus',
          Role: judgeForm.Designation || 'Jury Member',
          EventRole: judgeForm.Designation || 'Jury Member'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create judge account');
      }

      toast.success(`Judge account for ${judgeForm.Name} created!`);
      setShowJudgeModal(false);
      setJudgeForm({
        Name: '',
        Email: '',
        Mobile: '',
        Designation: 'Industry Expert / Jury',
        Password: ''
      });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error creating judge account');
    } finally {
      setSavingJudge(false);
    }
  };

  const filteredScores = useMemo(() => {
    return scores.filter((s) => {
      return (
        !scoreSearch ||
        (s.TeamName || '').toLowerCase().includes(scoreSearch.toLowerCase()) ||
        (s.ProjectTitle || '').toLowerCase().includes(scoreSearch.toLowerCase()) ||
        (s.JudgeName || '').toLowerCase().includes(scoreSearch.toLowerCase()) ||
        (s.CriteriaName || '').toLowerCase().includes(scoreSearch.toLowerCase())
      );
    });
  }, [scores, scoreSearch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading evaluation rubrics & scorecards...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors"
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 pt-6 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Jury & Project Evaluation System
          </h1>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
            Configure rubric weights, onboard panel juries, and monitor live scorecards
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowJudgeModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Judge / Jury</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── TABS ── */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
          {[
            { id: 'CRITERIA', label: `Evaluation Criteria (${criteria.length})`, count: `${totalMaxMarks} Marks` },
            { id: 'JUDGES', label: `Assigned Judges (${judges.length})` },
            { id: 'SCORES', label: `Live Scorecards (${scores.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && <span className="text-xs text-gray-400 font-mono">• {tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ── TAB 1: CRITERIA RUBRICS ── */}
        {activeTab === 'CRITERIA' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Grading Rubrics & Score Weights
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Set rubric parameters and maximum marks for evaluating team prototypes.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold ${totalMaxMarks === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                    Total: {totalMaxMarks} / 100 Marks {totalMaxMarks === 100 ? '✓' : '(Recommended 100)'}
                  </span>
                  <button
                    type="button"
                    disabled={savingCriteria}
                    onClick={handleSaveCriteria}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer transition shadow-sm disabled:opacity-60"
                  >
                    {savingCriteria ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Criteria</span>
                  </button>
                </div>
              </div>

              {/* Criteria List */}
              <div className="space-y-3">
                {criteria.map((c, idx) => (
                  <div
                    key={c.Id || idx}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-7 h-7 rounded-xl bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={c.CriteriaName}
                        onChange={(e) => {
                          const updated = [...criteria];
                          updated[idx].CriteriaName = e.target.value;
                          setCriteria(updated);
                        }}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={c.MaxMarks}
                          onChange={(e) => {
                            const updated = [...criteria];
                            updated[idx].MaxMarks = parseInt(e.target.value, 10) || 0;
                            setCriteria(updated);
                          }}
                          className="w-16 px-2.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-center text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                        />
                        <span className="text-xs text-gray-400">Marks</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCriteria(idx)}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-500 transition cursor-pointer"
                        title="Remove Criteria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Criteria Form */}
              <form onSubmit={handleAddCriteria} className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="New criterion name (e.g. Real-world Feasibility)"
                  value={newCriteriaName}
                  onChange={(e) => setNewCriteriaName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Marks"
                    value={newCriteriaMarks}
                    onChange={(e) => setNewCriteriaMarks(e.target.value)}
                    className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-center text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: ASSIGNED JUDGES ── */}
        {activeTab === 'JUDGES' && (
          <div className="space-y-6">
            {judges.length === 0 ? (
              <div className="bg-white dark:bg-black rounded-3xl p-12 text-center border border-gray-200 dark:border-zinc-800 shadow-sm">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  No Assigned Judges Found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-5">
                  No evaluators or jury members have been onboarded for this expo yet. Click below to add your first jury.
                </p>
                <button
                  type="button"
                  onClick={() => setShowJudgeModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Judge</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {judges.map((j) => (
                  <div
                    key={j.Id}
                    className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          • {j.EventRole || j.Role || 'Technical Jury'}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          {j.Status || 'Active'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-sm shrink-0">
                          {j.Name ? j.Name.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'JD'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {j.Name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {j.College || 'Innovation Jury Panel'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{j.Email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800/80 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                          <span className="block text-[10px] text-gray-400 uppercase font-medium">Evaluations</span>
                          <strong className="text-gray-900 dark:text-white text-xs">
                            {j.TeamsEvaluatedCount !== undefined ? `${j.TeamsEvaluatedCount} Teams` : 'Active'}
                          </strong>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 dark:bg-zinc-900/50">
                          <span className="block text-[10px] text-gray-400 uppercase font-medium">Track</span>
                          <strong className="text-gray-900 dark:text-white text-xs">{j.Track || 'Physical'}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-gray-500 pt-1 text-[11px]">
                        <span>Login: <strong className="text-gray-800 dark:text-zinc-200 font-mono">{j.Username}</strong></span>
                        {j.PlainTextPassword && (
                          <span>Pass: <strong className="text-gray-800 dark:text-zinc-200 font-mono">{j.PlainTextPassword}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: LIVE SCORECARDS ── */}
        {activeTab === 'SCORES' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
                  placeholder="Filter scorecards by team name, judge, criteria..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/75 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                    <tr>
                      <th className="py-4 px-6">Team & Project</th>
                      <th className="py-4 px-6">Evaluating Jury</th>
                      <th className="py-4 px-6">Rubric Criterion</th>
                      <th className="py-4 px-6 text-center">Marks Awarded</th>
                      <th className="py-4 px-6">Jury Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                    {filteredScores.map((sc, idx) => (
                      <tr key={sc.Id || idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-900 dark:text-white">{sc.TeamName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{sc.ProjectTitle}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{sc.JudgeName}</p>
                          <p className="text-xs text-gray-400">{sc.JudgeDesignation}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{sc.CriteriaName}</p>
                          <p className="text-xs text-gray-400">Max: {sc.MaxMarks} Marks</p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {sc.Score} / {sc.MaxMarks}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 max-w-sm">
                            {sc.Feedback || 'No additional remarks provided'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD JUDGE MODAL ── */}
        <AnimatePresence>
          {showJudgeModal && (
            <div key="judge-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !savingJudge && setShowJudgeModal(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Add Judge / Jury Member
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Create an evaluator login for scoring exhibiting projects.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={savingJudge}
                    onClick={() => setShowJudgeModal(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateJudge} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={judgeForm.Name}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Name: e.target.value })}
                      placeholder="e.g. Dr. K. Suresh"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={judgeForm.Email}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Email: e.target.value })}
                      placeholder="e.g. suresh.eval@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Designation / Domain Specialization
                    </label>
                    <input
                      type="text"
                      value={judgeForm.Designation}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Designation: e.target.value })}
                      placeholder="e.g. Chief Technical Jury - AI & Robotics"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Password (Optional)
                    </label>
                    <input
                      type="text"
                      value={judgeForm.Password}
                      onChange={(e) => setJudgeForm({ ...judgeForm, Password: e.target.value })}
                      placeholder="Default: Password@123"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={savingJudge}
                      onClick={() => setShowJudgeModal(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingJudge}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {savingJudge && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Create Judge Account</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
