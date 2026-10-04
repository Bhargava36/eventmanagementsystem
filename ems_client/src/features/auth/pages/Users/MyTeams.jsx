import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ByteEmptyState from '../../../../components/Molecules/ByteEmptyState';
import {
  Calendar,
  Users,
  Crown,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

/* ── dot-pulse keyframes ── */
const DotStyle = () => (
  <style>{`
    @keyframes teamDotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.3; transform: scale(0.55); }
    }
    .t-dp1 { animation: teamDotPulse 1.8s ease-in-out infinite; }
    .t-dp2 { animation: teamDotPulse 1.8s ease-in-out 0.32s infinite; }
    .t-dp3 { animation: teamDotPulse 1.8s ease-in-out 0.64s infinite; }
  `}</style>
);

const CardDots = () => (
  <span className="flex items-center gap-[3px] shrink-0">
    <span className="t-dp1 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
    <span className="t-dp2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
    <span className="t-dp3 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
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

export default function MyTeams() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    try {
      setLoading(true);
      setError('');

      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = user?.Id;

      if (!userId) {
        setError('User ID not found');
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/teams/my-teams/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch teams');
      }

      setTeams(data.teams || []);
    } catch (err) {
      console.error('Get my teams error:', err);
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      <DotStyle />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
              Team Workspace
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
              My Teams
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Events where you are registered as a team lead or team member
            </p>
          </div>
          {teams.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                {teams.length} {teams.length === 1 ? 'Team' : 'Teams'} Active
              </span>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="py-24 text-center bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-zinc-400">Loading your teams…</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchMyTeams}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col items-center">
            <ByteEmptyState
              searchTerm=""
              hasActiveFilters={false}
              onReset={() => {}}
              onQuickSearch={null}
              title="No teams yet"
              description="You haven't joined or created any team yet. Explore open competitions to create or join a squad with your peers!"
              actionLabel="Explore Competitions"
              onAction={() => navigate('/user/competitions')}
              speechText="Beep boop! Form your dream team! (◕‿◕)"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team, idx) => {
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
                  {/* Card top */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        isLead
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isLead ? <Crown className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {isLead ? 'Team Lead' : 'Team Member'}
                      </span>
                      {team.RegistrationStatus && (
                        <StatusBadge status={team.RegistrationStatus} />
                      )}
                    </div>
                    <CardDots />
                  </div>

                  {/* Event & Team Info */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Participated Event
                    </p>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {team.EventName || 'Hackathon Event'}
                    </h3>
                  </div>

                  {/* Details strip */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300">
                      <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="font-semibold truncate">{team.TeamName}</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Size:</span>
                      <span className="font-semibold">{team.TeamSize || 1} Members</span>
                    </div>

                    {(team.StartDate || team.EndDate) && (
                      <div className="col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="font-medium truncate">
                          {fmt(team.StartDate)} {team.EndDate ? `– ${fmt(team.EndDate)}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center gap-2 pt-2 mt-auto border-t border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => navigate(`/user/teamInfo/${team.TeamId}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                    >
                      Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {team.EventId && (
                      <button
                        onClick={() => navigate(`/events/${team.EventId}`)}
                        title="View Event Details"
                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}