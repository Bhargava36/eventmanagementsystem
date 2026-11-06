import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  RefreshCw,
  Download,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  User,
  Globe,
  Radio,
  FileCode,
  Copy,
  Check,
  Activity,
  Layers,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useTheme from '../../../../Hooks/useTheme';

export default function LogsDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Data states
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

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [jumpPage, setJumpPage] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Live stream toggle
  const [isLive, setIsLive] = useState(false);

  // Detail Modal / Drawer state
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch logs from backend API
  const fetchLogs = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_BASE_URL}/api/logs?${params.toString()}`);
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
      console.error('[LogsDashboard] Error fetching logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, selectedLevel, selectedCategory, debouncedSearch, startDate, endDate]);

  // Initial and reactive fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Live stream polling
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 5000); // Poll every 5s in live mode
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

  // Export handlers
  const handleExport = (format = 'csv') => {
    const params = new URLSearchParams({ format });
    if (selectedLevel !== 'ALL') params.append('level', selectedLevel);
    if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
    if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    window.open(`${API_BASE_URL}/api/logs/export?${params.toString()}`, '_blank');
  };

  // Jump to specific page
  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
      setJumpPage('');
    }
  };

  // Copy JSON metadata to clipboard
  const handleCopyJson = (content) => {
    navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper formatting
  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ` · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } catch {
      return String(ts);
    }
  };

  const getLevelStyle = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR':
        return {
          badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          icon: ShieldAlert
        };
      case 'CRITICAL':
        return {
          badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
          dot: 'bg-purple-500',
          icon: AlertTriangle
        };
      case 'WARN':
        return {
          badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          icon: AlertTriangle
        };
      case 'INFO':
      default:
        return {
          badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          icon: Info
        };
    }
  };

  // Smart page numbers pagination array generator
  const paginationRange = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
                System Activity & Audit Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Live immutable audit logs, user actions, API latency metrics, and security tracking across the entire application.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Live Stream Switch */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
            <span>{isLive ? 'Live Stream: ON (5s)' : 'Live Stream: OFF'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchLogs()}
            disabled={loading || refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 24h Logs */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>24h Total Telemetry</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
              {stats.total24h.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Events</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Logged across all services</p>
        </div>

        {/* Card 2: Error Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Error Frequency</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-heading text-rose-600 dark:text-rose-400">
              {stats.errors24h}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({stats.total24h > 0 ? ((stats.errors24h / stats.total24h) * 100).toFixed(1) : 0}% rate)
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Status 5xx & Critical faults</p>
        </div>

        {/* Card 3: Warnings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Security & Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-heading text-amber-600 dark:text-amber-400">
              {stats.warnings24h}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Notices</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Status 4xx & rate throttles</p>
        </div>

        {/* Card 4: Avg API Response Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-heading text-gray-900 dark:text-white">
              {stats.avgLatencyMs || 28}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">ms</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across all API endpoints</p>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, message, email, IP, or endpoint..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills: Log Level */}
          <div className="flex items-center flex-wrap gap-1.5">
            {['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15'
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
              className="px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500 font-medium"
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
                className="px-2.5 py-2 text-xs rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PAGINATED LOGS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-black/40 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-44">Timestamp</th>
                <th className="py-3.5 px-4 w-24">Level</th>
                <th className="py-3.5 px-4 w-40">Category / Action</th>
                <th className="py-3.5 px-4 min-w-[260px]">Summary & Message</th>
                <th className="py-3.5 px-4 w-48">Actor</th>
                <th className="py-3.5 px-4 w-48">Network / Latency</th>
                <th className="py-3.5 px-4 w-20 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 font-mono">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                      <span className="text-xs font-sans">Querying application telemetry...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 font-sans">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Terminal className="w-8 h-8 opacity-40 text-emerald-500" />
                      <p className="text-sm font-semibold">No logs match your filter criteria</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const style = getLevelStyle(log.Level);
                  const Icon = style.icon;

                  return (
                    <tr
                      key={log.Id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-gray-200 font-medium">
                          {formatTime(log.Timestamp)}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {log.Level}
                        </span>
                      </td>

                      {/* Category & Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-200 text-[11px] tracking-tight">
                            {log.Action || 'ACTION'}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">
                            {log.Category}
                          </span>
                        </div>
                      </td>

                      {/* Message */}
                      <td className="py-3 px-4 font-sans text-xs text-gray-700 dark:text-gray-300">
                        <p className="line-clamp-2 leading-relaxed">
                          {log.Message}
                        </p>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.UserEmail || log.UserId ? (
                          <div className="flex items-center gap-2 font-sans">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                              {(log.UserEmail || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col text-[11px]">
                              <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]" title={log.UserEmail}>
                                {log.UserEmail || `User #${log.UserId}`}
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-gray-400">
                                {log.UserRole || 'user'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px] font-sans">System Service</span>
                        )}
                      </td>

                      {/* Network & Latency */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                        {log.Endpoint ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {log.HttpMethod || 'API'}
                              </span>
                              <span className="text-gray-500 truncate max-w-[100px]" title={log.Endpoint}>
                                {log.Endpoint}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans">
                              {log.StatusCode && (
                                <span className={log.StatusCode >= 400 ? 'text-rose-500 font-bold' : 'text-emerald-500'}>
                                  {log.StatusCode}
                                </span>
                              )}
                              {log.ExecutionTimeMs !== null && (
                                <span>{log.ExecutionTimeMs}ms</span>
                              )}
                              {log.IpAddress && <span>{log.IpAddress}</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-sans">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-600 dark:text-gray-300 text-[11px] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FULL-FEATURED PAGINATION BAR (Enterprise Grade) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans">
          
          {/* Summary & Limit Selector */}
          <div className="flex items-center flex-wrap gap-4 text-gray-500 dark:text-gray-400">
            <span>
              Showing{' '}
              <strong className="text-gray-900 dark:text-white">
                {totalLogs === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-gray-900 dark:text-white">
                {Math.min(page * limit, totalLogs)}
              </strong>{' '}
              of <strong className="text-gray-900 dark:text-white">{totalLogs.toLocaleString()}</strong> entries
            </span>

            <div className="flex items-center gap-1.5">
              <span>Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-gray-700 font-medium text-gray-800 dark:text-gray-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* First Page */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First page"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              title="Previous page"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Smart Page Numbers */}
            {paginationRange.map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 select-none">
                    ...
                  </span>
                );
              }

              const active = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(Number(p))}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              title="Next page"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
              title="Last page"
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            {/* Jump to Page Input */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 ml-2">
              <span className="text-gray-400 text-xs">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                placeholder={String(page)}
                className="w-12 px-2 py-1 text-center rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs focus:outline-none focus:border-emerald-500 font-bold"
              />
              <button
                type="submit"
                className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 text-xs font-semibold cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER (JSON INSPECTOR) */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-lg border text-xs font-black font-mono ${getLevelStyle(selectedLog.Level).badge}`}>
                    {selectedLog.Level}
                  </div>
                  <div>
                    <h3 className="font-bold text-base font-heading">
                      {selectedLog.Action}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Log #{selectedLog.Id} · {formatTime(selectedLog.Timestamp)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyJson(selectedLog)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs font-sans">
                {/* Message Banner */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/60 border border-gray-200 dark:border-gray-800 text-sm leading-relaxed font-sans text-gray-800 dark:text-gray-200">
                  {selectedLog.Message}
                </div>

                {/* Attribute Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Category</span>
                    <p className="mt-1 font-bold font-mono text-emerald-600 dark:text-emerald-400">{selectedLog.Category}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Actor Email</span>
                    <p className="mt-1 font-medium truncate" title={selectedLog.UserEmail || 'None'}>{selectedLog.UserEmail || 'System / Anonymous'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Role</span>
                    <p className="mt-1 font-medium capitalize">{selectedLog.UserRole || 'system'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Endpoint</span>
                    <p className="mt-1 font-mono text-[11px] truncate">{selectedLog.HttpMethod} {selectedLog.Endpoint || '—'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Status & Latency</span>
                    <p className="mt-1 font-mono font-bold">
                      {selectedLog.StatusCode ? `${selectedLog.StatusCode} OK` : '—'} {selectedLog.ExecutionTimeMs ? `(${selectedLog.ExecutionTimeMs}ms)` : ''}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">IP Address</span>
                    <p className="mt-1 font-mono">{selectedLog.IpAddress || 'Internal'}</p>
                  </div>
                </div>

                {/* User Agent */}
                {selectedLog.UserAgent && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block mb-1">User Agent</span>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60 font-mono text-[11px] break-all">
                      {selectedLog.UserAgent}
                    </div>
                  </div>
                )}

                {/* Formatted JSON Metadata */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Parsed Payload & Metadata</span>
                    <span className="text-[10px] text-emerald-500 font-mono">JSON</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-black text-emerald-400 border border-gray-800 font-mono text-xs overflow-x-auto max-h-56 leading-relaxed">
                    {JSON.stringify(selectedLog.Metadata || { note: 'No extra metadata payload attached to this entry' }, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/40 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
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

