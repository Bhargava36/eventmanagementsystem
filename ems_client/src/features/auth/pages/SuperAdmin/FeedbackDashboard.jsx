import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Download,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  Eye,
  TrendingUp,
  Check,
  LayoutGrid,
  List,
  Quote,
  Laptop,
  Award,
  ArrowRight
} from 'lucide-react';
import { apiUrl } from '../../../../lib/api';

const getRatingColor = (rating) => {
  const r = Number(rating);
  if (r >= 4) {
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      starFill: 'fill-emerald-500 text-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
      label: 'Positive'
    };
  }
  if (r === 3) {
    return {
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      starFill: 'fill-amber-500 text-amber-500',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
      label: 'Neutral'
    };
  }
  return {
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    starFill: 'fill-rose-500 text-rose-500',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
    label: 'Critical'
  };
};

const renderStars = (rating, size = 'md') => {
  const color = getRatingColor(rating);
  const sizeClasses = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses} ${
            star <= Number(rating)
              ? color.starFill
              : 'text-gray-200 dark:text-zinc-800'
          }`}
        />
      ))}
    </div>
  );
};

export default function SuperAdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & View state
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [search, setSearch] = useState('');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Modal & Copy
  const [activeItem, setActiveItem] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch dedicated platform feedback from backend
  const getFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/platform-feedback'));
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch platform feedback.');
      }
      setFeedbackList(Array.isArray(data.feedback) ? data.feedback : []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeedback();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRating, selectedCategory, selectedEvent, sortBy, itemsPerPage]);

  const getRating = (item) => Number(item.Rating ?? item.rating ?? 0);

  // Unique categories and events
  const categories = useMemo(() => {
    const set = new Set();
    feedbackList.forEach((item) => {
      const cat = item.Category || item.category;
      if (cat && String(cat).trim()) set.add(String(cat).trim());
    });
    return Array.from(set).sort();
  }, [feedbackList]);

  const eventNames = useMemo(() => {
    const set = new Set();
    feedbackList.forEach((item) => {
      const evt = item.EventName || item.eventName;
      if (evt && String(evt).trim()) set.add(String(evt).trim());
    });
    return Array.from(set).sort();
  }, [feedbackList]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = feedbackList.length;
    if (total === 0) {
      return {
        total: 0,
        average: '0.0',
        positive: 0,
        positivePercent: 0,
        neutral: 0,
        negative: 0,
        negativePercent: 0,
        distribution: [
          { stars: 5, count: 0, percent: 0 },
          { stars: 4, count: 0, percent: 0 },
          { stars: 3, count: 0, percent: 0 },
          { stars: 2, count: 0, percent: 0 },
          { stars: 1, count: 0, percent: 0 }
        ]
      };
    }

    const sum = feedbackList.reduce((acc, item) => acc + getRating(item), 0);
    const average = (sum / total).toFixed(1);

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    feedbackList.forEach((item) => {
      const r = Math.round(getRating(item));
      if (counts[r] !== undefined) counts[r] += 1;
      if (r >= 4) positive += 1;
      else if (r === 3) neutral += 1;
      else negative += 1;
    });

    const distribution = [5, 4, 3, 2, 1].map((s) => ({
      stars: s,
      count: counts[s] || 0,
      percent: Math.round(((counts[s] || 0) / total) * 100)
    }));

    return {
      total,
      average,
      positive,
      positivePercent: Math.round((positive / total) * 100),
      neutral,
      negative,
      negativePercent: Math.round((negative / total) * 100),
      distribution
    };
  }, [feedbackList]);

  // Filtered feedback
  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase();

    return feedbackList
      .filter((item) => {
        const rating = getRating(item);
        const category = String(item.Category || item.category || 'General').trim();
        const eventName = String(item.EventName || item.eventName || 'Website').trim();

        if (selectedRating !== 'ALL' && Math.round(rating) !== Number(selectedRating)) {
          return false;
        }

        if (selectedCategory !== 'ALL' && category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        if (selectedEvent !== 'ALL' && eventName.toLowerCase() !== selectedEvent.toLowerCase()) {
          return false;
        }

        if (query) {
          const userName = String(item.UserName || item.name || '').toLowerCase();
          const email = String(item.Email || item.email || '').toLowerCase();
          const comments = String(item.Comments || item.comments || '').toLowerCase();
          const id = String(item.Id || item.id || '');

          return (
            userName.includes(query) ||
            email.includes(query) ||
            eventName.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query) ||
            comments.includes(query) ||
            id.includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.CreatedAt || b.createdAt || 0) - new Date(a.CreatedAt || a.createdAt || 0);
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.CreatedAt || a.createdAt || 0) - new Date(b.CreatedAt || b.createdAt || 0);
        }
        if (sortBy === 'HIGHEST_RATING') {
          return getRating(b) - getRating(a);
        }
        if (sortBy === 'LOWEST_RATING') {
          return getRating(a) - getRating(b);
        }
        return 0;
      });
  }, [feedbackList, search, selectedRating, selectedCategory, selectedEvent, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage) || 1;
  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFeedback.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFeedback, currentPage, itemsPerPage]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedRating !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedEvent !== 'ALL' ||
    sortBy !== 'NEWEST';

  const resetFilters = () => {
    setSearch('');
    setSelectedRating('ALL');
    setSelectedCategory('ALL');
    setSelectedEvent('ALL');
    setSortBy('NEWEST');
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return String(date);
    return parsed.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return String(name || 'User')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredFeedback.length === 0) return;

    const headers = ['ID', 'User Name', 'Email', 'Event Name', 'Category', 'Rating', 'Comments', 'Submitted At'];

    const escapeCSV = (value) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = filteredFeedback.map((item) => [
      escapeCSV(item.Id || item.id || ''),
      escapeCSV(item.UserName || item.name || 'Anonymous'),
      escapeCSV(item.Email || item.email || ''),
      escapeCSV(item.EventName || item.eventName || 'Website'),
      escapeCSV(item.Category || item.category || 'General'),
      escapeCSV(getRating(item)),
      escapeCSV(item.Comments || item.comments || ''),
      escapeCSV(formatDateTime(item.CreatedAt || item.createdAt))
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `feedback_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyFeedbackText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-200/60 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Platform & Application Reviews
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                Landing Page Testimonials
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Live platform reviews collected from user dashboards. High-rated reviews are featured as live testimonials on the website hero section.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={exportToCSV}
              disabled={loading || filteredFeedback.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
              {filteredFeedback.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                  {filteredFeedback.length}
                </span>
              )}
            </button>

            <button
              onClick={getFeedback}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : 'text-gray-500'}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Spacious Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Responses */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Reviews
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                {loading ? '—' : stats.total}
              </span>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Feedback submissions across all events
              </p>
            </div>
          </motion.div>

          {/* Average Rating Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Average Rating
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  {loading ? '—' : stats.average}
                </span>
                <span className="text-sm font-medium text-gray-400">/ 5.0</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                {renderStars(Number(stats.average || 0), 'sm')}
              </div>
            </div>
          </motion.div>

          {/* Positive Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Positive (4–5 ★)
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {loading ? '—' : stats.positive}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  {stats.positivePercent}%
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Satisfied participant reviews
              </p>
            </div>
          </motion.div>

          {/* Critical Ratings */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-rose-500/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Needs Attention (1–2 ★)
              </span>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ThumbsDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400">
                  {loading ? '—' : stats.negative}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300">
                  {stats.negativePercent}%
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Requires admin follow-up or bug fix
              </p>
            </div>
          </motion.div>
        </div>

        {/* Rating Breakdown Banner - Wide & Spacious */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-white dark:bg-black rounded-2xl p-6 sm:p-7 border border-gray-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left Score Summary */}
            <div className="flex items-center gap-6 pb-4 md:pb-0 md:pr-8 md:border-r border-gray-100 dark:border-zinc-800 shrink-0">
              <div className="text-center md:text-left">
                <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
                  {stats.average}
                </div>
                <div className="mt-2 flex items-center justify-center md:justify-start gap-1">
                  {renderStars(Number(stats.average || 0), 'md')}
                </div>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                  Out of 5 stars • {stats.total} total
                </p>
              </div>
            </div>

            {/* Right Distribution Progress Bars */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
              {stats.distribution.map((item) => {
                const isSelected = selectedRating === String(item.stars);
                return (
                  <button
                    key={item.stars}
                    type="button"
                    onClick={() => setSelectedRating(isSelected ? 'ALL' : String(item.stars))}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-gray-50/60 dark:bg-zinc-900/50 border-gray-100 dark:border-zinc-800/80 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="flex items-center gap-1 text-gray-800 dark:text-zinc-200">
                        {item.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                      <span className="text-gray-400 dark:text-zinc-500">
                        {item.count} ({item.percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.stars >= 4
                            ? 'bg-emerald-500'
                            : item.stars === 3
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Feedback Explorer */}
        <div className="space-y-6">
          
          {/* Spacious Filter & Search Controls */}
          <div className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, email, event title, or feedback text..."
                className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/70 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills, Selects & View Toggle */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
              
              {/* Star Rating Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
                  Rating:
                </span>
                {['ALL', '5', '4', '3', '2', '1'].map((r) => {
                  const isSelected = selectedRating === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRating(r)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {r === 'ALL' ? 'All Reviews' : `${r} ★`}
                    </button>
                  );
                })}
              </div>

              {/* Dropdowns & View Toggles */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Event Select */}
                {eventNames.length > 0 && (
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Events ({eventNames.length})</option>
                    {eventNames.map((evt) => (
                      <option key={evt} value={evt}>
                        {evt}
                      </option>
                    ))}
                  </select>
                )}

                {/* Category Select */}
                {categories.length > 0 && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Categories ({categories.length})</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs px-3.5 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="HIGHEST_RATING">Highest Rating</option>
                  <option value="LOWEST_RATING">Lowest Rating</option>
                </select>

                {/* Reset Button */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium transition-colors"
                  >
                    Reset
                  </button>
                )}

                {/* View Mode Toggle: Cards vs Table */}
                <div className="flex items-center p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Content Section */}
          {loading ? (
            /* Loading Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-black rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-800" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
                      <div className="w-20 h-3 bg-gray-200 dark:bg-zinc-800 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-12 bg-gray-200 dark:bg-zinc-800 rounded" />
                  <div className="w-24 h-4 bg-gray-200 dark:bg-zinc-800 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white dark:bg-black rounded-2xl p-12 border border-gray-200 dark:border-zinc-800 text-center space-y-3">
              <ThumbsDown className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to load feedback</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400 max-w-md mx-auto">{error}</p>
              <button
                onClick={getFeedback}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            </div>
          ) : filteredFeedback.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-black rounded-2xl p-16 border border-gray-200 dark:border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {hasActiveFilters ? 'No Feedback Matches Your Filter' : 'No Feedback Received Yet'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Try broadening your search keywords or clearing some filters.'
                  : 'Feedback submitted by attendees will appear here in real time.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-gray-200 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            /* Spacious Review Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedFeedback.map((item, index) => {
                const userName = item.UserName || item.name || 'Anonymous User';
                const email = item.Email || item.email || '';
                const rating = getRating(item);
                const comments = item.Comments || item.comments || '';
                const category = item.Category || item.category || 'General';
                const eventName = item.EventName || item.eventName || 'Website';
                const ratingColor = getRatingColor(rating);

                return (
                  <motion.div
                    key={item.Id || item.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                    onClick={() => setActiveItem(item)}
                    className="bg-white dark:bg-black rounded-2xl p-6 sm:p-7 border border-gray-200 dark:border-zinc-800 shadow-sm hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer group"
                  >
                    {/* Card Top: User Info & Rating */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                          {getInitials(userName)}
                        </div>
                        <div>
                          <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {userName}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-zinc-500">
                            {email || `Feedback #${item.Id || item.id || 'N/A'}`}
                          </p>
                        </div>
                      </div>

                      {/* Rating Stars & Badge */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {renderStars(rating, 'md')}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ratingColor.badge}`}>
                          {rating}/5 • {ratingColor.label}
                        </span>
                      </div>
                    </div>

                    {/* Card Middle: Comment Text */}
                    <div className="relative pl-4 border-l-2 border-emerald-500/30">
                      <p className="text-sm sm:text-base text-gray-800 dark:text-zinc-200 leading-relaxed font-normal">
                        {comments || (
                          <span className="italic text-gray-400">No written feedback was provided.</span>
                        )}
                      </p>
                    </div>

                    {/* Card Bottom: Metadata Badges & Timestamp */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-800 dark:text-zinc-300 font-medium">
                          {eventName}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400">
                          <Tag className="w-3 h-3" />
                          {category}
                        </span>
                      </div>

                      <span className="text-gray-400 dark:text-zinc-500 whitespace-nowrap">
                        {formatDate(item.CreatedAt || item.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Table View (Spacious & Clean) */
            <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40">
                      <th className="py-4 px-6 font-semibold">User</th>
                      <th className="py-4 px-6 font-semibold">Event</th>
                      <th className="py-4 px-6 font-semibold">Category</th>
                      <th className="py-4 px-6 font-semibold">Rating</th>
                      <th className="py-4 px-6 font-semibold">Comment</th>
                      <th className="py-4 px-6 font-semibold">Date</th>
                      <th className="py-4 px-6 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {paginatedFeedback.map((item, index) => {
                      const userName = item.UserName || item.name || 'Anonymous User';
                      const email = item.Email || item.email || '';
                      const rating = getRating(item);
                      const comments = item.Comments || item.comments || '';
                      const category = item.Category || item.category || 'General';
                      const eventName = item.EventName || item.eventName || 'Website';
                      const ratingColor = getRatingColor(rating);

                      return (
                        <tr
                          key={item.Id || item.id || index}
                          onClick={() => setActiveItem(item)}
                          className="hover:bg-gray-50/80 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {getInitials(userName)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                                <p className="text-xs text-gray-400">{email || `#${item.Id || item.id || ''}`}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-gray-700 dark:text-zinc-300 font-medium">
                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-zinc-900 text-xs">
                              {eventName}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-gray-600 dark:text-zinc-400 text-xs">
                            {category}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {renderStars(rating, 'sm')}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${ratingColor.badge}`}>
                                {rating}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-6 max-w-xs truncate text-gray-700 dark:text-zinc-300">
                            {comments || <span className="italic text-gray-400">No comment</span>}
                          </td>

                          <td className="py-4 px-6 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(item.CreatedAt || item.createdAt)}
                          </td>

                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveItem(item);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && filteredFeedback.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800 text-xs text-gray-500 dark:text-gray-400 shadow-sm">
              <div className="flex items-center gap-3">
                <span>
                  Showing{' '}
                  <strong className="text-gray-900 dark:text-white">
                    {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFeedback.length)}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-gray-900 dark:text-white">
                    {Math.min(currentPage * itemsPerPage, filteredFeedback.length)}
                  </strong>{' '}
                  of <strong className="text-gray-900 dark:text-white">{filteredFeedback.length}</strong> reviews
                </span>

                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300"
                >
                  <option value={6}>6 per page</option>
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={20}>20 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-semibold text-gray-800 dark:text-zinc-200">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Review Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveItem(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 z-10 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md">
                    {getInitials(activeItem.UserName || activeItem.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {activeItem.UserName || activeItem.name || 'Anonymous User'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {activeItem.Email || activeItem.email || 'No email provided'} • ID #{activeItem.Id || activeItem.id || 'N/A'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Event & Category
                  </span>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {activeItem.EventName || activeItem.eventName || 'Website'}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {activeItem.Category || activeItem.category || 'General'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 space-y-1">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Rating & Sentiment
                  </span>
                  <div className="flex items-center gap-1.5">
                    {renderStars(getRating(activeItem), 'md')}
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {getRating(activeItem)}/5
                    </span>
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getRatingColor(getRating(activeItem)).badge}`}>
                    {getRatingColor(getRating(activeItem)).label} Experience
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Feedback Message
                  </span>
                  {activeItem.Comments || activeItem.comments ? (
                    <button
                      onClick={() => copyFeedbackText(activeItem.Comments || activeItem.comments)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5" /> : null}
                      {copiedId ? 'Copied' : 'Copy Message'}
                    </button>
                  ) : null}
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-sm leading-relaxed text-gray-800 dark:text-zinc-200 max-h-60 overflow-y-auto whitespace-pre-wrap">
                  {activeItem.Comments || activeItem.comments || (
                    <span className="italic text-gray-400">No written comment provided.</span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDateTime(activeItem.CreatedAt || activeItem.createdAt)}
                </span>

                <button
                  onClick={() => setActiveItem(null)}
                  className="px-5 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}