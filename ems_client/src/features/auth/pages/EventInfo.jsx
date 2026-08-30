import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Pencil,
    LayoutGrid,
    Calendar,
    MapPin,
    Eye,
    Clock,
    CheckCircle2,
    Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const eventHighlights = [
    'Keynote sessions from industry leaders',
    'Technical workshops and hands-on sessions',
    'Innovative project exhibitions',
    'Exciting competitions and prizes',
    'Networking with experts and peers',
];

function EventInfo() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleBack = () => {
        navigate('/sidebar/events');
    };

    useEffect(() => {
        fetchEventById();
    }, [id]);

    const fetchEventById = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch(
                `http://localhost:3000/api/events/${id}`
            );
            const data = await res.json();
            console.log('Event API Response:', data);
            if (!res.ok) {
                throw new Error(
                    data.message || 'Failed to fetch event'
                );
            }
            setEvent(data.events[0]);
        } 
        catch (error) {
            console.error('Fetch event error:', error);
            setError(error.message);
            setEvent(null);
        } 
        finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-300">
                    Loading event...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center gap-4">
                <p className="text-red-500">
                    {error}
                </p>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center gap-4">
                <p className="text-gray-600 dark:text-gray-300">
                    Event not found
                </p>
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
                >
                    Back to Events
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
            <div className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span
                        onClick={handleBack}
                        className="hover:text-emerald-700 dark:hover:text-emerald-500 cursor-pointer"
                    >
                        Events
                    </span>
                    <span>›</span>
                    <span className="text-gray-900 dark:text-white">
                        Event Details
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                        <button
                            onClick={handleBack}
                            className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors shrink-0 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white">
                                {event.EventName}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {event.Description}
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto">
                        <button
                            onClick={() =>
                                navigate(`/sidebar/events/edit/${event.Id}`)
                            }
                            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                        >
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
                            <div
                                className="w-full h-40 sm:h-48 md:h-full md:min-h-[240px] rounded-xl flex items-center justify-center overflow-hidden dark:bg-white"
                            >
                                <Calendar className="w-14 h-14 text-white dark:text-black" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Event Type
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {event.EventType}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Hackathon Mode
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {event.HackathonMode}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Start Date
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            {event.StartDate}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            End Date
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            {event.EndDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                            Location
                                        </p>
                                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {event.Location}
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
                                            {event.CreatedAt}
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
                            {event.Description}
                        </p>
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mt-5 sm:mt-6 mb-3">
                            Event Highlights
                        </h3>
                        <div className="space-y-2 sm:space-y-2.5">
                            {eventHighlights.map((highlight, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 sm:gap-2.5"
                                >
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Registration Start
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {event.RegistrationStart}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Registration End
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {event.RegistrationEnd}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Primary Color
                                </p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700"
                                        style={{
                                            backgroundColor:
                                                event.PrimaryColor,
                                        }}
                                    />
                                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                        {event.PrimaryColor}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Secondary Color
                                </p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700"
                                        style={{
                                            backgroundColor:
                                                event.SecondaryColor,
                                        }}
                                    />
                                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                        {event.SecondaryColor}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Tertiary Color
                                </p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-700"
                                        style={{
                                            backgroundColor:
                                                event.TertiaryColor,
                                        }}
                                    />
                                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                        {event.TertiaryColor}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Event Summary
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Event ID
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    #{event.Id}
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Event Type
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    {event.EventType}
                                </p>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Hackathon Mode
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                    {event.HackathonMode}
                                </p>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Location
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-right max-w-[180px] truncate">
                                    {event.Location}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Event Schedule
                        </h2>
                        <div className="space-y-5">
                            <div className="flex gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        Registration Start
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                                        {event.RegistrationStart}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        Registration End
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                                        {event.RegistrationEnd}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        Event Start
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                                        {event.StartDate}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                                        Event End
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                                        {event.EndDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() =>
                                    navigate(`/sidebar/events/edit/${event.Id}`)
                                }
                                className="w-full flex items-center justify-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                Edit Event
                            </button>

                            <button
                                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                            >
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