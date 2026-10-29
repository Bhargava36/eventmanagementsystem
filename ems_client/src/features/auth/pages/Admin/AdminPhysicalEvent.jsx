import React, { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
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
  Check,
  Lightbulb,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  FileText,
  Target,
  Code,
  Filter,
  Layers,
  Palette
} from 'lucide-react';
import { getThemeIcon } from '@/components/Molecules/PhysicalHackathonThemesSection';
import { isSoloTeamSize } from '@/lib/utils';

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

  // ── Hackathon Themes & Problem Statements Management ──
  const [themes, setThemes] = useState([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [organizerStatements, setOrganizerStatements] = useState([]);
  const [participantStatements, setParticipantStatements] = useState([]);
  const [physicalPSMode, setPhysicalPSMode] = useState('organizer_provided');
  const [statementSelections, setStatementSelections] = useState([]);

  // Theme Form Modal
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [themeForm, setThemeForm] = useState({ ThemeName: '', Description: '', DisplayOrder: 0, ImageUrl: '' });
  const [themeSaving, setThemeSaving] = useState(false);

  // Problem Statement Form Modal (for Organizer-Provided mode)
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [editingStatementId, setEditingStatementId] = useState(null);
  const [statementForm, setStatementForm] = useState({
    ProblemCode: '',
    Title: '',
    Description: '',
    Theme: '',
    Category: 'Software',
    MaxTeams: 5
  });
  const [statementSaving, setStatementSaving] = useState(false);

  // Filters
  const [participantThemeFilter, setParticipantThemeFilter] = useState('ALL');
  const [participantCategoryFilter, setParticipantCategoryFilter] = useState('ALL');
  const [participantStatusFilter, setParticipantStatusFilter] = useState('ALL');
  const [statementCategoryFilter, setStatementCategoryFilter] = useState('ALL');
  const [searchPSSubmissions, setSearchPSSubmissions] = useState('');

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
          `${API_BASE_URL}/api/events/${eventId}`
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

  useEffect(() => {
    if (eventDetails?.PhysicalPSMode) {
      setPhysicalPSMode(eventDetails.PhysicalPSMode);
    }
  }, [eventDetails?.PhysicalPSMode]);

  const fetchThemesAndStatements = async () => {
    if (!eventId) return;
    try {
      setThemesLoading(true);
      const [tRes, osRes, psRes, pubRes, selRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/problem-statements/event/${eventId}/themes`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${eventId}`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${eventId}/participant-statements`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${eventId}/publish-status`),
        fetch(`${API_BASE_URL}/api/problem-statements/event/${eventId}/selections`)
      ]);

      if (tRes.status === 'fulfilled' && tRes.value.ok) {
        const tData = await tRes.value.json();
        setThemes(tData.themes || []);
      }
      if (osRes.status === 'fulfilled' && osRes.value.ok) {
        const osData = await osRes.value.json();
        setOrganizerStatements(osData.problemStatements || []);
      }
      if (psRes.status === 'fulfilled' && psRes.value.ok) {
        const psData = await psRes.value.json();
        setParticipantStatements(psData.statements || []);
      }
      if (selRes.status === 'fulfilled' && selRes.value.ok) {
        const selData = await selRes.value.json();
        setStatementSelections(selData.selections || []);
      }
    } catch (e) {
      console.error('Failed to load themes/statements:', e);
    } finally {
      setThemesLoading(false);
    }
  };

  useEffect(() => {
    if (eventId && (eventDetails?.EventType || '').toLowerCase() === 'hackathon') {
      fetchThemesAndStatements();
    }
  }, [eventId, eventDetails?.EventType]);

  const handleSaveTheme = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!themeForm.ThemeName.trim()) {
      alert('Theme Name is required');
      return;
    }
    try {
      setThemeSaving(true);
      const url = editingThemeId
        ? `${API_BASE_URL}/api/problem-statements/themes/${editingThemeId}`
        : `${API_BASE_URL}/api/problem-statements/event/${eventId}/themes`;
      const method = editingThemeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save theme');
      }
      setShowThemeModal(false);
      setEditingThemeId(null);
      setThemeForm({ ThemeName: '', Description: '', DisplayOrder: 0, ImageUrl: '' });
      fetchThemesAndStatements();
    } catch (err) {
      alert(err.message || 'Failed to save theme');
    } finally {
      setThemeSaving(false);
    }
  };

  const handleDeleteTheme = async (themeId) => {
    if (!window.confirm('Are you sure you want to delete this theme?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/themes/${themeId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete theme');
      fetchThemesAndStatements();
    } catch (err) {
      alert(err.message || 'Failed to delete theme');
    }
  };

  const handleSaveStatement = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!statementForm.ProblemCode.trim() || !statementForm.Title.trim()) {
      alert('Problem Code and Title are required');
      return;
    }
    try {
      setStatementSaving(true);
      const url = editingStatementId
        ? `${API_BASE_URL}/api/problem-statements/${editingStatementId}`
        : `${API_BASE_URL}/api/problem-statements/event/${eventId}`;
      const method = editingStatementId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statementForm)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save problem statement');
      }
      setShowStatementModal(false);
      setEditingStatementId(null);
      setStatementForm({ ProblemCode: '', Title: '', Description: '', Theme: '', Category: 'Software', MaxTeams: 5 });
      fetchThemesAndStatements();
    } catch (err) {
      alert(err.message || 'Failed to save problem statement');
    } finally {
      setStatementSaving(false);
    }
  };

  const handleDeleteStatement = async (psId) => {
    if (!window.confirm('Are you sure you want to delete this problem statement?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/${psId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete statement');
      fetchThemesAndStatements();
    } catch (err) {
      alert(err.message || 'Failed to delete statement');
    }
  };

  const handleUpdateParticipantStatus = async (id, status, remarks = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/problem-statements/participant-statements/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: status, AdminRemarks: remarks })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchThemesAndStatements();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

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
        `${API_BASE_URL}/api/teams/event/${eventId}`
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
          `${API_BASE_URL}/api/accommodation`
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
        fetch(`${API_BASE_URL}/api/physical-services/events/${eventId}/team-preferences`)
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
            fetch(`${API_BASE_URL}/api/physical-services/events/${eventId}/food-participants`)
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
          fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/participants`)
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
                ...((eventDetails?.EventType || '').toLowerCase() === 'hackathon'
                  ? [
                      {
                        id: 'themes-challenges',
                        label: `Themes & Challenges (${themes.length})`,
                        icon: Lightbulb,
                      },
                    ]
                  : []),
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
            <AnimatePresence>
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/team-card-designer?eventId=${encodeURIComponent(eventId)}`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/40 px-3.5 py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-300 transition cursor-pointer shadow-xs"
                    title="Design custom table display cards for teams"
                  >
                    <Palette className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Design Team Cards</span>
                  </button>

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

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/id-card-designer?eventId=${encodeURIComponent(eventId)}`)}
                    disabled={!isEnabled(idCardEnabled)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    <Palette className="h-4 w-4 text-emerald-500" />
                    <span>ID Card Designer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isSoloTeamSize(eventDetails?.TeamSize)) {
                        navigate(`/admin/team-card-designer?eventId=${encodeURIComponent(eventId)}`);
                      }
                    }}
                    disabled={isSoloTeamSize(eventDetails?.TeamSize)}
                    title={
                      !isSoloTeamSize(eventDetails?.TeamSize)
                        ? 'Open Visual Team Card Designer'
                        : 'Team Card Designer is disabled because this is an Individual event'
                    }
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition ${
                      !isSoloTeamSize(eventDetails?.TeamSize)
                        ? 'border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/40 text-cyan-600 dark:text-cyan-300 cursor-pointer'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-850 text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Palette className={`h-4 w-4 ${!isSoloTeamSize(eventDetails?.TeamSize) ? 'text-cyan-500' : 'text-slate-400 dark:text-zinc-600'}`} />
                    <span>Team Card Designer</span>
                    {isSoloTeamSize(eventDetails?.TeamSize) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 font-normal">
                        Team Events Only
                      </span>
                    )}
                  </button>

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

          {/* TAB: HACKATHON THEMES & PROBLEM STATEMENTS */}
          {activeTab === 'themes-challenges' && (
            <motion.div
              key="tab-themes-challenges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Physical Hackathon Themes & Challenges</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Shown in Advance
                      </span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                      Themes are displayed beforehand on the public Event Details and participant Event Redirect pages.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingThemeId(null);
                      setThemeForm({ ThemeName: '', Description: '', DisplayOrder: themes.length + 1 });
                      setShowThemeModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Theme</span>
                  </button>

                  {physicalPSMode === 'organizer_provided' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStatementId(null);
                        setStatementForm({
                          ProblemCode: `PS-${String(organizerStatements.length + 1).padStart(2, '0')}`,
                          Title: '',
                          Description: '',
                          Theme: themes[0]?.ThemeName || '',
                          MaxTeams: 5
                        });
                        setShowStatementModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-bold text-xs shadow-xs transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Problem Statement</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Active Format Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  {physicalPSMode === 'participant_defined' ? (
                    <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20 flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Active Mode: Open Innovation (Participant-Submitted)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Active Mode: Organizer-Provided Challenges
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-zinc-400 hidden sm:inline">
                    {physicalPSMode === 'participant_defined'
                      ? 'Participants submit their own problem statements under themes'
                      : 'Participants select from organizer-defined challenge statements'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/admin/settings')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Configure Settings in Event Settings &rarr;</span>
                </button>
              </div>

              {/* ── THEMES SECTION ── */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Innovation Themes ({themes.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Published domains shown on the Event Details & Event Redirect pages
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingThemeId(null);
                      setThemeForm({ ThemeName: '', Description: '', DisplayOrder: themes.length + 1 });
                      setShowThemeModal(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Theme</span>
                  </button>
                </div>

                {themesLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                    <span>Loading themes...</span>
                  </div>
                ) : themes.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3">
                    <Lightbulb className="h-8 w-8 mx-auto text-slate-400" />
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      No innovation themes created yet. Themes will be shown beforehand to participants on the detailed event page and eventredirectpage.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingThemeId(null);
                        setThemeForm({ ThemeName: '', Description: '', DisplayOrder: 1 });
                        setShowThemeModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create First Theme</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme, idx) => {
                      const statementCount = organizerStatements.filter(
                        (s) => (s.Theme || '').trim().toLowerCase() === theme.ThemeName.trim().toLowerCase()
                      ).length;
                      const submissionCount = participantStatements.filter(
                        (p) => (p.ThemeName || '').trim().toLowerCase() === theme.ThemeName.trim().toLowerCase()
                      ).length;

                      const IconComponent = getThemeIcon(theme.ThemeName, theme.Description);
                      const hasImage = Boolean(theme.ImageUrl && theme.ImageUrl.trim());

                      return (
                        <div
                          key={theme.Id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-black space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition overflow-hidden"
                        >
                          <div className="space-y-2.5">
                            {hasImage && (
                              <div className="w-full h-24 rounded-xl overflow-hidden mb-2 border border-slate-200 dark:border-zinc-800 bg-zinc-900">
                                <img src={theme.ImageUrl} alt={theme.ThemeName} className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <span className="font-mono text-xs font-semibold text-slate-400 dark:text-zinc-500 tracking-wider">
                                  #{String(idx + 1).padStart(2, '0')}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingThemeId(theme.Id);
                                    setThemeForm({
                                      ThemeName: theme.ThemeName,
                                      Description: theme.Description || '',
                                      DisplayOrder: theme.DisplayOrder || 0,
                                      ImageUrl: theme.ImageUrl || ''
                                    });
                                    setShowThemeModal(true);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  title="Edit Theme"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTheme(theme.Id)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                  title="Delete Theme"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {theme.ThemeName}
                            </h4>

                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                              {theme.Description || 'No description provided.'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                            <span>Order #{theme.DisplayOrder || idx + 1}</span>
                            <span>
                              {physicalPSMode === 'organizer_provided'
                                ? `${statementCount} Challenges`
                                : `${submissionCount} Submissions`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── PROBLEM STATEMENTS / SUBMISSIONS VIEW (DYNAMIC) ── */}
              {physicalPSMode === 'organizer_provided' ? (
                /* ORGANIZER-PROVIDED PROBLEM STATEMENTS */
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          Organizer Problem Statements ({organizerStatements.length})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Predefined challenges available for teams to choose from
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={statementCategoryFilter}
                        onChange={(e) => setStatementCategoryFilter(e.target.value)}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All Domains</option>
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Both">Both (Hybrid)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingStatementId(null);
                          setStatementForm({
                            ProblemCode: `PS-${String(organizerStatements.length + 1).padStart(2, '0')}`,
                            Title: '',
                            Description: '',
                            Theme: themes[0]?.ThemeName || '',
                            Category: 'Software',
                            MaxTeams: 5
                          });
                          setShowStatementModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Statement</span>
                      </button>
                    </div>
                  </div>

                  {organizerStatements.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-slate-400" />
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        No problem statements added yet. Add challenges under your themes for physical teams.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {organizerStatements
                        .filter((ps) => {
                          if (statementCategoryFilter !== 'ALL' && (ps.Category || 'Software').toLowerCase() !== statementCategoryFilter.toLowerCase()) return false;
                          return true;
                        })
                        .map((ps) => {
                        const assignedSelections = statementSelections.filter(
                          (s) => Number(s.ProblemStatementId) === Number(ps.Id)
                        );
                        const isFull = assignedSelections.length >= (ps.MaxTeams || 5);

                        return (
                        <div
                          key={ps.Id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10">
                                {ps.ProblemCode}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                (ps.Category || '').toLowerCase() === 'hardware'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : (ps.Category || '').toLowerCase() === 'both'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              }`}>
                                {ps.Category || 'Software'}
                              </span>
                              {ps.Theme && (
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800">
                                  {ps.Theme}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                isFull
                                  ? 'bg-rose-500/10 text-rose-600'
                                  : 'bg-emerald-500/10 text-emerald-600'
                              }`}>
                                {assignedSelections.length} / {ps.MaxTeams || 5} Teams Selected
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStatementId(ps.Id);
                                  setStatementForm({
                                    ProblemCode: ps.ProblemCode,
                                    Title: ps.Title,
                                    Description: ps.Description || '',
                                    Theme: ps.Theme || '',
                                    Category: ps.Category || 'Software',
                                    MaxTeams: ps.MaxTeams || 5
                                  });
                                  setShowStatementModal(true);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStatement(ps.Id)}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {ps.Title}
                          </h4>

                          {ps.Description && (
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                              {ps.Description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              ) : (
                /* PARTICIPANT-SUBMITTED PROBLEM STATEMENTS */
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          Participant-Submitted Problem Statements ({participantStatements.length})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Custom innovation ideas and problem statements submitted by teams
                        </p>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={searchPSSubmissions}
                        onChange={(e) => setSearchPSSubmissions(e.target.value)}
                        placeholder="Search team or statement..."
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />

                      <select
                        value={participantThemeFilter}
                        onChange={(e) => setParticipantThemeFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All Themes</option>
                        {themes.map((t) => (
                          <option key={t.Id} value={t.ThemeName}>{t.ThemeName}</option>
                        ))}
                      </select>

                      <select
                        value={participantCategoryFilter}
                        onChange={(e) => setParticipantCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All Domains (Software & Hardware)</option>
                        <option value="Software">Software</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Both">Both (Hybrid)</option>
                      </select>

                      <select
                        value={participantStatusFilter}
                        onChange={(e) => setParticipantStatusFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Needs_Revision">Needs Revision</option>
                      </select>
                    </div>
                  </div>

                  {participantStatements.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                      <Target className="h-8 w-8 mx-auto text-slate-400" />
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        No teams have submitted their problem statements yet. Once participants submit from their event page, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {participantStatements
                        .filter((ps) => {
                          if (participantThemeFilter !== 'ALL' && (ps.ThemeName || '').toLowerCase() !== participantThemeFilter.toLowerCase()) return false;
                          if (participantCategoryFilter !== 'ALL' && (ps.Category || 'Software').toLowerCase() !== participantCategoryFilter.toLowerCase()) return false;
                          if (participantStatusFilter !== 'ALL' && (ps.Status || '').toLowerCase() !== participantStatusFilter.toLowerCase()) return false;
                          if (searchPSSubmissions) {
                            const query = searchPSSubmissions.toLowerCase();
                            const matchTitle = (ps.Title || '').toLowerCase().includes(query);
                            const matchTeam = (ps.TeamName || '').toLowerCase().includes(query);
                            const matchDesc = (ps.Description || '').toLowerCase().includes(query);
                            if (!matchTitle && !matchTeam && !matchDesc) return false;
                          }
                          return true;
                        })
                        .map((ps) => (
                          <div
                            key={ps.Id}
                            className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {ps.TeamName}
                                </span>
                                {ps.College && (
                                  <span className="text-xs text-slate-500 ml-2">({ps.College})</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                  {ps.ThemeName || 'General Innovation'}
                                </span>

                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  (ps.Category || '').toLowerCase() === 'hardware'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                    : (ps.Category || '').toLowerCase() === 'both'
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {ps.Category === 'Both' ? 'Hardware & Software' : (ps.Category || 'Software')}
                                </span>

                                <select
                                  value={ps.Status || 'Approved'}
                                  onChange={(e) => handleUpdateParticipantStatus(ps.Id, e.target.value)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border focus:outline-none cursor-pointer ${
                                    ps.Status === 'Needs_Revision'
                                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                  }`}
                                >
                                  <option value="Approved">Approved</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Needs_Revision">Needs Revision</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {ps.Title}
                              </h4>
                              {ps.Description && (
                                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                                  {ps.Description}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                              {ps.TechStack && (
                                <div className="flex items-center gap-1.5 font-medium">
                                  <Code className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Stack: {ps.TechStack}</span>
                                </div>
                              )}
                              <span>Lead: {ps.TeamLeadName || ps.TeamLeadEmail || 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* THEME FORM MODAL */}
          <AnimatePresence>
            {showThemeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-emerald-600" />
                      <span>{editingThemeId ? 'Edit Theme' : 'Create Hackathon Theme'}</span>
                    </h3>
                    <button
                      onClick={() => setShowThemeModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTheme} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Theme Name *
                      </label>
                      <input
                        type="text"
                        value={themeForm.ThemeName}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, ThemeName: e.target.value }))}
                        placeholder="e.g. Artificial Intelligence & Robotics"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={themeForm.DisplayOrder}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, DisplayOrder: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Theme Description
                      </label>
                      <textarea
                        rows={3}
                        value={themeForm.Description}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, Description: e.target.value }))}
                        placeholder="Scope, suggested problem domains, or challenge goals..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Theme Image / Photo URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={themeForm.ImageUrl || ''}
                        onChange={(e) => setThemeForm(prev => ({ ...prev, ImageUrl: e.target.value }))}
                        placeholder="https://images.unsplash.com/... or direct image link"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">If empty, a modern technical icon based on the theme name will be shown automatically.</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowThemeModal(false)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={themeSaving}
                        className="px-5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        {themeSaving ? 'Saving...' : 'Save Theme'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* PROBLEM STATEMENT FORM MODAL */}
          <AnimatePresence>
            {showStatementModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span>{editingStatementId ? 'Edit Problem Statement' : 'Add Problem Statement'}</span>
                    </h3>
                    <button
                      onClick={() => setShowStatementModal(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveStatement} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Problem Code *
                        </label>
                        <input
                          type="text"
                          value={statementForm.ProblemCode}
                          onChange={(e) => setStatementForm(prev => ({ ...prev, ProblemCode: e.target.value }))}
                          placeholder="e.g. HACK-01"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Domain Category *
                        </label>
                        <select
                          value={statementForm.Category || 'Software'}
                          onChange={(e) => setStatementForm(prev => ({ ...prev, Category: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="Software">Software</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Both">Both (Hybrid)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Innovation Theme
                        </label>
                        <select
                          value={statementForm.Theme}
                          onChange={(e) => setStatementForm(prev => ({ ...prev, Theme: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                        >
                          <option value="">General</option>
                          {themes.map((t) => (
                            <option key={t.Id} value={t.ThemeName}>{t.ThemeName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Problem Title *
                      </label>
                      <input
                        type="text"
                        value={statementForm.Title}
                        onChange={(e) => setStatementForm(prev => ({ ...prev, Title: e.target.value }))}
                        placeholder="e.g. Automated Soil Nutrient Prediction for Smart Farming"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Detailed Description & Scope
                      </label>
                      <textarea
                        rows={4}
                        value={statementForm.Description}
                        onChange={(e) => setStatementForm(prev => ({ ...prev, Description: e.target.value }))}
                        placeholder="Explain problem objectives, constraints, and target outcomes..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowStatementModal(false)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={statementSaving}
                        className="px-5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        {statementSaving ? 'Saving...' : 'Save Statement'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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