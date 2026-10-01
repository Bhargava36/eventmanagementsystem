import React, { useState, useEffect } from 'react';

import {
  Users,
  UsersRound,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  UserCheck,
} from 'lucide-react';

import { motion } from 'framer-motion';

const recentActivities = [
  { icon: Calendar, text: 'New event created', time: '2 mins ago' },
  { icon: UsersRound, text: 'New team registered', time: '10 mins ago' },
  { icon: CreditCard, text: 'Payment received', time: '1 hour ago' },
  { icon: UserCheck, text: 'New user registered', time: '2 hours ago' },
  { icon: CheckCircle2, text: 'Event completed', time: '5 hours ago' },
];

function SuperAdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [teamsCount, setTeamsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchUsersCount();
    fetchTeamsCount();
    fetchEventsCount();
    fetchEvents();
  }, []);

  const fetchUsersCount = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/users/count'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users count');
      }

      setUsersCount(data.count || data.userCount || 0);
    } catch (error) {
      console.error('Error fetching users count:', error);
    }
  };

  const fetchTeamsCount = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/teams/count'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch teams count');
      }

      setTeamsCount(data.count || data.teamCount || 0);
    } catch (error) {
      console.error('Error fetching teams count:', error);
    }
  };

  const fetchEventsCount = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/events/count'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events count');
      }

      setEventsCount(data.count || data.eventCount || 0);
    } catch (error) {
      console.error('Error fetching events count:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/events/'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }

      setEvents(data.events || data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchTeamCountByEvent = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/event_reg/event/${eventId}/count`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to fetch team count'
        );
      }

      return data.teamCount || data.count || 0;
    } catch (error) {
      console.error('Error fetching team count:', error);
      return 0;
    }
  };

  const currentEvent = events.find(
    (event) =>
      String(event.status || event.EventStatus || '').toLowerCase() ===
      'ongoing'
  );

  const stats = [
    {
      title: 'Total Users',
      value: usersCount,
      icon: Users,
    },
    {
      title: 'Total Teams',
      value: teamsCount,
      icon: UsersRound,
    },
    {
      title: 'Total Events',
      value: eventsCount,
      icon: Calendar,
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
          Dashboard
        </h1>

        <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
          Overview of all events and system analytics
        </p>
      </motion.div>

      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={i}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 25,
                    scale: 0.97,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.4,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    },
                  },
                }}
                whileHover={{
                  y: -4,
                  transition: {
                    duration: 0.2,
                  },
                }}
                className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {stat.title}
                    </p>

                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>

                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.15 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0],
          }}
          className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Events Overview
            </h2>

            <button className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 flex items-center gap-1 hover:underline">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-3" />

              <p className="text-sm text-gray-500 dark:text-gray-400">
                No events found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-5">
              {events.map((event, i) => {
                const eventStatus = String(
                  event.status || event.EventStatus || ''
                ).toLowerCase();

                return (
                  <motion.div
                    key={event.Id || i}
                    initial={{
                      opacity: 0,
                      y: 25,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    whileHover={{
                      y: -4,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    className={`p-4 sm:p-6 rounded-xl border transition-all hover:shadow-md ${
                      eventStatus === 'ongoing'
                        ? 'border-emerald-700 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
                        : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                          {event.EventName}
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {event.StartDate
                            ? new Date(
                                event.StartDate
                              ).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}{' '}
                          -{' '}
                          {event.EndDate
                            ? new Date(
                                event.EndDate
                              ).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shrink-0 font-medium ${
                          eventStatus === 'ongoing'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                            : eventStatus === 'upcoming'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500'
                            : eventStatus === 'completed'
                            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            : eventStatus === 'cancelled'
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-500'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {eventStatus || 'unknown'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div>
                        <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {event.UserCount || 0}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Users
                        </p>
                      </div>

                      <div>
                        <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {event.TeamCount || 0}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Teams
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {currentEvent ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              amount: 0.15,
            }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {currentEvent.EventName} – Overview
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {currentEvent.StartDate
                    ? new Date(
                        currentEvent.StartDate
                      ).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}{' '}
                  -{' '}
                  {currentEvent.EndDate
                    ? new Date(
                        currentEvent.EndDate
                      ).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 w-fit font-medium">
                Current Event
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit mb-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                </div>

                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {currentEvent.UserCount || 0}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Users Registered
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit mb-2">
                  <UsersRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                </div>

                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {currentEvent.TeamCount || 0}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Teams Registered
                </p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit mb-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                </div>

                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {currentEvent.EventType || '—'}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Event Type
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-950 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
            <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-3" />

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No current event
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{
              opacity: 0,
              x: -25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              amount: 0.15,
            }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Recent Registrations
              </h2>

              <button className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[400px]">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-3 font-medium">
                      Team Name
                    </th>

                    <th className="pb-3 font-medium">
                      Event
                    </th>

                    <th className="pb-3 font-medium hidden sm:table-cell">
                      Date
                    </th>

                    <th className="pb-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {events.slice(0, 5).map((event, i) => (
                    <motion.tr
                      key={event.Id || i}
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        amount: 0.1,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.06,
                      }}
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="py-3 text-gray-900 dark:text-white font-medium">
                        {event.TeamName || '—'}
                      </td>

                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {event.EventName}
                      </td>

                      <td className="py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                        {event.CreatedAt
                          ? new Date(
                              event.CreatedAt
                            ).toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                          {event.status ||
                            event.EventStatus ||
                            'Confirmed'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              x: 25,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              amount: 0.15,
            }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>

              <button className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivities.map((activity, i) => {
                const Icon = activity.icon;

                return (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      amount: 0.1,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: i * 0.07,
                    }}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                        <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                      </div>

                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {activity.text}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap shrink-0">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;