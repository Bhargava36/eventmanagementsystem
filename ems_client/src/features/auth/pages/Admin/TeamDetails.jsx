import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Bell,
    Code,
    Copy,
    Calendar,
    Users,
    Edit,
    Lightbulb,
    Building,
    Briefcase,
    Mail,
    Phone,
    Link as LinkIcon,
    FileText,
    UserCheck,
    Eye,
    Trash2
} from 'lucide-react';

const teamMembers = [
    { initials: 'AJ', name: 'Alice Johnson', role: 'Team Lead', batch: '3rd Year', email: 'alice@codecrafters.com', contact: '+91 98765 43210', roleColor: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-500', avatarColor: 'bg-blue-600 text-white' },
    { initials: 'BS', name: 'Bob Smith', role: 'Developer', batch: '3rd Year', email: 'bob@codecrafters.com', contact: '+91 98765 43211', roleColor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-500', avatarColor: 'bg-blue-600 text-white' },
    { initials: 'CD', name: 'Charlie Davis', role: 'UI/UX Designer', batch: '3rd Year', email: 'charlie@codecrafters.com', contact: '+91 98765 43212', roleColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500', avatarColor: 'bg-emerald-600 text-white' },
    { initials: 'DS', name: 'Diana Sharma', role: 'Backend Developer', batch: '3rd Year', email: 'diana@codecrafters.com', contact: '+91 98765 43213', roleColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500', avatarColor: 'bg-yellow-500 text-white' },
];

function TeamDetails() {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate('/admin/teams');
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors p-4 sm:p-6 md:p-8">
            <div className="mb-4 mt-2">
                <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors font-medium cursor-pointer ">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Teams
                </button>
            </div>

            <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-6">
                <div className="p-4 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-emerald-700 dark:bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg">
                            <Code className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Code Crafters</h1>
                                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Active
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Building solutions, creating impact.</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-md">Team ID: TEAM-2025-001</span>
                                <button className="text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors">
                                    <Copy className="w-3.5 h-3.5" />
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
                            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">25 May 2025</span>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                        <div className="flex flex-col items-center xl:items-start gap-1">
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-[10px] sm:text-xs">Events Joined</span>
                            </div>
                            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">4</span>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                        <div className="flex flex-col items-center xl:items-start gap-1">
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</span>
                            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Team Information</h2>
                        <button className="flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 border border-gray-200 dark:border-gray-800 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <Edit className="w-3 h-3" />
                            Edit
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Name</span>
                            <span className="font-medium text-gray-900 dark:text-white">Code Crafters</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Leader</span>
                            <span className="font-medium text-gray-900 dark:text-white">Alice Johnson</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Building className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">College / University</span>
                            <span className="font-medium text-gray-900 dark:text-white">Aditya Institue of Technology and Management</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Briefcase className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Department</span>
                            <span className="font-medium text-gray-900 dark:text-white">Information Technology</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Contact Email</span>
                            <span className="font-medium text-gray-900 dark:text-white break-all">codecrafters@adityatekkali.edu.in</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Contact Number</span>
                            <span className="font-medium text-gray-900 dark:text-white">+91 98765 43210</span>
                        </div>
                        <div className="grid grid-cols-[30px_minmax(100px,1fr)_2fr] items-start text-xs sm:text-sm">
                            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-500 mt-0.5" />
                            <span className="text-gray-500 dark:text-gray-400">Team Size</span>
                            <span className="font-medium text-gray-900 dark:text-white">4 Members</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Problem Statement</h2>

                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-lg p-4 mb-5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 mb-3 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Smart Event Navigator</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                Develop a web/mobile application that helps participants discover relevant events, build personalized schedules, and receive real-time updates and navigation assistance within the event venue.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Team Lead</h2>

                    <div className="flex items-start gap-3 sm:gap-4 mb-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-700 dark:bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                            AJ
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Alice Johnson</h3>
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 px-2 py-0.5 rounded-full font-medium">Team Lead</span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate mb-1">alice@codecrafters.com</p>
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                                <Phone className="w-3 h-3" />
                                +91 98765 43210
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Year / Batch</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">3rd Year</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Roll Number</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">24A51A1200</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Responsibilities</p>
                        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 ml-4 list-disc marker:text-emerald-500">
                            <li>Team coordination and management</li>
                            <li>Project planning and milestone tracking</li>
                            <li>Communication with organizers</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2 xl:col-span-2">
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Team Members</h2>
                        <button className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-500 hover:underline font-medium bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors">
                            <Users className="w-3.5 h-3.5" />
                            View All Members
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[700px]">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                                    <th className="pb-3 font-medium">Member</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">Year / Batch</th>
                                    <th className="pb-3 font-medium">Email</th>
                                    <th className="pb-3 font-medium">Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.map((member, i) => (
                                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="py-3 sm:py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.avatarColor}`}>
                                                    {member.initials}
                                                </div>
                                                <span className="font-semibold text-gray-900 dark:text-white">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 sm:py-4">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${member.roleColor}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 font-medium">{member.batch}</td>
                                        <td className="py-3 sm:py-4 text-gray-500 dark:text-gray-400">{member.email}</td>
                                        <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300">{member.contact}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm col-span-1 lg:col-span-2 xl:col-span-1">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-4 sm:mb-5">Additional Information</h2>

                    <div className="space-y-4 sm:space-y-5">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Team Motto</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Code today, change tomorrow.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                                <Code className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Technologies</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">React, Node.js, MongoDB, Tailwind CSS</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                                <LinkIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 w-full">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">GitHub Repository</p>
                                <a href="#" className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-500 hover:underline truncate block w-full flex items-center gap-1">
                                    github.com/codecrafters/smart-event-navigator
                                    <Eye className="w-3 h-3 shrink-0" />
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                                <LinkIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 w-full">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Presentation Link</p>
                                <a href="#" className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-500 hover:underline truncate block w-full flex items-center gap-1">
                                    drive.google.com/.../codecrafters-ppt
                                    <Eye className="w-3 h-3 shrink-0" />
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Notes</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">No additional notes.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Permanently delete this team and all of its data.
                        </p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto shrink-0">
                        <Trash2 className="w-4 h-4" />
                        Delete Team
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TeamDetails;