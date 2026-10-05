import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Code,
    Copy,
    Calendar,
    Users,
    Lightbulb,
    Building,
    Mail,
    Phone,
    Link as LinkIcon,
    FileText,
    UserCheck,
    Layers,
    Globe,
    MapPin,
    Check
} from 'lucide-react';

function TeamDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchTeam = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`http://localhost:3000/api/teams/${id}`);
                if (!res.ok) throw new Error('Failed to fetch team details');
                const data = await res.json();
                setTeam(data.team || null);
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

    const handleCopy = () => {
        if (!team?.Id) return;
        navigator.clipboard.writeText(`TEAM-${team.Id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-black min-h-screen p-8 flex items-center justify-center">
                <p className="text-sm font-medium text-gray-500">Loading team details...</p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="bg-gray-50 dark:bg-black min-h-screen p-8 flex flex-col items-center justify-center gap-4">
                <p className="text-sm font-semibold text-red-500">{error || 'Team not found'}</p>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
                >
                    Back to Registered Teams
                </button>
            </div>
        );
    }

    const members = team.members || [];
    const teamLead = members.find(m => (m.Role || '').toLowerCase().replace(/\s/g, '') === 'teamlead' || (m.Role || '').toLowerCase().includes('lead')) || members[0];
    const registeredDate = team.CreatedAt
        ? new Date(team.CreatedAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
          })
        : 'Registered';

    const getInitial = (name) => name?.trim().charAt(0).toUpperCase() || '?';

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-gray-50 dark:bg-black min-h-screen transition-colors p-4 sm:p-6 md:p-8 font-sans"
        >
            <div className="mb-4 mt-2">
                <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors font-medium cursor-pointer">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Registered Teams
                </button>
            </div>

            {/* Header Banner */}
            <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
                <div className="p-4 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                            <Code className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                                    {team.TeamName}
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {team.College ? `${team.College}, ${team.State || ''}` : 'Building solutions, creating impact.'}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-md">
                                    Team ID: TEAM-{team.Id}
                                </span>
                                <button
                                    onClick={handleCopy}
                                    title="Copy Team ID"
                                    className="text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 xl:gap-8 border-t xl:border-t-0 border-gray-200 dark:border-gray-800 pt-4 xl:pt-0">
                        <div className="flex flex-col items-center xl:items-start gap-1">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs">Registered On</span>
                            </div>
                            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                                {registeredDate}
                            </span>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                        <div className="flex flex-col items-center xl:items-start gap-1">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs">Members</span>
                            </div>
                            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                                {members.length || team.TeamSize || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {/* Team Information Card */}
                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Team Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Name</span>
                            <span className="font-medium text-gray-900 dark:text-white break-words">{team.TeamName}</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Leader</span>
                            <span className="font-medium text-gray-900 dark:text-white">{teamLead?.UserName || "Not assigned"}</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Building className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">College / University</span>
                            <span className="font-medium text-gray-900 dark:text-white">{team.College || teamLead?.College || "Not available"}</span>
                        </div>
                        
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Contact Email</span>
                            <span className="font-medium text-gray-900 dark:text-white break-all">{teamLead?.Email || "Not available"}</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Mode</span>
                            <span className="font-medium text-gray-900 dark:text-white capitalize">{team.ParticipationMode || "General"}</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Size</span>
                            <span className="font-medium text-gray-900 dark:text-white">{team.TeamSize || members.length} Members</span>
                        </div>
                    </div>
                </div>

                {/* Event Information */}
                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Registered Event</h2>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg p-4 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 mb-3 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                {team.EventName || "Event"}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                {team.Location ? `Location: ${team.Location}` : `Status: ${team.EventStatus || 'Active'}`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-1">
                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-400">Registration Status:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{team.RegistrationStatus || "Approved"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-400">State:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{team.State || "Not available"}</span>
                        </div>
                    </div>
                </div>

                {/* Team Lead Card */}
                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Team Lead</h2>

                    {teamLead ? (
                        <>
                            <div className="flex items-start gap-3 sm:gap-4 mb-5">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-700 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                                    {getInitial(teamLead.UserName)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">
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
                                        {teamLead.College || "College not provided"}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Gender</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{teamLead.Gender || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">State</p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{teamLead.State || "N/A"}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-gray-400">No lead assigned.</p>
                    )}
                </div>

                {/* Team Members Table */}
                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2 xl:col-span-3">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Team Members ({members.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[600px]">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                                    <th className="pb-3 font-medium">Member</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">College</th>
                                    <th className="pb-3 font-medium">Email</th>
                                    <th className="pb-3 font-medium">State</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-xs text-gray-400">
                                            No members found
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member, i) => {
                                        const isLead = (member.Role || '').toLowerCase().includes('lead');
                                        return (
                                            <tr key={member.UserId || i} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                                <td className="py-3 sm:py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isLead ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                                                            {getInitial(member.UserName)}
                                                        </div>
                                                        <span className="font-semibold text-gray-900 dark:text-white">{member.UserName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 sm:py-4">
                                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${isLead ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                                                        {isLead ? 'Team Lead' : 'Member'}
                                                    </span>
                                                </td>
                                                <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 font-medium">{member.College || 'N/A'}</td>
                                                <td className="py-3 sm:py-4 text-gray-500 dark:text-gray-400">{member.Email}</td>
                                                <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300">{member.State || 'N/A'}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </motion.div>
    );
}

export default TeamDetails;