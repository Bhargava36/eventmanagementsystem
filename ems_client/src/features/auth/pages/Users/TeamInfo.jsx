import {
    ArrowLeft,
    Users,
    Trophy,
    CalendarDays,
    MapPin,
    PencilRuler,
    Stamp,
    Lightbulb,
    CalendarCheck,
    Gift,
    Building2,
    Crown,
    Mail,
    ExternalLink,
    BedDouble,
    Utensils,
    Save
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

function formatDate(date) {
    if (!date) {
        return "Not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getInitial(name) {
    if (!name) {
        return "?";
    }

    return name.trim().charAt(0).toUpperCase();
}

function isTeamLead(role) {
    return role?.toLowerCase().replace(/\s/g, "") === "teamlead" || (role || "").toLowerCase().includes("lead");
}

function TeamInfo() {
    const navigate = useNavigate();
    const { teamId } = useParams();

    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [serviceAvailability, setServiceAvailability] = useState({
        accommodationEnabled: false,
        foodEnabled: false
    });
    const [servicePreferences, setServicePreferences] = useState({
        accommodationRequested: false,
        foodAccepted: false
    });
    const [servicePreferencesSubmitted, setServicePreferencesSubmitted] = useState(false);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [serviceSaving, setServiceSaving] = useState(false);
    const [serviceError, setServiceError] = useState("");
    const [serviceMessage, setServiceMessage] = useState("");

    const fetchTeamInfo = useCallback(async () => {
        try {
            if (!teamId) {
                throw new Error("Team ID is missing");
            }

            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                throw new Error("User information not found");
            }

            const user = JSON.parse(storedUser);
            const userId = user?.Id || user?.id; 

            if (!userId) {
                throw new Error("User ID is missing");
            }

            const response = await fetch(
                `http://localhost:3000/api/teams/info/${teamId}/${userId}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch team information"
                );
            }

            if (!data.team) {
                throw new Error(
                    "Team information not found"
                );
            }

            setTeamData(data);
            setCurrentUserId(userId);
            setError("");

            const targetTeam = data.team;
            const isApprovedPhysical =
                String(targetTeam.ParticipationMode || "").toLowerCase() === "physical" &&
                String(targetTeam.RegistrationStatus || "").toLowerCase() === "approved";
            const isLead = Number(targetTeam.TeamLeadUserId) === Number(userId);

            if (isApprovedPhysical && isLead) {
                setServiceLoading(true);
                try {
                    const preferencesResponse = await fetch(
                        `http://localhost:3000/api/physical-services/teams/${teamId}/preferences?userId=${userId}`
                    );
                    const preferencesData = await preferencesResponse.json();
                    if (!preferencesResponse.ok) {
                        throw new Error(
                            preferencesData.message || "Unable to load physical event choices."
                        );
                    }
                    setServiceAvailability({
                        accommodationEnabled: preferencesData.event.accommodationEnabled,
                        foodEnabled: preferencesData.event.foodEnabled
                    });
                    setServicePreferences(preferencesData.preference);
                    setServicePreferencesSubmitted(
                        preferencesData.preference.submitted === true
                    );
                } catch (preferenceError) {
                    console.error("Load physical event preferences error:", preferenceError);
                    setServiceError(preferenceError.message);
                } finally {
                    setServiceLoading(false);
                }
            }

        } catch (error) {
            console.error("TEAM INFO ERROR:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        let current = true;
        Promise.resolve().then(() => {
            if (current) fetchTeamInfo();
        });
        return () => {
            current = false;
        };
    }, [fetchTeamInfo]);

    const saveServicePreferences = async () => {
        setServiceSaving(true);
        setServiceError("");
        setServiceMessage("");
        try {
            const response = await fetch(
                `http://localhost:3000/api/physical-services/teams/${teamId}/preferences`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: currentUserId,
                        ...servicePreferences
                    })
                }
            );
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Unable to save physical event choices.");
            }
            setServicePreferences(result.preference);
            setServicePreferencesSubmitted(result.preference.submitted === true);
            setServiceMessage(result.message);
        } catch (saveError) {
            console.error("Save physical event preferences error:", saveError);
            setServiceError(saveError.message);
        } finally {
            setServiceSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Loading team information...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 font-sans">
                <p className="text-red-500 text-center text-sm font-semibold">
                    {error}
                </p>
                <button
                    onClick={() => navigate("/user/teams")}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    Back to Teams
                </button>
            </div>
        );
    }

    if (!teamData || !teamData.team) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans">
                <p className="text-sm text-slate-500">
                    Team information not found
                </p>
            </div>
        );
    }

    const team = teamData.team;
    const members = teamData.members || [];
    const teamLead = members.find(member => isTeamLead(member.Role));
    const isTeamLeadViewer = Number(team.TeamLeadUserId) === Number(currentUserId);
    const isApprovedPhysical =
        String(team.ParticipationMode || "").toLowerCase() === "physical" &&
        String(team.RegistrationStatus || "").toLowerCase() === "approved";

    return (
        <div className="min-h-screen w-full bg-slate-100 p-3 text-slate-900 sm:p-4 md:p-6 dark:bg-black dark:text-white font-sans">

            <button
                type="button"
                onClick={() => navigate("/user/teams")}
                className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Teams
            </button>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 items-start">

                {/* ── LEFT COLUMN ── */}
                <div className="lg:col-span-2 min-w-0 space-y-4">

                    {/* Team Header Banner */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-3.5 sm:p-4 rounded-xl shrink-0">
                                    <Users className="text-emerald-600 w-8 h-8 sm:w-10 sm:h-10" />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="font-bold text-xl sm:text-2xl font-sans break-words text-slate-900 dark:text-white">
                                        {team.TeamName}
                                    </h1>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                        <span>Build</span>
                                        <span>•</span>
                                        <span>Solve</span>
                                        <span>•</span>
                                        <span>Create</span>
                                    </div>

                                    <div className="bg-emerald-100 dark:bg-emerald-500/20 rounded-full inline-flex items-center gap-1.5 py-1 px-3 mt-2">
                                        <Trophy className="text-emerald-600 w-3.5 h-3.5" />
                                        <span className="text-emerald-600 font-semibold text-xs">
                                            Team #{team.TeamId}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center bg-emerald-100 dark:bg-emerald-500/20 rounded-xl py-3 px-4 sm:py-3.5 sm:px-5 gap-3 shrink-0 self-start sm:self-auto">
                                <Users className="text-emerald-600 w-6 h-6 sm:w-7 sm:h-7" />
                                <div>
                                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                        Team Size
                                    </p>
                                    <p className="font-bold text-lg sm:text-xl text-emerald-600 font-sans leading-tight">
                                        {team.TeamSize} <span className="text-xs font-normal text-slate-500">Members</span>
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 4-Item Meta Card */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            <div 
                                onClick={() => team.EventId && navigate(`/user/events/${team.EventId}`)}
                                className={`flex items-start gap-2.5 min-w-0 ${team.EventId ? 'cursor-pointer group' : ''}`}
                                title={team.EventId ? "View Event Details" : undefined}
                            >
                                <CalendarDays className="text-slate-400 w-5 h-5 shrink-0 mt-0.5 group-hover:text-emerald-600 transition-colors" />
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-medium">
                                        Event Name
                                    </p>
                                    <p className="font-semibold text-sm font-sans break-words text-slate-800 dark:text-white mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                        <span>{team.EventName || "Not available"}</span>
                                        {team.EventId && (
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 min-w-0">
                                <CalendarDays className="text-slate-400 w-5 h-5 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-medium">
                                        Date
                                    </p>
                                    <p className="font-semibold text-sm font-sans text-slate-800 dark:text-white mt-0.5">
                                        {formatDate(team.StartDate)}
                                        {" - "}
                                        {formatDate(team.EndDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 min-w-0">
                                <MapPin className="text-slate-400 w-5 h-5 shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-medium">
                                        Location
                                    </p>
                                    <p className="font-semibold text-sm font-sans break-words text-slate-800 dark:text-white mt-0.5">
                                        {team.Location || "Not available"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 min-w-0">
                                <PencilRuler className="text-slate-400 w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Team Size
                                    </p>
                                    <p className="font-semibold text-sm font-sans text-slate-800 dark:text-white mt-0.5">
                                        {team.TeamSize} Members
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Event Description Card */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <Stamp className="w-5 h-5 text-slate-700 dark:text-slate-200 shrink-0" />
                                <h2 className="font-bold text-base sm:text-lg font-sans text-slate-900 dark:text-white">
                                    Event Description
                                </h2>
                            </div>
                            {team.EventId && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/user/events/${team.EventId}`)}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                                >
                                    <span>View Event</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div 
                            onClick={() => team.EventId && navigate(`/user/events/${team.EventId}`)}
                            className={`border border-emerald-700/20 rounded-xl bg-slate-50 p-4 dark:bg-gray-900 dark:border-emerald-500/30 shadow-sm ${team.EventId ? 'cursor-pointer hover:border-emerald-500/40 hover:bg-slate-100/70 dark:hover:bg-gray-900/80 transition-all group' : ''}`}
                            title={team.EventId ? "Click to view event details" : undefined}
                        >
                            <h3 className="text-emerald-600 font-semibold font-sans text-sm sm:text-base flex items-center justify-between gap-2">
                                <span>{team.EventName}</span>
                                {team.EventId && (
                                    <ExternalLink className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                )}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm pt-1.5 leading-relaxed">
                                {team.EventDescription || "No event description available."}
                            </p>
                        </div>
                    </div>

                    {/* Team Members Card */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-gray-800">
                            <div className="flex items-center gap-2.5">
                                <Users className="w-5 h-5 text-emerald-600 shrink-0" />
                                <h2 className="font-bold text-base sm:text-lg font-sans text-slate-900 dark:text-white">
                                    Team Members ({members.length})
                                </h2>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">
                                Active Squad
                            </span>
                        </div>

                        {/* Redesigned Member Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {members.map(member => {
                                const isLead = isTeamLead(member.Role);

                                return (
                                    <div
                                        key={member.UserId}
                                        className={`rounded-xl border p-4 transition-all duration-200 ${
                                            isLead
                                                ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm"
                                                : "border-emerald-700/20 bg-slate-50/60 dark:bg-gray-900/40 dark:border-emerald-500/30 hover:border-emerald-500/30 shadow-sm"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5">
                                            {/* Avatar */}
                                            <div
                                                className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                                                    isLead
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 ring-2 ring-emerald-500/30"
                                                        : "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                                                }`}
                                            >
                                                {getInitial(member.UserName)}
                                            </div>

                                            {/* Member Details */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <p
                                                        className="font-bold text-sm font-sans text-slate-900 dark:text-white truncate"
                                                        title={member.UserName}
                                                    >
                                                        {member.UserName || "Participant"}
                                                    </p>
                                                    {isLead ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
                                                            <Crown className="w-3 h-3 text-amber-500" />
                                                            Lead
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 shrink-0">
                                                            Member
                                                        </span>
                                                    )}
                                                </div>

                                                {member.Email && (
                                                    <p
                                                        className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1.5"
                                                        title={member.Email}
                                                    >
                                                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">{member.Email}</span>
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-gray-800">
                                                    <span className="inline-flex items-center gap-1 truncate" title={member.College || 'College'}>
                                                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">{member.College || "Not available"}</span>
                                                    </span>
                                                    {member.State && (
                                                        <span className="inline-flex items-center gap-1 shrink-0" title={member.State}>
                                                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span>{member.State}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* ── RIGHT COLUMN (Overview & Status) ── */}
                <div className="min-w-0 space-y-4">

                    {/* Blue Overview Card */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div 
                            onClick={() => team.EventId && navigate(`/user/events/${team.EventId}`)}
                            className={`mb-4 flex justify-between items-center ${team.EventId ? 'cursor-pointer' : ''}`}
                            title={team.EventId ? "Click to view event details" : undefined}
                        >
                            {team.Posters && team.Posters.length > 0 ? (
                                <img
                                    src={team.Posters[0]}
                                    alt={team.EventName || "Event Poster"}
                                    className="w-full h-60 rounded-lg object-cover border border-emerald-500/20"
                                />
                            ) : (
                                <div className="bg-blue-800 rounded-lg flex items-center justify-center p-4">
                                    <span className="text-sm text-blue-200 font-semibold">
                                        No Poster Available
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span className="text-base font-semibold font-sans text-slate-900 dark:text-white">
                                        Event Overview
                                    </span>
                                </div>
                                {team.EventId && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/user/events/${team.EventId}`)}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
                                    >
                                        Details <ExternalLink className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Event Name</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-right truncate max-w-[170px]">{team.EventName || "Not available"}</p>
                                </div>

                                <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Event Type</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-right">{team.EventType || "Not available"}</p>
                                </div>

                                <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Location</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-right truncate max-w-[170px]">{team.Location || "Not available"}</p>
                                </div>

                                <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Status</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-right capitalize">{team.EventStatus || "Upcoming"}</p>
                                </div>

                                <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">College</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-right truncate max-w-[170px]">{team.College || "Not available"}</p>
                                </div>

                                <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">State</p>
                                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-right">{team.State || "Not available"}</p>
                                </div>
                            </div>

                            {team.EventId && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/user/events/${team.EventId}`)}
                                    className="mt-3.5 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                                >
                                    <span>View Event Details</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Team Status Card */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="text-yellow-500 w-5 h-5 fill-yellow-400" />
                            <h2 className="font-semibold text-base font-sans text-slate-900 dark:text-white">
                                Team Status
                            </h2>
                        </div>

                        <div className="flex items-center gap-3.5 pt-1">
                            <div className="bg-emerald-100 rounded-full h-11 w-11 flex items-center justify-center dark:bg-emerald-500/20 shrink-0">
                                <Users className="text-emerald-600 w-5 h-5" />
                            </div>

                            <div>
                                <h3 className="text-base font-bold font-sans text-slate-900 dark:text-white">
                                    Registered Team
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Your team is registered for{" "}
                                    {team.EventId ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/user/events/${team.EventId}`)}
                                            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                                        >
                                            {team.EventName}
                                            <ExternalLink className="w-3 h-3 inline" />
                                        </button>
                                    ) : (
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{team.EventName}</span>
                                    )}.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team Details Card */}
                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-base font-sans text-slate-900 dark:text-white">
                                Team Details
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Team Name</p>
                                <p className="text-gray-800 dark:text-gray-200 font-bold text-right">{team.TeamName}</p>
                            </div>

                            <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Team Size</p>
                                <p className="text-gray-800 dark:text-gray-200 font-semibold text-right">{team.TeamSize} Members</p>
                            </div>

                            <div className="flex justify-between items-center gap-3 py-2 text-xs">
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Team Lead</p>
                                <p className="text-gray-800 dark:text-gray-200 font-semibold text-right truncate max-w-[170px]">{teamLead?.UserName || "Not available"}</p>
                            </div>
                        </div>
                    </div>

                    {isTeamLeadViewer && isApprovedPhysical &&
                        (serviceAvailability.accommodationEnabled || serviceAvailability.foodEnabled) && (
                        <section className="rounded-xl border border-emerald-700/20 bg-white p-4 shadow-sm dark:border-emerald-500/30 dark:bg-gray-950 sm:p-5">
                            <div className="mb-4">
                                <h2 className="font-semibold text-base text-slate-900 dark:text-white">
                                    Physical Event Choices
                                </h2>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Choose for your full team ({members.length} registered member{members.length === 1 ? "" : "s"}). Once saved, your selections are final.
                                </p>
                            </div>
                            {serviceLoading ? (
                                <p className="text-sm text-slate-500">Loading available choices...</p>
                            ) : (
                                <div className="space-y-3">
                                    {(serviceAvailability.accommodationEnabled || serviceAvailability.foodEnabled) && (
                                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 bg-emerald-50/20 dark:bg-black hover:border-emerald-500/50 transition">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(servicePreferences.accommodationRequested || servicePreferences.foodAccepted)}
                                                disabled={serviceSaving || servicePreferencesSubmitted}
                                                onChange={(event) => setServicePreferences((previous) => ({
                                                    ...previous,
                                                    accommodationRequested: event.target.checked,
                                                    foodAccepted: event.target.checked
                                                }))}
                                                className="mt-1 accent-emerald-600 h-4 w-4 cursor-pointer"
                                            />
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <BedDouble className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">&amp;</span>
                                                    <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                        Request Food &amp; Accommodation
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                                    Yes — request both campus accommodation (in designated Boys/Girls blocks) and daily meal tokens for all {members.length} registered team member{members.length === 1 ? "" : "s"}.
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                    {serviceError && (
                                        <p role="alert" className="text-sm text-red-600">{serviceError}</p>
                                    )}
                                    {serviceMessage && (
                                        <p role="status" className="text-sm text-emerald-700">{serviceMessage}</p>
                                    )}
                                    {servicePreferencesSubmitted ? (
                                        <p role="status" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                            Your choices have been submitted and can no longer be changed.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={saveServicePreferences}
                                            disabled={serviceSaving || serviceLoading}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                                        >
                                            <Save className="h-4 w-4" />
                                            {serviceSaving ? "Saving..." : "Save final choices"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                </div>

            </div>

        </div>
    );
}

export default TeamInfo;
