import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  RefreshCw,
  Eye,
  Megaphone,
  Radio,
  FileText,
  UserCheck,
  GraduationCap,

} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import useToast from "../../../../Hooks/useToast";
import { getEventTypeInfo } from "../../../../lib/utils";

const ALUMNI_CATEGORIES = [
  { id: "Reunion Announcement", label: "Reunion Announcement" },
  { id: "Gate Pass & Banquet", label: "Gate Pass & Banquet Entry" },
  { id: "Reunion Schedule", label: "Reunion Schedule & Agenda" },
  { id: "Nostalgia & Memories", label: "Memories Wall & Photos" },
  { id: "Alumni Giving", label: "Endowment & Alumni Giving" },
  { id: "Important Notice", label: "Important Notice" },
  { id: "Emergency", label: "Urgent Notification" },
];

const WORKSHOP_CATEGORIES = [
  { id: "Announcement", label: "Announcement" },
  { id: "Important Alert", label: "Important Alert" },
  { id: "Schedule Update", label: "Schedule Update" },
  { id: "Venue Information", label: "Venue Information" },
  { id: "Study Materials", label: "Study Materials & Code" },
  { id: "Emergency", label: "Emergency" },
];

const WEBINAR_CATEGORIES = [
  { id: "Live Broadcast Link", label: "Live Broadcast Link" },
  { id: "Keynote Announcement", label: "Keynote Announcement" },
  { id: "Speaker Spotlight", label: "Speaker Spotlight" },
  { id: "Schedule & Timings", label: "Schedule & Timings" },
  { id: "Slide Decks & Replays", label: "Slide Decks & Replays" },
  { id: "Delegate Feedback", label: "Delegate Feedback & Certificate" },
  { id: "Emergency", label: "Urgent Notification" },
];

const SEMINAR_CATEGORIES = [
  { id: "Keynote Announcement", label: "Keynote Announcement" },
  { id: "Auditorium & Gate Pass", label: "Auditorium & Gate Pass" },
  { id: "Conference Schedule", label: "Conference Schedule & Timetable" },
  { id: "Proceedings & Slides", label: "Proceedings & Presentation Slides" },
  { id: "Delegate Certificate", label: "Delegate Feedback & Certificate" },
  { id: "Important Notice", label: "Important Notice" },
  { id: "Emergency", label: "Urgent Notification" },
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
  const typeInfo = getEventTypeInfo(admin?.EventType);

  const CATEGORIES = typeInfo.isAlumni
    ? ALUMNI_CATEGORIES
    : typeInfo.isSeminar 
    ? SEMINAR_CATEGORIES 
    : typeInfo.isWebinar 
    ? WEBINAR_CATEGORIES 
    : WORKSHOP_CATEGORIES;

  const [activeTab, setActiveTab] = useState("compose"); // 'compose' | 'history'
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState(
    typeInfo.isAlumni
      ? "Reunion Announcement"
      : typeInfo.isSeminar 
      ? "Keynote Announcement" 
      : typeInfo.isWebinar 
      ? "Live Broadcast Link" 
      : "Announcement"
  );
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [organizerName, setOrganizerName] = useState(
    admin?.AdminName 
      ? `${admin.AdminName} (${typeInfo.isAlumni ? 'Alumni Relations Chair' : typeInfo.isSeminar ? 'Conference Chair' : typeInfo.isWebinar ? 'Webinar Host' : typeInfo.isWorkshop ? 'Workshop Lead' : 'Organizing Lead'})` 
      : (typeInfo.isAlumni ? "Alumni Relations & Homecoming Committee" : typeInfo.isSeminar ? "Seminar Organizing Committee" : typeInfo.isWebinar ? "Webinar Organizing Team" : "Event Organizing Team")
  );

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);

  // Audience filters tailored for Alumni vs Seminar vs Webinar vs Workshop vs Hackathon
  const recipientFilters = typeInfo.isAlumni
    ? [
        {
          id: "all",
          label: "All Registered Alumni",
          desc: "Dispatches to every registered alumnus across all graduating batches.",
          icon: Users,
        },
        {
          id: "confirmed_rsvp",
          label: "Confirmed RSVPs (Attending)",
          desc: "Dispatches only to alumni who confirmed their attendance for Homecoming.",
          icon: CheckCircle2,
        },
        {
          id: "tentative_rsvp",
          label: "Tentative RSVPs (Follow-up)",
          desc: "Dispatches follow-up reminders to alumni whose attendance is tentative.",
          icon: Clock,
        },
        {
          id: "checked_in",
          label: "Gate Checked-In Alumni",
          desc: "Dispatches only to alumni who have physically checked in at the venue.",
          icon: ShieldCheck,
        },
        {
          id: "with_guests",
          label: "Alumni with Family / Guests (+1)",
          desc: "Dispatches banquet seat and family hospitality updates to alumni bringing guests.",
          icon: UserCheck,
        },
        {
          id: "absent",
          label: "Pending / Gate Arrival Reminder",
          desc: "Dispatches entry pass and welcome reminders to alumni not yet checked in.",
          icon: Clock,
        },
      ]
    : typeInfo.isSeminar
    ? [
        {
          id: "all",
          label: "All Registered Delegates",
          desc: "Dispatches to every delegate registered for this conference & seminar.",
          icon: Users,
        },
        {
          id: "checked_in",
          label: "Checked-in Delegates (In Hall)",
          desc: "Dispatches only to delegates verified checked-in inside the auditorium/hall.",
          icon: ShieldCheck,
        },
        {
          id: "absent",
          label: "Pending / Gate Arrival Reminder",
          desc: "Dispatches gate pass and auditorium arrival reminders to delegates not yet checked in.",
          icon: Clock,
        },
      ]
    : typeInfo.isWebinar
    ? [
        {
          id: "all",
          label: "All Registered Delegates",
          desc: "Dispatches to every delegate registered for this live webinar broadcast.",
          icon: Users,
        },
        {
          id: "checked_in",
          label: "Checked-in Keynote Delegates",
          desc: "Dispatches only to delegates verified attending the live stream.",
          icon: ShieldCheck,
        },
        {
          id: "absent",
          label: "Pending / Stream Reminder",
          desc: "Dispatches a live stream reminder to delegates who haven't checked in yet.",
          icon: Clock,
        },
      ]
    : typeInfo.isWorkshop
    ? [
        {
          id: "all",
          label: "All Enrolled Attendees",
          desc: "Dispatches to every participant enrolled in this workshop.",
          icon: GraduationCap,
        },
        {
          id: "checked_in",
          label: "Checked-in Attendees Only",
          desc: "Dispatches only to attendees physically verified at the session.",
          icon: ShieldCheck,
        },
        {
          id: "absent",
          label: "Pending / Late Attendees",
          desc: "Dispatches session start reminders to attendees not yet checked in.",
          icon: Clock,
        },
      ]
    : [
        {
          id: "all",
          label: "All Approved Participants",
          desc: "Dispatches to every participant in registered squads.",
          icon: Users,
        },
        {
          id: "team_leads",
          label: "Team Leads Only",
          desc: "Dispatches only to designated squad leads.",
          icon: UserCheck,
        },
        {
          id: "checked_in",
          label: "Checked-in Teams",
          desc: "Dispatches only to teams physically checked in at venue.",
          icon: ShieldCheck,
        },
      ];

  // Quick 1-click broadcast templates
  const quickTemplates = typeInfo.isAlumni
    ? [
        {
          name: "Homecoming Welcome & Gate Pass",
          cat: "Gate Pass & Banquet",
          filter: "all",
          sub: `${admin?.EventName || "Alumni Meet"} - Digital Gate Pass & Homecoming Schedule`,
          msg: `Dear Distinguished Alumnus,\n\nWelcome back to campus! We are thrilled to host you for ${admin?.EventName || "Homecoming '26"}.\n\nPlease ensure you have your Digital Alumni Pass ready on your phone or printed for expedited check-in at the convention entrance.\n\nRegistration desk & welcome high tea opens 30 minutes prior to the inaugural session.\n\nWe look forward to reconnecting!`,
        },
        {
          name: "Banquet Dinner & Seating",
          cat: "Gate Pass & Banquet",
          filter: "confirmed_rsvp",
          sub: `${admin?.EventName || "Alumni Meet"} - Grand Reunion Banquet & Seating Arrangements`,
          msg: `Dear Alumnus,\n\nThe Grand Homecoming Banquet Dinner will commence at 7:00 PM in the Main Convention Hall.\n\nReserved batch seating zones have been arranged for all graduating batches. If you are attending with family or guests (+1), our hospitality team will guide you to the family lounge.\n\nWe look forward to a memorable evening of nostalgia and celebration!`,
        },
        {
          name: "Nostalgia Wall & Memories",
          cat: "Nostalgia & Memories",
          filter: "all",
          sub: `${admin?.EventName || "Alumni Meet"} - Share Your Campus Memories & Vintage Photos`,
          msg: `Dear Alumnus,\n\nHave vintage campus photographs, hostel memories, or batch stories you'd love to share? Our digital Alumni Memories Wall is now live!\n\nVisit your Alumni Hub to upload your favorite throwback pictures and browse snapshots shared by your batchmates.`,
        },
        {
          name: "Post-Reunion Thank You & Photos",
          cat: "Reunion Announcement",
          filter: "checked_in",
          sub: `${admin?.EventName || "Alumni Meet"} - Thank You for Making Homecoming '26 Unforgettable!`,
          msg: `Dear Alumnus,\n\nThank you for returning home and celebrating ${admin?.EventName || "Homecoming '26"} with us! Your presence, camaraderie, and stories made this reunion extraordinary.\n\nThe official high-resolution photo gallery and batch group portraits are now available for viewing and download in your Alumni Portal.\n\nStay connected and see you at our next reunion!`,
        },
      ]
    : typeInfo.isSeminar
    ? [
        {
          name: "Auditorium Gate Pass",
          cat: "Auditorium & Gate Pass",
          filter: "all",
          sub: `${admin?.EventName || "Seminar"} - Auditorium Gate Pass & Registration Desk Details`,
          msg: `Dear Delegate,\n\nWe look forward to welcoming you to ${admin?.EventName || "our upcoming seminar"}!\n\nPlease have your Delegate QR Pass or Registration ID ready at the convention entry gate for expedited verification and badge pickup.\n\nAuditorium doors open 30 minutes prior to the inaugural session.\n\nSee you at the conference!`,
        },
        {
          name: "Inaugural Keynote Commencing",
          cat: "Keynote Announcement",
          filter: "all",
          sub: `${admin?.EventName || "Seminar"} - Inaugural Keynote Commencing in 15 Minutes!`,
          msg: `Dear Delegate,\n\nOur distinguished keynote speaker is scheduled to commence the inaugural address shortly in the main auditorium hall.\n\nPlease take your seats to ensure a prompt start to the opening proceedings.`,
        },
        {
          name: "Proceedings & Slide Decks",
          cat: "Proceedings & Slides",
          filter: "checked_in",
          sub: `${admin?.EventName || "Seminar"} - Research Proceedings & Presentation Slides Released`,
          msg: `Dear Delegate,\n\nThank you for attending today's seminar sessions! The conference proceedings booklet, research presentations, and speaker slide decks have been compiled and uploaded to the delegate portal.\n\nYou may view and download all digital materials directly from your Delegate Hub.`,
        },
        {
          name: "Delegate Review & Certificate",
          cat: "Delegate Certificate",
          filter: "checked_in",
          sub: `${admin?.EventName || "Seminar"} - Delegate Feedback & Certificate of Participation`,
          msg: `Dear Delegate,\n\nWe appreciate your participation in ${admin?.EventName || "today's seminar"}. Please take 2 minutes to provide your session ratings and feedback.\n\nUpon submission, your verified Certificate of Participation will be issued in your portal. Thank you for making this conference a success!`,
        },
      ]
    : typeInfo.isWebinar
    ? [
        {
          name: "Live Broadcast Link",
          cat: "Live Broadcast Link",
          filter: "all",
          sub: `${admin?.EventName || "Webinar"} - Live Stream Link & Keynote Access Instructions`,
          msg: `Dear Delegate,\n\nWe are thrilled to welcome you to ${admin?.EventName || "our upcoming webinar"}!\n\nThe live virtual broadcast will commence shortly. You can access the live stream link directly from your Delegate Hub or the virtual broadcast room.\n\nPlease log in 5 minutes ahead of the session to check your audio and video reception.\n\nLooking forward to an inspiring session!`,
        },
        {
          name: "Keynote Starting Soon",
          cat: "Keynote Announcement",
          filter: "all",
          sub: `${admin?.EventName || "Webinar"} - Keynote Commencing in 15 Minutes!`,
          msg: `Dear Delegate,\n\nOur distinguished keynote speaker is about to go live! The virtual broadcast doors are now open.\n\nPlease join the live stream immediately so you don't miss the introductory keynote address and interactive audience poll.`,
        },
        {
          name: "Slide Decks & Replays",
          cat: "Slide Decks & Replays",
          filter: "checked_in",
          sub: `${admin?.EventName || "Webinar"} - Keynote Slides & Recording Replay Released`,
          msg: `Dear Delegate,\n\nThank you for attending today's live webinar! The speaker presentation decks, reference whitepapers, and full video replay recording have been uploaded to your Keynote Hub.\n\nYou can review the materials and download the resources anytime.`,
        },
        {
          name: "Feedback & Certificate",
          cat: "Delegate Feedback",
          filter: "checked_in",
          sub: `${admin?.EventName || "Webinar"} - Delegate Review & Verified Certificate`,
          msg: `Dear Delegate,\n\nWe value your experience and perspective! Please take 2 minutes to submit your delegate feedback and speaker ratings in your Keynote Hub.\n\nUpon submission, your verified Certificate of Participation will be issued. Thank you for making this webinar a success!`,
        },
      ]
    : typeInfo.isWorkshop
    ? [
        {
          name: "Session Reminder",
          cat: "Announcement",
          filter: "all",
          sub: `${admin?.EventName || "Workshop"} - Session Commencing Shortly & Lab Checklist`,
          msg: `Hello Attendees,\n\nWe are excited to kick off today's workshop session! Please ensure you have your laptops charged and development tools pre-installed as per our guidelines.\n\nLooking forward to a great hands-on session!`,
        },
        {
          name: "Materials & Slides",
          cat: "Study Materials",
          filter: "checked_in",
          sub: `${admin?.EventName || "Workshop"} - Hands-On Lab Code & Slide Decks Released`,
          msg: `Hello Workshop Participants,\n\nThe instructor has released today's session slide decks, code snippets, and exercise repositories. You can download all materials from your participant dashboard or the shared links.\n\nHappy coding!`,
        },
        {
          name: "Feedback Request",
          cat: "Announcement",
          filter: "checked_in",
          sub: `${admin?.EventName || "Workshop"} - Session Feedback & Evaluation`,
          msg: `Dear Attendee,\n\nThank you for participating in today's workshop! Please take 2 minutes to provide your honest feedback and rating so we can continuously improve future sessions.`,
        },
      ]
    : [
        {
          name: "Problem Statements Released",
          cat: "Important Alert",
          filter: "all",
          sub: `${admin?.EventName || "Hackathon"} - Problem Statements & Domains Announced`,
          msg: `Hello Teams,\n\nOfficial problem statements and track themes have now been published! Team leads must review the problem briefs and submit their domain selection before the deadline.`,
        },
        {
          name: "Round 1 Evaluation",
          cat: "Schedule Update",
          filter: "checked_in",
          sub: `${admin?.EventName || "Hackathon"} - Round 1 Jury Review Timetable`,
          msg: `Hello Participants,\n\nRound 1 judging commences in 30 minutes. All teams must have their working prototypes and presentation slide decks ready at their assigned table desks.`,
        },
      ];

  // Listen for active event updates from sidebar or switcher
  useEffect(() => {
    const handleEventUpdated = (e) => {
      try {
        const stored = JSON.parse(localStorage.getItem("admin") || "{}");
        const updated = e?.detail ? { ...stored, ...e.detail } : stored;
        setAdmin(updated);
      } catch (err) {}
    };

    window.addEventListener("admin-event-updated", handleEventUpdated);
    window.addEventListener("storage", handleEventUpdated);
    return () => {
      window.removeEventListener("admin-event-updated", handleEventUpdated);
      window.removeEventListener("storage", handleEventUpdated);
    };
  }, []);

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
    const c = String(cat || "").toLowerCase();
    if (c.includes("emergency") || c.includes("urgent")) {
      return "text-rose-600 dark:text-rose-400 font-bold";
    }
    if (c.includes("important")) {
      return "text-red-600 dark:text-red-400 font-bold";
    }
    if (c.includes("schedule") || c.includes("timings") || c.includes("timetable")) {
      return "text-amber-600 dark:text-amber-400 font-bold";
    }
    if (c.includes("alert")) {
      return "text-orange-600 dark:text-orange-400 font-bold";
    }
    if (c.includes("reunion") || c.includes("keynote") || c.includes("speaker") || c.includes("spotlight")) {
      return "text-blue-600 dark:text-blue-400 font-bold";
    }
    if (c.includes("gate") || c.includes("banquet") || c.includes("venue") || c.includes("auditorium")) {
      return "text-teal-600 dark:text-teal-400 font-bold";
    }
    if (c.includes("nostalgia") || c.includes("memories") || c.includes("study") || c.includes("slides") || c.includes("proceedings") || c.includes("replays")) {
      return "text-sky-600 dark:text-sky-400 font-bold";
    }
    if (c.includes("giving") || c.includes("endowment") || c.includes("certificate") || c.includes("feedback")) {
      return "text-purple-600 dark:text-purple-400 font-bold";
    }
    return "text-emerald-600 dark:text-emerald-400 font-bold";
  };

  const getCategoryHeaderStyle = (cat) => {
    const c = String(cat || "").toLowerCase();
    if (c.includes("emergency") || c.includes("urgent")) {
      return {
        bg: "bg-rose-700",
        tag: "URGENT NOTIFICATION",
        borderAccent: "border-l-rose-500",
      };
    }
    if (c.includes("important")) {
      return {
        bg: "bg-red-700",
        tag: "IMPORTANT NOTICE",
        borderAccent: "border-l-red-500",
      };
    }
    if (c.includes("schedule") || c.includes("timings") || c.includes("timetable")) {
      return {
        bg: "bg-amber-600",
        tag: "SCHEDULE & TIMETABLE UPDATE",
        borderAccent: "border-l-amber-500",
      };
    }
    if (c.includes("alert")) {
      return {
        bg: "bg-orange-600",
        tag: "ACTION REQUIRED",
        borderAccent: "border-l-orange-500",
      };
    }
    if (c.includes("reunion") || c.includes("keynote") || c.includes("speaker") || c.includes("spotlight")) {
      return {
        bg: "bg-blue-600",
        tag: "OFFICIAL REUNION ANNOUNCEMENT",
        borderAccent: "border-l-blue-500",
      };
    }
    if (c.includes("gate") || c.includes("banquet") || c.includes("venue") || c.includes("auditorium")) {
      return {
        bg: "bg-teal-700",
        tag: "GATE PASS & VENUE ENTRY",
        borderAccent: "border-l-teal-500",
      };
    }
    if (c.includes("nostalgia") || c.includes("memories") || c.includes("study") || c.includes("slides") || c.includes("proceedings") || c.includes("replays")) {
      return {
        bg: "bg-sky-600",
        tag: "MEMORIES & RESOURCES",
        borderAccent: "border-l-sky-500",
      };
    }
    if (c.includes("giving") || c.includes("endowment") || c.includes("certificate") || c.includes("feedback")) {
      return {
        bg: "bg-purple-700",
        tag: "ALUMNI GIVING & HONORS",
        borderAccent: "border-l-purple-500",
      };
    }
    return {
      bg: "bg-emerald-700",
      tag: "LIVE EVENT ANNOUNCEMENT",
      borderAccent: "border-l-emerald-500",
    };
  };

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen text-slate-900 dark:text-zinc-100 transition-colors p-4 sm:p-6 md:p-8 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>
                {typeInfo.isAlumni
                  ? "Alumni Homecoming Broadcasts"
                  : typeInfo.isSeminar
                  ? "Conference & Seminar Broadcasts"
                  : typeInfo.isWebinar
                  ? "Webinar Keynote Broadcasts"
                  : typeInfo.isWorkshop
                  ? "Workshop Broadcasts"
                  : "Event Communications"}
              </span>
              <span className="text-slate-400">•</span>
              <span>{admin?.EventName || "Active Event"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {typeInfo.isAlumni
                ? "Alumni Homecoming Broadcast Mailer"
                : typeInfo.isSeminar
                ? "Seminar Delegate Broadcast Mailer"
                : typeInfo.isWebinar
                ? "Webinar Delegate Broadcast Mailer"
                : "Broadcast Emailer & Announcements"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {typeInfo.isAlumni
                ? "Dispatch homecoming schedule updates, banquet details, digital entry passes, nostalgia links, and thank you notes directly to registered alumni."
                : typeInfo.isSeminar
                ? "Dispatch keynote announcements, gate entry instructions, conference proceedings, and participation certificates directly to registered delegates."
                : typeInfo.isWebinar
                ? "Dispatch live stream links, keynote announcements, slide decks, replays, and feedback requests to registered delegates."
                : typeInfo.isWorkshop
                ? "Dispatch official notifications, lab repositories, and schedule updates to workshop attendees."
                : "Dispatch mass email announcements and evaluation notices directly to participants and team leads."}
            </p>
          </div>

          {/* Navigation Tabs - No pills, rectangular rounded-xl */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "compose"
                  ? "bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "history"
                  ? "bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History ({broadcasts.length})</span>
            </button>
          </div>
        </motion.div>

        {/* Tab 1: COMPOSE BROADCAST */}
        {activeTab === "compose" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Quick Template Fillers */}
              <div className="p-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-sm space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                  1-Click Quick Templates
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSubject(tpl.sub);
                        setMessage(tpl.msg);
                        setCategory(tpl.cat);
                        setRecipientFilter(tpl.filter);
                        toast.success(`Template applied: ${tpl.name}`);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition cursor-pointer"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleSendBroadcast}
                className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5"
              >
                {/* Target Audience — Rectangular cards, no pills */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
                    Target Recipient Audience
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {recipientFilters.map((f) => {
                      const Icon = f.icon;
                      const isSelected = recipientFilter === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setRecipientFilter(f.id)}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                              : "bg-slate-50/60 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Icon className="w-4 h-4 shrink-0" />
                            </div>
                            <span className="text-xs font-bold">{f.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                            {f.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Selection — Rectangular tags, no pills */}
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          category === cat.id
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-emerald-500/40"
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
                    placeholder={
                      typeInfo.isAlumni
                        ? "e.g. Grand Alumni Meet 2026 - Digital Gate Pass & Homecoming Schedule"
                        : typeInfo.isSeminar
                        ? "e.g. National AI Seminar - Keynote Commencing & Auditorium Gate Pass"
                        : typeInfo.isWebinar
                        ? "e.g. AI & Cloud Keynote - Live Broadcast Link & Session Instructions"
                        : "e.g. Web Development Workshop - Lab 2 Guidelines & GitHub Repo Link"
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
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
                    rows={7}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your announcement message here. Line breaks will be preserved cleanly in the dispatched email..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-y font-mono"
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
                    placeholder={
                      typeInfo.isAlumni
                        ? "e.g. Alumni Relations & Homecoming Committee"
                        : typeInfo.isSeminar
                        ? "e.g. Seminar Organizing Committee"
                        : typeInfo.isWebinar
                        ? "e.g. Webinar Host Operations"
                        : "e.g. Workshop Operations Team"
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Dispatch Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading || !subject.trim() || !message.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching via SMTP &amp; Realtime Stream...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Dispatch Broadcast Announcement</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Email Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Email Template Preview
                </span>
                <span className="text-[11px] text-slate-400">
                  SMTP Delivery Preview
                </span>
              </div>

              {/* Styled Mock Email Container */}
              <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-slate-100 dark:bg-zinc-900 px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-zinc-600" />
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                  </div>
                  <span className="font-mono text-[10px]">smtp.ayojan-mail.com</span>
                </div>

                <div className={`${getCategoryHeaderStyle(category).bg} p-5 text-white space-y-1.5 transition-colors`}>
                  <div className="text-[11px] font-extrabold tracking-wider uppercase text-white/90">
                    {getCategoryHeaderStyle(category).tag}
                  </div>
                  <h3 className="text-base font-extrabold truncate">
                    {admin?.EventName || "Event Announcement"}
                  </h3>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className={`text-xs font-bold uppercase tracking-wider ${getCategoryBadgeClass(category)}`}>
                    • {category}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {subject || "Subject line preview will appear here..."}
                  </h4>

                  <p className="text-slate-600 dark:text-zinc-400 font-medium">
                    Dear {typeInfo.isAlumni ? "Distinguished Alumnus" : typeInfo.isSeminar || typeInfo.isWebinar ? "Delegate" : typeInfo.isWorkshop ? "Workshop Attendee" : "Participant"},
                  </p>

                  <div className={`p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 border-l-4 ${getCategoryHeaderStyle(category).borderAccent} text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono text-[11px]`}>
                    {message || "Your broadcast announcement text will be formatted and delivered directly to the inbox of verified attendees."}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-[11px] text-slate-500 dark:text-zinc-400 space-y-0.5">
                    <p><strong>Dispatched by:</strong> {organizerName || "Operations Team"}</p>
                    <p className="text-[10px] text-slate-400">Sent via AYOJAN Event Broadcast Protocol.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: BROADCAST HISTORY */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Dispatched Broadcasts History</span>
              </h2>
              <button
                type="button"
                onClick={fetchBroadcastHistory}
                disabled={historyLoading}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {broadcasts.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                No email broadcasts sent yet for this event.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {broadcasts.map((b) => (
                  <div key={b.Id} className="py-4 space-y-2 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(b.Category)}`}>
                          • {b.Category}
                        </span>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                          {b.Subject}
                        </h3>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(b.SentAt).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {b.Message}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dispatched to {b.RecipientCount} {typeInfo.isAlumni ? "alumnus/alumni" : "participant(s)"}
                      </span>
                      <span>Target: <strong className="capitalize">{b.RecipientFilter}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
