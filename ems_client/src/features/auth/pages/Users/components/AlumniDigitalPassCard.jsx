import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';
import useToast from '../../../../../Hooks/useToast';
import {
  QrCode,
  Calendar,
  MapPin,
  Clock,
  Download,
  Building,
  GraduationCap,
  Users,
  Utensils,
  CalendarDays,
  Mic,
  Camera,
  CheckCircle2,
  ExternalLink,
  Globe,
  HeartHandshake,
  Shirt,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../../../../../lib/calendarUtils';
import UnifiedEventFeedbackCard from './UnifiedEventFeedbackCard';
export default function AlumniDigitalPassCard({ eventId, user, team }) {
  const toast = useToast();
  const passPrintRef = useRef(null);
  const [activeTab, setActiveTab] = useState('pass'); // 'pass' | 'agenda' | 'speakers' | 'memories' | 'feedback'
  const [config, setConfig] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  // Active pass sub-tab: Gate Pass or Banquet Food Token
  const [passType, setPassType] = useState('gate'); // 'gate' | 'food'
  const loadAlumniData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const [cfgRes, agRes, spkRes, memRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/config`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/agenda`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/speakers`),
        fetch(`${API_BASE_URL}/api/alumni/${eventId}/memories`)
      ]);
      if (cfgRes.ok) {
        const c = await cfgRes.json();
        setConfig(c.config || c);
      }
      if (agRes.ok) {
        const a = await agRes.json();
        setAgenda(a.sessions || a.agenda || (Array.isArray(a) ? a : []));
      }
      if (spkRes.ok) {
        const s = await spkRes.json();
        setSpeakers(s.speakers || (Array.isArray(s) ? s : []));
      }
      if (memRes.ok) {
        const m = await memRes.json();
        setMemories(m.memories || (Array.isArray(m) ? m : []));
      }
    } catch (err) {
      console.error('Failed to load alumni pass details:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);
  useEffect(() => {
    loadAlumniData();
  }, [loadAlumniData]);
  // Alumnus profile details from team / user
  const alumnusName = user?.UserName || team?.UserName || user?.name || 'Alumnus Member';
  const graduationYear = team?.GraduationYear || user?.GraduationYear || 'Alumni';
  const company = team?.CurrentCompany || user?.CurrentCompany || '';
  const designation = team?.Designation || user?.Designation || '';
  const city = team?.City || user?.City || '';
  const guestCount = Number(team?.GuestCount) || 0;
  const guestNames = team?.GuestNames || '';
  const gateCheckedIn = team?.GateCheckInStatus === 'CheckedIn';
  const foodScanned = Boolean(team?.FoodTokenScanned);
  // QR Payload for Gate and Banquet
  const gateQrPayload = useMemo(() => {
    return JSON.stringify({
      type: 'alumni_gate',
      teamId: team?.Id || team?.TeamId,
      eventId: eventId,
      userId: user?.Id || team?.TeamLeadUserId
    });
  }, [team, eventId, user]);
  const foodQrPayload = useMemo(() => {
    return JSON.stringify({
      type: 'alumni_food',
      teamId: team?.Id || team?.TeamId,
      eventId: eventId,
      userId: user?.Id || team?.TeamLeadUserId
    });
  }, [team, eventId, user]);
  // Calendar Helpers
  const calendarEvent = useMemo(() => {
    return {
      title: team?.EventName || 'Grand Alumni Reunion',
      description: config?.WelcomeNote || 'Grand Alumni Meet & Reunion Banquet',
      location: config?.VenueHall || team?.Location || 'Main Campus Auditorium & Lawns',
      startDate: team?.StartDate || new Date(),
      endDate: team?.EndDate || team?.StartDate || new Date()
    };
  }, [team, config]);
  const handlePrintPass = () => {
    window.print();
  };
  const tabs = [
    { id: 'pass', label: 'VIP Reunion Pass', icon: QrCode },
    { id: 'agenda', label: 'Reunion Agenda', count: agenda.length, icon: CalendarDays },
    { id: 'speakers', label: 'Keynote Alumni', count: speakers.length, icon: Mic },
    { id: 'memories', label: 'Nostalgia Wall', count: memories.length, icon: Camera },
    { id: 'feedback', label: 'Feedback & Rating', icon: Heart },
  ];
  return (
    <div className="space-y-6">
      {/* Application Signature Folder Tabs */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
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
                    layoutId="alumniPassCardTabFolder"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-white/10 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 z-0" />
                )}
                <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
                }`}>
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-gray-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {/* Tab Content Container */}
        <div className="rounded-3xl rounded-tl-none border border-slate-200 dark:border-white/10 bg-white dark:bg-black p-6 sm:p-7 shadow-sm">
          {/* TAB 1: VIP DIGITAL PASS & TOKENS */}
          {activeTab === 'pass' && (
            <div className="space-y-6">
              {/* Welcome Note from Alma Mater */}
              {config?.WelcomeNote && (
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-slate-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
                  <Building className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                      A Message from Your Alma Mater:
                    </strong>
                    {config.WelcomeNote}
                  </div>
                </div>
              )}
              {/* The VIP Pass Container */}
              <div
                ref={passPrintRef}
                className="relative overflow-hidden rounded-3xl bg-white dark:bg-black border border-emerald-500/30 shadow-xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto"
              >
                {/* Top Pass Brand Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-slate-200 dark:border-white/10 pb-5">
                  <div className="space-y-1">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      • Official Alumni Reunion Pass
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {team?.EventName || 'Grand Alumni Reunion'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {config?.VenueHall || team?.Location || 'Campus Auditorium & Lawns'}
                    </p>
                  </div>
                  {/* Pass Status */}
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-mono font-bold text-slate-400 block">
                      PASS ID: #{team?.Id || team?.TeamId || 'ALUMNI'}
                    </span>
                    {gateCheckedIn ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Admitted to Campus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        Confirmed RSVP
                      </span>
                    )}
                  </div>
                </div>
                {/* Pass Body: Alumnus Details & QR Scanner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  {/* Alumnus Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {user?.Photo ? (
                        <img
                          src={user.Photo}
                          alt={alumnusName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
                          {alumnusName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                          {alumnusName}
                        </h4>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Class of {graduationYear}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400">
                          {user?.College || team?.College || 'College of Engineering'}
                        </p>
                      </div>
                    </div>
                    {/* Professional Info */}
                    <div className="space-y-1.5 text-xs">
                      {(designation || company) && (
                        <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                          <Building className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold">
                            {designation} {company && `@ ${company}`}
                          </span>
                        </div>
                      )}
                      {city && (
                        <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{city}</span>
                        </div>
                      )}
                      {config?.DressCode && (
                        <div className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                          <Shirt className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>Dress: {config.DressCode}</span>
                        </div>
                      )}
                    </div>
                    {/* Accompanying Guest Badge */}
                    {guestCount > 0 ? (
                      <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2 font-semibold">
                        <HeartHandshake className="w-4 h-4 shrink-0" />
                        <span>
                          Accompanied by {guestCount} guest(s) {guestNames && `(${guestNames})`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400">Solo Attendee Registration</div>
                    )}
                  </div>
                  {/* QR Code Card with Toggle for Gate vs Food */}
                  <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                    {/* QR Toggle Switch */}
                    <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-white/10 w-full text-[11px] font-bold">
                      <button
                        onClick={() => setPassType('gate')}
                        className={`flex-1 py-1 rounded-lg transition-all ${
                          passType === 'gate'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-gray-400'
                        }`}
                      >
                        Gate QR
                      </button>
                      <button
                        onClick={() => setPassType('food')}
                        className={`flex-1 py-1 rounded-lg transition-all ${
                          passType === 'food'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 dark:text-gray-400'
                        }`}
                      >
                        Banquet Token
                      </button>
                    </div>
                    {/* QR Display */}
                    <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200">
                      <QRCodeSVG
                        value={passType === 'gate' ? gateQrPayload : foodQrPayload}
                        size={150}
                        level="H"
                      />
                    </div>
                    <div className="text-center space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {passType === 'gate' ? 'Entrance Gate Pass' : 'Gala Dinner Food Voucher'}
                      </p>
                      <p className="text-[10px] text-slate-400 max-w-[180px]">
                        {passType === 'gate'
                          ? 'Present at security gate for instant check-in'
                          : `Valid for 1 Alumnus + ${guestCount} Guest(s) at banquet buffet`}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Pass Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-slate-200 dark:border-white/10 pt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <a
                      href={buildGoogleCalendarUrl(calendarEvent)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-gray-300 flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      Google Calendar
                    </a>
                    <button
                      onClick={() => downloadIcsFile(calendarEvent)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-700 dark:text-gray-300 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      Download .ics
                    </button>
                  </div>
                  <button
                    onClick={handlePrintPass}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print / Save Pass
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* TAB 2: REUNION AGENDA & ACTIVITIES */}
          {activeTab === 'agenda' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-500" />
                  Reunion Day Program &amp; Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  Join us for a full day of memories, nostalgia tours, keynote addresses, and the gala reunion dinner.
                </p>
              </div>
              {agenda.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Agenda schedule will be published shortly by the reunion committee.
                </div>
              ) : (
                <div className="space-y-3">
                  {agenda.map((s, idx) => (
                    <div
                      key={s.Id || idx}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20 font-mono">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold mt-0.5">{s.StartTime || '--:--'}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {s.SessionTitle}
                            </h4>
                            {s.SpeakerName && (
                              <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                • Host: {s.SpeakerName}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {s.StartTime} - {s.EndTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                              {s.VenueHall || 'Main Auditorium'}
                            </span>
                          </div>
                          {s.Description && (
                            <p className="text-xs text-slate-600 dark:text-gray-400 pt-1 leading-relaxed">
                              {s.Description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* TAB 3: DISTINGUISHED KEYNOTE SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-500" />
                  Distinguished Keynote Alumni
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  Inspiring alumni leaders, entrepreneurs, and innovators sharing their journeys.
                </p>
              </div>
              {speakers.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Distinguished speakers list will be announced soon.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {speakers.map((spk, idx) => (
                    <div
                      key={spk.Id || idx}
                      className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {spk.PhotoUrl ? (
                            <img
                              src={spk.PhotoUrl}
                              alt={spk.Name}
                              className="w-14 h-14 rounded-2xl object-cover border border-emerald-500/30"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg">
                              {spk.Name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {spk.Name}
                            </h4>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                              Class of {spk.GraduationYear} {spk.Branch && `(${spk.Branch})`}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-gray-400">
                              {spk.Designation} {spk.Company && `@ ${spk.Company}`}
                            </p>
                          </div>
                        </div>
                        {spk.Topic && (
                          <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
                            <strong className="text-[10px] uppercase font-bold text-slate-400 block">Keynote Address:</strong>
                            <span className="font-semibold text-slate-800 dark:text-gray-200">"{spk.Topic}"</span>
                          </div>
                        )}
                        {spk.Bio && (
                          <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                            {spk.Bio}
                          </p>
                        )}
                      </div>
                      {spk.LinkedinUrl && (
                        <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                          <a
                            href={spk.LinkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            View LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* TAB 4: NOSTALGIA WALL & MEMORIES */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  Nostalgia Wall &amp; Campus Memories
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  Vintage campus snapshots, graduation memories, and moments of friendship.
                </p>
              </div>
              {memories.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Photos and memories will be added during and after the reunion meet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {memories.map((m) => (
                    <div
                      key={m.Id}
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] shadow-sm space-y-2 pb-3"
                    >
                      <div className="aspect-video bg-black overflow-hidden">
                        <img
                          src={m.MediaUrl}
                          alt={m.Title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="px-3">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          • Class of {m.BatchYear || 'Alumni'}
                        </span>
                        <h4 className="font-bold text-xs mt-1 text-slate-900 dark:text-white">
                          {m.Title}
                        </h4>
                        {m.UploadedBy && (
                          <p className="text-[10px] text-slate-400">From {m.UploadedBy}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* TAB 5: FEEDBACK & RATING (REUSES UNIFIED EVENT FEEDBACK) */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <UnifiedEventFeedbackCard
                eventId={eventId}
                user={user}
                team={team}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
