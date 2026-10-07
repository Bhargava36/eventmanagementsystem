import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Video,
  Radio,
  ExternalLink,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Code
} from 'lucide-react';
import useAuth from '../../../../Hooks/useAuth';
import useToast from '../../../../Hooks/useToast';

function formatDate(date) {
  if (!date) return 'TBA';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return date;
  }
}

export default function ParticipantVirtualEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = user?.Id || user?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      loadAll();
    }
  }, [id, userId]);

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [evRes, timeRes] = await Promise.allSettled([
        fetch(`http://localhost:3000/api/events/${id}`),
        fetch(`http://localhost:3000/api/event_timelines/event/${id}`)
      ]);

      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const evData = await evRes.value.json();
        const evObj = Array.isArray(evData) ? evData[0] : (evData.event || evData);
        setEvent(evObj);
      }

      if (timeRes.status === 'fulfilled' && timeRes.value.ok) {
        const tlData = await timeRes.value.json();
        const list = Array.isArray(tlData) ? tlData : (tlData.timelines || []);
        setTimelines(list.filter((t) => t.Track === 'Virtual' || t.Track === 'General'));
      }

      // Load user's registered team for this event
      if (userId) {
        try {
          const teamsRes = await fetch(`http://localhost:3000/api/teams/my-teams/${userId}`);
          if (teamsRes.ok) {
            const data = await teamsRes.json();
            const list = data.teams || [];
            const myTeam = list.find((t) => Number(t.EventId) === Number(id));
            if (myTeam) {
              setTeam(myTeam);
              if (myTeam.TeamId) {
                const infoRes = await fetch(`http://localhost:3000/api/teams/info/${myTeam.TeamId}/${userId}`);
                if (infoRes.ok) {
                  const infoData = await infoRes.json();
                  setTeamMembers(infoData.members || []);
                }
              }
            }
          }
        } catch (e) {
          console.error('Failed to load team data:', e);
        }
      }
    } catch (err) {
      console.error('Virtual event load error:', err);
      toast.error('Failed to load virtual event details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const isLive = event?.VirtualStatus === 'LIVE';
  const meetUrl = event?.VirtualMeetUrl;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Loading Virtual Event Room...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Event Not Found</h2>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Explore Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-zinc-100 p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
        <Link
          to={`/events/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Event Details</span>
        </Link>

        <button
          type="button"
          onClick={loadAll}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Hero Live Status Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
        isLive
          ? 'bg-white dark:bg-zinc-950 border-emerald-500/40 shadow-sm'
          : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              {isLive ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>LIVE VIRTUAL EVENT IN PROGRESS</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Scheduled • Waiting for Start</span>
                </div>
              )}
              <span className="text-xs text-slate-400 font-medium">Virtual Hackathon Hub</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {event.EventName}
            </h1>

            <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {isLive
                ? 'The virtual hackathon is now in session! Click below to join the Google Meet room and connect with mentors and jury panels.'
                : 'Welcome to the Virtual Hackathon Hub. On the scheduled event day, when organizers initiate the session, the live meeting room will activate here.'}
            </p>
          </div>

          {/* Action Button: JOIN GOOGLE MEET */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isLive ? (
              meetUrl ? (
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer"
                >
                  <Video className="h-4 w-4" />
                  <span>JOIN GOOGLE MEET ROOM</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-600 dark:text-zinc-400">
                  <p className="font-bold text-slate-900 dark:text-white">Event is LIVE</p>
                  <p className="text-[11px] mt-0.5">Organizers will provide the meeting URL shortly.</p>
                </div>
              )
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs">
                <Clock className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                <p className="font-bold text-slate-900 dark:text-white">Starts {formatDate(event.VirtualStartDate || event.StartDate)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Room will go LIVE once organizers begin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Registered Team Card + Virtual Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User's Registered Team Details */}
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Your Registered Team
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              Virtual Track
            </span>
          </div>

          {team ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Name</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{team.TeamName}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{team.College || 'Registered Team'}</p>
              </div>

              {teamMembers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Members</span>
                  <div className="space-y-1.5">
                    {teamMembers.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 text-xs border border-slate-100 dark:border-zinc-800"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{m.UserName}</p>
                          <p className="text-[10px] text-slate-400">{m.Email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                          {m.Role === 'TeamLead' ? 'Lead' : 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              <p>You are participating as an individual or team lead.</p>
            </div>
          )}
        </div>

        {/* Problem Statements & Guidelines */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Virtual Sprint Resources
            </h3>
            <Link
              to="/user/problem-statements"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>View Problem Statements</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Virtual Requirements</span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {event.VirtualRequirements || 'Stable internet connection, GitHub repository, functioning webcam and microphone for virtual pitching.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Virtual Facilities Provided</span>
              <p className="text-xs text-slate-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                {event.VirtualFacilities || 'Online Discord / Meet technical support channels, mentor review slots, digital submission portal.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Virtual Submission Protocol:</strong> All commits made during the virtual sprint must be pushed to your team's designated repository before the code freeze deadline.
            </span>
          </div>
        </div>
      </div>

      {/* Virtual Schedule / Timelines */}
      {timelines.length > 0 && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Virtual Track Live Timeline & Milestones
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {timelines.length} Phases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {timelines.map((tl, index) => (
              <div
                key={tl.Id || index}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-emerald-500/40 transition"
              >
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{tl.TimelineDate}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tl.Heading}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {tl.Description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
