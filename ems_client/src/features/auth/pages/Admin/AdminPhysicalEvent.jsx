import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RefreshCw
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
      if (!eventId || !eventDetails) {
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

        <div className="grid grid-cols-1 gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2 sm:p-6 xl:grid-cols-[1.5fr_1.2fr_1fr] xl:items-center xl:gap-6 xl:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
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
              {countCards.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {roomCountsLoading ? '—' : value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-500/5 dark:text-emerald-300">
              Accommodation requests:{" "}
              <span className="font-bold">
                {serviceCountsLoading
                  ? "—"
                  : `${accommodationChoiceCounts.participants} team members across ${accommodationChoiceCounts.teams} teams. See the Physical Teams table below for each response.`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAccomodationRedirect}
              disabled={!isEnabled(accommodationEnabled)}
              className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500"
            >
              {isEnabled(accommodationEnabled) ? 'Manage Rooms' : 'Accommodation Disabled'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900/60 dark:bg-zinc-950 sm:p-6">
            <div className="mb-4 flex min-h-14 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                <Settings className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>

              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">
                Event Controls
              </h2>
            </div>

            <p className="mb-6 min-h-[4.5rem] text-sm leading-6 text-slate-500 dark:text-slate-400">
              View the enabled or disabled status of accommodation, food distribution and ID card generation.
            </p>

            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Accommodation
                </span>
                <StatusBadge enabled={isEnabled(accommodationEnabled)} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Food Distribution
                </span>
                <StatusBadge enabled={isEnabled(foodEnabled)} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  ID Card Generation
                </span>
                <StatusBadge enabled={isEnabled(idCardEnabled)} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSettingsRedirect}
              className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
            >
              <Settings className="h-4 w-4" />
              View Settings
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
              {[
                ['Participants', serviceCountsLoading ? '—' : foodCounts.participants],
                ['Teams', serviceCountsLoading ? '—' : foodCounts.teams],
                ['Tokens', serviceCountsLoading ? '—' : foodCounts.tokens]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFoodRedirect}
              disabled={!isEnabled(foodEnabled)}
              className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500"
            >
              {isEnabled(foodEnabled) ? 'Manage Food' : 'Food Disabled'}
              <ArrowRight className="h-4 w-4" />
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
              {[
                ['Total IDs', serviceCountsLoading ? '—' : idCardCounts.total],
                ['Generated', serviceCountsLoading ? '—' : idCardCounts.generated],
                ['Pending', serviceCountsLoading ? '—' : idCardCounts.pending]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleIdRedirect}
              disabled={!isEnabled(idCardEnabled)}
              className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500"
            >
              {isEnabled(idCardEnabled) ? 'Generate IDs' : 'ID Cards Disabled'}
              <ArrowRight className="h-4 w-4" />
            </button>
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
                    <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                      Loading registered physical teams...
                    </td>
                  </tr>
                ) : !error && filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                      {teams.length === 0
                        ? 'No physical teams found. Check ParticipationMode in the API response.'
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