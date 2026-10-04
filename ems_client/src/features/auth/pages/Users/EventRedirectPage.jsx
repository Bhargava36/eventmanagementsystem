import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Lightbulb,
  ClipboardCheck,
  Users,
  MapPin,
  Calendar,
  CalendarCheck,
  Check,
  X,
  Globe,
  Award,
  Clock,
} from 'lucide-react';

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRegistration, setShowRegistration] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [teamSize, setTeamSize] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    TeamName: '',
    TeamLeadName: '',
    TeamLeadEmail: '',
    TeamLeadCollege: '',
    TeamLeadState: ''
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`http://localhost:3000/api/events/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch event');
      }
      setEvent(data.event);
    } catch (err) {
      console.error('Event fetch error:', err);
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/user/competitions');
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const splitItems = (value) => {
    if (!value) return [];
    return value.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean);
  };

  const getTeamSizeOptions = () => {
    if (!event?.TeamSize) return [2, 3, 4, 5];
    const value = String(event.TeamSize).trim();
    if (value.includes('-')) {
      const parts = value.split('-').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const min = parts[0];
        const max = parts[1];
        return Array.from({ length: max - min + 1 }, (_, index) => min + index);
      }
    }
    const number = Number(value);
    if (!isNaN(number) && number > 0) return [number];
    return [2, 3, 4, 5];
  };

  const handleRegisterClick = () => {
    setCurrentStep(1);
    setShowRegistration(true);
    setTeamSize('');
    setMembers([]);
    setFormData({
      TeamName: '',
      TeamLeadName: '',
      TeamLeadEmail: '',
      TeamLeadCollege: '',
      TeamLeadState: ''
    });
  };

  const closeRegistration = () => {
    if (submitting) return;
    setShowRegistration(false);
    setCurrentStep(1);
    setFormData({
      TeamName: '',
      TeamLeadName: '',
      TeamLeadEmail: '',
      TeamLeadCollege: '',
      TeamLeadState: ''
    });
    setTeamSize('');
    setMembers([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamSizeChange = (e) => {
    const size = Number(e.target.value);
    setTeamSize(size);
    const memberCount = size - 1;
    setMembers(Array.from({ length: memberCount }, () => ({
      Name: '',
      Email: '',
      College: '',
      State: ''
    })));
  };

  const handleMemberChange = (index, e) => {
    const value = e.target.value;
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], Email: value };
      return updated;
    });
  };

  const handleNext = () => {
    if (!formData.TeamName.trim()) { alert('Please enter team name.'); return; }
    if (!teamSize) { alert('Please select team size.'); return; }
    if (!formData.TeamLeadEmail.trim()) { alert('Please enter Team Lead registered email.'); return; }
    if (!formData.TeamLeadEmail.includes('@')) { alert('Please enter a valid Team Lead email.'); return; }
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.TeamName.trim()) { alert('Please enter team name.'); return; }
    if (!teamSize) { alert('Please select team size.'); return; }
    if (!formData.TeamLeadEmail.trim()) { alert('Please enter Team Lead registered email.'); return; }
    if (!formData.TeamLeadEmail.includes('@')) { alert('Please enter a valid Team Lead email.'); return; }
    for (let i = 0; i < members.length; i++) {
      if (!members[i].Email.trim()) { alert(`Please enter registered email for Team Member ${i + 2}.`); return; }
      if (!members[i].Email.includes('@')) { alert(`Please enter a valid email for Team Member ${i + 2}.`); return; }
    }
    if (!id) { alert('Event ID is missing.'); return; }
    try {
      setSubmitting(true);
      const teamPayload = {
        TeamName: formData.TeamName.trim(),
        TeamLeadEmail: formData.TeamLeadEmail.trim(),
        TeamSize: Number(teamSize),
        ProblemStatementId: null,
        Tech_Stack: null,
        EventId: Number(id),
        MemberEmails: members.map((member) => member.Email.trim())
      };
      const teamResponse = await fetch('http://localhost:3000/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamPayload)
      });
      const teamData = await teamResponse.json();
      if (!teamResponse.ok) throw new Error(teamData.message || 'Team creation failed');
      if (!teamData.teamId) throw new Error('Team ID was not returned from server');
      const teamId = Number(teamData.teamId);
      const registrationPayload = {
        EventId: Number(id),
        TeamId: teamId,
        ParticipationMode: event.HackathonMode,
        Status: 'pending',
        ProblemStatementId: null
      };
      const registrationResponse = await fetch('http://localhost:3000/api/event_reg/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
      });
      const registrationData = await registrationResponse.json();
      if (!registrationResponse.ok) throw new Error(registrationData.message || 'Event registration failed');
      alert(`Team registered successfully!\n\nTeam ID: ${teamId}`);
      closeRegistration();
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-black dark:text-white">
        <div className="rounded-3xl border border-slate-200 bg-white px-14 py-16 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-black dark:text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg dark:border-red-900 dark:bg-zinc-950">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <p className="mb-6 text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchEvent} className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-black dark:text-white">
        <p className="rounded-3xl border border-slate-200 bg-white px-10 py-8 text-sm text-slate-600 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Event not found
        </p>
      </div>
    );
  }

  const primaryColor = event.PrimaryColor || '#10b981';
  const primaryTextColor = event.PrimaryTextColor || '#ffffff';
  const tertiaryColor = event.TertiaryColor || '#f1f5f9';
  const tertiaryTextColor = event.TertiaryTextColor || '#334155';
  const requirements = splitItems(event.Requirements);
  const facilities = splitItems(event.Facilities);
  const teamSizeOptions = getTeamSizeOptions();

  const getDaysRemaining = () => {
    if (!event.StartDate) return null;
    const now = new Date();
    const start = new Date(event.StartDate);
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Ongoing';
    if (diff === 0) return 'Starts Today';
    return `${diff} days left`;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 text-slate-900 transition-colors duration-300 dark:bg-[#070908] dark:text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Competitions
          </button>
        </div>

        <section className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition-shadow hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div
            className="relative flex min-h-[300px] items-end overflow-hidden px-8 py-10 sm:min-h-[360px] sm:px-12 md:px-16 md:py-14"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="absolute right-8 top-8 sm:right-12 sm:top-10">
              <div
                className="rounded-2xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg sm:text-xs"
                style={{ backgroundColor: tertiaryColor, color: tertiaryTextColor }}
              >
                {event.EventType || 'EVENT'}
              </div>
            </div>

            <div className="relative z-10 max-w-4xl">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-lg dark:bg-emerald-950 dark:text-emerald-400 sm:h-18 sm:w-18"
              >
                <Lightbulb className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.7} />
              </div>

              <h1
                className="max-w-4xl break-words text-left text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
                style={{ color: primaryTextColor }}
              >
                {event.EventName}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3" style={{ color: primaryTextColor }}>
                {event.Location && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    {event.Location}
                  </span>
                )}
                {event.Location && event.StartDate && <span className="text-sm" style={{ color: primaryTextColor }}>•</span>}
                {event.StartDate && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.StartDate)} — {formatDate(event.EndDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-slate-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <button
              type="button"
              onClick={handleRegisterClick}
              className="group inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
              style={{ backgroundColor: primaryColor, color: primaryTextColor }}
            >
              Register Now
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Calendar, label: 'Start Date', value: formatDate(event.StartDate) },
            { icon: CalendarCheck, label: 'End Date', value: formatDate(event.EndDate) },
            { icon: MapPin, label: 'Location', value: event.Location || '-' },
            { icon: Globe, label: 'Mode', value: event.HackathonMode || '-' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 transition-transform group-hover:scale-110 dark:bg-emerald-950">
                <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 md:p-9">
              <div className="flex items-start gap-5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    Event Overview
                  </p>
                  <h2 className="mb-4 text-xl font-extrabold text-slate-900 dark:text-white">
                    About the Event
                  </h2>
                  <p className="text-[15px] leading-8 text-slate-600 dark:text-zinc-400">
                    {event.Description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 md:p-9">
              <div className="flex items-start gap-5">
                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    Prerequisites
                  </p>
                  <h3 className="mb-5 text-xl font-extrabold text-slate-900 dark:text-white">
                    Requirements
                  </h3>
                  {requirements.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {requirements.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition-colors hover:border-emerald-200 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800 dark:hover:bg-emerald-900">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No requirements specified.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Team Size</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-white">{event.TeamSize || '-'} Members</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Event Type</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-white">{event.EventType || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-950 dark:text-emerald-400">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">What We Provide</p>
                  <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">Facilities</h3>
                </div>
              </div>
              {facilities.length > 0 ? (
                <ul className="space-y-2.5">
                  {facilities.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-emerald-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        <Check className="h-3 w-3 " />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No facilities specified.</p>
              )}
            </div>


          </div>
        </div>
      </div>

      {showRegistration && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black px-4 py-6 sm:py-10">

          <div className="w-full max-w-4xl">

            <div className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-100 sm:p-6 md:p-8">

              <div className="mb-8 flex items-start justify-between gap-4">

                <div>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
                    Registration
                  </p>

                  <h2 className="text-2xl font-bold md:text-3xl">
                    Event Registration
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Register your team using already registered EMS users.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeRegistration}
                  disabled={submitting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              <div className="mb-8">

                <div className="flex items-center">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    1
                  </div>

                  <div
                    className={`h-1 flex-1 ${
                      currentStep >= 2
                        ? 'bg-emerald-600'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      currentStep >= 2
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    2
                  </div>

                </div>

                <div className="mt-2 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>Team Details</span>
                  <span>Team Members</span>
                </div>

              </div>

              {currentStep === 1 && (
                <div className="space-y-6">

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                    <div className="mb-6 flex items-center gap-3">

                      <div>

                        <h2 className="text-lg font-bold">
                          Team Details
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Enter your team information.
                        </p>

                      </div>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Team Name
                        </label>

                        <input
                          type="text"
                          name="TeamName"
                          value={formData.TeamName}
                          onChange={handleChange}
                          placeholder="Enter team name"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Team Size
                        </label>

                        <select
                          value={teamSize}
                          onChange={handleTeamSizeChange}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white"
                        >
                          <option value="">
                            Select team size
                          </option>

                          {teamSizeOptions.map(
                            (size) => (
                              <option
                                key={size}
                                value={size}
                              >
                                {size} Members
                              </option>
                            )
                          )}

                        </select>

                      </div>

                    </div>

                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                    <div className="mb-6 flex items-center gap-3">

                      <div>

                        <h2 className="text-lg font-bold">
                          Team Lead
                        </h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Team lead must already have an EMS account.
                        </p>

                      </div>

                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Team Lead Name
                        </label>
                        <input
                          type="text"
                          name="TeamLeadName"
                          value={formData.TeamLeadName}
                          onChange={handleChange}
                          placeholder="Enter team lead name"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Registered Email
                        </label>
                        <input
                          type="email"
                          name="TeamLeadEmail"
                          value={formData.TeamLeadEmail}
                          onChange={handleChange}
                          placeholder="Enter registered email"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          College
                        </label>
                        <input
                          type="text"
                          name="TeamLeadCollege"
                          value={formData.TeamLeadCollege}
                          onChange={handleChange}
                          placeholder="Enter team lead college"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          State
                        </label>
                        <input
                          type="text"
                          name="TeamLeadState"
                          value={formData.TeamLeadState}
                          onChange={handleChange}
                          placeholder="Enter team lead state"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                        />
                      </div>

                    </div>

                  </section>

                  <div className="flex justify-between">

                    <button
                      type="button"
                      onClick={closeRegistration}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Continue
                    </button>

                  </div>

                </div>
              )}

              {currentStep === 2 && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                    <div className="mb-6">

                      <h2 className="text-lg font-bold">
                        Team Members
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enter the registered EMS email of each team member.
                      </p>

                    </div>

                    <div className="space-y-5">

                      {members.map(
                        (member, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-black"
                          >

                            <div className="mb-3">
                              <p className="text-sm font-bold">
                                Team Member {index + 2}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Enter team member details
                              </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <input
                                type="text"
                                value={member.Name}
                                onChange={(e) => setMembers((prev) => prev.map((item, memberIndex) => (
                                  memberIndex === index ? { ...item, Name: e.target.value } : item
                                )))}
                                placeholder="Team member name"
                                aria-label={`Team Member ${index + 2} name`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                              />
                              <input
                                type="email"
                                value={member.Email}
                                onChange={(e) => handleMemberChange(index, e)}
                                placeholder="Enter registered email"
                                aria-label={`Team Member ${index + 2} registered email`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                              />
                              <input
                                type="text"
                                value={member.College}
                                onChange={(e) => setMembers((prev) => prev.map((item, memberIndex) => (
                                  memberIndex === index ? { ...item, College: e.target.value } : item
                                )))}
                                placeholder="College"
                                aria-label={`Team Member ${index + 2} college`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                              />
                              <input
                                type="text"
                                value={member.State}
                                onChange={(e) => setMembers((prev) => prev.map((item, memberIndex) => (
                                  memberIndex === index ? { ...item, State: e.target.value } : item
                                )))}
                                placeholder="State"
                                aria-label={`Team Member ${index + 2} state`}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909] dark:text-white dark:placeholder:text-slate-500"
                              />
                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                    <div className="mb-4">

                      <h3 className="font-bold">
                        Event Registration Details
                      </h3>

                    </div>

                    <div className="grid gap-4 md:grid-cols-2">

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-zinc-800 dark:bg-black">

                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Team Size
                        </p>

                        <p className="mt-1 font-semibold">
                          {teamSize} Members
                        </p>

                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-zinc-800 dark:bg-black">

                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Participation Mode
                        </p>

                        <p className="mt-1 font-semibold">
                          {event.HackathonMode || '-'}
                        </p>

                      </div>

                    </div>

                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">

                    <label className="flex cursor-pointer items-start gap-3">

                      <input
                        type="checkbox"
                        required
                        className="mt-1 h-4 w-4 cursor-pointer accent-emerald-600 focus:ring-2 focus:ring-emerald-500 dark:accent-emerald-400 dark:focus:ring-emerald-400"
                      />

                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        I confirm that all the team members are already
                        registered users in EMS and the information provided
                        is correct.
                      </span>

                    </label>

                  </section>

                  <div className="flex justify-between">

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setCurrentStep(1)
                      }
                      className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-900"
                    >
                      {submitting
                        ? 'Registering...'
                        : 'Register Team'}
                    </button>

                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default EventDetails;