import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Tent,
  CalendarDays,
  MapPin,
  Users,
  BedDouble,
  Utensils,
  IdCard,
  Settings,
  Eye,
  ArrowRight,
  List,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
function AdminPhysicalEvent() {
    const navigate = useNavigate();
    const handleAccomodationRedirect = () => {
        navigate('/admin/accomodation');
    };  
    const handleFoodRedirect = () => {
        navigate('/admin/food');
    };
    const handleIdRedirect = () => {
        navigate('/admin/id-card');
    };
  const admin = JSON.parse(localStorage.getItem('admin'));
  const eventId = admin?.EventId;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchTeams();
    } else {
      setLoading(false);
      setError('No event assigned to this admin.');
    }
  }, [eventId]);

  const fetchTeams = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:3000/api/teams/event/${eventId}`);
      if (!response.ok) {
        throw new Error( `Failed to fetch registered teams. Status: ${response.status}`);
      }
      const data = await response.json();
      const registeredTeams = Array.isArray(data) ? data : Array.isArray(data.teams) ? data.teams : Array.isArray(data.data) ? data.data : [];

      const physicalTeams = registeredTeams.filter((team) => {
        const mode = String( team.ParticipationMode ?? '').trim().toLowerCase();
        return (
          mode === 'physical' ||
          mode === 'both' ||
          mode === 'hybrid' ||
          mode.includes('physical')
        );
      });
      setTeams(physicalTeams);
    } catch (err) {
      console.error('Fetch teams error:', err);
      setError(err.message || 'Unable to fetch physical teams.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredTeams = teams.filter((team) => {
    const search = searchTerm.trim().toLowerCase();

    return [team.TeamName, team.name, team.leadName, team.TeamLeadName, team.TeamLeadEmail, team.LeaderName, team.LeaderEmail, team.Email, team.College, team.college, team.State, team.state].some((value) =>
      String(value || '').toLowerCase().includes(search)
    );
  });

  const getBadgeStyle = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500';
      case 'pending':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-slate-300';
    }
  };

  const StatusIcon = ({ status, className }) => {
    if (String(status || '').toLowerCase() === 'pending') {
      return <Clock className={className} />;
    }
    return <CheckCircle2 className={className} />;
  };

  const getTeamName = (team) =>
    team.TeamName || team.name || 'Unnamed Team';

  const getCollege = (team) =>
    team.College || team.college || '—';

  const getState = (team) =>
    team.State || team.state || '—';

  const getMemberCount = (team) =>
    team.TeamSize ??
    team.MemberCount ??
    team.MembersCount ??
    team.members ??
    '—';

  const getInitials = (name) =>
    String(name || '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'TM';

  const avatarColors = [
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
    'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400'
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50 p-3 font-sans text-slate-900 dark:bg-[#070908] dark:text-white sm:p-5 lg:p-8">
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-5 sm:space-y-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Tent className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                Physical Event Management
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Manage accommodation, food, ID cards and other physical event
              arrangements for{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Avishkaar 4
              </span>
              . Ensure a smooth and seamless experience for all physical participants.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTeams}
            disabled={loading || !eventId}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-500"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Teams
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 sm:p-6 xl:grid-cols-[1.5fr_1.2fr_1fr] xl:items-center xl:gap-6 xl:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
              <CalendarDays className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                Avishkaar 4 – Physical Event
              </h2>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                On-Campus Hackathon & Tech Festival
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-500" />
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Event Dates
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                24 Nov 2026 – 25 Nov 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-500" />
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Venue
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                AITAM Campus, Tekkali
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-4">

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <BedDouble className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                Accommodation Management
              </h2>
            </div>

            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage room allocation, check-in status and accommodation details for teams.
            </p>

            <div className="mb-8 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Rooms</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">50</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Allocated</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">42</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Available</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">8</p>
              </div>
            </div>
             
              <button type="button" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 cursor-pointer"
              onClick={handleAccomodationRedirect}
              >
                Manage Rooms <ArrowRight className="h-4 w-4" />
              </button>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Utensils className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                Food Management
              </h2>
            </div>

            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Handle meal schedules, food preferences and distribution status for all teams.
            </p>

            <div className="mb-8 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Meals</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">1440</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Served</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">1120</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">320</p>
              </div>
            </div>

              <button type="button" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 cursor-pointer"
              onClick={handleFoodRedirect}
              >
                Manage Food <ArrowRight className="h-4 w-4" />
              </button>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <IdCard className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                ID Card Generation
              </h2>
            </div>

            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Generate and download participant ID cards for registered teams and individuals.
            </p>

            <div className="mb-8 grid grid-cols-3 gap-2">
              <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Total IDs</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">156</p>
              </div>
              <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Generated</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">142</p>
              </div>
              <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">14</p>
              </div>
            </div>

            <div className="mt-auto">
              <button type="button" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 cursor-pointer"
              onClick={handleIdRedirect}
              >
                Generate IDs <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Settings className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                Event Controls
              </h2>
            </div>

            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400"> Quick access to event settings and physical event management tools.</p>

            <div className="mb-8 space-y-4">
              {['Accommodation', 'Food Distribution', 'ID Card Gen.'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-9 items-center rounded-full bg-emerald-700 p-0.5 dark:bg-emerald-500">
                      <div className="h-4 w-4 translate-x-4 rounded-full bg-white shadow-sm" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Enabled
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <button type="button" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10 min-[400px]:w-fit">
                <Settings className="h-4 w-4" /> View Settings
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          <div className="mb-6 flex min-w-0 flex-col items-start justify-between gap-4 sm:mb-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Registered Physical Teams ({teams.length})
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Only teams that selected physical participation are displayed.
                </p>
              </div>
            </div>

            <div className="relative w-full min-w-0 lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search physical teams..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {loading
                ? 'Loading physical teams...'
                : `${filteredTeams.length} matching physical team(s)`}
            </span>

            <button
              type="button"
              onClick={fetchTeams}
              disabled={loading || !eventId}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800/50 dark:bg-zinc-950 dark:text-slate-500">
                  <th className="whitespace-nowrap px-6 py-4">Team Name</th>
                  <th className="whitespace-nowrap px-6 py-4">Team Lead</th>
                  <th className="whitespace-nowrap px-6 py-4">College / State</th>
                  <th className="whitespace-nowrap px-6 py-4 text-center">Members</th>
                  <th className="whitespace-nowrap px-6 py-4">Accommodation</th>
                  <th className="whitespace-nowrap px-6 py-4">Food</th>
                  <th className="whitespace-nowrap px-6 py-4">ID Card</th>
                  <th className="whitespace-nowrap px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-slate-500">
                      Loading registered physical teams...
                    </td>
                  </tr>
                ) : !error && filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-slate-500">
                      {teams.length === 0
                        ? 'No physical teams found. Check ParticipationMode in the API response.'
                        : 'No physical teams match your search.'}
                    </td>
                  </tr>
                ) : !error ? (
                  filteredTeams.map((team, index) => {
                    const teamName = getTeamName(team);
                    const leadName = team.LeaderName ||'—';
                    const leadEmail = team.LeaderEmail ||'—';
                    const accommodation = 'Pending';
                    const food = 'Pending';
                    const idCard = 'Pending';

                    return (
                      <tr
                        key={team.TeamId || team.Id || team.id || index}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${avatarColors[index % avatarColors.length]}`}>
                              {getInitials(teamName)}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {teamName}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-200">
                            {leadName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {leadEmail}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <p className="font-medium text-slate-700 dark:text-slate-300">
                            {getCollege(team)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {getState(team)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold">
                              {getMemberCount(team)}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(accommodation)}`}>
                            <BedDouble className="h-3 w-3" />
                            {accommodation}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(food)}`}>
                            <StatusIcon status={food} className="h-3 w-3" />
                            {food}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(idCard)}`}>
                            <StatusIcon status={idCard} className="h-3 w-3" />
                            {idCard}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            type="button"
                            title="Team actions"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPhysicalEvent;