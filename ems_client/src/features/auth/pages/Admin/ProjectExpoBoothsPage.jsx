import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import Pagination from '../../../../components/Molecules/Pagination';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
  Printer,
  Trash2,
  X,
  MapPin,
  Layers,
  LayoutGrid,
  List,
  Users,
  Sparkles,
  AlertCircle,
  FileText,
  UserCheck
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
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'LIST'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

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

  // Delete stall modal state
  const [deletingBooth, setDeletingBooth] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Reset page when search, filter or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedZone, pageSize, viewMode]);

  // Distinct Zones
  const zones = useMemo(() => {
    const set = new Set();
    booths.forEach((b) => {
      if (b.LocationZone) set.add(b.LocationZone.trim());
    });
    return Array.from(set);
  }, [booths]);

  // Set of teams that are ALREADY allocated to any stall
  const allocatedTeamIds = useMemo(() => {
    const ids = new Set();
    booths.forEach((b) => {
      if (b.AllocatedTeamId) {
        ids.add(Number(b.AllocatedTeamId));
      }
    });
    return ids;
  }, [booths]);

  // Submissions eligible for allocation in the modal:
  // Excludes teams allocated to any other booth, but permits the currently assigned team if reassigning
  const eligibleSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const subTeamId = Number(sub.TeamId);
      const isCurrentBoothTeam =
        allocatingBooth?.AllocatedTeamId &&
        Number(allocatingBooth.AllocatedTeamId) === subTeamId;
      return isCurrentBoothTeam || !allocatedTeamIds.has(subTeamId);
    });
  }, [submissions, allocatedTeamIds, allocatingBooth]);

  // Currently selected team in the allocate modal (for real-time preview)
  const selectedTeamDetails = useMemo(() => {
    if (!selectedTeamId) return null;
    return submissions.find((s) => String(s.TeamId) === String(selectedTeamId));
  }, [submissions, selectedTeamId]);

  // Floor stats
  const stats = useMemo(() => {
    const total = booths.length;
    const allocated = booths.filter((b) => b.Status === 'ALLOCATED' || b.AllocatedTeamId).length;
    const available = total - allocated;
    const unallocatedTeamsCount = submissions.filter((s) => !allocatedTeamIds.has(Number(s.TeamId))).length;
    const occupancyPercentage = total > 0 ? Math.round((allocated / total) * 100) : 0;
    return { total, allocated, available, unallocatedTeamsCount, occupancyPercentage };
  }, [booths, submissions, allocatedTeamIds]);

  const filteredBooths = useMemo(() => {
    return booths.filter((b) => {
      const matchSearch =
        !search ||
        (b.BoothNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.TeamName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.ProjectTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.DomainName || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.LocationZone || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'AVAILABLE' && (b.Status === 'AVAILABLE' && !b.AllocatedTeamId)) ||
        (statusFilter === 'ALLOCATED' && (b.Status === 'ALLOCATED' || b.AllocatedTeamId));
      const matchZone = selectedZone === 'ALL' || b.LocationZone === selectedZone;
      return matchSearch && matchStatus && matchZone;
    });
  }, [booths, search, statusFilter, selectedZone]);

  const totalPages = Math.max(1, Math.ceil(filteredBooths.length / pageSize));
  const paginatedBooths = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooths.slice(start, start + pageSize);
  }, [filteredBooths, currentPage, pageSize]);

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

  const handleConfirmDelete = async () => {
    if (!deletingBooth) return;
    if (deletingBooth.AllocatedTeamId || deletingBooth.Status === 'ALLOCATED') {
      toast.error(`Cannot delete ${deletingBooth.BoothNumber} because team "${deletingBooth.TeamName}" is assigned. Please free the stall before deleting.`);
      setDeletingBooth(null);
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/booths/${deletingBooth.Id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete stall');
      }
      toast.success(`Stall ${deletingBooth.BoothNumber} was deleted.`);
      setDeletingBooth(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error deleting stall');
    } finally {
      setDeleting(false);
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
          <span>Loading exhibition floor inventory...</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 pt-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Exhibition Floor & Stall Allocation Command
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm sm:text-base mt-1">
            Real-time floor occupancy, team allocations, and exhibition stall directory
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePrintDirectory}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-400" />
            <span>Print Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Stalls</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── ARCHITECTURAL TELEMETRY & LIVE OCCUPANCY BANNER ── */}
        <div className="bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Occupancy Gauge */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-zinc-400">
                    Live Floor Occupancy
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white font-heading">
                      {stats.occupancyPercentage}%
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                      ({stats.allocated} of {stats.total} stalls occupied)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Sync
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-zinc-900 overflow-hidden p-0.5 border border-gray-200 dark:border-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                  style={{ width: `${stats.occupancyPercentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {stats.available} exhibition bays ready for incoming teams.
              </p>
            </div>

            {/* Metric telemetry counters */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-zinc-800/80 lg:pl-8">
              <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400">
                  <span className="text-xs uppercase tracking-wider font-semibold">Total Capacity</span>
                  <Building2 className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold font-heading text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">Configured bays</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="text-xs uppercase tracking-wider font-semibold">Allocated</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-2">
                  {stats.allocated}
                </p>
                <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Active teams on floor</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400">
                  <span className="text-xs uppercase tracking-wider font-semibold">Teams in Queue</span>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold font-heading text-gray-900 dark:text-white mt-2">
                  {stats.unallocatedTeamsCount}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                  {stats.unallocatedTeamsCount === 0 ? 'All teams assigned' : 'Awaiting stall'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTER TABS, ZONE SELECTOR & SEARCH ── */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status subnav tabs */}
          <div className="flex items-center gap-1 border-b md:border-b-0 border-gray-100 dark:border-zinc-800 pb-3 md:pb-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Stalls ({booths.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALLOCATED')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALLOCATED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Allocated ({stats.allocated})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Available Ready ({stats.available})
            </button>
          </div>

          {/* Right search, zone, view toggle */}
          <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stall code, team, domain..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-xs text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
              />
            </div>

            {zones.length > 1 && (
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black text-xs text-gray-800 dark:text-zinc-200 outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option value="ALL">All Zones</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            )}

            {/* View switcher: Grid vs Table */}
            <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden p-0.5 bg-gray-50 dark:bg-black shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'
                }`}
                title="Bay Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'LIST'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'
                }`}
                title="Directory Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── STALL CONTENT CONTAINER ── */}
        {filteredBooths.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-3xl p-12 sm:p-16 border border-gray-200 dark:border-zinc-800 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-40" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">No Stalls Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
              No exhibition stalls match your current search or filter criteria. Click "Configure Stalls" above to generate booths.
            </p>
          </div>
        ) : viewMode === 'GRID' ? (
          /* ── MINIMAL, HIGH-ELEGANCE STALL BAYS GRID ── */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBooths.map((booth) => {
                const isAllocated = Boolean(booth.AllocatedTeamId);
                return (
                  <div
                    key={booth.Id}
                    className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between p-6 bg-white dark:bg-black shadow-xs hover:shadow-md min-h-[250px] ${
                      isAllocated
                        ? 'border-gray-200 dark:border-zinc-800 hover:border-emerald-500/40'
                        : 'border-gray-200 dark:border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Stall Header: Bay Code & Status Dot */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-tight">
                            {booth.BoothNumber}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                            <span className="truncate">{booth.LocationZone || 'Main Innovation Hall'}</span>
                          </p>
                        </div>

                        {/* Clean Status Dot & Delete Action */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-semibold ${
                                isAllocated
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-zinc-500 dark:text-zinc-400'
                              }`}
                            >
                              {isAllocated ? 'Allocated' : 'Available'}
                            </span>
                          </div>
                          {isAllocated ? (
                            <button
                              type="button"
                              onClick={() => toast.error(`Cannot remove ${booth.BoothNumber} because team "${booth.TeamName}" is currently assigned. Free the stall first.`)}
                              className="p-1.5 rounded-lg text-gray-300 dark:text-zinc-700 hover:text-gray-400 dark:hover:text-zinc-600 cursor-not-allowed transition"
                              title="Cannot remove stall with active assigned team. Free stall first."
                            >
                              <Trash2 className="w-3.5 h-3.5 opacity-40" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingBooth(booth)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                              title={`Delete ${booth.BoothNumber} from floor inventory`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stall Body: Clean, unboxed natural typography */}
                      {isAllocated ? (
                        <div className="mt-4 space-y-1.5">
                          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {booth.TeamName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                            {booth.ProjectTitle || 'Project details registered'}
                          </p>
                          {booth.DomainName && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-2 flex items-center gap-1.5">
                              <span className="truncate">{booth.DomainName}</span>
                            </p>
                          )}
                          {booth.LeaderName && (
                            <p className="text-xs text-gray-500 dark:text-zinc-400 pt-0.5">
                              Lead: <span className="text-gray-700 dark:text-zinc-300 font-medium">{booth.LeaderName}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-6 mb-2">
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                            Ready for team allocation. Power supply and exhibition display area ready.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Stall Actions: Clean and spacious without heavy borders */}
                    <div className="pt-6 flex items-center justify-between text-xs">
                      {isAllocated ? (
                        <div className="flex items-center justify-between w-full gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setAllocatingBooth(booth);
                              setSelectedTeamId(String(booth.AllocatedTeamId || ''));
                            }}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          >
                            Reassign
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeallocatingBooth(booth)}
                            className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40  font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          >
                            Free Stall
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setAllocatingBooth(booth);
                              setSelectedTeamId('');
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Allocate Team</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBooth(booth)}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title={`Delete ${booth.BoothNumber}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Component */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredBooths.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[6, 9, 12, 18, 24]}
                itemName="stalls"
              />
            </div>
          </div>
        ) : (
          /* ── DIRECTORY TABLE VIEW ── */
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-xs space-y-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 dark:bg-black border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="py-4 px-6">Stall Bay & Location</th>
                    <th className="py-4 px-6">Occupancy Status</th>
                    <th className="py-4 px-6">Exhibiting Team & Leader</th>
                    <th className="py-4 px-6">Project Title</th>
                    <th className="py-4 px-6">Domain / Track</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {paginatedBooths.map((booth) => {
                    const isAllocated = Boolean(booth.AllocatedTeamId);
                    return (
                      <tr key={booth.Id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="font-bold text-gray-900 dark:text-white font-heading text-base block">
                            {booth.BoothNumber}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{booth.LocationZone || 'Main Hall'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                              isAllocated
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {isAllocated ? 'Allocated' : 'Available'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {isAllocated ? (
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{booth.TeamName}</p>
                              {booth.LeaderName && (
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Lead: {booth.LeaderName}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-zinc-500 italic">No team assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          {isAllocated ? (
                            <p className="text-xs text-gray-700 dark:text-zinc-300 line-clamp-2">
                              {booth.ProjectTitle || 'Registered project'}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {booth.DomainName ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                               {booth.DomainName}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          {isAllocated ? (
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setAllocatingBooth(booth);
                                  setSelectedTeamId(String(booth.AllocatedTeamId || ''));
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              >
                                Reassign
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeallocatingBooth(booth)}
                                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-zinc-900 font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                              >
                                Free Stall
                              </button>
                              <button
                                type="button"
                                onClick={() => toast.error(`Cannot remove ${booth.BoothNumber} because team "${booth.TeamName}" is currently assigned. Free the stall first.`)}
                                className="p-1.5 rounded-lg text-gray-300 dark:text-zinc-700 hover:text-gray-400 dark:hover:text-zinc-600 cursor-not-allowed transition"
                                title="Cannot remove stall with active assigned team. Free stall first."
                              >
                                <Trash2 className="w-3.5 h-3.5 opacity-40" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setAllocatingBooth(booth);
                                  setSelectedTeamId('');
                                }}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Allocate</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingBooth(booth)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                                title={`Delete ${booth.BoothNumber}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBooths.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 9, 12, 18, 24]}
              itemName="stalls"
            />
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
                className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={generating}
                      onClick={() => setShowGenerateModal(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generating}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-xs disabled:opacity-60 flex items-center gap-2"
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

        {/* ── ALLOCATE STALL MODAL (WITH ONLY UNALLOCATED TEAMS & LIVE PREVIEW) ── */}
        <AnimatePresence>
          {allocatingBooth && (
            <div key="alloc-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !allocating && setAllocatingBooth(null)}
                className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 shadow-2xl z-10 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                      Allocate {allocatingBooth.BoothNumber}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{allocatingBooth.LocationZone || 'Main Innovation Hall'}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={allocating}
                    onClick={() => setAllocatingBooth(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Select Exhibiting Team *
                      </label>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {eligibleSubmissions.length} available to assign
                      </span>
                    </div>

                    {eligibleSubmissions.length === 0 ? (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>All registered teams have already been assigned to other stalls!</span>
                      </div>
                    ) : (
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium cursor-pointer"
                      >
                        <option value="">-- Choose an Unassigned Team --</option>
                        {eligibleSubmissions.map((sub) => (
                          <option key={sub.TeamId} value={sub.TeamId}>
                            {sub.TeamName} — {sub.ProjectTitle} ({sub.DomainName || 'Track'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Real-time preview of selected team */}
                  {selectedTeamDetails && (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">Team:</span>
                        <strong className="text-gray-900 dark:text-white font-bold">{selectedTeamDetails.TeamName}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">Team Lead:</span>
                        <span className="text-gray-800 dark:text-zinc-200">{selectedTeamDetails.LeaderName || 'Registered Lead'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-zinc-400">Track:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{selectedTeamDetails.DomainName || 'General Engineering'}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200/60 dark:border-zinc-800 text-gray-600 dark:text-zinc-300">
                        <p className="line-clamp-2 leading-relaxed italic">"{selectedTeamDetails.ProjectTitle}"</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    • Assigning will lock this stall to the team and make the booth number visible on their dashboard.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={allocating}
                      onClick={() => setAllocatingBooth(null)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={allocating || !selectedTeamId || eligibleSubmissions.length === 0}
                      onClick={handleConfirmAllocate}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
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
          message={`Are you sure you want to remove team "${deallocatingBooth?.TeamName}" from ${deallocatingBooth?.BoothNumber}? The booth will become immediately available for other unassigned teams.`}
          confirmText="Free Stall"
          onConfirm={handleConfirmDeallocate}
          onCancel={() => setDeallocatingBooth(null)}
          loading={deallocating}
          variant="warning"
        />

        {/* ── DELETE BOOTH MODAL ── */}
        <AppConfirmModal
          isOpen={Boolean(deletingBooth)}
          title={`Delete Stall ${deletingBooth?.BoothNumber}`}
          message={`Are you sure you want to permanently delete ${deletingBooth?.BoothNumber} (${deletingBooth?.LocationZone || 'Main Hall'}) from the exhibition floor inventory? This action cannot be undone.`}
          confirmText="Delete Stall"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingBooth(null)}
          loading={deleting}
          variant="danger"
        />
      </div>
    </motion.div>
  );
}
