import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  RefreshCw,
  Download,
  Search,
  X,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  Copy,
  Check,
  Activity,
  Layers,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  Server
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import Pagination from '../../../../components/Molecules/Pagination';

export default function LogsDashboard() {
  // Telemetry logs state
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total24h: 0,
    errors24h: 0,
    warnings24h: 0,
    uniqueUsers24h: 0,
    avgLatencyMs: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // System Logs Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // System Logs Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active view tab: 'system' | 'audit'
  const [activeMainTab, setActiveMainTab] = useState('system');

  // Mutation Audit Trail state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(15);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Live polling
  const [isLive, setIsLive] = useState(false);

  // Inspect Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auth headers helper
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch telemetry logs
  const fetchLogs = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_BASE_URL}/api/logs?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setLogs(data.logs || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalLogs(data.pagination.total || 0);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('[LogsDashboard] Error fetching telemetry logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, selectedLevel, selectedCategory, debouncedSearch, startDate, endDate, getAuthHeaders]);

  // Fetch mutation audit trail
  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const params = new URLSearchParams({
        page: String(auditPage),
        limit: String(auditPageSize)
      });
      if (auditModuleFilter !== 'ALL') params.append('module', auditModuleFilter);
      if (auditSearch.trim()) params.append('search', auditSearch.trim());

      const res = await fetch(`${API_BASE_URL}/api/security/audit-logs?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuditLogs(data.logs || []);
        if (data.pagination) {
          setAuditTotalPages(data.pagination.totalPages || 1);
          setAuditTotal(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('[LogsDashboard] Error fetching audit trail:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage, auditPageSize, auditModuleFilter, auditSearch, getAuthHeaders]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (activeMainTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeMainTab, fetchAuditLogs]);

  // Live polling
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive, fetchLogs]);

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedLevel('ALL');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // Export logs to CSV
  const handleExport = (format = 'csv') => {
    const params = new URLSearchParams({ format });
    if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
    if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
    if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    window.open(`${API_BASE_URL}/api/logs/export?${params.toString()}`, '_blank');
  };

  // Copy JSON metadata
  const handleCopyJson = (content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Formatter for readable timestamps
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

  // Clean status dot styling without bulky badges
  const getLevelStyle = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return {
          textColor: 'text-rose-600 dark:text-rose-400',
          dot: 'bg-rose-500',
          icon: ShieldAlert,
          label: 'ERROR'
        };
      case 'CRITICAL':
        return {
          textColor: 'text-purple-600 dark:text-purple-400',
          dot: 'bg-purple-500',
          icon: AlertTriangle,
          label: 'CRITICAL'
        };
      case 'WARN':
        return {
          textColor: 'text-amber-600 dark:text-amber-400',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          label: 'WARN'
        };
      case 'INFO':
      default:
        return {
          textColor: 'text-emerald-600 dark:text-emerald-400',
          dot: 'bg-emerald-500',
          icon: Info,
          label: 'INFO'
        };
    }
  };

  // Diff comparison helper for State Diffs
  const computeDiff = (prev, next) => {
    let p = prev;
    let n = next;
    if (typeof p === 'string') {
      try { p = JSON.parse(p); } catch { p = {}; }
    }
    if (typeof n === 'string') {
      try { n = JSON.parse(n); } catch { n = {}; }
    }
    p = p || {};
    n = n || {};
    const allKeys = Array.from(new Set([...Object.keys(p), ...Object.keys(n)]));
    return allKeys.map((key) => {
      const pVal = p[key];
      const nVal = n[key];
      const isChanged = JSON.stringify(pVal) !== JSON.stringify(nVal);
      return { key, pVal, nVal, isChanged };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black text-gray-900 dark:text-gray-100 p-6 sm:p-8 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-gray-950 dark:text-white">
              System Activity & Audit Telemetry
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Live immutable audit logs, user actions, API latency metrics, and security tracking across the entire application.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-3">
          {activeMainTab === 'system' && (
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                isLive
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-xs'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{isLive ? 'Live Stream: Active (5s)' : 'Live Stream: Off'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeMainTab === 'audit') fetchAuditLogs();
              else fetchLogs();
            }}
            disabled={loading || refreshing || auditLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing || loading || auditLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {activeMainTab === 'system' && (
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: 24h Total Telemetry */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Telemetry (24h)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white">
              {stats.total24h.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Events</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Logged across all platform services</p>
        </div>

        {/* Card 2: Error Frequency */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Frequency</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-rose-600 dark:text-rose-400">
              {stats.errors24h}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              ({stats.total24h > 0 ? ((stats.errors24h / stats.total24h) * 100).toFixed(1) : 0}% rate)
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Status 5xx & critical server faults</p>
        </div>

        {/* Card 3: Security & Warnings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Security & Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-amber-600 dark:text-amber-400">
              {stats.warnings24h}
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Notices</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Status 4xx, bad auth, rate limits</p>
        </div>

        {/* Card 4: Avg Latency */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Latency</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white">
              {stats.avgLatencyMs || 28}
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">ms</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Across all monitored endpoints</p>
        </div>
      </div>

      {/* VIEW SELECTOR TABS */}
      <div className="flex items-center gap-8 border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveMainTab('system')}
          className={`flex items-center gap-2.5 pb-4 px-1 text-sm sm:text-base transition-colors relative cursor-pointer ${
            activeMainTab === 'system'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Terminal className="w-4.5 h-4.5" />
          <span>System & API Logs</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
            ({totalLogs.toLocaleString()})
          </span>
          {activeMainTab === 'system' && (
            <motion.div
              layoutId="activeLogTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
            />
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('audit')}
          className={`flex items-center gap-2.5 pb-4 px-1 text-sm sm:text-base transition-colors relative cursor-pointer ${
            activeMainTab === 'audit'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Layers className="w-4.5 h-4.5" />
          <span>Mutation Audit Trail (State Diffs)</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
            ({auditTotal})
          </span>
          {activeMainTab === 'audit' && (
            <motion.div
              layoutId="activeLogTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
            />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM & API LOGS */}
      {/* ========================================================================= */}
      {activeMainTab === 'system' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search action, message, actor email, IP, or endpoint..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Log Level Selectors (Clean Rectangles, NO Pills) */}
              <div className="flex items-center flex-wrap gap-2">
                {['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].map((lvl) => {
                  const active = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedLevel(lvl);
                        setPage(1);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-gray-200 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="AUTH">Authentication (AUTH)</option>
                  <option value="EVENT">Events (EVENT)</option>
                  <option value="TEAM">Teams (TEAM)</option>
                  <option value="USER">Users (USER)</option>
                  <option value="ADMIN">Admin (ADMIN)</option>
                  <option value="SYSTEM">System (SYSTEM)</option>
                  <option value="SECURITY">Security (SECURITY)</option>
                </select>

                {(debouncedSearch || selectedLevel !== 'ALL' || selectedCategory !== 'ALL' || startDate || endDate) && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2.5 text-xs rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto min-h-[380px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 dark:bg-zinc-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                    <th className="px-6 py-4 whitespace-nowrap">Level</th>
                    <th className="px-6 py-4 whitespace-nowrap">Category & Action</th>
                    <th className="px-6 py-4 min-w-[280px]">Summary & Message</th>
                    <th className="px-6 py-4 whitespace-nowrap">Actor</th>
                    <th className="px-6 py-4 whitespace-nowrap">Network & Latency</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-emerald-600 dark:text-emerald-400" />
                        Querying application telemetry...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                        <Terminal className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2 opacity-60" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No logs match your filter criteria</p>
                        <button
                          onClick={resetFilters}
                          className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Clear active filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const style = getLevelStyle(log.Level);
                      return (
                        <tr
                          key={log.Id}
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                        >
                          {/* Timestamp */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300 font-medium">
                            {formatTime(log.Timestamp)}
                          </td>

                          {/* Level with clean status dot */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                              <span className={`text-xs font-semibold ${style.textColor}`}>
                                {style.label}
                              </span>
                            </div>
                          </td>

                          {/* Category & Action */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <div>
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {log.Category}
                              </span>
                              <div className="font-semibold text-gray-900 dark:text-white text-xs mt-0.5">
                                {log.Action || 'ACTION'}
                              </div>
                            </div>
                          </td>

                          {/* Message */}
                          <td className="px-6 py-4.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed max-w-md">
                            <p className="line-clamp-2">
                              {log.Message}
                            </p>
                          </td>

                          {/* Actor */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            {log.UserEmail || log.UserId ? (
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white text-xs">
                                  {log.UserEmail || `User #${log.UserId}`}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                                  {log.UserRole || 'user'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">System Service</span>
                            )}
                          </td>

                          {/* Network & Latency */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-xs">
                            {log.Endpoint ? (
                              <div>
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <span className="text-emerald-600 dark:text-emerald-400">
                                    {log.HttpMethod || 'API'}
                                  </span>
                                  <span className="text-gray-700 dark:text-gray-300 truncate max-w-[140px]" title={log.Endpoint}>
                                    {log.Endpoint}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 mt-0.5">
                                  {log.StatusCode && (
                                    <span className={log.StatusCode >= 400 ? 'text-rose-500 font-semibold' : 'text-emerald-500'}>
                                      {log.StatusCode}
                                    </span>
                                  )}
                                  {log.ExecutionTimeMs !== null && <span>{log.ExecutionTimeMs}ms</span>}
                                  {log.IpAddress && <span>{log.IpAddress}</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          {/* Inspect Action */}
                          <td className="px-6 py-4.5 text-center whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-medium text-gray-800 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Reusable Clean Pagination Component */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalLogs}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
              pageSizeOptions={[10, 25, 50, 100]}
              itemName="system logs"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MUTATION AUDIT TRAIL (STATE DIFFS) */}
      {/* ========================================================================= */}
      {activeMainTab === 'audit' && (
        <div className="space-y-6">
          {/* Audit Toolbar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actor, action, or entity ID..."
                  value={auditSearch}
                  onChange={(e) => {
                    setAuditSearch(e.target.value);
                    setAuditPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Module:</span>
                <select
                  value={auditModuleFilter}
                  onChange={(e) => {
                    setAuditModuleFilter(e.target.value);
                    setAuditPage(1);
                  }}
                  className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="ALL">All Modules</option>
                  <option value="PROJECT_EXPO">Project Expo</option>
                  <option value="EVENTS">Events</option>
                  <option value="SECURITY">Security</option>
                  <option value="AUTH">Authentication</option>
                  <option value="TEAMS">Teams</option>
                  <option value="USERS">Users</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button
                onClick={() => fetchAuditLogs()}
                disabled={auditLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Immutable Records: <strong className="text-gray-900 dark:text-white">{auditTotal}</strong>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
            <div className="overflow-x-auto min-h-[340px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 dark:bg-zinc-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                    <th className="px-6 py-4 whitespace-nowrap">Actor</th>
                    <th className="px-6 py-4 whitespace-nowrap">Module & Action</th>
                    <th className="px-6 py-4 whitespace-nowrap">Entity</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap">IP Address</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">State Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                  {auditLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                        <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-600 dark:text-emerald-400" />
                        Loading immutable audit trail...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2 opacity-60" />
                        No mutation audit records matching criteria.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((item) => (
                      <tr key={item.Id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300 font-medium">
                          {formatTime(item.CreatedAt)}
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs">
                            {item.ActorEmail}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                            {String(item.ActorRole || '').replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.Module}
                          </span>
                          <span className="ml-2 font-medium text-gray-800 dark:text-gray-200 text-xs">
                            {item.Action}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-xs">
                          <span className="text-gray-500 font-medium">{item.EntityType}:</span>{' '}
                          <span className="font-semibold text-gray-900 dark:text-white">#{item.EntityId}</span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.Status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                item.Status === 'SUCCESS'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {item.Status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                          {item.IpAddress || '—'}
                        </td>
                        <td className="px-6 py-4.5 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedAuditLog(item)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-medium text-gray-800 dark:text-gray-200 transition-colors shadow-xs cursor-pointer"
                          >
                            Inspect Diff
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Clean Pagination for Audit Trail */}
            <Pagination
              currentPage={auditPage}
              totalPages={auditTotalPages}
              totalItems={auditTotal}
              pageSize={auditPageSize}
              onPageChange={setAuditPage}
              onPageSizeChange={setAuditPageSize}
              pageSizeOptions={[10, 15, 25, 50]}
              itemName="audit entries"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIT DIFF MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedAuditLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-black text-gray-100 rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-800 bg-black flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400">
                      {selectedAuditLog.Module}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <h3 className="font-bold text-base text-white font-heading">
                      {selectedAuditLog.Action} on {selectedAuditLog.EntityType} #{selectedAuditLog.EntityId}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Actor: {selectedAuditLog.ActorEmail} ({selectedAuditLog.ActorRole}) · {formatTime(selectedAuditLog.CreatedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-black">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Actor Email</span>
                    <p className="mt-1 font-semibold text-white truncate">{selectedAuditLog.ActorEmail}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Role</span>
                    <p className="mt-1 font-semibold text-white uppercase">{selectedAuditLog.ActorRole}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">IP Address</span>
                    <p className="mt-1 font-semibold text-white">{selectedAuditLog.IpAddress || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Execution Status</span>
                    <p className="mt-1 font-bold text-emerald-400">{selectedAuditLog.Status}</p>
                  </div>
                </div>

                {/* Key Changes Breakdown Table */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-wider">
                    Field-Level State Modifications
                  </h4>
                  <div className="rounded-2xl border border-zinc-800 bg-black overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
                        <tr>
                          <th className="px-5 py-3.5 w-1/3">Field / Property</th>
                          <th className="px-5 py-3.5 w-1/3">Original Value</th>
                          <th className="px-5 py-3.5 w-1/3">Updated Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-black">
                        {computeDiff(selectedAuditLog.PreviousValue, selectedAuditLog.NewValue).map((d) => (
                          <tr
                            key={d.key}
                            className="hover:bg-zinc-900/30 transition-colors bg-black"
                          >
                            <td className="px-5 py-3.5 font-medium text-white">
                              <span>{d.key}</span>
                              {d.isChanged && (
                                <span className="ml-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                                  Updated
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-zinc-400 break-all">
                              <span className={d.isChanged ? "line-through decoration-zinc-600 text-zinc-400" : "text-zinc-400"}>
                                {d.pVal !== undefined ? JSON.stringify(d.pVal) : '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs break-all">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-500 text-xs">→</span>
                                <span className="font-semibold text-emerald-400">
                                  {d.nVal !== undefined ? JSON.stringify(d.nVal) : '—'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Side-by-side JSON comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-500" />
                        <span className="text-xs font-semibold text-zinc-300">Original State</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">JSON</span>
                    </div>
                    <pre className="p-4 rounded-2xl bg-zinc-950 text-zinc-300 border border-zinc-800 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(selectedAuditLog.PreviousValue || {}, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-400">Updated State</span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">JSON</span>
                    </div>
                    <pre className="p-4 rounded-2xl bg-zinc-950 text-emerald-400/90 border border-zinc-800 font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                      {JSON.stringify(selectedAuditLog.NewValue || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-zinc-800 bg-black flex justify-end">
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DETAIL MODAL / DRAWER (JSON INSPECTOR) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-black text-gray-100 rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 bg-black flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getLevelStyle(selectedLog.Level).dot}`} />
                    <span className={`text-xs font-bold ${getLevelStyle(selectedLog.Level).textColor}`}>
                      {selectedLog.Level}
                    </span>
                  </div>
                  <span className="text-zinc-700">·</span>
                  <div>
                    <h3 className="font-bold text-base font-heading text-white">
                      {selectedLog.Action}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Log #{selectedLog.Id} · {formatTime(selectedLog.Timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyJson(selectedLog)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-black">
                {/* Message Banner */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 text-sm leading-relaxed text-zinc-200">
                  {selectedLog.Message}
                </div>

                {/* Attribute Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Category</span>
                    <p className="mt-1 font-semibold text-emerald-400">{selectedLog.Category}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Actor Email</span>
                    <p className="mt-1 font-semibold truncate text-white" title={selectedLog.UserEmail || 'None'}>
                      {selectedLog.UserEmail || 'System / Anonymous'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Role</span>
                    <p className="mt-1 font-semibold text-white capitalize">{selectedLog.UserRole || 'system'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Endpoint</span>
                    <p className="mt-1 font-semibold text-white truncate">
                      {selectedLog.HttpMethod} {selectedLog.Endpoint || '—'}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">Status & Latency</span>
                    <p className="mt-1 font-semibold text-white">
                      {selectedLog.StatusCode ? `${selectedLog.StatusCode} OK` : '—'} {selectedLog.ExecutionTimeMs ? `(${selectedLog.ExecutionTimeMs}ms)` : ''}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                    <span className="text-xs text-zinc-500 font-medium">IP Address</span>
                    <p className="mt-1 font-semibold text-white">{selectedLog.IpAddress || 'Internal'}</p>
                  </div>
                </div>

                {/* User Agent */}
                {selectedLog.UserAgent && (
                  <div>
                    <span className="text-xs text-zinc-500 font-medium block mb-2">User Agent</span>
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 break-all leading-relaxed font-mono">
                      {selectedLog.UserAgent}
                    </div>
                  </div>
                )}

                {/* Formatted JSON Metadata */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 font-medium">Parsed Payload & Metadata</span>
                    <span className="text-xs text-emerald-400 font-mono">JSON</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(selectedLog.Metadata || { note: 'No extra metadata payload attached to this entry' }, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-zinc-800 bg-black flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
