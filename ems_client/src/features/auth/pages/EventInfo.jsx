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
    X,
    Save,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

function EventInfo() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        EventName: '',
        Description: '',
        StartDate: '',
        EndDate: '',
        RegistrationStart: '',
        RegistrationEnd: '',
        Location: '',
        EventType: '',
        HackathonMode: '',
        PrimaryColor: '',
        SecondaryColor: '',
        TertiaryColor: '',
    });

    const eventHighlights = [
        'Keynote sessions from industry leaders',
        'Technical workshops and hands-on sessions',
        'Innovative project exhibitions',
        'Exciting competitions and prizes',
        'Networking with experts and peers',
    ];

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
            if (!res.ok) {
                throw new Error(
                    data.message || 'Failed to fetch event'
                );
            }
            setEvent(data.events[0]);
            setFormData({
                EventName: data.events[0].EventName || '',
                Description: data.events[0].Description || '',
                StartDate: data.events[0].StartDate || '',
                EndDate: data.events[0].EndDate || '',
                RegistrationStart: data.events[0].RegistrationStart || '',
                RegistrationEnd: data.events[0].RegistrationEnd || '',
                Location: data.events[0].Location || '',
                EventType: data.events[0].EventType || '',
                HackathonMode: data.events[0].HackathonMode || '',
                PrimaryColor: data.events[0].PrimaryColor || '',
                SecondaryColor: data.events[0].SecondaryColor || '',
                TertiaryColor: data.events[0].TertiaryColor || '',
            });
        } catch (error) {
            console.error('Fetch event error:', error);
            setError(error.message);
            setEvent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await fetch(
                `http://localhost:3000/api/events/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data.message || 'Failed to update event'
                );
            }
            alert('Event updated successfully');
            setIsEditing(false);
            await fetchEventById();
        } catch (error) {
            console.error('Update event error:', error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async () => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this event?'
        );
        if (!confirmDelete) {
            return;
        }
        try {
            setDeleting(true);
            const res = await fetch(
                `http://localhost:3000/api/events/${id}`,
                {
                    method: 'DELETE',
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(
                    data.message || 'Failed to delete event'
                );
            }
            alert('Event deleted successfully');
            navigate('/sidebar/events');
        } catch (error) {
            console.error('Delete event error:', error);
            alert(error.message);
        } finally {
            setDeleting(false);
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
                            className="p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white">
                                {event.EventName}
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {event.Description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 border border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit Event
                    </button>
                </div>
            </div>

            {isEditing ? (
                <div className="p-4 sm:p-6 md:p-8">
                    <form
                        onSubmit={handleUpdateEvent}
                        className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Edit Event
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Update event information
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Name
                                </label>
                                <input
                                    type="text"
                                    name="EventName"
                                    value={formData.EventName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Type
                                </label>
                                <input
                                    type="text"
                                    name="EventType"
                                    value={formData.EventType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="Description"
                                    value={formData.Description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="StartDate"
                                    value={formData.StartDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="EndDate"
                                    value={formData.EndDate}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Registration Start
                                </label>
                                <input
                                    type="date"
                                    name="RegistrationStart"
                                    value={formData.RegistrationStart}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Registration End
                                </label>
                                <input
                                    type="date"
                                    name="RegistrationEnd"
                                    value={formData.RegistrationEnd}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="Location"
                                    value={formData.Location}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Hackathon Mode
                                </label>
                                <input
                                    type="text"
                                    name="HackathonMode"
                                    value={formData.HackathonMode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Primary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        name="PrimaryColor"
                                        value={formData.PrimaryColor}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        name="PrimaryColor"
                                        value={formData.PrimaryColor}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Secondary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        name="SecondaryColor"
                                        value={formData.SecondaryColor}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        name="SecondaryColor"
                                        value={formData.SecondaryColor}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tertiary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        name="TertiaryColor"
                                        value={formData.TertiaryColor}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        name="TertiaryColor"
                                        value={formData.TertiaryColor}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white"
                            >
                                <Save className="w-4 h-4" />
                                {saving
                                    ? 'Updating...'
                                    : 'Update Event'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="w-full min-h-[240px] rounded-xl bg-emerald-700 dark:bg-white flex items-center justify-center">
                                    <Calendar className="w-14 h-14 text-white dark:text-black" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                            <LayoutGrid className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Event Type
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.EventType || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                            <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Hackathon Mode
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.HackathonMode || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Start Date
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.StartDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                            <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                End Date
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.EndDate}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Location
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.Location || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                            <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Created On
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.CreatedAt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                About This Event
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {event.Description || '-'}
                            </p>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                Event Highlights
                            </h3>
                            <div className="space-y-2.5">
                                {eventHighlights.map((highlight, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2.5"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {highlight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Registration Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Registration Start
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {event.RegistrationStart || '-'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Registration End
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {event.RegistrationEnd || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Primary Color
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    event.PrimaryColor,
                                            }}
                                        />
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {event.PrimaryColor || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Secondary Color
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    event.SecondaryColor,
                                            }}
                                        />
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {event.SecondaryColor || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Tertiary Color
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    event.TertiaryColor,
                                            }}
                                        />
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {event.TertiaryColor || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Event Summary
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Event ID
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        #{event.Id}
                                    </p>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Event Type
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {event.EventType || '-'}
                                    </p>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Hackathon Mode
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {event.HackathonMode || '-'}
                                    </p>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Location
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                                        {event.Location || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Event Schedule
                            </h2>
                            <div className="space-y-5">
                                <div className="flex gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Registration Start
                                        </p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            {event.RegistrationStart || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Registration End
                                        </p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            {event.RegistrationEnd || '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Event Start
                                        </p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            {event.StartDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Event End
                                        </p>
                                        <p className="text-xs text-emerald-700 mt-1">
                                            {event.EndDate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Actions
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Event
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    disabled={deleting}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {deleting
                                        ? 'Deleting...'
                                        : 'Delete Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventInfo;