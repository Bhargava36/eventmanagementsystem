import React, { useEffect, useState, useRef } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Users, Filter, Eye, Code, Globe, MapPin, Layers, GraduationCap, User, Radio, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, FileSpreadsheet, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { getTrackVisibility, isSoloTeamSize, getEventTypeInfo } from '../../../../lib/utils';
import { downloadRegistrationsWorkbook } from '../../../../lib/excelExport';
function TeamsDashboard() {
    const navigate = useNavigate();
    const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
    const typeInfo = getEventTypeInfo(storedAdmin?.EventType);

    const [currentEventId, setCurrentEventId] = useState(storedAdmin?.EventId || storedAdmin?.eventId || null);
    const { isBoth, isVirtual, isPhysical } = getTrackVisibility(
        storedAdmin?.HackathonMode,
        storedAdmin?.Location,
        storedAdmin?.EventType
    );
    const [teams, setTeams] = useState([]);
    const [totalTeams, setTotalTeams] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isExporting, setIsExporting] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [eventDetails, setEventDetails] = useState(null);
    const exportDropdownRef = useRef(null);

    const fetchTeams = async (targetEventId = currentEventId) => {
        if (!targetEventId) return;
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`${API_BASE_URL}/api/teams/event/${targetEventId}`);
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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
                setExportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const init = async () => {
            let eid = currentEventId;
            if (!eid && (storedAdmin?.Id || storedAdmin?.id)) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/admin/${storedAdmin.Id || storedAdmin.id}`);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentEventId]);

    const isSolo = isSoloTeamSize(storedAdmin?.TeamSize) || typeInfo.isWorkshop || typeInfo.isSeminar || typeInfo.isWebinar || (teams.length > 0 && teams.every((t) => Number(t.MemberCount || t.MembersCount || t.TeamSize || 1) === 1));

    const handleExportExcel = async (exportMode = 'all') => {
        try {
            setIsExporting(true);
            setExportDropdownOpen(false);

            let exportData = null;
            if (currentEventId) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/teams/event/${currentEventId}/export-details`);
                    if (res.ok) {
                        exportData = await res.json();
                        if (exportData.event) {
                            setEventDetails(exportData.event);
                        }
                    }
                } catch (e) {
                    console.warn('Backend export-details fetch failed, using local teams data:', e);
                }
            }

            const activeEvent = exportData?.event || eventDetails || {
                Id: currentEventId,
                EventName: storedAdmin?.EventName || storedAdmin?.eventName || 'AVISHKAAR Event',
                EventType: storedAdmin?.EventType || 'Hackathon',
                HackathonMode: storedAdmin?.HackathonMode || 'Virtual & Physical',
                Location: storedAdmin?.Location || storedAdmin?.location || 'AVISHKAAR Hub Campus',
                StartDate: storedAdmin?.StartDate || storedAdmin?.startDate || '',
                EndDate: storedAdmin?.EndDate || storedAdmin?.endDate || '',
                TeamSize: storedAdmin?.TeamSize || '2 - 4'
            };

            const sourceTeams = (exportData?.teams && exportData.teams.length > 0) ? exportData.teams : teams;
            const sourceMembers = exportData?.members || [];

            let selectedTeams = sourceTeams;
            if (exportMode === 'current') {
                selectedTeams = filteredTeams;
            }

            // Guarantee every single team has its complete members list loaded
            const enrichedTeams = await Promise.all(selectedTeams.map(async (t) => {
                const teamId = t.Id || t.TeamId;
                if (Array.isArray(t.members) && t.members.length > 0) {
                    return t;
                }
                const fromSource = sourceMembers.filter(m => String(m.TeamId) === String(teamId));
                if (fromSource.length > 0) {
                    return { ...t, members: fromSource };
                }
                try {
                    const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`);
                    if (res.ok) {
                        const d = await res.json();
                        if (d.team && Array.isArray(d.team.members)) {
                            return { ...t, ...d.team, members: d.team.members };
                        }
                    }
                } catch (e) {
                    console.warn('Failed to fetch team members for team', teamId, e);
                }
                return t;
            }));

            const selectedTeamIds = new Set(enrichedTeams.map(t => String(t.Id || t.TeamId)));
            const activeMembers = sourceMembers.filter(m => selectedTeamIds.has(String(m.TeamId)));

            await downloadRegistrationsWorkbook({
                event: activeEvent,
                teams: enrichedTeams,
                members: activeMembers,
                summary: exportData?.summary || null,
                filterMode: exportMode === 'current' ? activeTab : exportMode
            });

            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 2500);
        } catch (err) {
            console.error('Export Excel failed:', err);
        } finally {
            setIsExporting(false);
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
    const totalPages = Math.max(1, Math.ceil(filteredTeams.length / itemsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const paginatedTeams = filteredTeams.slice(startIndex, startIndex + itemsPerPage);
    const handleTeamClick = (teamId) => {
        navigate(`/admin/teams/${teamId}`);
    };
    const tabs = typeInfo.isWebinar
        ? []
        : [
            {
                id: 'all',
                label: isSolo ? 'All Attendees' : 'All Teams',
                count: totalTeams,
                icon: Layers
            },
            ...(isBoth || isVirtual
                ? [
                    {
                        id: 'virtual',
                        label: typeInfo.isWorkshop ? 'Online Attendees' : 'Virtual Track',
                        count: virtualCount,
                        icon: Globe
                    }
                  ]
                : []),
            ...(isBoth || isPhysical
                ? [
                    {
                        id: 'physical',
                        label: typeInfo.isWorkshop ? 'In-Person Lab' : 'Physical Track',
                        count: physicalCount,
                        icon: MapPin
                    }
                  ]
                : [])
        ];

    if (typeInfo.isAlumni) {
        return <Navigate to="/admin/alumni/registrations" replace />;
    }

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
                        {typeInfo.isWebinar ? 'Registered Webinar Delegates' : isSolo ? 'Registered Attendees' : 'Registered Teams'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {typeInfo.isWebinar
                            ? 'Track, filter, and manage confirmed webinar delegates, digital pass credentials, and live stream access.'
                            : isSolo
                            ? `Track, filter and manage individual ${typeInfo.label.toLowerCase()} attendee registrations.`
                            : `Track, filter and manage virtual and physical ${typeInfo.label.toLowerCase()} registrations.`}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={typeInfo.isWebinar ? "Search delegate by name, email, pass ID, org..." : isSolo ? "Search attendee name, email, college..." : "Search teams or leaders..."}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500 shadow-sm"
                        />
                    </div>

                    {/* Export Excel Dropdown */}
                    <div className="relative" ref={exportDropdownRef}>
                        <button
                            type="button"
                            disabled={isExporting}
                            onClick={() => setExportDropdownOpen(prev => !prev)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 shadow-sm transition-all hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer disabled:opacity-60"
                            title="Download official registrations Excel spreadsheet"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                                    <span>Generating Sheet...</span>
                                </>
                            ) : exportSuccess ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Downloaded!</span>
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span>Export Excel</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {exportDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-xl p-2 z-50 text-xs"
                                >
                                    <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800/80 mb-1">
                                        <p className="font-bold text-gray-900 dark:text-white">Download Registration Sheets</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">Official styled .xlsx workbook with complete member details</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleExportExcel('all')}
                                        className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-start gap-3 transition cursor-pointer group"
                                    >
                                        <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
                                            <FileSpreadsheet className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-1.5">
                                                <span>Full Master Workbook</span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-semibold">All Tabs</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                Includes All Registrations, Virtual Track, Physical Track &amp; Event Summary sheets.
                                            </p>
                                        </div>
                                    </button>

                                    {(isBoth || isVirtual) && (
                                        <button
                                            type="button"
                                            onClick={() => handleExportExcel('virtual')}
                                            className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-start gap-3 transition cursor-pointer group"
                                        >
                                            <div className="p-2 rounded-lg bg-blue-100/70 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 mt-0.5 shrink-0">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                                    Virtual Track Only ({virtualCount})
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Only virtual teams &amp; confirmed online participants.
                                                </p>
                                            </div>
                                        </button>
                                    )}

                                    {(isBoth || isPhysical) && (
                                        <button
                                            type="button"
                                            onClick={() => handleExportExcel('physical')}
                                            className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-start gap-3 transition cursor-pointer group"
                                        >
                                            <div className="p-2 rounded-lg bg-amber-100/70 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">
                                                    Physical Track Only ({physicalCount})
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    On-campus teams with accommodation &amp; meal tracking.
                                                </p>
                                            </div>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleExportExcel('current')}
                                        className="w-full text-left p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800/60 flex items-start gap-3 transition cursor-pointer group border-t border-gray-100 dark:border-zinc-800/80 mt-1"
                                    >
                                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 mt-0.5 shrink-0">
                                            <Filter className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                                                Export Filtered View ({filteredTeams.length})
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                Exports currently visible {activeTab === 'all' ? 'all' : activeTab} registrations.
                                            </p>
                                        </div>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="button"
                        onClick={fetchTeams}
                        className="relative p-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors shadow-sm text-gray-600 dark:text-gray-300"
                        title="Refresh registration data"
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
            <div className={`grid grid-cols-2 ${isBoth ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-4 mb-6 sm:mb-8`}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {typeInfo.isWebinar ? 'Total Delegates' : isSolo ? 'Total Attendees' : 'Total Teams'}
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
                        {typeInfo.isWebinar ? 'Registered delegates' : 'All registrations'}
                    </p>
                </motion.div>
                {(isBoth || isVirtual) && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={{ y: -3 }}
                        className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {typeInfo.isWebinar ? 'Live Stream Access' : 'Virtual Track'}
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
                            {typeInfo.isWebinar ? 'Virtual stream delegates' : 'Online participants'}
                        </p>
                    </motion.div>
                )}
                {(isBoth || isPhysical) && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        whileHover={{ y: -3 }}
                        className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {typeInfo.isWorkshop ? 'In-Person Lab' : 'Physical Track'}
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
                )}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    whileHover={{ y: -3 }}
                    className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {typeInfo.isWebinar ? 'Confirmed Seats' : isSolo ? 'Total Registrations' : 'Total Members'}
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
                        {typeInfo.isWebinar ? 'Live stream passes issued' : isSolo ? 'Registered attendees' : 'Across all teams'}
                    </p>
                </motion.div>
            </div>
            <div className="relative pt-2">
                {tabs.length > 0 && (
                    <div className="flex items-end gap-2 px-4 sm:px-6 relative z-10 -mb-px sm: scrolling-touch overflow-x-auto sm:scrolling-smooth">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setCurrentPage(1);
                                    }}
                                    className="relative h-12 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer"
                                >
                                    {isActive ? (
                                        <motion.div
                                            layoutId="teamsActiveTabFolder"
                                            className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                        >
                                            {/* Seamless bottom mask: completely eliminates any hairline separation line */}
                                            <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                                        </motion.div>
                                    ) : (
                                        <div className="absolute inset-0 rounded-t-2xl bg-gray-100/80 dark:bg-black border border-gray-200 dark:border-zinc-800 z-0" />
                                    )}
                                    <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                                        isActive
                                            ? 'text-gray-950 dark:text-white font-bold'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}>
                                        <Icon
                                            className={`w-4 h-4 transition-colors ${
                                                isActive
                                                     ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-gray-400'
                                            }`}
                                        />
                                        <span>{tab.label}</span>
                                        <span
                                            className={`ml-1 px-2 py-0.5 rounded-lg text-[11px] font-bold transition-colors ${
                                                isActive
                                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                                    : 'bg-gray-200/80 text-gray-600 dark:bg-zinc-900 dark:text-gray-400'
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6 relative z-0">
                    <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                {activeTab === 'virtual'
                                    ? (typeInfo.isWebinar ? 'Live Stream Delegates' : typeInfo.isWorkshop ? 'Online Workshop Attendees' : 'Virtual Track Registrations')
                                    : activeTab === 'physical'
                                    ? (typeInfo.isWorkshop ? 'In-Person Lab Attendees' : 'Physical Track Registrations')
                                    : (typeInfo.isWebinar ? 'All Registered Delegates' : isSolo ? 'All Registered Attendees' : 'All Registered Teams')}
                            </h2>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({filteredTeams.length} {filteredTeams.length === 1 ? (typeInfo.isWebinar ? 'delegate' : isSolo ? 'attendee' : 'team') : (typeInfo.isWebinar ? 'delegates' : isSolo ? 'attendees' : 'teams')})
                            </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={typeInfo.isWebinar ? "Filter delegates..." : "Filter by name, lead, college..."}
                                    value={search}
                                    onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                                    className="w-full sm:w-60 pl-9 pr-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setCurrentPage(1);
                                }}
                                className="p-1.5 sm:p-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
                                title="Reset filter"
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                disabled={isExporting}
                                onClick={() => handleExportExcel(activeTab === 'all' ? 'all' : activeTab)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                                title={`Download ${activeTab === 'virtual' ? 'Virtual Track' : activeTab === 'physical' ? 'Physical Track' : 'All'} Excel Sheet`}
                            >
                                <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                <span className="hidden sm:inline">
                                    {activeTab === 'virtual' ? 'Export Virtual (.xlsx)' : activeTab === 'physical' ? 'Export Physical (.xlsx)' : 'Export Sheet (.xlsx)'}
                                </span>
                                <span className="sm:hidden">Export</span>
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[900px]">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black">
                                    <th className="px-4 py-3 sm:py-4 font-semibold w-12">
                                        #
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        {typeInfo.isWebinar ? 'Delegate Details' : isSolo ? 'Attendee Details' : 'Team Details'}
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        {typeInfo.isWebinar ? 'Pass Type' : 'Track'}
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold">
                                        {typeInfo.isWebinar ? 'Delegate Contact' : isSolo ? 'Contact Details' : 'Team Leader'}
                                    </th>
                                    <th className="px-4 py-3 sm:py-4 font-semibold text-center">
                                        {typeInfo.isWebinar ? 'Live Access' : isSolo ? 'Format' : 'Members'}
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
                                                    {isSolo ? 'No attendees found in this view' : 'No teams found in this view'}
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
                                    paginatedTeams.map((team, index) => {
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
                                                    {String(startIndex + index + 1).padStart(2, '0')}
                                                </td>
                                                <td className="px-4 py-3 sm:py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 bg-emerald-700 dark:bg-emerald-500">
                                                            {typeInfo.isWebinar ? <Radio className="w-4 h-4" /> : typeInfo.isWorkshop ? <GraduationCap className="w-4 h-4" /> : isSolo ? <User className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {isSolo && getLeaderName(team) !== 'Not available' ? getLeaderName(team) : teamName}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                                {getTagline(team)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 sm:py-4">
                                                    {typeInfo.isWebinar ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold  text-emerald-700 dark:text-emerald-400 ">
                                                            <Globe className="w-3.5 h-3.5" />
                                                            Delegate Pass
                                                        </span>
                                                    ) : isVirtual ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold  text-emerald-700 dark:text-emerald-400 ">
                                                            <Globe className="w-3.5 h-3.5" />
                                                            {typeInfo.isWorkshop ? 'Online' : 'Virtual'}
                                                        </span>
                                                    ) : isPhysical ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold  text-emerald-700 dark:text-emerald-400 ">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {typeInfo.isWorkshop ? 'In-Person Lab' : 'Physical'}
                                                        </span>
                                                    ) : isBoth ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold  text-emerald-700 dark:text-emerald-400 ">
                                                            <Layers className="w-3.5 h-3.5" />
                                                            {typeInfo.isWorkshop ? 'Hybrid' : 'Both Modes'}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold  text-gray-700  dark:text-gray-300">
                                                            General
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 sm:py-4">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {getLeaderEmail(team)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        {team.LeaderPhone || team.Phone || team.Mobile || (typeInfo.isWebinar ? 'Webinar Delegate' : isSolo ? 'Individual Attendee' : 'Team Leader')}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 sm:py-4 text-center text-gray-900 dark:text-white font-semibold">
                                                    {typeInfo.isWebinar ? (
                                                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                            Live Stream
                                                        </span>
                                                    ) : isSolo ? (
                                                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                            Solo
                                                        </span>
                                                    ) : (
                                                        getMemberCount(team)
                                                    )}
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
                                                            title={typeInfo.isWebinar ? "View delegate pass & profile" : "View details"}
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
                    {filteredTeams.length > 0 && (
                        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 dark:bg-black/60">
                            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <span>
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredTeams.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredTeams.length}</span> {typeInfo.isWebinar ? 'delegates' : isSolo ? 'attendees' : 'teams'}
                                </span>
                                <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-gray-200 dark:border-zinc-800 pl-3">
                                    <span className="text-xs text-gray-400">Per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={safeCurrentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="First page"
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Previous page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1 px-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                                        .reduce((acc, p, idx, arr) => {
                                            if (idx > 0 && p - arr[idx - 1] > 1) {
                                                acc.push({ type: 'ellipsis', key: `ellipsis-${p}` });
                                            }
                                            acc.push({ type: 'page', page: p, key: `page-${p}` });
                                            return acc;
                                        }, [])
                                        .map((item) =>
                                            item.type === 'ellipsis' ? (
                                                <span key={item.key} className="px-1.5 text-xs text-gray-400">...</span>
                                            ) : (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setCurrentPage(item.page)}
                                                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-colors ${
                                                        safeCurrentPage === item.page
                                                            ? 'bg-emerald-600 text-white shadow-sm'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900'
                                                    }`}
                                                >
                                                    {item.page}
                                                </button>
                                            )
                                        )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Next page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={safeCurrentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Last page"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
export default TeamsDashboard;
