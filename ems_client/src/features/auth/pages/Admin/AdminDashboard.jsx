import React from 'react';
import Footer from '../../../../components/Organisms/Footer';
import {
  Users,
  UsersRound,
  CalendarDays,
  Clock,
  Trophy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  ClipboardList,
  CheckSquare,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import { useState } from 'react';



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
    { label: 'No. of Student Coordinators', value: '12' },
    { label: 'No. of Faculty Coordinators', value: '8' },
    { label: 'No. of Volunteers', value: '45' },
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
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [prizes, setPrizes] = useState([{ name: '', amount: '' }]);
  const [declaredPrizes, setDeclaredPrizes] = useState([]);

  function handlePrizeChange(index, field, value) {
    setPrizes((currentPrizes) => currentPrizes.map((prize, prizeIndex) => (
      prizeIndex === index ? { ...prize, [field]: value } : prize
    )));
  }

  function addPrize() {
    setPrizes((currentPrizes) => [...currentPrizes, { name: '', amount: '' }]);
  }

  function handleDeclarePrizes(event) {
    event.preventDefault();
    setDeclaredPrizes(prizes);
    setPrizes([{ name: '', amount: '' }]);
    setIsPrizeModalOpen(false);
  }

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <div className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6 md:px-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Dashboard</h1>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm sm:text-base mt-1">
            Overview of your assigned event and recent activities
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPrizeModalOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 sm:px-4 sm:text-sm dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          Add Prize Money
        </button>
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

        {declaredPrizes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  Declared Prizes
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Prize money for {assignedEvent.name}
                </p>
              </div>
              <Trophy className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {declaredPrizes.map((prize, index) => (
                <article
                  key={`${prize.name}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-emerald-700/20 bg-white p-5 shadow-sm dark:border-emerald-500/30 dark:bg-gray-950"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-emerald-700 dark:bg-emerald-500" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-500">
                        Prize {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                        {prize.name}
                      </h3>
                    </div>
                    <Trophy className="h-5 w-5 shrink-0 text-yellow-500" />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-emerald-700 dark:text-emerald-500">
                    ₹ {Number(prize.amount).toLocaleString('en-IN')}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

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

      {isPrizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-emerald-700/20 bg-white shadow-xl dark:border-emerald-500/30 dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add Prize Money
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add one or more prizes for the assigned event.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPrizeModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDeclarePrizes} className="space-y-4 p-5">
              {prizes.map((prize, index) => (
                <div key={index} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Prize {index + 1}
                    </p>
                    {prizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPrizes((currentPrizes) => currentPrizes.filter((_, prizeIndex) => prizeIndex !== index))}
                        aria-label={`Delete prize ${index + 1}`}
                        title="Delete prize"
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`prize-name-${index}`} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Prize Name
                      </label>
                      <input
                        id={`prize-name-${index}`}
                        value={prize.name}
                        onChange={(event) => handlePrizeChange(index, 'name', event.target.value)}
                        placeholder="First Prize"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`prize-money-${index}`} className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Prize Money
                      </label>
                      <input
                        id={`prize-money-${index}`}
                        type="number"
                        min="0"
                        value={prize.amount}
                        onChange={(event) => handlePrizeChange(index, 'amount', event.target.value)}
                        placeholder="25000"
                        required
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-700 dark:border-gray-700 dark:bg-black dark:text-white dark:focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPrize}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Add Another Prize
              </button>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsPrizeModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-600"
                >
                  Declare Prizes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;