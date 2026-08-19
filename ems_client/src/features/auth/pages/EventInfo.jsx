import React from 'react';
import {
    ArrowLeft,
    Pencil,
    MoreVertical,
    LayoutGrid,
    Calendar,
    MapPin,
    User,
    Eye,
    Clock,
    CheckCircle2,
    Users,
    UserCheck,
    BarChart3,
    Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const eventHighlights = [
    'Keynote sessions from industry leaders',
    'Technical workshops and hands-on sessions',
    'Innovative project exhibitions',
    'Exciting competitions and prizes',
    'Networking with experts and peers',
];

const eventSchedule = [
    {
        day: 'Day 1 - Aug 20, 2026',
        time: '10:00 AM - 06:00 PM',
        description: 'Inauguration, Keynote & Workshops',
    },
    {
        day: 'Day 2 - Aug 21, 2026',
        time: '09:30 AM - 06:00 PM',
        description: 'Technical Sessions & Competitions',
    },
    {
        day: 'Day 3 - Aug 22, 2026',
        time: '10:00 AM - 05:00 PM',
        description: 'Finals, Prize Distribution & Closing',
    },
];


function EventInfo() {

    const navigate = useNavigate();
    const handleClick = () => {
    navigate('/sidebar/events');
  };


    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
            <div className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="hover:text-emerald-700 dark:hover:text-emerald-500 cursor-pointer" onClick={handleClick}>
                        Events
                    </span>
                    <span>›</span>
                    <span className="text-gray-900 dark:text-white">Event Details</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <button className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors shrink-0 cursor-pointer" onClick={handleClick}>
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300"/>
                        </button>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white">
                                    Annual Tech Fest 2026
                                </h1>
                                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500">
                                    Upcoming
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                A grand celebration of innovation and technology.
                            </p>
                        </div>
                    </div>

                    <div className=" w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer">
                            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Edit Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="w-full h-40 sm:h-48 md:h-full md:min-h-[240px] rounded-xl bg-black dark:bg-white flex items-center justify-center overflow-hidden">
                                <img></img>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Category
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            Technology
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Event Status
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-500">
                                            Upcoming
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Date & Time
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            Aug 20 – Aug 22, 2026
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            10:00 AM onwards
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Event Type
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            Offline
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Venue
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            Main Auditorium
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Visibility
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            Public
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Organized By
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            Admin Team
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Created On
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            Jun 01, 2026
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            11:30 AM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            About This Event
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            Annual Tech Fest 2026 is our flagship event that brings together innovators,
                            developers, designers, and technology enthusiasts from across the country. Three
                            days of workshops, keynote sessions, competitions, and networking.
                        </p>

                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mt-5 sm:mt-6 mb-3">
                            Event Highlights
                        </h3>
                        <div className="space-y-2 sm:space-y-2.5">
                            {eventHighlights.map((highlight, i) => (
                                <div key={i} className="flex items-start gap-2 sm:gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        {highlight}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Registration Details
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                        Total Capacity
                                    </p>
                                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                        500
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 shrink-0">
                                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                        Registered
                                    </p>
                                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                        245
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-purple-100 dark:bg-purple-500/20 shrink-0">
                                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                        Available Seats
                                    </p>
                                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                        255
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Registration Period
                                </p>
                                <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                    Jun 10, 2026 09:00 AM
                                </p>
                                <p className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                    – Aug 19, 2026 11:59 PM
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Registration Fee
                                </p>
                                <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-500">
                                    ₹299
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Quick Info
                        </h2>

                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        Total Registrations
                                    </p>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        245 / 500
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Checked In</p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    0
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Days to Go</p>
                                <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-500">
                                    7 Days
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Reminder Emails
                                </p>
                                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                                    Enabled
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Event Schedule
                        </h2>

                        <div className="space-y-4 sm:space-y-5 relative">
                            {eventSchedule.map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-700 dark:bg-emerald-500 mt-1"></div>
                                        {i !== eventSchedule.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 mt-1"></div>
                                        )}
                                    </div>
                                    <div className="pb-2 min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.day}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                                            {item.time}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Actions
                        </h2>

                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer">
                                <Users className="w-4 h-4" />
                                View Registrations
                            </button>

                            <button className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                                Cancel Event
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventInfo;
