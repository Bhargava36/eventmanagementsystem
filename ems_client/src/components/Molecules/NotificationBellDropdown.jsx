import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Users,
  Trophy,
  Mail,
  AlertCircle,
  Megaphone,
  X,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useAuth from '../../Hooks/useAuth';

export default function NotificationBellDropdown({
  className = '',
  align = 'right',
  variant = 'default' // 'default' | 'floating'
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.Id || user?.id || null;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [loading, setLoading] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [liveToast, setLiveToast] = useState(null); // Real-time toast alert

  const dropdownRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const params = new URLSearchParams({ limit: '30' });
      if (userId) params.append('userId', String(userId));

      const res = await fetch(`${API_BASE_URL}/api/notifications?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('[NotificationBell] Fetch error:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Silent polling fallback every 10s
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Real-time WebSocket listener
  useEffect(() => {
    let ws;
    try {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_NOTIFICATION') {
            const notif = data.notification;
            if (!notif.UserId || Number(notif.UserId) === Number(userId)) {
              setNotifications((prev) => [notif, ...prev]);
              setUnreadCount((prev) => prev + 1);

              // Ring animation
              setIsRinging(true);
              setTimeout(() => setIsRinging(false), 1600);

              // Floating live toast banner
              setLiveToast(notif);
              setTimeout(() => setLiveToast(null), 5500);
            }
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (ws) ws.close();
    };
  }, [userId]);

  // Mark single as read
  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read/${id}`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.Id === id ? { ...n, IsRead: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Delete notification
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}`, { method: 'DELETE' });
      const target = notifications.find((n) => n.Id === id);
      if (target && !target.IsRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.Id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Click notification to navigate
  const handleNotificationClick = (notif) => {
    if (!notif.IsRead) {
      handleMarkAsRead(notif.Id);
    }
    if (notif.LinkUrl) {
      setIsOpen(false);
      navigate(notif.LinkUrl);
    }
  };

  // Relative timestamp formatting
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const then = new Date(timestamp);
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Category Icon & Capsule Gradient
  const getCategoryMeta = (type) => {
    switch (type?.toUpperCase()) {
      case 'TEAM_INVITE':
      case 'TEAM':
        return {
          icon: <Users className="w-4 h-4 text-emerald-400" />,
          label: 'Team Dispatch',
          bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30'
        };
      case 'RESULTS':
      case 'TROPHY':
        return {
          icon: <Trophy className="w-4 h-4 text-amber-400" />,
          label: 'Leaderboard',
          bg: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
        };
      case 'BROADCAST':
      case 'MAIL':
        return {
          icon: <Mail className="w-4 h-4 text-cyan-400" />,
          label: 'Broadcast',
          bg: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30'
        };
      case 'ALERT':
      case 'URGENT':
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          label: 'Urgent Alert',
          bg: 'from-rose-500/20 to-red-500/10 border-rose-500/30'
        };
      case 'WELCOME':
      default:
        return {
          icon: <Megaphone className="w-4 h-4 text-emerald-400" />,
          label: 'Event System',
          bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30'
        };
    }
  };

  const filteredNotifications = filter === 'UNREAD'
    ? notifications.filter((n) => !n.IsRead)
    : notifications;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      
      {/* ── TRIGGER BUTTON ── */}
      {variant === 'floating' ? (
        // Floating Top-Right Glass Island Pill
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle notifications island"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative px-3.5 py-2 rounded-full backdrop-blur-xl bg-white/70 dark:bg-black/90 border border-white/60 dark:border-white/10 shadow-[0_8px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] hover:border-emerald-500/40 dark:hover:border-emerald-500/40 text-gray-800 dark:text-gray-200 transition-all duration-300 flex items-center gap-2.5 cursor-pointer group select-none ring-1 ring-black/5 dark:ring-white/5"
        >
          <motion.div
            animate={isRinging ? { rotate: [0, 18, -18, 12, -12, 6, 0] } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Bell className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </motion.div>

          <span className="text-xs font-semibold tracking-tight hidden sm:inline">
            Notifications
          </span>

          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] leading-none shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>
      ) : (
        // Standard Glass Button (Navbar & Mobile Bar)
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle notifications"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative p-2.5 rounded-full backdrop-blur-md bg-white/50 dark:bg-black/90 hover:bg-white/80 dark:hover:bg-white/10 border border-white/50 dark:border-white/10 text-gray-700 dark:text-gray-300 transition-all duration-200 cursor-pointer select-none ring-1 ring-black/5 dark:ring-white/5"
        >
          <motion.div
            animate={isRinging ? { rotate: [0, 18, -18, 12, -12, 6, 0] } : {}}
            transition={{ duration: 0.6 }}
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </motion.div>

          {/* Unread Counter Badge */}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-emerald-500 rounded-full ring-2 ring-white dark:ring-black shadow-[0_0_12px_rgba(16,185,129,0.6)] leading-none"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>
      )}

      {/* ── THE FLOATING GLASSMORPHIC ISLAND (Apple macOS / Raycast style) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, scale: 0.95, filter: 'blur(6px)' }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.8
            }}
            className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-3 w-[92vw] sm:w-[410px] max-w-[430px] backdrop-blur-2xl bg-white/90 dark:bg-black/95 rounded-[30px] border border-white/60 dark:border-white/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.25)] dark:shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9)] ring-1 ring-emerald-500/20 z-50 overflow-hidden text-gray-900 dark:text-gray-100 flex flex-col`}
          >
            {/* Top Iridescent Sheen Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

            {/* ── ISLAND HEADER ── */}
            <div className="px-5 pt-4.5 pb-3 border-b border-gray-100/80 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                    Inbox
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/25">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── RAYCAST STYLE SEGMENTED CONTROL ── */}
            <LayoutGroup id="notification-tab-slider">
              <div className="px-4 py-2 border-b border-gray-100/60 dark:border-white/10 bg-gray-50/50 dark:bg-black">
                <div className="flex p-1 rounded-xl bg-gray-200/50 dark:bg-black border border-gray-200/60 dark:border-white/10">
                  <button
                    onClick={() => setFilter('ALL')}
                    className={`relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                      filter === 'ALL'
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {filter === 'ALL' && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-white dark:bg-white/15 rounded-lg shadow-sm"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">All ({notifications.length})</span>
                  </button>

                  <button
                    onClick={() => setFilter('UNREAD')}
                    className={`relative flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                      filter === 'UNREAD'
                        ? 'text-gray-900 dark:text-white font-bold'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {filter === 'UNREAD' && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute inset-0 bg-white dark:bg-white/15 rounded-lg shadow-sm"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">Unread ({unreadCount})</span>
                  </button>
                </div>
              </div>
            </LayoutGroup>

            {/* ── FLOATING TILES LIST ── */}
            <div className="max-h-[380px] overflow-y-auto px-2 py-2 divide-y divide-transparent sidebar-scrollbar">
              {filteredNotifications.length === 0 ? (
                // Weightless Empty State
                <div className="py-12 px-6 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-500 shadow-sm"
                  >
                    <CheckCheck className="w-6 h-6" />
                  </motion.div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    All caught up
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    You have cleared all alerts and telemetry notifications.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  const meta = getCategoryMeta(n.Type);
                  return (
                    <motion.div
                      key={n.Id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleNotificationClick(n)}
                      className={`relative mx-1.5 my-1.5 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer group flex items-start gap-3 border ${
                        !n.IsRead
                          ? 'bg-emerald-500/[0.07] dark:bg-emerald-500/[0.09] border-emerald-500/30 hover:border-emerald-500/50 shadow-sm'
                          : 'bg-white/40 dark:bg-black border-gray-100 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 shadow-sm'
                      }`}
                    >
                      {/* Left Category Icon Capsule */}
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.bg} flex items-center justify-center shrink-0 border shadow-xs`}
                      >
                        {meta.icon}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 font-sans">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono shrink-0">
                            {formatRelativeTime(n.CreatedAt)}
                          </span>
                        </div>

                        <h4
                          className={`text-xs leading-snug tracking-tight truncate ${
                            !n.IsRead
                              ? 'font-bold text-gray-900 dark:text-white'
                              : 'font-medium text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {n.Title}
                        </h4>

                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {n.Message}
                        </p>

                        {/* Action Link pill */}
                        {n.LinkUrl && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <span>Open Details</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Right Quick Controls */}
                      <div className="flex flex-col items-center gap-1 shrink-0 self-center">
                        {!n.IsRead ? (
                          <button
                            onClick={(e) => handleMarkAsRead(n.Id, e)}
                            className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Mark as read"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/30" />
                          </button>
                        ) : (
                          <span className="w-2 h-2 opacity-0" />
                        )}

                        <button
                          onClick={(e) => handleDelete(n.Id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* ── ISLAND FOOTER (Raycast status bar) ── */}
            <div className="px-4 py-2.5 border-t border-gray-100/80 dark:border-white/10 bg-gray-50/70 dark:bg-black flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5 text-[10px]">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span>AYOJAN Live WebSocket Telemetry</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                Esc
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REAL-TIME TOAST ALERT (Top Right Corner) ── */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-5 right-5 z-[100] max-w-sm p-4 rounded-3xl backdrop-blur-2xl bg-white/90 dark:bg-black/95 border border-emerald-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex items-start gap-3 cursor-pointer ring-1 ring-emerald-500/20"
            onClick={() => handleNotificationClick(liveToast)}
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white truncate">
                  {liveToast.Title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLiveToast(null);
                  }}
                  className="p-1 rounded text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {liveToast.Message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
