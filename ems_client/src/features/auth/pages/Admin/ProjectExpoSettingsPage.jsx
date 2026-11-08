import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Sliders,
  CheckCircle2,
  Calendar,
  Users,
  Building2,
  FileText,
  Save,
  Loader2,
  Layers,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Award
} from 'lucide-react';

const LIFECYCLE_STEPS = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'CONFIGURATION', label: 'Configured' },
  { id: 'REGISTRATION_OPEN', label: 'Registration Open' },
  { id: 'PROJECT_REVIEW', label: 'Dossier Review' },
  { id: 'EVENT_READY', label: 'Floor Ready' },
  { id: 'ONGOING', label: 'Live Expo' },
  { id: 'EVALUATION', label: 'Jury Evaluation' },
  { id: 'RESULTS_PUBLISHED', label: 'Results Published' },
  { id: 'COMPLETED', label: 'Valedictory Done' }
];

export default function ProjectExpoSettingsPage() {
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

  const [config, setConfig] = useState({
    ParticipationType: 'Both',
    MinTeamSize: 1,
    MaxTeamSize: 4,
    AllowedDepartments: [],
    AllowedBranches: [],
    AllowedYears: [],
    SubmissionDeadline: '',
    MaxSubmissions: 50,
    TotalBooths: 20,
    BoothPrefix: 'STALL-',
    PresentationDurationMinutes: 15,
    Guidelines: '',
    RequiredDocuments: '',
    Status: 'CONFIGURATION'
  });

  const [domains, setDomains] = useState([]);
  const [newDomainName, setNewDomainName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [cfgRes, domRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/config`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/domains`)
      ]);

      const cfgData = await cfgRes.json();
      const domData = await domRes.json();

      if (cfgData.success && cfgData.config) {
        setConfig({
          ...cfgData.config,
          SubmissionDeadline: cfgData.config.SubmissionDeadline
            ? cfgData.config.SubmissionDeadline.split('T')[0]
            : ''
        });
      }
      if (domData.success && Array.isArray(domData.domains)) {
        setDomains(domData.domains);
      }
    } catch (err) {
      toast.error('Failed to load project expo configuration');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (newStatus) => {
    if (!eventId) return;
    try {
      setSavingStatus(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Status transition failed');
      }

      setConfig((prev) => ({ ...prev, Status: newStatus }));
      toast.success(`Expo lifecycle updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveConfig = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!eventId) return;

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save configuration');
      }

      toast.success('Project Expo configuration saved!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomainName.trim() || !eventId) return;

    const updated = [...domains, { DomainName: newDomainName.trim() }];
    try {
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: updated })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add domain');
      }

      toast.success(`Added "${newDomainName.trim()}"`);
      setNewDomainName('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error adding domain');
    }
  };

  const handleRemoveDomain = async (index) => {
    const updated = domains.filter((_, idx) => idx !== index);
    try {
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: updated })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove domain');
      }

      toast.success('Domain removed');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error removing domain');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading Project Expo Studio...</span>
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
            Project Expo Studio & Configuration
          </h1>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
            Configure domains, team eligibility, booth parameters, and event lifecycle status
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveConfig}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition shadow-sm cursor-pointer disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Expo Configuration</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* ── LIFECYCLE PROGRESS PIPELINE ── */}
        <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Event Lifecycle Pipeline
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Click any stage to transition the operational status for this exhibition
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Current: {config.Status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isCurrent = config.Status === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={savingStatus}
                  onClick={() => handleUpdateStatus(step.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                      : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <p className="text-xs font-mono text-gray-400 mb-1">Stage 0{idx + 1}</p>
                  <p className="text-sm font-semibold">{step.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN CONFIG FORM ── */}
        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Core Parameters */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Team & Participation Controls</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Participation Type
                  </label>
                  <select
                    value={config.ParticipationType}
                    onChange={(e) => setConfig({ ...config, ParticipationType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Both">Both (Individual & Team)</option>
                    <option value="Team">Team Only</option>
                    <option value="Individual">Individual Solo Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.MinTeamSize}
                    onChange={(e) => setConfig({ ...config, MinTeamSize: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.MaxTeamSize}
                    onChange={(e) => setConfig({ ...config, MaxTeamSize: parseInt(e.target.value, 10) || 4 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Dossier Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={config.SubmissionDeadline}
                    onChange={(e) => setConfig({ ...config, SubmissionDeadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Max Project Submissions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={config.MaxSubmissions}
                    onChange={(e) => setConfig({ ...config, MaxSubmissions: parseInt(e.target.value, 10) || 100 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Floor Plan & Pitch Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Total Exhibition Stalls
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={config.TotalBooths}
                    onChange={(e) => setConfig({ ...config, TotalBooths: parseInt(e.target.value, 10) || 50 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Stall Code Prefix
                  </label>
                  <input
                    type="text"
                    value={config.BoothPrefix}
                    onChange={(e) => setConfig({ ...config, BoothPrefix: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Pitch Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={config.PresentationDurationMinutes}
                    onChange={(e) => setConfig({ ...config, PresentationDurationMinutes: parseInt(e.target.value, 10) || 15 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Required Documents Checklist
                </label>
                <input
                  type="text"
                  value={config.RequiredDocuments}
                  onChange={(e) => setConfig({ ...config, RequiredDocuments: e.target.value })}
                  placeholder="e.g. Project Abstract (PDF), Final Presentation (PPT), Working Demo Video"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Exhibition Guidelines & Instructions
                </label>
                <textarea
                  rows={4}
                  value={config.Guidelines}
                  onChange={(e) => setConfig({ ...config, Guidelines: e.target.value })}
                  className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Domains */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <span>Technical Domains</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Categorize projects by innovation fields
                </p>
              </div>

              <div className="space-y-2.5">
                {domains.map((dom, idx) => (
                  <div
                    key={dom.Id || idx}
                    className="p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{dom.DomainName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(idx)}
                      className="text-gray-400 hover:text-rose-500 transition cursor-pointer p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <input
                  type="text"
                  placeholder="New domain name (e.g. Bio-Tech)"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddDomain}
                  className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Domain</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
