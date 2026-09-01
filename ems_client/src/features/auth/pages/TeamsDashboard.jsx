import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Bell,
    Plus,
    Users,
    UserCheck,
    Calendar,
    Trophy,
    Filter,
    ChevronDown,
    MoreVertical,
    Eye,
    ChevronLeft,
    ChevronRight,
    Code,
    ArrowRight
} from 'lucide-react';

const stats = [
    { title: 'Total Teams', value: '156', subtitle: 'Total Teams', icon: Users, color: 'text-emerald-700 dark:text-emerald-500' },
    { title: 'Active Teams', value: '126', subtitle: '80.8% of total teams', icon: UserCheck, color: 'text-emerald-700 dark:text-emerald-500' },
    { title: 'Total Members', value: '842', subtitle: 'Across all teams', icon: Users, color: 'text-emerald-700 dark:text-emerald-500' },
    { title: 'Events Joined', value: '425', subtitle: 'Total event participations', icon: Calendar, color: 'text-emerald-700 dark:text-emerald-500' },
];

const teamsData = [
    { id: '01', name: 'Code Crafters', tagline: 'Building solutions, creating impact.', leader: 'Alice Johnson', email: 'alice@code.com', members: 5, events: 4, date: '25 May 2025', status: 'Active', icon: Code },
    { id: '02', name: 'Byte Builders', tagline: 'Code today, conquer tomorrow.', leader: 'Bob Smith', email: 'bob@byte.com', members: 4, events: 4, date: '24 May 2025', status: 'Active', initials: 'BB' },
    { id: '03', name: 'InnovateX', tagline: 'Innovate. Build. Elevate.', leader: 'Charlie Brown', email: 'charlie@innovatex.com', members: 6, events: 3, date: '23 May 2025', status: 'Active', initials: 'IX' },
    { id: '04', name: 'Design Squad', tagline: 'Designing the future, together.', leader: 'Diana Prince', email: 'diana@design.com', members: 4, events: 3, date: '22 May 2025', status: 'Inactive', initials: 'DS' },
    { id: '05', name: 'Dev Dynasty', tagline: 'Develop. Deploy. Dominate.', leader: 'Ethan Hunt', email: 'ethan@dev.com', members: 3, events: 2, date: '21 May 2025', status: 'Active', initials: 'DD' },
    { id: '06', name: 'Web Wizards', tagline: 'We code magic.', leader: 'Fiona Gallagher', email: 'fiona@web.com', members: 5, events: 3, date: '20 May 2025', status: 'Active', initials: 'WW' },
    { id: '07', name: 'Cyber Phantom', tagline: 'Securing the digital world.', leader: 'Grace Lee', email: 'grace@cyber.com', members: 4, events: 2, date: '19 May 2025', status: 'Active', initials: 'CP' },
    { id: '08', name: 'AI Avengers', tagline: 'Intelligence in action.', leader: 'Henry Stark', email: 'henry@ai.com', members: 3, events: 1, date: '18 May 2025', status: 'Inactive', initials: 'AI' },
];

function TeamsDashboard() {

    const navigate = useNavigate();
    const handleTeamClick = () => {
        navigate('/teamdetails');
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors p-4 sm:p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all teams, view details and track participation.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-700 dark:bg-emerald-500"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 shrink-0 w-fit">
                                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
                                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight mt-0.5">{stat.value}</p>
                                </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500">
                                {stat.subtitle}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
                <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">All Teams</h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by team name or leader..."
                                className="w-full sm:w-60 pl-9 pr-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-700 dark:focus:border-emerald-500"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
                            All Status
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button className="p-1.5 sm:p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm min-w-[900px]">
                        <thead>
                            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-4 py-3 sm:py-4 font-medium w-12">#</th>
                                <th className="px-4 py-3 sm:py-4 font-medium">Team Details</th>
                                <th className="px-4 py-3 sm:py-4 font-medium">Team Leader</th>
                                <th className="px-4 py-3 sm:py-4 font-medium text-center">Members</th>
                                <th className="px-4 py-3 sm:py-4 font-medium text-center">Events Joined</th>
                                <th className="px-4 py-3 sm:py-4 font-medium">Registered On</th>
                                <th className="px-4 py-3 sm:py-4 font-medium">Status</th>
                                <th className="px-4 py-3 sm:py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamsData.map((team, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-4 py-3 sm:py-4 text-gray-900 dark:text-white font-medium">{team.id}</td>
                                    <td className="px-4 py-3 sm:py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${team.icon ? 'bg-emerald-700 dark:bg-emerald-500' : 'bg-gray-700 dark:bg-gray-600'}`}>
                                                {team.icon ? <team.icon className="w-4 h-4 sm:w-5 sm:h-5" /> : team.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate">{team.name}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{team.tagline}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 sm:py-4">
                                        <p className="font-medium text-gray-900 dark:text-white">{team.leader}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{team.email}</p>
                                    </td>
                                    <td className="px-4 py-3 sm:py-4 text-center text-gray-900 dark:text-white">{team.members}</td>
                                    <td className="px-4 py-3 sm:py-4 text-center text-gray-900 dark:text-white">{team.events}</td>
                                    <td className="px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-300">{team.date}</td>
                                    <td className="px-4 py-3 sm:py-4">
                                        <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium ${team.status === 'Active'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500'
                                            }`}>
                                            {team.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:py-4">
                                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                                            <button className="p-1 sm:p-1.5 border-gray-200 dark:border-gray-800 border-1 rounded-lg hover:border-1 hover:border-emerald-500 hover:text-emerald-500 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
                                                onClick={handleTeamClick}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className=" w-32 h-15 flex items-center m-auto justify-center gap-2 text-emerald-500 cursor-pointer hover:underline">
                    <p>View all teams</p>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

export default TeamsDashboard;