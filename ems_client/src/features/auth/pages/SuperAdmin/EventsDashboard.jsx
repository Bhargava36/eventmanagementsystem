import React from 'react';
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
import { useState, useEffect } from 'react';

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

  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const initialForm = {
    EventName: "",
    Description: "",
    StartDate: "",
    EndDate: "",
    RegistrationStart: "",
    RegistrationEnd: "",
    Location: "",
    EventType: "",
    HackathonMode: "",
    PrimaryColor: "",
    SecondaryColor: "",
    TertiaryColor: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [sortValue, setSortValue] = React.useState('Latest First');
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
      console.log("Events from backend:", data);
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
      console.log("Sending event:", formData);
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
      console.log("Create event response:", data);
      if (!res.ok) {
        throw new Error(
          data.message || "Event creation failed"
        );
      }
      alert("Event created successfully!");
      setFormData(initialForm);
      setShowCreateForm(false);
      fetchEvents();
    } catch (error) {
      console.error("Create event error:", error);
      alert(error.message);
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
            new Date(a.CreatedAt) -
            new Date(b.CreatedAt)
        );

      case "Latest First":
      default:
        return sortedEvents.sort(
          (a, b) =>
            new Date(b.CreatedAt) -
            new Date(a.CreatedAt)
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Events</h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Create, manage and monitor all events organized in the system.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Event
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter the event details
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={handleCreateEvent}
              className="p-6 space-y-6"
            >
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
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
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
                  placeholder="Enter event description"
                  rows="4"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration Start
                  </label>
                  <input
                    type="date"
                    name="RegistrationStart"
                    value={formData.RegistrationStart}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Type
                  </label>

                  <select
                    name="EventType"
                    value={formData.EventType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >

                    <option value="">
                      Select Event Type
                    </option>

                    <option value="Hackathon">
                      Hackathon
                    </option>

                    <option value="Workshop">
                      Workshop
                    </option>

                    <option value="Conference">
                      Conference
                    </option>

                  </select>
                </div>
              </div>

              {formData.EventType === 'Hackathon' && (

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hackathon Mode
                  </label>

                  <select
                    name="HackathonMode"
                    value={formData.HackathonMode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >

                    <option value="">
                      Select Hackathon Mode
                    </option>

                    <option value="Physical">
                      Physical
                    </option>

                    <option value="Virtual">
                      Virtual
                    </option>
                  </select>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Event Colors
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="PrimaryColor"
                        value={formData.PrimaryColor}
                        onChange={handleChange}
                        className="flex-1 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                      />
                    </div>
                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="SecondaryColor"
                        value={formData.SecondaryColor}
                        onChange={handleChange}
                        className="flex-1 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tertiary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="TertiaryColor"
                        value={formData.TertiaryColor}
                        onChange={handleChange}
                        className="flex-1 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(initialForm);
                    setShowCreateForm(false);
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Calendar className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Total Events
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalEvents}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Upcoming Events
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {upcomingEvents}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Radio className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Ongoing Events
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {ongoingEvents}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit">
              <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Completed Events
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {completedEvents}
            </p>
          </div>



          {/* {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-3">{stat.change}</p>
              </div>
            );
          })} */}
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
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
                    className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
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
                  <th className="px-4 sm:px-6 py-3 font-medium">Event</th>
                  <th className="px-3 sm:px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                  <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">Start Date</th>
                  {/* <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">End Date</th> */}
                  <th className="px-3 sm:px-4 py-3 font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 font-medium">Action</th>
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

                {!loading && sortedEvents.map((event) => (
                  <tr
                    key={event.Id}
                    className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
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
                      <p className="text-xs sm:text-sm whitespace-nowrap">{event.StartDate}</p>
                      {/* <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {event.time}
                      </p> */}
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
                      <Link to={`/sidebar/eventinfo/${event.Id}`} className="flex items-center gap-1 w-24 sm:gap-1.5 px-1 sm:px-2 py-1.5 text-xs rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 font-medium transition-colors whitespace-nowrap cursor-pointer" >
                        <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        <span className="hidden sm:inline">View Info</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <button className="text-sm text-emerald-700 dark:text-emerald-500 hover:underline font-medium cursor-pointer">
              View All Events →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsDashboard;