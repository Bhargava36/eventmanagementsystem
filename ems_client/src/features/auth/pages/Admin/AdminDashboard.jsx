import React, { useEffect, useState } from "react";
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
    Edit3
} from "lucide-react";

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

    const [event, setEvent] = useState(null);

    const [usersCount, setUsersCount] = useState(0);
    const [teamsCount, setTeamsCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [remainingDays, setRemainingDays] = useState(0);

    const [recentRegistrations, setRecentRegistrations] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);

    const [prizes, setPrizes] = useState([
        {
            name: "",
            amount: ""
        }
    ]);

    const [declaredPrizes, setDeclaredPrizes] = useState([]);

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
                `http://localhost:3000/api/events/${eventId}/guidelines`,
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
    }, [eventId]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const eventResponse = await fetch(
                `http://localhost:3000/api/events/${eventId}`
            );

            if (!eventResponse.ok) {
                throw new Error("Failed to fetch event");
            }

            const eventData = await eventResponse.json();
            const currentEvent = eventData.event || null;
            setEvent(currentEvent);

            if (currentEvent?.StartDate) {
                const startDate = new Date(currentEvent.StartDate);
                const today = new Date();
                const difference = startDate - today;
                const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
                setRemainingDays(Math.max(days, 0));
            } else {
                setRemainingDays(0);
            }

            setLoading(false);

            Promise.allSettled([
                fetch(`http://localhost:3000/api/event_prizes/event/${eventId}`).then(r => r.ok ? r.json() : null),
                fetch(`http://localhost:3000/api/event_reg/recent`).then(r => r.ok ? r.json() : null),
                fetch(`http://localhost:3000/api/event_reg/activities`).then(r => r.ok ? r.json() : null),
                fetch(`http://localhost:3000/api/event_reg/event/${eventId}/count`).then(r => r.ok ? r.json() : null),
                fetch(`http://localhost:3000/api/teams/event/${eventId}/count`).then(r => r.ok ? r.json() : null),
                fetch(`http://localhost:3000/api/event_reg/event/${eventId}/pending-count`).then(r => r.ok ? r.json() : null)
            ]).then(([prizesRes, registrationsRes, activitiesRes, usersRes, teamsRes, pendingRes]) => {
                if (prizesRes.status === "fulfilled" && prizesRes.value) {
                    setDeclaredPrizes(prizesRes.value.prizes || prizesRes.value.eventPrizes || []);
                }
                if (registrationsRes.status === "fulfilled" && registrationsRes.value) {
                    setRecentRegistrations(registrationsRes.value.registrations || registrationsRes.value.recentRegistrations || []);
                }
                if (activitiesRes.status === "fulfilled" && activitiesRes.value) {
                    setRecentActivities(activitiesRes.value.activities || []);
                }
                if (usersRes.status === "fulfilled" && usersRes.value) {
                    setUsersCount(usersRes.value.count || 0);
                }
                if (teamsRes.status === "fulfilled" && teamsRes.value) {
                    setTeamsCount(teamsRes.value.count || 0);
                }
                if (pendingRes.status === "fulfilled" && pendingRes.value) {
                    setPendingCount(pendingRes.value.count || 0);
                }
            });

        } catch (error) {
            console.error("ADMIN DASHBOARD ERROR:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const openPrizeModal = () => {
        if (declaredPrizes && declaredPrizes.length > 0) {
            setPrizes(
                declaredPrizes.map((p, idx) => ({
                    name: p.Name || p.name || `Prize ${p.PrizeRank || idx + 1}`,
                    amount: String(p.Prize || p.prize || p.amount || "")
                }))
            );
        } else {
            setPrizes([
                {
                    name: "1st Prize",
                    amount: ""
                }
            ]);
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

    const addPrize = () => {
        setPrizes((currentPrizes) => [
            ...currentPrizes,
            {
                name: "",
                amount: ""
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
                alert("Please add at least one prize.");
                return;
            }

            const payload = {
                prizes: validPrizes.map((prize, index) => ({
                    prizeRank: index + 1,
                    prize: prize.amount
                }))
            };

            const response = await fetch(
                `http://localhost:3000/api/event_prizes/event/${eventId}`,
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
                `http://localhost:3000/api/event_prizes/event/${eventId}`
            );

            if (prizeResponse.ok) {
                const prizeData = await prizeResponse.json();

                setDeclaredPrizes(
                    prizeData.prizes ||
                    prizeData.eventPrizes ||
                    []
                );
            }

            setPrizes([
                {
                    name: "",
                    amount: ""
                }
            ]);

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
                <div className="bg-white dark:bg-gray-950 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center max-w-md w-full">
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
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-sm"
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
                                className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
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
                    className="bg-white dark:bg-gray-950 rounded-xl border border-emerald-700 dark:border-emerald-500 shadow-sm overflow-hidden"
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

                            {event?.HackathonMode === 'Both' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>Virtual Track</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Facilities Provided:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                                                {event?.VirtualFacilities || event?.Facilities || "No virtual facilities added yet."}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                                                {event?.VirtualRequirements || event?.Requirements || "No virtual requirements added yet."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span>Physical / On-Campus Track</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Facilities Provided:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                                                {event?.PhysicalFacilities || event?.Facilities || "No physical facilities added yet."}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line bg-white/60 dark:bg-black/30 p-2.5 rounded-lg border border-emerald-100/60 dark:border-emerald-900/30">
                                                {event?.PhysicalRequirements || event?.Requirements || "No physical requirements added yet."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Facilities Provided:</p>
                                        <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line">
                                            {event?.Facilities || event?.VirtualFacilities || event?.PhysicalFacilities || "No facilities added yet."}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Requirements:</p>
                                        <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-line">
                                            {event?.Requirements || event?.VirtualRequirements || event?.PhysicalRequirements || "No requirements added yet."}
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
                    className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6 shadow-sm"
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

                    {declaredPrizes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {declaredPrizes.map((prize, index) => (
                                <div
                                    key={prize.Id || prize.id || index}
                                    className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-5 dark:border-emerald-500/20 dark:bg-gray-900/40"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                            Rank #{getPrizeRank(prize, index)}
                                        </span>
                                        <Trophy className="w-4 h-4 text-emerald-500/70" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-2">
                                        {prize.Name ||
                                            prize.name ||
                                            `Prize ${getPrizeRank(prize, index)}`}
                                    </h3>
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-3">
                                        ₹ {Number(
                                            getPrizeAmount(prize)
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center bg-gray-50/50 dark:bg-gray-900/20">
                            <Trophy className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                No prize money declared yet
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                                Set up the prize pool for winners of this hackathon to attract top talent and teams.
                            </p>
                            <button
                                type="button"
                                onClick={openPrizeModal}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600 px-4 py-2 text-xs font-semibold transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add Prize Money Now
                            </button>
                        </div>
                    )}
                </motion.section>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.3 }}
                    className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                >

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">

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
                                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">

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
                                                    className="border-b border-gray-100 dark:border-gray-800/50"
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

                    <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">

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
                    className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
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

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-emerald-700/20 bg-white dark:bg-gray-950 shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {declaredPrizes.length > 0 ? "Edit Prize Money" : "Add Prize Money"}
                                </h2>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {declaredPrizes.length > 0 ? "Update configured prizes" : "Add prizes"} for {event?.EventName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPrizeModalOpen(false)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>

                        <form
                            onSubmit={handleDeclarePrizes}
                            className="space-y-4 p-5"
                        >

                            {prizes.map((prize, index) => (

                                <div
                                    key={index}
                                    className="rounded-xl border border-gray-200 dark:border-gray-800 p-4"
                                >

                                    <div className="flex items-center justify-between mb-3">

                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Prize {index + 1}
                                        </p>

                                        {prizes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePrize(index)}
                                                className="p-1.5 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Prize Name
                                            </label>

                                            <input
                                                value={prize.name}
                                                onChange={(e) =>
                                                    handlePrizeChange(
                                                        index,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="First Prize"
                                                required
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                Prize Money
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={prize.amount}
                                                onChange={(e) =>
                                                    handlePrizeChange(
                                                        index,
                                                        "amount",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="25000"
                                                required
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-600"
                                            />

                                        </div>

                                    </div>

                                </div>

                            ))}

                            <button
                                type="button"
                                onClick={addPrize}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-500"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Prize
                            </button>

                            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">

                                <button
                                    type="button"
                                    onClick={() => setIsPrizeModalOpen(false)}
                                    className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-emerald-700 dark:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white dark:text-black hover:bg-emerald-800 dark:hover:bg-emerald-600 transition shadow-sm"
                                >
                                    {declaredPrizes.length > 0 ? "Update Prizes" : "Declare Prizes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {isGuidelinesModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur px-6 py-4">
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

                            {event?.HackathonMode === 'Both' ? (
                                <div className="space-y-4">
                                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                                        <button
                                            type="button"
                                            onClick={() => setGuidelinesActiveTab('virtual')}
                                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                                                guidelinesActiveTab === 'virtual'
                                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            <Globe className="w-4 h-4" />
                                            Virtual Phase Guidelines
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGuidelinesActiveTab('physical')}
                                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                                                guidelinesActiveTab === 'physical'
                                                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            <Building2 className="w-4 h-4" />
                                            Physical Phase Guidelines
                                        </button>
                                    </div>

                                    {guidelinesActiveTab === 'virtual' && (
                                        <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1.5">
                                                    Virtual Facilities Provided (One per line)
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    value={guidelinesData.VirtualFacilities}
                                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, VirtualFacilities: e.target.value }))}
                                                    placeholder="Discord Server 24/7&#10;Cloud Credits & APIs&#10;Online Mentor Support"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {guidelinesActiveTab === 'physical' && (
                                        <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-emerald-900 dark:text-emerald-300 mb-1.5">
                                                    Physical Phase Facilities (One per line)
                                                </label>
                                                <textarea
                                                    rows="4"
                                                    value={guidelinesData.PhysicalFacilities}
                                                    onChange={(e) => setGuidelinesData((prev) => ({ ...prev, PhysicalFacilities: e.target.value }))}
                                                    placeholder="Campus Wi-Fi 6&#10;Catered Meals & Refreshments&#10;Overnight Rest Lounge"
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
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
                                                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                            {event?.HackathonMode === 'Virtual' ? 'Virtual Facilities (One per line)' : 'Facilities Provided (One per line)'}
                                        </label>
                                        <textarea
                                            rows="5"
                                            value={event?.HackathonMode === 'Virtual' ? (guidelinesData.VirtualFacilities || guidelinesData.Facilities) : guidelinesData.Facilities}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGuidelinesData((prev) => ({
                                                    ...prev,
                                                    Facilities: val,
                                                    VirtualFacilities: event?.HackathonMode === 'Virtual' ? val : prev.VirtualFacilities,
                                                    PhysicalFacilities: event?.HackathonMode === 'Physical' ? val : prev.PhysicalFacilities
                                                }));
                                            }}
                                            placeholder="High speed Wi-Fi&#10;Refreshments&#10;Mentorship"
                                            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                            {event?.HackathonMode === 'Virtual' ? 'Virtual Requirements (One per line)' : 'Participant Requirements (One per line)'}
                                        </label>
                                        <textarea
                                            rows="5"
                                            value={event?.HackathonMode === 'Virtual' ? (guidelinesData.VirtualRequirements || guidelinesData.Requirements) : guidelinesData.Requirements}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setGuidelinesData((prev) => ({
                                                    ...prev,
                                                    Requirements: val,
                                                    VirtualRequirements: event?.HackathonMode === 'Virtual' ? val : prev.VirtualRequirements,
                                                    PhysicalRequirements: event?.HackathonMode === 'Physical' ? val : prev.PhysicalRequirements
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