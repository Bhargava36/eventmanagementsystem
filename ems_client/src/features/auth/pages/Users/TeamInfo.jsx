import {
    ArrowLeft,
    Users,
    User,
    UserCheck,
    Trophy,
    CalendarDays,
    MapPin,
    Building2,
    Crown,
    Mail,
    ExternalLink,
    BedDouble,
    Utensils,
    Save,
    Award,
    CheckCircle2,
    Clock,
    Sparkles,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    Layers,
    FileText,
    QrCode,
    Share2,
    Copy,
    Check,
    Download,
    Maximize2,
    X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getEventTheme, isSoloTeamSize } from "../../../../lib/utils";
import useTheme from "../../../../Hooks/useTheme";

function formatDate(date) {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getInitial(name) {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
}

function isTeamLead(role) {
    return role?.toLowerCase().replace(/\s/g, "") === "teamlead" || (role || "").toLowerCase().includes("lead");
}

function TeamInfo() {
    const navigate = useNavigate();
    const { teamId } = useParams();
    const { theme: appTheme } = useTheme();

    const isDark = appTheme === "dark";

    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);

    // Physical services state
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

    // Published Results state
    const [resultsData, setResultsData] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [expandedRoundId, setExpandedRoundId] = useState(null);

    // Public QR Pass state
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const qrSvgRef = useRef(null);

    const publicTeamUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/teams/public/${teamId}`
        : '';

    const handleCopyPublicUrl = () => {
        if (navigator.clipboard && publicTeamUrl) {
            navigator.clipboard.writeText(publicTeamUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2500);
        }
    };

    const handleDownloadQr = () => {
        try {
            const svg = document.getElementById(`team-qr-code-${teamId}`) || qrSvgRef.current?.querySelector('svg');
            if (!svg) return;
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width + 40;
                canvas.height = img.height + 40;
                if (ctx) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 20, 20);
                    const pngFile = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.download = `Team-${teamId}-QR-Pass.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                }
            };
            img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        } catch (err) {
            console.error("Failed to download QR code:", err);
        }
    };

    const fetchTeamInfo = useCallback(async () => {
        try {
            if (!teamId) throw new Error("Team ID is missing");

            const storedUser = localStorage.getItem("user");
            if (!storedUser) throw new Error("User information not found");

            const user = JSON.parse(storedUser);
            const userId = user?.Id || user?.id; 
            if (!userId) throw new Error("User ID is missing");

            const response = await fetch(
                `http://localhost:3000/api/teams/info/${teamId}/${userId}`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch team information");
            }
            if (!data.team) {
                throw new Error("Team information not found");
            }

            setTeamData(data);
            setCurrentUserId(userId);
            setError("");

            const targetTeam = data.team;
            const isApprovedPhysical =
                String(targetTeam.ParticipationMode || "").toLowerCase() === "physical" &&
                String(targetTeam.RegistrationStatus || "").toLowerCase() === "approved";
            const isIndividualEvent = Boolean(
                isSoloTeamSize(targetTeam.TeamSize) ||
                isSoloTeamSize(targetTeam.EventTeamSize) ||
                String(targetTeam.TeamName || "").toLowerCase().includes("(individual)")
            );
            const isViewerLead = Number(targetTeam.TeamLeadUserId) === Number(userId);
            const canViewServices = isViewerLead || (isIndividualEvent && (isViewerLead || (data.members || []).some(m => Number(m.UserId) === Number(userId))));

            // Fetch physical choices if applicable
            if (isApprovedPhysical && canViewServices && targetTeam.EventId) {
                setServiceLoading(true);
                try {
                    const servicesRes = await fetch(
                        `http://localhost:3000/api/physical-services/teams/${teamId}/preferences?userId=${userId}`
                    );
                    const servicesData = await servicesRes.json();
                    if (servicesRes.ok && servicesData.preference) {
                        setServiceAvailability({
                            accommodationEnabled: Boolean(servicesData.event?.accommodationEnabled),
                            foodEnabled: Boolean(servicesData.event?.foodEnabled)
                        });
                        setServicePreferences({
                            accommodationRequested: Boolean(servicesData.preference?.accommodationRequested),
                            foodAccepted: Boolean(servicesData.preference?.foodAccepted)
                        });
                        setServicePreferencesSubmitted(Boolean(servicesData.preference?.submitted));
                    }
                } catch (serviceErr) {
                    console.error("Failed to load services:", serviceErr);
                } finally {
                    setServiceLoading(false);
                }
            }

            // Fetch Published Evaluation Results & Scorecard for this team
            try {
                setLoadingResults(true);
                const res = await fetch(`http://localhost:3000/api/evaluators/teams/${teamId}/published-results`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        setResultsData(json.data);
                        if (json.data.publishedRounds && json.data.publishedRounds.length > 0) {
                            setExpandedRoundId(json.data.publishedRounds[0].roundId);
                        }
                    }
                }
            } catch (evalErr) {
                console.error("Failed to fetch published results:", evalErr);
            } finally {
                setLoadingResults(false);
            }

        } catch (err) {
            console.error("Error fetching team info:", err);
            setError(err.message || "Failed to load team information");
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchTeamInfo();
    }, [fetchTeamInfo]);

    const saveServicePreferences = async () => {
        try {
            setServiceSaving(true);
            setServiceError("");
            setServiceMessage("");
            const response = await fetch(
                `http://localhost:3000/api/physical-services/teams/${teamId}/preferences`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: currentUserId,
                        accommodationRequested: servicePreferences.accommodationRequested,
                        foodAccepted: servicePreferences.foodAccepted
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to save choices.");
            setServiceMessage("Preferences saved successfully!");
            setServicePreferencesSubmitted(true);
        } catch (err) {
            setServiceError(err.message);
        } finally {
            setServiceSaving(false);
        }
    };

    const team = teamData?.team;
    const members = teamData?.members || [];

    // Theme branding calculation adapting to current mode
    const theme = useMemo(() => {
        return getEventTheme(team || {}, isDark);
    }, [team, isDark]);

    const isIndividual = Boolean(
        isSoloTeamSize(team?.TeamSize) ||
        isSoloTeamSize(team?.EventTeamSize) ||
        String(team?.TeamName || "").toLowerCase().includes("(individual)") ||
        (Number(team?.TeamSize) === 1 && members.length <= 1)
    );

    const isApprovedPhysical =
        String(team?.ParticipationMode || "").toLowerCase() === "physical" &&
        String(team?.RegistrationStatus || "").toLowerCase() === "approved";

    const isLeadViewer = Number(team?.TeamLeadUserId) === Number(currentUserId);
    const canAccessServices = isLeadViewer || (isIndividual && (isLeadViewer || members.some(m => Number(m.UserId) === Number(currentUserId))));

    // Clean display name
    const primaryMember = members[0] || {};
    const displayName = isIndividual
        ? (primaryMember.UserName || team?.TeamName?.replace(/\s*\(individual\)/gi, ''))
        : team?.TeamName;

    const displayEmail = isIndividual
        ? primaryMember.Email
        : (members.find(m => isTeamLead(m.Role))?.Email || primaryMember.Email);

    const displayCollege = team?.College || primaryMember.College || "Institution";
    const displayState = team?.State || primaryMember.State;

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col items-center justify-center gap-3 transition-colors duration-300">
                <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: theme.border, borderTopColor: 'transparent' }}
                />
                <p className="text-xs text-slate-500 dark:text-gray-400">Loading dashboard details...</p>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-6 flex flex-col items-center justify-center gap-4 transition-colors duration-300">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <Trophy className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard Unavailable</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm text-center">{error || "Unable to find team information."}</p>
                <button
                    onClick={() => navigate("/user/teams")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-sm"
                >
                    Back to My Registrations
                </button>
            </div>
        );
    }

    const publishedRounds = resultsData?.publishedRounds || [];
    const hasPublishedRounds = publishedRounds.length > 0;
    const isOverallPublished = resultsData?.isOverallPublished && resultsData?.overallRank;

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6 font-sans transition-colors duration-300">
            {/* ── TOP NAV BAR ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/user/teams")}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer shadow-sm"
                        title="Back to Registrations"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                {isIndividual ? "Participant Dashboard" : "Team Dashboard"}
                            </span>
                            <span className="text-slate-400 dark:text-gray-600">&bull;</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {team.EventName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Event Action Button */}
                {team.EventId && (
                    <button
                        type="button"
                        onClick={() => navigate(`/user/events/${team.EventId}`)}
                        className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm"
                        style={{
                            backgroundColor: theme.buttonBg,
                            borderColor: theme.border,
                            color: theme.buttonText,
                            boxShadow: `0 4px 15px -3px ${theme.glow}`
                        }}
                    >
                        <span>View Event Details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 1: TOP TEAM OR INDIVIDUAL DETAILS (HERO CARD) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section
                className="rounded-3xl border p-6 sm:p-7 relative overflow-hidden bg-white dark:bg-zinc-950/95 border-slate-200/80 dark:border-zinc-800 shadow-sm"
                style={{
                    borderColor: theme.cardBorder,
                    boxShadow: isDark ? `0 10px 40px -10px ${theme.glow}` : `0 4px 20px -2px rgba(0,0,0,0.05)`
                }}
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Avatar, Name, Email, College, Tags */}
                    <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                        {/* Avatar */}
                        <div
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 border shadow-md"
                            style={{
                                backgroundColor: theme.primary,
                                borderColor: theme.border,
                                color: '#ffffff',
                                boxShadow: `0 6px 25px -4px ${theme.glow}`
                            }}
                        >
                            {getInitial(displayName)}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full border"
                                    style={{
                                        backgroundColor: theme.badgeBg,
                                        borderColor: theme.badgeBorder,
                                        color: theme.badgeText
                                    }}
                                >
                                    {isIndividual ? "Individual Participant" : `Team (${team.TeamSize} Members)`}
                                </span>

                                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-zinc-800">
                                    {team.ParticipationMode || "Physical"} Track
                                </span>

                                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                                    {team.RegistrationStatus || "Approved"}
                                </span>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                                {displayName}
                            </h1>

                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-gray-400 pt-0.5">
                                {displayEmail && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" />
                                        <span className="truncate">{displayEmail}</span>
                                    </span>
                                )}

                                <span className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" />
                                    <span className="truncate">{displayCollege}</span>
                                </span>

                                {displayState && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" />
                                        <span>{displayState}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Key Stats Columns */}
                    <div className="flex items-center gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-800/80 lg:pl-6 shrink-0">
                        {/* Total Registrations in Event */}
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                Total Registrations
                            </span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
                                {team.totalEventRegistrations || resultsData?.totalRegistrations || 1}
                                <span className="text-xs font-normal text-slate-500 dark:text-gray-400">
                                    {isIndividual ? "Attendees" : "Teams"}
                                </span>
                            </p>
                        </div>

                        <div className="h-10 w-px bg-slate-200 dark:bg-zinc-800" />

                        {/* Registration ID */}
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                {isIndividual ? "Participant ID" : "Team ID"}
                            </span>
                            <p className="text-2xl sm:text-3xl font-black" style={{ color: theme.accent }}>
                                #{team.TeamId}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 1.5: TEAM PASS & PUBLIC SCANNER QR CODE ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <section
                className="rounded-3xl border p-5 sm:p-6 bg-white dark:bg-zinc-950/90 border-slate-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden"
                style={{
                    borderColor: theme.cardBorder,
                    boxShadow: isDark ? `0 8px 30px -10px ${theme.glow}` : `0 2px 15px -2px rgba(0,0,0,0.04)`
                }}
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left: Info & Actions */}
                    <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border"
                                style={{
                                    backgroundColor: theme.badgeBg,
                                    borderColor: theme.badgeBorder,
                                    color: theme.badgeText
                                }}
                            >
                                <QrCode className="w-3.5 h-3.5" />
                                Official Public Team Pass
                            </span>
                            <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                No Login Required to View
                            </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Scannable Team Verification QR Code
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-xl leading-relaxed">
                            Judges, organizers, and booth visitors can scan this QR code with their smartphone camera to view your verified team credentials, problem statement, roster, and live scorecard.
                        </p>

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                            <a
                                href={publicTeamUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-90"
                                style={{
                                    backgroundColor: theme.buttonBg,
                                    boxShadow: `0 4px 14px -3px ${theme.glow}`
                                }}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Public Page</span>
                            </a>

                            <button
                                type="button"
                                onClick={handleCopyPublicUrl}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                            >
                                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQrModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span>Enlarge QR Pass</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadQr}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Save PNG</span>
                            </button>
                        </div>
                    </div>

                    {/* Right: QR Code Visual Box */}
                    <div
                        onClick={() => setQrModalOpen(true)}
                        className="p-3.5 bg-white rounded-2xl border-2 border-slate-200 dark:border-zinc-700 shadow-md flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] transition-transform shrink-0 group relative"
                        title="Click to enlarge"
                    >
                        <QRCodeSVG
                            id={`team-qr-code-${teamId}`}
                            value={publicTeamUrl}
                            size={135}
                            level="H"
                            includeMargin={false}
                        />
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-black text-slate-800 tracking-wider uppercase group-hover:text-emerald-600 transition-colors">
                            <span>TEAM #{team.TeamId}</span>
                            <Maximize2 className="w-2.5 h-2.5 opacity-60" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 2: EVALUATION RESULTS & SCORECARD (OR PENDING) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {hasPublishedRounds ? (
                <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-5">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                                style={{
                                    backgroundColor: theme.iconBg,
                                    borderColor: theme.cardBorder,
                                    color: theme.iconColor
                                }}
                            >
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                        Official Evaluation Results &amp; Scorecard
                                    </h2>
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                        Published Live
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                    Round-wise marks, criteria breakdown, and jury feedback published by event organizers.
                                </p>
                            </div>
                        </div>

                        <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs self-start sm:self-auto shadow-sm">
                            <span className="text-slate-500 dark:text-gray-400">Total Score: </span>
                            <strong className="text-slate-900 dark:text-white ml-1 text-sm font-black" style={{ color: theme.accent }}>
                                {resultsData?.totalPublishedScore}
                            </strong>
                            <span className="text-slate-400 dark:text-gray-500"> / {resultsData?.totalPublishedMaxMarks} pts</span>
                        </div>
                    </div>

                    {/* Overall Podium Standing if overall results are published */}
                    {isOverallPublished && (
                        <div
                            className="rounded-2xl p-5 border relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800"
                            style={{
                                borderColor: theme.cardBorder,
                                boxShadow: isDark ? `0 8px 30px -4px ${theme.glow}` : undefined
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 border"
                                    style={{
                                        backgroundColor: resultsData.overallRank === 1 ? 'rgba(245, 158, 11, 0.15)' : theme.badgeBg,
                                        borderColor: resultsData.overallRank === 1 ? '#f59e0b' : theme.badgeBorder,
                                        color: resultsData.overallRank === 1 ? '#d97706' : theme.badgeText
                                    }}
                                >
                                    #{resultsData.overallRank}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                            Official Leaderboard Standing
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                                        {resultsData.overallRank === 1
                                            ? "1st Place Winner 🏆"
                                            : resultsData.overallRank === 2
                                            ? "2nd Place Runner Up 🥈"
                                            : resultsData.overallRank === 3
                                            ? "3rd Place Podium Finish 🥉"
                                            : `Rank #${resultsData.overallRank} Overall`}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                        Final standing across all {team.totalEventRegistrations || resultsData.totalRegistrations} participants.
                                    </p>
                                </div>
                            </div>

                            <div className="text-left sm:text-right sm:border-l sm:border-slate-200 dark:sm:border-zinc-800 sm:pl-6">
                                <span className="text-xs text-slate-500 dark:text-gray-400">Percentile</span>
                                <p className="text-2xl font-black text-slate-900 dark:text-white" style={{ color: theme.accent }}>
                                    {resultsData.percentage}%
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Published Rounds Scorecards */}
                    <div className="space-y-4">
                        {publishedRounds.map((round) => {
                            const isExpanded = expandedRoundId === round.roundId;

                            return (
                                <div
                                    key={round.roundId}
                                    className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 overflow-hidden transition-all shadow-sm"
                                >
                                    {/* Round Header */}
                                    <div
                                        onClick={() => setExpandedRoundId(isExpanded ? null : round.roundId)}
                                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/90 dark:hover:bg-zinc-900/90 transition-colors select-none"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 border"
                                                style={{
                                                    backgroundColor: theme.badgeBg,
                                                    borderColor: theme.badgeBorder,
                                                    color: theme.badgeText
                                                }}
                                            >
                                                #{round.roundOrder}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                        {round.roundName}
                                                    </h3>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                        Published
                                                    </span>
                                                </div>
                                                {round.description && (
                                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                        {round.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 shadow-sm">
                                                <span style={{ color: theme.accent }} className="font-extrabold text-base">
                                                    {round.score !== null ? round.score : "—"}
                                                </span>
                                                <span className="text-slate-400 dark:text-gray-400 font-bold text-xs">
                                                    /{round.maxMarks}
                                                </span>
                                            </div>

                                            <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-gray-400 bg-white dark:bg-transparent">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Questions Breakdown */}
                                    {isExpanded && (
                                        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-black/40 space-y-4">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5" />
                                                Evaluation Criteria Breakdown
                                            </h4>

                                            {round.questions && round.questions.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {round.questions.map((q, qIdx) => {
                                                        const hasScore = q.marksAwarded !== undefined && q.marksAwarded !== null;

                                                        return (
                                                            <div
                                                                key={q.Id}
                                                                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 hover:bg-slate-50 dark:hover:bg-zinc-900/70 transition-colors flex items-center justify-between gap-3 shadow-xs"
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800/90 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-gray-400 shrink-0">
                                                                        {qIdx + 1}
                                                                    </span>
                                                                    <div className="min-w-0">
                                                                        <span className="text-xs font-medium text-slate-800 dark:text-gray-200">
                                                                            {q.QuestionText}
                                                                        </span>
                                                                        {q.Description && (
                                                                            <span className="text-[11px] text-slate-400 dark:text-gray-500 ml-2 hidden lg:inline">
                                                                                ({q.Description})
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Marks Scored for this question */}
                                                                <div className="shrink-0">
                                                                    {hasScore ? (
                                                                        <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-zinc-950/90 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-0.5 shadow-xs">
                                                                            <span style={{ color: theme.accent }} className="font-extrabold text-xs">
                                                                                {q.marksAwarded}
                                                                            </span>
                                                                            <span className="text-slate-400 dark:text-gray-400 font-semibold text-[11px]">
                                                                                /{q.MaxMarks}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-gray-400">
                                                                            {q.MaxMarks} Marks
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}

                                            {/* Jury Feedback */}
                                            {round.feedback && (
                                                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-1">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                        <FileText className="w-3.5 h-3.5" /> Jury Feedback &amp; Remarks
                                                    </span>
                                                    <p className="text-xs text-slate-700 dark:text-gray-300 italic leading-relaxed pt-1">
                                                        &ldquo;{round.feedback}&rdquo;
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ) : (
                /* Compact Pending Banner when marks aren't published yet */
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Evaluation In Progress</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-zinc-800">
                                    Scores Pending
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                Official jury marks and rubric scores will appear here automatically once released by event organizers.
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-slate-400 dark:text-gray-500 font-medium sm:text-right shrink-0">
                        Stay tuned &bull; Results will update live
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 3: TEAM SQUAD / MEMBERS (IF TEAM EVENT) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {!isIndividual && members.length > 0 && (
                <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            Registered Team Members ({members.length})
                        </h3>
                        <span className="text-xs text-slate-400 dark:text-gray-500 font-medium">
                            Active Squad
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {members.map(member => {
                            const isLead = isTeamLead(member.Role);

                            return (
                                <div
                                    key={member.UserId}
                                    className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/60 flex items-start gap-3.5 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors shadow-xs"
                                >
                                    <div
                                        className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                                        style={{
                                            backgroundColor: theme.badgeBg,
                                            borderColor: theme.badgeBorder,
                                            color: theme.badgeText
                                        }}
                                    >
                                        {getInitial(member.UserName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={member.UserName}>
                                                {member.UserName || "Member"}
                                            </h4>
                                            {isLead ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 flex items-center gap-1">
                                                    <Crown className="w-3 h-3 text-amber-500" /> Lead
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-gray-400 shrink-0">
                                                    Member
                                                </span>
                                            )}
                                        </div>

                                        {member.Email && (
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-1 flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{member.Email}</span>
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400 mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
                                            <span className="inline-flex items-center gap-1 truncate" title={member.College || 'College'}>
                                                <Building2 className="w-3 h-3 text-slate-400 dark:text-gray-500 shrink-0" />
                                                <span className="truncate">{member.College || "Institution"}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 4: EVENT OVERVIEW, VENUE & SCHEDULE ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Event Schedule & Description */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-4 shadow-sm dark:shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                Event Overview &amp; Schedule
                            </h3>
                            {team.EventId && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/user/events/${team.EventId}`)}
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <span>Details</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase">Dates</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                                    {formatDate(team.StartDate)}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-gray-500">to {formatDate(team.EndDate)}</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase">Venue &amp; Mode</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate" title={team.Location}>
                                    {team.Location || "Campus Block"}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-gray-500">{team.ParticipationMode || "Physical"} Track</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400 uppercase">Event Type</span>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                                    {team.EventType || "Tech Fest"}
                                </p>
                                <p className="text-xs text-slate-400 dark:text-gray-500 capitalize">{team.EventStatus || "Upcoming"}</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2">Description</h4>
                            <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800/80">
                                {team.EventDescription || "No detailed description provided for this hackathon."}
                            </p>
                        </div>
                    </div>

                    {/* Physical Event Choices (Accommodation & Food) */}
                    {canAccessServices && isApprovedPhysical &&
                        (serviceAvailability.accommodationEnabled || serviceAvailability.foodEnabled) && (
                        <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-4 shadow-sm dark:shadow-xl">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    Campus Facilities (Accommodation &amp; Meals)
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                    {isIndividual
                                        ? "Choose your accommodation and food preferences for this event. Once submitted, your selection is final."
                                        : `Choose for your full team (${members.length} registered member${members.length === 1 ? "" : "s"}). Once submitted, your selection is final.`
                                    }
                                </p>
                            </div>

                            {serviceLoading ? (
                                <p className="text-xs text-slate-400">Loading options...</p>
                            ) : (
                                <div className="space-y-3">
                                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 bg-slate-50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700 transition">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(servicePreferences.accommodationRequested || servicePreferences.foodAccepted)}
                                            disabled={serviceSaving || servicePreferencesSubmitted}
                                            onChange={(event) => setServicePreferences((previous) => ({
                                                ...previous,
                                                accommodationRequested: event.target.checked,
                                                foodAccepted: event.target.checked
                                            }))}
                                            className="mt-1 accent-emerald-500 h-4 w-4 cursor-pointer"
                                        />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <BedDouble className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">&amp;</span>
                                                <Utensils className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                    Request Campus Accommodation &amp; Meal Tokens
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                                                {isIndividual
                                                    ? "Yes — request both campus hostel accommodation and daily food tokens for yourself."
                                                    : `Yes — request both campus accommodation (Boys/Girls blocks) and daily meal tokens for all ${members.length} registered member${members.length === 1 ? "" : "s"}.`
                                                }
                                            </p>
                                        </div>
                                    </label>

                                    {serviceError && <p className="text-xs text-rose-500">{serviceError}</p>}
                                    {serviceMessage && <p className="text-xs text-emerald-600 dark:text-emerald-400">{serviceMessage}</p>}

                                    {servicePreferencesSubmitted ? (
                                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Your choices have been submitted to organizers.
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={saveServicePreferences}
                                            disabled={serviceSaving || serviceLoading}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                                        >
                                            <Save className="h-3.5 w-3.5" />
                                            {serviceSaving ? "Saving..." : "Save Final Choices"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Event Poster Card */}
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-4 shadow-sm dark:shadow-xl">
                        <div
                            onClick={() => team.EventId && navigate(`/user/events/${team.EventId}`)}
                            className={`rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800/80 ${team.EventId ? 'cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition' : ''}`}
                            title="Click to view event details"
                        >
                            {team.Posters && team.Posters.length > 0 ? (
                                <img
                                    src={team.Posters[0]}
                                    alt={team.EventName || "Event Poster"}
                                    className="w-full h-64 object-cover"
                                />
                            ) : (
                                <div className="h-52 bg-slate-100 dark:bg-zinc-900 flex items-center justify-center p-4 text-center">
                                    <span className="text-xs text-slate-400 dark:text-gray-500 font-semibold">
                                        No Event Poster Available
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                                {team.EventName || "Hackathon Event"}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-gray-400">
                                {team.Location || "On-Campus Venue"}
                            </p>

                            {team.EventId && (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/user/events/${team.EventId}`)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-3 shadow-xs"
                                >
                                    <span>Open Public Event Page</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Enlarge Modal */}
            {qrModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center space-y-4">
                        <button
                            type="button"
                            onClick={() => setQrModalOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="space-y-1 pt-2">
                            <span
                                className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border"
                                style={{
                                    backgroundColor: theme.badgeBg,
                                    borderColor: theme.badgeBorder,
                                    color: theme.badgeText
                                }}
                            >
                                Official Team Pass
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                {displayName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">
                                Team #{team.TeamId} • {team.EventName}
                            </p>
                        </div>

                        <div
                            ref={qrSvgRef}
                            className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex flex-col items-center"
                        >
                            <QRCodeSVG
                                value={publicTeamUrl}
                                size={220}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        <p className="text-xs text-slate-500 dark:text-gray-400">
                            Scan with camera to view public verification and scorecard.
                        </p>

                        <div className="w-full flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={handleDownloadQr}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Download className="w-4 h-4" />
                                <span>Save Image</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleCopyPublicUrl}
                                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                                style={{ backgroundColor: theme.buttonBg }}
                            >
                                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span>{copiedLink ? "Copied!" : "Copy URL"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamInfo;
