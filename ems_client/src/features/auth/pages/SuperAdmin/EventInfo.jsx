import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../../../../components/Organisms/Footer';

import {
    ArrowLeft,
    Pencil,
    Plus,
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
import useToast from '../../../../Hooks/useToast';

function EventInfo() {
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [showAdminForm, setShowAdminForm] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [adminLoading, setAdminLoading] = useState(true);
    const [adminSaving, setAdminSaving] = useState(false);

    const [adminForm, setAdminForm] = useState({
        AdminName: '',
        Email: '',
        Password: '',
        Mobile: ''
    });

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        EventName: '',
        Description: '',
        Facilities: '',
        Requirements: '',
        TeamSize: '',
        StartDate: '',
        EndDate: '',
        RegistrationStart: '',
        RegistrationEnd: '',
        Location: '',
        EventType: '',
        EventStatus: '',
        HackathonMode: '',
        PrimaryColor: '',
        SecondaryColor: '',
        TertiaryColor: '',
        PrimaryTextColor: '',
        SecondaryTextColor: '',
        TertiaryTextColor: '',
    });

    const handleBack = () => {
        navigate('/sidebar/events');
    };

    useEffect(() => {
        fetchEventById();
        fetchAdmins();
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

            setEvent(data.event);

            setFormData({
                EventName: data.event.EventName || '',
                Description: data.event.Description || '',
                Facilities: data.event.Facilities || '',
                Requirements: data.event.Requirements || '',
                TeamSize: data.event.TeamSize || '',
                StartDate: data.event.StartDate || '',
                EndDate: data.event.EndDate || '',
                RegistrationStart: data.event.RegistrationStart || '',
                RegistrationEnd: data.event.RegistrationEnd || '',
                Location: data.event.Location || '',
                EventType: data.event.EventType || '',
                EventStatus: data.event.EventStatus || '',
                HackathonMode: data.event.HackathonMode || '',
                PrimaryColor: data.event.PrimaryColor || '',
                SecondaryColor: data.event.SecondaryColor || '',
                TertiaryColor: data.event.TertiaryColor || '',
                PrimaryTextColor: data.event.PrimaryTextColor || '',
                SecondaryTextColor: data.event.SecondaryTextColor || '',
                TertiaryTextColor: data.event.TertiaryTextColor || '',
            });
        } catch (error) {
            console.error('Fetch event error:', error);
            setError(error.message);
            setEvent(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            setAdminLoading(true);

            const res = await fetch(
                `http://localhost:3000/api/admin/event/${id}`
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || 'Failed to fetch admins'
                );
            }

            setAdmins(data.admins);
        } catch (error) {
            console.error('Fetch admins error:', error);
            setAdmins([]);
        } finally {
            setAdminLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();

        try {
            setAdminSaving(true);

            const res = await fetch(
                'http://localhost:3000/api/admin/register',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        AdminName: adminForm.AdminName,
                        Email: adminForm.Email,
                        Password: adminForm.Password,
                        Mobile: adminForm.Mobile,
                        EventId: Number(id)
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || 'Admin creation failed'
                );
            }

            toast.success('Admin created successfully');

            setAdminForm({
                AdminName: '',
                Email: '',
                Password: '',
                Mobile: ''
            });

            setShowAdminForm(false);

            fetchAdmins();
        } catch (error) {
            console.error('Create admin error:', error);
            toast.error(error.message || 'Failed to create admin');
        } finally {
            setAdminSaving(false);
        }
    };

    const handleAdminInputChange = (e) => {
        const { name, value } = e.target;

        setAdminForm((prev) => ({
            ...prev,
            [name]: value
        }));
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

            toast.success('Event updated successfully');

            setIsEditing(false);

            await fetchEventById();
        } catch (error) {
            console.error('Update event error:', error);
            toast.error(error.message || 'Failed to update event');
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

            toast.success('Event deleted successfully');

            navigate('/sidebar/events');
        } catch (error) {
            console.error('Delete event error:', error);
            toast.error(error.message || 'Failed to delete event');
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

            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8"
            >

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

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBack}
                            className="p-2 rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </motion.button>

                        <div className="min-w-0">

                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white">
                                {event.EventName}
                            </h1>

                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {event.Description}
                            </p>

                        </div>

                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAdminForm(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 border border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Create Admin
                    </motion.button>

                </div>

            </motion.div>

            {isEditing ? (

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 sm:p-6 md:p-8"
                >

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

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Event Status
                                </label>

                                <select
                                    name="EventStatus"
                                    value={formData.EventStatus}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >

                                    <option value="">
                                        Select Status
                                    </option>

                                    <option value="Upcoming">
                                        Upcoming
                                    </option>

                                    <option value="Ongoing">
                                        Ongoing
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                </select>

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
                                    Facilities
                                </label>

                                <textarea
                                    name="Facilities"
                                    value={formData.Facilities}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Enter event facilities"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Requirements
                                </label>

                                <textarea
                                    name="Requirements"
                                    value={formData.Requirements}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Enter event requirements"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Team Size
                                </label>

                                <input
                                    type="text"
                                    name="TeamSize"
                                    value={formData.TeamSize}
                                    onChange={handleInputChange}
                                    placeholder="Enter team size"
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                />

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    name="StartDate"
                                    value={new Date(formData.StartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                    value={new Date(formData.EndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                    value={new Date(formData.RegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                    value={new Date(formData.RegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                    Primary Color
                                </label>

                                <div className="flex gap-3">

                                    <input
                                        type="color"
                                        name="PrimaryColor"
                                        value={formData.PrimaryColor || '#000000'}
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
                                        value={formData.SecondaryColor || '#000000'}
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
                                        value={formData.TertiaryColor || '#000000'}
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

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Primary Text Color
                                </label>

                                <div className="flex gap-3">

                                    <input
                                        type="color"
                                        name="PrimaryTextColor"
                                        value={formData.PrimaryTextColor || '#000000'}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />

                                    <input
                                        type="text"
                                        name="PrimaryTextColor"
                                        value={formData.PrimaryTextColor}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Secondary Text Color
                                </label>

                                <div className="flex gap-3">

                                    <input
                                        type="color"
                                        name="SecondaryTextColor"
                                        value={formData.SecondaryTextColor || '#000000'}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />

                                    <input
                                        type="text"
                                        name="SecondaryTextColor"
                                        value={formData.SecondaryTextColor}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />

                                </div>

                            </div>

                            <div>

                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tertiary Text Color
                                </label>

                                <div className="flex gap-3">

                                    <input
                                        type="color"
                                        name="TertiaryTextColor"
                                        value={formData.TertiaryTextColor || '#000000'}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />

                                    <input
                                        type="text"
                                        name="TertiaryTextColor"
                                        value={formData.TertiaryTextColor}
                                        onChange={handleInputChange}
                                        className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />

                                </div>

                            </div>

                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                Cancel
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={saving}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white"
                            >
                                <Save className="w-4 h-4" />

                                {saving
                                    ? 'Updating...'
                                    : 'Update Event'}
                            </motion.button>

                        </div>

                    </form>

                </motion.div>

            ) : (

                <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

                    <div className="xl:col-span-2 space-y-4 sm:space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="w-full min-h-[240px] rounded-xl bg-emerald-700 dark:bg-emerald-700 flex items-center justify-center">

                                    <Calendar className="w-14 h-14 text-white dark:text-white" />

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
                                            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Event Status
                                            </p>

                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.EventStatus || '-'}
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
                                                {new Date(event.StartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                                {new Date(event.EndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                                {new Date(event.CreatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                About This Event
                            </h2>

                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {event.Description || '-'}
                            </p>

                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                Facilities
                            </h3>

                            <div className="space-y-2.5">

                                {event.Facilities ? (

                                    event.Facilities
                                        .split('\n')
                                        .filter((item) => item.trim() !== '')
                                        .map((item, index) => (

                                            <div
                                                key={index}
                                                className="flex items-start gap-2.5"
                                            >

                                                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500 shrink-0 mt-0.5" />

                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {item}
                                                </p>

                                            </div>

                                        ))

                                ) : (

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No facilities added.
                                    </p>

                                )}

                            </div>

                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                Requirements
                            </h3>

                            <div className="space-y-2.5">

                                {event.Requirements ? (

                                    event.Requirements
                                        .split('\n')
                                        .filter((item) => item.trim() !== '')
                                        .map((item, index) => (

                                            <div
                                                key={index}
                                                className="flex items-start gap-2.5"
                                            >

                                                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500 shrink-0 mt-0.5" />

                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                    {item}
                                                </p>

                                            </div>

                                        ))

                                ) : (

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No requirements added.
                                    </p>

                                )}

                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Registration Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Registration Start
                                    </p>

                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(event.RegistrationStart || '-').toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                                    </p>

                                </div>

                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        Registration End
                                    </p>

                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(event.RegistrationEnd || '-').toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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

                                <div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Primary Text Color
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <div
                                            className="w-8 h-8 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    event.PrimaryTextColor,
                                            }}
                                        />

                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {event.PrimaryTextColor || '-'}
                                        </span>

                                    </div>

                                </div>

                                <div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Secondary Text Color
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <div
                                            className="w-8 h-8 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    event.SecondaryTextColor,
                                            }}
                                        />

                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {event.SecondaryTextColor || '-'}
                                        </span>

                                    </div>

                                </div>

                                <div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                        Tertiary Text Color
                                    </p>

                                    <div className="flex items-center gap-2">

                                        <div
                                            className="w-8 h-8 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    event.TertiaryTextColor,
                                            }}
                                        />

                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {event.TertiaryTextColor || '-'}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </motion.div>

                    </div>

                    <div className="space-y-4 sm:space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

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
                                        Status
                                    </p>

                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-500">
                                        {event.EventStatus || '-'}
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
                                        Team Size
                                    </p>

                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {event.TeamSize || '-'}
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

                        </motion.div>

                        <AnimatePresence>
                            {showAdminForm && (

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                                >

                                <div className="flex items-center justify-between mb-6">

                                    <div>

                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Create Admin
                                        </h2>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Create an admin for this event
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowAdminForm(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
                                    >
                                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </button>

                                </div>

                                <form onSubmit={handleCreateAdmin}>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Admin Name
                                            </label>

                                            <input
                                                type="text"
                                                name="AdminName"
                                                value={adminForm.AdminName}
                                                onChange={handleAdminInputChange}
                                                placeholder="Enter admin name"
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                name="Email"
                                                value={adminForm.Email}
                                                onChange={handleAdminInputChange}
                                                placeholder="Enter email"
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Password
                                            </label>

                                            <input
                                                type="password"
                                                name="Password"
                                                value={adminForm.Password}
                                                onChange={handleAdminInputChange}
                                                placeholder="Enter password"
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Mobile Number
                                            </label>

                                            <input
                                                type="text"
                                                name="Mobile"
                                                value={adminForm.Mobile}
                                                onChange={handleAdminInputChange}
                                                placeholder="Enter mobile number"
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                            />

                                        </div>

                                        <div className="md:col-span-2">

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Event Name
                                            </label>

                                            <input
                                                type="text"
                                                value={event.EventName}
                                                readOnly
                                                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"
                                            />

                                        </div>

                                    </div>

                                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">

                                        <button
                                            type="button"
                                            onClick={() => setShowAdminForm(false)}
                                            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={adminSaving}
                                            className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50"
                                        >
                                            {adminSaving
                                                ? 'Creating...'
                                                : 'Create Admin'}
                                        </button>

                                    </div>

                                </form>

                                </motion.div>

                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            <div className="flex items-center justify-between mb-4">

                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Admin
                                </h2>

                            </div>

                            {adminLoading ? (

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Loading admins...
                                </p>

                            ) : admins.length === 0 ? (

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No admin assigned to this event.
                                </p>

                            ) : (

                                <div className="space-y-3">

                                    {admins.map((admin) => (

                                        <motion.div
                                            key={admin.Id}
                                            whileHover={{ x: 4 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                        >

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {admin.AdminName}
                                                    </p>

                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {admin.Email}
                                                    </p>

                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {admin.Mobile}
                                                    </p>

                                                </div>

                                                <div className="text-right">

                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Event
                                                    </p>

                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-500">
                                                        {admin.EventName}
                                                    </p>

                                                </div>

                                            </div>

                                        </motion.div>

                                    ))}

                                </div>

                            )}

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.35 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

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
                                            {new Date(event.RegistrationStart || '-').toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                            {new Date(event.RegistrationEnd || '-').toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                            {new Date(event.StartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
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
                                            {new Date(event.EndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.45 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Actions
                            </h2>

                            <div className="space-y-3">

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Event
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDeleteEvent}
                                    disabled={deleting}
                                    className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />

                                    {deleting
                                        ? 'Deleting...'
                                        : 'Delete Event'}
                                </motion.button>

                            </div>

                        </motion.div>

                    </div>

                </div>

            )}


        </div>
    );
}

export default EventInfo;