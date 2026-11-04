import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import { Html5Qrcode } from 'html5-qrcode';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  QrCode,
  RefreshCw,
  Calendar,
  X,
  Camera,
  Layers,
  Award,
  Users,
  Radio,
  FileSpreadsheet,
  Check,
  Building,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

function playCheckInSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // AudioContext ignored if blocked
  }
}

function calculateSeminarDays(startDateStr, endDateStr) {
  if (!startDateStr) {
    return [{ dayNumber: 1, label: 'Day 1', dateFormatted: '', weekday: '', fullDateIso: '', fullDate: null }];
  }

  const s = new Date(startDateStr);
  const e = endDateStr ? new Date(endDateStr) : new Date(startDateStr);

  const startUtc = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const endUtc = new Date(e.getFullYear(), e.getMonth(), e.getDate());

  let diffTime = endUtc.getTime() - startUtc.getTime();
  let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (isNaN(diffDays) || diffDays < 1) diffDays = 1;
  if (diffDays > 30) diffDays = 30;

  const daysList = [];
  for (let i = 0; i < diffDays; i++) {
    const current = new Date(startUtc);
    current.setDate(startUtc.getDate() + i);
    const dayNumber = i + 1;
    const dateFormatted = current.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const weekday = current.toLocaleDateString('en-GB', { weekday: 'short' });
    const fullDateIso = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    daysList.push({
      dayNumber,
      dateFormatted,
      weekday,
      fullDateIso,
      fullDate: current,
      label: `Day ${dayNumber}`
    });
  }

  return daysList;
}

export default function SeminarAttendancePage() {
  const toast = useToast();

  const [currentEventId, setCurrentEventId] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('admin') || '{}');
      return stored?.EventId || null;
    } catch {
      return null;
    }
  });

  const eventId = currentEventId;
  const admin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  })();

  const [eventData, setEventData] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [activeSlot, setActiveSlot] = useState('Morning');
  const [viewMode, setViewMode] = useState('session'); // 'session' or 'matrix'

  const [delegates, setDelegates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'checked_in', 'absent', 'pending'
  const [updatingId, setUpdatingId] = useState(null);
  const [ticketInput, setTicketInput] = useState('');

  // Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [lastScannedAttendee, setLastScannedAttendee] = useState(null);
  const html5QrCodeRef = useRef(null);

  const fetchEventDetails = useCallback(async () => {
    if (!currentEventId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${currentEventId}`);
      if (!res.ok) return;
      const data = await res.json();
      setEventData(data.event || data);
    } catch (e) {
      console.error('Failed to load event details:', e);
    }
  }, [currentEventId]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const seminarDays = useMemo(() => {
    const start = eventData?.StartDate || eventData?.VirtualStartDate;
    const end = eventData?.EndDate || eventData?.VirtualEndDate || start;
    return calculateSeminarDays(start, end);
  }, [eventData]);

  const totalDays = seminarDays.length;

  const fetchDelegates = useCallback(async () => {
    if (!currentEventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/seminars/${currentEventId}/delegates`);
      if (!res.ok) throw new Error('Failed to load delegates');
      const data = await res.json();
      setDelegates(data.delegates || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load seminar attendance records');
    } finally {
      setLoading(false);
    }
  }, [currentEventId, toast]);

  useEffect(() => {
    fetchDelegates();
  }, [fetchDelegates]);

  const markDelegateStatus = async (delegate, targetStatus) => {
    if (!eventId || !delegate?.UserId) return;
    setUpdatingId(delegate.UserId);

    try {
      const res = await fetch(`${API_BASE_URL}/api/seminars/${eventId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: delegate.UserId,
          teamId: delegate.TeamId,
          checkInBy: admin?.AdminName || admin?.UserName || 'Gate Coordinator',
          status: targetStatus
        })
      });

      if (!res.ok) throw new Error('Status update failed');

      setDelegates((prev) =>
        prev.map((d) =>
          Number(d.UserId) === Number(delegate.UserId)
            ? {
                ...d,
                CheckInStatus: targetStatus,
                CheckInTime: targetStatus === 'CheckedIn' ? new Date().toISOString() : null
              }
            : d
        )
      );

      if (targetStatus === 'CheckedIn') {
        playCheckInSound();
        toast.success(`Verified: ${delegate.UserName || 'Delegate'} marked Present in auditorium!`);
      } else if (targetStatus === 'Absent') {
        toast.error(`Marked ${delegate.UserName || 'Delegate'} as Absent`);
      } else {
        toast.info(`Reset attendance status for ${delegate.UserName || 'Delegate'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update attendance status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkMark = async (targetStatus) => {
    const pendingDelegates = filteredDelegates.filter(
      (d) => d.CheckInStatus !== 'CheckedIn' && d.CheckInStatus !== 'Absent'
    );
    if (pendingDelegates.length === 0) {
      toast.info('No pending delegates to mark in this view');
      return;
    }

    try {
      setLoading(true);
      for (const delegate of pendingDelegates) {
        await fetch(`${API_BASE_URL}/api/seminars/${eventId}/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: delegate.UserId,
            teamId: delegate.TeamId,
            checkInBy: admin?.AdminName || admin?.UserName || 'Gate Desk',
            status: targetStatus
          })
        });
      }
      toast.success(
        `Updated ${pendingDelegates.length} delegates as ${targetStatus === 'CheckedIn' ? 'Present' : 'Absent'}!`
      );
      await fetchDelegates();
    } catch (err) {
      console.error(err);
      toast.error('Failed bulk update');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (delegate) => {
    if (!eventId || !delegate?.UserId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/seminars/${eventId}/certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: delegate.UserId })
      });
      if (!res.ok) throw new Error('Failed to issue certificate');
      toast.success(`Certificate released for ${delegate.UserName}`);
      setDelegates((prev) =>
        prev.map((d) => (d.UserId === delegate.UserId ? { ...d, CertificateIssued: true } : d))
      );
    } catch (err) {
      console.error(err);
      toast.error('Could not release certificate');
    }
  };

  // Ticket Manual Entry Handler
  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const clean = ticketInput.trim().toLowerCase();
    if (!clean) return;

    const match = delegates.find(
      (d) =>
        String(d.UserId) === clean ||
        String(d.TeamId) === clean ||
        (d.Email && d.Email.toLowerCase() === clean) ||
        (d.UserName && d.UserName.toLowerCase().includes(clean))
    );

    if (match) {
      if (match.CheckInStatus === 'CheckedIn') {
        toast.info(`${match.UserName} is already verified inside the auditorium.`);
      } else {
        markDelegateStatus(match, 'CheckedIn');
      }
      setTicketInput('');
    } else {
      toast.error('No registered delegate found for this ticket ID or email');
    }
  };

  // QR Scanner Handlers
  const startQrScanner = () => {
    setScannerOpen(true);
    setScannerError('');
    setLastScannedAttendee(null);

    setTimeout(() => {
      const qrCodeId = 'reader-seminar-scanner';
      const el = document.getElementById(qrCodeId);
      if (!el) return;

      const html5QrCode = new Html5Qrcode(qrCodeId);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleScannedPass(decodedText);
          },
          () => {}
        )
        .catch((err) => {
          console.error('Camera QR start error:', err);
          setScannerError('Could not access camera. Grant permissions or verify ticket ID manually.');
        });
    }, 300);
  };

  const stopQrScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => html5QrCodeRef.current.clear())
        .catch(() => {})
        .finally(() => {
          html5QrCodeRef.current = null;
          setScannerOpen(false);
        });
    } else {
      setScannerOpen(false);
    }
  };

  const handleScannedPass = (scannedText) => {
    let cleanText = (scannedText || '').trim();
    let delegateIdOrEmail = cleanText;

    try {
      if (cleanText.startsWith('http')) {
        const parsedUrl = new URL(cleanText);
        delegateIdOrEmail =
          parsedUrl.searchParams.get('attendee') ||
          parsedUrl.searchParams.get('user') ||
          parsedUrl.searchParams.get('id') ||
          delegateIdOrEmail;
      }
    } catch {}

    const matched = delegates.find((d) => {
      const uid = String(d.UserId || '');
      const tid = String(d.TeamId || '');
      const em = (d.Email || '').toLowerCase();
      const target = delegateIdOrEmail.toLowerCase();
      return uid === target || tid === target || em === target;
    });

    if (matched) {
      setLastScannedAttendee(matched);
      markDelegateStatus(matched, 'CheckedIn');
    } else {
      toast.error('No matching delegate found in this seminar for scanned pass');
    }
  };

  // Filtered Delegates
  const filteredDelegates = useMemo(() => {
    return delegates.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (d.UserName || '').toLowerCase().includes(q) ||
        (d.Email || '').toLowerCase().includes(q) ||
        (d.College || '').toLowerCase().includes(q) ||
        String(d.TeamId || '').includes(q) ||
        String(d.UserId || '').includes(q);

      const st = d.CheckInStatus || 'Registered';
      const isPresent = st === 'CheckedIn';
      const isAbsent = st === 'Absent';
      const isPending = !isPresent && !isAbsent;

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'checked_in' && isPresent) ||
        (filterStatus === 'absent' && isAbsent) ||
        (filterStatus === 'pending' && isPending);

      return matchesSearch && matchesStatus;
    });
  }, [delegates, searchQuery, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = delegates.length;
    const present = delegates.filter((d) => d.CheckInStatus === 'CheckedIn').length;
    const absent = delegates.filter((d) => d.CheckInStatus === 'Absent').length;
    const pending = total - present - absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, pending, rate };
  }, [delegates]);

  // Export CSV
  const handleExportAttendanceCsv = () => {
    if (delegates.length === 0) {
      toast.error('No delegates to export');
      return;
    }

    const headers = [
      'Delegate ID',
      'Delegate Name',
      'Email',
      'Mobile',
      'Organization / College',
      'Hall Check-In Status',
      'Check-In Time',
      'Certificate Released',
      'Feedback Rating'
    ];

    const rows = delegates.map((d) => [
      `DEL-${d.TeamId || d.UserId}`,
      `"${d.UserName || 'Delegate'}"`,
      `"${d.Email || ''}"`,
      `"${d.Mobile || ''}"`,
      `"${d.College || 'Registered Campus'}"`,
      d.CheckInStatus === 'CheckedIn' ? 'Checked In' : d.CheckInStatus === 'Absent' ? 'Absent' : 'Pending',
      d.CheckInTime ? `"${new Date(d.CheckInTime).toLocaleString()}"` : '—',
      d.CertificateIssued ? 'YES' : 'NO',
      d.FeedbackRating || 0
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Seminar_Auditorium_Attendance_Event_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Seminar Attendance CSV exported successfully');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6 text-slate-900 dark:text-white font-sans">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5" />
            Auditorium Gate & Hall Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Seminar Attendance & Gate Entry
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Scan delegate tickets, confirm physical auditorium check-in, release seminar certificates, and export attendance records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchDelegates}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh delegates list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <button
            onClick={startQrScanner}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Delegate Pass</span>
          </button>
          <button
            onClick={handleExportAttendanceCsv}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Delegates</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-black border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Checked-In Inside Hall</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.present}</p>
        </div>
        <div className="bg-white dark:bg-black border border-rose-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Absent / Not Arrived</span>
          <p className="text-2xl font-black text-rose-500">{stats.absent}</p>
        </div>
        <div className="bg-white dark:bg-black border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Hall Attendance Rate</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.rate}%</p>
        </div>
      </div>

      {/* Quick Ticket Search & Barcode Gun Input */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Scan or Enter Delegate Ticket ID</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Compatible with handheld barcode scanner guns, pass numbers, or email</p>
            </div>
          </div>

          <form onSubmit={handleTicketSubmit} className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              placeholder="e.g. 1042 or delegate@example.com"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer flex-shrink-0"
            >
              Verify & Check In
            </button>
          </form>
        </div>
      </div>

      {/* Website Signature Theme Tabs */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto scrollbar-none">
          {seminarDays.map((d) => {
            const isActive = viewMode === 'session' && activeDay === d.dayNumber;

            return (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => {
                  setViewMode('session');
                  setActiveDay(d.dayNumber);
                }}
                className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
              >
                {isActive ? (
                  <motion.div
                    layoutId="seminarAttendanceTabFolder"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-slate-100/90 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 z-0 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors" />
                )}

                <span
                  className={`relative z-20 flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'text-slate-950 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Calendar
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>Day {d.dayNumber}</span>
                  {d.dateFormatted && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {d.dateFormatted}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {/* Master Matrix Tab (Docked Right) */}
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0 ml-auto"
          >
            {viewMode === 'matrix' ? (
              <motion.div
                layoutId="seminarAttendanceTabFolder"
                className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              >
                <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
              </motion.div>
            ) : (
              <div className="absolute inset-0 rounded-t-2xl bg-slate-100/90 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 z-0 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors" />
            )}

            <span
              className={`relative z-20 flex items-center gap-2 transition-colors ${
                viewMode === 'matrix'
                  ? 'text-slate-950 dark:text-white font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Layers
                className={`w-4 h-4 transition-colors ${
                  viewMode === 'matrix' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                }`}
              />
              <span>Attendance Matrix</span>
            </span>
          </button>
        </div>
      </div>

      {/* Connected Sub-bar */}
      {viewMode === 'session' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Auditorium Track:</span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              {['Morning', 'Afternoon'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setActiveSlot(slot)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeSlot === slot
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {slot} Plenary
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auditorium Gate Verification Live</span>
          </div>
        </div>
      )}

      {/* Filter and Bulk Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search delegate name, ID, or institution..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              All ({delegates.length})
            </button>
            <button
              onClick={() => setFilterStatus('checked_in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'checked_in'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              Present ({stats.present})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'pending'
                  ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400'
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>

          <button
            onClick={() => handleBulkMark('CheckedIn')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Pending Present</span>
          </button>
          <button
            onClick={() => handleBulkMark('Absent')}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Mark Pending Absent</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-sm">Loading attendance records...</p>
        </div>
      ) : filteredDelegates.length === 0 ? (
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Delegates Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            No registered delegates match the current filter or search criteria.
          </p>
        </div>
      ) : viewMode === 'session' ? (
        <div className="space-y-3">
          {filteredDelegates.map((delegate, idx) => {
            const st = delegate.CheckInStatus || 'Registered';
            const isPresent = st === 'CheckedIn';
            const isAbsent = st === 'Absent';
            const isBusy = updatingId === delegate.UserId;

            return (
              <motion.div
                key={delegate.UserId || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`bg-white dark:bg-black border rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isPresent
                    ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                    : isAbsent
                    ? 'border-rose-500/40 bg-rose-500/[0.02]'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    DEL
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {delegate.UserName || 'Registered Delegate'}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-400">
                        #DEL-{delegate.TeamId || delegate.UserId}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {delegate.Email && <span className="font-mono text-[11px]">{delegate.Email}</span>}
                      {delegate.College && <span>{delegate.College}</span>}
                      {delegate.CheckInTime && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          Entered hall at {new Date(delegate.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggles & Certificate Release */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                  {delegate.CertificateIssued ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold inline-flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificate Issued</span>
                    </span>
                  ) : isPresent ? (
                    <button
                      onClick={() => handleIssueCertificate(delegate)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Issue Certificate</span>
                    </button>
                  ) : null}

                  <button
                    disabled={isBusy}
                    onClick={() => markDelegateStatus(delegate, 'CheckedIn')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  <button
                    disabled={isBusy}
                    onClick={() => markDelegateStatus(delegate, 'Absent')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isAbsent
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-rose-500 hover:text-rose-500'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  {(isPresent || isAbsent) && (
                    <button
                      disabled={isBusy}
                      onClick={() => markDelegateStatus(delegate, 'Registered')}
                      className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                      title="Reset status"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Matrix View */
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                  <th className="py-3.5 px-4 font-bold text-slate-700 dark:text-zinc-300">Delegate</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                    Institution / Campus
                  </th>
                  <th className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                    Gate Check-In
                  </th>
                  <th className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                    Check-In Time
                  </th>
                  <th className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                    Certificate
                  </th>
                  <th className="py-3.5 px-4 text-right font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredDelegates.map((delegate) => {
                  const isPresent = delegate.CheckInStatus === 'CheckedIn';
                  const isAbsent = delegate.CheckInStatus === 'Absent';

                  return (
                    <tr key={delegate.UserId} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{delegate.UserName}</div>
                        <div className="font-mono text-[10px] text-slate-400">#DEL-{delegate.TeamId || delegate.UserId}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                        {delegate.College || 'Registered Campus'}
                      </td>

                      <td className="py-3 px-4 text-center border-l border-slate-200 dark:border-zinc-800">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Present</span>
                          </span>
                        ) : isAbsent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            <span>Absent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center border-l border-slate-200 dark:border-zinc-800 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        {delegate.CheckInTime ? (
                          <span>{new Date(delegate.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center border-l border-slate-200 dark:border-zinc-800">
                        {delegate.CertificateIssued ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] inline-flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>Issued</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not Issued</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right border-l border-slate-200 dark:border-zinc-800">
                        <button
                          onClick={() => markDelegateStatus(delegate, isPresent ? 'Absent' : 'CheckedIn')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isPresent
                              ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500'
                          }`}
                        >
                          {isPresent ? 'Mark Absent' : 'Check In'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {scannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Scan Seminar Delegate Pass
                  </h3>
                </div>
                <button
                  onClick={stopQrScanner}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div id="reader-seminar-scanner" className="overflow-hidden rounded-2xl bg-black min-h-[260px]" />

              {scannerError && (
                <p className="text-xs text-rose-500 font-medium text-center">{scannerError}</p>
              )}

              {lastScannedAttendee && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Verified: {lastScannedAttendee.UserName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    #DEL-{lastScannedAttendee.TeamId || lastScannedAttendee.UserId}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
