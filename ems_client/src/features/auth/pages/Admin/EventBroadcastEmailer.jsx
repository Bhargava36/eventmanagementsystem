import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  ShieldCheck,
  RefreshCw,
  Eye,
  Megaphone,
  Radio,
  FileText,
  UserCheck,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import useToast from "../../../../Hooks/useToast";

const CATEGORIES = [
  { id: "Announcement", label: "Announcement", color: "emerald" },
  { id: "Important Alert", label: "Important Alert", color: "rose" },
  { id: "Schedule Update", label: "Schedule Update", color: "blue" },
  { id: "Venue Information", label: "Venue Information", color: "teal" },
  { id: "Emergency", label: "Emergency", color: "red" },
];

const RECIPIENT_FILTERS = [
  {
    id: "all",
    label: "All Approved Participants",
    desc: "Dispatches to every participant with an approved registration.",
    icon: Users,
  },
  {
    id: "team_leads",
    label: "Team Leads Only",
    desc: "Dispatches only to designated team leaders of registered squads.",
    icon: UserCheck,
  },
  {
    id: "checked_in",
    label: "Checked-in Participants",
    desc: "Dispatches only to participants physically checked in at venue.",
    icon: ShieldCheck,
  },
];

export default function EventBroadcastEmailer() {
  const toast = useToast();

  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin") || "{}");
    } catch {
      return {};
    }
  });

  const eventId = admin?.EventId || "";

  const [activeTab, setActiveTab] = useState("compose"); // 'compose' | 'history'
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Announcement");
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [organizerName, setOrganizerName] = useState(
    admin?.AdminName ? `${admin.AdminName} (Organizing Lead)` : "Event Organizing Team"
  );

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch broadcasts history
  const fetchBroadcastHistory = async () => {
    if (!eventId) return;
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/broadcasts`);
      const data = await res.json();
      if (res.ok && data.broadcasts) {
        setBroadcasts(data.broadcasts);
      }
    } catch (err) {
      console.error("Failed to load broadcast history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcastHistory();
  }, [eventId]);

  const handleSendBroadcast = async (e) => {
    e?.preventDefault();
    if (!eventId) {
      toast.error("No active event assigned to your admin account.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a broadcast subject line.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter your broadcast message.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          category,
          recipientFilter,
          senderAdminId: admin?.Id || admin?.id || null,
          organizerName: organizerName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to dispatch broadcast.");
      }

      toast.success(data.message || "Broadcast successfully dispatched via SMTP!");
      setSubject("");
      setMessage("");
      fetchBroadcastHistory();
      setActiveTab("history");
    } catch (err) {
      toast.error(err.message || "Failed to dispatch email broadcast.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case "Important Alert":
      case "Emergency":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "Schedule Update":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Venue Information":
        return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Event Broadcast Emailer
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  SMTP Live
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                Dispatch urgent announcements, schedules, and alerts directly to participant inboxes with responsive templates.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "compose"
                  ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Compose
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "history"
                  ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History ({broadcasts.length})
            </button>
          </div>
        </div>

        {/* Tab 1: COMPOSE BROADCAST */}
        {activeTab === "compose" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-6">
              <form
                onSubmit={handleSendBroadcast}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5"
              >
                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
                    Target Recipient Audience
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {RECIPIENT_FILTERS.map((f) => {
                      const Icon = f.icon;
                      const isSelected = recipientFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setRecipientFilter(f.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500"
                              : "bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 text-slate-700 dark:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-semibold">{f.label}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                            {f.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Pill Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
                    Announcement Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          category === cat.id
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-emerald-500/40"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="broadcast_subject"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="broadcast_subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Avishkaar 4 - Hackathon Round 1 Guidelines & Evaluation Schedule"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label
                    htmlFor="broadcast_message"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Broadcast Message Body <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="broadcast_message"
                    rows={6}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your announcement message here. Paragraph breaks will be formatted cleanly in the email..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all leading-relaxed resize-y"
                  />
                </div>

                {/* Organizer Sender Tag */}
                <div>
                  <label
                    htmlFor="broadcast_organizer"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5"
                  >
                    Dispatched By (Organizer Signature)
                  </label>
                  <input
                    id="broadcast_organizer"
                    type="text"
                    value={organizerName}
                    onChange={(e) => setOrganizerName(e.target.value)}
                    placeholder="e.g., AITAM Hackathon Organizing Committee"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                {/* Dispatch Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !subject.trim() || !message.trim()}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching via SMTP & WebSocket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Broadcast Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Email Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Recipient Email Live Preview
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Mobile & Desktop Responsive
                </span>
              </div>

              {/* Styled Mock Email Container */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                {/* Email Client Top Bar */}
                <div className="bg-slate-100 dark:bg-zinc-800/80 px-4 py-3 border-b border-slate-200 dark:border-zinc-700/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-[11px]">smtp.ayojan-mail.com</span>
                </div>

                {/* Email Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase mb-2">
                    Live Event Broadcast
                  </div>
                  <h3 className="text-lg font-bold">
                    {admin?.EventName || "Avishkaar 4 Hackathon"}
                  </h3>
                </div>

                {/* Email Body */}
                <div className="p-5 space-y-4 text-xs sm:text-sm">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                      category
                    )}`}
                  >
                    {category}
                  </span>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {subject || "Subject line will appear here..."}
                  </h4>

                  <p className="text-slate-600 dark:text-zinc-400 font-medium">
                    Dear Participant,
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-xs">
                    {message || "Your message content will be formatted and delivered to all registered participants with your custom branding."}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                    <strong>Dispatched by:</strong> {organizerName || "Event Organizing Committee"}<br />
                    <span>Sent via AYOJAN Event Broadcast Protocol.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: BROADCAST HISTORY */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Dispatched Broadcasts History
              </h2>
              <button
                type="button"
                onClick={fetchBroadcastHistory}
                disabled={historyLoading}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {broadcasts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-sm">
                No email broadcasts sent yet for this event.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {broadcasts.map((b) => (
                  <div key={b.Id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                            b.Category
                          )}`}
                        >
                          {b.Category}
                        </span>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {b.Subject}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(b.SentAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {b.Message}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-zinc-400 pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dispatched to {b.RecipientCount} participant(s)
                      </span>
                      <span>Target: <strong className="capitalize">{b.RecipientFilter}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
