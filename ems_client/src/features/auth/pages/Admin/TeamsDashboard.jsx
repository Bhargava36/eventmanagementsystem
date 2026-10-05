import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Bell,
    Users,
    Filter,
    Eye,
    Code,
    ArrowRight,
    Globe,
    MapPin,
    Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TeamsDashboard() {
    const navigate = useNavigate();
    const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
    const [currentEventId, setCurrentEventId] = useState(storedAdmin?.EventId || storedAdmin?.eventId || null);

    const [teams, setTeams] = useState([]);
    const [totalTeams, setTotalTeams] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const init = async () => {
            let eid = currentEventId;
            if (!eid && (storedAdmin?.Id || storedAdmin?.id)) {
                try {
                    const res = await fetch(`http://localhost:3000/api/admin/${storedAdmin.Id || storedAdmin.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        const adminData = data.events?.[0] || data.admin;
                        if (adminData?.EventId) {
                            eid = adminData.EventId;
                            setCurrentEventId(eid);
                            localStorage.setItem('admin', JSON.stringify({ ...storedAdmin, ...adminData }));
                        }
                    }
                } catch (e) {
                    console.error('Failed to resolve admin event:', e);
                }
            }

            if (eid) {
                fetchTeams(eid);
            } else {
                setLoading(false);
                setError('No event assigned to this admin.');
            }
        };

        init();
    }, [currentEventId]);

    const fetchTeams = async (targetEventId = currentEventId) => {
        if (!targetEventId) return;
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`http://localhost:3000/api/teams/event/${targetEventId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch teams');
            }

            const data = await response.json();
            const fetchedTeams = Array.isArray(data) ? data : (data.teams || []);
            setTeams(fetchedTeams);
            setTotalTeams(fetchedTeams.length);

            const members = fetchedTeams.reduce(
                (total, team) => total + Number(team.MemberCount || team.MembersCount || team.TeamSize || 0),
                0
            );
            setTotalMembers(members);
        } catch (err) {
            console.error('TEAMS FETCH ERROR:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getTeamId = (team) => team.Id;
    const getTeamName = (team) => team.TeamName || 'Unnamed Team';
    const getTagline = (team) => team.Description || team.College || 'No description available';
    const getLeaderName = (team) => team.LeaderName || 'Not available';
    const getLeaderEmail = (team) => team.LeaderEmail || team.Email || 'Not available';
    const getMemberCount = (team) => Number(team.MemberCount || team.MembersCount || team.TeamSize || 0);

    const getRegisteredDate = (team) => {
        const date = team.CreatedAt || team.Created_At;
        if (!date) return 'Registered';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getMode = (team) => (team.ParticipationMode || '').toLowerCase();

    const virtualCount = teams.filter((t) => {
        const m = getMode(t);
        return m === 'virtual' || m === 'both' || m === 'hybrid' || m.includes('virtual');
    }).length;

    const physicalCount = teams.filter((t) => {
        const m = getMode(t);
        return m === 'physical' || m === 'both' || m === 'hybrid' || m.includes('physical');
    }).length;

    const filteredTeams = teams.filter((team) => {
        const matchesSearch =
            (team.TeamName || '').toLowerCase().includes(search.toLowerCase()) ||
            (team.LeaderName || '').toLowerCase().includes(search.toLowerCase()) ||
            (team.College || '').toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        const m = getMode(team);
        if (activeTab === 'virtual') {
            return m === 'virtual' || m === 'both' || m === 'hybrid' || m.includes('virtual');
        }
        if (activeTab === 'physical') {
            return m === 'physical' || m === 'both' || m === 'hybrid' || m.includes('physical');
        }
        return true;
    });

    const handleTeamClick = (teamId) => {
        navigate(`/admin/teams/${teamId}`);
    };

    const tabs = [
        {
            id: 'all',
            label: 'All Teams',
            count: totalTeams,
            icon: Layers
        },
        {
            id: 'virtual',
            label: 'Virtual Track',
            count: virtualCount,
            icon: Globe
        },
        {
            id: 'physical',
            label: 'Physical Track',
            count: physicalCount,
            icon: MapPin
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-gray-50 dark:bg-black min-h-screen transition-colors p-4 sm:p-6 md:p-8"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Registered Teams
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Track, filter and manage virtual and physical hackathon registrations.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search teams or leaders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 shadow-sm"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={fetchTeams}
                        className="relative p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors shadow-sm text-gray-600 dark:text-gray-300"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Total Teams
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {totalTeams}
                            </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                            <Layers className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-3 font-medium">
                        All registrations
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Virtual Track
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                {virtualCount}
                            </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Online participants
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Physical Track
                            </p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {physicalCount}
                            </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                            <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        On-campus participants
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Total Members
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {totalMembers}
                            </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-3">
                        Across all teams
                    </p>
                </motion.div>
            </div>

            <div className="relative pt-2">
                <div className="flex items-end gap-1 px-4 sm:px-6 relative z-10 select-none overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative inline-flex items-center gap-2.5 px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-white dark:bg-gray-950 text-gray-950 dark:text-white rounded-t-2xl border-t border-l border-r border-gray-200 dark:border-gray-800 z-20 -mb-[1px]'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-gray-900/40 rounded-t-xl mb-0'
                                }`}
                            >
                                <Icon
                                    className={`w-4 h-4 transition-colors ${
                                        isActive
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                    }`}
                                />
                                <span>{tab.label}</span>

                                <span
                                    className={`ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                                        isActive
                                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-200/70 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {tab.count}
                                </span>

                                {isActive && (
                                    <>
                                        <svg
                                            className="absolute -bottom-[1px] -left-4 w-4 h-4 pointer-events-none fill-white dark:fill-gray-950 text-gray-200 dark:text-gray-800"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M16 0 A 16 16 0 0 0 0 16 L 16 16 Z" />
                                            <path
                                                d="M16 0 A 16 16 0 0 0 0 16"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1"
                                            />
                                        </svg>

                                        <svg
                                            className="absolute -bottom-[1px] -right-4 w-4 h-4 pointer-events-none fill-white dark:fill-gray-950 text-gray-200 dark:text-gray-800"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M0 0 A 16 16 0 0 1 16 16 L 0 16 Z" />
                                            <path
                                                d="M0 0 A 16 16 0 0 1 16 16"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1"
                                            />
                                        </svg>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6 relative z-0">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {activeTab === 'virtual'
                                    ? 'Virtual Track Registrations'
                                    : activeTab === 'physical'
                                    ? 'Physical Track Registrations'
                                    : 'All Registered Teams'}
                            </h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'})
                            </span>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Filter by name, lead, college..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-60 pl-9 pr-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                                title="Reset filter"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[900px]">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                    <th className="px-4 py-3 sm:py-4 font-semibold w-12">
                                        #
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        Team Details
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        Track
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        Team Leader
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold text-center">
                                        Members
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        Registered On
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold text-center">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    [1, 2, 3, 4].map((i) => (
                                        <motion.tr
                                            key={i}
                                            animate={{ opacity: [0.35, 0.8, 0.35] }}
                                            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                                            className="border-b border-gray-100 dark:border-gray-800/50"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="h-4 w-6 bg-gray-200 dark:bg-gray-800 rounded" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                                <div className="h-3 w-24 bg-gray-100 dark:bg-gray-900 rounded" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : filteredTeams.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-4 py-16 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-2" />
                                                <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                                                    No teams found in this view
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {search
                                                        ? 'Try modifying your search query'
                                                        : `No ${activeTab === 'all' ? '' : activeTab} registrations yet`}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeams.map((team, index) => {
                                        const teamId = getTeamId(team);
                                        const teamName = getTeamName(team);
                                        const mode = getMode(team);
                                        const isVirtual = mode === 'virtual';
                                        const isPhysical = mode === 'physical';
                                        const isBoth = mode === 'both' || mode === 'hybrid' || mode.includes('virtual and physical');

                                        return (
                                            <motion.tr
                                                key={teamId || index}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.35) }}
                                                className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                            >
                                                <td className="px-4 py-3 sm:py-4 text-gray-900 dark:text-white font-medium">
                                                    {String(index + 1).padStart(2, '0')}
                                                </td>

                                                <td className="px-4 py-3 sm:py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 bg-emerald-700 dark:bg-emerald-500">
                                                            <Code className="w-4 h-4" />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {teamName}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                                {getTagline(team)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 sm:py-4">
                                                    {isVirtual ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                            <Globe className="w-3.5 h-3.5" />
                                                            Virtual
                                                        </span>
                                                    ) : isPhysical ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            Physical
                                                        </span>
                                                    ) : isBoth ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                                            <Layers className="w-3.5 h-3.5" />
                                                            Both Modes
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                            General
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 sm:py-4">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {getLeaderName(team)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        {getLeaderEmail(team)}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-semibold">
                                                    {getMemberCount(team)}
                                                </td>

                                                <td className="px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-300 text-xs">
                                                    {getRegisteredDate(team)}
                                                </td>

                                                <td className="px-4 py-3 sm:py-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTeamClick(teamId)}
                                                            className="p-1.5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-emerald-500 hover:text-emerald-500 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        onClick={() => {
                            setActiveTab('all');
                            setSearch('');
                        }}
                        className="w-fit py-4 flex items-center m-auto justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline"
                    >
                        <span>View all registered teams</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default TeamsDashboard;