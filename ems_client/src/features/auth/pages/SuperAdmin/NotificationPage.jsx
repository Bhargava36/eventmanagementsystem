import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  Users,
  UserPlus,
  AlertCircle,
  Trash2,
  Check,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Mail,
  MailOpen,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const API_ENDPOINTS = {
  registrations: `${API_BASE_URL}/api/event_reg/recent`,
  activities: `${API_BASE_URL}/api/event_reg/activities`,
  teams: `${API_BASE_URL}/api/teams/`,
  events: `${API_BASE_URL}/api/events/`,
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
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Filtration state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'System' | 'Users' | 'Events'
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
        const registrationId = getValue(
          registration,
          ['RegistrationId', 'registrationId', 'Id', 'id', 'UserId', 'userId'],
          index
        );
        const userName = getValue(
          registration,
          ['UserName', 'userName', 'Name', 'name', 'FullName', 'fullName'],
          'A user'
        );
        const createdAt = getValue(
          registration,
          [
            'CreatedAt',
            'createdAt',
            'RegistrationDate',
            'registrationDate',
            'CreatedDate',
            'created_at',
          ],
          null
        );
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

      const teams = getArray(apiData.teams, [
        'teams',
        'registeredTeams',
        'results',
      ]);
      teams.forEach((team, index) => {
        const teamId = getValue(team, ['TeamId', 'teamId', 'Id', 'id'], index);
        const teamName = getValue(
          team,
          ['TeamName', 'teamName', 'Name', 'name'],
          `Team ${teamId}`
        );
        const createdAt = getValue(
          team,
          [
            'CreatedAt',
            'createdAt',
            'RegistrationDate',
            'registrationDate',
            'CreatedDate',
            'created_at',
          ],
          null
        );
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

      const events = getArray(apiData.events, ['events', 'event', 'results']);
      events.forEach((event, index) => {
        const eventId = getValue(
          event,
          ['EventId', 'eventId', 'Id', 'id'],
          index
        );
        const eventName = getValue(
          event,
          ['EventName', 'eventName', 'Name', 'name', 'Title', 'title'],
          `Event ${eventId}`
        );
        const createdAt = getValue(
          event,
          ['CreatedAt', 'createdAt', 'CreatedDate', 'createdDate', 'created_at'],
          null
        );
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

      const activities = getArray(apiData.activities, [
        'activities',
        'activity',
        'results',
      ]);
      activities.forEach((activity, index) => {
        const activityId = getValue(
          activity,
          ['ActivityId', 'activityId', 'Id', 'id'],
          index
        );
        const message = getValue(
          activity,
          [
            'Message',
            'message',
            'Description',
            'description',
            'Activity',
            'activity',
          ],
          'A new platform activity was recorded.'
        );
        const createdAt = getValue(
          activity,
          ['CreatedAt', 'createdAt', 'CreatedDate', 'createdDate', 'created_at'],
          null
        );
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
        setError(
          `Some APIs could not be reached: ${failedApis.join(
            ', '
          )}. Available notifications are displayed.`
        );
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

  // Counts for KPIs and badges
  const unreadCount = useMemo(
    () => items.filter((n) => n.unread).length,
    [items]
  );
  const usersCount = useMemo(
    () => items.filter((n) => n.category === 'Users').length,
    [items]
  );
  const eventsCount = useMemo(
    () => items.filter((n) => n.category === 'Events').length,
    [items]
  );
  const systemCount = useMemo(
    () => items.filter((n) => n.category === 'System').length,
    [items]
  );

  // Filter and Sort memo
  const filteredAndSortedNotifications = useMemo(() => {
    return items
      .filter((notification) => {
        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = notification.title?.toLowerCase().includes(query);
          const matchMessage = notification.message?.toLowerCase().includes(query);
          const matchCategory = notification.category?.toLowerCase().includes(query);
          if (!matchTitle && !matchMessage && !matchCategory) {
            return false;
          }
        }

        // Category filter
        if (filterType !== 'All' && notification.category !== filterType) {
          return false;
        }

        // Read/Unread status filter
        if (readFilter === 'unread' && !notification.unread) {
          return false;
        }
        if (readFilter === 'read' && notification.unread) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'oldest') {
          return (a.timestamp || 0) - (b.timestamp || 0);
        }
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
  }, [items, searchQuery, filterType, readFilter, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedNotifications.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredAndSortedNotifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const isFilterActive =
    searchQuery.trim() !== '' ||
    filterType !== 'All' ||
    readFilter !== 'all' ||
    sortOrder !== 'newest';

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('All');
    setReadFilter('all');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  const markAllRead = () => {
    const existingReadIds = getStoredIds(READ_NOTIFICATIONS_KEY);
    const updatedReadIds = [
      ...existingReadIds,
      ...items.map((item) => item.id),
    ];
    saveStoredIds(READ_NOTIFICATIONS_KEY, updatedReadIds);
    setItems((previousItems) =>
      previousItems.map((item) => ({ ...item, unread: false }))
    );
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
        item.id === id ? { ...item, unread: !item.unread } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-black">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 px-4 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-10 md:px-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">
            Stay updated with all system activities, registrations, and alerts.
          </p>
          {lastUpdated && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
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
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800 sm:px-4 sm:text-sm"
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
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800 sm:px-4 sm:text-sm"
          >
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Mark All Read
          </motion.button>
        </div>
      </motion.div>

      <div className="space-y-6 p-4 sm:p-6 md:p-10">
        {/* Quick Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              setFilterType('All');
              setReadFilter('all');
              setCurrentPage(1);
            }}
            className={`rounded-xl border p-4 text-left transition-all ${
              filterType === 'All' && readFilter === 'all'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500 dark:bg-emerald-950/20'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Total
              </span>
              <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {items.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setReadFilter('unread');
              setCurrentPage(1);
            }}
            className={`rounded-xl border p-4 text-left transition-all ${
              readFilter === 'unread'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500 dark:bg-emerald-950/20'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Unread
              </span>
              <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {unreadCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterType('Users');
              setCurrentPage(1);
            }}
            className={`rounded-xl border p-4 text-left transition-all ${
              filterType === 'Users'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500 dark:bg-emerald-950/20'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                User Activity
              </span>
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {usersCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterType('Events');
              setCurrentPage(1);
            }}
            className={`rounded-xl border p-4 text-left transition-all ${
              filterType === 'Events'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500 dark:bg-emerald-950/20'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Event Alerts
              </span>
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {eventsCount}
            </p>
          </button>
        </div>

        {/* Main Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          {/* Filtration Controls Bar */}
          <div className="border-b border-gray-200 p-4 dark:border-zinc-800 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search notifications by title, message, user, team..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/60 py-2 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-white dark:placeholder-gray-500 dark:focus:bg-zinc-900"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Sorting Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Dropdown */}
                <select
                  value={readFilter}
                  onChange={(e) => {
                    setReadFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-200 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>

                {/* Sort Order */}
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-200 sm:text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

                {/* Reset Filters Button */}
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800 sm:text-sm"
                    title="Reset all filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-zinc-800/80">
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Category:
              </span>
              {[
                { label: 'All', value: 'All', count: items.length },
                { label: 'System', value: 'System', count: systemCount },
                { label: 'Users', value: 'Users', count: usersCount },
                { label: 'Events', value: 'Events', count: eventsCount },
              ].map(({ label, value, count }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFilterType(value);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    filterType === value
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      filterType === value
                        ? 'bg-emerald-700/60 text-white'
                        : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-gray-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 sm:m-6">
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

          {/* Notifications List Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fetching notifications...
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              <AnimatePresence mode="popLayout">
                {paginatedNotifications.map((notification, index) => {
                  const Icon = notification.icon || Bell;

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30, height: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: Math.min(index * 0.02, 0.2),
                      }}
                      className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50 sm:p-5 ${
                        notification.unread
                          ? 'bg-emerald-50/25 dark:bg-emerald-500/5'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className={`shrink-0 rounded-lg p-2.5 transition-colors sm:p-3 ${
                            notification.unread
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-gray-400'
                          }`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
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
                                  className="h-2 w-2 shrink-0 rounded-full bg-emerald-600 dark:bg-emerald-400"
                                />
                              )}

                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                                {notification.category}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleRead(notification.id)}
                                title={
                                  notification.unread
                                    ? 'Mark as read'
                                    : 'Mark as unread'
                                }
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:text-gray-500 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400"
                              >
                                {notification.unread ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <MailOpen className="h-4 w-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                title="Remove notification"
                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <p className="mb-2 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                            {notification.message}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 dark:text-zinc-500">
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

              {/* Empty State */}
              {filteredAndSortedNotifications.length === 0 && (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                    <Bell className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    No notifications found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isFilterActive
                      ? 'No notifications match your current search and filter criteria.'
                      : 'There are no notifications available at this moment.'}
                  </p>
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredAndSortedNotifications.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-black sm:flex-row sm:px-6 sm:py-4">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <span>
                  Showing{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {startIndex + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.min(
                      startIndex + itemsPerPage,
                      filteredAndSortedNotifications.length
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filteredAndSortedNotifications.length}
                  </span>{' '}
                  notifications
                </span>

                <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-gray-200 dark:border-zinc-800 pl-3">
                  <span className="text-xs text-gray-400">Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Page Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-900"
                  title="First page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-900"
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - safeCurrentPage) <= 1
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) {
                        acc.push({ type: 'ellipsis', key: `ellipsis-${p}` });
                      }
                      acc.push({ type: 'page', page: p, key: `page-${p}` });
                      return acc;
                    }, [])
                    .map((item) =>
                      item.type === 'ellipsis' ? (
                        <span
                          key={item.key}
                          className="px-1.5 text-xs text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setCurrentPage(item.page)}
                          className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors ${
                            safeCurrentPage === item.page
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-900'
                          }`}
                        >
                          {item.page}
                        </button>
                      )
                    )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-900"
                  title="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-900"
                  title="Last page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom auto-refresh indicator note */}
          {!loading && items.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5 dark:border-zinc-900 sm:px-6">
              <p className="text-[11px] text-gray-400 dark:text-zinc-500">
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