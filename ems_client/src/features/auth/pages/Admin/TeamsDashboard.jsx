import React, { useEffect, useState } from 'react';
import {
    Search,
    Bell,
    Users,
    Filter,
    Eye,
    Code,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function TeamsDashboard() {
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin'));
    const eventId = admin?.EventId;

    const [teams, setTeams] = useState([]);
    const [totalTeams, setTotalTeams] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (eventId) {
            fetchTeams();
        } else {
            setLoading(false);
            setError('No event assigned to this admin.');
        }
    }, [eventId]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(`http://localhost:3000/api/teams/event/${eventId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch teams');
            }

            const data = await response.json();
            const fetchedTeams = data.teams || [];
            setTeams(fetchedTeams);

            setTotalTeams(fetchedTeams.length);

            const members = fetchedTeams.reduce((total, team) => total + Number(team.MembersCount || 0), 0 );

            setTotalMembers(members);

        } catch (error) {
            console.error('TEAMS FETCH ERROR:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getTeamId = (team) => {
        return team.Id;
    };

    const getTeamName = (team) => {
        return team.TeamName ||'Unnamed Team';
    };

    const getTagline = (team) => {
        return team.Description || 'No description available';
    };

    const getLeaderName = (team) => {
        return team.LeaderName || 'Not available';
    };

    const getLeaderEmail = (team) => {
        return team.Email ||'Not available';
    };

    const getMemberCount = (team) => {
        return Number(team.MembersCount || 0
        );
    };

    const getRegisteredDate = (date) => {
        if (!date) {
            return 'Not available';
        }

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredTeams = teams.filter((team) => 
    (team.TeamName || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleTeamClick = (teamId) => {
        navigate(`/admin/teams/${teamId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading teams...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-5">
                <div className="bg-white dark:bg-gray-950 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center max-w-md w-full">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Unable to load teams
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={fetchTeams}
                        className="mt-5 px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors p-4 sm:p-6 md:p-8">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8">

                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Registered Teams
                    </h1>

                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage all registered teams, view details and track participation.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                        />
                    </div>

                    <button className="relative p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                        <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />

                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-700 dark:bg-emerald-500" />
                    </button>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">

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
                            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                        </div>

                    </div>

                    <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-3">
                        Registered teams
                    </p>

                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">

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

                </div>

            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6">

                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        All Registered Teams
                    </h2>

                    <div className="flex items-center gap-2 sm:gap-3">

                        <div className="relative flex-1 sm:flex-none">

                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search by team name or leader..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-60 pl-9 pr-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                            />

                        </div>

                        <button className="p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
                            <Filter className="w-4 h-4" />
                        </button>

                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-xs sm:text-sm min-w-[900px]">

                        <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">

                                <th className="px-4 py-3 sm:py-4 font-medium w-12">
                                    #
                                </th>

                                <th className="px-4 py-3 sm:py-4 font-medium">
                                    Team Details
                                </th>

                                <th className="px-4 py-3 sm:py-4 font-medium">
                                    Team Leader
                                </th>

                                <th className="px-4 py-3 sm:py-4 font-medium text-center">
                                    Members
                                </th>

                                <th className="px-4 py-3 sm:py-4 font-medium">
                                    Registered On
                                </th>

                                <th className="px-4 py-3 sm:py-4 font-medium text-center">
                                    Actions
                                </th>

                            </tr>
                        </thead>

                        <tbody>

                            {filteredTeams.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No teams found
                                    </td>
                                </tr>

                            ) : (

                                filteredTeams.map((team, index) => {

                                    const teamId = getTeamId(team);
                                    const teamName = getTeamName(team);

                                    return (
                                        <tr
                                            key={teamId || index}
                                            className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                                        >

                                            <td className="px-4 py-3 sm:py-4 text-gray-900 dark:text-white font-medium">
                                                {String(index + 1).padStart(2, '0')}
                                            </td>

                                            <td className="px-4 py-3 sm:py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 bg-emerald-700 dark:bg-emerald-500">

                                                        <Code className="w-4 h-4 sm:w-5 sm:h-5" />

                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                            {teamName}
                                                        </p>

                                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {getTagline(team)}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            <td className="px-4 py-3 sm:py-4">

                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {getLeaderName(team)}
                                                </p>

                                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                                    {getLeaderEmail(team)}
                                                </p>

                                            </td>

                                            <td className="px-4 py-3 sm:py-4 text-center text-gray-900 dark:text-white">
                                                {getMemberCount(team)}
                                            </td>

                                            <td className="px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-300">
                                                {getRegisteredDate(team)}
                                            </td>

                                            <td className="px-4 py-3 sm:py-4">

                                                <div className="flex items-center justify-center">

                                                    <button
                                                        onClick={() => handleTeamClick(teamId)}
                                                        className="p-1.5 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-emerald-500 hover:text-emerald-500 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="w-fit h-15 flex items-center m-auto justify-center gap-2 text-emerald-500 cursor-pointer hover:underline">

                    <p>View all registered teams</p>

                    <ArrowRight className="w-4 h-4" />

                </div>

            </div>

        </div>
    );
}

export default TeamsDashboard;