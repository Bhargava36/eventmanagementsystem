import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Building,
  GraduationCap,
  QrCode,
  HeartHandshake,
  UserCheck,
  X,
  FileSpreadsheet,
  RefreshCw,
  Phone,
  Mail
} from 'lucide-react';
export default function AlumniRegistrationsPage() {
  const toast = useToast();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = admin?.EventId;
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedRsvp, setSelectedRsvp] = useState('ALL');
  const [selectedCheckIn, setSelectedCheckIn] = useState('ALL');
  // Modal for Viewing Detail & QR Ticket
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeAlumnus, setActiveAlumnus] = useState(null);
  const loadRegistrations = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/registrations`);
      if (!res.ok) throw new Error('Failed to fetch alumni directory');
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error(err);
      toast.error('Error loading alumni registrations');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);
  // Unique batches for filter dropdown
  const batchOptions = useMemo(() => {
    const batches = new Set();
    registrations.forEach((r) => {
      if (r.GraduationYear) batches.add(String(r.GraduationYear).trim());
    });
    return Array.from(batches).sort().reverse();
  }, [registrations]);
  // Filtered registrations
  const filteredList = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.UserName || '').toLowerCase().includes(q) ||
        (r.Email || '').toLowerCase().includes(q) ||
        (r.CurrentCompany || '').toLowerCase().includes(q) ||
        (r.Designation || '').toLowerCase().includes(q) ||
        (r.City || '').toLowerCase().includes(q) ||
        (r.GraduationYear || '').toLowerCase().includes(q);
      const matchBatch = selectedBatch === 'ALL' || String(r.GraduationYear) === selectedBatch;
      const matchRsvp = selectedRsvp === 'ALL' || (r.RsvpStatus || 'ATTENDING').toUpperCase() === selectedRsvp;
      const matchCheckIn =
        selectedCheckIn === 'ALL' ||
        (selectedCheckIn === 'CheckedIn' ? r.GateCheckInStatus === 'CheckedIn' : r.GateCheckInStatus !== 'CheckedIn');
      return matchSearch && matchBatch && matchRsvp && matchCheckIn;
    });
  }, [registrations, searchQuery, selectedBatch, selectedRsvp, selectedCheckIn]);
  // CSV Export
  const handleExportCSV = () => {
    if (registrations.length === 0) {
      toast.info('No registrations to export');
      return;
    }
    const headers = [
      'Registration ID',
      'Alumnus Name',
      'Email',
      'Mobile',
      'Graduation Batch',
      'Current Company',
      'Designation',
      'City',
      'Guest Count',
      'Guest Names',
      'RSVP Status',
      'Gate Check-In Status',
      'Gate Check-In Time',
      'Banquet Food Token Scanned'
    ];
    const rows = filteredList.map((r) => [
      `"${r.TeamId || ''}"`,
      `"${r.UserName || 'Alumnus'}"`,
      `"${r.Email || ''}"`,
      `"${r.Mobile || ''}"`,
      `"${r.GraduationYear || ''}"`,
      `"${(r.CurrentCompany || '').replace(/"/g, '""')}"`,
      `"${(r.Designation || '').replace(/"/g, '""')}"`,
      `"${(r.City || '').replace(/"/g, '""')}"`,
      `"${r.GuestCount || 0}"`,
      `"${(r.GuestNames || '').replace(/"/g, '""')}"`,
      `"${r.RsvpStatus || 'ATTENDING'}"`,
      `"${r.GateCheckInStatus || 'Registered'}"`,
      `"${r.GateCheckInTime ? new Date(r.GateCheckInTime).toLocaleString('en-IN') : ''}"`,
      `"${r.FoodTokenScanned ? 'YES' : 'NO'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Alumni_Directory_Event_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Alumni directory downloaded');
  };
  const handleOpenDetail = (alumnus) => {
    setActiveAlumnus(alumnus);
    setDetailModalOpen(true);
  };
  // Quick stats
  const totalCount = registrations.length;
  const attendingCount = registrations.filter((r) => (r.RsvpStatus || 'ATTENDING').toUpperCase() === 'ATTENDING').length;
  const totalGuests = registrations.reduce((acc, r) => acc + (Number(r.GuestCount) || 0), 0);
  const checkedInCount = registrations.filter((r) => r.GateCheckInStatus === 'CheckedIn').length;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Alumni Directory &amp; RSVP Roster</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
            Registered Alumni &amp; Guests
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Browse confirmed attendees, inspect guest allocations, verify check-in progress, and export the official reunion directory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRegistrations}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all text-gray-600 dark:text-zinc-300 cursor-pointer"
            title="Refresh Roster"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Directory CSV
          </button>
        </div>
      </div>
      {/* KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-zinc-400">Total Registered</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-zinc-400">Confirmed RSVPs</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{attendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-zinc-400">Accompanying Guests</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">+{totalGuests}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-zinc-400">Gate Checked-In</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{checkedInCount}</p>
        </div>
      </div>
      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, city, batch..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Batches</option>
            {batchOptions.map((b) => (
              <option key={b} value={b}>
                Class of {b}
              </option>
            ))}
          </select>
          {/* RSVP Filter */}
          <select
            value={selectedRsvp}
            onChange={(e) => setSelectedRsvp(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All RSVPs</option>
            <option value="ATTENDING">Attending</option>
            <option value="TENTATIVE">Tentative</option>
            <option value="NOT_ATTENDING">Not Attending</option>
          </select>
          {/* Gate Check-in Filter */}
          <select
            value={selectedCheckIn}
            onChange={(e) => setSelectedCheckIn(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Check-Ins</option>
            <option value="CheckedIn">Checked In at Gate</option>
            <option value="Pending">Not Yet Arrived</option>
          </select>
        </div>
      </div>
      {/* Directory Table */}
      <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 dark:bg-black border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Alumnus</th>
                <th className="p-4">Class Year</th>
                <th className="p-4">Career &amp; Organization</th>
                <th className="p-4">City</th>
                <th className="p-4">Guests</th>
                <th className="p-4">RSVP</th>
                <th className="p-4">Gate Check-In</th>
                <th className="p-4">Banquet Token</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-400 dark:text-zinc-500">
                    No alumni registrations found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((r) => {
                  const isCheckedIn = r.GateCheckInStatus === 'CheckedIn';
                  const isFoodScanned = Boolean(r.FoodTokenScanned);
                  return (
                    <tr
                      key={r.TeamId}
                      className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Alumnus Identity */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {r.Photo ? (
                            <img
                              src={r.Photo}
                              alt={r.UserName}
                              className="w-9 h-9 rounded-xl object-cover border border-emerald-500/30"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs">
                              {r.UserName?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {r.UserName || 'Alumnus'}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {r.Email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Class Year */}
                      <td className="p-4">
                        <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                          Class of {r.GraduationYear || 'N/A'}
                        </span>
                      </td>
                      {/* Career */}
                      <td className="p-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          <p className="font-semibold text-gray-800 dark:text-zinc-200 truncate">
                            {r.Designation || 'Alumnus Member'}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
                            {r.CurrentCompany || 'Independent'}
                          </p>
                        </div>
                      </td>
                      {/* City */}
                      <td className="p-4 text-gray-600 dark:text-zinc-400">
                        {r.City ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400 dark:text-zinc-500" />
                            {r.City}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      {/* Guests */}
                      <td className="p-4">
                        {Number(r.GuestCount) > 0 ? (
                          <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                            +{r.GuestCount} ({r.GuestNames || 'Guest'})
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-600 text-xs">Solo</span>
                        )}
                      </td>
                      {/* RSVP */}
                      <td className="p-4">
                        <span
                          className={`text-xs font-semibold ${
                            (r.RsvpStatus || 'ATTENDING').toUpperCase() === 'ATTENDING'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-500 dark:text-zinc-400'
                          }`}
                        >
                          • {r.RsvpStatus || 'ATTENDING'}
                        </span>
                      </td>
                      {/* Gate Check-In */}
                      <td className="p-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
                            <Clock className="w-3.5 h-3.5" />
                            Registered
                          </span>
                        )}
                      </td>
                      {/* Banquet Token */}
                      <td className="p-4">
                        {isFoodScanned ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            • Claimed ✓
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-600 text-xs">• Unclaimed</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(r)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-gray-100 dark:bg-zinc-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all text-gray-700 dark:text-zinc-200 border border-gray-200 dark:border-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          View Pass
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* DETAIL & DIGITAL PASS MODAL */}
      <AnimatePresence>
        {detailModalOpen && activeAlumnus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setDetailModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-center space-y-1.5 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  • Alumni VIP Credential
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {activeAlumnus.UserName || 'Alumnus Member'}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  Class of {activeAlumnus.GraduationYear || 'Alumnus'} • {activeAlumnus.College || 'College of Engineering'}
                </p>
              </div>
              {/* QR Code Container */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  <QRCodeSVG
                    value={JSON.stringify({
                      type: 'alumni_gate',
                      teamId: activeAlumnus.TeamId,
                      eventId: activeAlumnus.EventId,
                      userId: activeAlumnus.UserId
                    })}
                    size={160}
                    level="H"
                  />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-zinc-400">
                    Registration ID: #{activeAlumnus.TeamId}
                  </span>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                    Scan at Entrance Gate for instantaneous verification
                  </p>
                </div>
              </div>
              {/* Alumnus Career & Guest Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500 dark:text-zinc-400">Company &amp; Role</span>
                  <span className="font-semibold text-right text-gray-900 dark:text-white">
                    {activeAlumnus.Designation} {activeAlumnus.CurrentCompany && `@ ${activeAlumnus.CurrentCompany}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500 dark:text-zinc-400">Email</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{activeAlumnus.Email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500 dark:text-zinc-400">Mobile</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{activeAlumnus.Mobile || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-zinc-800/60">
                  <span className="text-gray-500 dark:text-zinc-400">Guest Allocation</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Number(activeAlumnus.GuestCount) > 0
                      ? `+${activeAlumnus.GuestCount} (${activeAlumnus.GuestNames || 'Accompanying'})`
                      : 'None (Solo Attendee)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 dark:text-zinc-400">Banquet Token</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeAlumnus.FoodTokenScanned ? 'Claimed ✓' : 'Unclaimed'}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow cursor-pointer transition"
                >
                  Close Pass Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
