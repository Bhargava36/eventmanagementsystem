import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import {
  Users,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  RefreshCw,
  Clock,
  Building,
  Mail,
  Phone,
  GraduationCap,
  CalendarCheck,
  QrCode,
  Camera,
  X,
  Volume2,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Calendar,
  Grid,
  Award,
  CheckCheck,
  Plus,
  BarChart3,
  UserX
} from 'lucide-react';
// Web Audio API beep for instant physical check-in audio feedback
function playCheckInSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Audio autoplay restrictions fallback
  }
}
// Robust date parser that prevents UTC-shift bugs on YYYY-MM-DD or ISO strings
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string') {
    const trimmed = dateStr.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // DD-MM-YYYY or DD/MM/YYYY
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[-/]/).map(Number);
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}
// Automatically calculate workshop calendar days from StartDate and EndDate
function calculateWorkshopDays(startDateStr, endDateStr) {
  const start = parseLocalDate(startDateStr);
  const end = endDateStr ? parseLocalDate(endDateStr) : start;
  if (!start) {
    return Array.from({ length: 5 }, (_, i) => ({
      dayNumber: i + 1,
      dateFormatted: '',
      weekday: '',
      fullDateIso: '',
      label: `Day ${i + 1}`
    }));
  }
  const sUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const eUtc = end
    ? Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
    : sUtc;
  const msPerDay = 1000 * 60 * 60 * 24;
  let diffDays = Math.round((eUtc - sUtc) / msPerDay) + 1;
  if (diffDays < 1) diffDays = 1;
  if (diffDays > 30) diffDays = 30; // sensible safety ceiling
  const daysList = [];
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dateFormatted = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
    const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const fullDateIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    daysList.push({
      dayNumber: i + 1,
      dateFormatted,
      weekday,
      fullDateIso,
      fullDate: d,
      label: `Day ${i + 1}`
    });
  }
  return daysList;
}
export default function WorkshopAttendancePage() {
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
  // Event details & dynamic date-based workshop days
  const [eventData, setEventData] = useState(null);
  const [extraDays, setExtraDays] = useState(0);
  // Multi-Day & Session State
  const [activeDay, setActiveDay] = useState(1);
  const [activeSlot, setActiveSlot] = useState('Morning'); // 'Morning' | 'Evening'
  const [viewMode, setViewMode] = useState('session'); // 'session' | 'matrix'
  const [attendees, setAttendees] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  // Live QR Camera Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [lastScannedAttendee, setLastScannedAttendee] = useState(null);
  const html5QrCodeRef = useRef(null);
  // Fetch Event Details for automatic date calculation
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
  // Compute calculated days from event StartDate & EndDate
  const workshopDays = useMemo(() => {
    let start = null;
    let end = null;
    const mode = eventData?.HackathonMode;
    if (mode === 'Physical') {
      start = eventData?.PhysicalStartDate || eventData?.StartDate;
      end = eventData?.PhysicalEndDate || eventData?.EndDate || start;
    } else if (mode === 'Virtual' || mode === 'Online') {
      start = eventData?.VirtualStartDate || eventData?.StartDate;
      end = eventData?.VirtualEndDate || eventData?.EndDate || start;
    } else {
      start = eventData?.StartDate || eventData?.PhysicalStartDate || eventData?.VirtualStartDate;
      end = eventData?.EndDate || eventData?.PhysicalEndDate || eventData?.VirtualEndDate || start;
    }
    const baseDays = calculateWorkshopDays(start, end);
    if (extraDays > 0) {
      const lastDay = baseDays[baseDays.length - 1];
      for (let i = 1; i <= extraDays; i++) {
        const nextNum = baseDays.length + 1;
        let nextDateFormatted = '';
        let nextWeekday = '';
        let nextIso = '';
        let nextFullDate = null;
        if (lastDay?.fullDate) {
          nextFullDate = new Date(lastDay.fullDate);
          nextFullDate.setDate(nextFullDate.getDate() + i);
          nextDateFormatted = nextFullDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          nextWeekday = nextFullDate.toLocaleDateString('en-GB', { weekday: 'short' });
          nextIso = `${nextFullDate.getFullYear()}-${String(nextFullDate.getMonth() + 1).padStart(2, '0')}-${String(nextFullDate.getDate()).padStart(2, '0')}`;
        }
        baseDays.push({
          dayNumber: nextNum,
          dateFormatted: nextDateFormatted,
          weekday: nextWeekday,
          fullDateIso: nextIso,
          fullDate: nextFullDate,
          label: `Day ${nextNum}`
        });
      }
    }
    return baseDays;
  }, [eventData, extraDays]);
  const totalDays = workshopDays.length;
  useEffect(() => {
    const handleEventUpdated = (e) => {
      try {
        const stored = JSON.parse(localStorage.getItem('admin') || '{}');
        const newEvId = e?.detail?.Id || stored.EventId;
        if (newEvId) {
          setCurrentEventId(newEvId);
        }
      } catch (err) {
        console.error('Error handling event update in WorkshopAttendancePage:', err);
      }
    };
    window.addEventListener('admin-event-updated', handleEventUpdated);
    window.addEventListener('storage', handleEventUpdated);
    return () => {
      window.removeEventListener('admin-event-updated', handleEventUpdated);
      window.removeEventListener('storage', handleEventUpdated);
    };
  }, []);
  const fetchAttendance = async () => {
    if (!currentEventId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/workshops/${currentEventId}/attendance?day=${activeDay}&slot=${activeSlot}`
      );
      if (!res.ok) throw new Error('Failed to load attendance');
      const data = await res.json();
      setAttendees(data.attendees || []);
      setAllRecords(data.allRecords || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not load attendance list');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAttendance();
  }, [currentEventId, activeDay, activeSlot]);
  // Mark status for an attendee (supports day & session slot)
  const markAttendeeStatus = async (attendee, targetStatus, optDay = null, optSlot = null) => {
    const day = optDay !== null ? Number(optDay) : activeDay;
    const slot = optSlot || activeSlot;
    const key = `${attendee.UserId}-${day}-${slot}`;
    setUpdatingId(key);
    try {
      const res = await fetch(`${API_BASE_URL}/api/workshops/${eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserId: attendee.UserId,
          Status: targetStatus,
          MarkedBy: admin?.AdminName || 'Admin Desk',
          DayNumber: day,
          SessionSlot: slot
        })
      });
      if (!res.ok) throw new Error('Status update failed');
      // Update current view attendees if viewing this day & slot
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
      // Update global records
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
  // Bulk action: Mark all not-taken as Present or Absent
  const handleBulkMark = async (status) => {
    const pendingAttendees = filteredAttendees.filter(
      (a) => a.AttendanceStatus !== 'checked_in' && a.AttendanceStatus !== 'present' && a.AttendanceStatus !== 'absent'
    );
    if (pendingAttendees.length === 0) {
      toast.info('No pending attendees to mark in this session.');
      return;
    }
    try {
      setLoading(true);
      for (const attendee of pendingAttendees) {
        await fetch(`${API_BASE_URL}/api/workshops/${eventId}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserId: attendee.UserId,
            Status: status,
            MarkedBy: admin?.AdminName || 'Admin Desk',
            DayNumber: activeDay,
            SessionSlot: activeSlot
          })
        });
      }
      toast.success(
        `Marked all ${pendingAttendees.length} pending attendees as ${status === 'checked_in' ? 'Present' : 'Absent'}!`
      );
      await fetchAttendance();
    } catch (err) {
      console.error(err);
      toast.error('Failed bulk update');
    } finally {
      setLoading(false);
    }
  };
  // Helper for matrix lookup
  const getMatrixStatus = (userId, day, slot) => {
    const rec = allRecords.find(
      (r) => Number(r.UserId) === Number(userId) && Number(r.DayNumber) === Number(day) && r.SessionSlot === slot
    );
    if (!rec) return 'pending';
    if (rec.Status === 'checked_in' || rec.Status === 'present') return 'checked_in';
    if (rec.Status === 'absent') return 'absent';
    return 'pending';
  };
  // Helper for participant overall percentage
  const getAttendeeStats = (userId) => {
    const totalSessions = totalDays * 2;
    const userRecs = allRecords.filter((r) => Number(r.UserId) === Number(userId));
    const presentCount = userRecs.filter((r) => r.Status === 'checked_in' || r.Status === 'present').length;
    const absentCount = userRecs.filter((r) => r.Status === 'absent').length;
    const percent = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
    const isEligible = percent >= 75; // standard 75% workshop certificate threshold
    return { presentCount, absentCount, totalSessions, percent, isEligible };
  };
  // Start & Stop QR Camera Scanner
  const startScanner = async () => {
    setScannerError('');
    setScannerOpen(true);
  };
  useEffect(() => {
    let qrScanner = null;
    if (scannerOpen) {
      const qrCodeId = 'reader-workshop-scanner';
      const timer = setTimeout(async () => {
        try {
          qrScanner = new Html5Qrcode(qrCodeId);
          html5QrCodeRef.current = qrScanner;
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          };
          await qrScanner.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleQrCodeDecoded(decodedText);
            },
            () => {}
          );
        } catch (err) {
          console.error('Camera QR start error:', err);
          setScannerError(err?.message || 'Unable to access camera. Please check permissions.');
        }
      }, 300);
      return () => {
        clearTimeout(timer);
        if (qrScanner && qrScanner.isScanning) {
          qrScanner.stop().catch(() => {}).finally(() => {
            qrScanner.clear();
          });
        }
      };
    }
  }, [scannerOpen]);
  const closeScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {}
    }
    setScannerOpen(false);
  };
  const handleQrCodeDecoded = (decodedText) => {
    if (!decodedText) return;
    let targetUserId = null;
    let targetTeamId = null;
    let targetEmail = null;
    // 1. Check if JSON payload (from digital pass)
    try {
      const parsed = JSON.parse(decodedText);
      targetUserId = parsed.UserId || parsed.userId || parsed.id || parsed.Id;
      targetTeamId = parsed.TeamId || parsed.teamId;
      targetEmail = parsed.Email || parsed.email;
    } catch {
      // 2. Check if URL containing ID or Email
      if (decodedText.includes('/')) {
        try {
          const urlObj = new URL(decodedText.startsWith('http') ? decodedText : `http://${decodedText}`);
          if (urlObj.searchParams.get('userId') || urlObj.searchParams.get('user')) {
            targetUserId = Number(urlObj.searchParams.get('userId') || urlObj.searchParams.get('user'));
          }
          if (urlObj.searchParams.get('teamId') || urlObj.searchParams.get('attendee')) {
            targetTeamId = Number(urlObj.searchParams.get('teamId') || urlObj.searchParams.get('attendee'));
          }
          const cleanParts = urlObj.pathname.split('/').filter(Boolean);
          const lastSeg = cleanParts[cleanParts.length - 1];
          if (!isNaN(Number(lastSeg)) && Number(lastSeg) > 0) {
            if (!targetTeamId) targetTeamId = Number(lastSeg);
            if (!targetUserId) targetUserId = Number(lastSeg);
          }
        } catch {
          const parts = decodedText.split('/');
          const last = parts[parts.length - 1].split('?')[0];
          if (!isNaN(Number(last)) && Number(last) > 0) {
            targetUserId = Number(last);
            targetTeamId = Number(last);
          }
        }
      } else if (!isNaN(Number(decodedText.trim())) && Number(decodedText.trim()) > 0) {
        targetUserId = Number(decodedText.trim());
        targetTeamId = Number(decodedText.trim());
      } else if (decodedText.includes('@')) {
        targetEmail = decodedText.trim().toLowerCase();
      }
    }
    // Match with current workshop attendees (by UserId, TeamId, or Email)
    const match = attendees.find((a) => {
      if (targetUserId && Number(a.UserId) === Number(targetUserId)) return true;
      if (targetTeamId && Number(a.TeamId) === Number(targetTeamId)) return true;
      if (targetEmail && (a.Email || '').toLowerCase() === targetEmail.toLowerCase()) return true;
      return false;
    });
    if (match) {
      setLastScannedAttendee(match);
      if (match.AttendanceStatus !== 'checked_in') {
        markAttendeeStatus(match, 'checked_in', activeDay, activeSlot);
      } else {
        toast.success(`Already verified present for Day ${activeDay} (${activeSlot}): ${match.UserName}`);
      }
    } else {
      toast.error(`No matching attendee found in this workshop for scanned pass`);
    }
  };
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const isPresent = a.AttendanceStatus === 'checked_in' || a.AttendanceStatus === 'present';
      const isAbsent = a.AttendanceStatus === 'absent';
      const isPending = !isPresent && !isAbsent;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'present' && isPresent) ||
        (filterStatus === 'absent' && isAbsent) ||
        (filterStatus === 'pending' && isPending);
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        (a.UserName || '').toLowerCase().includes(q) ||
        (a.Email || '').toLowerCase().includes(q) ||
        (a.Mobile || '').toLowerCase().includes(q) ||
        (a.College || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [attendees, filterStatus, searchQuery]);
  const stats = useMemo(() => {
    const total = attendees.length;
    const present = attendees.filter((a) => a.AttendanceStatus === 'checked_in' || a.AttendanceStatus === 'present').length;
    const absent = attendees.filter((a) => a.AttendanceStatus === 'absent').length;
    const pending = total - present - absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, pending, rate };
  }, [attendees]);
  // Overall event statistics across all calculated days
  const overallStats = useMemo(() => {
    const totalPossible = attendees.length * totalDays * 2;
    const totalPresent = allRecords.filter((r) => r.Status === 'checked_in' || r.Status === 'present').length;
    const avgRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
    const eligibleCount = attendees.filter((a) => getAttendeeStats(a.UserId).isEligible).length;
    return { totalPossible, totalPresent, avgRate, eligibleCount };
  }, [attendees, allRecords, totalDays]);
  // CSV Export
  const handleExportCSV = () => {
    if (attendees.length === 0) {
      toast.error('No attendees to export');
      return;
    }
    const currentDayObj = workshopDays.find((d) => d.dayNumber === activeDay) || { label: `Day ${activeDay}`, dateFormatted: '' };
    if (viewMode === 'session') {
      const headers = ['User ID', 'Name', 'Email', 'Mobile', 'College', 'Day', 'Date', 'Session Slot', 'Attendance Status', 'Check-In Timestamp'];
      const rows = attendees.map((a) => {
        const isPresent = a.AttendanceStatus === 'checked_in' || a.AttendanceStatus === 'present';
        const isAbsent = a.AttendanceStatus === 'absent';
        const statusText = isPresent ? 'Present' : isAbsent ? 'Absent' : 'Pending (Not Taken)';
        return [
          a.UserId,
          `"${a.UserName || ''}"`,
          `"${a.Email || ''}"`,
          `"${a.Mobile || ''}"`,
          `"${a.College || ''}"`,
          `"${currentDayObj.label}"`,
          `"${currentDayObj.dateFormatted || ''}"`,
          `"${activeSlot}"`,
          statusText,
          a.CheckInTime ? `"${new Date(a.CheckInTime).toLocaleString('en-IN')}"` : 'N/A'
        ];
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Workshop_Attendance_Day${activeDay}_${activeSlot}_Event_${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported Day ${activeDay} (${activeSlot}) CSV successfully`);
    } else {
      // Dynamic Multi-Day Master Matrix CSV with real calendar dates
      const dayHeaders = [];
      workshopDays.forEach((d) => {
        const dateSuffix = d.dateFormatted ? ` (${d.dateFormatted})` : '';
        dayHeaders.push(`${d.label}${dateSuffix} Morning`);
        dayHeaders.push(`${d.label}${dateSuffix} Evening`);
      });
      const headers = ['User ID', 'Name', 'Email', 'College', ...dayHeaders, 'Total Attended', 'Total Sessions', 'Attendance %', 'Certificate Eligibility'];
      const rows = attendees.map((a) => {
        const dayStatuses = [];
        workshopDays.forEach((d) => {
          const mStatus = getMatrixStatus(a.UserId, d.dayNumber, 'Morning');
          const eStatus = getMatrixStatus(a.UserId, d.dayNumber, 'Evening');
          dayStatuses.push(mStatus === 'checked_in' ? 'Present' : mStatus === 'absent' ? 'Absent' : 'Pending');
          dayStatuses.push(eStatus === 'checked_in' ? 'Present' : eStatus === 'absent' ? 'Absent' : 'Pending');
        });
        const aStats = getAttendeeStats(a.UserId);
        return [
          a.UserId,
          `"${a.UserName || ''}"`,
          `"${a.Email || ''}"`,
          `"${a.College || ''}"`,
          ...dayStatuses,
          aStats.presentCount,
          aStats.totalSessions,
          `${aStats.percent}%`,
          aStats.isEligible ? 'Eligible' : 'Shortage'
        ];
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Workshop_Master_Attendance_Matrix_Event_${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${workshopDays.length}-Day Master Matrix CSV successfully`);
    }
  };
  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-zinc-100 transition-colors p-4 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Workshop Operations</span>
              <span className="text-slate-400">•</span>
              <span>Date-Calculated Multi-Day Attendance Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Workshop Attendance Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Auto-calculated from Start Date & End Date ({workshopDays[0]?.dateFormatted || 'Day 1'} — {workshopDays[workshopDays.length - 1]?.dateFormatted || 'Final Day'}). Daily Morning & Evening session check-in.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startScanner}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition"
            >
              <Camera className="w-4 h-4" />
              <span>Live QR Scanner</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              disabled={attendees.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>{viewMode === 'session' ? 'Export Session CSV' : 'Export Matrix CSV'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchAttendance}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Refresh attendance"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </motion.button>
          </div>
        </motion.div>
        {/* ── LIVE METRICS GRID ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Enrolled</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-slate-500">Workshop Participants</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Present (Day {activeDay} • {activeSlot})
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.present}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Turnout: {stats.rate}%
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Absent (Day {activeDay} • {activeSlot})
              </p>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.absent}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">Marked Absent</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Pending / Not Taken
              </p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Awaiting Check-in</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
        {/* ── WEBSITE SIGNATURE THEME TABS ── */}
        <div className="relative pt-2">
          <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto scrollbar-none">
            {workshopDays.map((d) => {
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
                      layoutId="workshopAttendanceTabFolder"
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
                        {d.dateFormatted}{d.weekday ? ` (${d.weekday})` : ''}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            {/* Add Extra Day Tab Action */}
            <button
              type="button"
              onClick={() => {
                setExtraDays((prev) => prev + 1);
                setActiveDay(workshopDays.length + 1);
                setViewMode('session');
              }}
              className="relative h-10 px-3.5 rounded-t-2xl text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 mb-0.5"
              title="Add another workshop day"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Day</span>
            </button>
            {/* Master Matrix Tab (Docked Right) */}
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0 ml-auto"
            >
              {viewMode === 'matrix' ? (
                <motion.div
                  layoutId="workshopAttendanceTabFolder"
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
                <Grid
                  className={`w-4 h-4 transition-colors ${
                    viewMode === 'matrix' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>Master Matrix</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors ${
                    viewMode === 'matrix'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {workshopDays.length} Days
                </span>
              </span>
            </button>
          </div>
          {/* Main Card Container Connected to Signature Tabs */}
          <div className="bg-white dark:bg-black rounded-2xl rounded-tl-none border border-slate-200 dark:border-zinc-800 shadow-sm relative z-0 p-5 sm:p-6 space-y-5">
            {/* ── VIEW 1: DAILY SESSION CHECK-IN VIEW ── */}
            {viewMode === 'session' && (
              <div className="space-y-5">
                {/* Session Slot Selector & Bulk Actions Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Daily Slot:
                    </span>
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setActiveSlot('Morning')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          activeSlot === 'Morning'
                            ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700 font-extrabold'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Sun className={`w-3.5 h-3.5 ${activeSlot === 'Morning' ? 'text-amber-500' : 'text-slate-400'}`} />
                        <span>Morning Session (FN)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSlot('Evening')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          activeSlot === 'Evening'
                            ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-zinc-700 font-extrabold'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Moon className={`w-3.5 h-3.5 ${activeSlot === 'Evening' ? 'text-indigo-500' : 'text-slate-400'}`} />
                        <span>Evening Session (AN)</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkMark('checked_in')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Mark all pending attendees in this session as Present"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark All Present</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkMark('absent')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Mark all pending attendees in this session as Absent"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Mark All Absent</span>
                    </button>
                  </div>
                </div>
                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search attendee by name, email, mobile, or college..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900 text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition"
                />
              </div>
              {/* Status filter buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: `All (${stats.total})` },
                  { id: 'present', label: `Present (${stats.present})` },
                  { id: 'absent', label: `Absent (${stats.absent})` },
                  { id: 'pending', label: `Not Taken (${stats.pending})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      filterStatus === f.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Attendance Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs text-slate-500">Loading Day {activeDay} ({activeSlot}) attendance records...</p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-base font-bold text-slate-800 dark:text-zinc-200">No attendees found</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {searchQuery ? 'Try matching another name or seat ID.' : 'No attendees enrolled for this workshop yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                      <tr>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Attendee / Seat</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">College / Institute</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Contact Info</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Check-In Time</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {filteredAttendees.map((attendee, index) => {
                        const isPresent = attendee.AttendanceStatus === 'checked_in' || attendee.AttendanceStatus === 'present';
                        const isAbsent = attendee.AttendanceStatus === 'absent';
                        const key = `${attendee.UserId}-${activeDay}-${activeSlot}`;
                        const isUpdating = updatingId === key;
                        return (
                          <motion.tr
                            key={attendee.UserId || index}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                            className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition"
                          >
                            {/* Attendee Info */}
                            <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                              <div className="space-y-0.5">
                                <span className="font-bold">{attendee.UserName || 'Unnamed Attendee'}</span>
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                  SEAT #{attendee.TeamId || attendee.UserId}
                                </div>
                              </div>
                            </td>
                            {/* College */}
                            <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300">
                              <div className="flex items-center gap-1.5 truncate max-w-xs">
                                <Building className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{attendee.College || 'Direct Enrollment'}</span>
                              </div>
                            </td>
                            {/* Contact */}
                            <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span className="truncate">{attendee.Email || '—'}</span>
                                </div>
                                {attendee.Mobile && (
                                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{attendee.Mobile}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Status Badge */}
                            <td className="py-3.5 px-4">
                              {isPresent ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Present</span>
                                </span>
                              ) : isAbsent ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Absent</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Not Marked</span>
                                </span>
                              )}
                            </td>
                            {/* Timestamp */}
                            <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                              {attendee.CheckInTime
                                ? new Date(attendee.CheckInTime).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '—'}
                            </td>
                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPresent ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => markAttendeeStatus(attendee, 'absent')}
                                      title="Change status to Absent"
                                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Mark Absent</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => markAttendeeStatus(attendee, 'pending')}
                                      title="Reset / Clear Attendance"
                                      className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : isAbsent ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => markAttendeeStatus(attendee, 'checked_in')}
                                      title="Change status to Present"
                                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Mark Present</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => markAttendeeStatus(attendee, 'pending')}
                                      title="Reset / Clear Attendance"
                                      className="p-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => markAttendeeStatus(attendee, 'checked_in')}
                                      title="Mark Present for this session"
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Present</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isUpdating}
                                      onClick={() => markAttendeeStatus(attendee, 'absent')}
                                      title="Mark Absent for this session"
                                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Absent</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── VIEW 2: DYNAMIC MASTER ATTENDANCE MATRIX ── */}
        {viewMode === 'matrix' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Matrix Summary Header */}
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-emerald-500" />
                  <span>{workshopDays.length}-Day Workshop Attendance Sheet</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Daily AM (Morning) & PM (Evening) sessions. Dates: {workshopDays[0]?.dateFormatted} – {workshopDays[workshopDays.length - 1]?.dateFormatted}. Certificate requirement: 75% attendance.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {overallStats.eligibleCount} / {attendees.length} Certificate Ready
                </span>
              </div>
            </div>
            {/* Matrix Table */}
            <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] sticky left-0 bg-slate-50 dark:bg-zinc-900 z-10 shadow-sm">
                        Participant Name
                      </th>
                      {workshopDays.map((d) => (
                        <th
                          key={d.dayNumber}
                          colSpan={2}
                          className="py-3 px-2 font-bold uppercase tracking-wider text-[10px] text-center border-l border-slate-200/60 dark:border-zinc-800"
                        >
                          <div className="font-extrabold">{d.label}</div>
                          {d.dateFormatted && (
                            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                              {d.dateFormatted}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 font-normal mt-0.5">
                            <span>AM</span>
                            <span>PM</span>
                          </div>
                        </th>
                      ))}
                      <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center border-l border-slate-200/60 dark:border-zinc-800">
                        Attended
                      </th>
                      <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">
                        Rate %
                      </th>
                      <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px] text-right">
                        Eligibility
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {attendees.map((attendee, index) => {
                      const aStats = getAttendeeStats(attendee.UserId);
                      return (
                        <tr key={attendee.UserId || index} className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition">
                          {/* Attendee Name (Sticky Left) */}
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-zinc-950 z-10">
                            <div>
                              <p className="font-bold">{attendee.UserName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">SEAT #{attendee.TeamId || attendee.UserId}</p>
                            </div>
                          </td>
                          {/* Dynamic Days AM & PM cells with real dates */}
                          {workshopDays.map((d) => {
                            const mStatus = getMatrixStatus(attendee.UserId, d.dayNumber, 'Morning');
                            const eStatus = getMatrixStatus(attendee.UserId, d.dayNumber, 'Evening');
                            const renderBadge = (st, slot) => {
                              const isP = st === 'checked_in';
                              const isA = st === 'absent';
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = isP ? 'absent' : isA ? 'pending' : 'checked_in';
                                    markAttendeeStatus(attendee, next, d.dayNumber, slot);
                                  }}
                                  className={`w-7 h-6 rounded text-[10px] font-black transition cursor-pointer flex items-center justify-center ${
                                    isP
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : isA
                                      ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30'
                                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 hover:bg-slate-200'
                                  }`}
                                  title={`${d.label} (${d.dateFormatted}) ${slot}: ${isP ? 'Present' : isA ? 'Absent' : 'Pending'} (Click to cycle)`}
                                >
                                  {isP ? 'P' : isA ? 'A' : '—'}
                                </button>
                              );
                            };
                            return (
                              <React.Fragment key={d.dayNumber}>
                                <td className="py-2.5 px-1.5 text-center border-l border-slate-100 dark:border-zinc-800/80">
                                  <div className="flex justify-center">{renderBadge(mStatus, 'Morning')}</div>
                                </td>
                                <td className="py-2.5 px-1.5 text-center">
                                  <div className="flex justify-center">{renderBadge(eStatus, 'Evening')}</div>
                                </td>
                              </React.Fragment>
                            );
                          })}
                          {/* Attended count */}
                          <td className="py-3 px-3 text-center font-bold font-mono border-l border-slate-100 dark:border-zinc-800">
                            {aStats.presentCount} / {aStats.totalSessions}
                          </td>
                          {/* Rate % */}
                          <td className="py-3 px-3 text-center font-bold font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                aStats.percent >= 75
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {aStats.percent}%
                            </span>
                          </td>
                          {/* Certificate Eligibility */}
                          <td className="py-3 px-4 text-right">
                            {aStats.isEligible ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <Award className="w-3 h-3" />
                                <span>Certificate Ready</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-zinc-900 text-slate-500 border border-slate-200 dark:border-zinc-800">
                                <span>Shortage</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
          </div>
        </div>
      </div>
      {/* Live QR Camera Scanner Modal */}
      <AnimatePresence>
        {scannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-950 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Live QR Pass Scanner
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Recording: Day {activeDay} ({workshopDays.find(d => d.dayNumber === activeDay)?.dateFormatted || ''}) • {activeSlot}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeScanner}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* QR Video Viewport */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                  <div id="reader-workshop-scanner" className="w-full h-full" />
                  {scannerError && (
                    <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-black/90 text-rose-400 text-xs">
                      <XCircle className="w-8 h-8 mb-2" />
                      <p className="font-semibold">{scannerError}</p>
                    </div>
                  )}
                </div>
                {/* Last Scanned Feedback Box */}
                {lastScannedAttendee && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold">{lastScannedAttendee.UserName}</p>
                      <p className="text-[11px] text-emerald-600/80">
                        Day {activeDay} • {activeSlot} Check-in Verified
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" /> Present
                    </span>
                  </motion.div>
                )}
                <p className="text-center text-xs text-slate-500 dark:text-zinc-400">
                  Align attendee pass QR code within the frame to verify automatically.
                </p>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex justify-end">
                <button
                  type="button"
                  onClick={closeScanner}
                  className="px-5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Close Scanner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
