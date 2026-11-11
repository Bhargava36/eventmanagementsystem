import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ArrowRight,
  Radio,
  Video,
  Presentation,
  ShieldCheck,
  UserCheck,
  Award,
  Tv,
  FileSpreadsheet
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
    // Ignore audio context errors
  }
}
function calculateWebinarDays(startDateStr, endDateStr) {
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
export default function WebinarAttendancePage() {
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
  const [viewMode, setViewMode] = useState('session');
  const [attendees, setAttendees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  // Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [lastScannedAttendee, setLastScannedAttendee] = useState(null);
  const html5QrCodeRef = useRef(null);
  const fetchEventDetails = async () => {
    if (!currentEventId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${currentEventId}`);
      if (!res.ok) return;
      const data = await res.json();
      setEventData(data.event || data);
    } catch (e) {
      console.error('Failed to load event details:', e);
    }
  };
  useEffect(() => {
    fetchEventDetails();
  }, [currentEventId]);
  const webinarDays = useMemo(() => {
    const start = eventData?.VirtualStartDate || eventData?.StartDate;
    const end = eventData?.VirtualEndDate || eventData?.EndDate || start;
    return calculateWebinarDays(start, end);
  }, [eventData]);
  const totalDays = webinarDays.length;
  const fetchAttendance = async () => {
    if (!currentEventId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/webinars/${currentEventId}/attendance?day=${activeDay}&slot=${activeSlot}`
      );
      if (!res.ok) throw new Error('Failed to load attendance');
      const data = await res.json();
      setAttendees(data.attendees || []);
      setAllRecords(data.allRecords || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load webinar attendance');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAttendance();
  }, [currentEventId, activeDay, activeSlot]);
  const markAttendeeStatus = async (attendee, targetStatus, optDay = null, optSlot = null) => {
    const day = optDay !== null ? Number(optDay) : activeDay;
    const slot = optSlot || activeSlot;
    const key = `${attendee.UserId}-${day}-${slot}`;
    setUpdatingId(key);
    try {
      const res = await fetch(`${API_BASE_URL}/api/webinars/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserId: attendee.UserId,
          Status: targetStatus,
          MarkedBy: admin?.AdminName || 'Webinar Admin Desk',
          DayNumber: day,
          SessionSlot: slot
        })
      });
      if (!res.ok) throw new Error('Status update failed');
      if (day === activeDay && slot === activeSlot) {
        setAttendees((prev) =>
          prev.map((a) =>
            Number(a.UserId) === Number(attendee.UserId)
              ? {
                  ...a,
                  AttendanceStatus: targetStatus,
                  CheckInTime: targetStatus === 'checked_in' ? new Date().toISOString() : null
                }
              : a
          )
        );
      }
      setAllRecords((prev) => {
        const remaining = prev.filter(
          (r) =>
            !(
              Number(r.UserId) === Number(attendee.UserId) &&
              Number(r.DayNumber) === day &&
              r.SessionSlot === slot
            )
        );
        return [
          ...remaining,
          {
            UserId: attendee.UserId,
            DayNumber: day,
            SessionSlot: slot,
            Status: targetStatus,
            CheckInTime: targetStatus === 'checked_in' ? new Date().toISOString() : null
          }
        ];
      });
      if (targetStatus === 'checked_in') {
        playCheckInSound();
        toast.success(`Verified: ${attendee.UserName} marked Present (Day ${day} • ${slot})!`);
      } else if (targetStatus === 'absent') {
        toast.error(`Marked ${attendee.UserName} as Absent (Day ${day} • ${slot})`);
      } else {
        toast.info(`Reset attendance status for ${attendee.UserName}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update attendance');
    } finally {
      setUpdatingId(null);
    }
  };
  const handleBulkMark = async (status) => {
    const pendingAttendees = filteredAttendees.filter(
      (a) => a.AttendanceStatus !== 'checked_in' && a.AttendanceStatus !== 'present' && a.AttendanceStatus !== 'absent'
    );
    if (pendingAttendees.length === 0) {
      toast.info('No pending delegates to mark in this session.');
      return;
    }
    try {
      setLoading(true);
      for (const attendee of pendingAttendees) {
        await fetch(`${API_BASE_URL}/api/webinars/${eventId}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserId: attendee.UserId,
            Status: status,
            MarkedBy: admin?.AdminName || 'Webinar Admin Desk',
            DayNumber: activeDay,
            SessionSlot: activeSlot
          })
        });
      }
      toast.success(
        `Marked all ${pendingAttendees.length} pending delegates as ${status === 'checked_in' ? 'Present' : 'Absent'}!`
      );
      await fetchAttendance();
    } catch (err) {
      console.error(err);
      toast.error('Failed bulk update');
    } finally {
      setLoading(false);
    }
  };
  const getMatrixStatus = (userId, day, slot) => {
    const rec = allRecords.find(
      (r) => Number(r.UserId) === Number(userId) && Number(r.DayNumber) === Number(day) && r.SessionSlot === slot
    );
    return rec ? rec.Status : 'none';
  };
  const getDelegateMatrixStats = (userId) => {
    const totalSlots = totalDays * 2;
    let attended = 0;
    webinarDays.forEach((d) => {
      ['Morning', 'Evening'].forEach((slot) => {
        const st = getMatrixStatus(userId, d.dayNumber, slot);
        if (st === 'checked_in' || st === 'present') attended += 1;
      });
    });
    const percent = totalSlots > 0 ? Math.round((attended / totalSlots) * 100) : 0;
    const isEligible = percent >= 70;
    return { attended, totalSlots, percent, isEligible };
  };
  // QR Scanner Handler
  const startQrScanner = () => {
    setScannerOpen(true);
    setScannerError('');
    setLastScannedAttendee(null);
    setTimeout(() => {
      const qrCodeId = 'reader-webinar-scanner';
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
          setScannerError('Could not open camera. Please grant camera permission or enter Pass ID manually.');
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
    let attendeeIdOrEmail = cleanText;
    try {
      if (cleanText.startsWith('http')) {
        const parsedUrl = new URL(cleanText);
        attendeeIdOrEmail =
          parsedUrl.searchParams.get('attendee') ||
          parsedUrl.searchParams.get('user') ||
          parsedUrl.searchParams.get('id') ||
          attendeeIdOrEmail;
      }
    } catch {}
    const matched = attendees.find((a) => {
      const uid = String(a.UserId || '');
      const tid = String(a.TeamId || '');
      const em = (a.Email || '').toLowerCase();
      const code = (a.PassCode || '').toLowerCase();
      const target = attendeeIdOrEmail.toLowerCase();
      return uid === target || tid === target || em === target || code === target;
    });
    if (matched) {
      setLastScannedAttendee(matched);
      markAttendeeStatus(matched, 'checked_in');
    } else {
      toast.error('No matching delegate found in this webinar for scanned pass');
    }
  };
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (a.UserName || '').toLowerCase().includes(q) ||
        (a.Email || '').toLowerCase().includes(q) ||
        (a.College || '').toLowerCase().includes(q) ||
        String(a.TeamId || '').includes(q) ||
        String(a.UserId || '').includes(q);
      const st = a.AttendanceStatus || 'none';
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'checked_in' && (st === 'checked_in' || st === 'present')) ||
        (filterStatus === 'absent' && st === 'absent') ||
        (filterStatus === 'pending' && st !== 'checked_in' && st !== 'present' && st !== 'absent');
      return matchesSearch && matchesStatus;
    });
  }, [attendees, searchQuery, filterStatus]);
  const stats = useMemo(() => {
    const total = attendees.length;
    const present = attendees.filter(
      (a) => a.AttendanceStatus === 'checked_in' || a.AttendanceStatus === 'present'
    ).length;
    const absent = attendees.filter((a) => a.AttendanceStatus === 'absent').length;
    const pending = total - present - absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, pending, rate };
  }, [attendees]);
  // Export Matrix CSV
  const handleExportMatrixCsv = () => {
    if (attendees.length === 0) {
      toast.error('No delegates to export');
      return;
    }
    const headers = [
      'Delegate ID',
      'Delegate Name',
      'Email',
      'Organization / College',
      ...webinarDays.flatMap((d) => [`Day ${d.dayNumber} Morning`, `Day ${d.dayNumber} Evening`]),
      'Attended Slots',
      'Total Slots',
      'Attendance Rate (%)',
      'Certificate Eligible'
    ];
    const rows = attendees.map((a) => {
      const { attended, totalSlots, percent, isEligible } = getDelegateMatrixStats(a.UserId);
      const slotValues = webinarDays.flatMap((d) => {
        const m = getMatrixStatus(a.UserId, d.dayNumber, 'Morning');
        const e = getMatrixStatus(a.UserId, d.dayNumber, 'Evening');
        return [
          m === 'checked_in' || m === 'present' ? 'Present' : m === 'absent' ? 'Absent' : 'Pending',
          e === 'checked_in' || e === 'present' ? 'Present' : e === 'absent' ? 'Absent' : 'Pending'
        ];
      });
      return [
        `DEL-${a.TeamId || a.UserId}`,
        `"${a.UserName || 'Delegate'}"`,
        `"${a.Email || ''}"`,
        `"${a.College || 'Institution'}"`,
        ...slotValues,
        attended,
        totalSlots,
        `${percent}%`,
        isEligible ? 'YES' : 'NO'
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Webinar_Master_Attendance_Matrix_Event_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Webinar Attendance Matrix CSV exported successfully');
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5" />
            Delegate Verification & Tracking
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Webinar Attendance & Virtual Joins
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Track delegate virtual session check-ins, scan delegate entry passes with live camera, and manage attendance records across all keynote talks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchAttendance}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={startQrScanner}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Delegate Pass</span>
          </button>
          <button
            onClick={handleExportMatrixCsv}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Matrix CSV</span>
          </button>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Delegates</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Joined Live / Present</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.present}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-rose-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Absent / Not Joined</span>
          <p className="text-2xl font-black text-rose-500">{stats.absent}</p>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-emerald-500/20 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Session Join Rate</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.rate}%</p>
        </div>
      </div>
      {/* ── WEBSITE SIGNATURE THEME TABS ── */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto scrollbar-none">
          {webinarDays.map((d) => {
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
                    layoutId="webinarAttendanceTabFolder"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    {/* Seamless bottom mask */}
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
                layoutId="webinarAttendanceTabFolder"
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
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Keynote Slot:</span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
              {['Morning', 'Evening'].map((slot) => (
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
                  {slot} Keynote
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Virtual Delegate Live Check-in</span>
          </div>
        </div>
      )}
      {/* Filter and Bulk Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search delegate name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleBulkMark('checked_in')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Pending Present</span>
          </button>
          <button
            onClick={() => handleBulkMark('absent')}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Mark Pending Absent</span>
          </button>
        </div>
      </div>
      {/* View Content */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-sm">Loading attendance records...</p>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
          <UserCheck className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Delegates Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            No registered delegates match the current filter or search criteria.
          </p>
        </div>
      ) : viewMode === 'session' ? (
        <div className="space-y-3">
          {filteredAttendees.map((attendee, idx) => {
            const st = attendee.AttendanceStatus || 'none';
            const isPresent = st === 'checked_in' || st === 'present';
            const isAbsent = st === 'absent';
            const key = `${attendee.UserId}-${activeDay}-${activeSlot}`;
            const isBusy = updatingId === key;
            return (
              <motion.div
                key={attendee.UserId || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`bg-white dark:bg-zinc-950 border rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
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
                        {attendee.UserName || 'Registered Delegate'}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-400">
                        #DEL-{attendee.TeamId || attendee.UserId}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {attendee.Email && <span className="font-mono text-[11px]">{attendee.Email}</span>}
                      {attendee.College && <span>{attendee.College}</span>}
                      {attendee.CheckInTime && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3" />
                          Joined at {new Date(attendee.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Status Toggles */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    disabled={isBusy}
                    onClick={() => markAttendeeStatus(attendee, 'checked_in')}
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
                    onClick={() => markAttendeeStatus(attendee, 'absent')}
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
                      onClick={() => markAttendeeStatus(attendee, 'none')}
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
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                  <th className="py-3.5 px-4 font-bold text-slate-700 dark:text-zinc-300">Delegate</th>
                  {webinarDays.map((d) => (
                    <th key={d.dayNumber} colSpan={2} className="py-3.5 px-3 text-center font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                      Day {d.dayNumber}
                      {d.dateFormatted && <span className="block text-[10px] font-normal text-slate-400">{d.dateFormatted}</span>}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-zinc-300 border-l border-slate-200 dark:border-zinc-800">
                    Matrix Stats
                  </th>
                </tr>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-[10px] text-slate-500">
                  <th className="py-2 px-4">Name / ID</th>
                  {webinarDays.map((d) => (
                    <React.Fragment key={`sub-${d.dayNumber}`}>
                      <th className="py-2 px-2 text-center border-l border-slate-200 dark:border-zinc-800">Morn</th>
                      <th className="py-2 px-2 text-center">Eve</th>
                    </React.Fragment>
                  ))}
                  <th className="py-2 px-4 text-center border-l border-slate-200 dark:border-zinc-800">Rate / Cert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredAttendees.map((attendee) => {
                  const { attended, totalSlots, percent, isEligible } = getDelegateMatrixStats(attendee.UserId);
                  return (
                    <tr key={attendee.UserId} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{attendee.UserName}</div>
                        <div className="font-mono text-[10px] text-slate-400">#DEL-{attendee.TeamId || attendee.UserId}</div>
                      </td>
                      {webinarDays.map((d) => {
                        const mStatus = getMatrixStatus(attendee.UserId, d.dayNumber, 'Morning');
                        const eStatus = getMatrixStatus(attendee.UserId, d.dayNumber, 'Evening');
                        return (
                          <React.Fragment key={`cell-${attendee.UserId}-${d.dayNumber}`}>
                            <td className="py-3 px-2 text-center border-l border-slate-200 dark:border-zinc-800">
                              <button
                                onClick={() => markAttendeeStatus(attendee, mStatus === 'checked_in' || mStatus === 'present' ? 'absent' : 'checked_in', d.dayNumber, 'Morning')}
                                className={`w-6 h-6 rounded-lg text-[10px] font-bold mx-auto transition cursor-pointer flex items-center justify-center ${
                                  mStatus === 'checked_in' || mStatus === 'present'
                                    ? 'bg-emerald-500 text-white'
                                    : mStatus === 'absent'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                                }`}
                              >
                                {mStatus === 'checked_in' || mStatus === 'present' ? 'P' : mStatus === 'absent' ? 'A' : '—'}
                              </button>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                onClick={() => markAttendeeStatus(attendee, eStatus === 'checked_in' || eStatus === 'present' ? 'absent' : 'checked_in', d.dayNumber, 'Evening')}
                                className={`w-6 h-6 rounded-lg text-[10px] font-bold mx-auto transition cursor-pointer flex items-center justify-center ${
                                  eStatus === 'checked_in' || eStatus === 'present'
                                    ? 'bg-emerald-500 text-white'
                                    : eStatus === 'absent'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                                }`}
                              >
                                {eStatus === 'checked_in' || eStatus === 'present' ? 'P' : eStatus === 'absent' ? 'A' : '—'}
                              </button>
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="py-3 px-4 text-center border-l border-slate-200 dark:border-zinc-800">
                        <span className="font-bold text-slate-900 dark:text-white">{percent}%</span>
                        <span className={`block text-[10px] font-bold ${isEligible ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {isEligible ? 'Eligible' : 'Not Met'}
                        </span>
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
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Scan Webinar Delegate Pass
                  </h3>
                </div>
                <button
                  onClick={stopQrScanner}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div id="reader-webinar-scanner" className="overflow-hidden rounded-2xl bg-black min-h-[260px]" />
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
