import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Database,
  Webhook,
  RefreshCw,
  Download,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Server,
  Layers,
  HardDrive,
  Copy,
  Check,
  Search,
  X,
  Play,
  RotateCcw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useTheme from '../../../../Hooks/useTheme';

export default function OperationsHub({ defaultTab = 'email' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Active Tab: 'email' | 'backup' | 'webhooks'
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [liveAutoRefresh, setLiveAutoRefresh] = useState(true);

  // Synchronize defaultTab when routing changes
  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // -------------------------------------------------------------
  // TAB 1: EMAIL DISPATCH STATES
  // -------------------------------------------------------------
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({ totalSent: 0, delivered: 0, failed: 0, pending: 0, deliveryRate: 100 });
  const [emailPage, setEmailPage] = useState(1);
  const [emailTotalPages, setEmailTotalPages] = useState(1);
  const [emailStatusFilter, setEmailStatusFilter] = useState('ALL');
  const [emailTypeFilter, setEmailTypeFilter] = useState('ALL');
  const [emailSearch, setEmailSearch] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);

  // Test Mail Modal
  const [showTestMailModal, setShowTestMailModal] = useState(false);
  const [testMailRecipient, setTestMailRecipient] = useState('');
  const [testMailSubject, setTestMailSubject] = useState('AYOJAN Telemetry Diagnostic Test');
  const [testMailBody, setTestMailBody] = useState('Hello, this is a test email verifying SMTP configuration from AYOJAN Operations Center.');
  const [testMailSending, setTestMailSending] = useState(false);
  const [testMailResult, setTestMailResult] = useState(null);

  // -------------------------------------------------------------
  // TAB 2: DATABASE BACKUP STATES
  // -------------------------------------------------------------
  const [dbStats, setDbStats] = useState({ totalTables: 0, totalRows: 0, totalSizeMb: 0, tables: [] });
  const [backupHistory, setBackupHistory] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(null);

  // -------------------------------------------------------------
  // TAB 3: WEBHOOKS STATES
  // -------------------------------------------------------------
  const [webhooks, setWebhooks] = useState([]);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [testingWebhookId, setTestingWebhookId] = useState(null);
  const [webhookTestResult, setWebhookTestResult] = useState(null);

  // Create Webhook Modal
  const [showCreateWebhookModal, setShowCreateWebhookModal] = useState(false);
  const [whName, setWhName] = useState('');
  const [whTargetUrl, setWhTargetUrl] = useState('');
  const [whPlatform, setWhPlatform] = useState('DISCORD');
  const [whEvents, setWhEvents] = useState(['TEAM_REGISTERED', 'PROJECT_SUBMITTED']);
  const [whSecret, setWhSecret] = useState('');

  // -------------------------------------------------------------
  // API FETCHERS
  // -------------------------------------------------------------
  const fetchEmails = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setEmailLoading(true);
      const params = new URLSearchParams({
        page: String(emailPage),
        limit: '15',
        status: emailStatusFilter,
        emailType: emailTypeFilter,
        search: emailSearch
      });
      const res = await fetch(`${API_BASE_URL}/api/email-dispatch?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailLogs(data.logs || []);
        setEmailStats(data.stats || { totalSent: 0, delivered: 0, failed: 0, pending: 0, deliveryRate: 100 });
        if (data.pagination) setEmailTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('[OperationsHub] Email fetch error:', err);
    } finally {
      if (!isSilent) setEmailLoading(false);
    }
  }, [emailPage, emailStatusFilter, emailTypeFilter, emailSearch]);

  const fetchDatabaseStats = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setDbLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/database-backups/stats`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDbStats(data.stats || { totalTables: 0, totalRows: 0, totalSizeMb: 0, tables: [] });
        setBackupHistory(data.history || []);
      }
    } catch (err) {
      console.error('[OperationsHub] DB stats fetch error:', err);
    } finally {
      if (!isSilent) setDbLoading(false);
    }
  }, []);

  const fetchWebhooks = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setWebhooksLoading(true);
      const [whRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/webhooks`),
        fetch(`${API_BASE_URL}/api/webhooks/logs?limit=25`)
      ]);
      const whData = await whRes.json();
      const logsData = await logsRes.json();
      if (whData.success) setWebhooks(whData.webhooks || []);
      if (logsData.success) setWebhookLogs(logsData.logs || []);
    } catch (err) {
      console.error('[OperationsHub] Webhooks fetch error:', err);
    } finally {
      if (!isSilent) setWebhooksLoading(false);
    }
  }, []);

  // Fetch when tab switches or filters change
  useEffect(() => {
    if (activeTab === 'email') fetchEmails();
    if (activeTab === 'backup') fetchDatabaseStats();
    if (activeTab === 'webhooks') fetchWebhooks();
  }, [activeTab, fetchEmails, fetchDatabaseStats, fetchWebhooks]);

  // Real-time live auto-polling every 3.5s (silent, zero flickering)
  useEffect(() => {
    if (!liveAutoRefresh) return;
    const interval = setInterval(() => {
      if (activeTab === 'email') fetchEmails(true);
      else if (activeTab === 'webhooks') fetchWebhooks(true);
    }, 3500);
    return () => clearInterval(interval);
  }, [liveAutoRefresh, activeTab, fetchEmails, fetchWebhooks]);

  // WebSocket Live Push Listener
  useEffect(() => {
    let ws;
    try {
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'EMAIL_DISPATCHED' && activeTab === 'email') {
            fetchEmails(true);
          }
        } catch (e) {}
      };
    } catch (e) {}
    return () => {
      if (ws) ws.close();
    };
  }, [activeTab, fetchEmails]);

  // -------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------
  const handleRetryEmail = async (id) => {
    try {
      setRetryingId(id);
      const res = await fetch(`${API_BASE_URL}/api/email-dispatch/retry/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchEmails();
      } else {
        alert(data.message || 'Retry failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const handleSendTestMail = async (e) => {
    e.preventDefault();
    try {
      setTestMailSending(true);
      setTestMailResult(null);
      const res = await fetch(`${API_BASE_URL}/api/email-dispatch/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testMailRecipient, subject: testMailSubject, body: testMailBody })
      });
      const data = await res.json();
      setTestMailResult(data);
      if (data.success) {
        fetchEmails();
        setTimeout(() => setShowTestMailModal(false), 2000);
      }
    } catch (err) {
      setTestMailResult({ success: false, message: err.message });
    } finally {
      setTestMailSending(false);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      setCreatingSnapshot(true);
      setSnapshotSuccess(null);
      const res = await fetch(`${API_BASE_URL}/api/database-backups/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Manual SuperAdmin Snapshot' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnapshotSuccess('Database snapshot captured and logged successfully!');
        fetchDatabaseStats();
        setTimeout(() => setSnapshotSuccess(null), 3500);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleDeleteBackup = async (id) => {
    if (!window.confirm('Are you sure you want to remove this backup record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/database-backups/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDatabaseStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTestWebhook = async (id) => {
    try {
      setTestingWebhookId(id);
      setWebhookTestResult(null);
      const res = await fetch(`${API_BASE_URL}/api/webhooks/test/${id}`, { method: 'POST' });
      const data = await res.json();
      setWebhookTestResult({ id, ...data.result });
      fetchWebhooks();
      setTimeout(() => setWebhookTestResult(null), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleCreateWebhook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: whName,
          targetUrl: whTargetUrl,
          platform: whPlatform,
          events: whEvents.join(','),
          secretKey: whSecret
        })
      });
      if (res.ok) {
        setShowCreateWebhookModal(false);
        setWhName('');
        setWhTargetUrl('');
        setWhSecret('');
        fetchWebhooks();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteWebhook = async (id) => {
    if (!window.confirm('Delete this webhook endpoint and its delivery logs?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/webhooks/${id}`, { method: 'DELETE' });
      if (res.ok) fetchWebhooks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
              Platform Operations & Integrations
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Enterprise management for automated email queues, database backups, and Discord/Slack webhook dispatchers.
            </p>
          </div>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-gray-200/80 dark:bg-black border border-gray-300/60 dark:border-gray-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'webhooks'
                ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Webhook className="w-4 h-4" />
            <span>Webhooks</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMAIL DISPATCH CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          {/* Top Email Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Total Emails Sent</span>
              <div className="text-2xl font-black font-heading mt-1">{emailStats.totalSent.toLocaleString()}</div>
              <p className="text-[11px] text-gray-400 mt-1">Lifetime dispatched</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Delivery Success Rate</span>
              <div className="text-2xl font-black font-heading text-emerald-600 mt-1">{emailStats.deliveryRate}%</div>
              <p className="text-[11px] text-gray-400 mt-1">{emailStats.delivered} delivered</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Failed Dispatches</span>
              <div className="text-2xl font-black font-heading text-rose-600 mt-1">{emailStats.failed}</div>
              <p className="text-[11px] text-gray-400 mt-1">Requires retry or fix</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">SMTP Diagnostic Test</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Verify live outgoing relay</p>
              </div>
              <button
                onClick={() => setShowTestMailModal(true)}
                className="mt-2 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Test Email</span>
              </button>
            </div>
          </div>

          {/* Email Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => { setEmailSearch(e.target.value); setEmailPage(1); }}
                placeholder="Search recipient email, name, or subject..."
                className="w-full py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <select
                value={emailStatusFilter}
                onChange={(e) => { setEmailStatusFilter(e.target.value); setEmailPage(1); }}
                className="py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>

              <select
                value={emailTypeFilter}
                onChange={(e) => { setEmailTypeFilter(e.target.value); setEmailPage(1); }}
                className="py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 font-medium"
              >
                <option value="ALL">All Types</option>
                <option value="REGISTRATION">Registration</option>
                <option value="OTP">OTP Verification</option>
                <option value="BROADCAST">Broadcast</option>
                <option value="EVALUATION">Evaluation</option>
                <option value="TEST">Diagnostic</option>
              </select>

              {/* Live Auto-Refresh Stream Toggle */}
              <button
                onClick={() => setLiveAutoRefresh(!liveAutoRefresh)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  liveAutoRefresh
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-gray-700 text-gray-500'
                }`}
                title="Toggle real-time auto updates"
              >
                <span className={`w-2 h-2 rounded-full ${liveAutoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
                <span>{liveAutoRefresh ? 'Live Stream: ON (3.5s)' : 'Live: OFF'}</span>
              </button>

              <button
                onClick={() => fetchEmails()}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-600 dark:text-gray-300 cursor-pointer"
                title="Refresh email queue"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${emailLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Email Table */}
          <div className="rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-black/40 text-[10px] text-gray-500 font-semibold uppercase tracking-wider font-sans">
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject & Snippet</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Dispatched At</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {emailLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-sans">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-500 mb-2" />
                        Loading dispatch queue...
                      </td>
                    </tr>
                  ) : emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-sans">
                        No email dispatch records found
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => (
                      <tr key={log.Id} className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-gray-800 dark:text-gray-200">{log.RecipientName || 'User'}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{log.RecipientEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-sans max-w-xs">
                          <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{log.Subject}</div>
                          <div className="text-[11px] text-gray-400 truncate">{log.PayloadSnippet || '—'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-[10px] font-bold">
                            {log.EmailType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            log.Status === 'Delivered'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : log.Status === 'Failed'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              log.Status === 'Delivered' ? 'bg-emerald-500' : log.Status === 'Failed' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {log.Status}
                          </span>
                          {log.ErrorMessage && (
                            <div className="text-[10px] text-rose-500 mt-0.5 max-w-[200px] truncate" title={log.ErrorMessage}>
                              {log.ErrorMessage}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">
                          {new Date(log.SentAt).toLocaleTimeString()} · {new Date(log.SentAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center font-sans">
                          {log.Status === 'Failed' ? (
                            <button
                              onClick={() => handleRetryEmail(log.Id)}
                              disabled={retryingId === log.Id}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <RotateCcw className={`w-3 h-3 ${retryingId === log.Id ? 'animate-spin' : ''}`} />
                              <span>Retry</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[11px]">OK</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/30 flex items-center justify-between text-xs font-sans">
              <span className="text-gray-500">Page {emailPage} of {emailTotalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailPage(p => Math.max(1, p - 1))}
                  disabled={emailPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEmailPage(p => Math.min(emailTotalPages, p + 1))}
                  disabled={emailPage === emailTotalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DATABASE BACKUP & SNAPSHOT MANAGER */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Top DB Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Total Database Tables</span>
              <div className="text-2xl font-black font-heading mt-1">{dbStats.totalTables}</div>
              <p className="text-[11px] text-gray-400 mt-1">InnoDB Engine tables</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Total Table Rows</span>
              <div className="text-2xl font-black font-heading mt-1">{dbStats.totalRows.toLocaleString()}</div>
              <p className="text-[11px] text-gray-400 mt-1">Cumulative records</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs text-gray-500 font-medium">Data Storage Footprint</span>
              <div className="text-2xl font-black font-heading text-emerald-600 mt-1">{dbStats.totalSizeMb} MB</div>
              <p className="text-[11px] text-gray-400 mt-1">Data + Index sizes</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">Capture Instant Snapshot</span>
                <p className="text-[11px] text-gray-400 mt-0.5">Logs archive state now</p>
              </div>
              <button
                onClick={handleCreateSnapshot}
                disabled={creatingSnapshot}
                className="mt-2 w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <HardDrive className={`w-3.5 h-3.5 ${creatingSnapshot ? 'animate-spin' : ''}`} />
                <span>{creatingSnapshot ? 'Capturing Snapshot...' : 'Capture Snapshot'}</span>
              </button>
            </div>
          </div>

          {snapshotSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{snapshotSuccess}</span>
            </div>
          )}

          {/* Quick Download Strip */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-black border border-emerald-500/20 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base font-heading">One-Click Full Database Export</h3>
              <p className="text-xs text-gray-400">Download complete schema and table records directly to your machine.</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`${API_BASE_URL}/api/database-backups/download/sql`}
                download
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download .SQL Dump</span>
              </a>
              <a
                href={`${API_BASE_URL}/api/database-backups/download/json`}
                download
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download .JSON Dump</span>
              </a>
            </div>
          </div>

          {/* Table Breakdown & Backup History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Table Storage Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm font-heading">Top Database Tables by Storage</h3>
                <span className="text-xs text-gray-400">{dbStats.tables.length} tables</span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 sidebar-scrollbar text-xs">
                {dbStats.tables.slice(0, 15).map((t) => (
                  <div key={t.tableName} className="p-2.5 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between font-mono">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{t.tableName}</span>
                      <span className="text-[10px] text-gray-400 block font-sans">{Number(t.rowCount).toLocaleString()} rows</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      {t.sizeMb} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup Snapshot History */}
            <div className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm font-heading">Snapshot History Log</h3>
                <button
                  onClick={() => fetchDatabaseStats()}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 sidebar-scrollbar text-xs">
                {backupHistory.length === 0 ? (
                  <p className="text-gray-400 text-center py-8 font-sans">No snapshots logged yet.</p>
                ) : (
                  backupHistory.map((b) => (
                    <div key={b.Id} className="p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
                      <div>
                        <div className="font-bold font-mono text-gray-800 dark:text-gray-200 text-[11px] truncate max-w-[200px]" title={b.Filename}>
                          {b.Filename}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {b.TotalTables} tables · {b.TotalRows} rows · {(b.SizeBytes / 1024 / 1024).toFixed(2)} MB · {new Date(b.CreatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBackup(b.Id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                        title="Delete log record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WEBHOOKS & NOTIFICATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-heading">Configured Webhook Endpoints</h2>
              <p className="text-xs text-gray-500">
                Outgoing notifications to Discord channels, Slack incoming webhooks, or custom REST endpoints.
              </p>
            </div>
            <button
              onClick={() => setShowCreateWebhookModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Add Webhook Endpoint</span>
            </button>
          </div>

          {/* Webhooks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webhooks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 font-sans p-6 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <Webhook className="w-8 h-8 opacity-40 mx-auto text-emerald-500 mb-2" />
                <p className="font-semibold text-sm">No webhooks registered yet</p>
                <p className="text-xs mt-1">Connect Discord or Slack to receive real-time event updates.</p>
              </div>
            ) : (
              webhooks.map((wh) => (
                <div key={wh.Id} className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide ${
                        wh.Platform === 'DISCORD'
                          ? 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/30'
                          : wh.Platform === 'SLACK'
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      }`}>
                        {wh.Platform}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${wh.IsActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    </div>

                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-2.5">{wh.Name}</h4>
                    <p className="font-mono text-[11px] text-gray-400 truncate mt-1" title={wh.TargetUrl}>
                      {wh.TargetUrl}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {wh.Events.split(',').map((evt) => (
                        <span key={evt} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-[9px] font-bold text-gray-500">
                          {evt.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-gray-400">
                      Status: {wh.LastStatus ? `${wh.LastStatus} OK` : 'Untested'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestWebhook(wh.Id)}
                        disabled={testingWebhookId === wh.Id}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Send test ping payload"
                      >
                        <Play className={`w-3 h-3 ${testingWebhookId === wh.Id ? 'animate-spin' : ''}`} />
                        <span>Test</span>
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.Id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                        title="Delete endpoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Webhook Test Alert */}
          {webhookTestResult && (
            <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              webhookTestResult.success
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${webhookTestResult.success ? 'text-emerald-500' : 'text-rose-500'}`} />
                <span>
                  {webhookTestResult.success ? 'Webhook connection verified!' : 'Webhook test failed.'} HTTP {webhookTestResult.statusCode} ({webhookTestResult.durationMs}ms)
                  {webhookTestResult.response ? ` · ${webhookTestResult.response}` : ''}
                  {webhookTestResult.error ? ` · ${webhookTestResult.error}` : ''}
                </span>
              </div>
            </div>
          )}

          {/* Recent Webhook Delivery Logs */}
          <div className="p-5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm font-heading">Recent Outgoing Webhook Deliveries</h3>
            <div className="overflow-x-auto min-h-[160px]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-[10px] text-gray-500 font-semibold uppercase font-sans">
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Target Endpoint</th>
                    <th className="py-2.5 px-3">Response</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {webhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400 font-sans">
                        No delivery logs recorded yet
                      </td>
                    </tr>
                  ) : (
                    webhookLogs.map((l) => (
                      <tr key={l.Id}>
                        <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">{l.EventName}</td>
                        <td className="py-2 px-3 truncate max-w-xs text-gray-500" title={l.TargetUrl}>{l.TargetUrl}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            l.Status === 'SUCCESS' ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-600 bg-rose-500/10'
                          }`}>
                            HTTP {l.ResponseStatusCode}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-400">{l.ExecutionTimeMs}ms</td>
                        <td className="py-2 px-3 text-gray-400 text-[10px] font-sans">
                          {new Date(l.CreatedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TEST MAIL SENDER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showTestMailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base font-heading">Dispatch Diagnostic Test Email</h3>
                <button onClick={() => setShowTestMailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendTestMail} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">Recipient Email Address</label>
                  <input
                    type="email"
                    required
                    value={testMailRecipient}
                    onChange={(e) => setTestMailRecipient(e.target.value)}
                    placeholder="e.g. test@ayojan.live"
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">Subject</label>
                  <input
                    type="text"
                    required
                    value={testMailSubject}
                    onChange={(e) => setTestMailSubject(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">Message Content</label>
                  <textarea
                    rows={3}
                    value={testMailBody}
                    onChange={(e) => setTestMailBody(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {testMailResult && (
                  <div className={`p-3 rounded-xl text-xs font-semibold ${
                    testMailResult.success ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
                  }`}>
                    {testMailResult.message || (testMailResult.success ? 'Email sent successfully!' : 'Delivery failed')}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTestMailModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={testMailSending}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {testMailSending ? 'Dispatching...' : 'Send Test Mail'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD WEBHOOK */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCreateWebhookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base font-heading">Register Webhook Endpoint</h3>
                <button onClick={() => setShowCreateWebhookModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWebhook} className="space-y-3.5 text-xs font-sans">
                <div>
                  <label className="font-semibold block mb-1">Friendly Name</label>
                  <input
                    type="text"
                    required
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    placeholder="e.g. Discord Hackathon Organizers"
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Target Webhook URL</label>
                  <input
                    type="url"
                    required
                    value={whTargetUrl}
                    onChange={(e) => setWhTargetUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
                    className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Platform Preset</label>
                    <select
                      value={whPlatform}
                      onChange={(e) => setWhPlatform(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 font-medium"
                    >
                      <option value="DISCORD">Discord (Rich Embeds)</option>
                      <option value="SLACK">Slack (Block Kit)</option>
                      <option value="GENERIC">Generic REST (JSON)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Secret Key (Optional)</label>
                    <input
                      type="text"
                      value={whSecret}
                      onChange={(e) => setWhSecret(e.target.value)}
                      placeholder="X-Ayojan-Secret header"
                      className="w-full py-2 px-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Subscribed Triggers</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {['TEAM_REGISTERED', 'PROJECT_SUBMITTED', 'RESULTS_PUBLISHED', 'ANNOUNCEMENT_BROADCAST'].map((evt) => {
                      const checked = whEvents.includes(evt);
                      return (
                        <label key={evt} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200/60 dark:border-gray-800/60 cursor-pointer text-[11px]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) setWhEvents(prev => [...prev, evt]);
                              else setWhEvents(prev => prev.filter(x => x !== evt));
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{evt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateWebhookModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
                  >
                    Register Endpoint
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

