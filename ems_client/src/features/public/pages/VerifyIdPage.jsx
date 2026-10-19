import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgeCheck, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";

export default function VerifyIdPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId")?.trim() || "";
  const userId = searchParams.get("userId")?.trim() || "";
  const idCardNumber = searchParams.get("idCardNumber")?.trim() || "";
  const [status, setStatus] = useState("loading");
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState("");
  const hasValidParams =
    /^[1-9]\d*$/.test(eventId) &&
    /^[1-9]\d*$/.test(userId) &&
    Boolean(idCardNumber);

  useEffect(() => {
    if (!hasValidParams) return undefined;

    const controller = new AbortController();

    const verifyCard = async () => {
      setStatus("loading");
      setError("");

      try {
        const query = new URLSearchParams({ eventId, userId, idCardNumber });
        const response = await fetch(`http://localhost:3000/api/id-cards/verify?${query}`, {
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          setStatus(response.status === 404 ? "invalid" : "error");
          setError(result.message || "Unable to verify this ID card.");
          return;
        }

        setParticipant(result.participant);
        setStatus("valid");
      } catch (requestError) {
        if (requestError.name === "AbortError") return;
        setStatus("error");
        setError("Could not reach the verification service. Please try again.");
      }
    };

    verifyCard();

    return () => controller.abort();
  }, [eventId, userId, idCardNumber, hasValidParams]);

  const visibleStatus = hasValidParams ? status : "invalid";
  const visibleError = hasValidParams
    ? error
    : "The verification link is incomplete or invalid.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-slate-950 px-8 py-8 text-white">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <BadgeCheck aria-hidden="true" size={27} className="text-amber-300" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
            Event credentials
          </p>
          <h1 className="mt-2 text-2xl font-extrabold">ID card verification</h1>
          <p className="mt-2 text-sm text-slate-300">
            Check whether this participant pass was issued for the event.
          </p>
        </div>

        <div className="p-8">
          {visibleStatus === "loading" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5 text-slate-600">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={21} />
              <span className="font-medium">Verifying participant ID…</span>
            </div>
          ) : visibleStatus === "valid" ? (
            <div>
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 aria-hidden="true" size={25} />
                <div>
                  <p className="font-extrabold">Valid participant ID</p>
                  <p className="text-sm">This pass matches an approved physical-event registration.</p>
                </div>
              </div>
              <dl className="divide-y divide-slate-100">
                <Detail label="Participant" value={participant?.ParticipantName} />
                <Detail label="Event" value={participant?.EventName} />
                <Detail label="Pass number" value={participant?.IdCardNumber} />
                <Detail label="Team" value={participant?.TeamName || "Individual"} />
                <Detail label="College" value={participant?.College} />
                <Detail label="Event date" value={formatDate(participant?.StartDate)} />
                <Detail label="Venue" value={participant?.Location} />
              </dl>
            </div>
          ) : (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
              <div className="flex items-center gap-3">
                <CircleAlert aria-hidden="true" size={24} />
                <p className="font-extrabold">
                  {visibleStatus === "invalid" ? "ID card not verified" : "Verification unavailable"}
                </p>
              </div>
              <p className="mt-2 text-sm">{visibleError}</p>
              {visibleStatus === "error" && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-rose-800 px-4 py-2 text-sm font-bold text-white hover:bg-rose-900"
                >
                  Try again
                </button>
              )}
            </div>
          )}
          <p className="mt-7 text-center text-xs text-slate-400">
            Verify that the pass number matches the participant’s physical ID card.
          </p>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="break-words text-sm font-bold text-slate-900 sm:text-right">
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
