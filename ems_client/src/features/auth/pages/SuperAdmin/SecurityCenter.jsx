import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import Pagination from '../../../../components/Molecules/Pagination';
export default function SecurityCenter() {
  const toast = useToast();
  // Active Tab: 'alerts' | 'sessions' | 'login-history' | 'unlock'
  const [activeTab, setActiveTab] = useState('alerts');
  const [refreshing, setRefreshing] = useState(false);
  // Overview stats
  const [overview, setOverview] = useState({
    activeSessions: 0,
    threats: { openAlerts: 0, criticalAlerts: 0, highAlerts: 0 },
    failedLogins24h: 0,
    lockedAccounts: 0,
    systemLoad: { cpuPercent: 0, memUsagePercent: 0, dbLatencyMs: 0 }
  });
  // Helper for auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);
  // Fetch security overview
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/security/overview`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOverview(data.overview || {});
      }
    } catch (err) {
      console.error('[SecurityCenter] Error fetching overview:', err);
    }
  }, [getAuthHeaders]);
  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);
  // =========================================================================
  // TAB 1: ALERTS & INCIDENTS
  // =========================================================================
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsPage, setAlertsPage] = useState(1);
  const [alertsPageSize, setAlertsPageSize] = useState(10);
  const [alertsTotalPages, setAlertsTotalPages] = useState(1);
  const [alertsTotal, setAlertsTotal] = useState(0);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState('ALL');
  const [alertStatusFilter, setAlertStatusFilter] = useState('ALL');

  // Alert Resolution Modal
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingAlert, setUpdatingAlert] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const params = new URLSearchParams({
        page: String(alertsPage),
        limit: String(alertsPageSize)
      });
      if (alertSeverityFilter !== 'ALL') params.append('severity', alertSeverityFilter);
      if (alertStatusFilter !== 'ALL') params.append('status', alertStatusFilter);
      const res = await fetch(`${API_BASE_URL}/api/security/alerts?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlerts(data.alerts || []);
        if (data.pagination) {
          setAlertsTotalPages(data.pagination.totalPages || 1);
          setAlertsTotal(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('[SecurityCenter] Error fetching alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  }, [alertsPage, alertsPageSize, alertSeverityFilter, alertStatusFilter, getAuthHeaders]);
  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlerts();
    }
  }, [activeTab, fetchAlerts]);
  const handleUpdateAlertStatus = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      setUpdatingAlert(true);
      const res = await fetch(`${API_BASE_URL}/api/security/alerts/${selectedAlert.Id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: resolutionStatus,
          resolutionNotes: resolutionNotes.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Alert marked as ${resolutionStatus}`);
        setSelectedAlert(null);
        setResolutionNotes('');
        fetchAlerts();
        fetchOverview();
      } else {
        toast.error(data.message || 'Failed to update alert');
      }
    } catch (err) {
      toast.error('Network error updating alert');
    } finally {
      setUpdatingAlert(false);
    }
  };
  // =========================================================================
  // TAB 2: ACTIVE SESSIONS EXPLORER
  // =========================================================================
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsPageSize, setSessionsPageSize] = useState(8);
  const [sessionsTotalPages, setSessionsTotalPages] = useState(1);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionSearch, setSessionSearch] = useState('');
  const [revokingSessionId, setRevokingSessionId] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const params = new URLSearchParams({
        page: String(sessionsPage),
        limit: String(sessionsPageSize)
      });
      if (sessionSearch.trim()) params.append('search', sessionSearch.trim());
      const res = await fetch(`${API_BASE_URL}/api/security/all-sessions?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSessions(data.sessions || []);
        if (data.pagination) {
          setSessionsTotalPages(data.pagination.totalPages || 1);
          setSessionsTotal(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('[SecurityCenter] Error fetching sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionsPage, sessionsPageSize, sessionSearch, getAuthHeaders]);
  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    }
  }, [activeTab, fetchSessions]);
  const handleRevokeSession = async (sessionId, userEmail) => {
    if (!window.confirm(`Revoke active session for ${userEmail || 'user'}? The user will be immediately logged out.`)) {
      return;
    }
    try {
      setRevokingSessionId(sessionId);
      const res = await fetch(`${API_BASE_URL}/api/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Session revoked successfully.');
        fetchSessions();
        fetchOverview();
      } else {
        toast.error(data.message || 'Failed to revoke session');
      }
    } catch (err) {
      toast.error('Network error revoking session');
    } finally {
      setRevokingSessionId(null);
    }
  };
  const handleRevokeAllOtherSessions = async () => {
    if (!window.confirm('Revoke all other active sessions across devices? Your current session will remain active.')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/security/logout-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ keepCurrent: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Revoked ${data.revokedCount ?? 'all'} other active sessions.`);
        fetchSessions();
        fetchOverview();
      } else {
        toast.error(data.message || 'Failed to revoke other sessions');
      }
    } catch (err) {
      toast.error('Network error revoking other sessions');
    }
  };
  // =========================================================================
  // TAB 3: LOGIN HISTORY AUDIT
  // =========================================================================
  const [loginHistory, setLoginHistory] = useState([]);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginPage, setLoginPage] = useState(1);
  const [loginPageSize, setLoginPageSize] = useState(10);
  const [loginTotalPages, setLoginTotalPages] = useState(1);
  const [loginTotal, setLoginTotal] = useState(0);
  const [loginStatusFilter, setLoginStatusFilter] = useState('ALL');
  const [loginSearch, setLoginSearch] = useState('');

  const fetchLoginHistory = useCallback(async () => {
    try {
      setLoginLoading(true);
      const params = new URLSearchParams({
        page: String(loginPage),
        limit: String(loginPageSize)
      });
      if (loginStatusFilter !== 'ALL') params.append('status', loginStatusFilter);
      if (loginSearch.trim()) params.append('search', loginSearch.trim());
      const res = await fetch(`${API_BASE_URL}/api/security/login-history?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginHistory(data.history || []);
        if (data.pagination) {
          setLoginTotalPages(data.pagination.totalPages || 1);
          setLoginTotal(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('[SecurityCenter] Error fetching login history:', err);
    } finally {
      setLoginLoading(false);
    }
  }, [loginPage, loginPageSize, loginStatusFilter, loginSearch, getAuthHeaders]);
  useEffect(() => {
    if (activeTab === 'login-history') {
      fetchLoginHistory();
    }
  }, [activeTab, fetchLoginHistory]);
  // =========================================================================
  // TAB 4: LOCKED ACCOUNTS & QUICK ACCOUNT UNLOCK TOOL
  // =========================================================================
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [lockedLoading, setLockedLoading] = useState(false);
  const [lockedSearch, setLockedSearch] = useState('');
  const [lockedPage, setLockedPage] = useState(1);
  const [lockedPageSize, setLockedPageSize] = useState(10);
  const [lockedTotalPages, setLockedTotalPages] = useState(1);
  const [lockedTotal, setLockedTotal] = useState(0);
  const [unlockingEmail, setUnlockingEmail] = useState(null);
  const [unlockingAll, setUnlockingAll] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState(null);

  const fetchLockedAccounts = useCallback(async () => {
    try {
      setLockedLoading(true);
      const params = new URLSearchParams({
        page: String(lockedPage),
        limit: String(lockedPageSize)
      });
      if (lockedSearch.trim()) params.append('search', lockedSearch.trim());
      const res = await fetch(`${API_BASE_URL}/api/security/locked-accounts?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLockedAccounts(data.accounts || []);
        if (data.pagination) {
          setLockedTotalPages(data.pagination.totalPages || 1);
          setLockedTotal(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('[SecurityCenter] Error fetching locked accounts:', err);
    } finally {
      setLockedLoading(false);
    }
  }, [lockedPage, lockedPageSize, lockedSearch, getAuthHeaders]);

  useEffect(() => {
    if (activeTab === 'unlock') {
      fetchLockedAccounts();
    }
  }, [activeTab, fetchLockedAccounts]);

  const handleQuickUnlock = async (email) => {
    if (!email) return;
    try {
      setUnlockingEmail(email);
      const res = await fetch(`${API_BASE_URL}/api/security/unlock-account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Account unlocked: ${email}`);
        fetchLockedAccounts();
        fetchOverview();
      } else {
        toast.error(data.message || 'Failed to unlock account');
      }
    } catch (err) {
      toast.error('Network error unlocking account');
    } finally {
      setUnlockingEmail(null);
    }
  };

  const handleUnlockAll = async () => {
    if (!window.confirm('Unlock all currently locked accounts immediately? This will clear all active brute-force locks.')) {
      return;
    }
    try {
      setUnlockingAll(true);
      const res = await fetch(`${API_BASE_URL}/api/security/unlock-all-accounts`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'All accounts unlocked successfully');
        fetchLockedAccounts();
        fetchOverview();
      } else {
        toast.error(data.message || 'Failed to unlock accounts');
      }
    } catch (err) {
      toast.error('Network error unlocking all accounts');
    } finally {
      setUnlockingAll(false);
    }
  };

  const handleUnlockAccount = async (e) => {
    e.preventDefault();
    if (!unlockEmail.trim()) {
      toast.error('Please enter an email address.');
      return;
    }
    try {
      setUnlocking(true);
      setUnlockResult(null);
      const res = await fetch(`${API_BASE_URL}/api/security/unlock-account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: unlockEmail.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Account unlocked successfully.`);
        setUnlockResult({
          success: true,
          message: data.message || `Lockout cleared for ${unlockEmail.trim()}. User may log in immediately.`
        });
        setUnlockEmail('');
        fetchOverview();
        fetchLockedAccounts();
      } else {
        toast.error(data.message || 'Account not found or not locked.');
        setUnlockResult({
          success: false,
          message: data.message || 'Failed to unlock account.'
        });
      }
    } catch (err) {
      toast.error('Network error unlocking account.');
    } finally {
      setUnlocking(false);
    }
  };
  // Global manual refresh
  const handleGlobalRefresh = async () => {
    setRefreshing(true);
    await fetchOverview();
    if (activeTab === 'alerts') await fetchAlerts();
    else if (activeTab === 'sessions') await fetchSessions();
    else if (activeTab === 'login-history') await fetchLoginHistory();
    else if (activeTab === 'unlock') await fetchLockedAccounts();
    setRefreshing(false);
    toast.success('Security telemetry refreshed.');
  };
  // Helper formatting
  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ` · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } catch {
      return String(ts);
    }
  };
  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Laptop;
    }
  };
  const getSeverityStyle = (sev) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' };
      case 'HIGH':
        return { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
      case 'MEDIUM':
        return { text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' };
      case 'LOW':
      default:
        return { text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' };
    }
  };

  const getAlertStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' };
      case 'INVESTIGATING':
        return { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
      case 'RESOLVED':
        return { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'FALSE_POSITIVE':
      default:
        return { text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' };
    }
  };

  const getLoginStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return { text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'ACCOUNT_LOCKED':
        return { text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' };
      case 'FAILED_PASSWORD':
        return { text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
      default:
        return { text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' };
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                  Security Center
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enterprise identity protection, brute-force shielding, and real-time incident response.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGlobalRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Active Threats */}
          <div
            onClick={() => setActiveTab('alerts')}
            className={`rounded-2xl border p-6 shadow-xs cursor-pointer transition-all ${
              activeTab === 'alerts'
                ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-white dark:bg-black'
                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Threat Incidents
              </span>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {overview.threats?.openAlerts ?? 0}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">open</span>
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{overview.threats?.criticalAlerts ?? 0} Critical</span>
              <span className="text-gray-300 dark:text-zinc-700">|</span>
              <span>{overview.threats?.highAlerts ?? 0} High</span>
            </div>
          </div>
          {/* Card 2: Active Sessions */}
          <div
            onClick={() => setActiveTab('sessions')}
            className={`rounded-2xl border p-6 shadow-xs cursor-pointer transition-all ${
              activeTab === 'sessions'
                ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-white dark:bg-black'
                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Sessions
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                <Laptop className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {overview.activeSessions ?? 0}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">devices</span>
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Live authenticated tokens</span>
            </div>
          </div>
          {/* Card 3: Failed Logins (24h) */}
          <div
            onClick={() => setActiveTab('login-history')}
            className={`rounded-2xl border p-6 shadow-xs cursor-pointer transition-all ${
              activeTab === 'login-history'
                ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-white dark:bg-black'
                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Failed Logins (24h)
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {overview.failedLogins24h ?? 0}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">attempts</span>
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Brute force filter active</span>
            </div>
          </div>
          {/* Card 4: Locked Accounts */}
          <div
            onClick={() => setActiveTab('unlock')}
            className={`rounded-2xl border p-6 shadow-xs cursor-pointer transition-all ${
              activeTab === 'unlock'
                ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-white dark:bg-black'
                : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Locked Accounts
              </span>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {overview.lockedAccounts ?? 0}
              </span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">temporary locks</span>
            </div>
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-zinc-400"></span>
              <span>15m auto-cooling window</span>
            </div>
          </div>
        </div>
        {/* TAB NAVIGATION */}
        <div className="border-b border-gray-200 dark:border-zinc-800">
          <nav className="flex space-x-6">
            {[
              { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert, count: overview.threats?.openAlerts },
              { id: 'sessions', label: 'Active Sessions', icon: Laptop, count: overview.activeSessions },
              { id: 'login-history', label: 'Login History', icon: Clock },
              { id: 'unlock', label: 'Account Unlock Tool', icon: Unlock, count: overview.lockedAccounts }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        {/* TAB CONTENT */}
        {/* TAB 1: ALERTS */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Severity:</span>
                  <select
                    value={alertSeverityFilter}
                    onChange={(e) => {
                      setAlertSeverityFilter(e.target.value);
                      setAlertsPage(1);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">Status:</span>
                  <select
                    value={alertStatusFilter}
                    onChange={(e) => {
                      setAlertStatusFilter(e.target.value);
                      setAlertsPage(1);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="FALSE_POSITIVE">False Positive</option>
                  </select>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {alerts.length} of {alertsTotal} incidents
              </div>
            </div>
            {/* Alerts Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4">Severity</th>
                      <th className="px-6 py-4">Alert Incident</th>
                      <th className="px-6 py-4">Source IP</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                    {alertsLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                          <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-600 dark:text-emerald-400" />
                          Loading security alerts...
                        </td>
                      </tr>
                    ) : alerts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                          <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                          No security alerts matching criteria. System is secure.
                        </td>
                      </tr>
                    ) : (
                      alerts.map((alert) => {
                        const sev = getSeverityStyle(alert.Severity);
                        const stat = getAlertStatusStyle(alert.Status);
                        return (
                          <tr key={alert.Id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-2 text-xs font-semibold ${sev.text}`}>
                                <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                                {alert.Severity}
                              </span>
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {alert.Title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                {alert.Description}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                              {alert.SourceIp || '—'}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-2 text-xs font-medium ${stat.text}`}>
                                <span className={`w-2 h-2 rounded-full ${stat.dot}`} />
                                {alert.Status}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(alert.CreatedAt)}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-right">
                              <button
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setResolutionStatus(alert.Status === 'OPEN' ? 'RESOLVED' : alert.Status);
                                  setResolutionNotes(alert.ResolutionNotes || '');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-medium text-gray-800 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination with Direct Page Numbers */}
              <Pagination
                currentPage={alertsPage}
                totalPages={alertsTotalPages}
                totalItems={alertsTotal}
                pageSize={alertsPageSize}
                onPageChange={setAlertsPage}
                onPageSizeChange={setAlertsPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                itemName="incidents"
              />
            </div>
          </div>
        )}
        {/* TAB 2: ACTIVE SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search user email, IP address, or OS..."
                  value={sessionSearch}
                  onChange={(e) => {
                    setSessionSearch(e.target.value);
                    setSessionsPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Active Authenticated Sessions: <strong className="text-gray-900 dark:text-white">{sessionsTotal}</strong>
                </span>
                {sessionsTotal > 1 && (
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-400 transition-colors shadow-xs cursor-pointer"
                  >
                    Revoke Other Sessions
                  </button>
                )}
              </div>
            </div>
            {/* Sessions Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4">User & Role</th>
                      <th className="px-6 py-4">Device & Environment</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">Last Active</th>
                      <th className="px-6 py-4">Expires</th>
                      <th className="px-6 py-4 text-right">Revocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                    {sessionsLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                          <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-600 dark:text-emerald-400" />
                          Loading active sessions...
                        </td>
                      </tr>
                    ) : sessions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                          No active sessions found.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((s) => {
                        const DeviceIcon = getDeviceIcon(s.DeviceType);
                        const browserLabel = s.Browser && s.Browser !== 'Unknown' ? s.Browser : 'Web Browser';
                        const osLabel = s.Os && s.Os !== 'Unknown' && s.Os !== 'Unknown OS' ? `on ${s.Os}` : '';
                        return (
                          <tr key={s.Id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4.5">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {s.UserEmail}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                                {String(s.UserRole || '').replace('_', ' ')}
                              </div>
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-2">
                                <DeviceIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {browserLabel} {osLabel}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {s.DeviceType}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                              {s.IpAddress}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(s.LastActivityAt)}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(s.ExpiresAt)}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleRevokeSession(s.Id, s.UserEmail)}
                                disabled={revokingSessionId === s.Id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium text-rose-700 dark:text-rose-400 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Revoke
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination with Direct Page Numbers */}
              <Pagination
                currentPage={sessionsPage}
                totalPages={sessionsTotalPages}
                totalItems={sessionsTotal}
                pageSize={sessionsPageSize}
                onPageChange={setSessionsPage}
                onPageSizeChange={setSessionsPageSize}
                pageSizeOptions={[5, 8, 10, 20, 50]}
                itemName="active sessions"
              />
            </div>
          </div>
        )}
        {/* TAB 3: LOGIN HISTORY */}
        {activeTab === 'login-history' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attempted email or IP..."
                    value={loginSearch}
                    onChange={(e) => {
                      setLoginSearch(e.target.value);
                      setLoginPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">Status:</span>
                  <select
                    value={loginStatusFilter}
                    onChange={(e) => {
                      setLoginStatusFilter(e.target.value);
                      setLoginPage(1);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Outcomes</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED_PASSWORD">Failed Password</option>
                    <option value="ACCOUNT_LOCKED">Account Locked</option>
                    <option value="INVALID_USER">Invalid User</option>
                  </select>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Audited Logins: {loginTotal}
              </div>
            </div>
            {/* Login History Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-4">Outcome</th>
                      <th className="px-6 py-4">Attempted Identifier</th>
                      <th className="px-6 py-4">Target Role</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">Failure Detail</th>
                      <th className="px-6 py-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                    {loginLoading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                          <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-600 dark:text-emerald-400" />
                          Loading login history...
                        </td>
                      </tr>
                    ) : loginHistory.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-14 text-center text-gray-500">
                          No login history records found.
                        </td>
                      </tr>
                    ) : (
                      loginHistory.map((item) => {
                        const stat = getLoginStatusStyle(item.Status);
                        return (
                          <tr key={item.Id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-2 text-xs font-semibold ${stat.text}`}>
                                <span className={`w-2 h-2 rounded-full ${stat.dot}`} />
                                {String(item.Status || '').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4.5">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.AttemptedEmail}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 capitalize">
                              {String(item.Role || '—').replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                              {item.IpAddress}
                            </td>
                            <td className="px-6 py-4.5 text-xs text-gray-500 dark:text-gray-400">
                              {item.FailureReason || '—'}
                            </td>
                            <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(item.CreatedAt)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination with Direct Page Numbers */}
              <Pagination
                currentPage={loginPage}
                totalPages={loginTotalPages}
                totalItems={loginTotal}
                pageSize={loginPageSize}
                onPageChange={setLoginPage}
                onPageSizeChange={setLoginPageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                itemName="audited logins"
              />
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* TAB 4: LOCKED ACCOUNTS & UNLOCK TOOL */}
        {/* ============================================================== */}
        {activeTab === 'unlock' && (
          <div className="space-y-6">
            {/* 1. Locked Accounts Table Card */}
            <div className="space-y-4">
              {/* Filter / Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>Locked Accounts Directory</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        {lockedTotal} {lockedTotal === 1 ? 'account' : 'accounts'}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Accounts temporarily locked due to repeated failed logins (15-minute brute-force window).
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search email or name..."
                      value={lockedSearch}
                      onChange={(e) => {
                        setLockedSearch(e.target.value);
                        setLockedPage(1);
                      }}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-300 dark:border-zinc-800 bg-white dark:bg-black text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                    />
                    {lockedSearch && (
                      <button
                        onClick={() => {
                          setLockedSearch('');
                          setLockedPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={fetchLockedAccounts}
                    disabled={lockedLoading}
                    className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-600 dark:text-zinc-300 transition-colors cursor-pointer"
                    title="Refresh locked accounts list"
                  >
                    <RefreshCw className={`w-4 h-4 ${lockedLoading ? 'animate-spin text-emerald-500' : ''}`} />
                  </button>

                  {lockedAccounts.length > 0 && (
                    <button
                      onClick={handleUnlockAll}
                      disabled={unlockingAll}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                      title="Unlock all accounts immediately"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{unlockingAll ? 'Unlocking All...' : `Unlock All (${lockedTotal})`}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Locked Accounts Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-6 py-3.5 w-12">#</th>
                        <th className="px-6 py-3.5">Account & Identifier</th>
                        <th className="px-6 py-3.5">Privilege / Role</th>
                        <th className="px-6 py-3.5">Failed Attempts</th>
                        <th className="px-6 py-3.5">Remaining Lockout</th>
                        <th className="px-6 py-3.5 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                      {lockedLoading ? (
                        [1, 2, 3].map((i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-200 dark:bg-zinc-800 rounded" /></td>
                            <td className="px-6 py-4"><div className="w-36 h-4 bg-gray-200 dark:bg-zinc-800 rounded mb-1" /><div className="w-24 h-3 bg-gray-100 dark:bg-zinc-900 rounded" /></td>
                            <td className="px-6 py-4"><div className="w-16 h-5 bg-gray-200 dark:bg-zinc-800 rounded-md" /></td>
                            <td className="px-6 py-4"><div className="w-20 h-5 bg-gray-200 dark:bg-zinc-800 rounded-md" /></td>
                            <td className="px-6 py-4"><div className="w-28 h-4 bg-gray-200 dark:bg-zinc-800 rounded" /></td>
                            <td className="px-6 py-4 text-right"><div className="w-24 h-7 bg-gray-200 dark:bg-zinc-800 rounded-lg ml-auto" /></td>
                          </tr>
                        ))
                      ) : lockedAccounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 border border-emerald-200 dark:border-emerald-900/60">
                                <ShieldCheck className="w-6 h-6" />
                              </div>
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                No Accounts Currently Locked
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 text-center">
                                {lockedSearch
                                  ? 'No locked accounts matched your search term.'
                                  : 'All user credentials and administrator logins are healthy. Zero accounts are currently restricted by brute-force protection.'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        lockedAccounts.map((acc, index) => {
                          const isCurrentlyUnlocking = unlockingEmail === acc.Email;
                          return (
                            <tr
                              key={acc.Id || acc.Email}
                              className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/30 transition-colors"
                            >
                              <td className="px-6 py-4 font-mono text-gray-400 dark:text-zinc-500 text-xs">
                                {String((lockedPage - 1) * lockedPageSize + index + 1).padStart(2, '0')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                                    {acc.UserName?.charAt(0)?.toUpperCase() || acc.Email?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-gray-900 dark:text-white truncate">
                                      {acc.UserName || 'Account'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-mono truncate">
                                      {acc.Email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 capitalize">
                                  {acc.RoleName || 'User'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                  <AlertTriangle className="w-3 h-3" />
                                  {acc.AttemptCount} Failed Logins
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400 text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {acc.RemainingMinutes > 0
                                        ? `${acc.RemainingMinutes} mins remaining`
                                        : 'Lockout expiring soon'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                                    Locked until {formatTime(acc.LockedUntil)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleQuickUnlock(acc.Email)}
                                  disabled={isCurrentlyUnlocking}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>{isCurrentlyUnlocking ? 'Unlocking...' : 'Unlock Account'}</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {lockedTotalPages > 1 && (
                  <div className="border-t border-gray-200 dark:border-zinc-800 p-4">
                    <Pagination
                      currentPage={lockedPage}
                      totalPages={lockedTotalPages}
                      totalItems={lockedTotal}
                      pageSize={lockedPageSize}
                      onPageChange={setLockedPage}
                      onPageSizeChange={setLockedPageSize}
                      pageSizeOptions={[5, 10, 20]}
                      itemName="locked accounts"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Emergency Manual Account Unlock Card */}
            <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Emergency Manual Account Unlock
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    Clear progressive brute-force rate-limiting and reset failed attempt count for any user or admin identifier.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUnlockAccount} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Account Email Identifier
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@example.com or admin@ayojan.in"
                      value={unlockEmail}
                      onChange={(e) => setUnlockEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-800 bg-gray-50/50 dark:bg-black text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                    <button
                      type="submit"
                      disabled={unlocking}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{unlocking ? 'Clearing Lockout...' : 'Unlock Account Immediately'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {unlockResult && (
                <div
                  className={`p-4 rounded-xl border text-sm ${
                    unlockResult.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {unlockResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    <span>{unlockResult.message}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* MODAL: MANAGE ALERT INCIDENT */}
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Manage Security Incident #{selectedAlert.Id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-gray-500 uppercase">Alert:</span>
                  <p className="font-medium text-sm text-gray-900 dark:text-white mt-0.5">{selectedAlert.Title}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase">Description:</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">{selectedAlert.Description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="font-semibold text-gray-500 uppercase">Source IP:</span>
                    <p className="font-mono text-gray-800 dark:text-gray-200 mt-0.5">{selectedAlert.SourceIp || '—'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 uppercase">Severity:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${getSeverityStyle(selectedAlert.Severity).dot}`} />
                      <span className={`text-xs font-semibold ${getSeverityStyle(selectedAlert.Severity).text}`}>
                        {selectedAlert.Severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleUpdateAlertStatus} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Update Status
                  </label>
                  <select
                    value={resolutionStatus}
                    onChange={(e) => setResolutionStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
                    <option value="OPEN">RE-OPEN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Resolution Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide incident resolution or mitigation notes..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingAlert}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {updatingAlert ? 'Saving...' : 'Save Incident Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
