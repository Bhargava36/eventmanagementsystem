import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../../../../Hooks/useAuth';
import ByteEmptyState from '../../../../components/Molecules/ByteEmptyState';
import {
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  Crown,
  ChevronRight,
  ExternalLink,
  ScrollText,
  Award,
  Clock,
} from 'lucide-react';

/* ── dot-pulse keyframes ── */
const DotStyle = () => (
  <style>{`
    @keyframes dotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.55); }
    }
    .dp1 { animation: dotPulse 1.8s ease-in-out infinite; }
    .dp2 { animation: dotPulse 1.8s ease-in-out 0.32s infinite; }
    .dp3 { animation: dotPulse 1.8s ease-in-out 0.64s infinite; }
  `}</style>
);

const CardDots = () => (
  <span className="flex items-center gap-[3px] shrink-0">
    <span className="dp1 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
    <span className="dp2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
    <span className="dp3 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
  </span>
);

const StatusBadge = ({ status = '' }) => {
  const s = status.toLowerCase();
  let cls = 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800';
  if (s === 'approved') cls = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  if (s === 'pending')  cls = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status || 'Enrolled'}
    </span>
  );
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const user = authUser || (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  })();

  const [events,  setEvents]  = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [user?.Id]);

  const load = async () => {
    try {
      setLoading(true);
      const userId   = user?.Id;
      const promises = [fetch('http://localhost:3000/api/events')];
      if (userId) promises.push(fetch(`http://localhost:3000/api/teams/my-teams/${userId}`));
      const results  = await Promise.allSettled(promises);
      if (results[0]?.status === 'fulfilled' && results[0].value.ok) {
        const d = await results[0].value.json();
        setEvents(d.events || []);
      }
      if (results[1]?.status === 'fulfilled' && results[1].value.ok) {
        const d = await results[1].value.json();
        setMyTeams(d.teams || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  const openEventsCount = useMemo(() =>
    events.filter(e => {
      const s = (e.EventStatus || '').toLowerCase();
      return !s || s === 'upcoming' || s === 'live' || s === 'ongoing';
    }).length,
  [events]);

  const initial = user?.UserName ? user.UserName.charAt(0).toUpperCase() : 'P';

  const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 15 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: 'easeOut', delay },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      <DotStyle />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">

        {/* ── PAGE HEADER ── */}
        <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
              Participant Dashboard
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              Welcome back, {user?.UserName || 'Participant'}
            </h1>
            {(user?.College || user?.State) && (
              <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap">
                {user?.College && <span>{user.College}</span>}
                {user?.College && user?.State && <span className="text-slate-300 dark:text-zinc-700">·</span>}
                {user?.State && <span>{user.State}</span>}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/user/teams"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-all">
              <Users className="h-3.5 w-3.5" /> My Teams
            </Link>
            <Link to="/user/profile"
              className="w-9 h-9 rounded-full bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors">
              {initial}
            </Link>
          </div>
        </motion.div>

        {/* ── STAT STRIP ── */}
        <motion.div {...fadeUp(0.06)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Registrations',  value: myTeams.length,   icon: <Users    className="h-4 w-4" /> },
            { label: 'My Teams',       value: myTeams.length,   icon: <Users    className="h-4 w-4" /> },
            { label: 'Open Events',    value: openEventsCount,  icon: <Clock    className="h-4 w-4" /> },
            { label: 'Total Events',   value: events.length,    icon: <Calendar className="h-4 w-4" /> },
          ].map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp(0.06 + i * 0.05)}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-zinc-950 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{s.label}</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{s.icon}</span>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{s.value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── MY REGISTERED EVENTS ── */}
        <motion.section {...fadeUp(0.12)} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">My Registered Events</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Events you've registered for and your team details</p>
            </div>
            {myTeams.length > 0 && (
              <Link to="/user/teams"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {myTeams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col items-center">
              <ByteEmptyState
                searchTerm=""
                hasActiveFilters={false}
                onReset={() => {}}
                onQuickSearch={null}
                title="No registrations yet"
                description="You haven't registered for any events yet. Browse the competitions below and register your team!"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map((team, idx) => {
                const isLead = (team.Role || '').toLowerCase().includes('lead');
                return (
                  <motion.div
                    key={team.TeamId || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={team.RegistrationStatus} />
                      <CardDots />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {team.EventName || 'Hackathon Event'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Users className="h-3 w-3 shrink-0" />
                        <span>{team.TeamName}</span>
                        {isLead && (
                          <span className="flex items-center gap-0.5 ml-1 text-amber-600 dark:text-amber-400 font-semibold">
                            <Crown className="h-3 w-3" /> Lead
                          </span>
                        )}
                      </p>
                    </div>

                    {(team.StartDate || team.EndDate) && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-xs text-slate-600 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="font-medium">{fmt(team.StartDate)} – {fmt(team.EndDate)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 mt-auto border-t border-slate-100 dark:border-zinc-800">
                      <button
                        onClick={() => navigate(`/user/teamInfo/${team.TeamId}`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        Workspace <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/events/${team.EventId}`)}
                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ── QUICK LINKS ── */}
        <motion.section {...fadeUp(0.18)} className="pt-6 border-t border-slate-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { to: '/user/competitions',       icon: Trophy,      label: 'Competitions',       sub: 'Browse & register for events'   },
              { to: '/user/problem-statements', icon: ScrollText,  label: 'Problem Statements', sub: 'Browse challenge tracks'        },
              { to: '/user/teams',              icon: Users,       label: 'Team Management',    sub: 'Manage your squads'             },
              { to: '/user/profile',            icon: Award,       label: 'My Profile',         sub: 'Update credentials & skills'   },
            ].map(({ to, icon: Icon, label, sub }) => (
              <Link key={to} to={to}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-emerald-500/50 shadow-sm hover:shadow-md flex items-center justify-between group transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{sub}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}