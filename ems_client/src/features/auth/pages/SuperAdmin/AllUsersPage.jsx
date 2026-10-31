import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  School,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Award,
  Layers,
  LayoutGrid,
  List,
  Eye,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import useTheme from '../../../../Hooks/useTheme';

export default function AllUsersPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [users, setUsers] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch application users');
      }
      setUsers(Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };
  const fetchEvaluators = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluators/`);
      const data = await response.json();
      console.log('Fetched evaluators:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch evaluators');
      }
      setEvaluators(Array.isArray(data.evaluators) ? data.evaluators : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch evaluators error:', err);
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEvaluators();
  }, []);

  // Reset to first page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, sortBy, pageSize]);

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = users.length;
    let regularUsers = 0;
    let admins = 0;
    let superAdmins = 0;

    users.forEach((u) => {
      const r = String(u.RoleName || '').toLowerCase();
      if (r === 'admin' || r === 'organizer') admins += 1;
      else if (r === 'super_admin' || r === 'superadmin') superAdmins += 1;
      else regularUsers += 1;
    });

    return { total, regularUsers, admins, superAdmins };
  }, [users]);

  const totalEvaluators = useMemo(() => {
    let evaluatorsCount = 0;
    evaluatorsCount = evaluators.length;
    return evaluatorsCount;
  }, [evaluators]);

  // Filtering & Sorting
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesRole =
          roleFilter === 'ALL' ||
          String(u.RoleName || '').toLowerCase() === roleFilter.toLowerCase();

        if (!matchesRole) return false;

        if (!search.trim()) return true;

        const q = search.toLowerCase();
        const name = String(u.UserName || '').toLowerCase();
        const email = String(u.Email || '').toLowerCase();
        const mobile = String(u.Mobile || '').toLowerCase();
        const college = String(u.College || '').toLowerCase();
        const location = String(u.Location || '').toLowerCase();
        const event = String(u.EventName || '').toLowerCase();
        const role = String(u.RoleName || '').toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          mobile.includes(q) ||
          college.includes(q) ||
          location.includes(q) ||
          event.includes(q) ||
          role.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0);
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.CreatedAt || 0) - new Date(b.CreatedAt || 0);
        }
        if (sortBy === 'NAME_ASC') {
          return String(a.UserName || '').localeCompare(String(b.UserName || ''));
        }
        if (sortBy === 'NAME_DESC') {
          return String(b.UserName || '').localeCompare(String(a.UserName || ''));
        }
        return 0;
      });
  }, [users, search, roleFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Role Badge Helper
  const getRoleBadge = (roleName) => {
    const r = String(roleName || 'user').toLowerCase();
    switch (r) {
      case 'admin':
      case 'organizer':
        return {
          label: 'Event Admin',
          classes: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
        };
      case 'evaluator':
      case 'judge':
        return {
          label: 'Evaluator',
          classes: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
        };
      case 'super_admin':
      case 'superadmin':
        return {
          label: 'Super Admin',
          classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
        };
      default:
        return {
          label: 'Participant',
          classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
        };
    }
  };

  // CSV Export
  const exportUsersCSV = () => {
    if (filteredUsers.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Mobile', 'College', 'Location', 'Associated Event', 'Created Date'];
    const escapeCSV = (val) => {
      const s = String(val ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = filteredUsers.map((u) => [
      escapeCSV(u.Id),
      escapeCSV(u.UserName),
      escapeCSV(u.Email),
      escapeCSV(u.RoleName || 'user'),
      escapeCSV(u.Mobile || '—'),
      escapeCSV(u.College || '—'),
      escapeCSV(u.Location || '—'),
      escapeCSV(u.EventName || '—'),
      escapeCSV(u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString() : '—'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ems_users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 transition-colors pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-200/60 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Application Users
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Full directory of all registered participants, organizers, and evaluators across EMS
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={exportUsersCSV}
              disabled={loading || filteredUsers.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all disabled:opacity-40"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
              {filteredUsers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                  {filteredUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : 'text-gray-500'}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Users
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3">
              {stats.total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Platform members</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Participants
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3">
              {stats.regularUsers.toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Students & Attendees</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Event Admins
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3">
              {stats.admins.toLocaleString()}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Event Organizers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Evaluators
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-3">
              {totalEvaluators.toLocaleString()}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Judges & Reviewers</p>
          </motion.div>
        </div>

        {/* Search, Filter & Controls Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, college, phone, or event..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400"
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

            {/* Role Filter Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 text-xs sm:scrolling-touch overflow-x-auto sm: scrolling-smooth">
                {[
                  { id: 'ALL', label: 'All Roles' },
                  { id: 'user', label: 'Participants' },
                  { id: 'admin', label: 'Admins' },
                  { id: 'evaluator', label: 'Evaluators' },
                  { id: 'super_admin', label: 'Super Admin' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRoleFilter(item.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      roleFilter === item.id
                        ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  title="Cards View"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Sub-bar: Sort & Result Count */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            <div>
              Showing <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> matching users
              {search && ` for "${search}"`}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-gray-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value="NEWEST" className="dark:bg-zinc-900">Newest Registered</option>
                <option value="OLDEST" className="dark:bg-zinc-900">Oldest Registered</option>
                <option value="NAME_ASC" className="dark:bg-zinc-900">Name (A-Z)</option>
                <option value="NAME_DESC" className="dark:bg-zinc-900">Name (Z-A)</option>
              </select>

              <span className="font-medium ml-2">Per Page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-transparent border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-500"
              >
                <option value={10} className="dark:bg-zinc-900">10</option>
                <option value={20} className="dark:bg-zinc-900">20</option>
                <option value={50} className="dark:bg-zinc-900">50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Content */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-500 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading application users directory...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-center text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No users found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Try adjusting your search query or role filter.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50/80 dark:bg-zinc-900/60 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 font-semibold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Contact & College</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Associated Event</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Joined</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/70">
                  {paginatedUsers.map((u, idx) => {
                    const badge = getRoleBadge(u.RoleName);
                    const initials = u.UserName ? u.UserName.substring(0, 2).toUpperCase() : 'U';

                    return (
                      <tr
                        key={u.Id || idx}
                        className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                      >
                        {/* User identity */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-emerald-500/20">
                              {u.Photo ? (
                                <img
                                  src={u.Photo}
                                  alt={u.UserName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span>{initials}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">
                                {u.UserName || 'Anonymous'}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                                <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="truncate">{u.Email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Contact & College */}
                        <td className="py-3 px-4 hidden md:table-cell">
                          <div className="space-y-0.5 text-xs">
                            {u.College && (
                              <p className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={u.College}>
                                {u.College}
                              </p>
                            )}
                            {u.Mobile && (
                              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {u.Mobile}
                              </p>
                            )}
                            {!u.College && !u.Mobile && <span className="text-gray-400">—</span>}
                          </div>
                        </td>

                        {/* Associated Event */}
                        <td className="py-3 px-4 hidden lg:table-cell">
                          {u.EventName ? (
                            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 truncate max-w-[180px] inline-block" title={u.EventName}>
                              {u.EventName}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">EMS Platform</span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-4 hidden sm:table-cell text-xs text-gray-500 dark:text-gray-400">
                          {u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUsers.map((u, idx) => {
              const badge = getRoleBadge(u.RoleName);
              const initials = u.UserName ? u.UserName.substring(0, 2).toUpperCase() : 'U';

              return (
                <div
                  key={u.Id || idx}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ring-1 ring-emerald-500/20">
                          {u.Photo ? (
                            <img src={u.Photo} alt={u.UserName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                            {u.UserName || 'Anonymous'}
                          </h4>
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-zinc-850">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{u.Email}</span>
                      </div>
                      {u.Mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{u.Mobile}</span>
                        </div>
                      )}
                      {u.College && (
                        <div className="flex items-center gap-2 truncate">
                          <School className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{u.College}</span>
                        </div>
                      )}
                      {u.Location && (
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{u.Location}{u.State ? `, ${u.State}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Joined {u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString() : '—'}
                    </span>
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Strip */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.min(currentPage * pageSize, filteredUsers.length)}
              </span>{' '}
              of <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> users
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Chips */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <span className="px-2 text-xs text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === p
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-950 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg overflow-hidden p-6 relative space-y-6"
              >
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header with User Badge */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden ring-2 ring-emerald-500/30">
                    {selectedUser.Photo ? (
                      <img src={selectedUser.Photo} alt={selectedUser.UserName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedUser.UserName ? selectedUser.UserName.substring(0, 2).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="min-w-0 pr-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {selectedUser.UserName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRoleBadge(selectedUser.RoleName).classes}`}>
                        {getRoleBadge(selectedUser.RoleName).label}
                      </span>
                      <span className="text-xs text-gray-400">ID #{selectedUser.Id}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">Email Address</span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-900 dark:text-white font-semibold">
                      <span className="truncate">{selectedUser.Email}</span>
                      <button
                        onClick={() => handleCopy(selectedUser.Email, 'email')}
                        className="text-gray-400 hover:text-emerald-500"
                        title="Copy Email"
                      >
                        {copiedText === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Mobile Phone</span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-900 dark:text-white font-semibold">
                      <span>{selectedUser.Mobile || '—'}</span>
                      {selectedUser.Mobile && (
                        <button
                          onClick={() => handleCopy(selectedUser.Mobile, 'phone')}
                          className="text-gray-400 hover:text-emerald-500"
                          title="Copy Mobile"
                        >
                          {copiedText === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">College / Institution</span>
                    <p className="mt-0.5 text-gray-900 dark:text-white font-semibold truncate">
                      {selectedUser.College || '—'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Location</span>
                    <p className="mt-0.5 text-gray-900 dark:text-white font-semibold">
                      {selectedUser.Location || '—'}{selectedUser.State ? `, ${selectedUser.State}` : ''}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Associated Event</span>
                    <p className="mt-0.5 text-gray-900 dark:text-white font-semibold">
                      {selectedUser.EventName || 'General Platform User'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Registration Date</span>
                    <p className="mt-0.5 text-gray-900 dark:text-white font-semibold">
                      {selectedUser.CreatedAt ? new Date(selectedUser.CreatedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
