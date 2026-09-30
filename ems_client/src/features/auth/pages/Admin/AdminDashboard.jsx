import React, { useEffect, useState } from "react";
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
    UserPlus
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

            setEvent(eventData.event || null);

            const prizeResponse = await fetch(
                `http://localhost:3000/api/event_prizes/event/${eventId}`
            );

            if (prizeResponse.ok) {
                const prizeData = await prizeResponse.json();

                const fetchedPrizes =
                    prizeData.prizes ||
                    prizeData.eventPrizes ||
                    [];

                setDeclaredPrizes(fetchedPrizes);
            }

            const registrationsResponse = await fetch(
                `http://localhost:3000/api/event_reg/recent`
            );

            if (!registrationsResponse.ok) {
                throw new Error("Failed to fetch recent registrations");
            }

            const registrationsData = await registrationsResponse.json();

            setRecentRegistrations(
                registrationsData.registrations ||
                registrationsData.recentRegistrations ||
                []
            );

            const activitiesResponse = await fetch(
                `http://localhost:3000/api/event_reg/activities`
            );

            if (!activitiesResponse.ok) {
                throw new Error("Failed to fetch recent activities");
            }

            const activitiesData = await activitiesResponse.json();

            setRecentActivities(
                activitiesData.activities || []
            );

            const usersResponse = await fetch(
                `http://localhost:3000/api/event_reg/event/${eventId}/count`
            );

            if (!usersResponse.ok) {
                throw new Error("Failed to fetch registration users count");
            }

            const usersData = await usersResponse.json();

            setUsersCount(usersData.count || 0);

            const teamsResponse = await fetch(
                `http://localhost:3000/api/teams/event/${eventId}/count`
            );

            if (!teamsResponse.ok) {
                throw new Error("Failed to fetch teams count");
            }

            const teamsData = await teamsResponse.json();

            setTeamsCount(teamsData.count || 0);

            const pendingResponse = await fetch(
                `http://localhost:3000/api/event_reg/event/${eventId}/pending-count`
            );

            if (!pendingResponse.ok) {
                throw new Error("Failed to fetch pending approvals");
            }

            const pendingData = await pendingResponse.json();

            setPendingCount(pendingData.count || 0);

            if (eventData.event?.StartDate) {
                const startDate = new Date(eventData.event.StartDate);
                const today = new Date();

                const difference = startDate - today;

                const days = Math.ceil(
                    difference / (1000 * 60 * 60 * 24)
                );

                setRemainingDays(Math.max(days, 0));
            } else {
                setRemainingDays(0);
            }

        } catch (error) {
            console.error("ADMIN DASHBOARD ERROR:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

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
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 pt-5 sm:px-6 md:px-8">

                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>

                    <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
                        Overview of your assigned event
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsPrizeModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600"
                >
                    <Plus className="h-4 w-4" />
                    Add Prize Money
                </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-6">

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

                    {stats.map((stat, index) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm"
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
                            </div>
                        );
                    })}

                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl border border-emerald-700 dark:border-emerald-500 shadow-sm overflow-hidden">

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

                    </div>
                </div>

                {declaredPrizes.length > 0 && (
                    <section>

                        <div className="flex items-center justify-between mb-4">

                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                                    Declared Prizes
                                </h2>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Prize money for {event?.EventName}
                                </p>
                            </div>

                            <Trophy className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {declaredPrizes.map((prize, index) => (
                                <div
                                    key={prize.Id || prize.id || index}
                                    className="relative overflow-hidden rounded-xl border border-emerald-700/20 bg-white dark:bg-gray-950 p-5 shadow-sm"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-700 dark:bg-emerald-500" />

                                    <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-500">
                                        Prize {getPrizeRank(prize, index)}
                                    </p>

                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                                        {prize.Name ||
                                            prize.name ||
                                            `Prize ${getPrizeRank(prize, index)}`}
                                    </h3>

                                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-500 mt-4">
                                        ₹ {Number(
                                            getPrizeAmount(prize)
                                        ).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

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

                </div>

                <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">

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

                </div>

            </div>

            {isPrizeModalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-emerald-700/20 bg-white dark:bg-gray-950 shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-4">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Add Prize Money
                                </h2>

                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Add prizes for {event?.EventName}
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
                                    className="rounded-lg bg-emerald-700 dark:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white dark:text-black"
                                >
                                    Declare Prizes
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default AdminDashboard;