import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  Users,
  UserPlus,
  AlertCircle,
  Trash2,
  Check,
  Filter,
  RefreshCw,
} from 'lucide-react';

const API_ENDPOINTS = {
  registrations: `http://localhost:3000/api/event_reg/recent`,
  activities: `http://localhost:3000/api/event_reg/activities`,
  teams: `http://localhost:3000/api/teams/`,
  events: `http://localhost:3000/api/events/`,
};

const READ_NOTIFICATIONS_KEY = 'ems_read_notifications';
const DELETED_NOTIFICATIONS_KEY = 'ems_deleted_notifications';
const getStoredIds = (key) => {
  try {
    const storedData = localStorage.getItem(key);
    const parsedData = storedData ? JSON.parse(storedData) : [];
    return Array.isArray(parsedData) ? parsedData : [];
  } catch {
    return [];
  }
};
const saveStoredIds = (key, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
  }
};
const getArray = (response, possibleKeys = []) => {
  if (Array.isArray(response)) {
    return response;
  }
  if (!response || typeof response !== 'object') {
    return [];
  }
  for (const key of possibleKeys) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return [];
};
const getValue = (object, keys, fallback = '') => {
  for (const key of keys) {
    if (
      object?.[key] !== undefined &&
      object?.[key] !== null &&
      object?.[key] !== ''
    ) {
      return object[key];
    }
  }
  return fallback;
};
const getTimestamp = (value) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getTimeAgo = (dateValue) => {
  if (!dateValue) return 'Recently';
  const timestamp = getTimestamp(dateValue);
  if (!timestamp) return 'Recently';
  const difference = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 60) return 'Just now';
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  return new Date(timestamp).toLocaleDateString('en-IN');
};

const getFormattedDate = (dateValue) => {
  if (!dateValue) return 'Date unavailable';
  const timestamp = getTimestamp(dateValue);
  if (!timestamp) return 'Date unavailable';
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function NotificationPage() {
  const [filterType, setFilterType] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchNotifications = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    }
    setError('');
    try {
      const endpointEntries = Object.entries(API_ENDPOINTS);
      const results = await Promise.allSettled(
        endpointEntries.map(async ([type, url]) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`${type} API returned status ${response.status}`);
          }
          return {
            type,
            data: await response.json(),
          };
        })
      );
      const apiData = {};
      const failedApis = [];
      results.forEach((result, index) => {
        const type = endpointEntries[index][0];
        if (result.status === 'fulfilled') {
          apiData[result.value.type] = result.value.data;
        } else {
          failedApis.push(type);
          console.error(`Failed to fetch ${type}:`, result.reason);
        }
      });
      if (failedApis.length === endpointEntries.length) {
        throw new Error(
          'All notification APIs failed. Please check your backend server and API routes.'
        );
      }
      const notifications = [];
      const registrations = getArray(apiData.registrations, [
        'registrations',
        'registration',
        'results',
      ]);
      registrations.forEach((registration, index) => {
        const registrationId = getValue( registration, ['RegistrationId', 'registrationId', 'Id', 'id', 'UserId', 'userId'], index);
        const userName = getValue( registration, ['UserName', 'userName', 'Name', 'name', 'FullName', 'fullName'], 'A user');
        const createdAt = getValue(registration,['CreatedAt','createdAt','RegistrationDate','registrationDate','CreatedDate','created_at',],null);
        notifications.push({
          id: `registration-${registrationId}`,
          icon: UserPlus,
          title: 'New Registration',
          message: `${userName} has registered on the platform.`,
          time: getTimeAgo(createdAt),
          date: getFormattedDate(createdAt),
          timestamp: getTimestamp(createdAt),
          category: 'Users',
          unread: true,
        });
      });
      const teams = getArray(apiData.teams, ['teams','registeredTeams','results',]);
      teams.forEach((team, index) => {
        const teamId = getValue(team, ['TeamId', 'teamId', 'Id', 'id'], index );
        const teamName = getValue( team, ['TeamName', 'teamName', 'Name', 'name'],`Team ${teamId}`);
        const createdAt = getValue( team, ['CreatedAt','createdAt','RegistrationDate','registrationDate','CreatedDate','created_at',], null );
        notifications.push({
          id: `team-${teamId}`,
          icon: Users,
          title: 'Team Registration',
          message: `Team "${teamName}" has registered on the platform.`,
          time: getTimeAgo(createdAt),
          date: getFormattedDate(createdAt),
          timestamp: getTimestamp(createdAt),
          category: 'Users',
          unread: true,
        });
      });
      const events = getArray(apiData.events, ['events','event','results',]);
      events.forEach((event, index) => {
        const eventId = getValue(event, ['EventId', 'eventId', 'Id', 'id'], index );
        const eventName = getValue( event, [ 'EventName','eventName','Name','name','Title','title',], `Event ${eventId}`);
        const createdAt = getValue(event, ['CreatedAt', 'createdAt', 'CreatedDate', 'createdDate', 'created_at'], null);
        notifications.push({
          id: `event-${eventId}`,
          icon: Calendar,
          title: 'Event Created',
          message: `Event "${eventName}" is available on the platform.`,
          time: getTimeAgo(createdAt),
          date: getFormattedDate(createdAt),
          timestamp: getTimestamp(createdAt),
          category: 'Events',
          unread: true,
        });
      });
      const activities = getArray(apiData.activities, ['activities','activity','results',]);
      activities.forEach((activity, index) => {
        const activityId = getValue(activity, ['ActivityId', 'activityId', 'Id', 'id'], index );
        const message = getValue(activity, ['Message','message','Description','description','Activity','activity',], 'A new platform activity was recorded.');
        const createdAt = getValue(activity,['CreatedAt', 'createdAt', 'CreatedDate', 'createdDate', 'created_at'], null);
        notifications.push({
          id: `activity-${activityId}`,
          icon: Bell,
          title: 'Recent Activity',
          message,
          time: getTimeAgo(createdAt),
          date: getFormattedDate(createdAt),
          timestamp: getTimestamp(createdAt),
          category: 'System',
          unread: true,
        });
      });
      notifications.sort(
        (first, second) => second.timestamp - first.timestamp
      );
      const readIds = new Set(getStoredIds(READ_NOTIFICATIONS_KEY));
      const deletedIds = new Set(getStoredIds(DELETED_NOTIFICATIONS_KEY));
      const visibleNotifications = notifications
        .filter((notification) => !deletedIds.has(notification.id))
        .map((notification) => ({
          ...notification,
          unread: !readIds.has(notification.id),
        }));
      setItems(visibleNotifications);
      setLastUpdated(new Date());
      if (failedApis.length > 0) {
        setError(`Some APIs could not be reached: ${failedApis.join(', ')}. Available notifications are displayed.`);
      }
    } catch (err) {
      console.error('Notification fetch error:', err);
      setError(
        err.message || 'Unable to fetch notifications from the server.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  const filteredNotifications = items.filter((notification) => {
    if (filterType === 'Unread') {
      return notification.unread;
    }
    if (filterType === 'System') {
      return notification.category === 'System';
    }
    if (filterType === 'Users') {
      return notification.category === 'Users';
    }
    if (filterType === 'Events') {
      return notification.category === 'Events';
    }
    return true;
  });

  const unreadCount = items.filter((notification) => notification.unread).length;
  const markAllRead = () => {
    const existingReadIds = getStoredIds(READ_NOTIFICATIONS_KEY);
    const updatedReadIds = [
      ...existingReadIds,
      ...items.map((item) => item.id),
    ];
    saveStoredIds(READ_NOTIFICATIONS_KEY, updatedReadIds);
    setItems((previousItems) => previousItems.map((item) => ({ ...item, unread: false,})));
  };
  const deleteNotification = (id) => {
    const deletedIds = getStoredIds(DELETED_NOTIFICATIONS_KEY);
    saveStoredIds(DELETED_NOTIFICATIONS_KEY, [...deletedIds, id]);
    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };
  const toggleRead = (id) => {
    const readIds = new Set(getStoredIds(READ_NOTIFICATIONS_KEY));
    const notification = items.find((item) => item.id === id);
    if (!notification) return;
    if (notification.unread) {
      readIds.add(id);
    } else {
      readIds.delete(id);
    }
    saveStoredIds(READ_NOTIFICATIONS_KEY, [...readIds]);
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? { ...item, unread: !item.unread }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-black">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 px-4 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-10 md:px-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">
            Stay updated with all system activities and alerts.
          </p>
          {lastUpdated && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 sm:px-4 sm:text-sm"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 sm:px-4 sm:text-sm"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              setFilterType(filterType === 'All' ? 'Unread' : 'All')
            }
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 sm:px-4 sm:text-sm"
          >
            <Filter className="h-4 w-4" />
            Filter
          </motion.button>
        </div>
      </motion.div>

      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                  Recent Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {items.length} total
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Unread', 'System', 'Users', 'Events'].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    filterType === type
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 sm:m-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="flex-1">
                  <p>{error}</p>

                  <button
                    onClick={() => fetchNotifications(true)}
                    className="mt-2 font-semibold underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fetching notifications...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
              <AnimatePresence mode="popLayout">
                {filteredNotifications.map((notification, index) => {
                  const Icon = notification.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: Math.min(index * 0.03, 0.3),
                      }}
                      whileHover={{ x: 4 }}
                      className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 sm:p-6 ${
                        notification.unread
                          ? 'bg-emerald-50/30 dark:bg-emerald-500/5'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="shrink-0 rounded-lg bg-emerald-100 p-2 dark:bg-emerald-500/20 sm:p-2.5">
                          <Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-500 sm:h-5 sm:w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                                {notification.title}
                              </h3>

                              {notification.unread && (
                                <span
                                  title="Unread"
                                  className="h-2 w-2 shrink-0 rounded-full bg-emerald-700 dark:bg-emerald-500"
                                />
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleRead(notification.id)}
                                title={
                                  notification.unread
                                    ? 'Mark as read'
                                    : 'Mark as unread'
                                }
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-500"
                              >
                                <Check className="h-4 w-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                title="Remove notification"
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-500/20 dark:hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>

                          <p className="mb-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                            {notification.message}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
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
                <div className="p-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>

                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    No notifications found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {error
                      ? 'Check your backend APIs and try again.'
                      : 'There are no notifications in this category.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-800 sm:p-6">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Notifications refresh automatically every 15 seconds.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
export default NotificationPage;