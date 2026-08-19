import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Radio,
  Clock,
  Plus,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { title: 'Total Events', value: '48', icon: Calendar, change: '+16% from last month' },
  { title: 'Upcoming Events', value: '19', icon: CheckCircle2, change: '39.6% of total' },
  { title: 'Ongoing Events', value: '6', icon: Radio, change: '12.5% of total' },
  { title: 'Completed Events', value: '23', icon: Clock, change: '47.9% of total' },
];

const events = [
  {
    name: 'Annual Tech Fest 2026',
    description: 'A grand celebration of innovation and technology.',
    category: 'Technology',
    date: 'Aug 20 - Aug 22, 2026',
    time: '10:00 AM',
    status: 'Upcoming',
  },
  {
    name: 'Leadership Summit 2026',
    description: 'Empowering leaders for a better tomorrow.',
    category: 'Seminar',
    date: 'Aug 14, 2026',
    time: '09:30 AM',
    status: 'Ongoing',
  },
  {
    name: 'Inter College Sports Meet',
    description: 'Uniting colleges through sports and teamwork.',
    category: 'Sports',
    date: 'Aug 10 - Aug 12, 2026',
    time: '09:00 AM',
    status: 'Completed',
  },
  {
    name: 'Hackathon 2026',
    description: 'Code. Build. Innovate.',
    category: 'Technology',
    date: 'Jul 25 - Jul 27, 2026',
    time: '08:00 AM',
    status: 'Completed',
  },
  {
    name: 'Music Night',
    description: 'An evening of music and unforgettable vibes.',
    category: 'Cultural',
    date: 'Jul 18, 2026',
    time: '06:00 PM',
    status: 'Completed',
  },
  {
    name: 'Environment Awareness Drive',
    description: "Let's come together for a greener tomorrow.",
    category: 'Social',
    date: 'Jul 12, 2026',
    time: '10:00 AM',
    status: 'Completed',
  },
  {
    name: 'Workshop on UI/UX Design',
    description: 'Learn the art of designing user-centric applications.',
    category: 'Workshop',
    date: 'Jul 05 - Jul 06, 2026',
    time: '11:00 AM',
    status: 'Completed',
  },
];

const getStatusStyles = (status) => {
  switch (status) {
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

const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/eventinfo'); 
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">Events</h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Create, manage and monitor all events organized in the system.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit">
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => {
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
          })}
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
                  <th className="px-3 sm:px-4 py-3 font-medium hidden md:table-cell">Date & Time</th>
                  <th className="px-3 sm:px-4 py-3 font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white">
                            {event.name}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block line-clamp-1">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryStyles()}`}
                      >
                        {event.category}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 dark:text-gray-300 hidden md:table-cell">
                      <p className="text-xs sm:text-sm whitespace-nowrap">{event.date}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {event.time}
                      </p>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyles(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <button className="flex items-center gap-1 sm:gap-1.5 text-xs px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-500 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 font-medium transition-colors whitespace-nowrap cursor-pointer" onClick={handleButtonClick}>
                        <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        <span className="hidden sm:inline">View Info</span>

                      </button>
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