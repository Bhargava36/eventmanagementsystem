import React, { useState } from 'react';
import Footer from '../../../../components/Organisms/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  Users,
  UserPlus,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Settings,
  Trash2,
  Check,
  Filter,
} from 'lucide-react';

const initialNotifications = [
  {
    id: 1,
    icon: Calendar,
    title: 'New Event Created',
    message: 'A new event "AI Hackathon 2025" has been created by John Doe.',
    time: '2 mins ago',
    date: 'Aug 13, 2025',
    unread: true,
  },
  {
    id: 2,
    icon: UserPlus,
    title: 'New User Registration',
    message: 'Priya Sharma has registered as a new user on the platform.',
    time: '10 mins ago',
    date: 'Aug 13, 2025',
    unread: true,
  },
  {
    id: 3,
    icon: CreditCard,
    title: 'Payment Received',
    message: 'Payment of ₹15,000 received for Avishkaar Season 3 registration.',
    time: '1 hour ago',
    date: 'Aug 13, 2025',
    unread: true,
  },
  {
    id: 4,
    icon: Users,
    title: 'Team Registration',
    message: 'Team "Code Warriors" has registered for Coding Championship.',
    time: '2 hours ago',
    date: 'Aug 13, 2025',
    unread: false,
  },
  {
    id: 5,
    icon: AlertCircle,
    title: 'System Alert',
    message: 'Server load is high. Please monitor the system performance.',
    time: '3 hours ago',
    date: 'Aug 13, 2025',
    unread: true,
  },
  {
    id: 6,
    icon: MessageSquare,
    title: 'New Feedback Received',
    message: 'Aarav Rao submitted a 5-star feedback about the platform.',
    time: '5 hours ago',
    date: 'Aug 13, 2025',
    unread: false,
  },
  {
    id: 7,
    icon: CheckCircle2,
    title: 'Event Completed',
    message: 'Event "Robo League" has been marked as completed successfully.',
    time: '1 day ago',
    date: 'Aug 12, 2025',
    unread: false,
  },
  {
    id: 8,
    icon: Settings,
    title: 'System Update',
    message: 'System has been updated to version 2.4.1 with new features.',
    time: '2 days ago',
    date: 'Aug 11, 2025',
    unread: false,
  },
];

function NotificationPage() {
  const [filterType, setFilterType] = useState('All');
  const [items, setItems] = useState(initialNotifications);

  const filteredNotifications = items.filter((item) => {
    if (filterType === 'Unread') return item.unread;
    if (filterType === 'System') return item.title.includes('System') || item.title.includes('Server');
    if (filterType === 'Users') return item.title.includes('User') || item.title.includes('Team');
    return true;
  });

  const unreadCount = items.filter((item) => item.unread).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const deleteNotification = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleRead = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: !item.unread } : item
      )
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen transition-colors">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 sm:pt-10 px-4 sm:px-6 md:px-10 gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
            Stay updated with all system activities and alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={markAllRead}
            className="flex items-center gap-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="hidden xs:inline">Mark All Read</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterType(filterType === 'All' ? 'Unread' : 'All')}
            className="flex items-center gap-2 bg-emerald-700 dark:bg-emerald-500 hover:bg-emerald-800 dark:hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </motion.button>
        </div>
      </motion.div>

      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="flex flex-col gap-3 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500 font-medium">
                    {unreadCount} New
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {['All', 'Unread', 'System', 'Users'].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType(type)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    filterType === type
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => {
                const Icon = notification.icon;
                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30, height: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    whileHover={{ x: 4 }}
                    className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                      notification.unread ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {notification.unread && (
                              <span className="w-2 h-2 rounded-full bg-emerald-700 dark:bg-emerald-500 shrink-0"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleRead(notification.id)}
                              className="p-1 sm:p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:text-emerald-500 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 sm:p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          <span>{notification.time}</span>
                          <span>•</span>
                          <span>{notification.date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications to display.
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-500 hover:underline font-medium"
            >
              Load More
            </motion.button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
export default NotificationPage;