import React, { useCallback, useEffect, useMemo, useState } from "react";
import ParticipantIdCanvas from "./ParticipantIdCanvas";
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
} from "lucide-react";

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
  const status =
    participant?.IdCardGenerated ?? participant?.idCardGenerated;

  return (
    Boolean(cardId) ||
    status === true ||
    status === 1 ||
    status === "1"
  );
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

function IdRedirectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId =
    searchParams.get("eventId")?.trim() || getAssignedEventId();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const idCardEnabled =
    event?.IDCardEnabled ?? event?.idCardEnabled ??
    event?.EnableIDCard ?? event?.enableIDCard ?? false;
  const isFeatureEnabled =
    idCardEnabled === true ||
    idCardEnabled === 1 ||
    ["1", "true", "yes", "enabled", "on"].includes(
      String(idCardEnabled).trim().toLowerCase()
    );

  const loadData = useCallback(async () => {
    if (!/^[1-9]\d*$/.test(eventId)) {
      setEvent(null);
      setParticipants([]);
      setError("Please provide a valid event ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const eventResponse = await fetch(
        `http://localhost:3000/api/events/${encodeURIComponent(eventId)}`
      );

      const eventJson = await eventResponse.json().catch(() => ({}));

      if (!eventResponse.ok) {
        throw new Error(
          eventJson.message || "Unable to fetch event details."
        );
      }

      const eventData =
        eventJson.event ??
        eventJson.data?.event ??
        eventJson.data ??
        eventJson;

      setEvent(eventData);

      const participantResponse = await fetch(
        `http://localhost:3000/api/id-cards/events/${encodeURIComponent(eventId)}/participants`
      );

      const participantJson = await participantResponse
        .json()
        .catch(() => ({}));

      if (!participantResponse.ok) {
        throw new Error(
          participantJson.message ||
            "Event loaded, but participant fetching failed."
        );
      }

      setParticipants(getArray(participantJson));
    } catch (err) {
      setError(
        err.message || "Unable to load data. Check the backend server."
      );
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const teams = new Set(
      participants
        .map((participant) =>
          participant?.TeamId ?? participant?.teamId
        )
        .filter(
          (id) => id !== null && id !== undefined && id !== ""
        )
    );

    const generated = participants.filter(isGenerated).length;

    return {
      teams: teams.size,
      total: participants.length,
      generated,
      pending: participants.length - generated,
    };
  }, [participants]);

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

  async function generateCards() {
    if (!/^[1-9]\d*$/.test(eventId)) {
      setError("A valid event ID is required.");
      return;
    }

    if (participants.length === 0) {
      setError(
        "No eligible participants are available for this event."
      );
      return;
    }

    if (stats.pending === 0) {
      setMessage(
        "All participant ID cards have already been generated."
      );
      return;
    }

    setGenerating(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/id-cards/events/${encodeURIComponent(eventId)}/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "ID card generation failed."
        );
      }

      setMessage(
        result.message ||
          `ID card generation completed. Generated: ${
            result.generated ?? "check updated list"
          }.`
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to generate ID cards.");
    } finally {
      setGenerating(false);
    }
  }

  const eventName =
    getValue(event, "EventName", "eventName", "Name", "name") ||
    "HackHub Event";

  const startDate = getValue(
    event,
    "StartDate",
    "startDate",
    "EventDate"
  );

  const endDate = getValue(event, "EndDate", "endDate") || startDate;

  const location =
    getValue(event, "Location", "location", "Venue", "venue") ||
    "Venue not available";

  const themeColor =
    getValue(event, "ThemeColor", "themeColor", "PrimaryColor") ||
    "#102B59";

  return (
    <div className="min-h-screen w-full bg-[#F4F6FA] dark:bg-black p-4 font-sans text-slate-900 dark:text-white sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <button
          type="button"
          onClick={() => navigate("/admin/physical-event")}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 transition hover:text-blue-900 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Physical Event
        </button>

        <section className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: themeColor }}
              >
                <IdCard className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
                  Event Management
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                  ID Card Generation
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
              Generate, preview, and download individual participant ID
              cards with event branding and QR-based verification.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-zinc-400">
              <strong className="text-slate-900 dark:text-white">{eventName}</strong>

              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(startDate)} – {formatDate(endDate)}
              </span>

              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={
              loading ||
              generating ||
              !/^[1-9]\d*$/.test(eventId) ||
              !isFeatureEnabled ||
              stats.pending === 0
            }
            onClick={generateCards}
            className="flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={{ backgroundColor: themeColor }}
          >
            {generating ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <IdCard className="h-5 w-5" />
            )}

            {generating ? "GENERATING..." : "GENERATE ID CARDS"}

            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-sm text-emerald-800 dark:text-emerald-400"
          >
            {message}
          </div>
        )}

        {!loading && event && !isFeatureEnabled && (
          <div role="status" className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-400">
            ID card generation is currently disabled by the event admin.
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Registered Teams",
              value: stats.teams,
              Icon: Users,
            },
            {
              label: "Generated ID Cards",
              value: stats.generated,
              Icon: CheckCircle2,
            },
            {
              label: "Pending ID Cards",
              value: stats.pending,
              Icon: Clock,
            },
            {
              label: "Total Participants",
              value: stats.total,
              Icon: Users,
            },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black p-6 shadow-sm"
            >
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${themeColor}12` }}
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

        <section className="overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-zinc-800 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                ["all", `All Participants (${stats.total})`],
                ["generated", `Generated (${stats.generated})`],
                ["pending", `Pending (${stats.pending})`],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                    filter === value
                      ? "text-white"
                      : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                  }`}
                  style={
                    filter === value
                      ? { backgroundColor: themeColor }
                      : {}
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search participant, team or college..."
                className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/70 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-slate-500 dark:focus:border-zinc-500 transition"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Physical Event Participants
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Each registered participant receives an individual ID card.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-zinc-900/50">
                <tr>
                  {[
                    "Participant",
                    "ID Number",
                    "Team",
                    "College",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400"
                    >
                      Loading event and participants...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredParticipants.map((participant, index) => (
                    <tr
                      key={getUserId(participant) ?? index}
                      className="transition hover:bg-slate-50/80 dark:hover:bg-zinc-900/40"
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
                        {getValue(
                          participant,
                          "TeamName",
                          "teamName"
                        ) || "Individual"}
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

                          {isGenerated(participant)
                            ? "Generated"
                            : "Pending"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={!isGenerated(participant)}
                          onClick={() => setSelected(participant)}
                          title="View ID card"
                          className="rounded-lg border border-slate-200 dark:border-zinc-800 p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 transition disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ color: themeColor }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && filteredParticipants.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400"
                    >
                      No participants found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-xs p-3 sm:p-5"
            onClick={() => setSelected(null)}
          >
            <div
              className="my-auto w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 text-slate-900 dark:text-white shadow-2xl sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
                    Preview
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Participant ID Card
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 transition text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900"
                  aria-label="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mx-auto w-full max-w-[330px]">
                <ParticipantIdCanvas
                  participant={selected}
                  event={event}
                  eventId={eventId}
                  cardNumber={getCardId(selected)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdRedirectionPage;