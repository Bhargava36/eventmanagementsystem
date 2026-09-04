import React from 'react';
import {
  Users,
  UsersRound,
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  ClipboardList,
  CheckSquare
} from 'lucide-react';

const stats = [
  { title: 'Total Registrations', value: '3,120', icon: Users },
  { title: 'Registered Teams', value: '620', icon: UsersRound },
  { title: 'Pending Approvals', value: '45', icon: ClipboardList},
  { title: 'Days Remaining', value: '14', icon: Clock},
];

const assignedEvent = {
  name: 'Avishkaar Season 3',
  date: 'January',
  status: 'Active',
  progress: 75,
  subMetrics: [
    { label: 'Technical Tracks', value: '12' },
    { label: 'Workshops', value: '8' },
    { label: 'Mentors Assigned', value: '45' },
  ]
};

const recentRegistrations = [
  { team: 'Code Warriors', leader: 'Alice Johnson', date: 'Oct 24, 2024', status: 'Approved' },
  { team: 'Tech Titans', leader: 'Bob Smith', date: 'Oct 24, 2024', status: 'Approved' },
  { team: 'Designers Hub', leader: 'Diana Prince', date: 'Oct 23, 2024', status: 'Pending' },
  { team: 'Brainstormers', leader: 'Charlie Brown', date: 'Oct 23, 2024', status: 'Approved' },
  { team: 'Innovators', leader: 'Ethan Hunt', date: 'Oct 22, 2024', status: 'Pending' },
];

const recentActivities = [
  { icon: CheckSquare, text: 'Approved registration for "Tech Titans"', time: '10 mins ago' },
  { icon: AlertCircle, text: '3 teams pending document verification', time: '1 hour ago' },
  { icon: CalendarDays, text: 'Updated schedule for "Web Dev Workshop"', time: '3 hours ago' },
  { icon: UsersRound, text: 'New mentor "Dr. Sarah" assigned to track', time: '5 hours ago' },
  { icon: Activity, text: 'Sent reminder email to all registered teams', time: '1 day ago' },
];

function AdminDashboard() {
  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <div className="pt-4 sm:pt-6 px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
          Overview of your assigned event and recent activities
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-800 shadow-sm"
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
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-500 mt-3 truncate">
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-emerald-700 dark:border-emerald-500 shadow-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-500/10 dark:to-transparent pointer-events-none"></div>
          
          <div className="p-4 sm:p-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {assignedEvent.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {assignedEvent.date}
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-3">
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 w-fit">
                  {assignedEvent.status}
                </span>
                <button className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-500 hover:underline">
                  Manage Event <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-gray-200 dark:border-gray-800/50">
              {assignedEvent.subMetrics.map((metric, i) => (
                <div key={i}>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
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
                    <th className="pb-3 font-medium">Team Name</th>
                    <th className="pb-3 font-medium">Leader</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((reg, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-3 sm:py-4 text-gray-900 dark:text-white font-medium">{reg.team}</td>
                      <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300">{reg.leader}</td>
                      <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                        {reg.date}
                      </td>
                      <td className="py-3 sm:py-4 text-right">
                        <span
                          className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-medium inline-block ${
                            reg.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activities
              </h2>
              <button className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline">
                View Log
              </button>
            </div>
            <div className="space-y-4 sm:space-y-5">
              {recentActivities.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                        {activity.text}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;