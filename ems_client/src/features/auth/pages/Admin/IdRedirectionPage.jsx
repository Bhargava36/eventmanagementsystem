import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from '@/lib/api';
import VisualParticipantCardPreview from "@/features/id_card/components/VisualParticipantCardPreview";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IdCard,
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  CalendarDays,
  Eye,
  X,
  RefreshCw,
  LogIn,
  LogOut,
  Scan,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Palette,
} from "lucide-react";
import IdCardDesigner from "@/features/id_card/components/IdCardDesigner";
import BulkGenerationModal from "@/features/id_card/components/BulkGenerationModal";

const getAssignedEventId = () => {
  try {
    return String(JSON.parse(localStorage.getItem("admin") || "null")?.EventId || "");
  } catch {
    return "";
  }
};

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.participants)) return data.participants;
  if (Array.isArray(data?.data?.participants)) return data.data.participants;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.events)) return data.events;
  if (Array.isArray(data?.teams)) return data.teams;
  return [];
};

const getValue = (object, ...keys) => {
  for (const key of keys) {
    const value = object?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
};

const getName = (participant) =>
  getValue(
    participant,
    "ParticipantName",
    "UserName",
    "Name",
    "participantName",
    "userName",
    "name"
  ) || "Participant";

const getUserId = (participant) =>
  getValue(participant, "UserId", "userId", "Id", "id");

const getCardId = (participant) =>
  getValue(
    participant,
    "IdCardNumber",
    "idCardNumber",
    "CardNumber",
    "cardNumber"
  );

const isGenerated = (participant) => {
  const cardId = getCardId(participant);
  const status = participant?.IdCardGenerated ?? participant?.idCardGenerated;
  return Boolean(cardId) || status === true || status === 1 || status === "1";
};

const formatDate = (value) => {
  if (!value) return "Date not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function IdRedirectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId")?.trim() || getAssignedEventId();

  const [admin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || "{}");
    } catch {
      return {};
    }
  });

  // Main View Switcher: 'attendance' | 'id-cards' | 'designer'
  const [activeView, setActiveView] = useState(() => searchParams.get("view") || "attendance");

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState("all"); // 'all' | 'checked_in' | 'checked_out' | 'pending'
  const [selected, setSelected] = useState(null);

  // Live Barcode / QR Scanner Input State
  const [scanQuery, setScanQuery] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanFeedback, setScanFeedback] = useState(null);

  const idCardEnabled =
    event?.IDCardEnabled ?? event?.idCardEnabled ??
    event?.EnableIDCard ?? event?.enableIDCard ?? false;

  const isFeatureEnabled =
    idCardEnabled === true || idCardEnabled === 1 || idCardEnabled === "1";

  const loadData = useCallback(async () => {
    if (!/^[1-9]\d*$/.test(eventId)) {
      setLoading(false);
      setError("A valid event ID is required to manage ID cards.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [eventRes, participantsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(eventId)}`),
        fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/participants`),
      ]);

      const [eventData, participantsData] = await Promise.all([
        eventRes.json().catch(() => ({})),
        participantsRes.json().catch(() => ({})),
      ]);

      if (!eventRes.ok) {
        throw new Error(eventData.message || "Failed to fetch event details.");
      }

      if (!participantsRes.ok) {
        throw new Error(participantsData.message || "Failed to fetch participants.");
      }

      setEvent(eventData?.event || eventData?.data || eventData || null);
      setParticipants(getArray(participantsData));

      // Fetch Templates for this event
      try {
        const tRes = await fetch(`${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/templates`);
        const tData = await tRes.json();
        const tList = Array.isArray(tData.templates) ? tData.templates : [];
        setTemplates(tList);
        if (tList.length > 0) {
          setActiveTemplate(tList.find((t) => t.IsDefault) || tList[0]);
        }
      } catch (tErr) {
        console.error("Failed to fetch templates:", tErr);
      }
    } catch (err) {
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeView === "id-cards") {
      loadData();
    }
  }, [activeView, loadData]);

  // ID Cards stats
  const cardStats = useMemo(() => {
    const teams = new Set(
      participants
        .map((p) => getValue(p, "TeamId", "teamId", "TeamName", "teamName"))
        .filter(Boolean)
    );
    const generated = participants.filter(isGenerated).length;
    return {
      teams: teams.size,
      total: participants.length,
      generated,
      pending: participants.length - generated,
    };
  }, [participants]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const checkedIn = participants.filter((p) => p.AttendanceStatus === "checked_in").length;
    const checkedOut = participants.filter((p) => p.AttendanceStatus === "checked_out").length;
    const pending = participants.filter(
      (p) => !p.AttendanceStatus || p.AttendanceStatus === "not_checked_in"
    ).length;
    return {
      total: participants.length,
      checkedIn,
      checkedOut,
      pending,
    };
  }, [participants]);

  // Filtered participants for ID cards tab
  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return participants.filter((participant) => {
      const generated = isGenerated(participant);
      const matchesFilter =
        filter === "all" ||
        (filter === "generated" && generated) ||
        (filter === "pending" && !generated);

      const searchableText = [
        getName(participant),
        getValue(participant, "Email", "email"),
        getValue(participant, "TeamName", "teamName"),
        getValue(participant, "College", "college"),
        getCardId(participant),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchableText.includes(query);
    });
  }, [participants, filter, search]);

  // Filtered participants for Attendance tab
  const filteredAttendanceParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();
    return participants.filter((participant) => {
      const status = participant?.AttendanceStatus || "not_checked_in";
      const matchesFilter =
        attendanceFilter === "all" ||
        (attendanceFilter === "checked_in" && status === "checked_in") ||
        (attendanceFilter === "checked_out" && status === "checked_out") ||
        (attendanceFilter === "pending" && status === "not_checked_in");

      const searchableText = [
        getName(participant),
        getValue(participant, "Email", "email"),
        getValue(participant, "TeamName", "teamName"),
        getValue(participant, "College", "college"),
        getCardId(participant),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && searchableText.includes(query);
    });
  }, [participants, attendanceFilter, search]);

  // Generate ID cards
  async function generateCards() {
    if (!/^[1-9]\d*$/.test(eventId)) {
      setError("A valid event ID is required.");
      return;
    }
    if (participants.length === 0) {
      setError("No eligible participants are available for this event.");
      return;
    }
    if (cardStats.pending === 0) {
      setMessage("All participant ID cards have already been generated.");
      return;
    }

    setGenerating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/id-cards/events/${encodeURIComponent(eventId)}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "ID card generation failed.");
      }

      setMessage(
        result.message ||
          `ID card generation completed. Generated: ${result.generated ?? "check updated list"}.`
      );
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to generate ID cards.");
    } finally {
      setGenerating(false);
    }
  }

  // Handle Gate Check-in
  const handleCheckIn = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          checkedInBy: admin?.AdminName || "Admin Gate",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check in");
      setScanFeedback({ type: "success", message: data.message });
      await loadData();
    } catch (err) {
      setScanFeedback({ type: "error", message: err.message });
    }
  };

  // Handle Gate Check-out
  const handleCheckOut = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          checkedOutBy: admin?.AdminName || "Admin Gate",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to check out");
      setScanFeedback({ type: "success", message: data.message });
      await loadData();
    } catch (err) {
      setScanFeedback({ type: "error", message: err.message });
    }
  };

  // Handle Reset Attendance
  const handleReset = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/reset-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(userId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset attendance");
      setScanFeedback({ type: "success", message: data.message });
      await loadData();
    } catch (err) {
      setScanFeedback({ type: "error", message: err.message });
    }
  };

  // Handle Barcode / QR / ID Scan Submit
  const handleScanSubmit = async (e) => {
    e?.preventDefault();
    const clean = scanQuery.trim();
    if (!clean) return;

    setScanLoading(true);
    setScanFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${eventId}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idCardNumber: clean,
          operatorName: admin?.AdminName || "Admin Gate Scanner",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Scan failed");

      setScanFeedback({
        type: "success",
        message: data.message,
        action: data.action,
        name: data.participantName,
        team: data.teamName,
      });
      setScanQuery("");
      await loadData();
    } catch (err) {
      setScanFeedback({ type: "error", message: err.message });
    } finally {
      setScanLoading(false);
    }
  };

  const eventName = getValue(event, "EventName", "eventName", "Name", "name") || "AYOJAN Event";
  const startDate = getValue(event, "StartDate", "startDate", "EventDate");
  const endDate = getValue(event, "EndDate", "endDate") || startDate;
  const location = getValue(event, "Location", "location", "Venue", "venue") || "Venue not available";
  const themeColor = getValue(event, "PrimaryColor", "ThemeColor", "themeColor") || "#10B981";

  return (
    <div className="min-h-screen w-full bg-[#F4F6FA] dark:bg-black p-4 font-sans text-slate-900 dark:text-white sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate("/admin/physical-event")}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 transition hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Physical Event
        </button>

        {/* Section Header Banner */}
        {activeView !== "designer" ? (
          <section className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {activeView === "attendance" ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : (
                    <IdCard className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
                    Event Ground Operations
                  </p>
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                    {activeView === "attendance" ? "Gate Check-in & Check-out Tracking" : "ID Card Generation & Passes"}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                <strong className="text-slate-900 dark:text-white">{eventName}</strong>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(startDate)} – {formatDate(endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              </div>
            </div>

            {/* Primary View Switcher Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveView("attendance")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === "attendance"
                    ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Check-in / Check-out ({attendanceStats.checkedIn}/{attendanceStats.total})
              </button>
              <button
                type="button"
                onClick={() => setActiveView("id-cards")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === "id-cards"
                    ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <IdCard className="w-4 h-4" />
                ID Cards & Passes
              </button>
              <button
                type="button"
                onClick={() => setActiveView("designer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeView === "designer"
                    ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Palette className="w-4 h-4 text-emerald-500" />
                Visual ID Designer
              </button>
            </div>
          </section>
        ) : (
          <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Visual ID Card Designer Studio
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {eventName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Custom drag-and-drop ID badge designer with dynamic data binding & high-res print export
                </p>
              </div>
            </div>

            {/* Compact Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
              <button
                type="button"
                onClick={() => setActiveView("attendance")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Gate
              </button>
              <button
                type="button"
                onClick={() => setActiveView("id-cards")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5" />
                Passes List
              </button>
              <button
                type="button"
                onClick={() => setActiveView("designer")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-emerald-500" />
                Designer Studio
              </button>
            </div>
          </section>
        )}

        {/* Alerts & Messages */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-sm text-emerald-800 dark:text-emerald-400">
            {message}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: GATE ATTENDANCE (CHECK-IN & CHECK-OUT)               */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeView === "attendance" && (
          <div className="space-y-6">
            {/* Top 4 Attendance Metric Cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Total Eligible Participants
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {loading ? "—" : attendanceStats.total}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <LogIn className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Currently Checked In
                </p>
                <p className="mt-1 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {loading ? "—" : attendanceStats.checkedIn}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <LogOut className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Currently Checked Out
                </p>
                <p className="mt-1 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {loading ? "—" : attendanceStats.checkedOut}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-zinc-400">
                  <Clock className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Pending Gate Check-in
                </p>
                <p className="mt-1 text-3xl font-extrabold text-slate-600 dark:text-zinc-300">
                  {loading ? "—" : attendanceStats.pending}
                </p>
              </div>
            </section>

            {/* Quick Barcode / QR / ID Scanner Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <form onSubmit={handleScanSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Scan className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Live Gate Scanner (Instant Check-in & Check-out)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Scan badge barcode with a handheld scanner or enter ID Card number (e.g. EV22-U15) to toggle gate status.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                    Scanner Ready
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Scan className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      value={scanQuery}
                      onChange={(e) => setScanQuery(e.target.value)}
                      placeholder="Scan or type ID Card number (e.g. EV22-U15)..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={scanLoading || !scanQuery.trim()}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {scanLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Scan className="w-4 h-4" />
                    )}
                    Quick Check-in / Out
                  </button>
                </div>

                {scanFeedback && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between ${
                      scanFeedback.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <span>{scanFeedback.message}</span>
                    <button
                      type="button"
                      onClick={() => setScanFeedback(null)}
                      className="text-xs opacity-70 hover:opacity-100 underline ml-2 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Attendance Table Section */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 p-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    ["all", `All (${attendanceStats.total})`],
                    ["checked_in", `Checked In (${attendanceStats.checkedIn})`],
                    ["checked_out", `Checked Out (${attendanceStats.checkedOut})`],
                    ["pending", `Pending (${attendanceStats.pending})`],
                  ].map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAttendanceFilter(val)}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                        attendanceFilter === val
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, team, ID card..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 py-2.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-zinc-800/40">
                    <tr>
                      {[
                        "Participant",
                        "Team & College",
                        "Pass Number",
                        "Gate Status",
                        "Check-in Timestamp",
                        "Check-out Timestamp",
                        "Gate Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {loading && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                          Loading attendance list...
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filteredAttendanceParticipants.map((p, idx) => {
                        const status = p.AttendanceStatus || "not_checked_in";
                        const isUserCheckedIn = status === "checked_in";
                        const isUserCheckedOut = status === "checked_out";

                        return (
                          <tr
                            key={getUserId(p) || p.IdCardNumber || p.RegistrationId || `part-${idx}`}
                            className="transition hover:bg-slate-50/80 dark:hover:bg-zinc-800/30"
                          >
                            {/* Participant */}
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900 dark:text-white">
                                {getName(p)}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400">
                                {getValue(p, "Email", "email")}
                              </p>
                            </td>

                            {/* Team & College */}
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800 dark:text-zinc-200">
                                {getValue(p, "TeamName", "teamName") || "Individual"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[180px]">
                                {getValue(p, "College", "college") || "—"}
                              </p>
                            </td>

                            {/* ID Number */}
                            <td className="px-6 py-4 font-mono text-xs text-slate-700 dark:text-zinc-300">
                              {getCardId(p) || (
                                <span className="text-orange-500 font-sans">Pending</span>
                              )}
                            </td>

                            {/* Gate Status Badge */}
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                                  isUserCheckedIn
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                    : isUserCheckedOut
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                                }`}
                              >
                                {isUserCheckedIn ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Checked In
                                  </>
                                ) : isUserCheckedOut ? (
                                  <>
                                    <LogOut className="w-3.5 h-3.5" />
                                    Checked Out
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    Not Checked In
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Check-in Timestamp */}
                            <td className="px-6 py-4 text-xs font-mono">
                              {p.CheckInTime ? (
                                <div>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                    {formatDate(p.CheckInTime)}
                                  </span>{" "}
                                  <span className="text-slate-500 dark:text-zinc-400">
                                    at {formatTime(p.CheckInTime)}
                                  </span>
                                  {p.CheckedInBy && (
                                    <p className="text-[10px] text-slate-400 font-sans">
                                      by {p.CheckedInBy}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-zinc-500">—</span>
                              )}
                            </td>

                            {/* Check-out Timestamp */}
                            <td className="px-6 py-4 text-xs font-mono">
                              {p.CheckOutTime ? (
                                <div>
                                  <span className="text-amber-700 dark:text-amber-400 font-semibold">
                                    {formatDate(p.CheckOutTime)}
                                  </span>{" "}
                                  <span className="text-slate-500 dark:text-zinc-400">
                                    at {formatTime(p.CheckOutTime)}
                                  </span>
                                  {p.CheckedOutBy && (
                                    <p className="text-[10px] text-slate-400 font-sans">
                                      by {p.CheckedOutBy}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-zinc-500">—</span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                {!isUserCheckedIn ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCheckIn(p.UserId)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                    {isUserCheckedOut ? "Re-Enter" : "Check In"}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleCheckOut(p.UserId)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                                  >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Check Out
                                  </button>
                                )}

                                {(isUserCheckedIn || isUserCheckedOut) && (
                                  <button
                                    type="button"
                                    onClick={() => handleReset(p.UserId)}
                                    title="Reset status"
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {!loading && filteredAttendanceParticipants.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                          No participants match this filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: ID CARDS & PASSES (ORIGINAL GENERATOR & PREVIEW)     */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeView === "id-cards" && (
          <div className="space-y-6">
            {/* ID Cards Generation Control Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Participant Badges & Verification Cards
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Generate digital ID cards with verifiable QR codes for all approved physical hackathon participants.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView("designer")}
                  className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <Palette className="h-4 w-4 text-emerald-500" />
                  <span>Design ID Template</span>
                </button>

                <button
                  type="button"
                  disabled={loading || !isFeatureEnabled || participants.length === 0}
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                  style={{ backgroundColor: themeColor }}
                >
                  <IdCard className="h-4 w-4" />
                  <span>GENERATE ALL ID CARDS</span>
                </button>
              </div>
            </div>

            {/* ID Cards 4 Metric Cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Registered Teams", value: cardStats.teams, Icon: Users },
                { label: "Generated ID Cards", value: cardStats.generated, Icon: CheckCircle2 },
                { label: "Pending ID Cards", value: cardStats.pending, Icon: Clock },
                { label: "Total Participants", value: cardStats.total, Icon: Users },
              ].map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    {React.createElement(Icon, {
                      className: "h-5 w-5",
                      style: { color: themeColor },
                    })}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                    {loading ? "—" : value}
                  </p>
                </div>
              ))}
            </section>

            {/* ID Cards Table */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {[
                    ["all", `All (${cardStats.total})`],
                    ["generated", `Generated (${cardStats.generated})`],
                    ["pending", `Pending (${cardStats.pending})`],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                        filter === value
                          ? "text-white"
                          : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      }`}
                      style={filter === value ? { backgroundColor: themeColor } : {}}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search participant, team..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 py-2.5 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-500 transition"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-zinc-800/40">
                    <tr>
                      {["Participant", "ID Number", "Team", "College", "Card Status", "Actions"].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {loading && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                          Loading participants...
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filteredParticipants.map((participant, index) => (
                        <tr
                          key={getUserId(participant) || participant.IdCardNumber || participant.RegistrationId || `card-${index}`}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-zinc-800/30"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {getName(participant)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              {getValue(participant, "Email", "email")}
                            </p>
                          </td>

                          <td className="px-6 py-4 font-mono text-xs text-slate-800 dark:text-zinc-200">
                            {getCardId(participant) || "Pending"}
                          </td>

                          <td className="px-6 py-4 text-slate-800 dark:text-zinc-200">
                            {getValue(participant, "TeamName", "teamName") || "Individual"}
                          </td>

                          <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                            {getValue(participant, "College", "college") || "—"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                                isGenerated(participant)
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                              }`}
                            >
                              {isGenerated(participant) ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              {isGenerated(participant) ? "Generated" : "Pending"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              type="button"
                              disabled={!isGenerated(participant)}
                              onClick={() => setSelected(participant)}
                              title="View ID card"
                              className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                              style={{ color: themeColor }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                    {!loading && filteredParticipants.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                          No participants found for this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Modal: ID Card Visual Preview with Saved Designer Template */}
        {selected && (
          <VisualParticipantCardPreview
            participant={selected}
            template={activeTemplate}
            event={event}
            onClose={() => setSelected(null)}
          />
        )}
        {/* ══════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: VISUAL ID CARD DESIGNER STUDIO                       */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeView === "designer" && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-2xl h-[calc(100vh-140px)] min-h-[680px]">
            <IdCardDesigner
              eventId={eventId}
              onBack={() => {
                setActiveView("id-cards");
                loadData();
              }}
              onSaveTemplate={(savedTpl) => {
                setActiveTemplate(savedTpl);
                loadData();
              }}
            />
          </div>
        )}

        {/* Modal: Bulk Generation */}
        <BulkGenerationModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          eventId={eventId}
          event={event}
          template={activeTemplate}
          onCompleted={() => loadData()}
        />
      </div>
    </div>
  );
}