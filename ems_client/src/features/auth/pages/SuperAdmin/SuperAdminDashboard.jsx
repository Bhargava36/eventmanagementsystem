import React from 'react';
import {
  Users,
  UsersRound,
  Calendar,
  UserPlus,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { title: 'Total Users', value: '12,153', icon: Users, change: '+12.5%' },
  { title: 'Total Teams', value: '2,342', icon: UsersRound, change: '+8.7%' },
  { title: 'Total Events', value: '248', icon: Calendar, change: '+15.3%' },
  { title: 'Total Registrations', value: '18,642', icon: UserPlus, change: '+10.1%' },
];

const events = [
  {
    name: 'Avishkaar Season 1',
    date: 'Jan 1 - Mar 31, 2023',
    status: 'Completed',
    users: '1,240',
    teams: '210',
    events: '32',
  },
  {
    name: 'Avishkaar Season 2',
    date: 'Jan 1 - Mar 31, 2024',
    status: 'Completed',
    users: '2,450',
    teams: '450',
    events: '48',
  },
  {
    name: 'Avishkaar Season 3',
    date: 'Jan 1 - Mar 31, 2025',
    status: 'Active',
    users: '3,120',
    teams: '620',
    events: '62',
  },
  {
    name: 'Avishkaar Season 4',
    date: 'Jan 1 - Mar 31, 2026',
    status: 'Upcoming',
    users: '—',
    teams: '—',
    events: '—',
  },
];

const currentEvent = {
  name: 'Avishkaar Season 3',
  date: 'Jan 1 - Mar 31, 2025',
  stats: [
    { icon: Users, label: 'Users Registered', value: '3,120' },
    { icon: UsersRound, label: 'Teams Registered', value: '620' },
    { icon: Calendar, label: 'Events Organized', value: '62' },
    { icon: UserPlus, label: 'Total Registrations', value: '8,420' },
    { icon: Trophy, label: 'Ongoing Events', value: '18' },
    { icon: CheckCircle2, label: 'Completion Rate', value: '78%' },
  ],
};

const recentRegistrations = [
  {
    team: 'Code Warriors',
    event: 'Coding Championship',
    date: 'May 30, 2025',
    status: 'Confirmed',
  },
  { team: 'Tech Titans', event: 'Robo League', date: 'May 30, 2025', status: 'Confirmed' },
  { team: 'Designers Hub', event: 'Design Arena', date: 'May 29, 2025', status: 'Pending' },
  { team: 'Brainstormers', event: 'Debate Battle', date: 'May 29, 2025', status: 'Confirmed' },
  { team: 'Innovators', event: 'AI Hackathon', date: 'May 28, 2025', status: 'Confirmed' },
];

const recentActivities = [
  { icon: Calendar, text: 'New event "AI Hackathon" created', time: '2 mins ago' },
  { icon: UsersRound, text: 'Team "Code Warriors" registered', time: '10 mins ago' },
  { icon: CreditCard, text: 'Payment of ₹15,000 received', time: '1 hour ago' },
  { icon: UserCheck, text: 'New user "john_doe" registered', time: '2 hours ago' },
  { icon: CheckCircle2, text: 'Event "Robo League" completed', time: '5 hours ago' },
];

function SuperAdminDashboard() {
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
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 25, scale: 0.97 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
                  },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
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
                <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-3 font-medium">
                  {stat.change} vs last month
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Events Overview
            </h2>
            <motion.button
              whileHover={{ x: 3 }}
              className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 flex items-center gap-1 hover:underline cursor-pointer"
            >
              View All <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.15 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {events.map((event, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 25, scale: 0.97 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
                  },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`p-4 sm:p-6 rounded-xl border transition-all hover:shadow-md ${
                  event.status === 'Active'
                    ? 'border-emerald-700 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      {event.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {event.date}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 sm:px-3 py-1 rounded-full whitespace-nowrap shrink-0 font-medium ${
                      event.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                        : event.status === 'Upcoming'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {event.users}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Users</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {event.teams}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Teams</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      {event.events}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Events</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {currentEvent.name} – Overview
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {currentEvent.date}
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 w-fit font-medium">
              Current Event
            </span>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.2 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-4"
          >
            {currentEvent.stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.95 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.35, ease: 'easeOut' },
                    },
                  }}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                  className="p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 w-fit mb-2">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-500" />
                  </div>
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Recent Registrations
              </h2>
              <motion.button
                whileHover={{ x: 3 }}
                className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline cursor-pointer"
              >
                View All
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm min-w-[400px]">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-3 font-medium">Team Name</th>
                    <th className="pb-3 font-medium">Event</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((reg, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ amount: 0.1 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="py-3 text-gray-900 dark:text-white font-medium">
                        {reg.team}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {reg.event}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                        {reg.date}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            reg.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ amount: 0.15 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>
              <motion.button
                whileHover={{ x: 3 }}
                className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline cursor-pointer"
              >
                View All
              </motion.button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ amount: 0.1 }}
                    transition={{ duration: 0.3, delay: i * 0.07 }}
                    whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors cursor-pointer"
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