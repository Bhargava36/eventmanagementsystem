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
    User,
    Mail,
    Phone,
    Lock,
    UploadCloud,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Users,
    Palette,
    Layers,
    FileText,
    Check,
    Globe,
    Radio,
    Trophy
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useToast from '../../../../Hooks/useToast';

function EventInfo() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const toast = useToast();

    const initialEvent = location.state?.initialEvent || null;
    const [event, setEvent] = useState(initialEvent);
    const [loading, setLoading] = useState(!initialEvent);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [showAdminModal, setShowAdminModal] = useState(false);
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

    const [activePosterIndex, setActivePosterIndex] = useState(0);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [aboutPhaseTab, setAboutPhaseTab] = useState('all');

    const [formData, setFormData] = useState({
        EventName: initialEvent?.EventName || '',
        Description: initialEvent?.Description || '',
        Facilities: initialEvent?.Facilities || '',
        Requirements: initialEvent?.Requirements || '',
        TeamSize: initialEvent?.TeamSize || '',
        StartDate: initialEvent?.StartDate || '',
        EndDate: initialEvent?.EndDate || '',
        VirtualStartDate: initialEvent?.VirtualStartDate || '',
        VirtualEndDate: initialEvent?.VirtualEndDate || '',
        PhysicalStartDate: initialEvent?.PhysicalStartDate || '',
        PhysicalEndDate: initialEvent?.PhysicalEndDate || '',
        VirtualRegistrationStart: initialEvent?.VirtualRegistrationStart || '',
        VirtualRegistrationEnd: initialEvent?.VirtualRegistrationEnd || '',
        PhysicalRegistrationStart: initialEvent?.PhysicalRegistrationStart || '',
        PhysicalRegistrationEnd: initialEvent?.PhysicalRegistrationEnd || '',
        VirtualFacilities: initialEvent?.VirtualFacilities || '',
        VirtualRequirements: initialEvent?.VirtualRequirements || '',
        PhysicalFacilities: initialEvent?.PhysicalFacilities || '',
        PhysicalRequirements: initialEvent?.PhysicalRequirements || '',
        RegistrationStart: initialEvent?.RegistrationStart || '',
        RegistrationEnd: initialEvent?.RegistrationEnd || '',
        Location: initialEvent?.Location || '',
        EventType: initialEvent?.EventType || '',
        EventStatus: initialEvent?.EventStatus || '',
        HackathonMode: initialEvent?.HackathonMode || '',
        PrizeMoney: initialEvent?.PrizeMoney || '',
        VirtualPrizeMoney: initialEvent?.VirtualPrizeMoney || '',
        PhysicalPrizeMoney: initialEvent?.PhysicalPrizeMoney || '',
        PrimaryColor: initialEvent?.PrimaryColor || '',
        SecondaryColor: initialEvent?.SecondaryColor || '',
        TertiaryColor: initialEvent?.TertiaryColor || '',
        PrimaryTextColor: initialEvent?.PrimaryTextColor || '',
        SecondaryTextColor: initialEvent?.SecondaryTextColor || '',
        TertiaryTextColor: initialEvent?.TertiaryTextColor || '',
        Posters: Array.isArray(initialEvent?.Posters) ? initialEvent.Posters : [],
    });

    const handleBack = () => {
        navigate('/sidebar/events');
    };

    useEffect(() => {
        fetchEventById(Boolean(initialEvent));
        fetchAdmins();
    }, [id]);

    useEffect(() => {
        if (!event?.Posters || event.Posters.length <= 1 || isEditing || isPaused) return;

        const timer = setInterval(() => {
            setActivePosterIndex((prev) => (prev + 1) % event.Posters.length);
        }, 3500);

        return () => clearInterval(timer);
    }, [event?.Posters, isEditing, isPaused]);

    const fetchEventById = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
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
            setActivePosterIndex(0);

            setFormData({
                EventName: data.event.EventName || '',
                Description: data.event.Description || '',
                Facilities: data.event.Facilities || '',
                Requirements: data.event.Requirements || '',
                TeamSize: data.event.TeamSize || '',
                StartDate: data.event.StartDate || '',
                EndDate: data.event.EndDate || '',
                VirtualStartDate: data.event.VirtualStartDate || '',
                VirtualEndDate: data.event.VirtualEndDate || '',
                PhysicalStartDate: data.event.PhysicalStartDate || '',
                PhysicalEndDate: data.event.PhysicalEndDate || '',
                VirtualRegistrationStart: data.event.VirtualRegistrationStart || '',
                VirtualRegistrationEnd: data.event.VirtualRegistrationEnd || '',
                PhysicalRegistrationStart: data.event.PhysicalRegistrationStart || '',
                PhysicalRegistrationEnd: data.event.PhysicalRegistrationEnd || '',
                VirtualFacilities: data.event.VirtualFacilities || '',
                VirtualRequirements: data.event.VirtualRequirements || '',
                PhysicalFacilities: data.event.PhysicalFacilities || '',
                PhysicalRequirements: data.event.PhysicalRequirements || '',
                RegistrationStart: data.event.RegistrationStart || '',
                RegistrationEnd: data.event.RegistrationEnd || '',
                Location: data.event.Location || '',
                EventType: data.event.EventType || '',
                EventStatus: data.event.EventStatus || '',
                HackathonMode: data.event.HackathonMode || '',
                PrizeMoney: data.event.PrizeMoney || '',
                VirtualPrizeMoney: data.event.VirtualPrizeMoney || '',
                PhysicalPrizeMoney: data.event.PhysicalPrizeMoney || '',
                PrimaryColor: data.event.PrimaryColor || '',
                SecondaryColor: data.event.SecondaryColor || '',
                TertiaryColor: data.event.TertiaryColor || '',
                PrimaryTextColor: data.event.PrimaryTextColor || '',
                SecondaryTextColor: data.event.SecondaryTextColor || '',
                TertiaryTextColor: data.event.TertiaryTextColor || '',
                Posters: Array.isArray(data.event.Posters) ? data.event.Posters : [],
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

        if (admins.length >= 3) {
            toast.error('Maximum limit reached. An event can have up to 3 admins only.');
            return;
        }

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

            setShowAdminModal(false);

            await fetchAdmins();
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

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (loadEvt) => {
                const img = new Image();
                img.onload = () => {
                    const maxDim = 1200;
                    let { width, height } = img;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', 0.82);
                    resolve(compressed);
                };
                img.onerror = () => resolve(loadEvt.target.result);
                img.src = loadEvt.target.result;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    };

    const handlePosterUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file.`);
                continue;
            }
            try {
                const compressedBase64 = await compressImage(file);
                if (compressedBase64) {
                    setFormData((prev) => ({
                        ...prev,
                        Posters: [...(prev.Posters || []), compressedBase64]
                    }));
                }
            } catch (err) {
                console.error('Image compression error:', err);
            }
        }
        e.target.value = '';
    };

    const handleRemovePoster = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            Posters: (prev.Posters || []).filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSetPrimaryPoster = (indexToPrimary) => {
        setFormData((prev) => {
            const posters = [...(prev.Posters || [])];
            if (indexToPrimary === 0 || !posters[indexToPrimary]) return prev;
            const [selected] = posters.splice(indexToPrimary, 1);
            posters.unshift(selected);
            return {
                ...prev,
                Posters: posters
            };
        });
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return '';
            return d.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const calculateDuration = (start, end) => {
        if (!start || !end) return null;
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
        const diffTime = e.getTime() - s.getTime();
        if (diffTime < 0) return 'Invalid range';
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
    };

    const getFormCompleteness = () => {
        const requiredKeys = ['EventName', 'TeamSize', 'StartDate', 'EndDate', 'Location', 'EventType'];
        let filled = 0;
        requiredKeys.forEach((k) => {
            if (formData[k] && String(formData[k]).trim() !== '') filled++;
        });
        const hasPosters = (formData.Posters || []).length > 0;
        const score = Math.round(((filled + (hasPosters ? 1 : 0)) / (requiredKeys.length + 1)) * 100);
        return Math.min(100, Math.max(0, score));
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const payload = { ...formData };
            if (formData.HackathonMode === 'Both' || formData.HackathonMode === 'Virtual and Physical') {
                payload.StartDate = formData.VirtualStartDate || formData.StartDate;
                payload.EndDate = formData.PhysicalEndDate || formData.EndDate;
                payload.RegistrationStart = formData.VirtualRegistrationStart || formData.RegistrationStart;
                payload.RegistrationEnd = formData.PhysicalRegistrationEnd || formData.RegistrationEnd;
                payload.VirtualPrizeMoney = formData.VirtualPrizeMoney;
                payload.PhysicalPrizeMoney = formData.PhysicalPrizeMoney;
            } else if (formData.HackathonMode === 'Hybrid') {
                payload.StartDate = formData.StartDate || formData.VirtualStartDate || formData.PhysicalStartDate;
                payload.EndDate = formData.EndDate || formData.PhysicalEndDate || formData.VirtualEndDate;
                payload.RegistrationStart = formData.RegistrationStart || formData.VirtualRegistrationStart || formData.PhysicalRegistrationStart;
                payload.RegistrationEnd = formData.RegistrationEnd || formData.PhysicalRegistrationEnd || formData.VirtualRegistrationEnd;
                payload.PrizeMoney = formData.PrizeMoney || formData.PhysicalPrizeMoney || formData.VirtualPrizeMoney;
            } else if (formData.HackathonMode === 'Virtual') {
                payload.StartDate = formData.VirtualStartDate || formData.StartDate;
                payload.EndDate = formData.VirtualEndDate || formData.EndDate;
                payload.RegistrationStart = formData.VirtualRegistrationStart || formData.RegistrationStart;
                payload.RegistrationEnd = formData.VirtualRegistrationEnd || formData.RegistrationEnd;
                payload.VirtualPrizeMoney = formData.VirtualPrizeMoney || formData.PrizeMoney;
                if (!payload.Location) payload.Location = 'Virtual / Online';
            } else if (formData.HackathonMode === 'Physical') {
                payload.StartDate = formData.PhysicalStartDate || formData.StartDate;
                payload.EndDate = formData.PhysicalEndDate || formData.EndDate;
                payload.RegistrationStart = formData.PhysicalRegistrationStart || formData.RegistrationStart;
                payload.RegistrationEnd = formData.PhysicalRegistrationEnd || formData.RegistrationEnd;
                payload.PhysicalPrizeMoney = formData.PhysicalPrizeMoney || formData.PrizeMoney;
            }

            const res = await fetch(
                `http://localhost:3000/api/events/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
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

    if (loading && !event) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col animate-pulse transition-colors">
                <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                        </div>
                        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    </div>
                </div>
                <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                <div className="space-y-4">
                                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-64 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6" />
                    </div>
                </div>
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
                        whileHover={{ scale: admins.length >= 3 ? 1 : 1.02 }}
                        whileTap={{ scale: admins.length >= 3 ? 1 : 0.98 }}
                        onClick={() => {
                            if (admins.length >= 3) {
                                toast.error('Maximum limit reached. An event can have up to 3 admins only.');
                                return;
                            }
                            setShowAdminModal(true);
                        }}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            admins.length >= 3
                                ? 'border-gray-300 dark:border-gray-800 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-80'
                                : 'border-emerald-700 dark:border-emerald-500 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer shadow-sm'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        <span>{admins.length >= 3 ? 'Max Admins (3/3)' : `Create Admin (${admins.length}/3)`}</span>
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

                    <form onSubmit={handleUpdateEvent}>

                        <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                            Edit Event Studio
                                        </h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                            Live Editing
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Update event details, posters, dates, and preview how participants see this event in real time.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-60 transition-all cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{saving ? 'Updating...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        Profile Completeness: <strong className="text-emerald-600 dark:text-emerald-400">{getFormCompleteness()}%</strong>
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {calculateDuration(formData.StartDate, formData.EndDate) && (
                                            <span className="mr-3 font-medium text-emerald-600 dark:text-emerald-400">
                                                Duration: {calculateDuration(formData.StartDate, formData.EndDate)}
                                            </span>
                                        )}
                                        {getFormCompleteness() === 100 ? 'All essential details completed' : 'Keep filling details to reach 100%'}
                                    </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getFormCompleteness()}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                            <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Basic Information & Mode
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Primary title, category, format and current status.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                Event Name
                                            </label>
                                            <span className="text-[11px] text-gray-400">
                                                {(formData.EventName || '').length} characters
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            name="EventName"
                                            value={formData.EventName}
                                            onChange={handleInputChange}
                                            placeholder="Enter event name"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Event Type
                                            </label>
                                            <input
                                                type="text"
                                                name="EventType"
                                                value={formData.EventType}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Hackathon, Workshop"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            />
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {['Hackathon', 'Workshop', 'Tech Fest', 'Coding Contest', 'Seminar'].map((chip) => (
                                                    <button
                                                        key={chip}
                                                        type="button"
                                                        onClick={() => setFormData((prev) => ({ ...prev, EventType: chip }))}
                                                        className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                                                            formData.EventType === chip
                                                                ? 'bg-emerald-600 text-white font-medium'
                                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Event Status
                                            </label>
                                            <select
                                                name="EventStatus"
                                                value={formData.EventStatus}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="Upcoming">Upcoming</option>
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                            <p className="text-[11px] text-gray-400 mt-2">
                                                Status automatically calculates based on event dates if saved.
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Hackathon / Participation Mode
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                            {[
                                                { id: 'Virtual', label: 'Virtual' },
                                                { id: 'Physical', label: 'Physical' },
                                                { id: 'Virtual and Physical', label: 'Virtual and Physical' },
                                                { id: 'Hybrid', label: 'Hybrid' }
                                            ].map((modeItem) => (
                                                <button
                                                    key={modeItem.id}
                                                    type="button"
                                                    onClick={() => setFormData((prev) => ({
                                                        ...prev,
                                                        HackathonMode: modeItem.id,
                                                        Location: modeItem.id === 'Virtual' ? (prev.Location || 'Virtual / Online') : (prev.Location === 'Virtual / Online' ? '' : prev.Location)
                                                    }))}
                                                    className={`py-2 px-1 rounded-xl text-xs font-medium border text-center transition-all ${
                                                        formData.HackathonMode?.toLowerCase() === modeItem.id.toLowerCase() ||
                                                        (modeItem.id === 'Virtual and Physical' && formData.HackathonMode === 'Both')
                                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-sm'
                                                            : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                                                    }`}
                                                >
                                                    {modeItem.label}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            name="HackathonMode"
                                            value={formData.HackathonMode}
                                            onChange={handleInputChange}
                                            placeholder="Participation mode description"
                                            className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    Event Posters & Media
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Upload banners and promotional artwork for this event.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                            {(formData.Posters || []).length} Uploaded
                                        </span>
                                    </div>

                                    <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50/50 dark:bg-gray-900/40 group">
                                        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center">
                                            Click or drop images here to upload new posters
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 text-center">
                                            Supports PNG, JPG, WEBP (Up to 8MB each, multiple allowed)
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePosterUpload}
                                            className="hidden"
                                        />
                                    </label>

                                    {(formData.Posters || []).length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                            {formData.Posters.map((poster, index) => (
                                                <div
                                                    key={index}
                                                    className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 aspect-[4/3] shadow-sm"
                                                >
                                                    <img
                                                        src={poster}
                                                        alt={`Poster ${index + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />

                                                    <div className="absolute top-1.5 left-1.5 z-10">
                                                        {index === 0 ? (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow">
                                                                Primary
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetPrimaryPoster(index)}
                                                                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 hover:bg-emerald-600 text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 shadow"
                                                            >
                                                                Set Primary
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => setLightboxImage(poster)}
                                                            className="p-1 rounded-full bg-black/60 hover:bg-black/90 text-white"
                                                            title="Preview"
                                                        >
                                                            <Maximize2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePoster(index)}
                                                            className="p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    Schedule, Timeline & Venue
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Event runtime, registration windows, and location.
                                                </p>
                                            </div>
                                        </div>
                                        {calculateDuration(formData.StartDate, formData.EndDate) && (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
                                                {calculateDuration(formData.StartDate, formData.EndDate)}
                                            </span>
                                        )}
                                    </div>

                                    {formData.HackathonMode === 'Both' || formData.HackathonMode === 'Virtual and Physical' ? (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    <span>Virtual Phase Schedule</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Virtual Registration Start
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="VirtualRegistrationStart"
                                                            value={formatDateForInput(formData.VirtualRegistrationStart)}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Virtual Registration End
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="VirtualRegistrationEnd"
                                                            value={formatDateForInput(formData.VirtualRegistrationEnd)}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Virtual Event Start Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="VirtualStartDate"
                                                            value={formatDateForInput(formData.VirtualStartDate)}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Virtual Event End Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="VirtualEndDate"
                                                            value={formatDateForInput(formData.VirtualEndDate)}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5 space-y-3">
                                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span>Physical / Venue Phase Schedule</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Physical Registration Start
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="PhysicalRegistrationStart"
                                                            value={formatDateForInput(formData.PhysicalRegistrationStart)}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Physical Registration End
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="PhysicalRegistrationEnd"
                                                            value={formatDateForInput(formData.PhysicalRegistrationEnd)}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Physical Event Start Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="PhysicalStartDate"
                                                            value={formatDateForInput(formData.PhysicalStartDate)}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Physical Event End Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="PhysicalEndDate"
                                                            value={formatDateForInput(formData.PhysicalEndDate)}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        {formData.HackathonMode === 'Virtual' ? 'Virtual Start Date' : 'Event Start Date'}
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="StartDate"
                                                        value={formatDateForInput(formData.StartDate)}
                                                        onChange={(e) => {
                                                            handleInputChange(e);
                                                            if (formData.HackathonMode === 'Virtual') {
                                                                setFormData((prev) => ({ ...prev, StartDate: e.target.value, VirtualStartDate: e.target.value }));
                                                            } else {
                                                                setFormData((prev) => ({ ...prev, StartDate: e.target.value, PhysicalStartDate: e.target.value }));
                                                            }
                                                        }}
                                                        required
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        {formData.HackathonMode === 'Virtual' ? 'Virtual End Date' : 'Event End Date'}
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="EndDate"
                                                        value={formatDateForInput(formData.EndDate)}
                                                        onChange={(e) => {
                                                            handleInputChange(e);
                                                            if (formData.HackathonMode === 'Virtual') {
                                                                setFormData((prev) => ({ ...prev, EndDate: e.target.value, VirtualEndDate: e.target.value }));
                                                            } else {
                                                                setFormData((prev) => ({ ...prev, EndDate: e.target.value, PhysicalEndDate: e.target.value }));
                                                            }
                                                        }}
                                                        required
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Registration Start Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="RegistrationStart"
                                                        value={formatDateForInput(formData.RegistrationStart)}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                        Registration End Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="RegistrationEnd"
                                                        value={formatDateForInput(formData.RegistrationEnd)}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Allowed Team Size
                                        </label>
                                        <input
                                            type="text"
                                            name="TeamSize"
                                            value={formData.TeamSize}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 2 - 4 Members, Individual"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                        />
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {['Individual (1 Member)', '2 - 4 Members', '3 - 5 Members', 'Open / Unlimited'].map((sz) => (
                                                <button
                                                    key={sz}
                                                    type="button"
                                                    onClick={() => setFormData((prev) => ({ ...prev, TeamSize: sz }))}
                                                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                                                        formData.TeamSize === sz
                                                            ? 'bg-emerald-600 text-white font-medium'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {sz}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Event Location / Venue
                                        </label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-3" />
                                            <input
                                                type="text"
                                                name="Location"
                                                value={formData.Location}
                                                onChange={handleInputChange}
                                                placeholder={formData.HackathonMode === 'Virtual' ? 'Online / Meeting Platform (e.g. Google Meet, Zoom)' : 'e.g. Campus Auditorium, Hall A'}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {(formData.HackathonMode === 'Both' || formData.HackathonMode === 'Virtual and Physical') ? (
                                        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Track Prize Pools</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Configure separate prize money for Physical and Virtual tracks.</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Physical Track Prize Money
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="PhysicalPrizeMoney"
                                                        value={formData.PhysicalPrizeMoney || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. ₹50,000"
                                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Virtual Track Prize Money
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="VirtualPrizeMoney"
                                                        value={formData.VirtualPrizeMoney || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. ₹25,000"
                                                        className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-xs">
                                                <span className="text-gray-600 dark:text-gray-400 font-medium">Combined Pool Note</span>
                                                <span className="font-extrabold text-amber-600 dark:text-amber-400">
                                                    {formData.PhysicalPrizeMoney && formData.VirtualPrizeMoney
                                                        ? `Physical: ${formData.PhysicalPrizeMoney} | Virtual: ${formData.VirtualPrizeMoney}`
                                                        : formData.PhysicalPrizeMoney || formData.VirtualPrizeMoney || 'Set track prize amounts above'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Prize Money / Prize Pool
                                            </label>
                                            <input
                                                type="text"
                                                name="PrizeMoney"
                                                value={formData.PrizeMoney || ''}
                                                onChange={handleInputChange}
                                                placeholder="e.g. ₹50,000 or $1,000"
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                                    <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                Event Content & Guidelines
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Curated directly by designated Event Admins.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                        <p className="font-medium text-emerald-800 dark:text-emerald-300">
                                            Admin Studio Curation Active
                                        </p>
                                        <p>
                                            Detailed descriptions, facilities provided, and track requirements are managed and tailored directly by assigned Event Admins through their dedicated Event Admin Studio.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                <Palette className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    Visual Branding & Color Palette
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Custom color accents for tickets, banners, and dynamic participant view.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                            <div
                                                className="w-5 h-5 rounded-lg border border-black/10 shadow-sm"
                                                style={{ backgroundColor: formData.PrimaryColor || '#10B981' }}
                                                title="Primary Color"
                                            />
                                            <div
                                                className="w-5 h-5 rounded-lg border border-black/10 shadow-sm"
                                                style={{ backgroundColor: formData.SecondaryColor || '#FFFFFF' }}
                                                title="Secondary Color"
                                            />
                                            <div
                                                className="w-5 h-5 rounded-lg border border-black/10 shadow-sm"
                                                style={{ backgroundColor: formData.TertiaryColor || '#000000' }}
                                                title="Tertiary Color"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Primary Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    name="PrimaryColor"
                                                    value={formData.PrimaryColor || '#10B981'}
                                                    onChange={handleInputChange}
                                                    className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 dark:border-gray-700 bg-transparent shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    name="PrimaryColor"
                                                    value={formData.PrimaryColor}
                                                    onChange={handleInputChange}
                                                    placeholder="#10B981"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Secondary Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    name="SecondaryColor"
                                                    value={formData.SecondaryColor || '#FFFFFF'}
                                                    onChange={handleInputChange}
                                                    className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 dark:border-gray-700 bg-transparent shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    name="SecondaryColor"
                                                    value={formData.SecondaryColor}
                                                    onChange={handleInputChange}
                                                    placeholder="#FFFFFF"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Tertiary Color
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    name="TertiaryColor"
                                                    value={formData.TertiaryColor || '#000000'}
                                                    onChange={handleInputChange}
                                                    className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 dark:border-gray-700 bg-transparent shrink-0"
                                                />
                                                <input
                                                    type="text"
                                                    name="TertiaryColor"
                                                    value={formData.TertiaryColor}
                                                    onChange={handleInputChange}
                                                    placeholder="#000000"
                                                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-5">

                                <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                                    <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                                Live Attendee View
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                Real-time Sync
                                            </span>
                                        </div>
                                    </div>

                                    <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-emerald-600 to-teal-800 overflow-hidden flex items-center justify-center">
                                        {(formData.Posters || []).length > 0 ? (
                                            <img
                                                src={formData.Posters[0]}
                                                alt="Event Primary Poster Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center p-6 text-white">
                                                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-white/70" />
                                                <p className="text-xs font-semibold">Upload a poster to preview here</p>
                                            </div>
                                        )}

                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-md shadow">
                                                {formData.EventStatus || 'Upcoming'}
                                            </span>
                                            {formData.EventType && (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow">
                                                    {formData.EventType}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                                                {formData.EventName || 'Event Name'}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                                {formData.Description || 'Brief event overview will appear here as you type.'}
                                            </p>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-xs">
                                            <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                                                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span className="line-clamp-1">
                                                    {formData.StartDate ? new Date(formData.StartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Start Date'} - {formData.EndDate ? new Date(formData.EndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'End Date'}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                                                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span className="line-clamp-1">{formData.Location || 'Location not specified'}</span>
                                            </div>

                                            <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300">
                                                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>{formData.TeamSize || 'Team size not set'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                        Readiness Checklist
                                    </h4>

                                    <div className="space-y-2 text-xs">
                                        {[
                                            { label: 'Event Name & Type defined', done: Boolean(formData.EventName && formData.EventType) },
                                            { label: 'Poster artwork uploaded', done: Boolean((formData.Posters || []).length > 0) },
                                            { label: 'Schedule timeline configured', done: Boolean(formData.StartDate && formData.EndDate) },
                                            { label: 'Venue / Location specified', done: Boolean(formData.Location) },
                                            { label: 'Description & details filled', done: Boolean(formData.Description) },
                                            { label: 'Event admins assigned', done: Boolean(admins.length > 0) },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-1">
                                                <span className={item.done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}>
                                                    {item.label}
                                                </span>
                                                {item.done ? (
                                                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                        <Check className="w-3 h-3" />
                                                    </span>
                                                ) : (
                                                    <span className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-950 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-2.5">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-60 cursor-pointer transition-all"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{saving ? 'Saving Event Updates...' : 'Publish & Update Event'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 text-sm font-medium transition-colors"
                                    >
                                        Discard Changes
                                    </button>
                                </div>

                            </div>

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

                                {event.Posters && event.Posters.length > 0 ? (
                                    <div
                                        className="flex flex-col gap-2.5"
                                        onMouseEnter={() => setIsPaused(true)}
                                        onMouseLeave={() => setIsPaused(false)}
                                    >
                                        <div className="relative w-full min-h-[260px] max-h-[340px] rounded-xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-gray-800 group shadow-sm flex items-center justify-center">
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={activePosterIndex}
                                                    src={event.Posters[activePosterIndex] || event.Posters[0]}
                                                    alt={event.EventName}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.35 }}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                                                    onClick={() => setLightboxImage(event.Posters[activePosterIndex] || event.Posters[0])}
                                                />
                                            </AnimatePresence>

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            <button
                                                type="button"
                                                onClick={() => setLightboxImage(event.Posters[activePosterIndex] || event.Posters[0])}
                                                className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 hover:bg-emerald-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow"
                                                title="View Fullscreen"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                            </button>

                                            {event.Posters.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActivePosterIndex((prev) => (prev > 0 ? prev - 1 : event.Posters.length - 1));
                                                        }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-emerald-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActivePosterIndex((prev) => (prev < event.Posters.length - 1 ? prev + 1 : 0));
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-emerald-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>

                                                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 pointer-events-none">
                                                        {event.Posters.map((_, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`h-1.5 rounded-full transition-all ${
                                                                    idx === activePosterIndex
                                                                        ? 'w-6 bg-emerald-500'
                                                                        : 'w-1.5 bg-white/60'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {event.Posters.length > 1 && (
                                            <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
                                                {event.Posters.map((poster, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => setActivePosterIndex(index)}
                                                        className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                            activePosterIndex === index
                                                                ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105 shadow-md'
                                                                : 'border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100 hover:border-emerald-500/50'
                                                        }`}
                                                    >
                                                        <img
                                                            src={poster}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {index === 0 && (
                                                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-full min-h-[240px] rounded-xl bg-emerald-700 dark:bg-emerald-700/80 flex flex-col items-center justify-center text-white p-6 text-center">
                                        <ImageIcon className="w-12 h-12 text-emerald-200 mb-2 opacity-80" />
                                        <p className="text-sm font-medium">No event poster uploaded</p>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="mt-3 text-xs bg-white text-emerald-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
                                        >
                                            Upload Poster
                                        </button>
                                    </div>
                                )}

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
                                            {event.HackathonMode === 'Virtual' ? (
                                                <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                            ) : event.HackathonMode === 'Both' || event.HackathonMode === 'Virtual and Physical' ? (
                                                <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                            ) : event.HackathonMode === 'Hybrid' ? (
                                                <Radio className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                            ) : (
                                                <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Participation Mode
                                            </p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {event.HackathonMode === 'Both' ? 'Both (Virtual & Physical)' : (event.HackathonMode || '-')}
                                            </p>
                                        </div>
                                    </div>

                                    {(event.HackathonMode === 'Both' || (event.VirtualStartDate && event.PhysicalStartDate)) ? (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                                    <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Virtual Phase
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {event.VirtualStartDate ? new Date(event.VirtualStartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                        {' ➔ '}
                                                        {event.VirtualEndDate ? new Date(event.VirtualEndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    </p>
                                                    {(event.VirtualRegistrationStart || event.VirtualRegistrationEnd) && (
                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            Reg: {event.VirtualRegistrationStart ? new Date(event.VirtualRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                            {' ➔ '}
                                                            {event.VirtualRegistrationEnd ? new Date(event.VirtualRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                                    <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Physical Phase
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {event.PhysicalStartDate ? new Date(event.PhysicalStartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                        {' ➔ '}
                                                        {event.PhysicalEndDate ? new Date(event.PhysicalEndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    </p>
                                                    {(event.PhysicalRegistrationStart || event.PhysicalRegistrationEnd) && (
                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            Reg: {event.PhysicalRegistrationStart ? new Date(event.PhysicalRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                            {' ➔ '}
                                                            {event.PhysicalRegistrationEnd ? new Date(event.PhysicalRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                                    <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {event.HackathonMode === 'Virtual' ? 'Virtual Start Date' : 'Start Date'}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {event.StartDate ? new Date(event.StartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                                    <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {event.HackathonMode === 'Virtual' ? 'Virtual End Date' : 'End Date'}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {event.EndDate ? new Date(event.EndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}

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

                                    {(event.VirtualPrizeMoney || event.PhysicalPrizeMoney || event.PrizeMoney) && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                                                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Prize Pool
                                                </p>

                                                {(event.HackathonMode === 'Both' || event.HackathonMode === 'Virtual and Physical') && (event.PhysicalPrizeMoney || event.VirtualPrizeMoney) ? (
                                                    <div className="space-y-1 mt-0.5">
                                                        {event.PhysicalPrizeMoney && (
                                                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                                                Physical Track: {event.PhysicalPrizeMoney}
                                                            </p>
                                                        )}
                                                        {event.VirtualPrizeMoney && (
                                                            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                                                Virtual Track: {event.VirtualPrizeMoney}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {event.PrizeMoney || event.PhysicalPrizeMoney || event.VirtualPrizeMoney || '-'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>

                            </div>

                        </motion.div>


                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            {(() => {
                                const isDualMode = Boolean(
                                    event.HackathonMode === 'Both' ||
                                    ((event.VirtualFacilities || event.VirtualRequirements || event.VirtualStartDate) &&
                                     (event.PhysicalFacilities || event.PhysicalRequirements || event.PhysicalStartDate))
                                );

                                return (
                                    <>
                                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                About This Event
                                            </h2>
                                            {isDualMode && (
                                                <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAboutPhaseTab('all')}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                                            aboutPhaseTab === 'all'
                                                                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        All Tracks
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAboutPhaseTab('virtual')}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                                            aboutPhaseTab === 'virtual'
                                                                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <Globe className="w-3 h-3" />
                                                        Virtual
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAboutPhaseTab('physical')}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                                            aboutPhaseTab === 'physical'
                                                                ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        Physical
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                            {event.Description || '-'}
                                        </p>

                                        {isDualMode ? (
                                            <div className="mt-6 space-y-4">
                                                {(aboutPhaseTab === 'all' || aboutPhaseTab === 'virtual') && (
                                                    <div className="rounded-xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                                                    <Globe className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                        Virtual Phase
                                                                    </h4>
                                                                    {event.VirtualStartDate && (
                                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                            Phase: {new Date(event.VirtualStartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} - {event.VirtualEndDate ? new Date(event.VirtualEndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : ''}
                                                                        </p>
                                                                    )}
                                                                    {(event.VirtualRegistrationStart || event.VirtualRegistrationEnd) && (
                                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                                            Registration: {event.VirtualRegistrationStart ? new Date(event.VirtualRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'} - {event.VirtualRegistrationEnd ? new Date(event.VirtualRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                Online Track
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                                            <div>
                                                                <h5 className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                    Facilities Provided
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {(event.VirtualFacilities || event.Facilities) ? (
                                                                        (event.VirtualFacilities || event.Facilities)
                                                                            .split('\n')
                                                                            .filter((item) => item.trim() !== '')
                                                                            .map((item, index) => (
                                                                                <div key={index} className="flex items-start gap-2">
                                                                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                                        {item}
                                                                                    </p>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <p className="text-xs text-gray-400">No virtual facilities specified.</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h5 className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                    Requirements
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {(event.VirtualRequirements || event.Requirements) ? (
                                                                        (event.VirtualRequirements || event.Requirements)
                                                                            .split('\n')
                                                                            .filter((item) => item.trim() !== '')
                                                                            .map((item, index) => (
                                                                                <div key={index} className="flex items-start gap-2">
                                                                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                                        {item}
                                                                                    </p>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <p className="text-xs text-gray-400">No virtual requirements specified.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {(aboutPhaseTab === 'all' || aboutPhaseTab === 'physical') && (
                                                    <div className="rounded-xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                                                    <MapPin className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                        Physical Phase
                                                                    </h4>
                                                                    {event.PhysicalStartDate && (
                                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                            Phase: {new Date(event.PhysicalStartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})} - {event.PhysicalEndDate ? new Date(event.PhysicalEndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : ''}
                                                                        </p>
                                                                    )}
                                                                    {(event.PhysicalRegistrationStart || event.PhysicalRegistrationEnd) && (
                                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                                            Registration: {event.PhysicalRegistrationStart ? new Date(event.PhysicalRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'} - {event.PhysicalRegistrationEnd ? new Date(event.PhysicalRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                In-Person / Venue
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                                            <div>
                                                                <h5 className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                    Facilities Provided
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {(event.PhysicalFacilities || event.Facilities) ? (
                                                                        (event.PhysicalFacilities || event.Facilities)
                                                                            .split('\n')
                                                                            .filter((item) => item.trim() !== '')
                                                                            .map((item, index) => (
                                                                                <div key={index} className="flex items-start gap-2">
                                                                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                                        {item}
                                                                                    </p>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <p className="text-xs text-gray-400">No physical facilities specified.</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h5 className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                    Requirements
                                                                </h5>
                                                                <div className="space-y-2">
                                                                    {(event.PhysicalRequirements || event.Requirements) ? (
                                                                        (event.PhysicalRequirements || event.Requirements)
                                                                            .split('\n')
                                                                            .filter((item) => item.trim() !== '')
                                                                            .map((item, index) => (
                                                                                <div key={index} className="flex items-start gap-2">
                                                                                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                                                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                                                        {item}
                                                                                    </p>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        <p className="text-xs text-gray-400">No physical requirements specified.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between mt-6 mb-3">
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                        Facilities
                                                    </h3>
                                                    {event.HackathonMode && (
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                            {event.HackathonMode} Mode
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-2.5">
                                                    {(event.VirtualFacilities || event.PhysicalFacilities || event.Facilities) ? (
                                                        (event.VirtualFacilities || event.PhysicalFacilities || event.Facilities)
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
                                                    {(event.VirtualRequirements || event.PhysicalRequirements || event.Requirements) ? (
                                                        (event.VirtualRequirements || event.PhysicalRequirements || event.Requirements)
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
                                            </>
                                        )}
                                    </>
                                );
                            })()}

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

                            {Boolean(event.HackathonMode === 'Both' || (event.VirtualRegistrationStart && event.PhysicalRegistrationStart)) ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/60">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                                Virtual Track Registration
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Start: {event.VirtualRegistrationStart ? new Date(event.VirtualRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                End: {event.VirtualRegistrationEnd ? new Date(event.VirtualRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/60">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                                Physical Track Registration
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Start: {event.PhysicalRegistrationStart ? new Date(event.PhysicalRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                End: {event.PhysicalRegistrationEnd ? new Date(event.PhysicalRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Registration Start
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {event.RegistrationStart ? new Date(event.RegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Registration End
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {event.RegistrationEnd ? new Date(event.RegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                        </p>
                                    </div>
                                </div>
                            )}

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

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
                        >

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Admins
                                    </h2>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400">
                                        {admins.length}/3 Assigned
                                    </span>
                                </div>

                                {admins.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminModal(true)}
                                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Admin</span>
                                    </button>
                                )}
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

                                    {admins.map((admin, idx) => (

                                        <motion.div
                                            key={admin.Id || idx}
                                            whileHover={{ x: 4 }}
                                            transition={{ duration: 0.2 }}
                                            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                        >

                                            <div className="flex items-center justify-between">

                                                <div className="min-w-0">

                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {admin.AdminName || 'Event Admin'}
                                                        </p>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                                                            Admin #{idx + 1}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                        {admin.Email}
                                                    </p>

                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {admin.Mobile}
                                                    </p>

                                                </div>

                                                <div className="text-right shrink-0 ml-3">

                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Event
                                                    </p>

                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-500 truncate max-w-[140px]">
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

                                {(event.HackathonMode === 'Both' || (event.VirtualStartDate && event.PhysicalStartDate)) ? (
                                    <>
                                        <div className="flex gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Virtual Phase
                                                </p>
                                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                                                    {event.VirtualStartDate ? new Date(event.VirtualStartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    {' to '}
                                                    {event.VirtualEndDate ? new Date(event.VirtualEndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                </p>
                                                {(event.VirtualRegistrationStart || event.VirtualRegistrationEnd) && (
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Registration: {event.VirtualRegistrationStart ? new Date(event.VirtualRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'} to {event.VirtualRegistrationEnd ? new Date(event.VirtualRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Physical Phase
                                                </p>
                                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                                                    {event.PhysicalStartDate ? new Date(event.PhysicalStartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    {' to '}
                                                    {event.PhysicalEndDate ? new Date(event.PhysicalEndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                </p>
                                                {(event.PhysicalRegistrationStart || event.PhysicalRegistrationEnd) && (
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Registration: {event.PhysicalRegistrationStart ? new Date(event.PhysicalRegistrationStart).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'} to {event.PhysicalRegistrationEnd ? new Date(event.PhysicalRegistrationEnd).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    Event Start
                                                </p>
                                                <p className="text-xs text-emerald-700 mt-1">
                                                    {event.StartDate ? new Date(event.StartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
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
                                                    {event.EndDate ? new Date(event.EndDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

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

            <AnimatePresence>
                {showAdminModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !adminSaving && setShowAdminModal(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-2xl p-6 sm:p-7 border border-gray-200 dark:border-gray-800 shadow-2xl z-10 overflow-hidden my-8"
                        >
                            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-200 dark:border-gray-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white font-['Syne']">
                                            Create Event Admin
                                        </h2>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                            Slot {admins.length + 1} of 3
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Assign an admin to manage {event?.EventName || 'this event'} (Up to 3 admins allowed)
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={adminSaving}
                                    onClick={() => setShowAdminModal(false)}
                                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Admin Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            name="AdminName"
                                            required
                                            value={adminForm.AdminName}
                                            onChange={handleAdminInputChange}
                                            placeholder="e.g. Swathi Sharma"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Email Address <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                name="Email"
                                                required
                                                value={adminForm.Email}
                                                onChange={handleAdminInputChange}
                                                placeholder="admin@example.com"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                            Mobile Number <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                name="Mobile"
                                                required
                                                value={adminForm.Mobile}
                                                onChange={handleAdminInputChange}
                                                placeholder="9876543210"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            name="Password"
                                            required
                                            value={adminForm.Password}
                                            onChange={handleAdminInputChange}
                                            placeholder="Create a secure password"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Assigned Event
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        disabled
                                        value={event?.EventName || ''}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200 dark:border-gray-800">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        Slots remaining: <strong className="text-emerald-600 dark:text-emerald-400">{Math.max(0, 3 - admins.length)}</strong>
                                    </span>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            disabled={adminSaving}
                                            onClick={() => setShowAdminModal(false)}
                                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={adminSaving}
                                            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                                        >
                                            {adminSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Creating Admin...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    <span>Create Admin</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {lightboxImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLightboxImage(null)}
                            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
                        />

                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-4xl max-h-[90vh] z-10 flex flex-col items-center"
                        >
                            <button
                                type="button"
                                onClick={() => setLightboxImage(null)}
                                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <img
                                src={lightboxImage}
                                alt="Event Poster Preview"
                                className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

export default EventInfo;