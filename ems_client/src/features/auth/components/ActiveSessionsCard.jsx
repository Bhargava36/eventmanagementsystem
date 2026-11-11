import React, { useState, useEffect, useCallback } from 'react';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  ShieldCheck,
  LogOut,
  RefreshCw,
  Globe,
  Clock,
  AlertCircle
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../Hooks/useToast';
export default function ActiveSessionsCard() {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/security/sessions`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessions || []);
      } else {
        console.warn('[ActiveSessions] Failed to load sessions:', data.message);
      }
    } catch (err) {
      console.error('[ActiveSessions] Network error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const handleRevoke = async (sessionId, isCurrent) => {
    if (isCurrent) {
      toast.info('To log out of this device, please use the Logout button in the sidebar.');
      return;
    }
    if (!window.confirm('Are you sure you want to log out this device? The user session will be terminated immediately.')) {
      return;
    }
    try {
      setRevokingId(sessionId);
      const res = await fetch(`${API_BASE_URL}/api/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Device logged out successfully.');
        setSessions((prev) => prev.filter((s) => s.Id !== sessionId));
      } else {
        toast.error(data.message || 'Failed to revoke session.');
      }
    } catch (err) {
      toast.error('Network error revoking session.');
    } finally {
      setRevokingId(null);
    }
  };
  const handleLogoutAllOthers = async () => {
    if (!window.confirm('Log out from all other devices? All existing sessions except this one will be terminated.')) {
      return;
    }
    try {
      setLoggingOutAll(true);
      const res = await fetch(`${API_BASE_URL}/api/security/logout-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ keepCurrent: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Logged out from ${data.revokedCount || 0} other devices.`);
        fetchSessions();
      } else {
        toast.error(data.message || 'Failed to log out other devices.');
      }
    } catch (err) {
      toast.error('Network error during remote logout.');
    } finally {
      setLoggingOutAll(false);
    }
  };
  const getDeviceIcon = (deviceType) => {
    const dt = (deviceType || '').toLowerCase();
    if (dt.includes('mobile') || dt.includes('phone')) {
      return <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (dt.includes('tablet')) {
      return <Tablet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (dt.includes('desktop')) {
      return <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    return <Laptop className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  };
  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return 'Active recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Active right now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;
  return (
    <div className="bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Active Devices & Sessions
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              {sessions.length} {sessions.length === 1 ? 'Device' : 'Devices'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage devices where your account is currently signed in. You can remotely sign out unrecognized sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSessions}
            disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
            title="Refresh sessions list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {otherSessionsCount > 0 && (
            <button
              type="button"
              onClick={handleLogoutAllOthers}
              disabled={loggingOutAll}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-500" />
              <span>{loggingOutAll ? 'Signing out...' : 'Sign Out Other Devices'}</span>
            </button>
          )}
        </div>
      </div>
      {/* Session List */}
      <div className="mt-5 space-y-3">
        {loading && sessions.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading active sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            No active sessions recorded yet.
          </div>
        ) : (
          sessions.map((sess) => {
            const isCurrent = Boolean(sess.isCurrent);
            return (
              <div
                key={sess.Id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-gray-50/70 dark:bg-gray-900/40 border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shrink-0">
                    {getDeviceIcon(sess.DeviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {sess.Browser || 'Browser'} on {sess.Os || 'Device'}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          This Device
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          Remote Device
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        {sess.IpAddress || '127.0.0.1'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {formatRelativeTime(sess.LastActivityAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center justify-end">
                  {isCurrent ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      Active Session
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevoke(sess.Id, false)}
                      disabled={revokingId === sess.Id}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{revokingId === sess.Id ? 'Logging out...' : 'Log Out Device'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
