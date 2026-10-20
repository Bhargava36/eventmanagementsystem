import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Building,
  Sparkles,
  Check
} from 'lucide-react';

const readApiResponse = async (response, fallbackMessage) => {
  const body = await response.text();
  let data = {};
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      if (!response.ok) {
        throw new Error(
          `Physical services API returned HTTP ${response.status} without JSON. Restart the backend server so it loads the physical-services routes.`
        );
      }
      throw new Error('Physical services API returned an invalid response.');
    }
  }
  if (!response.ok) {
    throw new Error(data.message || `${fallbackMessage} (HTTP ${response.status}).`);
  }
  return data;
};

const isEnabled = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  const normalized = String(value ?? '').trim().toLowerCase();
  if (['false', '0', 'no', 'disabled', 'off', ''].includes(normalized)) {
    return false;
  }
  if (['true', '1', 'yes', 'enabled', 'on'].includes(normalized)) {
    return true;
  }
  return false;
};

const StatusBadge = ({ enabled }) => (
  <span
    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
      enabled
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400'
    }`}
  >
    {enabled ? 'Enabled' : 'Disabled'}
  </span>
);

const StatusIcon = ({ status, className }) =>
  String(status || '').toLowerCase() === 'pending'
    ? <Clock className={className} />
    : <CheckCircle2 className={className} />;

function AdminPhysicalEvent() {
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem('admin') || 'null');
  const eventId = admin?.EventId;

  const [eventDetails, setEventDetails] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState('');

  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'accommodation' | 'food' | 'id-cards' | 'controls'

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [roomCounts, setRoomCounts] = useState({
    total: 0,
    allocated: 0,
    available: 0
  });

  const [roomCountsLoading, setRoomCountsLoading] = useState(true);
  const [accommodationChoiceCounts, setAccommodationChoiceCounts] = useState({
    participants: 0,
    teams: 0
  });
  const [foodCounts, setFoodCounts] = useState({
    participants: 0,
    teams: 0,
    tokens: 0
  });
  const [idCardCounts, setIdCardCounts] = useState({
    total: 0,
    generated: 0,
    pending: 0
  });
  const [serviceCountsLoading, setServiceCountsLoading] = useState(true);
  const [serviceCountsError, setServiceCountsError] = useState("");
  const [teamServicePreferences, setTeamServicePreferences] = useState({});
  const [idCardStatusByTeam, setIdCardStatusByTeam] = useState({});

  const accommodationEnabled =
    eventDetails?.AccommodationEnabled ??
    eventDetails?.accommodationEnabled ??
    eventDetails?.EnableAccommodation ??
    eventDetails?.enableAccommodation;

  const foodEnabled =
    eventDetails?.FoodEnabled ??
    eventDetails?.foodEnabled ??
    eventDetails?.EnableFood ??
    eventDetails?.enableFood;

  const idCardEnabled =
    eventDetails?.IDCardEnabled ??
    eventDetails?.idCardEnabled ??
    eventDetails?.EnableIDCard ??
    eventDetails?.enableIDCard;

  const handleAccomodationRedirect = () => {
    if (!isEnabled(accommodationEnabled)) return;
    navigate(`/admin/accomodation?eventId=${encodeURIComponent(eventId)}`);
  };

  const handleFoodRedirect = () => {
    if (!isEnabled(foodEnabled)) return;
    navigate(`/admin/food?eventId=${encodeURIComponent(eventId)}`);
  };

  const handleIdRedirect = () => {
    if (!isEnabled(idCardEnabled)) return;
    navigate(`/admin/id-card?eventId=${encodeURIComponent(eventId)}`);
  };

  const handleSettingsRedirect = () => {
    navigate('/admin/settings');
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setEventError('No event assigned to this admin.');
        setEventLoading(false);
        return;
      }

      try {
        setEventLoading(true);
        setEventError('');

        const response = await fetch(
          `http://localhost:3000/api/events/${eventId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch event details: ${response.status}`
          );
        }

        const data = await response.json();

        const event =
          data?.event ??
          data?.data?.event ??
          data?.data ??
          data;

        setEventDetails(event);
      } catch (err) {
        console.error('Fetch event details error:', err);
        setEventError(err.message || 'Unable to fetch event details.');
      } finally {
        setEventLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const eventName =
    eventDetails?.EventName ??
    eventDetails?.eventName ??
    eventDetails?.Name ??
    eventDetails?.name ??
    'Event name unavailable';

  const eventDescription =
    eventDetails?.Description ??
    eventDetails?.description ??
    eventDetails?.EventDescription ??
    eventDetails?.eventDescription ??
    'Physical Event';

  const startDate =
    eventDetails?.StartDate ??
    eventDetails?.startDate ??
    eventDetails?.EventStartDate ??
    eventDetails?.eventStartDate ??
    eventDetails?.Start_Date ??
    null;

  const endDate =
    eventDetails?.EndDate ??
    eventDetails?.endDate ??
    eventDetails?.EventEndDate ??
    eventDetails?.eventEndDate ??
    eventDetails?.End_Date ??
    null;

  const location =
    eventDetails?.Location ??
    eventDetails?.location ??
    eventDetails?.Venue ??
    eventDetails?.venue ??
    eventDetails?.EventLocation ??
    eventDetails?.eventLocation ??
    'Location unavailable';

  const formatDate = (value) => {
    if (!value) return 'Not specified';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const fetchTeams = async () => {
    if (!eventId) {
      setError('No event assigned to this admin.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `http://localhost:3000/api/teams/event/${eventId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch registered teams: ${response.status}`
        );
      }

      const data = await response.json();

      const registeredTeams = Array.isArray(data)
        ? data
        : Array.isArray(data?.teams)
          ? data.teams
          : Array.isArray(data?.data)
            ? data.data
            : [];

      const physicalTeams = registeredTeams.filter((team) => {
        const mode = String(
          team.ParticipationMode ??
          team.participationMode ??
          ''
        ).trim().toLowerCase();

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

  useEffect(() => {
    fetchTeams();
  }, [eventId]);

  useEffect(() => {
    const fetchRoomCounts = async () => {
      if (!eventId) {
        setRoomCountsLoading(false);
        return;
      }

      try {
        setRoomCountsLoading(true);

        const response = await fetch(
          `http://localhost:3000/api/accommodation`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch accommodation rooms: ${response.status}`
          );
        }

        const data = await response.json();

        const allRooms = Array.isArray(data)
          ? data
          : Array.isArray(data?.rooms)
            ? data.rooms
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const eventRooms = allRooms.filter((room) => {
          const roomEventId =
            room.EventId ??
            room.eventId ??
            room.event_id;

          return roomEventId == null ||
            String(roomEventId) === String(eventId);
        });

        const total = eventRooms.length;

        const allocated = eventRooms.filter((room) => {
          const occupied = Number(
            room.Occupied ??
            room.occupied ??
            room.AllocatedCount ??
            room.allocatedCount ??
            0
          );

          return occupied > 0;
        }).length;

        setRoomCounts({
          total,
          allocated,
          available: Math.max(total - allocated, 0)
        });
      } catch (err) {
        console.error('Fetch accommodation counts error:', err);
        setRoomCounts({ total: 0, allocated: 0, available: 0 });
      } finally {
        setRoomCountsLoading(false);
      }
    };

    fetchRoomCounts();
  }, [eventId]);

  useEffect(() => {
    const fetchServiceCounts = async () => {
      if (!eventId) {
        setServiceCountsLoading(false);
        return;
      }

      setServiceCountsLoading(true);
      setServiceCountsError('');
      const requests = [];

      requests.push(
        fetch(`http://localhost:3000/api/physical-services/events/${eventId}/team-preferences`)
          .then(async (response) => {
            const data = await readApiResponse(response, 'Failed to fetch team service choices');
            const preferences = Array.isArray(data.preferences) ? data.preferences : [];
            setTeamServicePreferences(Object.fromEntries(
              preferences.map((preference) => [
                String(preference.TeamId),
                preference
              ])
            ));
            const accommodationOptIns = preferences.filter((preference) =>
              isEnabled(preference.AccommodationRequested)
            );
            setAccommodationChoiceCounts({
              participants: accommodationOptIns.reduce(
                (total, preference) => total + Number(preference.MemberCount || 0),
                0
              ),
              teams: accommodationOptIns.length
            });
          })
      );

      if (eventDetails) {
        if (isEnabled(foodEnabled)) {
          requests.push(
            fetch(`http://localhost:3000/api/physical-services/events/${eventId}/food-participants`)
              .then(async (response) => {
                const data = await readApiResponse(response, 'Failed to fetch food opt-ins');
                const participants = Array.isArray(data.participants) ? data.participants : [];
                setFoodCounts({
                  participants: participants.length,
                  teams: new Set(participants.map((person) => person.TeamId)).size,
                  tokens: participants.reduce(
                    (total, person) =>
                      total +
                      Number(Boolean(person.TiffinToken)) +
                      Number(Boolean(person.LunchToken)) +
                      Number(Boolean(person.DinnerToken)),
                    0
                  )
                });
              })
          );
        } else {
          setFoodCounts({ participants: 0, teams: 0, tokens: 0 });
        }

      if (isEnabled(idCardEnabled)) {
        requests.push(
          fetch(`http://localhost:3000/api/id-cards/events/${eventId}/participants`)
            .then(async (response) => {
              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch ID card status.');
              }
              const participants = Array.isArray(data.participants) ? data.participants : [];
              const generated = participants.filter((participant) =>
                Boolean(participant.IdCardNumber || participant.idCardNumber) ||
                Number(participant.IdCardGenerated ?? participant.idCardGenerated) === 1
              ).length;
              const statusByTeam = {};
              participants.forEach((participant) => {
                const teamId = participant.TeamId ?? participant.teamId;
                if (teamId == null) return;
                const key = String(teamId);
                if (!statusByTeam[key]) {
                  statusByTeam[key] = { total: 0, generated: 0 };
                }
                statusByTeam[key].total += 1;
                if (
                  participant.IdCardNumber ||
                  participant.idCardNumber ||
                  Number(participant.IdCardGenerated ?? participant.idCardGenerated) === 1
                ) {
                  statusByTeam[key].generated += 1;
                }
              });
              setIdCardStatusByTeam(statusByTeam);
              setIdCardCounts({
                total: participants.length,
                generated,
                pending: participants.length - generated
              });
            })
        );
      } else {
        setIdCardCounts({ total: 0, generated: 0, pending: 0 });
        setIdCardStatusByTeam({});
      }
      }

      try {
        await Promise.all(requests);
      } catch (countError) {
        console.error('Fetch physical service counts error:', countError);
        setServiceCountsError(countError.message || 'Unable to fetch physical service totals.');
      } finally {
        setServiceCountsLoading(false);
      }
    };

    fetchServiceCounts();
  }, [eventId, eventDetails, foodEnabled, idCardEnabled]);

  const filteredTeams = teams.filter((team) => {
    const search = searchTerm.trim().toLowerCase();

    return [
      team.TeamName,
      team.name,
      team.leadName,
      team.TeamLeadName,
      team.TeamLeadEmail,
      team.LeaderName,
      team.LeaderEmail,
      team.Email,
      team.College,
      team.college,
      team.State,
      team.state
    ].some((value) =>
      String(value || '').toLowerCase().includes(search)
    );
  });

  const handleTeamDetails = (team) => {
    const teamId =
      team.TeamId ??
      team.TeamID ??
      team.Id ??
      team.id;

    if (!teamId) {
      window.alert('Team ID is not available.');
      return;
    }

    navigate(`/admin/teams/${teamId}`, {
      state: {
        team,
        eventId
      }
    });
  };

  const getBadgeStyle = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'completed':
      case 'requested':
      case 'accepted':
      case 'generated':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500';

      case 'pending':
        return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500';

      case 'disabled':
        return 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400';

      default:
        return 'bg-slate-50 text-slate-700 dark:bg-zinc-800 dark:text-slate-300';
    }
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

  const countCards = [
    {
      label: 'Total Rooms',
      value: roomCounts.total
    },
    {
      label: 'Allocated',
      value: roomCounts.allocated
    },
    {
      label: 'Available',
      value: roomCounts.available
    }
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50 p-3 font-sans text-slate-900 dark:bg-black dark:text-white sm:p-5 lg:p-8">
      <div className="mx-auto w-full max-w-[1600px] min-w-0 space-y-5 sm:space-y-6">

        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black sm:p-8 lg:flex-row lg:items-center">
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
                {eventLoading ? 'Loading event...' : eventName}
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
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh Teams
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black sm:grid-cols-2 sm:p-6 xl:grid-cols-[1.5fr_1.2fr_1fr] xl:items-center xl:gap-6 xl:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-black">
              <CalendarDays className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {eventLoading ? 'Loading event...' : eventName}
              </h2>

              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {eventLoading
                  ? 'Loading...'
                  : `${String(eventDescription).slice(0, 50)}${String(eventDescription).length > 50 ? '...' : ''}`}
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
                {eventLoading
                  ? 'Loading dates...'
                  : `${formatDate(startDate)} – ${formatDate(endDate)}`}
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
                {eventLoading ? 'Loading location...' : location}
              </p>
            </div>
          </div>
        </div>

        {eventError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {eventError}
          </div>
        )}
        {serviceCountsError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {serviceCountsError}
          </div>
        )}

        {/* Modern Folder-Style Tabs Navigation Bar matching AdminDashboard model */}
        <div className="space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10 -mb-px">
            <div className="flex items-end gap-2 overflow-x-auto no-scrollbar">
              {[
                {
                  id: 'teams',
                  label: `Registered Teams (${teams.length})`,
                  icon: Users,
                },
                {
                  id: 'accommodation',
                  label: `Accommodation (${accommodationChoiceCounts.teams})`,
                  icon: BedDouble,
                },
                {
                  id: 'food',
                  label: `Food Distribution (${foodCounts.participants} Meals)`,
                  icon: Utensils,
                },
                {
                  id: 'id-cards',
                  label: `ID Card Studio (${idCardCounts.generated}/${idCardCounts.total})`,
                  icon: IdCard,
                },
                {
                  id: 'controls',
                  label: 'Event Controls',
                  icon: Settings,
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="relative h-11 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="adminPhysicalEventTabActive"
                        className="absolute inset-0 -bottom-[2px] rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      >
                        {/* Seamless bottom mask */}
                        <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-zinc-800 z-0" />
                    )}

                    <span
                      className={`relative z-20 flex items-center gap-2 ${
                        isActive
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Content Card Seamlessly Attached to Tabs */}
          <div
            className={`p-6 sm:p-8 ${
              activeTab === 'teams' ? 'rounded-tl-none' : ''
            } bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-xs relative z-0`}
          >
            <AnimatePresence mode="wait">
              {/* TAB 1: REGISTERED PHYSICAL TEAMS */}
              {activeTab === 'teams' && (
                <motion.div
                  key="tab-teams"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex min-w-0 flex-col items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80 lg:flex-row lg:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                        <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
                      </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Registered Physical Teams ({teams.length})
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Teams participating in on-campus tracks. Monitor accommodation, food, and ID card status.
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {loading
                    ? 'Loading physical teams...'
                    : `${filteredTeams.length} matching physical team(s)`}
                </span>

                <button
                  type="button"
                  onClick={fetchTeams}
                  disabled={loading || !eventId}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-900"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto overscroll-x-contain">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800/50 dark:bg-black dark:text-slate-500">
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
                        <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                          Loading registered physical teams...
                        </td>
                      </tr>
                    ) : !error && filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                          {teams.length === 0
                            ? 'No physical teams found for this event.'
                            : 'No physical teams match your search.'}
                        </td>
                      </tr>
                    ) : !error ? (
                      filteredTeams.map((team, index) => {
                        const teamName = getTeamName(team);
                        const leadName =
                          team.LeaderName ||
                          team.TeamLeadName ||
                          team.leadName ||
                          '—';

                        const leadEmail =
                          team.LeaderEmail ||
                          team.TeamLeadEmail ||
                          team.Email ||
                          '—';

                        const teamId = team.TeamId ?? team.TeamID ?? team.Id ?? team.id;
                        const servicePreference = teamServicePreferences[String(teamId)];
                        const accommodation = !isEnabled(accommodationEnabled)
                          ? 'Disabled'
                          : isEnabled(servicePreference?.AccommodationRequested)
                            ? 'Requested'
                            : isEnabled(servicePreference?.PreferencesSubmitted)
                              ? 'Declined'
                              : 'Awaiting';
                        const food = !isEnabled(foodEnabled)
                          ? 'Disabled'
                          : isEnabled(servicePreference?.FoodAccepted)
                            ? 'Accepted'
                            : isEnabled(servicePreference?.PreferencesSubmitted)
                              ? 'Declined'
                              : 'Awaiting';
                        const cardStatus = idCardStatusByTeam[String(teamId)];
                        const idCard = !isEnabled(idCardEnabled)
                          ? 'Disabled'
                          : !cardStatus || cardStatus.generated === 0
                            ? 'Pending'
                            : cardStatus.generated === cardStatus.total
                              ? 'Generated'
                              : 'Partial';

                        return (
                          <tr
                            key={team.TeamId || team.TeamID || team.Id || team.id || index}
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
                              <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(accommodation === 'Requested' ? 'requested' : accommodation === 'Disabled' ? 'disabled' : accommodation === 'Declined' ? 'disabled' : 'Pending')}`}>
                                <BedDouble className="h-3 w-3" />
                                {accommodation}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(food === 'Accepted' ? 'accepted' : food === 'Disabled' || food === 'Declined' ? 'disabled' : 'Pending')}`}>
                                <StatusIcon status={food === 'Accepted' ? 'completed' : food === 'Disabled' || food === 'Declined' ? 'disabled' : 'Pending'} className="h-3 w-3" />
                                {food}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getBadgeStyle(idCard === 'Generated' ? 'generated' : idCard === 'Disabled' ? 'disabled' : 'Pending')}`}>
                                <StatusIcon status={idCard === 'Generated' ? 'completed' : idCard === 'Disabled' ? 'disabled' : 'Pending'} className="h-3 w-3" />
                                {idCard}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <button
                                type="button"
                                title="View team details"
                                onClick={() => handleTeamDetails(team)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-800 dark:bg-black dark:text-slate-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
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
            </motion.div>
          )}

          {/* TAB 2: ACCOMMODATION MANAGEMENT */}
          {activeTab === 'accommodation' && (
            <motion.div
              key="tab-accommodation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header bar with action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <BedDouble className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Accommodation & Room Management
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                      Manage campus hostel rooms, view capacity, and allocate rooms to requesting teams.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAccomodationRedirect}
                  disabled={!isEnabled(accommodationEnabled)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <BedDouble className="h-4 w-4" />
                  <span>{isEnabled(accommodationEnabled) ? 'Open Accommodation Manager' : 'Accommodation Disabled'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total Rooms</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {roomCountsLoading ? '—' : roomCounts.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Allocated Rooms</p>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                    {roomCountsLoading ? '—' : roomCounts.allocated}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Available Rooms</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {roomCountsLoading ? '—' : roomCounts.available}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Teams Requested</p>
                  <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                    {serviceCountsLoading ? '—' : accommodationChoiceCounts.teams}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Members Needing Beds</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                    {serviceCountsLoading ? '—' : accommodationChoiceCounts.participants}
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs sm:text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>Accommodation requests:</strong> {serviceCountsLoading ? 'Loading...' : `${accommodationChoiceCounts.participants} team members across ${accommodationChoiceCounts.teams} teams.`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAccomodationRedirect}
                  className="font-bold underline hover:no-underline shrink-0 text-emerald-700 dark:text-emerald-400"
                >
                  Allocate in Rooms &rarr;
                </button>
              </div>

              {/* Teams Requesting Accommodation Table */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <BedDouble className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Teams Requesting Accommodation ({teams.filter((t) => isEnabled(teamServicePreferences[String(t.TeamId ?? t.TeamID ?? t.Id ?? t.id)]?.AccommodationRequested)).length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Only teams that marked "Yes" for lodging</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800/60">
                        <th className="px-4 py-3">Team Name</th>
                        <th className="px-4 py-3">Team Lead</th>
                        <th className="px-4 py-3">College</th>
                        <th className="px-4 py-3 text-center">Members</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40">
                      {teams.filter((t) => isEnabled(teamServicePreferences[String(t.TeamId ?? t.TeamID ?? t.Id ?? t.id)]?.AccommodationRequested)).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500 text-xs">
                            No physical teams have requested accommodation yet.
                          </td>
                        </tr>
                      ) : (
                        teams
                          .filter((t) => isEnabled(teamServicePreferences[String(t.TeamId ?? t.TeamID ?? t.Id ?? t.id)]?.AccommodationRequested))
                          .map((team, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                              <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                                {getTeamName(team)}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-zinc-300">
                                {team.LeaderName || team.TeamLeadName || team.leadName || '—'}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-zinc-400">
                                {getCollege(team)}
                              </td>
                              <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                {getMemberCount(team)}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <BedDouble className="h-3 w-3" />
                                  Requested
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={handleAccomodationRedirect}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600"
                                >
                                  <span>Allocate</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FOOD MANAGEMENT */}
          {activeTab === 'food' && (
            <motion.div
              key="tab-food"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header bar with action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Food & Meal Token Management
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                      Handle breakfast, lunch, and dinner meal distribution and token scanning for teams.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFoodRedirect}
                  disabled={!isEnabled(foodEnabled)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Utensils className="h-4 w-4" />
                  <span>{isEnabled(foodEnabled) ? 'Manage Food Distribution' : 'Food Disabled'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Opted-In Participants</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {serviceCountsLoading ? '—' : foodCounts.participants}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Headcount needing meals</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Opted-In Teams</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {serviceCountsLoading ? '—' : foodCounts.teams}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Registered physical teams</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Meal Tokens Issued</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {serviceCountsLoading ? '—' : foodCounts.tokens}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Breakfast, Lunch & Dinner</p>
                </div>
              </div>

              {/* Teams Opted into Food Table */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <Utensils className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Teams Opted into Food ({teams.filter((t) => isEnabled(teamServicePreferences[String(t.TeamId ?? t.TeamID ?? t.Id ?? t.id)]?.FoodAccepted)).length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Only teams that marked "Yes" for food</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800/60">
                        <th className="px-4 py-3">Team Name</th>
                        <th className="px-4 py-3">Team Lead</th>
                        <th className="px-4 py-3">College</th>
                        <th className="px-4 py-3 text-center">Members</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40">
                      {teams.filter((t) => isEnabled(teamServicePreferences[String(t.TeamId ?? t.TeamID ?? t.Id ?? t.id)]?.FoodAccepted)).length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500 text-xs">
                            No physical teams have opted into food yet.
                          </td>
                        </tr>
                      ) : (
                        teams
                          .filter((t) => isEnabled(teamServicePreferences[String(t.TeamId ?? t.TeamID ?? t.Id ?? t.id)]?.FoodAccepted))
                          .map((team, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                              <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                                {getTeamName(team)}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-zinc-300">
                                {team.LeaderName || team.TeamLeadName || team.leadName || '—'}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-zinc-400">
                                {getCollege(team)}
                              </td>
                              <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                {getMemberCount(team)}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Accepted
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={handleFoodRedirect}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600"
                                >
                                  <span>Tokens</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ID CARDS GENERATION STUDIO */}
          {activeTab === 'id-cards' && (
            <motion.div
              key="tab-id-cards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header bar with action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <IdCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Participant ID Card Studio
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                      Generate, preview, verify QR codes, and download printable ID badges for participants.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleIdRedirect}
                  disabled={!isEnabled(idCardEnabled)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <IdCard className="h-4 w-4" />
                  <span>{isEnabled(idCardEnabled) ? 'Open ID Card Studio' : 'ID Cards Disabled'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Total ID Cards Needed</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {serviceCountsLoading ? '—' : idCardCounts.total}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Generated & Ready</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {serviceCountsLoading ? '—' : idCardCounts.generated}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Pending Generation</p>
                  <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
                    {serviceCountsLoading ? '—' : idCardCounts.pending}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs dark:border-zinc-800/80 dark:bg-black space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-zinc-300">ID Cards Completion</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {idCardCounts.total ? Math.round((idCardCounts.generated / idCardCounts.total) * 100) : 0}% Complete
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${idCardCounts.total ? Math.min(100, Math.round((idCardCounts.generated / idCardCounts.total) * 100)) : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Teams ID Card Status Table */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <IdCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Physical Teams ID Card Status ({teams.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Status of badge issuance per team</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800/60">
                        <th className="px-4 py-3">Team Name</th>
                        <th className="px-4 py-3">Team Lead</th>
                        <th className="px-4 py-3 text-center">Members</th>
                        <th className="px-4 py-3">Card Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/40">
                      {teams.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-500 text-xs">
                            No physical teams registered yet.
                          </td>
                        </tr>
                      ) : (
                        teams.map((team, idx) => {
                          const teamId = team.TeamId ?? team.TeamID ?? team.Id ?? team.id;
                          const cardStatus = idCardStatusByTeam[String(teamId)];
                          const statusText = !cardStatus || cardStatus.generated === 0
                            ? 'Pending'
                            : cardStatus.generated === cardStatus.total
                              ? 'Generated'
                              : `${cardStatus.generated}/${cardStatus.total} Ready`;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                              <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                                {getTeamName(team)}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-zinc-300">
                                {team.LeaderName || team.TeamLeadName || team.leadName || '—'}
                              </td>
                              <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                {getMemberCount(team)}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                                  statusText === 'Generated'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
                                }`}>
                                  <StatusIcon status={statusText === 'Generated' ? 'completed' : 'pending'} className="h-3 w-3" />
                                  {statusText}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={handleIdRedirect}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-black px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600"
                                >
                                  <span>Generate</span>
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: EVENT CONTROLS */}
          {activeTab === 'controls' && (
            <motion.div
              key="tab-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header bar with action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Physical Event Controls & Service Policies
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                      Configure feature enablement for accommodation, food catering, and ID card generation.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSettingsRedirect}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configure in Event Settings</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* 3 Rich Control Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Accommodation Service Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-black p-6 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <BedDouble className="h-6 w-6" />
                      </div>
                      <StatusBadge enabled={isEnabled(accommodationEnabled)} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Accommodation Service
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                      Allows physical teams to opt-in for hostel/campus lodging and permits organizers to allocate rooms, view capacity, and track occupants.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={handleAccomodationRedirect}
                      disabled={!isEnabled(accommodationEnabled)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-black dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-200 disabled:opacity-50 transition"
                    >
                      <span>Manage Rooms</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Food Service Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-black p-6 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Utensils className="h-6 w-6" />
                      </div>
                      <StatusBadge enabled={isEnabled(foodEnabled)} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Food Distribution Service
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                      Provides automated QR tokens for breakfast, lunch, and dinner meals. Organizers can track meal collection and token scans in real time.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={handleFoodRedirect}
                      disabled={!isEnabled(foodEnabled)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-black dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-200 disabled:opacity-50 transition"
                    >
                      <span>Manage Food</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ID Cards Service Card */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-black p-6 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <IdCard className="h-6 w-6" />
                      </div>
                      <StatusBadge enabled={isEnabled(idCardEnabled)} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      ID Card Generation Service
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                      Generates participant badge passes with barcode/QR verification. Useful for campus security, lab workstation entrance, and attendance.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={handleIdRedirect}
                      disabled={!isEnabled(idCardEnabled)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-black dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 py-2.5 text-xs font-bold text-slate-800 dark:text-zinc-200 disabled:opacity-50 transition"
                    >
                      <span>Generate ID Cards</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPhysicalEvent;