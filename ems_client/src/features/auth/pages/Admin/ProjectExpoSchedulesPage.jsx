import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import AppConfirmModal from '../../../../components/Molecules/AppConfirmModal';
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Users,
  Building2,
  Loader2,
  AlertTriangle,
  X,
  UserCheck
} from 'lucide-react';

export default function ProjectExpoSchedulesPage() {
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

  const [schedules, setSchedules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedJudgeFilter, setSelectedJudgeFilter] = useState('ALL');

  // Create / Edit modal
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotForm, setSlotForm] = useState({
    TeamId: '',
    SlotDate: '',
    StartTime: '10:00',
    EndTime: '10:20',
    RoomOrBooth: '',
    JudgeId: '',
    Status: 'SCHEDULED'
  });
  const [savingSlot, setSavingSlot] = useState(false);

  // Delete modal
  const [deletingSlotId, setDeletingSlotId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [schRes, subRes, jdgRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/schedules`),
        fetch(`${API_BASE_URL}/api/project-expo/${eventId}/submissions`),
        fetch(`${API_BASE_URL}/api/evaluators/event/${eventId}`)
      ]);

      const schData = await schRes.json();
      const subData = await subRes.json();
      const jdgData = await jdgRes.json();

      if (schData.success && Array.isArray(schData.schedules)) {
        setSchedules(schData.schedules);
      }
      if (subData.success && Array.isArray(subData.submissions)) {
        setSubmissions(subData.submissions);
      }
      if (jdgData.success && Array.isArray(jdgData.evaluators)) {
        setJudges(jdgData.evaluators);
      }
    } catch (err) {
      toast.error('Failed to load presentation schedules');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const total = schedules.length;
    const completed = schedules.filter((s) => s.Status === 'COMPLETED').length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((sch) => {
      const matchSearch =
        !search ||
        (sch.TeamName || '').toLowerCase().includes(search.toLowerCase()) ||
        (sch.ProjectTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (sch.JudgeName || '').toLowerCase().includes(search.toLowerCase()) ||
        (sch.RoomOrBooth || '').toLowerCase().includes(search.toLowerCase());

      const matchJudge =
        selectedJudgeFilter === 'ALL' || String(sch.JudgeId) === String(selectedJudgeFilter);

      return matchSearch && matchJudge;
    });
  }, [schedules, search, selectedJudgeFilter]);

  const handleOpenCreate = () => {
    setEditingSlotId(null);
    setSlotForm({
      TeamId: submissions[0]?.TeamId ? String(submissions[0].TeamId) : '',
      SlotDate: new Date().toISOString().split('T')[0],
      StartTime: '10:00',
      EndTime: '10:20',
      RoomOrBooth: 'STALL-01',
      JudgeId: judges[0]?.Id ? String(judges[0].Id) : '',
      Status: 'SCHEDULED'
    });
    setShowSlotModal(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlotId(slot.Id);
    setSlotForm({
      TeamId: String(slot.TeamId),
      SlotDate: slot.SlotDate ? slot.SlotDate.split('T')[0] : '',
      StartTime: slot.StartTime ? slot.StartTime.slice(0, 5) : '10:00',
      EndTime: slot.EndTime ? slot.EndTime.slice(0, 5) : '10:20',
      RoomOrBooth: slot.RoomOrBooth || '',
      JudgeId: slot.JudgeId ? String(slot.JudgeId) : '',
      Status: slot.Status || 'SCHEDULED'
    });
    setShowSlotModal(true);
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!eventId) return;

    if (!slotForm.TeamId || !slotForm.SlotDate || !slotForm.StartTime || !slotForm.EndTime) {
      toast.error('Please complete team, date, and slot time range.');
      return;
    }

    try {
      setSavingSlot(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/${eventId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Id: editingSlotId || undefined,
          EventId: eventId,
          TeamId: parseInt(slotForm.TeamId, 10),
          SlotDate: slotForm.SlotDate,
          StartTime: slotForm.StartTime,
          EndTime: slotForm.EndTime,
          RoomOrBooth: slotForm.RoomOrBooth || null,
          JudgeId: slotForm.JudgeId ? parseInt(slotForm.JudgeId, 10) : null,
          Status: slotForm.Status
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save presentation slot');
      }

      toast.success(editingSlotId ? 'Slot updated successfully!' : 'Slot scheduled successfully!');
      setShowSlotModal(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving slot');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSlotId) return;

    try {
      setDeleting(true);
      const res = await fetch(`${API_BASE_URL}/api/project-expo/schedules/${deletingSlotId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove schedule');
      }

      toast.success('Presentation slot removed.');
      setDeletingSlotId(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error removing slot');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading presentation schedules...</span>
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
            Project Presentation & Demo Schedules
          </h1>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
            Assign demonstration time slots and evaluation juries to prevent floor crowding
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Demo Slot</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── STATS TILES ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scheduled Slots</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1.5">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800/80 text-gray-700 dark:text-gray-300">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed Presentations</p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.completed}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-black rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm transition hover:shadow-md flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending Rounds</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ── SEARCH & FILTER ── */}
        <div className="bg-white dark:bg-black rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team, project, judge, or stall location..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedJudgeFilter}
              onChange={(e) => setSelectedJudgeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-black text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-emerald-500 font-medium"
            >
              <option value="ALL">All Evaluators ({judges.length})</option>
              {judges.map((j) => (
                <option key={j.Id} value={j.Id}>
                  Judge: {j.Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── SCHEDULES TIMELINE TABLE ── */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-2xl p-12 sm:p-16 border border-gray-200 dark:border-zinc-800 text-center">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No Schedules Added</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-md mx-auto">
              Click "Schedule Demo Slot" above to assign presenting time slots and judges to your exhibiting teams.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="py-4 px-6">Time Slot & Date</th>
                    <th className="py-4 px-6">Exhibiting Team & Project</th>
                    <th className="py-4 px-6">Assigned Jury</th>
                    <th className="py-4 px-6">Stall Location</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                  {filteredSchedules.map((sch) => (
                    <tr key={sch.Id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {sch.StartTime} - {sch.EndTime}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                          {sch.SlotDate ? new Date(sch.SlotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 dark:text-white">{sch.TeamName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-sm mt-0.5">
                          {sch.ProjectTitle || 'No project title registered'}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{sch.JudgeName || 'Pending Assignment'}</span>
                        </p>
                        {sch.JudgeDesignation && (
                          <p className="text-xs text-gray-400 mt-0.5">{sch.JudgeDesignation}</p>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium text-xs">
                          <Building2 className="w-3 h-3 text-emerald-600" />
                          <span>{sch.RoomOrBooth || sch.BoothNumber || 'Exhibition Hall'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`text-xs font-semibold ${
                            sch.Status === 'COMPLETED'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          • {sch.Status === 'COMPLETED' ? 'Completed' : 'Scheduled'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sch)}
                            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingSlotId(sch.Id)}
                            className="font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CREATE / EDIT SLOT MODAL ── */}
        <AnimatePresence>
          {showSlotModal && (
            <div key="slot-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !savingSlot && setShowSlotModal(false)}
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
                      {editingSlotId ? 'Edit Presentation Slot' : 'Schedule Demo Slot'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Assign demonstration timing and panel judges for this team.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={savingSlot}
                    onClick={() => setShowSlotModal(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSlot} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Exhibiting Team *
                    </label>
                    <select
                      value={slotForm.TeamId}
                      onChange={(e) => setSlotForm({ ...slotForm, TeamId: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">-- Choose Team --</option>
                      {submissions.map((sub) => (
                        <option key={sub.TeamId} value={sub.TeamId}>
                          {sub.TeamName} — {sub.ProjectTitle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={slotForm.SlotDate}
                        onChange={(e) => setSlotForm({ ...slotForm, SlotDate: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Assigned Stall / Location
                      </label>
                      <input
                        type="text"
                        value={slotForm.RoomOrBooth}
                        onChange={(e) => setSlotForm({ ...slotForm, RoomOrBooth: e.target.value })}
                        placeholder="e.g. STALL-01 or Demo Room A"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={slotForm.StartTime}
                        onChange={(e) => setSlotForm({ ...slotForm, StartTime: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={slotForm.EndTime}
                        onChange={(e) => setSlotForm({ ...slotForm, EndTime: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Assigned Jury / Evaluator
                      </label>
                      <select
                        value={slotForm.JudgeId}
                        onChange={(e) => setSlotForm({ ...slotForm, JudgeId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="">-- No Specific Judge --</option>
                        {judges.map((j) => (
                          <option key={j.Id} value={j.Id}>
                            {j.Name} ({j.Role || 'Judge'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        value={slotForm.Status}
                        onChange={(e) => setSlotForm({ ...slotForm, Status: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="RESCHEDULED">Rescheduled</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                      type="button"
                      disabled={savingSlot}
                      onClick={() => setShowSlotModal(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingSlot}
                      className="px-6 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {savingSlot && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{editingSlotId ? 'Update Slot' : 'Confirm Slot'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DELETE MODAL ── */}
        <AppConfirmModal
          isOpen={Boolean(deletingSlotId)}
          title="Remove Presentation Slot"
          message="Are you sure you want to remove this scheduled presentation slot? You can reschedule it at any time."
          confirmText="Remove Slot"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingSlotId(null)}
          loading={deleting}
          variant="danger"
        />
      </div>
    </motion.div>
  );
}
