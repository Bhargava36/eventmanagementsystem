import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Crown,
  Building,
  User,
  Key,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Lock,
  ArrowRight,
  Info,
  SlidersHorizontal,
  PlusCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';
import useAuth from '../../../Hooks/useAuth';
import useTheme from '../../../Hooks/useTheme';
import useToast from '../../../Hooks/useToast';

export default function TestCredentialsPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showPasswords, setShowPasswords] = useState({});
  const [copiedField, setCopiedField] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  const [loggingInId, setLoggingInId] = useState(null);

  // Fetch Accounts from Backend API
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/dev/accounts`);
      const data = await res.json();
      if (res.ok && data.accounts) {
        setAccounts(data.accounts);
      } else {
        throw new Error(data.message || 'Failed to fetch accounts');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not load test accounts from server');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Copy to clipboard helper
  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Toggle Password visibility for an account
  const toggleShowPassword = (id) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 1-Click Direct Login
  const handleQuickLogin = async (acc) => {
    try {
      setLoggingInId(acc.Id);
      const res = await fetch(`${API_BASE_URL}/api/dev/quick-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: acc.Id, email: acc.Email, role: acc.RoleName, evaluatorId: acc.evaluatorId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Direct login failed');
      }

      // Store in localStorage matching app's UnifiedLogin pattern
      localStorage.setItem('token', data.token);
      if (acc.RoleName === 'admin') {
        localStorage.setItem('admin', JSON.stringify(data.user));
      } else if (acc.RoleName === 'evaluator') {
        localStorage.setItem('evaluator', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('role', data.role);

      login(data.token, data.user, data.role);
      toast.success(`Logged in as ${acc.UserName} (${acc.RoleDisplay || acc.RoleName})!`);

      setTimeout(() => {
        navigate(data.redirectPath || acc.dashboardPath, { replace: true });
      }, 400);
    } catch (err) {
      toast.error(err.message || 'Failed to auto-login');
    } finally {
      setLoggingInId(null);
    }
  };

  // Quick Password Reset to standard password123
  const handleResetPassword = async (acc) => {
    try {
      setResettingId(acc.Id);
      const res = await fetch(`${API_BASE_URL}/api/dev/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: acc.Id, newPassword: 'password123', isEvaluator: acc.isEvaluator }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      toast.success(`Password for ${acc.UserName} reset to "password123"`);
      // Update local state
      setAccounts((prev) =>
        prev.map((a) => (a.Id === acc.Id ? { ...a, testPassword: 'password123' } : a))
      );
    } catch (err) {
      toast.error(err.message || 'Password reset failed');
    } finally {
      setResettingId(null);
    }
  };

  // Filtering
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesRole =
        selectedRole === 'all' ? true : acc.RoleName === selectedRole;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (acc.UserName && acc.UserName.toLowerCase().includes(q)) ||
        (acc.Username && acc.Username.toLowerCase().includes(q)) ||
        (acc.Email && acc.Email.toLowerCase().includes(q)) ||
        (acc.EventName && acc.EventName.toLowerCase().includes(q)) ||
        (acc.RoleName && acc.RoleName.toLowerCase().includes(q)) ||
        (acc.RoleDisplay && acc.RoleDisplay.toLowerCase().includes(q)) ||
        (acc.Track && acc.Track.toLowerCase().includes(q));

      return matchesRole && matchesSearch;
    });
  }, [accounts, selectedRole, search]);

  const counts = useMemo(() => {
    return {
      all: accounts.length,
      super_admin: accounts.filter((a) => a.RoleName === 'super_admin').length,
      admin: accounts.filter((a) => a.RoleName === 'admin').length,
      user: accounts.filter((a) => a.RoleName === 'user').length,
      evaluator: accounts.filter((a) => a.RoleName === 'evaluator').length,
    };
  }, [accounts]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 transition-colors duration-300 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Overview */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 p-6 sm:p-10 backdrop-blur-xl shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span>DEV & QA TESTING SUITE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                Test Accounts & Credentials
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Use this testing hub to inspect credentials for all system roles. Test portals with <strong>1-Click Direct Login</strong> or copy verified credentials for Super Admin, Event Organizers, and Participants.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchAccounts}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-semibold hover:border-emerald-500 transition-colors shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live DB</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-200/80 dark:border-white/10">
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Users</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{counts.all}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
              <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Super Admins</span>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-0.5">{counts.super_admin}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Organizers (Admin)</span>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{counts.admin}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20">
              <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Participants (Users)</span>
              <p className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-0.5">{counts.user}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 col-span-2 sm:col-span-1">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Evaluators (Jury)</span>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">{counts.evaluator}</p>
            </div>
          </div>
        </div>

        {/* Portal Shortcuts Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/superadmin/login"
            className="group flex items-center justify-between p-4 rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-purple-500/10 hover:border-violet-500 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-violet-500 transition-colors">
                  Super Admin Portal
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">/superadmin/login</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/login"
            className="group flex items-center justify-between p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/10 hover:border-emerald-500 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Organizer Portal
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">/admin/login</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/user/login"
            className="group flex items-center justify-between p-4 rounded-2xl border border-sky-200 dark:border-sky-500/20 bg-gradient-to-r from-sky-500/5 to-blue-500/10 hover:border-sky-500 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Participant Portal
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">/user/login</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/evaluator/login"
            className="group flex items-center justify-between p-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/10 hover:border-amber-500 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  Evaluator Portal
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">/evaluator/login</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-sm">
          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              All Roles ({counts.all})
            </button>
            <button
              onClick={() => setSelectedRole('super_admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'super_admin'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              👑 Super Admin ({counts.super_admin})
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              🏢 Organizers ({counts.admin})
            </button>
            <button
              onClick={() => setSelectedRole('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'user'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              🎓 Participants ({counts.user})
            </button>
            <button
              onClick={() => setSelectedRole('evaluator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'evaluator'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              ⚖️ Evaluators ({counts.evaluator})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, event..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white transition-colors"
            />
          </div>
        </div>

        {/* Organizer Login Helper Alert */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
          <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p>
            <strong>Note for Organizer Login:</strong> The organizer login portal at <code>/admin/login</code> requires <strong>Email</strong>, <strong>Password</strong>, and the <strong>Assigned Event Name</strong> (shown on the cards below). Alternatively, click <strong>"⚡ 1-Click Auto Login"</strong> to bypass manual form entry instantly!
          </p>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-sm text-slate-500">Querying live users from MySQL database...</span>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50">
            <p className="text-base font-semibold text-slate-700 dark:text-zinc-300">No accounts matched your search.</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Try clearing filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((acc) => {
              const isSuperAdmin = acc.RoleName === 'super_admin';
              const isAdmin = acc.RoleName === 'admin';
              const isParticipant = acc.RoleName === 'user';
              const isEvaluator = acc.RoleName === 'evaluator';
              const isPwdVisible = Boolean(showPasswords[acc.Id]);

              return (
                <div
                  key={acc.Id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900/90 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
                >
                  <div className="space-y-4">
                    {/* Header: Role Badge & ID */}
                    <div className="flex items-center justify-between">
                      {isSuperAdmin && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
                          <Crown className="w-3.5 h-3.5" />
                          SUPER ADMIN (Role 1)
                        </span>
                      )}
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <Building className="w-3.5 h-3.5" />
                          ORGANIZER (Role 2)
                        </span>
                      )}
                      {isParticipant && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                          <User className="w-3.5 h-3.5" />
                          PARTICIPANT (Role 3)
                        </span>
                      )}
                      {isEvaluator && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Award className="w-3.5 h-3.5" />
                          EVALUATOR / JURY
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-slate-400">ID #{acc.Id}</span>
                    </div>

                    {/* Name & Contact */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {acc.UserName || 'Unnamed User'}
                        </h3>
                        {isEvaluator && acc.Track && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            {acc.Track} Track
                          </span>
                        )}
                      </div>
                      {isEvaluator && (acc.RoleDisplay || acc.EvaluatorRole) && (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mt-0.5">
                          ⚖️ {acc.RoleDisplay || acc.EvaluatorRole}
                        </span>
                      )}
                      {acc.Mobile && (
                        <span className="text-xs text-slate-500 dark:text-zinc-400 block mt-0.5">
                          📞 {acc.Mobile}
                        </span>
                      )}
                    </div>

                    {/* Username Box (For Evaluators) */}
                    {isEvaluator && acc.Username && (
                      <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1">
                        <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                          <span className="flex items-center gap-1 font-semibold">
                            <User className="w-3.5 h-3.5" /> Username
                          </span>
                          <button
                            onClick={() => copyToClipboard(acc.Username, `user-${acc.Id}`)}
                            className="hover:text-amber-500 transition-colors"
                            title="Copy Username"
                          >
                            {copiedField === `user-${acc.Id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 select-all">
                          {acc.Username}
                        </p>
                      </div>
                    )}

                    {/* Email Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </span>
                        <button
                          onClick={() => copyToClipboard(acc.Email, `email-${acc.Id}`)}
                          className="hover:text-emerald-500 transition-colors"
                          title="Copy Email"
                        >
                          {copiedField === `email-${acc.Id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-zinc-100 break-all select-all">
                        {acc.Email}
                      </p>
                    </div>

                    {/* Password Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200/80 dark:border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Lock className="w-3.5 h-3.5" /> Password
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleShowPassword(acc.Id)}
                            className="hover:text-slate-900 dark:hover:text-white transition-colors"
                            title={isPwdVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isPwdVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(acc.testPassword, `pwd-${acc.Id}`)}
                            className="hover:text-emerald-500 transition-colors"
                            title="Copy Password"
                          >
                            {copiedField === `pwd-${acc.Id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 select-all">
                          {isPwdVisible ? acc.testPassword : '••••••••••••'}
                        </p>
                        <button
                          onClick={() => handleResetPassword(acc)}
                          disabled={resettingId === acc.Id}
                          className="text-[10px] text-slate-500 dark:text-zinc-400 hover:text-emerald-500 underline transition-colors disabled:opacity-50"
                        >
                          {resettingId === acc.Id ? 'Resetting...' : 'Reset to password123'}
                        </button>
                      </div>
                    </div>

                    {/* Event Details (For Admins & Evaluators) */}
                    {(isAdmin || isEvaluator) && (acc.EventName || acc.College) && (
                      <div className={`p-3.5 rounded-2xl border space-y-1.5 ${isEvaluator ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                        <span className={`text-[11px] font-semibold uppercase tracking-wider block ${isEvaluator ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                          Assigned Event:
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {acc.EventName || 'Assigned Hackathon'}
                          </span>
                          {acc.EventName && (
                            <button
                              onClick={() => copyToClipboard(acc.EventName, `event-${acc.Id}`)}
                              className={`text-xs hover:underline flex items-center gap-1 ${isEvaluator ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                            >
                              {copiedField === `event-${acc.Id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>Copy Name</span>
                            </button>
                          )}
                        </div>
                        {acc.EventLocation && (
                          <span className="text-[11px] text-slate-600 dark:text-zinc-400 block">
                            📍 {acc.EventLocation} {acc.Track ? `• ${acc.Track} Track` : acc.HackathonMode ? `(${acc.HackathonMode})` : ''}
                          </span>
                        )}
                        {isEvaluator && acc.College && (
                          <span className="text-[11px] text-slate-600 dark:text-zinc-400 block">
                            🏛️ {acc.College}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Additional User Info (For Participants) */}
                    {isParticipant && acc.College && (
                      <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <span>🎓 {acc.College}</span>
                        {acc.Location && <span>• 📍 {acc.Location}</span>}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-5 mt-5 border-t border-slate-100 dark:border-white/10 space-y-2">
                    {/* 1-Click Auto Login Button */}
                    <button
                      onClick={() => handleQuickLogin(acc)}
                      disabled={loggingInId === acc.Id}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white active:scale-[0.98] transition-all shadow-md disabled:opacity-50 ${
                        isEvaluator
                          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                          : isSuperAdmin
                          ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      }`}
                    >
                      <Zap className={`w-4 h-4 ${loggingInId === acc.Id ? 'animate-bounce' : ''}`} />
                      <span>{loggingInId === acc.Id ? 'Authenticating...' : '⚡ 1-Click Auto Login'}</span>
                    </button>

                    {/* Open Login Portal Link */}
                    <Link
                      to={acc.portalPath}
                      state={{ prefilledEmail: acc.Username || acc.Email, prefilledEvent: acc.EventName }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span>Open {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Organizer' : isEvaluator ? 'Evaluator' : 'User'} Login Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback accounts in case database is briefly unreachable
