import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  Loader2,
  Trash2,
  RefreshCw,
  Printer,
  ArrowRight,
  ShieldCheck,
  X,
  MapPin,
  Layers
} from 'lucide-react';

export default function ProjectExpoBoothsPage() {
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

  const [booths, setBooths] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'ALLOCATED'

  // Batch generate modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    count: 25,
    prefix: 'STALL-',
    locationZone: 'Main Innovation Pavilion'
  });
  const [generating, setGenerating] = useState(false);

  // Allocate modal state
  const [allocatingBooth, setAllocatingBooth] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [allocating, setAllocating] = useState(false);

  // Deallocate modal state
  const [deallocatingBooth, setDeallocatingBooth] = useState(null);
  const [deallocating, setDeallocating] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [bRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/booths`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/submissions`)
      ]);

      const bData = await bRes.json();
      const sData = await sRes.json();

      if (bData.success && Array.isArray(bData.booths)) {
        setBooths(bData.booths);
      }
      if (sData.success && Array.isArray(sData.submissions)) {
        setSubmissions(sData.submissions);
      }
    } catch (err) {
      toast.error('Failed to load exhibition booths');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const total = booths.length;
    const allocated = booths.filter((b) => b.Status === 'ALLOCATED' || b.AllocatedTeamId).length;
    const available = total - allocated;
    return { total, allocated, available };
  }, [booths]);

  const filteredBooths = useMemo(() => {
    return booths.filter((b) => {
      const matchSearch =
        !search ||
        (b.BoothNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.TeamName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.ProjectTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.LocationZone || '').toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'AVAILABLE' && (b.Status === 'AVAILABLE' && !b.AllocatedTeamId)) ||
        (statusFilter === 'ALLOCATED' && (b.Status === 'ALLOCATED' || b.AllocatedTeamId));

      return matchSearch && matchStatus;
    });
  }, [booths, search, statusFilter]);

  const handleBatchGenerate = async (e) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      setGenerating(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/booths/batch-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate booths');
      }

      toast.success(`Successfully configured ${data.booths?.length || generateForm.count} stalls!`);
      setShowGenerateModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error generating booths');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmAllocate = async () => {
    if (!allocatingBooth || !selectedTeamId) {
      toast.error('Please select an exhibiting team to allocate.');
      return;
    }

    try {
      setAllocating(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/booths/${allocatingBooth.Id}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: parseInt(selectedTeamId, 10) })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Allocation failed');
      }

      toast.success(`${allocatingBooth.BoothNumber} successfully allocated!`);
      setAllocatingBooth(null);
      setSelectedTeamId('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error allocating booth');
    } finally {
      setAllocating(false);
    }
  };

  const handleConfirmDeallocate = async () => {
    if (!deallocatingBooth) return;

    try {
      setDeallocating(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/booths/${deallocatingBooth.Id}/deallocate`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Deallocation failed');
      }

      toast.success(`${deallocatingBooth.BoothNumber} is now available.`);
      setDeallocatingBooth(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error freeing booth');
    } finally {
      setDeallocating(false);
    }
  };

  const handlePrintDirectory = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading exhibition stalls...</span>
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
            Exhibition Stalls & Booth Allocation
          </h1>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
            Floor plan inventory, stall assignments, and live occupancy for Project Expo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrintDirectory}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            <span>Print Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Stalls</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── STATS TILES ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stalls Configured</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1.5">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Allocated Stalls</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.allocated}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Ready Stalls</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1.5">{stats.available}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800/80 text-gray-600 dark:text-gray-300">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── FILTER & SEARCH ── */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by stall number, team name, domain, or project..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Stalls ({booths.length})</option>
              <option value="AVAILABLE">Available Only ({stats.available})</option>
              <option value="ALLOCATED">Allocated Only ({stats.allocated})</option>
            </select>
          </div>
        </div>

        {/* ── VISUAL BOOTH GRID ── */}
        {filteredBooths.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-2xl p-12 sm:p-16 border border-gray-200 dark:border-zinc-800 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Stalls Configured</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
              Click "Configure Stalls" above to generate stall numbers (e.g. STALL-01 to STALL-20) for this exhibition.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBooths.map((booth) => {
              const isAllocated = Boolean(booth.AllocatedTeamId);
              return (
                <div
                  key={booth.Id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isAllocated
                      ? 'bg-white dark:bg-black border-emerald-500/40 shadow-xs hover:border-emerald-500'
                      : 'bg-white dark:bg-black border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                          {booth.BoothNumber}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{booth.LocationZone || 'Main Hall'}</span>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          isAllocated
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        • {isAllocated ? 'Allocated' : 'Available'}
                      </span>
                    </div>

                    {isAllocated ? (
                      <div className="space-y-1.5 my-4 text-xs">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {booth.TeamName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {booth.ProjectTitle || 'Project submission details registered'}
                        </p>
                        {booth.DomainName && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
                            • {booth.DomainName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="my-6 text-center text-xs text-gray-400 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-dashed border-gray-200 dark:border-zinc-800">
                        Ready for team allocation
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    {isAllocated ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setAllocatingBooth(booth);
                            setSelectedTeamId(String(booth.AllocatedTeamId || ''));
                          }}
                          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeallocatingBooth(booth)}
                          className="font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          Free Stall
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAllocatingBooth(booth);
                          setSelectedTeamId('');
                        }}
                        className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Allocate Team</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── BATCH GENERATE MODAL ── */}
        <AnimatePresence>
          {showGenerateModal && (
            <div key="gen-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !generating && setShowGenerateModal(false)}
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
                      Configure Exhibition Stalls
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Batch generate numbered booths for this Project Expo event.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => setShowGenerateModal(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBatchGenerate} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Total Number of Stalls
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={generateForm.count}
                      onChange={(e) => setGenerateForm({ ...generateForm, count: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Stall Code Prefix
                    </label>
                    <input
                      type="text"
                      value={generateForm.prefix}
                      onChange={(e) => setGenerateForm({ ...generateForm, prefix: e.target.value })}
                      placeholder="e.g. STALL- or EXPO-"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Pavilion / Hall Zone
                    </label>
                    <input
                      type="text"
                      value={generateForm.locationZone}
                      onChange={(e) => setGenerateForm({ ...generateForm, locationZone: e.target.value })}
                      placeholder="e.g. Innovation Hall A, Main Arena"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={generating}
                      onClick={() => setShowGenerateModal(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generating}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Generate Stalls</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── ALLOCATE STALL MODAL ── */}
        <AnimatePresence>
          {allocatingBooth && (
            <div key="alloc-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !allocating && setAllocatingBooth(null)}
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
                      Allocate {allocatingBooth.BoothNumber}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{allocatingBooth.LocationZone || 'Main Hall'}</p>
                  </div>
                  <button
                    type="button"
                    disabled={allocating}
                    onClick={() => setAllocatingBooth(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Select Exhibiting Team *
                    </label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">-- Choose an Exhibiting Team --</option>
                      {submissions.map((sub) => (
                        <option key={sub.TeamId} value={sub.TeamId}>
                          {sub.TeamName} — {sub.ProjectTitle} ({sub.Status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    • Assigning will automatically send a real-time notification with booth details to the team leader.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={allocating}
                      onClick={() => setAllocatingBooth(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={allocating || !selectedTeamId}
                      onClick={handleConfirmAllocate}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {allocating && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Confirm Allocation</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DEALLOCATE MODAL ── */}
        <AppConfirmModal
          isOpen={Boolean(deallocatingBooth)}
          title={`Free Up ${deallocatingBooth?.BoothNumber}`}
          message={`Are you sure you want to remove team "${deallocatingBooth?.TeamName}" from ${deallocatingBooth?.BoothNumber}? The booth will become available for another exhibiting team.`}
          confirmText="Free Stall"
          onConfirm={handleConfirmDeallocate}
          onCancel={() => setDeallocatingBooth(null)}
          loading={deallocating}
          variant="warning"
        />
      </div>
    </motion.div>
  );
}
