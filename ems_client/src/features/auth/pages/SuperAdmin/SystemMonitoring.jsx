import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Cpu,
  HardDrive,
  Database,
  Radio,
  RefreshCw,
  Server,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
export default function SystemMonitoring() {
  const toast = useToast();
  const [health, setHealth] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }, []);
  const fetchHealth = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      else setRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/security/monitoring/health`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHealth(data.health);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error('[SystemMonitoring] Failed to fetch health telemetry:', err);
    } finally {
      setRefreshing(false);
    }
  }, [getAuthHeaders]);
  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);
  // Auto-refresh interval (30s) when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealth(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);
  const handleManualRefresh = async () => {
    await fetchHealth(true);
    toast.success('Telemetry updated.');
  };
  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return '—';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">
                  System Monitoring & Telemetry
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time infrastructure health, database connection pool, API throughput, and latency percentiles.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors shadow-sm cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-zinc-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
              <span>{autoRefresh ? 'Live Polling (30s)' : 'Polling Paused'}</span>
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        {/* LAST REFRESHED TIMESTAMP */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Platform operational status: Optimal</span>
          </div>
          <div>
            Last updated: {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : '—'}
          </div>
        </div>
        {/* 4 PRIMARY TELEMETRY TILES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* TILE 1: CPU LOAD */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                CPU Compute Load
              </span>
              <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {health?.os?.cpuPercent ?? '0'}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Active core utilization
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-850 text-xs space-y-1.5 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Load Avg (1m):</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.os?.loadAvg?.[0] ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Load Avg (5m):</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.os?.loadAvg?.[1] ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Load Avg (15m):</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.os?.loadAvg?.[2] ?? '—'}</span>
              </div>
            </div>
          </div>
          {/* TILE 2: MEMORY RAM */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                RAM Utilization
              </span>
              <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {health?.os?.memUsagePercent ?? '0'}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {health?.os?.usedMemMb ?? 0} MB used of {health?.os?.totalMemMb ?? 0} MB
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-850 text-xs space-y-1.5 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Free System RAM:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.os?.freeMemMb ?? 0} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Node.js Process Heap:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.process?.memoryMb?.heapUsed ?? 0} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Process RSS:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.process?.memoryMb?.rss ?? 0} MB</span>
              </div>
            </div>
          </div>
          {/* TILE 3: DATABASE LATENCY */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                Database Engine
              </span>
              <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {health?.database?.latencyMs ?? 0} ms
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                Status: {health?.database?.status || 'CONNECTED'}
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-850 text-xs space-y-1.5 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Pool Capacity:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.database?.pool?.connectionLimit ?? 20} max</span>
              </div>
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.database?.pool?.allConnections ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Idle in Pool:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.database?.pool?.freeConnections ?? 0}</span>
              </div>
            </div>
          </div>
          {/* TILE 4: API THROUGHPUT & LATENCY */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                API Response Time
              </span>
              <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-950 dark:text-white">
                {health?.networkApi?.latency?.p50 ?? 0} ms
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                p50 median response latency
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-850 text-xs space-y-1.5 text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Throughput:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.networkApi?.throughputPerMin ?? 0} req/min</span>
              </div>
              <div className="flex justify-between">
                <span>p95 Latency:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.networkApi?.latency?.p95 ?? 0} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">{health?.networkApi?.errorRatePercent ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
        {/* DETAILED TELEMETRY SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: API PERFORMANCE BREAKDOWN */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-850">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">
                  API SLA & Response Percentiles
                </h2>
              </div>
              <span className="text-xs font-mono text-gray-500">
                Sample: {health?.networkApi?.totalRequestsSampled ?? 0} requests
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-center">
                <span className="text-xs text-gray-500 font-semibold uppercase">p50 Latency</span>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {health?.networkApi?.latency?.p50 ?? 0} <span className="text-xs font-normal text-gray-500">ms</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Median</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-center">
                <span className="text-xs text-gray-500 font-semibold uppercase">p95 Latency</span>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {health?.networkApi?.latency?.p95 ?? 0} <span className="text-xs font-normal text-gray-500">ms</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">95th Percentile</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 text-center">
                <span className="text-xs text-gray-500 font-semibold uppercase">p99 Latency</span>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {health?.networkApi?.latency?.p99 ?? 0} <span className="text-xs font-normal text-gray-500">ms</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">Tail Latency</div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-900/30 text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <div className="flex justify-between">
                <span>Average Response Duration:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.networkApi?.latency?.avg ?? 0} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Traffic Throughput:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.networkApi?.throughputPerMin ?? 0} req/min</span>
              </div>
              <div className="flex justify-between">
                <span>Failure Rate (5xx/4xx):</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.networkApi?.errorRatePercent ?? 0}%</span>
              </div>
            </div>
          </div>
          {/* SECTION 2: RUNTIME ENVIRONMENT & PROCESS */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-850">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Server Runtime & Process Details
                </h2>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-850 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Node.js Engine Version</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.process?.nodeVersion || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Process ID (PID)</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.process?.pid || '—'}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Process Uptime</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{formatUptime(health?.process?.uptimeSeconds)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Host System Uptime</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{formatUptime(health?.os?.uptimeSeconds)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Heap Total Allocated</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.process?.memoryMb?.heapTotal ?? 0} MB</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500 font-medium">External Native Memory</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{health?.process?.memoryMb?.external ?? 0} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
