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
    X,
    CreditCard,
    IndianRupee,
    Upload,
    AlertCircle,
    Eye,
    FileCheck,
    Radio,
    Video,
    ArrowRight,
    Code2,
    Target,
    GraduationCap,
    BookOpen,
    Laptop,
    Presentation,
    Mic,
    MessageSquare,
    CalendarPlus,
    HelpCircle,
    Send,
    ThumbsUp,
    Bell
} from "lucide-react";
import { API_BASE_URL } from '@/lib/api';
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from '../../../../Hooks/useAuth';
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { getEventTheme, getEventTypeInfo, isSoloTeamSize } from "../../../../lib/utils";
import useTheme from "../../../../Hooks/useTheme";
import PhysicalHackathonThemesSection from "../../../../components/Molecules/PhysicalHackathonThemesSection";
import PhysicalTeamPSActionCard from "../../../../components/Molecules/PhysicalTeamPSActionCard";
import UnifiedEventFeedbackCard from './components/UnifiedEventFeedbackCard';
import WebinarLiveQA from './components/WebinarLiveQA';
import SeminarDelegatePassCard from './components/SeminarDelegatePassCard';
import AlumniDigitalPassCard from './components/AlumniDigitalPassCard';
import ParticipantAttendanceView from './components/ParticipantAttendanceView';
import { buildGoogleCalendarUrl, downloadIcsFile } from '../../../../lib/calendarUtils';

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
    const [eventDetails, setEventDetails] = useState(null);
    const { user: authUser } = useAuth();

    const user = authUser || (() => {
        try { return JSON.parse(localStorage.getItem('user') || 'null'); }
        catch { return null; }
    })();


    // Physical services & facilities booking state
    const [serviceAvailability, setServiceAvailability] = useState({
        accommodationEnabled: false,
        foodEnabled: false,
        accommodationFee: 0,
        foodFee: 0,
        facilitiesPackageFee: 0,
        adminUpiId: '',
        adminPaymentQr: '',
        adminPaymentInstructions: ''
    });
    const [servicePreferences, setServicePreferences] = useState({
        accommodationRequested: true,
        foodAccepted: true
    });
    const [bookingDetails, setBookingDetails] = useState({
        submitted: false,
        totalAmount: 0,
        paymentRefId: '',
        paymentReceiptUrl: '',
        paymentNotes: '',
        bookingStatus: 'Pending',
        adminRemarks: '',
        bookingCreatedAt: null
    });
    const [bookingForm, setBookingForm] = useState({
        accommodationRequested: true,
        foodAccepted: true,
        paymentRefId: '',
        paymentReceiptUrl: '',
        paymentNotes: ''
    });
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [receiptUploadError, setReceiptUploadError] = useState('');
    const [receiptModalUrl, setReceiptModalUrl] = useState(null);
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [facilityModalOpen, setFacilityModalOpen] = useState(false);
    const [servicePreferencesSubmitted, setServicePreferencesSubmitted] = useState(false);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [serviceSaving, setServiceSaving] = useState(false);
    const [serviceError, setServiceError] = useState("");
    const [serviceMessage, setServiceMessage] = useState("");

    // Published Results state
    const [resultsData, setResultsData] = useState(null);
    const [loadingResults, setLoadingResults] = useState(false);
    const [expandedRoundId, setExpandedRoundId] = useState(null);

    // Problem Statement / Theme state
    const [teamProblemStatement, setTeamProblemStatement] = useState(null);
    const [loadingPs, setLoadingPs] = useState(false);
    const [eventThemes, setEventThemes] = useState([]);
    const [organizerStatements, setOrganizerStatements] = useState([]);
    const [participantStatement, setParticipantStatement] = useState(null);
    const [selectedStatement, setSelectedStatement] = useState(null);

    // Workshop Learning Hub state
    const [workshopSessions, setWorkshopSessions] = useState([]);
    const [workshopResources, setWorkshopResources] = useState([]);
    const [workshopInstructors, setWorkshopInstructors] = useState([]);
    const [loadingWorkshopHub, setLoadingWorkshopHub] = useState(false);
    const [activeWorkshopTab, setActiveWorkshopTab] = useState('curriculum');
    const [participantAttendanceStatus, setParticipantAttendanceStatus] = useState('not_marked');

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

    const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);

    const handleAddToGoogleCalendar = () => {
        const url = buildGoogleCalendarUrl({
            title: team?.EventName || 'Webinar Keynote Session',
            description: team?.EventDescription || 'Join the live interactive keynote session and Q&A panel.',
            location: 'Virtual Live Stream Room',
            startDate: team?.StartDate,
            endDate: team?.EndDate
        });
        window.open(url, '_blank');
        setCalendarDropdownOpen(false);
    };

    const handleDownloadIcs = () => {
        downloadIcsFile({
            title: team?.EventName || 'Webinar Keynote Session',
            description: team?.EventDescription || 'Join the live interactive keynote session and Q&A panel.',
            location: 'Virtual Live Stream Room',
            startDate: team?.StartDate,
            endDate: team?.EndDate
        });
        setCalendarDropdownOpen(false);
    };

    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut', delay },
    });

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
                `${API_BASE_URL}/api/teams/info/${teamId}/${userId}`
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
                        `${API_BASE_URL}/api/physical-services/teams/${teamId}/preferences?userId=${userId}`
                    );
                    const servicesData = await servicesRes.json();
                    if (servicesRes.ok && servicesData.preference) {
                        const pref = servicesData.preference;
                        const ev = servicesData.event || {};
                        setServiceAvailability({
                            accommodationEnabled: Boolean(ev.accommodationEnabled),
                            foodEnabled: Boolean(ev.foodEnabled),
                            accommodationFee: Number(ev.accommodationFee || 0),
                            foodFee: Number(ev.foodFee || 0),
                            facilitiesPackageFee: Number(ev.facilitiesPackageFee || 0),
                            adminUpiId: ev.adminUpiId || '',
                            adminPaymentQr: ev.adminPaymentQr || '',
                            adminPaymentInstructions: ev.adminPaymentInstructions || ''
                        });
                        setServicePreferences({
                            accommodationRequested: Boolean(pref.accommodationRequested),
                            foodAccepted: Boolean(pref.foodAccepted)
                        });
                        const hasSubmittedBooking = Boolean(pref.submitted && (pref.paymentRefId || pref.paymentReceiptUrl));
                        setServicePreferencesSubmitted(hasSubmittedBooking);
                        setBookingDetails({
                            submitted: hasSubmittedBooking,
                            totalAmount: Number(pref.totalAmount || 0),
                            paymentRefId: pref.paymentRefId || '',
                            paymentReceiptUrl: pref.paymentReceiptUrl || '',
                            paymentNotes: pref.paymentNotes || '',
                            bookingStatus: pref.bookingStatus || 'Pending',
                            adminRemarks: pref.adminRemarks || '',
                            bookingCreatedAt: pref.bookingCreatedAt || null
                        });
                        setBookingForm({
                            accommodationRequested: pref.accommodationRequested != null ? Boolean(pref.accommodationRequested) : true,
                            foodAccepted: pref.foodAccepted != null ? Boolean(pref.foodAccepted) : true,
                            paymentRefId: pref.paymentRefId || '',
                            paymentReceiptUrl: pref.paymentReceiptUrl || '',
                            paymentNotes: pref.paymentNotes || ''
                        });
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
                const res = await fetch(`${API_BASE_URL}/api/evaluators/teams/${teamId}/published-results`);
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

            // Fetch Problem Statement / Theme Details for Hackathons
            if (targetTeam.EventId && String(targetTeam.EventType || '').toLowerCase() === 'hackathon') {
                try {
                    setLoadingPs(true);
                    const [themesRes, statementsRes, partRes, selRes] = await Promise.all([
                        fetch(`${API_BASE_URL}/api/problem-statements/event/${targetTeam.EventId}/themes`),
                        fetch(`${API_BASE_URL}/api/problem-statements/event/${targetTeam.EventId}`),
                        fetch(`${API_BASE_URL}/api/problem-statements/event/${targetTeam.EventId}/team/${teamId}/participant-statement`),
                        fetch(`${API_BASE_URL}/api/problem-statements/event/${targetTeam.EventId}/team/${teamId}`)
                    ]);

                    if (themesRes.ok) {
                        const themesData = await themesRes.json();
                        setEventThemes(themesData.themes || []);
                    }

                    if (statementsRes.ok) {
                        const stData = await statementsRes.json();
                        setOrganizerStatements(stData.problemStatements || []);
                    }

                    const partData = partRes.ok ? await partRes.json() : null;
                    if (partData?.statement) {
                        setParticipantStatement(partData.statement);
                        setTeamProblemStatement({
                            title: partData.statement.Title,
                            theme: partData.statement.ThemeName,
                            description: partData.statement.Description,
                            techStack: partData.statement.TechStack,
                            type: 'Participant Submitted',
                            status: partData.statement.Status,
                            adminRemarks: partData.statement.AdminRemarks
                        });
                    } else {
                        setParticipantStatement(null);
                    }

                    const selData = selRes.ok ? await selRes.json() : null;
                    if (selData?.selection) {
                        setSelectedStatement(selData.selection);
                        if (!partData?.statement) {
                            setTeamProblemStatement({
                                code: selData.selection.ProblemCode,
                                title: selData.selection.ProblemTitle,
                                theme: selData.selection.Theme,
                                description: selData.selection.Description,
                                type: 'Organizer Provided',
                                status: 'Approved'
                            });
                        }
                    } else {
                        setSelectedStatement(null);
                        if (!partData?.statement) {
                            setTeamProblemStatement(null);
                        }
                    }
                } catch (psErr) {
                    console.error("Failed to fetch problem statements / themes:", psErr);
                } finally {
                    setLoadingPs(false);
                }
            }

            // Fetch Agenda, Resources & Instructors/Speakers for Workshops and Webinars
            const targetTypeInfo = getEventTypeInfo(targetTeam.EventType || '');
            if (targetTeam.EventId && (targetTypeInfo.isWorkshop || targetTypeInfo.isWebinar)) {
                try {
                    setLoadingWorkshopHub(true);
                    const apiPrefix = targetTypeInfo.isWebinar ? 'webinars' : 'workshops';
                    const effectiveUserId = targetTeam.TeamLeadUserId || currentUserId;
                    const [sessRes, resRes, instRes, attRes] = await Promise.all([
                        fetch(`${API_BASE_URL}/api/${apiPrefix}/${targetTeam.EventId}/sessions`),
                        fetch(`${API_BASE_URL}/api/${apiPrefix}/${targetTeam.EventId}/resources`),
                        fetch(`${API_BASE_URL}/api/core_team/event/${targetTeam.EventId}`),
                        effectiveUserId
                            ? fetch(`${API_BASE_URL}/api/${apiPrefix}/${targetTeam.EventId}/attendance/user/${effectiveUserId}`)
                            : Promise.resolve(null)
                    ]);

                    if (sessRes.ok) {
                        const sData = await sessRes.json();
                        setWorkshopSessions(sData.sessions || []);
                    }
                    if (resRes.ok) {
                        const rData = await resRes.json();
                        setWorkshopResources(rData.resources || []);
                    }
                    if (instRes.ok) {
                        const iData = await instRes.json();
                        setWorkshopInstructors(iData.members || []);
                    }
                    if (attRes && attRes.ok) {
                        const aData = await attRes.json();
                        const records = aData.records || [];
                        const hasPresent = records.some(r => r.Status === 'checked_in' || r.Status === 'present');
                        const hasAbsent = records.some(r => r.Status === 'absent');
                        if (hasPresent) {
                            setParticipantAttendanceStatus('present');
                        } else if (hasAbsent) {
                            setParticipantAttendanceStatus('absent');
                        } else {
                            setParticipantAttendanceStatus('not_marked');
                        }
                    }
                } catch (wsErr) {
                    console.error("Failed to fetch workshop hub data:", wsErr);
                } finally {
                    setLoadingWorkshopHub(false);
                }
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

    // Real-time updates via WebSocket for virtual status changes
    useEffect(() => {
        const eventId = teamData?.team?.EventId;
        if (!eventId) return;

        let socket = null;
        let reconnectTimer = null;
        let isMounted = true;

        const connectWS = () => {
            try {
                const wsBase = (API_BASE_URL || 'http://localhost:3000').replace(/^http/, 'ws');
                socket = new WebSocket(wsBase);

                socket.onopen = () => {
                    socket.send(JSON.stringify({ type: 'JOIN_EVENT', eventId }));
                };

                socket.onmessage = (msgEvent) => {
                    try {
                        const data = JSON.parse(msgEvent.data);
                        if (!data.eventId || String(data.eventId) === String(eventId)) {
                            fetchTeamInfo();
                        }
                    } catch (e) {
                        // Ignore parse error
                    }
                };

                socket.onclose = () => {
                    if (isMounted) {
                        reconnectTimer = setTimeout(connectWS, 3000);
                    }
                };

                socket.onerror = () => {
                    socket.close();
                };
            } catch (e) {
                console.warn('WebSocket connection failed:', e);
            }
        };

        connectWS();

        return () => {
            isMounted = false;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (socket) {
                socket.onclose = null;
                socket.close();
            }
        };
    }, [teamData?.team?.EventId, fetchTeamInfo]);

    const handleReceiptUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploadingReceipt(true);
        setReceiptUploadError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_BASE_URL}/api/upload/single`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to upload receipt');
            const url = data.fileUrl || data.url || (data.relativePath ? `${API_BASE_URL}${data.relativePath}` : '');
            setBookingForm((prev) => ({ ...prev, paymentReceiptUrl: url }));
        } catch (err) {
            setReceiptUploadError(err.message || 'Upload failed');
        } finally {
            setUploadingReceipt(false);
        }
    };

    const handleCopyUpi = () => {
        if (serviceAvailability.adminUpiId && navigator.clipboard) {
            navigator.clipboard.writeText(serviceAvailability.adminUpiId);
            setCopiedUpi(true);
            setTimeout(() => setCopiedUpi(false), 2000);
        }
    };

    const handleFacilityBookingSubmit = async (e, customTotal) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!bookingForm.paymentRefId.trim()) {
            setServiceError("Please enter your Payment Reference / UTR Number.");
            return;
        }
        if (!bookingForm.paymentReceiptUrl.trim()) {
            setServiceError("Please upload your payment screenshot/receipt.");
            return;
        }
        try {
            setServiceSaving(true);
            setServiceError("");
            setServiceMessage("");
            const response = await fetch(
                `${API_BASE_URL}/api/physical-services/teams/${teamId}/preferences`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: currentUserId,
                        accommodationRequested: true,
                        foodAccepted: true,
                        totalAmount: customTotal,
                        paymentRefId: bookingForm.paymentRefId.trim(),
                        paymentReceiptUrl: bookingForm.paymentReceiptUrl.trim(),
                        paymentNotes: bookingForm.paymentNotes.trim()
                    })
                }
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to submit booking.");
            setServiceMessage("Facility booking and payment references submitted successfully!");
            setServicePreferencesSubmitted(true);
            setBookingDetails({
                submitted: true,
                totalAmount: customTotal,
                paymentRefId: bookingForm.paymentRefId.trim(),
                paymentReceiptUrl: bookingForm.paymentReceiptUrl.trim(),
                paymentNotes: bookingForm.paymentNotes.trim(),
                bookingStatus: 'Pending',
                adminRemarks: '',
                bookingCreatedAt: new Date().toISOString()
            });
            setIsResubmitting(false);
            setFacilityModalOpen(false);
        } catch (err) {
            setServiceError(err.message || "Failed to submit booking.");
        } finally {
            setServiceSaving(false);
        }
    };

    const team = teamData?.team;
    const members = teamData?.members || [];
    const eventId = team?.EventId;

    // Theme branding calculation adapting to current mode
    const theme = useMemo(() => {
        return getEventTheme(team || {}, isDark);
    }, [team, isDark]);

    const eventObj = useMemo(() => {
        if (!team?.EventId) return null;
        return {
            Id: team.EventId,
            EventType: team.EventType,
            PhysicalPSMode: team.PhysicalPSMode || 'organizer_provided',
            PhysicalPSPublished: team.PhysicalPSPublished,
            PhysicalPSSelectionDeadline: team.PhysicalPSSelectionDeadline,
            ProblemStatementsPublished: team.ProblemStatementsPublished,
            PSSelectionDeadline: team.PSSelectionDeadline
        };
    }, [team]);

    const isIndividual = Boolean(
        isSoloTeamSize(team?.TeamSize) ||
        isSoloTeamSize(team?.EventTeamSize) ||
        String(team?.TeamName || "").toLowerCase().includes("(individual)") ||
        (Number(team?.TeamSize) === 1 && members.length <= 1)
    );

    const typeInfo = getEventTypeInfo(team?.EventType || eventObj?.EventType || '');
    const isWorkshop = typeInfo.isWorkshop;
    const isWebinar = typeInfo.isWebinar;
    const isSeminar = typeInfo.isSeminar;
    const isAlumni = typeInfo.isAlumni;
    const isSessionBased = isWorkshop || isWebinar;

    const qrPassValue = isSessionBased
        ? `${publicTeamUrl}?attendee=${team?.TeamId || teamId}&user=${currentUserId || team?.TeamLeadUserId || ''}&type=${isWebinar ? 'webinar' : 'workshop'}`
        : publicTeamUrl;

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

    const isVirtualEventLive = String(team?.VirtualStatus || '').toUpperCase() === 'LIVE';
    const isVirtualTrack = String(team?.ParticipationMode || '').toLowerCase() === 'virtual' || String(team?.HackathonMode || '').toLowerCase() === 'virtual';

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

                {/* Event Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Go to Virtual Event Page Button */}
                    {team.EventId && (isVirtualEventLive || isVirtualTrack) && (
                        <button
                            type="button"
                            onClick={() => navigate(`/user/events/${team.EventId}/virtual`)}
                            className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${isVirtualEventLive
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/40 animate-pulse'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                }`}
                        >
                            {isVirtualEventLive ? (
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                </span>
                            ) : (
                                <Radio className="w-3.5 h-3.5" />
                            )}
                            <span>{isVirtualEventLive ? 'Go to Virtual Event Page' : 'Virtual Event Hub'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* View Event Details Button */}
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
            </div>

            {/* Live Virtual Event Alert Banner */}
            {isVirtualEventLive && team.EventId && (
                <div className="rounded-3xl border border-emerald-500/40 bg-zinc-950 p-5 sm:p-6 shadow-xl shadow-emerald-950/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                            <Radio className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                    isWebinar
                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                }`}>
                                    {isWebinar ? "WEBINAR STREAM IS LIVE NOW" : "VIRTUAL EVENT IS LIVE NOW"}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{team.EventName}</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-white mt-1">
                                {isWebinar ? "Virtual Webinar Live Stream is Active!" : isWorkshop ? "Virtual Workshop Room is Active!" : "Virtual Hackathon Room is Active!"}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed mt-0.5 max-w-2xl">
                                {isWebinar
                                    ? "Join the live broadcast room, watch distinguished keynote speakers, ask questions during Q&A, and download session presentation decks."
                                    : isWorkshop
                                    ? "Join the live interactive lab session, follow code-along instructor demos, and download starter repositories."
                                    : "Join the live Google Meet session, select your problem statement, view innovation themes, and track hackathon sprint milestones."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleAddToGoogleCalendar}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs tracking-wide transition cursor-pointer active:scale-98"
                            title="Add live stream reminder to Google Calendar"
                        >
                            <CalendarPlus className="w-4 h-4 text-emerald-400" />
                            <span className="hidden sm:inline">Add to Calendar</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`/user/events/${team.EventId}/virtual`)}
                            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl text-white font-black text-xs sm:text-sm tracking-wide bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                        >
                            <Video className="w-4 h-4" />
                            <span>{isWebinar ? "Join Live Webinar Stream" : "Go to Virtual Event Page"}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {isWebinar && (
                        <div className="w-full mt-3 pt-3 border-t border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300/90 font-medium overflow-hidden">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider uppercase shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Live Ticker
                            </span>
                            <div className="truncate">
                                Keynote presentation is live. Post your questions in the Live Q&amp;A tab below to be answered by keynote speakers.
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                        {(() => {
                            const leadPhoto = primaryMember?.Photo || (members.find(m => isTeamLead(m.Role))?.Photo) || team?.TeamLeadPhoto;
                            return (
                                <div
                                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 border shadow-md relative"
                                    style={{
                                        backgroundColor: theme.primary,
                                        borderColor: theme.border,
                                        color: '#ffffff',
                                        boxShadow: `0 6px 25px -4px ${theme.glow}`
                                    }}
                                >
                                    {leadPhoto ? (
                                        <img
                                            src={leadPhoto}
                                            alt={displayName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <span className={leadPhoto ? "hidden" : "flex items-center justify-center"}>
                                        {getInitial(displayName)}
                                    </span>
                                </div>
                            );
                        })()}

                        {/* Text info */}
                        <div className="min-w-0 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-xl border"
                                    style={{
                                        backgroundColor: theme.badgeBg,
                                        borderColor: theme.badgeBorder,
                                        color: theme.badgeText
                                    }}
                                >
                                    {isWebinar ? "Webinar Delegate" : isWorkshop ? "Solo Attendee" : (isIndividual ? "Individual Participant" : `Team (${team.TeamSize} Members)`)}
                                </span>

                                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-zinc-800">
                                    {isWebinar ? "Virtual Live Stream" : `${team.ParticipationMode || "Physical"} ${isWorkshop ? "Mode" : "Track"}`}
                                </span>

                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                                    isWebinar
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isWebinar ? "bg-emerald-500" : "bg-emerald-500"}`} />
                                    {isWebinar ? "Confirmed Delegate Seat" : isWorkshop ? "Confirmed Seat" : (team.RegistrationStatus || "Approved")}
                                </span>

                                {isSessionBased && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveWorkshopTab('attendance')}
                                        className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                                            participantAttendanceStatus === 'present'
                                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                                : participantAttendanceStatus === 'absent'
                                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                                        }`}
                                        title="View your verified session attendance records"
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            participantAttendanceStatus === 'present'
                                                ? "bg-emerald-500 animate-pulse"
                                                : participantAttendanceStatus === 'absent'
                                                ? "bg-rose-500"
                                                : "bg-slate-400"
                                        }`} />
                                        <span>
                                            {participantAttendanceStatus === 'present'
                                                ? 'Attendance: Present'
                                                : participantAttendanceStatus === 'absent'
                                                ? 'Attendance: Absent'
                                                : 'Attendance: Not Marked'}
                                        </span>
                                    </button>
                                )}
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
                                {isWebinar ? "Webinar Delegates" : isWorkshop ? "Workshop Attendees" : "Total Registrations"}
                            </span>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1.5">
                                {team.totalEventRegistrations || resultsData?.totalRegistrations || 1}
                                <span className="text-xs font-normal text-slate-500 dark:text-gray-400">
                                    {isWebinar ? "Delegates" : (isIndividual || isWorkshop) ? "Attendees" : "Teams"}
                                </span>
                            </p>
                        </div>

                        <div className="h-10 w-px bg-slate-200 dark:bg-zinc-800" />

                        {/* Registration ID */}
                        <div className="space-y-1">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                {isWebinar ? "Webinar Pass ID" : isWorkshop ? "Workshop Pass ID" : (isIndividual ? "Participant ID" : "Team ID")}
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
            {!isSeminar && !isAlumni && (
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border"
                                    style={{
                                        backgroundColor: theme.badgeBg,
                                        borderColor: theme.badgeBorder,
                                        color: theme.badgeText
                                    }}
                                >
                                    <QrCode className="w-3.5 h-3.5" />
                                    {isWebinar ? "Official Webinar Delegate Pass" : isWorkshop ? "Official Workshop Entry Pass" : "Official Public Team Pass"}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                                    {isWebinar ? "Show or Scan to Verify Virtual Join" : isWorkshop ? "Present at Registration Desk" : "No Login Required to View"}
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isWebinar ? "Scannable Webinar Delegate Entry Pass" : isWorkshop ? "Scannable Workshop Attendee Entry Pass" : "Scannable Team Verification QR Code"}
                            </h2>

                            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 max-w-xl leading-relaxed">
                                {isWebinar
                                    ? "Present or scan this digital delegate pass to verify your attendance for keynote sessions and generate your webinar completion certificate."
                                    : isWorkshop
                                    ? "Present this verified QR pass at the workshop check-in desk or lab entrance for instant automated check-in and attendance recording."
                                    : "Judges, organizers, and booth visitors can scan this QR code with their smartphone camera to view your verified team credentials, problem statement, roster, and live scorecard."}
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
                                    <span>{isWebinar ? "Open Delegate Pass" : isWorkshop ? "Open Public Pass" : "Open Public Page"}</span>
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
                                value={qrPassValue}
                                size={135}
                                level="H"
                                includeMargin={false}
                            />
                            <div className="flex items-center gap-1 mt-2 text-[10px] font-black text-slate-800 tracking-wider uppercase group-hover:text-emerald-600 transition-colors">
                                <span>{isWebinar ? `DELEGATE #${team.TeamId}` : isWorkshop ? `ATTENDEE #${team.TeamId}` : `TEAM #${team.TeamId}`}</span>
                                <Maximize2 className="w-2.5 h-2.5 opacity-60" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 1.8: HACKATHON THEME & PROBLEM STATEMENT ─────── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {String(team.EventType || '').toLowerCase() === 'hackathon' && eventObj && (
                <div className="space-y-6">
                    {/* Team Problem Statement Action Card (Selection & Submission in-place) */}
                    <PhysicalTeamPSActionCard
                        event={eventObj}
                        eventTheme={theme}
                        registeredTeam={{
                            TeamId: team.Id || teamId,
                            Id: team.Id || teamId,
                            TeamName: team.TeamName
                        }}
                        isRegistered={true}
                        participantStatement={participantStatement}
                        onParticipantStatementSaved={(updated) => {
                            setParticipantStatement(updated);
                            fetchTeamInfo();
                        }}
                        organizerStatements={organizerStatements}
                        selectedStatement={selectedStatement}
                        onSelectOrganizerStatement={(locked) => {
                            setSelectedStatement(locked);
                            fetchTeamInfo();
                        }}
                        themes={eventThemes}
                    />

                    {/* Innovation Themes Display (Photo/Icon, Title, Description) */}
                    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-4">
                        <PhysicalHackathonThemesSection
                            themes={eventThemes}
                            event={eventObj}
                            eventTheme={theme}
                        />
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── PRIORITY 2: SEMINAR / WORKSHOP / WEBINAR LEARNING HUB ─── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {isAlumni ? (
                <div className="space-y-6">
                    <AlumniDigitalPassCard
                        eventId={team.EventId || eventId}
                        user={user}
                        team={team}
                    />
                </div>
            ) : isSeminar ? (
                <div className="space-y-6">
                    <SeminarDelegatePassCard
                        eventId={team.EventId || eventId}
                        user={user}
                        team={team}
                    />
                </div>
            ) : isSessionBased ? (
                <div className="space-y-0">
                    {/* Header Banner with Add-to-Calendar */}
                    <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                                style={{
                                    backgroundColor: theme.iconBg,
                                    borderColor: theme.cardBorder,
                                    color: theme.iconColor
                                }}
                            >
                                {isWebinar ? <Presentation className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                                        {isWebinar ? "Webinar Keynote Hub & Resources" : "Workshop Learning Hub & Resources"}
                                    </h2>
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                                        {isWebinar ? "Webinar Delegate Portal" : "Participant Portal"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                                    {isWebinar
                                        ? "Interactive keynote schedule, speaker slides, live Q&A panel, and session recordings."
                                        : "Interactive schedule, lecture slides, starter repositories, and trainer contact information."}
                                </p>
                            </div>
                        </div>

                        {/* Calendar Integration Menu */}
                        <div className="relative self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setCalendarDropdownOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-emerald-500/40 text-xs font-bold text-slate-700 dark:text-zinc-200 transition shadow-xs cursor-pointer active:scale-95"
                            >
                                <CalendarPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Add to Calendar</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${calendarDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {calendarDropdownOpen && (
                                <div className="absolute right-0 mt-1.5 w-56 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 shadow-xl z-30 space-y-1">
                                    <button
                                        type="button"
                                        onClick={handleAddToGoogleCalendar}
                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between transition cursor-pointer"
                                    >
                                        <span>Google Calendar</span>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadIcs}
                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between transition cursor-pointer"
                                    >
                                        <span>Apple / Outlook (.ics)</span>
                                        <Download className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── WEBSITE SIGNATURE THEME TABS ── */}
                    <div className="relative pt-4">
                        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto scrollbar-none">
                            {[
                                { id: 'curriculum', label: isWebinar ? 'Keynote Agenda' : 'Curriculum & Agenda', icon: CalendarDays },
                                { id: 'resources', label: isWebinar ? `Decks & Replays (${workshopResources.length})` : `Materials (${workshopResources.length})`, icon: Download },
                                { id: 'instructors', label: isWebinar ? `Keynote Speakers (${workshopInstructors.length})` : `Instructors (${workshopInstructors.length})`, icon: isWebinar ? Mic : GraduationCap },
                                { id: 'attendance', label: 'My Attendance', icon: UserCheck },
                                ...(isWebinar ? [{ id: 'qa', label: 'Live Q&A', icon: HelpCircle }] : []),
                                ...(isWebinar ? [{ id: 'feedback', label: 'Delegate Feedback', icon: MessageSquare }] : [])
                            ].map((tab) => {
                                const isActive = activeWorkshopTab === tab.id;
                                const TabIcon = tab.icon;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveWorkshopTab(tab.id)}
                                        className="relative h-12 px-5 sm:px-6 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
                                    >
                                        {isActive ? (
                                            <motion.div
                                                layoutId="webinarHubTabFolder"
                                                className="absolute inset-0 rounded-t-2xl bg-white dark:bg-zinc-950 border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                                                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                                            >
                                                {/* Seamless bottom mask */}
                                                <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-zinc-950 pointer-events-none z-20" />
                                            </motion.div>
                                        ) : (
                                            <div className="absolute inset-0 rounded-t-2xl bg-slate-100/90 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 z-0 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors" />
                                        )}

                                        <span
                                            className={`relative z-20 flex items-center gap-2 transition-colors ${
                                                isActive
                                                    ? 'text-slate-950 dark:text-white font-bold'
                                                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                                            }`}
                                        >
                                            <TabIcon
                                                className={`w-4 h-4 transition-colors ${
                                                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                                }`}
                                            />
                                            <span>{tab.label}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Connected Content Container */}
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-3xl rounded-tl-none border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 shadow-sm dark:shadow-xl space-y-6"
                    >

                    {/* Tab 1: Curriculum / Agenda */}
                    {activeWorkshopTab === 'curriculum' && (
                        <div className="space-y-4">
                            {workshopSessions.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3.5">
                                    {workshopSessions.map((session, idx) => (
                                        <div
                                            key={session.Id || idx}
                                            className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                                                    #{idx + 1}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                                            {session.SessionTitle || session.title}
                                                        </h4>
                                                        {session.DayNumber && (
                                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                                                Day {session.DayNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {session.Description && (
                                                        <p className="text-xs text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                                                            {session.Description}
                                                        </p>
                                                    )}
                                                    {session.SpeakerName && (
                                                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
                                                            <GraduationCap className="w-3.5 h-3.5" />
                                                            <span>Instructor: {session.SpeakerName} {session.SpeakerDesignation ? `(${session.SpeakerDesignation})` : ''}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                                {(session.StartTime || session.EndTime) && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                                                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                        {session.StartTime || ''} {session.EndTime ? `- ${session.EndTime}` : ''}
                                                    </span>
                                                )}
                                                {session.VenueOrMeetLink && (
                                                    session.VenueOrMeetLink.startsWith('http') ? (
                                                        <a
                                                            href={session.VenueOrMeetLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                                                        >
                                                            <Video className="w-3.5 h-3.5" />
                                                            <span>Join Lab</span>
                                                        </a>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {session.VenueOrMeetLink}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3 bg-slate-50/50 dark:bg-zinc-900/30">
                                    <Presentation className="w-10 h-10 mx-auto text-slate-400 dark:text-zinc-600" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                        Detailed Hands-on Syllabus Being Published
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                                        The instructors are organizing the sequence of code-along modules and hands-on lab exercises. Check back before session start!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Study Materials & Downloads */}
                    {activeWorkshopTab === 'resources' && (
                        <div className="space-y-4">
                            {workshopResources.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {workshopResources.map((res) => (
                                        <div
                                            key={res.Id}
                                            className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 flex items-start justify-between gap-3 hover:border-emerald-500/30 transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                                        {res.Title}
                                                    </h4>
                                                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                                        {res.ResourceType || 'Resource'}
                                                    </span>
                                                    {res.Description && (
                                                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                                            {res.Description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {res.ResourceUrl && (
                                                <a
                                                    href={res.ResourceUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm shrink-0"
                                                    title="Open / Download Material"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3 bg-slate-50/50 dark:bg-zinc-900/30">
                                    <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-zinc-600" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                        Learning Resources Will Be Added Soon
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                                        Presentation slides, starter code repositories, cheat sheets, and recorded sessions will be linked here directly.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Instructors & Trainers */}
                    {activeWorkshopTab === 'instructors' && (
                        <div className="space-y-4">
                            {workshopInstructors.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {workshopInstructors.map((inst, idx) => (
                                        <div
                                            key={inst.Id || idx}
                                            className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center gap-3.5 hover:border-emerald-500/30 transition-all"
                                        >
                                            {inst.Photo ? (
                                                <img
                                                    src={inst.Photo}
                                                    alt={inst.Name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-zinc-800 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-base flex items-center justify-center shrink-0">
                                                    {(inst.Name || 'I').charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                    {inst.Name}
                                                </h4>
                                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                    {inst.Role || 'Instructor'}
                                                </span>
                                                {inst.Department && (
                                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                                                        {inst.Department}
                                                    </p>
                                                )}
                                                {inst.Email && (
                                                    <a
                                                        href={`mailto:${inst.Email}`}
                                                        className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1 hover:underline"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        <span className="truncate">{inst.Email}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3 bg-slate-50/50 dark:bg-zinc-900/30">
                                    <GraduationCap className="w-10 h-10 mx-auto text-slate-400 dark:text-zinc-600" />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                        Instructor Panel Under Finalization
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                                        The faculty profiles and guest trainers delivering this workshop will be listed here.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: My Attendance (Webinars & Workshops) */}
                    {activeWorkshopTab === 'attendance' && (
                        <div className="space-y-4">
                            <ParticipantAttendanceView
                                eventId={team.EventId || eventId}
                                userId={currentUserId || team?.TeamLeadUserId || user?.Id || user?.id}
                                eventType={team.EventType || (isWebinar ? 'Webinar' : 'Workshop')}
                                sessions={workshopSessions}
                                startDate={team.StartDate}
                                endDate={team.EndDate}
                            />
                        </div>
                    )}

                    {/* Tab 4: Live Q&A (Webinar only) */}
                    {activeWorkshopTab === 'qa' && isWebinar && (
                        <div className="space-y-4">
                            <WebinarLiveQA
                                eventId={team.EventId || eventId}
                                user={user}
                                speakers={workshopInstructors}
                            />
                        </div>
                    )}

                    {/* Tab 5: Delegate Feedback (Webinar only) */}
                    {activeWorkshopTab === 'feedback' && isWebinar && (
                        <div className="space-y-4">
                            <UnifiedEventFeedbackCard
                                eventId={eventId}
                                user={user}
                                title="Webinar Delegate Feedback & Session Review"
                            />
                        </div>
                    )}
                </motion.section>
                </div>
            ) : (
                <>
                    {/* ── PRIORITY 2: EVALUATION RESULTS & SCORECARD (OR PENDING) ── */}
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
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
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
                                                <Trophy className="w-4 h-4 text-amber-500" />
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
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
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
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-zinc-800">
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
                </>
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
                                        className="h-10 w-10 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 border relative"
                                        style={{
                                            backgroundColor: theme.badgeBg,
                                            borderColor: theme.badgeBorder,
                                            color: theme.badgeText
                                        }}
                                    >
                                        {member.Photo ? (
                                            <img
                                                src={member.Photo}
                                                alt={member.UserName}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <span className={member.Photo ? "hidden" : "flex items-center justify-center"}>
                                            {getInitial(member.UserName)}
                                        </span>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={member.UserName}>
                                                {member.UserName || "Member"}
                                            </h4>
                                            {isLead ? (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 flex items-center gap-1">
                                                    <Crown className="w-3 h-3 text-amber-500" /> Lead
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-gray-400 shrink-0">
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
                                {team.EventDescription || (isWebinar ? "No detailed description provided for this webinar." : isWorkshop ? "No detailed description provided for this workshop." : "No detailed description provided for this hackathon.")}
                            </p>
                        </div>
                    </div>

                    {/* Physical Event Choices (Accommodation & Food Booking) */}
                    {canAccessServices && isApprovedPhysical && !isAlumni &&
                        (serviceAvailability.accommodationEnabled || serviceAvailability.foodEnabled) && (() => {
                            const memberCount = Math.max(1, members.length || 1);
                            const pkgFee = Number(serviceAvailability.facilitiesPackageFee || 0);
                            const accFee = Number(serviceAvailability.accommodationFee || 0);
                            const fdFee = Number(serviceAvailability.foodFee || 0);
                            const perPerson = pkgFee > 0 ? pkgFee : (accFee + fdFee);
                            const dynamicTotal = perPerson * memberCount;

                            return (
                                <>
                                    {/* On-Page Facilities Card */}
                                    <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-7 space-y-5 shadow-sm dark:shadow-xl">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <BedDouble className="w-5 h-5 text-emerald-500" />
                                                    <Utensils className="w-5 h-5 text-emerald-500" />
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                        Campus Facilities (Accommodation &amp; Meals)
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                                                    {isIndividual
                                                        ? "Hostel room accommodation and dining tokens for this event."
                                                        : `Hostel room accommodation and dining tokens for all ${memberCount} team members.`}
                                                </p>
                                            </div>

                                            {bookingDetails.submitted && (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider self-start sm:self-auto border ${bookingDetails.bookingStatus === 'Approved'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                                    : bookingDetails.bookingStatus === 'Rejected'
                                                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${bookingDetails.bookingStatus === 'Approved'
                                                        ? 'bg-emerald-500'
                                                        : bookingDetails.bookingStatus === 'Rejected'
                                                            ? 'bg-rose-500'
                                                            : 'bg-amber-500 animate-pulse'
                                                        }`} />
                                                    {bookingDetails.bookingStatus}
                                                </span>
                                            )}
                                        </div>

                                        {serviceLoading ? (
                                            <div className="py-4 text-xs text-slate-400">Loading facility details...</div>
                                        ) : bookingDetails.submitted ? (
                                            /* Submitted Status Card */
                                            <div className="space-y-4">
                                                <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${bookingDetails.bookingStatus === 'Approved'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                                                    : bookingDetails.bookingStatus === 'Rejected'
                                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
                                                    }`}>
                                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                                    <div>
                                                        <h5 className="font-bold text-sm mb-0.5">
                                                            {bookingDetails.bookingStatus === 'Approved'
                                                                ? 'Booking Approved & Confirmed!'
                                                                : bookingDetails.bookingStatus === 'Rejected'
                                                                    ? 'Payment Verification Rejected'
                                                                    : 'Payment Verification in Progress'}
                                                        </h5>
                                                        <p>
                                                            {bookingDetails.bookingStatus === 'Approved'
                                                                ? 'Your payment has been accepted by the admin. Your team is officially eligible for hostel room allocation and meal coupon tokens.'
                                                                : bookingDetails.bookingStatus === 'Rejected'
                                                                    ? `Admin remarks: ${bookingDetails.adminRemarks || 'Payment reference could not be verified. Please check details and re-submit.'}`
                                                                    : 'Your payment reference and proof have been submitted. Once the organizers verify and accept your payment, your squad will become eligible for room allocation and food tokens.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Transferred</span>
                                                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            ₹{bookingDetails.totalAmount}
                                                        </p>
                                                    </div>

                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                                                        <span className="text-[10px] uppercase font-bold text-slate-400">Payment Ref / UTR</span>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono truncate" title={bookingDetails.paymentRefId}>
                                                            {bookingDetails.paymentRefId || 'N/A'}
                                                        </p>
                                                    </div>

                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Receipt Proof</span>
                                                            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">Uploaded</p>
                                                        </div>
                                                        {bookingDetails.paymentReceiptUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setReceiptModalUrl(bookingDetails.paymentReceiptUrl)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-gray-200 flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-zinc-700 shadow-2xs"
                                                            >
                                                                <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span>View</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {bookingDetails.bookingStatus !== 'Approved' && (
                                                    <div className="pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFacilityModalOpen(true)}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 cursor-pointer"
                                                        >
                                                            <span>Update or re-upload payment proof</span>
                                                            <span>&rarr;</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Not Submitted: Clean Action Card with Rates & Book Button */
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {serviceAvailability.accommodationEnabled && (
                                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Hostel Fee</span>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                                                ₹{accFee} <span className="text-[10px] font-normal text-slate-400">/ person / night</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    {serviceAvailability.foodEnabled && (
                                                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Food Pass</span>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                                                ₹{fdFee} <span className="text-[10px] font-normal text-slate-400">/ person</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 col-span-2 sm:col-span-1">
                                                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Total ({memberCount} Squad)</span>
                                                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            ₹{dynamicTotal}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
                                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                                        Click below to view payment channels, scan Admin QR, and submit reference.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFacilityModalOpen(true)}
                                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
                                                    >
                                                        <BedDouble className="w-4 h-4" />
                                                        <span>Book Facilities (Pay ₹{dynamicTotal})</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* MODAL: CAMPUS FACILITIES BOOKING */}
                                    {facilityModalOpen && (
                                        <div
                                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                                            onClick={() => setFacilityModalOpen(false)}
                                        >
                                            <div
                                                className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 max-h-[92vh] overflow-y-auto"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Modal Header */}
                                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                                            <BedDouble className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                                Book Campus Facilities (Hostel &amp; Meals)
                                                            </h3>
                                                            <p className="text-xs text-slate-500 dark:text-gray-400">
                                                                {isIndividual ? "Individual participant booking" : `Squad booking for all ${memberCount} members`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFacilityModalOpen(false)}
                                                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Pricing Summary */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                                    {serviceAvailability.accommodationEnabled && (
                                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Hostel Fee</span>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                                                ₹{accFee} <span className="text-[10px] font-normal text-slate-400">/ night</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    {serviceAvailability.foodEnabled && (
                                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                                                            <span className="text-[10px] uppercase font-bold text-slate-400">Food Pass</span>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                                                                ₹{fdFee} <span className="text-[10px] font-normal text-slate-400">/ person</span>
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 col-span-2 sm:col-span-1">
                                                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Total Payable</span>
                                                        <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            ₹{dynamicTotal}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Admin Payment Details */}
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                                                        <CreditCard className="w-4 h-4 text-emerald-500" />
                                                        Admin Payment Details
                                                    </span>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                                        <div className="space-y-2">
                                                            {serviceAvailability.adminUpiId ? (
                                                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                                                                    <div>
                                                                        <span className="text-[10px] uppercase font-bold text-slate-400">UPI ID</span>
                                                                        <p className="text-xs font-black text-slate-900 dark:text-white font-mono">
                                                                            {serviceAvailability.adminUpiId}
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleCopyUpi}
                                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-gray-200 transition flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                        <span>{copiedUpi ? "Copied" : "Copy"}</span>
                                                                    </button>
                                                                </div>
                                                            ) : null}

                                                            {serviceAvailability.adminPaymentInstructions && (
                                                                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-zinc-800/60">
                                                                    <span className="font-bold text-slate-800 dark:text-zinc-200">Note: </span>
                                                                    {serviceAvailability.adminPaymentInstructions}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {serviceAvailability.adminPaymentQr && (
                                                            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                                                                <span className="text-[10px] font-bold text-slate-400 mb-1">Scan &amp; Pay</span>
                                                                <img
                                                                    src={serviceAvailability.adminPaymentQr}
                                                                    alt="Admin Payment QR"
                                                                    className="max-h-28 object-contain rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer"
                                                                    onClick={() => setReceiptModalUrl(serviceAvailability.adminPaymentQr)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Form (NO CHECKBOXES) */}
                                                <form onSubmit={(e) => handleFacilityBookingSubmit(e, dynamicTotal)} className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                                                            Payment UTR / Transaction Reference ID *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="e.g. 428910294821 or UPI Ref ID"
                                                            value={bookingForm.paymentRefId}
                                                            onChange={(e) => setBookingForm(prev => ({ ...prev, paymentRefId: e.target.value }))}
                                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                                                            Payment Screenshot / Receipt *
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <label className="flex-1 h-10 px-3.5 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 cursor-pointer transition">
                                                                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                                                                <span>{uploadingReceipt ? "Uploading..." : bookingForm.paymentReceiptUrl ? "Replace File" : "Choose Image/PDF"}</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*,application/pdf"
                                                                    className="hidden"
                                                                    onChange={handleReceiptUpload}
                                                                    disabled={uploadingReceipt}
                                                                />
                                                            </label>
                                                            {bookingForm.paymentReceiptUrl && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setReceiptModalUrl(bookingForm.paymentReceiptUrl)}
                                                                    className="h-10 px-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {receiptUploadError && <p className="text-xs text-rose-500 mt-1">{receiptUploadError}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                                                            Special Notes (Optional)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="Any special requests or dietary constraints"
                                                            value={bookingForm.paymentNotes}
                                                            onChange={(e) => setBookingForm(prev => ({ ...prev, paymentNotes: e.target.value }))}
                                                            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                                        />
                                                    </div>

                                                    {serviceError && <p className="text-xs text-rose-500">{serviceError}</p>}
                                                    {serviceMessage && <p className="text-xs text-emerald-600 dark:text-emerald-400">{serviceMessage}</p>}

                                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                                                        <button
                                                            type="button"
                                                            onClick={() => setFacilityModalOpen(false)}
                                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={serviceSaving || uploadingReceipt}
                                                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                                                        >
                                                            <Save className="w-3.5 h-3.5" />
                                                            <span>{serviceSaving ? "Submitting..." : `Submit Booking (Pay ₹${dynamicTotal})`}</span>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
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
                                className="inline-block px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border"
                                style={{
                                    backgroundColor: theme.badgeBg,
                                    borderColor: theme.badgeBorder,
                                    color: theme.badgeText
                                }}
                            >
                                {isWebinar ? "Official Webinar Pass" : isWorkshop ? "Official Workshop Pass" : "Official Team Pass"}
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                {displayName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">
                                {isWebinar ? `Delegate #${team.TeamId} • ${team.EventName}` : isWorkshop ? `Attendee #${team.TeamId} • ${team.EventName}` : `Team #${team.TeamId} • ${team.EventName}`}
                            </p>
                        </div>

                        <div
                            ref={qrSvgRef}
                            className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex flex-col items-center"
                        >
                            <QRCodeSVG
                                value={qrPassValue}
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

            {/* Receipt / QR Preview Modal */}
            {receiptModalUrl && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setReceiptModalUrl(null)}
                >
                    <div
                        className="relative max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl p-4 shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setReceiptModalUrl(null)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-200 transition cursor-pointer z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-full text-center pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Document Preview</h4>
                        </div>
                        <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2">
                            {receiptModalUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={receiptModalUrl}
                                    className="w-full h-[65vh] rounded-xl"
                                    title="Receipt PDF"
                                />
                            ) : (
                                <img
                                    src={receiptModalUrl}
                                    alt="Payment Receipt"
                                    className="max-w-full max-h-[70vh] object-contain rounded-xl"
                                />
                            )}
                        </div>
                        <div className="pt-3">
                            <a
                                href={receiptModalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Open Full Document in New Tab</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {!isSeminar && !isWebinar && !isAlumni && (
                <motion.section {...fadeUp(0.16)}>
                    <UnifiedEventFeedbackCard 
                        eventId={eventId}
                        user={user} 
                    />
                </motion.section>
            )}
        </div>
    );
}

export default TeamInfo;
