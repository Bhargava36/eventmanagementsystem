import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Radio,
  Clock,
  Plus,
  Eye,
  ChevronDown,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import useToast from '../../../../Hooks/useToast';

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'Upcoming':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500';
    case 'Ongoing':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500';
    case 'Completed':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getCategoryStyles = () =>
  'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500';

function EventsDashboard() {
  const toast = useToast();
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const initialForm = {
    EventName: "",
    Description: "",
    Facilities: "",
    Requirements: "",
    TeamSize: "",
    StartDate: "",
    EndDate: "",
    RegistrationStart: "",
    RegistrationEnd: "",
    Location: "",
    EventType: "",
    EventStatus: "",
    HackathonMode: "",
    PrimaryColor: "",
    SecondaryColor: "",
    TertiaryColor: "",
    PrimaryTextColor: "",
    SecondaryTextColor: "",
    TertiaryTextColor: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState('Latest First');

  const sortOptions = [
    'Latest First',
    'Oldest First',
    'Name (A-Z)',
    'Name (Z-A)',
    'Upcoming',
    'Ongoing',
    'Completed',
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/api/events/"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch events"
        );
      }

      setEventData(data.events || []);

    } catch (error) {
      console.error("Fetch events error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'EventType') {
      setFormData((previousData) => ({
        ...previousData,
        EventType: value,
        HackathonMode:
          value === 'Hackathon'
            ? previousData.HackathonMode
            : '',
      }));

      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {

      const res = await fetch(
        "http://localhost:3000/api/events/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Event creation failed"
        );
      }

      toast.success("Event created successfully!");

      setFormData(initialForm);
      setShowCreateForm(false);

      fetchEvents();

    } catch (error) {
      console.error("Create event error:", error);
      toast.error(error.message || "Failed to create event");
    }
  };

  const getSortedEvents = () => {

    const sortedEvents = [...eventData];

    switch (sortValue) {

      case "Name (A-Z)":
        return sortedEvents.sort((a, b) =>
          (a.EventName || "").localeCompare(
            b.EventName || ""
          )
        );

      case "Name (Z-A)":
        return sortedEvents.sort((a, b) =>
          (b.EventName || "").localeCompare(
            a.EventName || ""
          )
        );

      case "Upcoming":
        return sortedEvents.filter(
          (event) =>
            event.Status?.toLowerCase() === "upcoming"
        );

      case "Ongoing":
        return sortedEvents.filter(
          (event) =>
            event.Status?.toLowerCase() === "ongoing"
        );

      case "Completed":
        return sortedEvents.filter(
          (event) =>
            event.Status?.toLowerCase() === "completed"
        );

      case "Oldest First":
        return sortedEvents.sort(
          (a, b) =>
            new Date(a.CreatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) -
            new Date(b.CreatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
        );

      case "Latest First":
      default:
        return sortedEvents.sort(
          (a, b) =>
            new Date(b.CreatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) -
            new Date(a.CreatedAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})
        );
    }
  };

  const sortedEvents = getSortedEvents();

  const totalEvents = eventData.length;

  const upcomingEvents = eventData.filter(
    (event) =>
      event.EventStatus?.toLowerCase() === "upcoming"
  ).length;

  const ongoingEvents = eventData.filter(
    (event) =>
      event.EventStatus?.toLowerCase() === "ongoing"
  ).length;

  const completedEvents = eventData.filter(
    (event) =>
      event.EventStatus?.toLowerCase() === "completed"
  ).length;

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4"
      >

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Events
          </h1>

          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Create, manage and monitor all events organized in the system.
          </p>

        </div>

        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </motion.button>

      </motion.div>


      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl"
            >

      <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200 dark:border-gray-800">

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create Event
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and configure your event
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(initialForm);
            setCurrentStep(1);
            setShowCreateForm(false);
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

      </div>

      <div className="px-7 pt-6">

        <div className="flex items-center">

          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>

              <div className="flex flex-col items-center">

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                    currentStep >= step
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                  }`}
                >
                  {step}
                </div>

              </div>

              {step < 5 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step
                      ? "bg-emerald-700"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                />
              )}

            </React.Fragment>
          ))}

        </div>

        <div className="mt-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentStep === 1 && "Basic Information"}
            {currentStep === 2 && "Event Details"}
            {currentStep === 3 && "Schedule"}
            {currentStep === 4 && "Type & Location"}
            {currentStep === 5 && "Event Colors"}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Step {currentStep} of 5
          </p>
        </div>

      </div>

      <form onSubmit={handleCreateEvent}>

        <div className="px-7 py-6">

          {currentStep === 1 && (
            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Name
                </label>

                <input
                  type="text"
                  name="EventName"
                  value={formData.EventName}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>

                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  placeholder="Describe your event"
                  rows="7"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-1">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Facilities
                </label>

                <textarea
                  name="Facilities"
                  value={formData.Facilities}
                  onChange={handleChange}
                  placeholder="Enter facilities provided for participants"
                  rows="3"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Requirements
                </label>

                <textarea
                  name="Requirements"
                  value={formData.Requirements}
                  onChange={handleChange}
                  placeholder="Enter requirements for participants"
                  rows="3"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Size
                </label>

                <input
                  type="text"
                  name="TeamSize"
                  value={formData.TeamSize}
                  onChange={handleChange}
                  placeholder="Example: 2 - 4 members"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">

              <div className="grid grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="StartDate"
                    value={formData.StartDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>

                  <input
                    type="date"
                    name="EndDate"
                    value={formData.EndDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration Start
                  </label>

                  <input
                    type="date"
                    name="RegistrationStart"
                    value={formData.RegistrationStart}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration End
                  </label>

                  <input
                    type="date"
                    name="RegistrationEnd"
                    value={formData.RegistrationEnd}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

              </div>

            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">

              <div className="grid grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>

                  <select
                    name="EventType"
                    value={formData.EventType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Event Type</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Status
                  </label>

                  <select
                    name="EventStatus"
                    value={formData.EventStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Event Status</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

              </div>

              {formData.EventType === "Hackathon" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hackathon Mode
                  </label>

                  <select
                    name="HackathonMode"
                    value={formData.HackathonMode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Hackathon Mode</option>
                    <option value="Physical">Physical</option>
                    <option value="Virtual">Virtual</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>

                <input
                  type="text"
                  name="Location"
                  value={formData.Location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

            </div>
          )}

          {currentStep === 5 && (
            <div>

              <div className="grid grid-cols-2 gap-5">

                {[
                  ["PrimaryColor", "Primary Color"],
                  ["PrimaryTextColor", "Primary Text Color"],
                  ["SecondaryColor", "Secondary Color"],
                  ["SecondaryTextColor", "Secondary Text Color"],
                  ["TertiaryColor", "Tertiary Color"],
                  ["TertiaryTextColor", "Tertiary Text Color"],
                ].map(([name, label]) => (
                  <div key={name}>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {label}
                    </label>

                    <div className="flex items-center gap-2">

                      <input
                        type="color"
                        value={formData[name]}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name,
                              value: e.target.value,
                            },
                          })
                        }
                        className="w-12 h-11 rounded-lg cursor-pointer border-0 p-0"
                      />

                      <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                      />

                    </div>

                  </div>
                ))}

              </div>

            </div>
          )}

        </div>

        <div className="flex items-center justify-between px-7 py-5 border-t border-gray-200 dark:border-gray-800">

          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setCurrentStep(1);
                setShowCreateForm(false);
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              Cancel
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
              >
                Create Event
              </button>
            )}

          </div>

        </div>

      </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
          >

            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Calendar className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Total Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalEvents}
            </p>

          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
          >

            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Upcoming Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {upcomingEvents}
            </p>

          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
          >

            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Radio className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Ongoing Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {ongoingEvents}
            </p>

          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm transition-shadow hover:shadow-md"
          >

            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Completed Events
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {completedEvents}
            </p>

          </motion.div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >

          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                All Events
              </h2>

              <div className="relative">

                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >

                  {sortValue}

                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''
                      }`}
                  />

                </button>

                {sortOpen && (

                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-10 overflow-hidden">

                    {sortOptions.map((option) => (

                      <button
                        key={option}
                        onClick={() => {
                          setSortValue(option);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortValue === option
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                      >
                        {option}
                      </button>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-xs sm:text-sm min-w-[500px]">

              <thead>

                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">

                  <th className="px-4 sm:px-6 py-3 font-medium">
                    Event
                  </th>

                  <th className="px-3 sm:px-4 py-3 font-medium hidden sm:table-cell">
                    Category
                  </th>

                  <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">
                    Start Date
                  </th>

                  <th className="px-3 sm:px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 sm:px-6 py-3 font-medium">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading && (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500"
                    >
                      Loading events...
                    </td>

                  </tr>

                )}

                {!loading && sortedEvents.length === 0 && (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-10 text-gray-500"
                    >
                      No events found.
                    </td>

                  </tr>

                )}

                {!loading && sortedEvents.map((event, index) => (

                  <motion.tr
                    key={event.Id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                    className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/70 dark:hover:bg-gray-900/50 transition-colors"
                  >

                    <td className="px-4 sm:px-6 py-3 sm:py-4">

                      <div className="flex items-center gap-2 sm:gap-3">

                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">

                          <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-700 dark:text-emerald-500" />

                        </div>

                        <div className="min-w-0">

                          <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                            {event.EventName}
                          </p>

                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block line-clamp-1">
                            {event.Description}
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryStyles()}`}
                      >
                        {event.EventType}
                      </span>

                    </td>

                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">

                      <p className="text-xs sm:text-sm whitespace-nowrap">
                        {new Date(event.StartDate).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                      </p>

                    </td>

                    <td className="px-3 sm:px-4 py-3 sm:py-4">

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyles(
                          event.EventStatus
                        )}`}
                      >
                        {event.EventStatus}
                      </span>

                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">

                      <Link
                        to={`/sidebar/eventinfo/${event.Id}`}
                        className="flex items-center gap-1 w-24 sm:gap-1.5 px-1 sm:px-2 py-1.5 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 font-medium transition-colors whitespace-nowrap cursor-pointer"
                      >

                        <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />

                        <span className="hidden sm:inline">
                          View Info
                        </span>

                      </Link>

                    </td>

                  </motion.tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 text-center">

            <button className="text-sm text-emerald-700 dark:text-emerald-500 hover:underline font-medium cursor-pointer">
              View All Events →
            </button>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
export default EventsDashboard;