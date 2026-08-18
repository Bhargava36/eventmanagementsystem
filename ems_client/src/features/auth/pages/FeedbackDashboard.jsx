import React from 'react';
import { MessageSquare, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

const stats = [
  { title: 'Total Feedback', value: '128', icon: MessageSquare, change: '+18% from last month' },
  { title: 'Average Rating', value: '4.3 / 5', icon: Star, change: '+0.4 from last month' },
  { title: 'Positive Feedback', value: '89', icon: ThumbsUp, change: '69.5% of total feedback' },
  { title: 'Negative Feedback', value: '22', icon: ThumbsDown, change: '17.2% of total feedback' },
];

const recentFeedback = [
  {
    user: 'Aarav Rao',
    initials: 'AR',
    email: 'aarav.rao@example.com',
    rating: 5,
    feedback: 'The website is very user-friendly and easy to navigate. Great experience!',
    date: 'Aug 13, 2025',
  },
  {
    user: 'Priya Sharma',
    initials: 'PS',
    email: 'priya.sharma@example.com',
    rating: 4,
    feedback: 'Events are well organized. Search and filters can be improved.',
    date: 'Aug 13, 2025',
  },
  {
    user: 'Rohan Kumar',
    initials: 'RK',
    email: 'rohan.kumar@example.com',
    rating: 5,
    feedback: 'Excellent platform! Helps a lot in managing college events.',
    date: 'Aug 12, 2025',
  },
  {
    user: 'Neha Singh',
    initials: 'NS',
    email: 'neha.singh@example.com',
    rating: 3,
    feedback: 'Good overall, but mobile view needs improvement.',
    date: 'Aug 12, 2025',
  },
  {
    user: 'Vivek Mehta',
    initials: 'VM',
    email: 'vivek.mehta@example.com',
    rating: 1,
    feedback: 'Facing issues while registering for events. Please fix.',
    date: 'Aug 11, 2025',
  },
];

const renderStars = (rating) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          star <= rating
            ? 'fill-emerald-700 dark:fill-emerald-500 text-emerald-700 dark:text-emerald-500'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))}
  </div>
);

function FeedbackDashboard() {
  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Website Feedback
          </h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Monitor and manage feedback submitted by users about the website.
          </p>
        </div>
        <button className="bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-fit">
          Export Report
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

        <div className="bg-white dark:bg-gray-950 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Recent Feedback
            </h2>
            <button className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline">
              View All Feedback
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Feedback</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentFeedback.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 dark:border-gray-800/50"
                  >
                    <td className="py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-500 font-semibold text-xs shrink-0">
                          {item.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate text-xs sm:text-sm">
                            {item.user}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4">{renderStars(item.rating)}</td>
                    <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 max-w-xs hidden sm:table-cell">
                      <p className="line-clamp-2 text-xs sm:text-sm">{item.feedback}</p>
                    </td>
                    <td className="py-3 sm:py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap text-xs sm:text-sm">
                      {item.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackDashboard;