import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Copy,
    Calendar,
    Users,
    Lightbulb,
    Building,
    Mail,
    UserCheck,
    Layers,
    Check,
    BedDouble,
    Utensils,
    Download,
    Printer,
    IdCard,
    X,
    Eye,
    ExternalLink,
    Palette,
} from 'lucide-react';
import TeamCardCanvas from './TeamCardCanvas';
import ParticipantIdCanvas from './ParticipantIdCanvas';

function TeamDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [problemStatement, setProblemStatement] = useState(null);

    // Modals
    const [showTeamCardModal, setShowTeamCardModal] = useState(false);
    const [showProblemDetailsModal, setShowProblemDetailsModal] = useState(false);
    const [selectedMemberForId, setSelectedMemberForId] = useState(null);

    useEffect(() => {
        if (!id) {
            setError('Team ID is missing');
            setLoading(false);
            return;
        }

        const fetchTeam = async () => {
            try {
                setLoading(true);
                setError('');

                const res = await fetch(`${API_BASE_URL}/api/teams/${id}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch team details');
                }

                const data = await res.json();
                setTeam(data.team || null);

                if (data.team?.EventId) {
                    fetch(`${API_BASE_URL}/api/problem-statements/event/${data.team.EventId}/team/${id}/participant-statement`)
                        .then((r) => (r.ok ? r.json() : null))
                        .then((psData) => {
                            if (psData?.statement) {
                                setProblemStatement({
                                    title: psData.statement.Title,
                                    theme: psData.statement.ThemeName,
                                    description: psData.statement.Description,
                                    techStack: psData.statement.TechStack,
                                    type: 'Participant Submitted',
                                    status: psData.statement.Status
                                });
                            } else {
                                fetch(`${API_BASE_URL}/api/problem-statements/event/${data.team.EventId}/team/${id}`)
                                    .then((r) => (r.ok ? r.json() : null))
                                    .then((selData) => {
                                        if (selData?.selection) {
                                            setProblemStatement({
                                                code: selData.selection.ProblemCode,
                                                title: selData.selection.ProblemTitle,
                                                theme: selData.selection.Theme,
                                                description: selData.selection.Description,
                                                type: 'Organizer Provided'
                                            });
                                        }
                                    })
                                    .catch(() => {});
                            }
                        })
                        .catch(() => {});
                }
            } catch (err) {
                console.error('TEAM DETAILS ERROR:', err);
                setError(err.message || 'Error fetching team');
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [id]);

    const handleBack = () => {
        navigate('/admin/teams');
    };

    const handleCopy = async () => {
        if (!team?.Id) return;

        try {
            await navigator.clipboard.writeText(`TEAM-${team.Id}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Unable to copy Team ID:', err);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-black min-h-screen p-8 flex items-center justify-center">
                <p className="text-sm font-medium text-gray-500">
                    Loading team details...
                </p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="bg-gray-50 dark:bg-black min-h-screen p-8 flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-semibold text-red-500">
                    {error || 'Team not found'}
                </p>

                <button
                    onClick={handleBack}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                >
                    Back to Registered Teams
                </button>
            </div>
        );
    }

    const members = Array.isArray(team.members) ? team.members : [];

    const teamLead =
        members.find(m =>
            (m.Role || '').toLowerCase().replace(/\s/g, '') === 'teamlead' ||
            (m.Role || '').toLowerCase().includes('lead')
        ) || members[0];

    const participationMode = String(
        team.ParticipationMode || ''
    ).trim().toLowerCase();

    const isPhysicalEvent = [
        'physical',
        'both',
        'hybrid'
    ].includes(participationMode);

    const registeredDate = team.CreatedAt
        ? new Date(team.CreatedAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
          })
        : 'Registered';

    const getInitial = (name) =>
        name?.trim().charAt(0).toUpperCase() || '?';

    const accommodationStatus =
        team.AccommodationStatus ??
        team.Accommodation ??
        team.AccommodationRequired;

    const foodStatus =
        team.FoodStatus ??
        team.FoodPreference ??
        team.Food;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-gray-50 dark:bg-black min-h-screen transition-colors p-4 sm:p-6 md:p-8 font-sans"
        >
            <div className="mb-4 mt-2">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors font-medium cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Registered Teams
                </button>
            </div>

            {/* Header Banner */}
            <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
                <div className="p-4 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                                    {team.TeamName}
                                </h1>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {team.College
                                    ? `${team.College}, ${team.State || ''}`
                                    : 'Building solutions, creating impact.'}
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-black border border-transparent dark:border-zinc-800 px-2.5 py-1 rounded-md">
                                    Team ID: TEAM-{team.Id}
                                </span>

                                <button
                                    onClick={handleCopy}
                                    title="Copy Team ID"
                                    className="text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors cursor-pointer"
                                >
                                    {copied
                                        ? <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 border-t xl:border-t-0 border-gray-200 dark:border-zinc-800 pt-4 xl:pt-0">
                        {/* Quick Stats */}
                        <div className="flex items-center gap-3 pr-2 sm:pr-4 border-r border-gray-200 dark:border-zinc-800">
                            <div className="flex flex-col items-start gap-0.5">
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-[10px]">Registered</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    {registeredDate}
                                </span>
                            </div>

                            <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1" />

                            <div className="flex flex-col items-start gap-0.5">
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="text-[10px]">Members</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    {members.length || team.TeamSize || 0}
                                </span>
                            </div>
                        </div>

                        {/* Action 1: Download Team Card (Landscape Format) */}
                        <button
                            type="button"
                            onClick={() => setShowTeamCardModal(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer"
                            title="Generate and download official landscape Team Display Card"
                        >
                            <IdCard className="w-3.5 h-3.5" />
                            <span>Download Team Card</span>
                        </button>

                        {/* Action: Visual Designer for Team Card */}
                        <button
                            type="button"
                            onClick={() => navigate(team?.EventId ? `/admin/team-card-designer?eventId=${team.EventId}` : '/admin/team-card-designer')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 font-bold text-xs shadow-md transition cursor-pointer"
                            title="Open visual studio to design custom team card"
                        >
                            <Palette className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Design Card</span>
                        </button>

                        {/* Action 2: Download Member ID Passes (A6 Format) */}
                        <button
                            type="button"
                            onClick={() => setSelectedMemberForId(teamLead || members[0])}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition cursor-pointer"
                            title="Download standard A6 Member ID Passes"
                        >
                            <IdCard className="w-3.5 h-3.5" />
                            <span>Download ID Cards</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {/* Team Information Card */}
                <div className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm col-span-1">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Team Information
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Leader</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {teamLead?.UserName || 'Not assigned'}
                            </span>
                        </div>

                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Building className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">College / University</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {team.College || teamLead?.College || 'Not available'}
                            </span>
                        </div>

                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Contact Email</span>
                            <span className="font-medium text-gray-900 dark:text-white break-all">
                                {teamLead?.Email || 'Not available'}
                            </span>
                        </div>

                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Mode</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                                {team.ParticipationMode || 'General'}
                            </span>
                        </div>

                        {/* Physical event only: Accommodation and Food */}
                        {isPhysicalEvent && (
                            <>
                                <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                                    <BedDouble className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />

                                    <span className="text-gray-500 dark:text-gray-400">
                                        Accommodation
                                    </span>

                                    <span className="font-medium text-emerald-600 dark:text-emerald-400 break-words">
                                        {accommodationStatus || 'Not configured'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                                    <Utensils className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />

                                    <span className="text-gray-500 dark:text-gray-400">
                                        Food
                                    </span>

                                    <span className="font-medium text-emerald-600 dark:text-emerald-400 break-words">
                                        {foodStatus || 'Not configured'}
                                    </span>
                                </div>
                            </>
                        )}

                        {problemStatement && (
                            <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm pt-2">
                                <Lightbulb className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                                <span className="text-gray-500 dark:text-gray-400">Problem Statement</span>
                                <div className="space-y-1">
                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                                            ID: {problemStatement.code ??'Not available'}
                                        </span>
                                        <span>{problemStatement.title || 'Untitled problem statement'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowProblemDetailsModal(true)}
                                        className="text-xs text-slate-500 dark:text-zinc-400 block hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium cursor-pointer"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        )}


                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Size</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {team.TeamSize || members.length} Members
                            </span>
                        </div>
                    </div>
                </div>

                {/* Event Information */}
                <div className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">
                        Registered Event
                    </h2>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 mb-3 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-4 h-4" />
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                {team.EventName || 'Event'}
                            </h3>

                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                {team.Location
                                    ? `Location: ${team.Location}`
                                    : `Status: ${team.EventStatus || 'Active'}`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                            <span className="text-gray-400">Registration Status:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                                {team.RegistrationStatus || 'Approved'}
                            </span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-zinc-800">
                            <span className="text-gray-400">State:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {team.State || 'Not available'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Team Lead Card */}
                <div className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">
                        Team Lead
                    </h2>

                    {teamLead ? (
                        <>
                            <div className="flex items-start gap-3 sm:gap-4 mb-5">
                                {teamLead.Photo ? (
                                    <img
                                        src={teamLead.Photo}
                                        alt={teamLead.UserName}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border-2 border-emerald-500 shadow-md"
                                    />
                                ) : (
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-700 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                                        {getInitial(teamLead.UserName)}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                                            {teamLead.UserName}
                                        </h3>

                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 px-2 py-0.5 rounded-full font-medium">
                                            Leader
                                        </span>
                                    </div>

                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                                        {teamLead.Email}
                                    </p>

                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {teamLead.College || 'College not provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-black p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                                        Gender
                                    </p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        {teamLead.Gender || 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                                        Assigned Room
                                    </p>
                                    <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        {teamLead.RoomNumber ? `Room ${teamLead.RoomNumber}` : 'Not Allocated'}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-gray-400">
                            No lead assigned.
                        </p>
                    )}
                </div>

                {/* Team Members Table with Assigned Rooms & ID Pass buttons */}
                <div className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm col-span-1 lg:col-span-2 xl:col-span-3">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-5">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                Team Members ({members.length})
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                Member profiles, hostel room allocations, and individual ID passes.
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[700px]">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                                    <th className="pb-3 font-medium">Member</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">Gender</th>
                                    <th className="pb-3 font-medium">Assigned Room</th>
                                    <th className="pb-3 font-medium">College</th>
                                    <th className="pb-3 font-medium">Email</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-6 text-center text-xs text-gray-400">
                                            No members found
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member, i) => {
                                        const isLead = (member.Role || '')
                                            .toLowerCase()
                                            .includes('lead');

                                        return (
                                            <tr
                                                key={member.UserId ? `user-${member.UserId}` : member.TeamMemberId ? `tm-${member.TeamMemberId}` : `member-${i}`}
                                                className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                            >
                                                <td className="py-3 sm:py-4">
                                                    <div className="flex items-center gap-3">
                                                        {member.Photo ? (
                                                            <img
                                                                src={member.Photo}
                                                                alt={member.UserName}
                                                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-500/40"
                                                            />
                                                        ) : (
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                                isLead
                                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                                    : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                                                            }`}>
                                                                {getInitial(member.UserName)}
                                                            </div>
                                                        )}

                                                        <span className="font-semibold text-gray-900 dark:text-white">
                                                            {member.UserName}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3 sm:py-4">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                                                        isLead
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                                    }`}>
                                                        {isLead ? 'Team Lead' : 'Member'}
                                                    </span>
                                                </td>

                                                <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300">
                                                    {member.Gender || 'Male'}
                                                </td>

                                                {/* Assigned Room Details */}
                                                <td className="py-3 sm:py-4">
                                                    {member.RoomNumber ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                                                            <BedDouble className="w-3.5 h-3.5" />
                                                            <span>Room {member.RoomNumber}</span>
                                                            {member.BlockName && (
                                                                <span className="text-[10px] opacity-75">({member.BlockName})</span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            <span>Awaiting Room</span>
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 font-medium">
                                                    {member.College || 'N/A'}
                                                </td>

                                                <td className="py-3 sm:py-4 text-gray-500 dark:text-gray-400">
                                                    {member.Email || 'N/A'}
                                                </td>

                                                {/* Actions: View / Download Member ID Pass */}
                                                <td className="py-3 sm:py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMemberForId(member)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer"
                                                        title="Preview & download A6 ID card"
                                                    >
                                                        <IdCard className="w-3.5 h-3.5" />
                                                        <span>ID Pass</span>
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
            </div>

            <AnimatePresence>
                {showProblemDetailsModal && problemStatement && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5"
                        onClick={() => setShowProblemDetailsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="problem-statement-modal-title"
                            className="my-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-2xl dark:border-zinc-800 dark:bg-slate-950 dark:text-white"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-zinc-800">
                                <div className="min-w-0">
                                    <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <Lightbulb className="h-4 w-4 shrink-0" />
                                        <span className="text-xs font-semibold uppercase tracking-wide">
                                            Problem Statement
                                        </span>
                                    </div>
                                    <h2
                                        id="problem-statement-modal-title"
                                        className="text-lg font-bold text-gray-900 dark:text-white"
                                    >
                                        {problemStatement.title || 'Untitled problem statement'}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowProblemDetailsModal(false)}
                                    aria-label="Close problem statement details"
                                    className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="block whitespace-pre-wrap break-words text-xs text-slate-500 dark:text-zinc-400">
                                        Description: <strong className="font-medium text-slate-700 dark:text-zinc-300">
                                            {problemStatement.description || 'No description available.'}
                                        </strong>
                                    </span>
                                </div>

                                <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-zinc-800">
                                    {problemStatement.theme && (
                                        <span className="block text-xs text-slate-500 dark:text-zinc-400">
                                            Theme: <strong className="text-slate-700 dark:text-zinc-300">{problemStatement.theme}</strong>
                                            {problemStatement.type && ` (${problemStatement.type})`}
                                        </span>
                                    )}
                                    {problemStatement.techStack && (
                                        <span className="block whitespace-pre-wrap break-words text-xs text-slate-500 dark:text-zinc-400">
                                            Tech Stack: {problemStatement.techStack}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 1: TEAM CARD DOWNLOAD & PREVIEW (LANDSCAPE CYBER FORMAT) */}
            <AnimatePresence>
                {showTeamCardModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-5"
                        onClick={() => setShowTeamCardModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="my-auto w-full max-w-2xl rounded-3xl bg-slate-950 border border-cyan-500/30 p-5 text-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between border-b border-cyan-500/20 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <IdCard className="w-4 h-4 text-emerald-400" />
                                        <h2 className="text-base sm:text-lg font-extrabold text-white">
                                            Official Team Display Card
                                        </h2>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        High-resolution desk tent card for hackathon table placement & evaluations.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowTeamCardModal(false)}
                                    className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <TeamCardCanvas team={team} event={team} eventId={team?.EventId} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: MEMBER ID CARD PREVIEW & DOWNLOAD (STANDARD A6 SIZE) */}
            <AnimatePresence>
                {selectedMemberForId && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-5"
                        onClick={() => setSelectedMemberForId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="my-auto w-full max-w-lg rounded-3xl bg-slate-950 border border-zinc-800 p-5 text-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between border-b border-zinc-800/80 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <IdCard className="w-4 h-4" style={{ color: team.PrimaryColor || '#10B981' }} />
                                        <h2 className="text-base sm:text-lg font-extrabold text-white">
                                            Participant ID Pass
                                        </h2>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        Standard ISO 216 A6 Sheet (105 × 148 mm @ 300 DPI)
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedMemberForId(null)}
                                    className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Member Switcher Tabs */}
                            {members.length > 1 && (
                                <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                    {members.map((m, mIdx) => {
                                        const isCurrent = (m.UserId && m.UserId === selectedMemberForId.UserId) || m.UserName === selectedMemberForId.UserName;
                                        return (
                                            <button
                                                key={m.UserId ? `user-tab-${m.UserId}` : m.TeamMemberId ? `tm-tab-${m.TeamMemberId}` : m.UserName ? `name-tab-${m.UserName}` : `member-tab-${mIdx}`}
                                                type="button"
                                                onClick={() => setSelectedMemberForId(m)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                                    isCurrent
                                                        ? 'text-white shadow-md'
                                                        : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                }`}
                                                style={isCurrent ? { backgroundColor: team.PrimaryColor || '#10B981' } : {}}
                                            >
                                                {m.UserName}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="mx-auto w-full max-w-[340px]">
                                <ParticipantIdCanvas
                                    participant={{
                                        ...selectedMemberForId,
                                        TeamName: team.TeamName,
                                        College: selectedMemberForId.College || team.College,
                                    }}
                                    event={team}
                                    eventId={team.EventId}
                                    cardNumber={selectedMemberForId.IdCardNumber || `EV${team.EventId}-U${selectedMemberForId.UserId || '1'}`}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default TeamDetails;