import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Lightbulb,
  Tag,
  ClipboardCheck,
  Users,
  MapPin,
  Calendar,
  CalendarCheck,
  Check,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  X
} from 'lucide-react';

const themes = [
  'Technology & Innovation',
  'Sustainability',
  'Health & Wellness',
  'Education',
  'Social Impact',
  'Open Theme'
];

function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [teamSize, setTeamSize] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    TeamName: '',
    TeamLead: '',
    Email: '',
    PhoneNumber: '',
    Gender: '',
    College: '',
    State: ''
  });

  const createMember = () => ({
    MemberName: '',
    Email: '',
    PhoneNumber: '',
    Gender: '',
    College: '',
    State: ''
  });

  const [members, setMembers] = useState([createMember()]);

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
    navigate('/user/dashboard');
  };

  const formatDate = (date) => {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const splitItems = (value) => {
    if (!value) {
      return [];
    }

    return value
      .split(/[,|\n]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleRegisterClick = () => {
    setCurrentStep(1);
    setShowRegistration(true);
  };

  const closeRegistration = () => {
    if (submitting) {
      return;
    }

    setShowRegistration(false);
    setCurrentStep(1);

    setFormData({
      TeamName: '',
      TeamLead: '',
      Email: '',
      PhoneNumber: '',
      Gender: '',
      College: '',
      State: ''
    });

    setTeamSize(2);
    setMembers([createMember()]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamSizeChange = (e) => {
    const size = Number(e.target.value);

    setTeamSize(size);

    const memberCount = size - 1;

    setMembers((prev) => {
      const updatedMembers = [...prev];

      while (updatedMembers.length < memberCount) {
        updatedMembers.push(createMember());
      }

      updatedMembers.length = memberCount;

      return updatedMembers;
    });
  };

  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;

    setMembers((prev) => {
      const updatedMembers = [...prev];

      updatedMembers[index] = {
        ...updatedMembers[index],
        [name]: value
      };

      return updatedMembers;
    });
  };

  const handleNext = () => {
    if (
      !formData.TeamName.trim() ||
      !formData.TeamLead.trim() ||
      !formData.Email.trim() ||
      !formData.PhoneNumber.trim() ||
      !formData.Gender.trim() ||
      !formData.College.trim() ||
      !formData.State.trim()
    ) {
      alert('Please fill all team and team lead details.');
      return;
    }

    setCurrentStep(2);
  };

  const handleFormBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      return;
    }

    closeRegistration();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];

      if (
        !member.MemberName.trim() ||
        !member.Email.trim() ||
        !member.PhoneNumber.trim() ||
        !member.Gender.trim() ||
        !member.College.trim() ||
        !member.State.trim()
      ) {
        alert(`Please fill all details for Team Member ${i + 2}.`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const teamResponse = await fetch('http://localhost:3000/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          TeamLead: formData.TeamLead,
          Email: formData.Email,
          TeamSize: teamSize,
          College: formData.College,
          State: formData.State,
          PhoneNumber: formData.PhoneNumber,
          Gender: formData.Gender,
          TeamName: formData.TeamName,
          ProblemStatementId: event?.ProblemStatementId || null,
          Tech_Stack: event?.Tech_Stack || null,
          EventId: id
        })
      });

      const teamData = await teamResponse.json();

      if (!teamResponse.ok) {
        throw new Error(teamData.message || 'Team creation failed');
      }

      const teamId =
        teamData.teamId ||
        teamData.TeamId ||
        teamData.id ||
        teamData.team?.Id;

      if (!teamId) {
        console.error('Team creation response:', teamData);
        throw new Error('Team created but Team ID was not returned by server.');
      }

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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-slate-900 dark:text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>

          <button onClick={fetchEvent} className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-slate-500">Event not found</p>
      </div>
    );
  }

  const primaryColor = event.PrimaryColor || '#10b981';
  const secondaryColor = event.SecondaryColor || '#e5e7eb';
  const primaryTextColor = event.PrimaryTextColor || '#ffffff';
  const secondaryTextColor = event.SecondaryTextColor || '#475569';
  const tertiaryColor = event.TertiaryColor || '#f1f5f9';
  const tertiaryTextColor = event.TertiaryTextColor || '#334155';

  const requirements = splitItems(event.Requirements);
  const facilities = splitItems(event.Facilities);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 p-4 md:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">

        <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" style={{ border: `1px solid ${secondaryColor}`, color: secondaryTextColor }}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <section className="rounded-3xl overflow-hidden shadow-sm" style={{ border: `1px solid ${secondaryColor}` }}>

          <div className="min-h-[320px] md:min-h-[380px] flex flex-col items-center justify-center text-center px-6 py-12" style={{ backgroundColor: primaryColor }}>
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: tertiaryColor }}>
              <Lightbulb className="w-12 h-12" style={{ color: tertiaryTextColor }} strokeWidth={1.8} />
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase break-words max-w-4xl" style={{ color: primaryTextColor }}>
              {event.EventName}
            </h1>

            <div className="mt-5 px-5 py-2 rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase" style={{ backgroundColor: tertiaryColor, color: tertiaryTextColor }}>
              {event.EventType || 'EVENT'}
            </div>
          </div>

          <div className="bg-white dark:bg-black p-6 md:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div className="max-w-4xl">
                <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: secondaryTextColor }}>
                  {event.EventType || 'EVENT'}
                </p>

                <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: primaryColor }}>
                  {event.EventName}
                </h2>

                <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-7">
                  {event.Description || 'No description available.'}
                </p>
              </div>

              <button type="button" onClick={handleRegisterClick} className="shrink-0 inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer hover:opacity-90" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                Register Now
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <div className="lg:col-span-7 space-y-6">

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <FileText className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
                    About the Event
                  </h3>

                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-7">
                    {event.Description || 'No description available.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <ClipboardCheck className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
                    Requirements
                  </h3>

                  {requirements.length > 0 ? (
                    <ul className="space-y-3">
                      {requirements.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: tertiaryColor }}>
                            <Check className="w-4 h-4" style={{ color: tertiaryTextColor }} />
                          </div>

                          <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No requirements specified.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <Lightbulb className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
                    Themes
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {themes.map((theme, index) => (
                      <span key={index} className="px-4 py-2 rounded-full text-xs md:text-sm font-semibold" style={{ backgroundColor: tertiaryColor, color: tertiaryTextColor, border: `1px solid ${secondaryColor}` }}>
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <Tag className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
                    Event Type
                  </h3>

                  <p className="text-sm md:text-base font-semibold" style={{ color: secondaryTextColor }}>
                    {event.EventType || '-'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <Users className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
                    Team Size
                  </h3>

                  <p className="text-sm md:text-base font-semibold" style={{ color: secondaryTextColor }}>
                    {event.TeamSize || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <Calendar className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
                    Duration
                  </h3>

                  <p className="text-sm md:text-base font-semibold" style={{ color: secondaryTextColor }}>
                    {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <MapPin className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: primaryColor }}>
                    Location
                  </h3>

                  <p className="text-sm md:text-base font-semibold" style={{ color: secondaryTextColor }}>
                    {event.Location || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-black rounded-3xl p-6 md:p-7" style={{ border: `1px solid ${secondaryColor}` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tertiaryColor }}>
                  <CalendarCheck className="w-6 h-6" style={{ color: tertiaryTextColor }} />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
                    Facilities
                  </h3>

                  {facilities.length > 0 ? (
                    <ul className="space-y-3">
                      {facilities.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: tertiaryColor }}>
                            <Check className="w-4 h-4" style={{ color: tertiaryTextColor }} />
                          </div>

                          <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No facilities specified.
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showRegistration && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-8">
          <div className="mx-auto w-full max-w-5xl">

            <div className="rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b0b0b] md:p-8">

              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
                    Registration
                  </p>

                  <h2 className="text-2xl font-bold md:text-3xl">
                    Event Registration
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Complete the registration form to register your team.
                  </p>
                </div>

                <button type="button" onClick={closeRegistration} disabled={submitting} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 disabled:opacity-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center">

                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    1
                  </div>

                  <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`} />

                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
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

                  <section className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">

                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <Users className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold">Team Details</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Enter your team information.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-medium">Team Name</label>

                        <input type="text" name="TeamName" value={formData.TeamName} onChange={handleChange} placeholder="Enter team name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">Team Size</label>

                        <select value={teamSize} onChange={handleTeamSizeChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]">
                          <option value="2">2 Members</option>
                          <option value="3">3 Members</option>
                          <option value="4">4 Members</option>
                          <option value="5">5 Members</option>
                        </select>
                      </div>

                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">

                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <Users className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-lg font-bold">Team Lead Details</h2>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Team lead must already be registered as a user in EMS.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-medium">Team Lead Name</label>

                        <input type="text" name="TeamLead" value={formData.TeamLead} onChange={handleChange} placeholder="Enter registered user name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">Email</label>

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input type="email" name="Email" value={formData.Email} onChange={handleChange} placeholder="Enter registered email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">Phone Number</label>

                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input type="tel" name="PhoneNumber" value={formData.PhoneNumber} onChange={handleChange} placeholder="Enter registered phone number" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">Gender</label>

                        <select name="Gender" value={formData.Gender} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]">
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">College</label>

                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input type="text" name="College" value={formData.College} onChange={handleChange} placeholder="Enter college name" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">State</label>

                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input type="text" name="State" value={formData.State} onChange={handleChange} placeholder="Enter state" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                        </div>
                      </div>

                    </div>
                  </section>

                  <div className="flex justify-between">

                    <button type="button" onClick={handleFormBack} className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <button type="button" onClick={handleNext} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </button>

                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <form onSubmit={handleSubmit} className="space-y-6">

                  {members.map((member, index) => (
                    <section key={index} className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">

                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          <Users className="h-5 w-5" />
                        </div>

                        <div>
                          <h2 className="text-lg font-bold">
                            Team Member {index + 2}
                          </h2>

                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Member must already be registered as a user in EMS.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">

                        <div>
                          <label className="mb-2 block text-sm font-medium">Name</label>

                          <input type="text" name="MemberName" value={member.MemberName} onChange={(e) => handleMemberChange(index, e)} placeholder="Enter registered user name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Email</label>

                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input type="email" name="Email" value={member.Email} onChange={(e) => handleMemberChange(index, e)} placeholder="Enter registered email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Phone Number</label>

                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input type="tel" name="PhoneNumber" value={member.PhoneNumber} onChange={(e) => handleMemberChange(index, e)} placeholder="Enter registered phone number" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Gender</label>

                          <select name="Gender" value={member.Gender} onChange={(e) => handleMemberChange(index, e)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]">
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">College</label>

                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input type="text" name="College" value={member.College} onChange={(e) => handleMemberChange(index, e)} placeholder="Enter college name" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">State</label>

                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input type="text" name="State" value={member.State} onChange={(e) => handleMemberChange(index, e)} placeholder="Enter state" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#090909]" />
                          </div>
                        </div>

                      </div>
                    </section>
                  ))}

                  <section className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800">

                    <label className="flex cursor-pointer items-start gap-3">

                      <input type="checkbox" required className="mt-1 h-4 w-4 accent-emerald-600" />

                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        I confirm that all the information provided in this registration form is correct and all team members are already registered users in EMS.
                      </span>

                    </label>
                  </section>

                  <div className="flex justify-between">

                    <button type="button" disabled={submitting} onClick={() => setCurrentStep(1)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 disabled:opacity-50">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {submitting ? 'Registering...' : 'Register Team'}

                      {!submitting && <Check className="h-5 w-5" />}
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