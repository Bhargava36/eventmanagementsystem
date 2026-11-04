import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../../Hooks/useToast';
import UnifiedEventFeedbackCard from './UnifiedEventFeedbackCard';
import {
  QrCode,
  CheckCircle2,
  Clock,
  Download,
  Star,
  Send,
  Calendar,
  MapPin,
  ExternalLink,
  FileText,
  ShieldCheck,
  CalendarDays,
  Mic,
  MessageSquare,
  Building2,
  User,
  GraduationCap,
  Info
} from 'lucide-react';

export default function SeminarDelegatePassCard({ eventId, user, team }) {
  const toast = useToast();

  const [eventData, setEventData] = useState(null);
  const [delegateInfo, setDelegateInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active folder tab
  const [activeTab, setActiveTab] = useState('agenda'); // 'agenda' | 'speakers' | 'attendance' | 'proceedings' | 'feedback'
  const [activeDay, setActiveDay] = useState('all');

  const fetchDelegateData = useCallback(async () => {
    if (!eventId || !user?.Id) return;
    try {
      setLoading(true);
      const [evRes, delRes, sessRes, spkRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/${eventId}`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/delegates`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/sessions`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/speakers`),
        fetch(`${API_BASE_URL}/api/seminars/${eventId}/resources`)
      ]);

      if (evRes.ok) {
        const ev = await evRes.json();
        setEventData(Array.isArray(ev) ? ev[0] : (ev.event || ev));
      }

      if (delRes.ok) {
        const dData = await delRes.json();
        const me = (dData.delegates || []).find(
          (d) => Number(d.UserId) === Number(user.Id) || (d.Email && d.Email.toLowerCase() === (user.Email || '').toLowerCase())
        );
        if (me) {
          setDelegateInfo(me);
        }
      }

      if (sessRes.ok) {
        const sData = await sessRes.json();
        setSessions(sData.sessions || []);
      }

      if (spkRes.ok) {
        const spData = await spkRes.json();
        setSpeakers(spData.speakers || []);
      }

      if (resRes.ok) {
        const rData = await resRes.json();
        setResources(rData.resources || []);
      }
    } catch (err) {
      console.error('Error fetching seminar delegate details:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.Id, user?.Email]);

  useEffect(() => {
    fetchDelegateData();
  }, [fetchDelegateData]);

  const isCheckedIn = delegateInfo?.CheckInStatus === 'CheckedIn';
  const qrPayload = JSON.stringify({
    type: 'SEMINAR_DELEGATE_PASS',
    eventId,
    userId: user?.Id,
    name: user?.UserName || user?.name,
    email: user?.Email,
    ticketId: `SEM-${eventId}-${user?.Id}`
  });

  // Unique days for agenda filtering
  const distinctDays = Array.from(new Set(sessions.map((s) => s.DayNumber || 1))).sort((a, b) => a - b);
  const filteredSessions = activeDay === 'all'
    ? sessions
    : sessions.filter((s) => Number(s.DayNumber || 1) === Number(activeDay));

  return (
    <div className="space-y-6 text-slate-900 dark:text-white font-sans">
      {/* ── PRIORITY 1: OFFICIAL DELEGATE GATE PASS ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-xl">
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-black/25 text-white border border-white/20">
                Official Delegate Pass
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                Solo Entry
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {eventData?.EventName || 'Seminar Conference Pass'}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
              Present this digital pass at the auditorium entry gate for check-in
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isCheckedIn ? (
              <span className="px-4 py-2 rounded-2xl bg-white text-emerald-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Gate Checked In</span>
              </span>
            ) : (
              <span className="px-4 py-2 rounded-2xl bg-black/80 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Awaiting Entry</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Delegate Details */}
          <div className="md:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-500">Delegate Name</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{user?.UserName || user?.name || 'Registered Delegate'}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{user?.Email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-500">Institution / College</p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                  {user?.College || user?.college || 'Registered Campus'}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Delegate ID: #{user?.Id || '00'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Auditorium Hall</span>
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {eventData?.AuditoriumVenue || eventData?.Location || 'Main Campus Central Auditorium'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Seminar Date &amp; Time</span>
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {eventData?.StartDate ? new Date(eventData.StartDate).toLocaleDateString() : 'Upcoming'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                This barcode ticket is valid for one individual entry. Please present your physical badge or college ID along with this ticket at the auditorium gate.
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 dark:border-transparent shadow-md">
              <QRCodeSVG
                value={qrPayload}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase">Gate Scan Ticket</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">SEM-{eventId}-{user?.Id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRIORITY 2: WEBSITE SIGNATURE THEME FOLDER TABS ── */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto scrollbar-none">
          {[
            { id: 'agenda', label: `Conference Agenda (${sessions.length})`, icon: CalendarDays },
            { id: 'speakers', label: `Keynote Speakers (${speakers.length})`, icon: Mic },
            { id: 'attendance', label: 'Gate Attendance', icon: ShieldCheck },
            { id: 'proceedings', label: `Proceedings & Slides (${resources.length})`, icon: FileText },
            { id: 'feedback', label: 'Delegate Feedback', icon: MessageSquare }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
              >
                {isActive ? (
                  <motion.div
                    layoutId="seminarDelegateTabFolder"
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
                  <TabIcon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Connected Content Container */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl rounded-tl-none border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6"
        >
          {/* TAB 1: CONFERENCE AGENDA */}
          {activeTab === 'agenda' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Seminar Schedule &amp; Timetable</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Chronological order of keynote speeches, panel discussions, and paper presentations
                  </p>
                </div>

                {/* Day selector if multi-day */}
                {distinctDays.length > 1 && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveDay('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeDay === 'all'
                          ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All Days
                    </button>
                    {distinctDays.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setActiveDay(d)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activeDay === d
                            ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-xs'
                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Day {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredSessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredSessions.map((session, idx) => (
                    <div
                      key={session.Id || idx}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 hover:border-emerald-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                          #{session.OrderIndex || idx + 1}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {session.SessionTitle}
                            </h4>
                            {session.DayNumber && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                Day {session.DayNumber}
                              </span>
                            )}
                          </div>

                          {session.Description && (
                            <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                              {session.Description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            {session.SpeakerName && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <Mic className="w-3.5 h-3.5" />
                                <span>{session.SpeakerName}</span>
                              </span>
                            )}

                            {session.HallName && (
                              <span className="text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{session.HallName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        {(session.StartTime || session.EndTime) && (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-mono shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {session.StartTime || ''} {session.EndTime ? `- ${session.EndTime}` : ''}
                          </span>
                        )}

                        {session.ResourcesUrl && (
                          <a
                            href={session.ResourcesUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Slides</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                  No conference agenda slots published yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KEYNOTE SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="space-y-5">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Distinguished Keynote Speakers &amp; Chairs</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Eminent researchers, industry leaders, and keynote presenters for this conference
                </p>
              </div>

              {speakers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {speakers.map((spk) => (
                    <div
                      key={spk.Id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3.5">
                          {spk.PhotoUrl ? (
                            <img
                              src={spk.PhotoUrl}
                              alt={spk.Name}
                              className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-zinc-700 shadow-sm shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-13 h-13 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-lg items-center justify-center shrink-0 ${spk.PhotoUrl ? 'hidden' : 'flex'}`}>
                            {spk.Name ? spk.Name.charAt(0) : 'S'}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {spk.Name}
                            </h4>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                              {spk.Designation || 'Keynote Speaker'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              {spk.Organization || 'Institution'}
                            </p>
                          </div>
                        </div>

                        {spk.Topic && (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800">
                            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider mb-0.5">
                              Keynote Address
                            </span>
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug line-clamp-2">
                              {spk.Topic}
                            </p>
                          </div>
                        )}

                        {spk.Bio && (
                          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                            {spk.Bio}
                          </p>
                        )}
                      </div>

                      {spk.LinkedinUrl && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                          <a
                            href={spk.LinkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <span>Speaker Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                  No keynote speakers added yet for this seminar.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GATE ATTENDANCE & INSTRUCTIONS */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Auditorium Gate Attendance &amp; Protocol</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Physical gate entry status, auditorium hall allocation, and conference admission rules
                </p>
              </div>

              {/* Status Header Box */}
              <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCheckedIn
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl ${isCheckedIn ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                    {isCheckedIn ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-base font-black">
                      {isCheckedIn ? 'Gate Check-In Verified' : 'Awaiting Gate Arrival Check-In'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">
                      {isCheckedIn
                        ? `Entry confirmed on ${delegateInfo?.CheckInTime ? new Date(delegateInfo.CheckInTime).toLocaleString('en-IN') : 'Today'} • Verified by ${delegateInfo?.CheckInBy || 'Gate Admin'}`
                        : 'Please show your official QR pass at the entrance desk when arriving at the auditorium.'}
                    </p>
                  </div>
                </div>

                <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider self-start sm:self-center border ${
                  isCheckedIn
                    ? 'bg-white dark:bg-black text-emerald-600 border-emerald-500/40'
                    : 'bg-white dark:bg-black text-amber-600 border-amber-500/40'
                }`}>
                  {isCheckedIn ? 'Status: Present (In Hall)' : 'Status: Pending Gate Entry'}
                </span>
              </div>

              {/* Attendance Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Venue Hall</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {eventData?.AuditoriumVenue || eventData?.Location || 'Main Campus Central Auditorium'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Admission Ticket</p>
                  <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    SEM-{eventId}-{user?.Id}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">Delegate Category</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Solo Registered Delegate
                  </p>
                </div>
              </div>

              {/* Guidelines Box */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Important Conference Entry Guidelines</span>
                </h5>
                <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
                  <li>Auditorium registration doors open 30 minutes prior to the inaugural keynote.</li>
                  <li>Delegates must present their college ID or valid government photo ID card alongside this digital pass.</li>
                  <li>Live hall seating is allocated on a verified check-in order.</li>
                  <li>Attendees must remain seated during live paper presentation sessions to minimize disruption.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: PROCEEDINGS & SLIDES */}
          {activeTab === 'proceedings' && (
            <div className="space-y-5">
              <div className="pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Conference Proceedings &amp; Slide Decks</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Download keynote slide presentations, official research proceedings, and whitepapers
                </p>
              </div>

              {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map((res) => (
                    <div
                      key={res.Id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block">
                          {res.ResourceType || 'Slide Deck'}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {res.Title}
                        </h4>
                        {res.Description && (
                          <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {res.Description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800">
                        <a
                          href={res.ResourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-black hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download / View Resource</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500">
                  No conference slide decks or proceedings uploaded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DELEGATE FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="max-w-3xl mx-auto">
              <UnifiedEventFeedbackCard
                eventId={eventId}
                user={user}
                compact={true}
                title="Seminar Delegate Feedback & Keynote Review"
              />
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
