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
    Gift
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

    return name.charAt(0).toUpperCase();
}

function isTeamLead(role) {
    return role?.toLowerCase().replace(/\s/g, "") === "teamlead";
}

function TeamInfo() {
    const navigate = useNavigate();
    const { teamId } = useParams();

    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTeamInfo();
    }, [teamId]);

    const fetchTeamInfo = async () => {
        try {
            setLoading(true);
            setError("");

            if (!teamId) {
                throw new Error("Team ID is missing");
            }

            const storedUser =
                localStorage.getItem("user");

            if (!storedUser) {
                throw new Error("User information not found");
            }

            const user = JSON.parse(storedUser);

            const userId = user?.Id; 

            if (!userId) {
                throw new Error("User ID is missing");
            }

            console.log("TEAM ID:", teamId);
            console.log("USER ID:", userId);

            const response = await fetch(
                `http://localhost:3000/api/teams/info/${teamId}/${userId}`
            );

            const data = await response.json();

            console.log("TEAM INFO:", data);

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

        } catch (error) {
            console.error(
                "TEAM INFO ERROR:",
                error
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-medium">
                    Loading team information...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 text-center">
                    {error}
                </p>

                <button
                    onClick={() => navigate("/user/teams")}
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white"
                >
                    Back to Teams
                </button>
            </div>
        );
    }

    if (!teamData || !teamData.team) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>
                    Team information not found
                </p>
            </div>
        );
    }

    const team = teamData.team;
    const members = teamData.members || [];

    const teamLead = members.find(member =>
        isTeamLead(member.Role)
    );

    return (
        <div className="min-h-screen w-full bg-slate-100 p-3 text-slate-900 sm:p-4 md:p-6 dark:bg-black dark:text-white">

            <button
                type="button"
                onClick={() => navigate("/user/teams")}
                className="mb-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-500"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Teams
            </button>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                <div className="lg:col-span-2 min-w-0">

                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-center gap-3 sm:gap-5 min-w-0">

                                <div className="bg-emerald-100 dark:bg-emerald-500/20 p-5 sm:p-7 rounded-lg shrink-0">
                                    <Users className="text-emerald-600 w-10 h-10 sm:w-15 sm:h-15" />
                                </div>

                                <div className="min-w-0">

                                    <h1 className="font-bold text-xl break-words">
                                        {team.TeamName}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-x-2">

                                        <p className="text-slate-400">
                                            Build
                                        </p>

                                        <span className="text-slate-400 text-3xl pb-5">
                                            .
                                        </span>

                                        <p className="text-slate-400">
                                            Solve
                                        </p>

                                        <span className="text-slate-400 text-3xl pb-5">
                                            .
                                        </span>

                                        <p className="text-slate-400">
                                            Create
                                        </p>

                                    </div>

                                    <div className="bg-emerald-100 dark:bg-emerald-500/20 rounded-full inline-flex items-center gap-3 py-2 px-3">

                                        <Trophy className="text-emerald-600" />

                                        <span className="text-emerald-600 font-medium">
                                            Team
                                        </span>

                                    </div>

                                </div>

                            </div>

                            <div className="flex items-center bg-emerald-100 dark:bg-emerald-500/20 rounded-xl py-5 px-5 sm:py-6 sm:px-7 gap-3 w-full md:w-auto">

                                <Users className="text-emerald-600 w-10 h-10" />

                                <div>

                                    <p>
                                        Team Size
                                    </p>

                                    <p className="font-bold text-2xl text-emerald-600">
                                        {team.TeamSize}
                                    </p>

                                    <p>
                                        Members
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm mt-3">

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                            <div className="flex gap-2 min-w-0">

                                <CalendarDays className="text-slate-400 shrink-0" />

                                <div className="min-w-0">

                                    <p className="text-slate-400">
                                        Event Name
                                    </p>

                                    <h2 className="font-semibold break-words">
                                        {team.EventName || "Not available"}
                                    </h2>

                                </div>

                            </div>

                            <div className="flex gap-2 min-w-0">

                                <CalendarDays className="text-slate-400 shrink-0" />

                                <div className="min-w-0">

                                    <p className="text-slate-400">
                                        Date
                                    </p>

                                    <h2 className="font-semibold">
                                        {formatDate(team.StartDate)}
                                        {" - "}
                                        {formatDate(team.EndDate)}
                                    </h2>

                                </div>

                            </div>

                            <div className="flex gap-2 min-w-0">

                                <MapPin className="text-slate-400 shrink-0" />

                                <div className="min-w-0">

                                    <p className="text-slate-400">
                                        Location
                                    </p>

                                    <h2 className="font-semibold break-words">
                                        {team.Location || "Not available"}
                                    </h2>

                                </div>

                            </div>

                            <div className="flex gap-2 min-w-0">

                                <PencilRuler className="text-slate-400 shrink-0" />

                                <div>

                                    <p className="text-slate-400">
                                        Team Size
                                    </p>

                                    <h2 className="font-semibold">
                                        {team.TeamSize} Members
                                    </h2>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm mt-5">

                        <div className="flex gap-3">

                            <Stamp className="w-7 h-7 shrink-0" />

                            <h1 className="font-bold text-lg">
                                Event Description
                            </h1>

                        </div>

                        <div className="border border-emerald-700/20 rounded-xl bg-slate-50 p-4 sm:p-5 dark:bg-gray-900 dark:border-emerald-500/30 shadow-sm mt-3">

                            <h3 className="text-emerald-600 font-medium">
                                {team.EventName}
                            </h3>

                            <p className="text-slate-500 dark:text-slate-400 pt-2">
                                {team.EventDescription ||
                                    "No event description available."}
                            </p>

                        </div>

                    </div>

                    <div className="border border-emerald-700/20 rounded-xl bg-slate-50 p-4 sm:p-5 dark:bg-gray-950 dark:border-emerald-500/30 shadow-sm mt-5">

                        <div className="flex gap-3">

                            <Users className="w-7 h-7 shrink-0" />

                            <h1 className="font-bold text-lg">
                                Team Members
                            </h1>

                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 mt-3">

                            {members.map(member => (

                                <div
                                    key={member.UserId}
                                    className="rounded-xl border border-emerald-700/20 bg-white p-4 text-center dark:bg-gray-950 dark:border-emerald-500/30 shadow-sm"
                                >

                                    <div className="w-10 h-10 flex items-center justify-center rounded-full font-semibold bg-violet-200 text-violet-400 p-2 mx-auto dark:bg-violet-500/20">

                                        {getInitial(
                                            member.UserName
                                        )}

                                    </div>

                                    <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-white">
                                        {member.UserName ||
                                            "Unknown User"}
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {isTeamLead(member.Role)
                                            ? "Team Leader"
                                            : "Team Member"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {member.College ||
                                            "Not available"}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

                <div className="min-w-0">

                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm">

                        <div className="mb-5 flex justify-between items-center bg-blue-950 rounded-xl gap-3">

                            <div className="p-3 min-w-0">

                                <h1 className="text-white font-bold text-lg break-words">
                                    {team.EventName}
                                </h1>

                                <div className="flex flex-wrap items-center gap-x-2">

                                    <p className="text-slate-400">
                                        Ideas
                                    </p>

                                    <span className="text-slate-400 text-3xl pb-5">
                                        .
                                    </span>

                                    <p className="text-slate-400">
                                        Innovation
                                    </p>

                                    <span className="text-slate-400 text-3xl pb-5">
                                        .
                                    </span>

                                    <p className="text-slate-400">
                                        Impact
                                    </p>

                                </div>

                            </div>

                            <Lightbulb className="text-lime-400 w-8 h-8 sm:w-10 sm:h-10 mr-3" />

                        </div>

                        <div>

                            <div className="flex gap-2 mt-2">

                                <CalendarCheck className="w-7 h-7 shrink-0" />

                                <span className="text-lg font-semibold">
                                    Event Overview
                                </span>

                            </div>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800/50 p-2">

                                <div className="flex justify-between gap-3 px-3 py-2">

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Event Name
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                        {team.EventName ||
                                            "Not available"}
                                    </p>

                                </div>

                                <div className="flex justify-between gap-3 px-3 py-2">

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Event Type
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                        {team.EventType ||
                                            "Not available"}
                                    </p>

                                </div>

                                <div className="flex justify-between gap-3 px-3 py-2">

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Location
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                        {team.Location ||
                                            "Not available"}
                                    </p>

                                </div>

                                <div className="flex justify-between gap-3 px-3 py-2">

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Status
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right capitalize">
                                        {team.EventStatus ||
                                            "Not available"}
                                    </p>

                                </div>

                                <div className="flex justify-between gap-3 px-3 py-2">

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        College
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                        {team.College ||
                                            "Not available"}
                                    </p>

                                </div>

                                <div className="flex justify-between gap-3 px-3 py-2">

                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        State
                                    </p>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                        {team.State ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm mt-3">

                        <div className="flex gap-2">

                            <Trophy className="text-yellow-500 w-6 h-6 fill-yellow-300" />

                            <h2 className="font-semibold text-lg">
                                Team Status
                            </h2>

                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-5 pb-5">

                            <div className="bg-emerald-100 rounded-full p-5 dark:bg-emerald-500/20 shrink-0">

                                <Users className="text-emerald-600 w-10 h-10" />

                            </div>

                            <div>

                                <h3 className="text-xl font-bold">
                                    Registered Team
                                </h3>

                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Your team is registered for{" "}
                                    {team.EventName}.
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="border border-emerald-700/20 rounded-xl bg-white p-4 sm:p-5 dark:border-emerald-500/30 dark:bg-gray-950 shadow-sm mt-3">

                        <div className="flex gap-2">

                            <Gift className="shrink-0" />

                            <span className="font-semibold text-lg">
                                Team Details
                            </span>

                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800/50 p-2">

                            <div className="flex justify-between gap-3 px-3 py-2">

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Team Name
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                    {team.TeamName}
                                </p>

                            </div>

                            <div className="flex justify-between gap-3 px-3 py-2">

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Team Size
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                    {team.TeamSize}
                                </p>

                            </div>

                            <div className="flex justify-between gap-3 px-3 py-2">

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Team Lead
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                    {teamLead?.UserName ||
                                        "Not available"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default TeamInfo;
