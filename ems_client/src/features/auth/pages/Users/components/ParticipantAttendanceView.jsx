import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Layers,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Info
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function ParticipantAttendanceView({
  eventId,
  userId,
  eventType = 'Webinar',
  sessions = [],
  startDate,
  endDate
}) {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [error, setError] = useState(null);

  const isWebinar = String(eventType).toLowerCase() === 'webinar';
  const apiPrefix = isWebinar ? 'webinars' : 'workshops';

  const fetchAttendance = async () => {
    if (!eventId || !userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/${apiPrefix}/${eventId}/attendance/user/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to load attendance');
      }
      const data = await res.json();
      setAttendanceRecords(data.records || []);
    } catch (err) {
      console.error('Error fetching participant attendance:', err);
      setError('Unable to load your live attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [eventId, userId, apiPrefix]);

  // Derive days count from sessions or start/end dates
  const daysList = useMemo(() => {
    const sessionDays = new Set();
    sessions.forEach((s) => {
      if (s.DayNumber) sessionDays.add(Number(s.DayNumber));
    });
    attendanceRecords.forEach((r) => {
      if (r.DayNumber) sessionDays.add(Number(r.DayNumber));
    });

    if (sessionDays.size > 0) {
      return Array.from(sessionDays).sort((a, b) => a - b);
    }

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffDays = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
      return Array.from({ length: Math.min(diffDays, 7) }, (_, i) => i + 1);
    }

    return [1];
  }, [sessions, attendanceRecords, startDate, endDate]);

  // Standard session slots: Morning & Evening
  const slots = ['Morning', 'Evening'];

  // Map records by `${DayNumber}-${SessionSlot}`
  const recordMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((rec) => {
      const key = `${rec.DayNumber || 1}-${rec.SessionSlot || 'Morning'}`;
      map[key] = rec;
    });
    return map;
  }, [attendanceRecords]);

  // Summary counts
  const summary = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let notMarkedCount = 0;

    daysList.forEach((day) => {
      slots.forEach((slot) => {
        const rec = recordMap[`${day}-${slot}`];
        const status = rec?.Status;
        if (status === 'checked_in' || status === 'present') {
          presentCount++;
        } else if (status === 'absent') {
          absentCount++;
        } else {
          notMarkedCount++;
        }
      });
    });

    const totalSlots = daysList.length * slots.length;
    return { presentCount, absentCount, notMarkedCount, totalSlots };
  }, [daysList, slots, recordMap]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold mb-1">
            <span>Overall Attendance</span>
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {summary.presentCount > 0
              ? 'Present'
              : summary.absentCount > 0 && summary.notMarkedCount === 0
              ? 'Absent'
              : 'Not Marked'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {summary.presentCount > 0
              ? `${summary.presentCount} session(s) verified present`
              : 'Attendance records updated live by organizers'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold mb-1">
            <span>Verified Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.presentCount} / {summary.totalSlots}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Attendance check-ins completed
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-semibold mb-1">
            <span>Pending Check-ins</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-700 dark:text-zinc-300 mt-1">
            {summary.notMarkedCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Sessions not marked yet
          </p>
        </div>
      </div>

      {/* Main Attendance Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Session-by-Session Attendance Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Verified records for your individual {isWebinar ? 'delegate pass' : 'attendee registration'}.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAttendance}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
            title="Refresh attendance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            <p className="text-xs">Fetching verified attendance records...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center text-rose-500 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {daysList.map((dayNum) => (
              <div
                key={dayNum}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Day {dayNum} Attendance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {slots.map((slot) => {
                    const key = `${dayNum}-${slot}`;
                    const record = recordMap[key];
                    const status = record?.Status;
                    const isPresent = status === 'checked_in' || status === 'present';
                    const isAbsent = status === 'absent';
                    const isNotMarked = !isPresent && !isAbsent;

                    return (
                      <div
                        key={slot}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isPresent
                            ? 'bg-emerald-500/5 border-emerald-500/25'
                            : isAbsent
                            ? 'bg-rose-500/5 border-rose-500/25'
                            : 'bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {slot} {isWebinar ? 'Keynote' : 'Session'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {isPresent && record?.CheckInTime
                              ? `Verified at ${new Date(record.CheckInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                              : isPresent
                              ? 'Verified by Session Organizer'
                              : isAbsent
                              ? 'Marked Absent by Session Host'
                              : 'Attendance not marked yet'}
                          </p>
                        </div>

                        <div>
                          {isPresent && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Present</span>
                            </span>
                          )}

                          {isAbsent && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>Absent</span>
                            </span>
                          )}

                          {isNotMarked && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Not Marked</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Note */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Attendance is recorded in real time when you join the virtual live room or when an event coordinator scans your official digital entry pass QR code. If your attendance status is <strong className="text-slate-700 dark:text-zinc-300">Not Marked</strong>, check back once the session organizer completes the live attendee verification.
          </p>
        </div>
      </div>
    </div>
  );
}
