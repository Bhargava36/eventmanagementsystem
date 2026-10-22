import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '@/lib/api';
import { motion } from "framer-motion";
import {
    Users,
    UsersRound,
    CalendarDays,
    Clock,
    Trophy,
    AlertCircle,
    Activity,
    ClipboardList,
    Plus,
    X,
    Trash2,
    MapPin,
    Timer,
    CheckCircle2,
    UserPlus,
    FileText,
    Globe,
    Building2,
    Layers,
    Save,
    Edit3,
    Medal
} from "lucide-react";
import PrizePodiumStage from "../../../../components/Molecules/PrizePodiumStage";
import { getTrackVisibility } from "../../../../lib/utils";

function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTime(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function AdminDashboard() {
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    const eventId = admin?.EventId;

    const cacheKey = eventId ? `admin_dashboard_cache_${eventId}` : null;
    const cachedData = (() => {
        try {
            return cacheKey ? JSON.parse(localStorage.getItem(cacheKey) || 'null') : null;
        } catch {
            return null;
        }
    })();

    const [event, setEvent] = useState(cachedData?.event || null);

    const {
        mode: currentMode,
        isBoth: isBothMode,
        isVirtual: isVirtualMode,
        isPhysical: isPhysicalMode,
        showVirtual,
        showPhysical
    } = getTrackVisibility(
        event?.HackathonMode || admin?.HackathonMode,
        event?.Location || admin?.Location
    );

    const [usersCount, setUsersCount] = useState(cachedData?.usersCount ?? 0);
    const [teamsCount, setTeamsCount] = useState(cachedData?.teamsCount ?? 0);
    const [pendingCount, setPendingCount] = useState(cachedData?.pendingCount ?? 0);
    const [remainingDays, setRemainingDays] = useState(() => {
        if (cachedData?.event?.StartDate) {
            const startDate = new Date(cachedData.event.StartDate);
            const today = new Date();
            const difference = startDate - today;
            const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
            return Math.max(days, 0);
        }
        return 0;
    });

    const [recentRegistrations, setRecentRegistrations] = useState(cachedData?.recentRegistrations || []);
    const [recentActivities, setRecentActivities] = useState(cachedData?.recentActivities || []);

    const [loading, setLoading] = useState(!cachedData);
    const [error, setError] = useState("");

    const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);

    const [prizes, setPrizes] = useState([
        {
            name: "",
            amount: ""
        }
    ]);

    const [declaredPrizes, setDeclaredPrizes] = useState(cachedData?.declaredPrizes || []);
    const [activePrizeTab, setActivePrizeTab] = useState("Physical");
    const [modalPrizeTab, setModalPrizeTab] = useState("Physical");

    const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
    const [guidelinesLoading, setGuidelinesLoading] = useState(false);
    const [guidelinesActiveTab, setGuidelinesActiveTab] = useState("virtual");
    const [guidelinesData, setGuidelinesData] = useState({
        Description: "",
        VirtualFacilities: "",
        VirtualRequirements: "",
        PhysicalFacilities: "",
        PhysicalRequirements: "",
        Facilities: "",
        Requirements: ""
    });

    useEffect(() => {
        if (isVirtualMode) {
            setActivePrizeTab("Virtual");
            setModalPrizeTab("Virtual");
            setGuidelinesActiveTab("virtual");
        } else if (isPhysicalMode) {
            setActivePrizeTab("Physical");
            setModalPrizeTab("Physical");
            setGuidelinesActiveTab("physical");
        } else if (isBothMode) {
            setActivePrizeTab("Virtual");
            setModalPrizeTab("Virtual");
            setGuidelinesActiveTab("virtual");
        }
    }, [event?.HackathonMode, isVirtualMode, isPhysicalMode, isBothMode]);

    const openGuidelinesModal = () => {
        if (event) {
            setGuidelinesData({
                Description: event.Description || "",
                VirtualFacilities: event.VirtualFacilities || "",
                VirtualRequirements: event.VirtualRequirements || "",
                PhysicalFacilities: event.PhysicalFacilities || "",
                PhysicalRequirements: event.PhysicalRequirements || "",
                Facilities: event.Facilities || "",
                Requirements: event.Requirements || ""
            });
        }
        setIsGuidelinesModalOpen(true);
    };

    const handleSaveGuidelines = async (e) => {
        e.preventDefault();
        try {
            setGuidelinesLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/api/events/${eventId}/guidelines`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(guidelinesData)
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to update event guidelines");
            }

            setEvent((prev) => ({
                ...prev,
                ...guidelinesData
            }));

            setIsGuidelinesModalOpen(false);
            alert("Event guidelines saved successfully!");
        } catch (err) {
            console.error("SAVE GUIDELINES ERROR:", err);
            alert(err.message);
        } finally {
            setGuidelinesLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchDashboard();
        } else {
            setLoading(false);
            setError("No event assigned to this admin.");
        }

        const handleEventUpdated = () => {
            if (cacheKey) {
                try {
                    localStorage.removeItem(cacheKey);
                } catch (e) {}
            }
            if (eventId) {
                fetchDashboard();
            }
        };

        window.addEventListener('admin-event-updated', handleEventUpdated);
        return () => {
            window.removeEventListener('admin-event-updated', handleEventUpdated);
        };
    }, [eventId, cacheKey]);

    const fetchDashboard = async () => {
        try {
            if (!cachedData) {
                setLoading(true);
            }
            setError("");

            // Fast path: Fetch single consolidated summary endpoint (~190ms)
            try {
                const summaryRes = await fetch(`${API_BASE_URL}/api/events/${eventId}/dashboard-summary`);
                if (summaryRes.ok) {
                    const result = await summaryRes.json();
                    const data = result?.data;
                    if (data && data.event) {
                        setEvent(data.event);
                        try {
                            const curAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
                            if (data.event.HackathonMode && curAdmin.HackathonMode !== data.event.HackathonMode) {
                                curAdmin.HackathonMode = data.event.HackathonMode;
                                localStorage.setItem('admin', JSON.stringify(curAdmin));
                                window.dispatchEvent(new Event('admin-event-updated'));
                            }
                        } catch (e) {}

                        if (data.event.StartDate) {
                            const startDate = new Date(data.event.StartDate);
                            const today = new Date();
                            const difference = startDate - today;
                            const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
                            setRemainingDays(Math.max(days, 0));
                        }
                        setDeclaredPrizes(data.declaredPrizes || []);
                        setRecentRegistrations(data.recentRegistrations || []);
                        setRecentActivities(data.recentActivities || []);
                        setUsersCount(data.usersCount || 0);
                        setTeamsCount(data.teamsCount || 0);
                        setPendingCount(data.pendingCount || 0);
                        setLoading(false);

                        // Cache for instant 0ms subsequent renders
                        if (cacheKey) {
                            localStorage.setItem(cacheKey, JSON.stringify(data));
                        }
                        return;
                    }
                }
            } catch (summaryErr) {
                console.warn("Summary endpoint failed, falling back to parallel requests:", summaryErr);
            }

            // Fallback: parallel fetch all individual endpoints
            const [eventRes, prizesRes, regRes, actRes, countRes, teamsRes, pendingRes] = await Promise.allSettled([
                fetch(`${API_BASE_URL}/api/events/${eventId}`).then(r => r.ok ? r.json() : null),
                fetch(`${API_BASE_URL}/api/event_prizes/event/${eventId}`).then(r => r.ok ? r.json() : null),
                fetch(`${API_BASE_URL}/api/event_reg/recent`).then(r => r.ok ? r.json() : null),
                fetch(`${API_BASE_URL}/api/event_reg/activities`).then(r => r.ok ? r.json() : null),
                fetch(`${API_BASE_URL}/api/event_reg/event/${eventId}/count`).then(r => r.ok ? r.json() : null),
                fetch(`${API_BASE_URL}/api/teams/event/${eventId}/count`).then(r => r.ok ? r.json() : null),
                fetch(`${API_BASE_URL}/api/event_reg/event/${eventId}/pending-count`).then(r => r.ok ? r.json() : null)
            ]);

            if (eventRes.status === "fulfilled" && eventRes.value) {
                const currentEvent = eventRes.value.event || null;
                setEvent(currentEvent);
                if (currentEvent?.StartDate) {
                    const startDate = new Date(currentEvent.StartDate);
                    const today = new Date();
                    const difference = startDate - today;
                    const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
                    setRemainingDays(Math.max(days, 0));
                }
            }
            if (prizesRes.status === "fulfilled" && prizesRes.value) {
                setDeclaredPrizes(prizesRes.value.prizes || prizesRes.value.eventPrizes || []);
            }
            if (regRes.status === "fulfilled" && regRes.value) {
                setRecentRegistrations(regRes.value.registrations || regRes.value.recentRegistrations || []);
            }
            if (actRes.status === "fulfilled" && actRes.value) {
                setRecentActivities(actRes.value.activities || []);
            }
            if (countRes.status === "fulfilled" && countRes.value) {
                setUsersCount(countRes.value.count || 0);
            }
            if (teamsRes.status === "fulfilled" && teamsRes.value) {
                setTeamsCount(teamsRes.value.count || 0);
            }
            if (pendingRes.status === "fulfilled" && pendingRes.value) {
                setPendingCount(pendingRes.value.count || 0);
            }
            setLoading(false);
        } catch (error) {
            console.error("ADMIN DASHBOARD ERROR:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const openPrizeModal = () => {
        const isDual = isBothMode;
        const singleTrack = isVirtualMode ? "Virtual" : isPhysicalMode ? "Physical" : "Overall";
        setModalPrizeTab(isDual ? (activePrizeTab || "Virtual") : singleTrack);
        if (declaredPrizes && declaredPrizes.length > 0) {
            setPrizes(
                declaredPrizes.map((p, idx) => ({
                    name: p.Name || p.name || `Prize ${p.PrizeRank || idx + 1}`,
                    amount: String(p.Prize || p.prize || p.amount || ""),
                    track: isDual
                        ? (p.Track || p.track || "Virtual")
                        : singleTrack
                }))
            );
        } else {
            if (isDual) {
                setPrizes([
                    { name: "1st Prize", amount: "", track: 'Virtual' },
                    { name: "1st Prize", amount: "", track: 'Physical' }
                ]);
            } else {
                setPrizes([
                    { name: "1st Prize", amount: "", track: singleTrack }
                ]);
            }
        }
        setIsPrizeModalOpen(true);
    };

    const handlePrizeChange = (index, field, value) => {
        setPrizes((currentPrizes) =>
            currentPrizes.map((prize, prizeIndex) =>
                prizeIndex === index
                    ? {
                        ...prize,
                        [field]: value
                    }
                    : prize
            )
        );
    };

    const addPrize = (targetTrack) => {
        const isDual = isBothMode;
        const singleTrack = isVirtualMode ? "Virtual" : isPhysicalMode ? "Physical" : "Overall";
        const trackToUse = isDual
            ? (targetTrack || modalPrizeTab || "Virtual")
            : singleTrack;
        const trackCount = prizes.filter((p) => (p.track || '').toLowerCase() === trackToUse.toLowerCase()).length;
        setPrizes((currentPrizes) => [
            ...currentPrizes,
            {
                name: `Prize ${trackCount + 1}`,
                amount: "",
                track: trackToUse
            }
        ]);
    };

    const removePrize = (index) => {
        setPrizes((currentPrizes) =>
            currentPrizes.filter(
                (_, prizeIndex) => prizeIndex !== index
            )
        );
    };

    const handleDeclarePrizes = async (e) => {
        e.preventDefault();

        try {
            if (!eventId) {
                alert("No event assigned to this admin.");
                return;
            }

            const validPrizes = prizes.filter(
                (prize) =>
                    prize.name.trim() !== "" &&
                    prize.amount !== ""
            );

            if (validPrizes.length === 0) {
                alert("Please add at least one prize with a name and amount.");
                return;
            }

            const trackRankCounters = {};
            const payload = {
                prizes: validPrizes.map((prize) => {
                    const trk = prize.track || 'Overall';
                    trackRankCounters[trk] = (trackRankCounters[trk] || 0) + 1;
                    return {
                        prizeRank: trackRankCounters[trk],
                        prize: prize.amount,
                        track: trk
                    };
                })
            };

            const response = await fetch(
                `${API_BASE_URL}/api/event_prizes/event/${eventId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to declare prizes"
                );
            }

            const prizeResponse = await fetch(
                `${API_BASE_URL}/api/event_prizes/event/${eventId}`
            );

            if (prizeResponse.ok) {
                const prizeData = await prizeResponse.json();
                setDeclaredPrizes(
                    prizeData.prizes ||
                    prizeData.eventPrizes ||
                    []
                );
            }

            // Also reload event data to update track pools on the dashboard immediately
            const evRes = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
            if (evRes.ok) {
                const evData = await evRes.json();
                const refreshed = evData.event || evData;
                setEvent(refreshed);
            }

            setIsPrizeModalOpen(false);
            alert("Prizes declared successfully.");

        } catch (error) {
            console.error("DECLARE PRIZE ERROR:", error);
            alert(error.message);
        }
    };

    const getPrizeAmount = (prize) => {
        return (
            prize.Prize ||
            prize.prize ||
            prize.amount ||
            "0"
        );
    };

    const getPrizeRank = (prize, index) => {
        return (
            prize.PrizeRank ||
            prize.prizeRank ||
            index + 1
        );
    };

    const getRegistrationName = (registration) => {
        return (
            registration.TeamName ||
            registration.teamName ||
            registration.UserName ||
            registration.userName ||
            registration.Name ||
            registration.name ||
            "Registration"
        );
    };

    const getLeaderName = (registration) => {
        return (
            registration.LeaderName ||
            registration.leaderName ||
            registration.UserName ||
            registration.userName ||
            registration.Email ||
            registration.email ||
            "User"
        );
    };

    const getRegistrationStatus = (registration) => {
        return (
            registration.status ||
            registration.Status ||
            "Pending"
        );
    };

    const getActivityName = (activity) => {
        return (
            activity.TeamName ||
            activity.teamName ||
            activity.UserName ||
            activity.userName ||
            activity.Name ||
            activity.name ||
            "Registration"
        );
    };

    const getActivityLeader = (activity) => {
        return (
            activity.LeaderName ||
            activity.leaderName ||
            activity.UserName ||
            activity.userName ||
            activity.Email ||
            activity.email ||
            "User"
        );
    };

    const getActivityStatus = (activity) => {
        return (
            activity.Status ||
            activity.status ||
            "pending"
        );
    };

    const getActivityDate = (activity) => {
        return (
            activity.CreatedAt ||
            activity.createdAt ||
            activity.ActivityDate ||
            activity.activityDate ||
            activity.Date ||
            activity.date
        );
    };

    const stats = [
        {
            title: "Total Registrations",
            value: usersCount,
            icon: Users
        },
        {
            title: "Total Teams",
            value: teamsCount,
            icon: UsersRound
        },
        {
            title: "Pending Approvals",
            value: pendingCount,
            icon: ClipboardList
        },
        {
            title: "Remaining Days",
            value: remainingDays,
            icon: Clock
        }
    ];



    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-5">
                <div className="bg-white dark:bg-black border border-red-200 dark:border-red-900 rounded-xl p-6 text-center max-w-md w-full">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />

                    <h2 className="text-lg font-semibold mt-3 text-gray-900 dark:text-white">
                        Unable to load dashboard
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-5 px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="min-h-screen bg-gray-50 dark:bg-black transition-colors"
        >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 pt-5 sm:px-6 md:px-8">

                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>

                    <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
                        Overview of your assigned event
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={openGuidelinesModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 dark:border-zinc-800 bg-emerald-50 dark:bg-black px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-zinc-900 transition shadow-sm"
                    >
                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Manage Guidelines
                    </button>

                    <button
                        type="button"
                        onClick={openPrizeModal}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 transition shadow-sm"
                    >
                        <Trophy className="h-4 w-4" />
                        {declaredPrizes.length > 0 ? "Edit Prize Money" : "Add Prize Money"}
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-6">

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

                    {stats.map((stat, index) => {
                        const Icon = stat.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.06 }}
                                whileHover={{ y: -3 }}
                                className="bg-white dark:bg-black rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-zinc-800 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-3">

                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {stat.title}
                                        </p>

                                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                                        <Icon className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })}

                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.2 }}
                    className="bg-white dark:bg-black rounded-xl border border-emerald-700 dark:border-emerald-500 shadow-sm overflow-hidden"
                >

                    <div className="p-5 sm:p-6">

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                            <div>
                                <p className="text-sm text-emerald-700 dark:text-emerald-500 font-medium">
                                    Assigned Event
                                </p>

                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {event?.EventName || "Event"}
                                </h2>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
                                    {event?.Description || "No event description available."}
                                </p>
                            </div>

                            <span className="w-fit capitalize px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                                {event?.status || "upcoming"}
                            </span>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">

                            <div className="flex gap-3">
                                <CalendarDays className="w-5 h-5 text-emerald-700 dark:text-emerald-500 shrink-0" />

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Event Dates
                                    </p>

                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                        {formatDate(event?.StartDate)}
                                    </p>

                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        to {formatDate(event?.EndDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-500 shrink-0" />

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Location
                                    </p>

                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                        {event?.Location || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Timer className="w-5 h-5 text-emerald-700 dark:text-emerald-500 shrink-0" />

                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Remaining
                                    </p>

                                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                        {remainingDays} Days
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        Event Guidelines, Facilities & Requirements
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Curated by you as the assigned Event Admin
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={openGuidelinesModal}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition cursor-pointer"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Edit Guidelines
                                </button>
                            </div>

                            {isBothMode ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-zinc-800 bg-emerald-50/30 dark:bg-black space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>Virtual Track</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Facilities Provided:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black p-2.5 rounded-lg border border-emerald-100/60 dark:border-zinc-800">
                                                {event?.VirtualFacilities || event?.Facilities || "No virtual facilities added yet."}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black p-2.5 rounded-lg border border-emerald-100/60 dark:border-zinc-800">
                                                {event?.VirtualRequirements || event?.Requirements || "No virtual requirements added yet."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-zinc-800 bg-emerald-50/30 dark:bg-black space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>Physical / On-Campus Track</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Facilities Provided:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black p-2.5 rounded-lg border border-emerald-100/60 dark:border-zinc-800">
                                                {event?.PhysicalFacilities || event?.Facilities || "No physical facilities added yet."}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black p-2.5 rounded-lg border border-emerald-100/60 dark:border-zinc-800">
                                                {event?.PhysicalRequirements || event?.Requirements || "No physical requirements added yet."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-black">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Facilities Provided:</p>
                                        <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line">
                                            {isVirtualMode
                                                ? (event?.VirtualFacilities || event?.Facilities || "No virtual facilities added yet.")
                                                : (event?.PhysicalFacilities || event?.Facilities || "No physical facilities added yet.")}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-black">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                        <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line">
                                            {isVirtualMode
                                                ? (event?.VirtualRequirements || event?.Requirements || "No virtual requirements added yet.")
                                                : (event?.PhysicalRequirements || event?.Requirements || "No physical requirements added yet.")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </motion.div>

                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                    className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-gray-100 dark:border-gray-800/80 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    Prize Money & Rewards
                                </h2>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Configure and declare prize money for {event?.EventName}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={openPrizeModal}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-sm"
                        >
                            <Edit3 className="w-4 h-4" />
                            {declaredPrizes.length > 0 ? "Edit Prize Money" : "Add Prize Money"}
                        </button>
                    </div>

                    {(() => {
                        const physicalPrizesList = declaredPrizes.filter((p) => (p.Track || '').toLowerCase() === 'physical');
                        const virtualPrizesList = declaredPrizes.filter((p) => (p.Track || '').toLowerCase() === 'virtual');
                        const overallPrizesList = declaredPrizes.filter((p) => (p.Track || '').toLowerCase() === 'overall' || !p.Track);

                        const isDualTrackEvent = isBothMode;

                        const currentTrackPrizes = isDualTrackEvent
                            ? (activePrizeTab === 'Virtual'
                                ? (virtualPrizesList.length > 0 ? virtualPrizesList : overallPrizesList)
                                : (physicalPrizesList.length > 0 ? physicalPrizesList : overallPrizesList))
                            : declaredPrizes;

                        const firstPrizeObj = currentTrackPrizes.find((p) => Number(p.PrizeRank) === 1) || (currentTrackPrizes.length > 0 ? currentTrackPrizes[0] : null);
                        const secondPrizeObj = currentTrackPrizes.find((p) => Number(p.PrizeRank) === 2) || (currentTrackPrizes.length > 1 && currentTrackPrizes[1] !== firstPrizeObj ? currentTrackPrizes[1] : null);
                        const thirdPrizeObj = currentTrackPrizes.find((p) => Number(p.PrizeRank) === 3) || (currentTrackPrizes.length > 2 && currentTrackPrizes[2] !== firstPrizeObj && currentTrackPrizes[2] !== secondPrizeObj ? currentTrackPrizes[2] : null);

                        const formatPrizeText = (val, fallback) => {
                            if (!val) return fallback;
                            const str = String(val).trim();
                            const num = Number(str.replace(/[^0-9.-]+/g, ''));
                            if (!isNaN(num) && num > 0) {
                                return `₹${num.toLocaleString('en-IN')}`;
                            }
                            return str;
                        };

                        const activeTrackPool = isDualTrackEvent
                            ? (activePrizeTab === 'Virtual' ? (event?.VirtualPrizeMoney || event?.PrizeMoney) : (event?.PhysicalPrizeMoney || event?.PrizeMoney))
                            : isVirtualMode
                                ? (event?.VirtualPrizeMoney || event?.PrizeMoney)
                                : isPhysicalMode
                                    ? (event?.PhysicalPrizeMoney || event?.PrizeMoney)
                                    : event?.PrizeMoney;

                        const firstPrizeAmount = formatPrizeText(firstPrizeObj?.Prize || (currentTrackPrizes.length === 0 ? activeTrackPool : null), activePrizeTab === 'Virtual' ? 'Virtual Champion' : 'Grand Champion');
                        const secondPrizeAmount = formatPrizeText(secondPrizeObj?.Prize, 'Runner Up');
                        const thirdPrizeAmount = formatPrizeText(thirdPrizeObj?.Prize, 'Second Runner Up');

                        const isVirtualPrizeTrack = isDualTrackEvent
                            ? activePrizeTab === 'Virtual'
                            : isVirtualMode;

                        const firstPrizeDesc = isVirtualPrizeTrack
                            ? 'Virtual Grand Champion • Gold Trophy & Direct Incubation'
                            : 'On-Campus Grand Champion • Gold Trophy & Incubation';

                        const secondPrizeDesc = isVirtualPrizeTrack
                            ? 'Virtual First Runner Up • Silver Trophy & Cloud Credits'
                            : 'On-Campus First Runner Up • Silver Trophy & Mentorship';

                        const thirdPrizeDesc = isVirtualPrizeTrack
                            ? 'Virtual Second Runner Up • Bronze Shield & Certificates'
                            : 'On-Campus Second Runner Up • Bronze Shield & Swag';

                        const firstPrizeTrack = isDualTrackEvent ? activePrizeTab : (firstPrizeObj?.Track || null);
                        const secondPrizeTrack = isDualTrackEvent ? activePrizeTab : (secondPrizeObj?.Track || null);
                        const thirdPrizeTrack = isDualTrackEvent ? activePrizeTab : (thirdPrizeObj?.Track || null);

                        const additionalPrizes = currentTrackPrizes.filter((p) => p !== firstPrizeObj && p !== secondPrizeObj && p !== thirdPrizeObj);

                        return (
                            <div className="space-y-0">
                                {/* Track Tabs for Dual Track Hackathons matching Event Details Page */}
                                {isBothMode && (
                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10 -mb-px">
                                        <div className="flex items-end gap-2 overflow-x-auto">
                                            {[
                                                { key: 'Virtual', label: `Virtual Track (${virtualPrizesList.length})`, icon: Globe },
                                                { key: 'Physical', label: `On-Campus Track (${physicalPrizesList.length})`, icon: MapPin },
                                            ].map((tab) => {
                                                const isActive = activePrizeTab === tab.key;
                                                const IconComp = tab.icon;
                                                return (
                                                    <button
                                                        key={tab.key}
                                                        type="button"
                                                        onClick={() => setActivePrizeTab(tab.key)}
                                                        className="relative h-11 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none"
                                                    >
                                                        {isActive ? (
                                                            <motion.div
                                                                layoutId="adminPrizeTabActive"
                                                                className="absolute inset-0 -bottom-[2px] rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                                                                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                                            >
                                                                {/* Seamless bottom mask */}
                                                                <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-30" />
                                                            </motion.div>
                                                        ) : (
                                                            <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-zinc-800 z-0" />
                                                        )}

                                                        <span className={`relative z-20 flex items-center gap-2 ${
                                                            isActive
                                                                ? 'text-slate-900 dark:text-white'
                                                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                                                        }`}>
                                                            <IconComp className="h-4 w-4" />
                                                            <span>{tab.label}</span>
                                                            {isActive && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {activeTrackPool && (
                                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold self-start sm:self-auto mb-2">
                                                <Trophy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span>{activePrizeTab} Pool: {activeTrackPool}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentTrackPrizes.length > 0 || activeTrackPool ? (
                                    <div>
                                        {/* Podium Component from Event Details Page */}
                                        <div className={`p-4 sm:p-6 rounded-2xl ${isDualTrackEvent ? 'rounded-tl-none' : ''} bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-xs relative z-0`}>
                                            <PrizePodiumStage
                                                firstAmount={firstPrizeAmount}
                                                firstDesc={firstPrizeDesc}
                                                secondAmount={secondPrizeAmount}
                                                secondDesc={secondPrizeDesc}
                                                thirdAmount={thirdPrizeAmount}
                                                thirdDesc={thirdPrizeDesc}
                                            />
                                        </div>

                                        {/* Additional Rank Prizes / Special Recognitions */}
                                        {additionalPrizes.length > 0 && (
                                            <div className="space-y-3 mt-6">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                                    Special Recognitions & Track Awards ({activePrizeTab} Track)
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    {additionalPrizes.map((pz, idx) => (
                                                        <div
                                                            key={pz.Id || pz.id || idx}
                                                            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-black flex items-center justify-between gap-3 shadow-xs"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-black dark:border dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                                                                    <Medal className="h-4 w-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                                        {pz.PrizeRank ? `Rank #${pz.PrizeRank}` : (pz.Name || 'Special Award')}
                                                                    </div>
                                                                    {pz.Track && (
                                                                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                                                                            {pz.Track} Track
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                                                                {formatPrizeText(pz.Prize, pz.Prize)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-8 text-center bg-gray-50/50 dark:bg-black">
                                        <Trophy className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            No prize money declared for {activePrizeTab} track yet
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                            Click "Edit Prize Money" above to declare prizes for this track.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={openPrizeModal}
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 px-4 py-2 text-xs font-semibold transition cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Add Prize Money for {activePrizeTab}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </motion.section>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 }}
                    className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                >

                    <div className="bg-white dark:bg-black rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm">

                        <div className="flex items-center justify-between mb-5">

                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                    Recent Registrations
                                </h2>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Latest registrations for this event
                                </p>
                            </div>

                            <UsersRound className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />

                        </div>

                        {recentRegistrations.length === 0 ? (
                            <div className="py-10 text-center">

                                <Users className="w-8 h-8 mx-auto text-gray-400" />

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    No registrations yet
                                </p>

                            </div>
                        ) : (
                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>
                                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">

                                            <th className="pb-3 font-medium">
                                                Team / User
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Leader
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Status
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {recentRegistrations.slice(0, 5).map((registration, index) => {

                                            const status = getRegistrationStatus(registration);

                                            return (
                                                <tr
                                                    key={registration.Id || registration.id || index}
                                                    className="border-b border-gray-100 dark:border-zinc-800/60"
                                                >

                                                    <td className="py-3 font-medium text-gray-900 dark:text-white">
                                                        {getRegistrationName(registration)}
                                                    </td>

                                                    <td className="py-3 text-gray-600 dark:text-gray-300">
                                                        {getLeaderName(registration)}
                                                    </td>

                                                    <td className="py-3">

                                                        <span
                                                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                status.toLowerCase() === "approved"
                                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500"
                                                                    : status.toLowerCase() === "rejected"
                                                                        ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500"
                                                            }`}
                                                        >
                                                            {status}
                                                        </span>

                                                    </td>

                                                </tr>
                                            );
                                        })}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    <div className="bg-white dark:bg-black rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm">

                        <div className="flex items-center justify-between mb-5">

                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                    Recent Activities
                                </h2>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Latest activity in your event
                                </p>
                            </div>

                            <Activity className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />

                        </div>

                        {recentActivities.length === 0 ? (
                            <div className="py-10 text-center">

                                <Activity className="w-8 h-8 mx-auto text-gray-400" />

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    No recent activities
                                </p>

                            </div>
                        ) : (
                            <div className="space-y-4">

                                {recentActivities.slice(0, 5).map((activity, index) => {

                                    const status = getActivityStatus(activity);

                                    return (
                                        <div
                                            key={activity.Id || activity.id || index}
                                            className="flex items-start gap-3"
                                        >

                                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">

                                                {status.toLowerCase() === "approved" ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                                ) : (
                                                    <UserPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                                                )}

                                            </div>

                                            <div className="min-w-0 flex-1">

                                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                    New registration from{" "}
                                                    {getActivityName(activity)}
                                                </p>

                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Leader: {getActivityLeader(activity)}
                                                </p>

                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">

                                                    <Clock className="w-3 h-3" />

                                                    {getActivityDate(activity)
                                                        ? formatTime(getActivityDate(activity))
                                                        : "Recently"}

                                                </div>

                                            </div>

                                            <span
                                                className={`text-[10px] px-2 py-1 rounded-full ${
                                                    status.toLowerCase() === "approved"
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500"
                                                        : status.toLowerCase() === "rejected"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500"
                                                }`}
                                            >
                                                {status}
                                            </span>

                                        </div>
                                    );
                                })}

                            </div>
                        )}

                    </div>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.35 }}
                    className="bg-white dark:bg-black rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 shadow-sm"
                >

                    <div className="flex items-center justify-between mb-5">

                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                Event Information
                            </h2>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Details of your assigned event
                            </p>
                        </div>

                        <CalendarDays className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Event Name
                            </p>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {event?.EventName || "Not available"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Event Type
                            </p>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {event?.EventType || "Not available"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Location
                            </p>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {event?.Location || "Not available"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Registration Start
                            </p>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {formatDate(event?.RegistrationStart)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Registration End
                            </p>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {formatDate(event?.RegistrationEnd)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Event Status
                            </p>

                            <p className="text-sm font-medium capitalize text-emerald-700 dark:text-emerald-500 mt-1">
                                {event?.status || "Upcoming"}
                            </p>
                        </div>

                    </div>

                </motion.div>

            </div>

            {isPrizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6 py-4 bg-white dark:bg-black shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {declaredPrizes.length > 0 ? "Edit Prize Money" : "Add Prize Money"}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                    Configure prizes separately for Virtual and Physical tracks for {event?.EventName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPrizeModalOpen(false)}
                                className="rounded-xl p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Track Tabs & Content */}
                        {(() => {
                            const isDual = isBothMode;

                            const physicalPrizes = prizes
                                .map((prize, originalIndex) => ({ ...prize, originalIndex }))
                                .filter(p => (p.track || '').toLowerCase() === 'physical');

                            const virtualPrizes = prizes
                                .map((prize, originalIndex) => ({ ...prize, originalIndex }))
                                .filter(p => (p.track || '').toLowerCase() === 'virtual');

                            const physicalTotal = physicalPrizes.reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/[^0-9.]/g, '')) || 0), 0);
                            const virtualTotal = virtualPrizes.reduce((sum, p) => sum + (parseFloat(String(p.amount).replace(/[^0-9.]/g, '')) || 0), 0);

                            const currentTrackPrizes = isDual
                                ? (modalPrizeTab.toLowerCase() === 'virtual' ? virtualPrizes : physicalPrizes)
                                : prizes.map((prize, originalIndex) => ({ ...prize, originalIndex }));

                            const currentTrackTotal = modalPrizeTab.toLowerCase() === 'virtual'
                                ? virtualTotal
                                : physicalTotal;

                            return (
                                <>
                                    {isDual && (
                                        <div className="px-6 pt-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-950/60 shrink-0">
                                            <div className="flex items-center gap-2">
                                                {[
                                                    { id: 'Physical', label: 'Physical Track', icon: MapPin, count: physicalPrizes.length, total: physicalTotal },
                                                    { id: 'Virtual', label: 'Virtual Track', icon: Globe, count: virtualPrizes.length, total: virtualTotal }
                                                ].map((tab) => {
                                                    const isActive = modalPrizeTab.toLowerCase() === tab.id.toLowerCase();
                                                    const TabIcon = tab.icon;
                                                    return (
                                                        <button
                                                            key={tab.id}
                                                            type="button"
                                                            onClick={() => setModalPrizeTab(tab.id)}
                                                            className={`relative pb-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer border-b-2 outline-none ${
                                                                isActive
                                                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                                                    : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                                                            }`}
                                                        >
                                                            <TabIcon className="w-4 h-4" />
                                                            <span>{tab.label}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                                                isActive
                                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                                                                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                                                            }`}>
                                                                {tab.count}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Modal Body / Scrollable Content */}
                                    <form
                                        onSubmit={handleDeclarePrizes}
                                        className="flex-1 overflow-y-auto p-6 space-y-4"
                                    >
                                        {/* Active Track Header Banner */}
                                        {isDual && (
                                            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        {modalPrizeTab.toLowerCase() === 'virtual' ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {modalPrizeTab} Track Prizes Setup
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                                                            Configure ranked awards exclusively for {modalPrizeTab} participants
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">
                                                        Track Total
                                                    </span>
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                        ₹{currentTrackTotal.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* List of Prizes for Current Track */}
                                        <div className="space-y-3">
                                            {currentTrackPrizes.length === 0 ? (
                                                <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                                                    <Trophy className="w-8 h-8 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
                                                    <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                                                        No prizes configured for {modalPrizeTab} Track yet.
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-1">
                                                        Click "+ Add {modalPrizeTab} Prize" below to create one.
                                                    </p>
                                                </div>
                                            ) : (
                                                currentTrackPrizes.map((item, cardIdx) => (
                                                    <div
                                                        key={item.originalIndex}
                                                        className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-4 space-y-3 shadow-xs"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center justify-center">
                                                                    #{cardIdx + 1}
                                                                </span>
                                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                                    {isDual ? `${modalPrizeTab} Track` : ''} Prize {cardIdx + 1}
                                                                </span>
                                                            </div>

                                                            {prizes.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePrize(item.originalIndex)}
                                                                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition cursor-pointer"
                                                                    title="Remove prize"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                                                                    Prize Title
                                                                </label>
                                                                <input
                                                                    value={item.name}
                                                                    onChange={(e) =>
                                                                        handlePrizeChange(
                                                                            item.originalIndex,
                                                                            "name",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder={cardIdx === 0 ? "1st Prize / Champion" : cardIdx === 1 ? "2nd Prize / Runner Up" : "3rd Prize"}
                                                                    required
                                                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300">
                                                                    Prize Money (₹)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.amount}
                                                                    onChange={(e) =>
                                                                        handlePrizeChange(
                                                                            item.originalIndex,
                                                                            "amount",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="e.g. 50000"
                                                                    required
                                                                    className="w-full rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black px-3.5 py-2.5 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => addPrize(modalPrizeTab)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 transition cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add {isDual ? `${modalPrizeTab} Prize` : 'Another Prize'}</span>
                                        </button>

                                        {/* Footer Summary & Action Buttons */}
                                        <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            {isDual ? (
                                                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                                                    <span>Physical: <strong className="text-gray-700 dark:text-zinc-200">₹{physicalTotal.toLocaleString('en-IN')}</strong></span>
                                                    <span className="mx-2">•</span>
                                                    <span>Virtual: <strong className="text-gray-700 dark:text-zinc-200">₹{virtualTotal.toLocaleString('en-IN')}</strong></span>
                                                    <span className="mx-2">•</span>
                                                    <span>Total: <strong className="text-emerald-600 dark:text-emerald-400">₹{(physicalTotal + virtualTotal).toLocaleString('en-IN')}</strong></span>
                                                </div>
                                            ) : <div />}

                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPrizeModalOpen(false)}
                                                    className="rounded-xl border border-gray-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="rounded-xl bg-emerald-700 dark:bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 transition shadow-sm cursor-pointer"
                                                >
                                                    {declaredPrizes.length > 0 ? "Update Prizes" : "Declare Prizes"}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {isGuidelinesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Event Guidelines Studio
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Manage Description, Facilities & Requirements for {event?.EventName}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsGuidelinesModalOpen(false)}
                                className="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveGuidelines} className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                    Event Description & Overview
                                </label>
                                <textarea
                                    rows="4"
                                    value={guidelinesData.Description}
                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, Description: e.target.value }))}
                                    placeholder="Provide a comprehensive description of the event, themes, eligibility, and expected outcomes..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    This description is stored in the dedicated event_descriptions table and displayed across participant views.
                                </p>
                            </div>

                            {isBothMode ? (
                                <div className="space-y-4">
                                    <div className="flex items-end gap-2 overflow-x-auto border-b border-gray-200 dark:border-zinc-800 -mb-[1px]">
                                        {[
                                            { key: 'virtual', label: 'Virtual Phase Guidelines', icon: Globe },
                                            { key: 'physical', label: 'Physical Phase Guidelines', icon: Building2 },
                                        ].map((tab) => {
                                            const isActive = guidelinesActiveTab === tab.key;
                                            const IconComp = tab.icon;
                                            return (
                                                <button
                                                    key={tab.key}
                                                    type="button"
                                                    onClick={() => setGuidelinesActiveTab(tab.key)}
                                                    className="relative h-10 px-5 rounded-t-xl font-bold text-xs tracking-wide flex items-center gap-2 transition-colors duration-200 outline-none"
                                                >
                                                    {isActive ? (
                                                        <motion.div
                                                            layoutId="guidelinesTabActive"
                                                            className="absolute inset-0 rounded-t-xl bg-white dark:bg-black border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10"
                                                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 rounded-t-xl bg-slate-100 dark:bg-black border border-slate-200 dark:border-zinc-800 z-0" />
                                                    )}

                                                    <span className={`relative z-20 flex items-center gap-2 ${
                                                        isActive
                                                            ? 'text-slate-900 dark:text-white'
                                                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                                                    }`}>
                                                        <IconComp className="h-4 w-4" />
                                                        <span>{tab.label}</span>
                                                        {isActive && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {guidelinesActiveTab === 'virtual' && (
                                        <div className="p-4 rounded-xl border border-emerald-100 dark:border-zinc-800 bg-emerald-50/20 dark:bg-black space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1.5">
                                                    Virtual Facilities Provided (One per line)
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    value={guidelinesData.VirtualFacilities}
                                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, VirtualFacilities: e.target.value }))}
                                                    placeholder="Discord Server 24/7&#10;Cloud Credits & APIs&#10;Online Mentor Support"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1.5">
                                                    Virtual Requirements (One per line)
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    value={guidelinesData.VirtualRequirements}
                                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, VirtualRequirements: e.target.value }))}
                                                    placeholder="Webcam & Microphone&#10;High Speed Internet&#10;Active GitHub Account"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {guidelinesActiveTab === 'physical' && (
                                        <div className="p-4 rounded-xl border border-emerald-100 dark:border-zinc-800 bg-emerald-50/20 dark:bg-black space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1.5">
                                                    Physical Phase Facilities (One per line)
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    value={guidelinesData.PhysicalFacilities}
                                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, PhysicalFacilities: e.target.value }))}
                                                    placeholder="Campus Wi-Fi 6&#10;Catered Meals & Refreshments&#10;Overnight Rest Lounge"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1.5">
                                                    Physical Phase Requirements (One per line)
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    value={guidelinesData.PhysicalRequirements}
                                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, PhysicalRequirements: e.target.value }))}
                                                    placeholder="Bring Laptop & Charger&#10;Valid College ID Card&#10;In-Person Check-in"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-zinc-800 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                            {isVirtualMode ? 'Virtual Facilities (One per line)' : 'Facilities Provided (One per line)'}
                                        </label>
                                        <textarea
                                            rows="5"
                                            value={isVirtualMode ? (guidelinesData.VirtualFacilities || guidelinesData.Facilities) : guidelinesData.Facilities}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGuidelinesData((prev) => ({
                                                    ...prev,
                                                    Facilities: val,
                                                    VirtualFacilities: isVirtualMode ? val : prev.VirtualFacilities,
                                                    PhysicalFacilities: isPhysicalMode ? val : prev.PhysicalFacilities
                                                }));
                                            }}
                                            placeholder="High speed Wi-Fi&#10;Refreshments&#10;Mentorship"
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                            {isVirtualMode ? 'Virtual Requirements (One per line)' : 'Participant Requirements (One per line)'}
                                        </label>
                                        <textarea
                                            rows="5"
                                            value={isVirtualMode ? (guidelinesData.VirtualRequirements || guidelinesData.Requirements) : guidelinesData.Requirements}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGuidelinesData((prev) => ({
                                                    ...prev,
                                                    Requirements: val,
                                                    VirtualRequirements: isVirtualMode ? val : prev.VirtualRequirements,
                                                    PhysicalRequirements: isPhysicalMode ? val : prev.PhysicalRequirements
                                                }));
                                            }}
                                            placeholder="Bring personal laptop&#10;College ID card&#10;GitHub account"
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsGuidelinesModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={guidelinesLoading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 text-xs sm:text-sm font-semibold text-white transition disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {guidelinesLoading ? 'Saving...' : 'Save Guidelines'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </motion.div>
    );
}

export default AdminDashboard;