import { useEffect, useState } from "react";
import { API_BASE_URL } from '@/lib/api';
import { useSearchParams } from "react-router-dom";
import { BadgeCheck, CheckCircle2, CircleAlert, LoaderCircle, Clock, LogIn, LogOut, RefreshCw } from "lucide-react";

export default function VerifyIdPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const eventId = searchParams.get("eventId")?.trim() || "";
  const userId = searchParams.get("userId")?.trim() || "";
  const idCardNumber = searchParams.get("idCardNumber")?.trim() || "";
  const [status, setStatus] = useState("loading");
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const hasValidParams =
    Boolean(token) ||
    (/^[1-9]\d*$/.test(eventId) && Boolean(idCardNumber));

  const verifyCard = async () => {
    if (!hasValidParams) return;
    setStatus("loading");
    setError("");

    try {
      const query = new URLSearchParams();
      if (token) query.set("token", token);
      if (eventId) query.set("eventId", eventId);
      if (userId) query.set("userId", userId);
      if (idCardNumber) query.set("idCardNumber", idCardNumber);

      const response = await fetch(`${API_BASE_URL}/api/id-cards/verify?${query.toString()}`);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(response.status === 404 ? "invalid" : "error");
        setError(result.message || "Unable to verify this ID card.");
        return;
      }

      setParticipant(result.participant);
      setStatus("valid");
    } catch (requestError) {
      setStatus("error");
      setError("Could not reach the verification service. Please try again.");
    }
  };

  useEffect(() => {
    verifyCard();
  }, [eventId, userId, idCardNumber, hasValidParams]);

  const handleAttendanceAction = async (actionType) => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const targetEventId = eventId || participant?.EventId;
      const targetUserId = userId || participant?.UserId;
      const res = await fetch(`${API_BASE_URL}/api/id-cards/events/${targetEventId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(targetUserId),
          checkedInBy: "Badge QR Verification Gate",
          checkedOutBy: "Badge QR Verification Gate",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to record ${actionType}`);

      setActionMessage(data.message || `Successfully marked ${actionType}`);
      await verifyCard();
    } catch (err) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const visibleStatus = hasValidParams ? status : "invalid";
  const visibleError = hasValidParams
    ? error
    : "The verification link is incomplete or invalid.";

  const isCheckedIn = participant?.AttendanceStatus === "checked_in";
  const isCheckedOut = participant?.AttendanceStatus === "checked_out";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-black px-4 py-10 transition-colors">
      <section className="w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl">
        <div className="bg-slate-950 px-8 py-8 text-white border-b border-zinc-800">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <BadgeCheck aria-hidden="true" size={27} className="text-emerald-400" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
            Event Pass Verification
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">ID Card & Attendance</h1>
          <p className="mt-2 text-sm text-slate-300">
            Verified participant credential and live event check-in tracking.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {visibleStatus === "loading" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 p-5 text-slate-600 dark:text-zinc-300">
              <LoaderCircle aria-hidden="true" className="animate-spin text-emerald-500" size={21} />
              <span className="font-medium text-sm">Verifying participant ID…</span>
            </div>
          ) : visibleStatus === "valid" ? (
            <div className="space-y-6">
              {/* Valid Status Card */}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 aria-hidden="true" size={25} className="shrink-0" />
                <div>
                  <p className="font-extrabold text-sm">Verified Official Participant</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    This pass matches an approved physical-event registration.
                  </p>
                </div>
              </div>

              {/* Attendance Status Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Gate Attendance Status
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isCheckedIn
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : isCheckedOut
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
                        : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-600"
                    }`}
                  >
                    {isCheckedIn
                      ? "Checked In"
                      : isCheckedOut
                      ? "Checked Out"
                      : "Not Checked In"}
                  </span>
                </div>

                {participant?.CheckInTime && (
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Check-in Time:
                    </span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {new Date(participant.CheckInTime).toLocaleString()}
                    </strong>
                  </div>
                )}

                {participant?.CheckOutTime && (
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Check-out Time:
                    </span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {new Date(participant.CheckOutTime).toLocaleString()}
                    </strong>
                  </div>
                )}

                {actionMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    {actionMessage}
                  </div>
                )}

                {/* Gate Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  {!isCheckedIn ? (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAttendanceAction("check_in")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogIn className="w-3.5 h-3.5" />
                      )}
                      Mark Gate Check-in
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAttendanceAction("check_out")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      Mark Gate Check-out
                    </button>
                  )}
                </div>
              </div>

              {/* Participant Details List */}
              <dl className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs sm:text-sm">
                <Detail label="Participant" value={participant?.ParticipantName} />
                <Detail label="Event" value={participant?.EventName} />
                <Detail label="Pass Number" value={participant?.IdCardNumber} />
                <Detail label="Team" value={participant?.TeamName || "Individual"} />
                <Detail label="College" value={participant?.College} />
                <Detail label="Event Date" value={formatDate(participant?.StartDate)} />
                <Detail label="Venue" value={participant?.Location} />
              </dl>
            </div>
          ) : (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-5 text-rose-800 dark:text-rose-400">
              <div className="flex items-center gap-3">
                <CircleAlert aria-hidden="true" size={24} />
                <p className="font-extrabold">
                  {visibleStatus === "invalid" ? "ID Card Not Verified" : "Verification Unavailable"}
                </p>
              </div>
              <p className="mt-2 text-sm">{visibleError}</p>
              {visibleStatus === "error" && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-rose-800 px-4 py-2 text-sm font-bold text-white hover:bg-rose-900 cursor-pointer"
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 dark:text-zinc-500">
            Verify that the pass number matches the participant’s physical ID badge.
          </p>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500 dark:text-zinc-400">{label}</dt>
      <dd className="break-words text-sm font-bold text-slate-900 dark:text-white sm:text-right">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}
