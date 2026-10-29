import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  UsersRound,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Custom sleek tooltip component compatible with light/dark themes
function CustomTooltip({ active, payload, label, isDark, unit = '' }) {
  if (active && payload && payload.length) {
    return (
      <div
        className={`px-3.5 py-2.5 rounded-xl border shadow-xl text-xs backdrop-blur-md transition-all ${
          isDark
            ? 'bg-zinc-900/95 border-zinc-700/80 text-white shadow-black/60'
            : 'bg-white/95 border-gray-200 text-gray-900 shadow-gray-200'
        }`}
      >
        <p className="font-semibold mb-1.5 text-[13px] border-b pb-1 border-gray-200/40 dark:border-zinc-800">
          {label}
        </p>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                  style={{ backgroundColor: item.color || item.fill }}
                />
                {item.name}:
              </span>
              <span className="font-bold tabular-nums" style={{ color: item.color || item.fill }}>
                {Number(item.value).toLocaleString()} {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function SuperAdminAnalytics({
  events = [],
  recentRegistrations = [],
  totalMembers = 0,
  totalUsers = 0,
  totalTeams = 0,
  totalEvents = 0,
  isDark = false,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'events' | 'trends' | 'modes'
  const [pieMode, setPieMode] = useState('mode'); // 'mode' | 'status'

  // 1. Data for Event Scale (Bar Chart: Teams vs Members per Event)
  const eventScaleData = useMemo(() => {
    if (!events || events.length === 0) {
      return [
        { name: 'Hackathon Alpha', members: 45, teams: 12 },
        { name: 'CodeSprint 2026', members: 68, teams: 18 },
        { name: 'TechSummit Expo', members: 32, teams: 8 },
        { name: 'AI Challenge', members: 54, teams: 15 },
      ];
    }

    return events.slice(0, 8).map((evt) => {
      const name = evt.EventName || evt.eventName || 'Event';
      const truncatedName = name.length > 14 ? name.substring(0, 12) + '...' : name;
      return {
        fullName: name,
        name: truncatedName,
        members: Number(evt.MemberCount ?? evt.UserCount ?? evt.userCount ?? 0),
        teams: Number(evt.TeamCount ?? evt.teamCount ?? 0),
      };
    });
  }, [events]);

  // 2. Data for Event Modes & Statuses (Donut Charts)
  const { modeData, statusData } = useMemo(() => {
    const modes = { Virtual: 0, Physical: 0, Hybrid: 0 };
    const statuses = { Ongoing: 0, Upcoming: 0, Completed: 0 };

    if (!events || events.length === 0) {
      return {
        modeData: [
          { name: 'Virtual', value: 3, color: '#3B82F6' },
          { name: 'Physical', value: 5, color: '#10B981' },
          { name: 'Hybrid (Both)', value: 2, color: '#8B5CF6' },
        ],
        statusData: [
          { name: 'Ongoing', value: 2, color: '#10B981' },
          { name: 'Upcoming', value: 6, color: '#F59E0B' },
          { name: 'Completed', value: 2, color: '#6B7280' },
        ],
      };
    }

    events.forEach((evt) => {
      const m = String(evt.HackathonMode || evt.mode || '').toLowerCase();
      if (m.includes('both') || m.includes('hybrid')) {
        modes.Hybrid += 1;
      } else if (m.includes('phys')) {
        modes.Physical += 1;
      } else if (m.includes('virt')) {
        modes.Virtual += 1;
      } else {
        modes.Physical += 1;
      }

      const s = String(evt.EventStatus || evt.status || '').toLowerCase();
      if (s.includes('ongo') || s.includes('live')) {
        statuses.Ongoing += 1;
      } else if (s.includes('comp') || s.includes('end')) {
        statuses.Completed += 1;
      } else {
        statuses.Upcoming += 1;
      }
    });

    return {
      modeData: [
        { name: 'Physical', value: modes.Physical || 0, color: '#10B981' },
        { name: 'Virtual', value: modes.Virtual || 0, color: '#06B6D4' },
        { name: 'Hybrid', value: modes.Hybrid || 0, color: '#8B5CF6' },
      ].filter((d) => d.value > 0),
      statusData: [
        { name: 'Ongoing', value: statuses.Ongoing || 0, color: '#10B981' },
        { name: 'Upcoming', value: statuses.Upcoming || 0, color: '#F59E0B' },
        { name: 'Completed', value: statuses.Completed || 0, color: '#6B7280' },
      ].filter((d) => d.value > 0),
    };
  }, [events]);

  // 3. Data for Registration Trend / Velocity (Area Chart)
  const registrationTrendData = useMemo(() => {
    if (!recentRegistrations || recentRegistrations.length === 0) {
      // Fallback synthetic trend based on total registrations
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const base = Math.max(1, Math.round(totalMembers / 14));
      return days.map((day, i) => ({
        date: day,
        registrations: Math.round(base * (1 + (i % 3) * 0.4 + (i === 6 ? 0.8 : 0))),
        teams: Math.max(1, Math.round((base * (1 + (i % 3) * 0.4)) / 3.5)),
      }));
    }

    // Group actual registrations by date (last 7 recorded groups)
    const dateMap = {};
    recentRegistrations.forEach((r) => {
      const rawDate = r.CreatedAt || r.createdAt || r.ActivityDate || r.date;
      let label = 'Recent';
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
      if (!dateMap[label]) {
        dateMap[label] = { date: label, registrations: 0, teams: 0 };
      }
      dateMap[label].registrations += 1;
      if (r.TeamName || r.teamName) {
        dateMap[label].teams += 1;
      }
    });

    const entries = Object.values(dateMap);
    if (entries.length < 3) {
      return [
        { date: 'Phase 1', registrations: Math.round(totalMembers * 0.2), teams: Math.round(totalTeams * 0.2) },
        { date: 'Phase 2', registrations: Math.round(totalMembers * 0.35), teams: Math.round(totalTeams * 0.35) },
        { date: 'Phase 3', registrations: Math.round(totalMembers * 0.65), teams: Math.round(totalTeams * 0.65) },
        { date: 'Current', registrations: totalMembers || 12, teams: totalTeams || 4 },
      ];
    }
    return entries.slice(-7);
  }, [recentRegistrations, totalMembers, totalTeams]);

  // Key system ratios
  const avgTeamSize = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : '—';
  const membersPerEvent = totalEvents > 0 ? Math.round(totalMembers / totalEvents) : '—';
  const activeEventsCount = events.filter((e) =>
    ['ongoing', 'active', 'live'].includes(String(e.EventStatus || e.status || '').toLowerCase())
  ).length;

  // Chart theme colors
  const gridColor = isDark ? '#27272a' : '#f1f5f9';
  const axisColor = isDark ? '#71717a' : '#94a3b8';

  return (
    <div className="space-y-6">
      {/* Analytics Section Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              System Analytics & Insights
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-500/20">
              Live Charts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visual breakdown of platform events, participant registration trends, and engagement metrics
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Charts' },
            { id: 'events', label: 'Event Scale' },
            { id: 'trends', label: 'Trends' },
            { id: 'modes', label: 'Distribution' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
              Active Events Now
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {activeEventsCount} <span className="text-xs font-normal text-emerald-600">running</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
              Avg Team Size
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {avgTeamSize} <span className="text-xs font-normal text-gray-500">members/team</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
              Avg Members / Event
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {membersPerEvent} <span className="text-xs font-normal text-purple-500">density</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <UsersRound className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
              Registered Teams
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {totalTeams} <span className="text-xs font-normal text-amber-500">squads</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Event Scale & Participation (Bar Chart) */}
        {(activeTab === 'all' || activeTab === 'events') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm ${
              activeTab === 'events' ? 'lg:col-span-12' : 'lg:col-span-7'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Event Scale & Volume Comparison
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Comparison of registered members and formed teams per event
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  Members
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
                  Teams
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventScaleData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  barGap={6}
                >
                  <defs>
                    <linearGradient id="membersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="teamsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#0284C7" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} />}
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                  />
                  <Bar
                    dataKey="members"
                    name="Members"
                    fill="url(#membersGrad)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="teams"
                    name="Teams"
                    fill="url(#teamsGrad)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* CHART 2: Event Mode & Status Distribution (Donut Chart) */}
        {(activeTab === 'all' || activeTab === 'modes') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className={`rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm ${
              activeTab === 'modes' ? 'lg:col-span-12' : 'lg:col-span-5'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Format & State Split
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Platform mode breakdown
                </p>
              </div>

              {/* Mode / Status switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-zinc-900 rounded-lg border border-gray-200/80 dark:border-zinc-800 text-[11px]">
                <button
                  onClick={() => setPieMode('mode')}
                  className={`px-2 py-1 rounded-md font-medium transition-all ${
                    pieMode === 'mode'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Mode
                </button>
                <button
                  onClick={() => setPieMode('status')}
                  className={`px-2 py-1 rounded-md font-medium transition-all ${
                    pieMode === 'status'
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Status
                </button>
              </div>
            </div>

            <div className="h-64 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieMode === 'mode' ? modeData : statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(pieMode === 'mode' ? modeData : statusData).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={isDark ? '#000000' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip isDark={isDark} unit="events" />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut summary */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalEvents || (pieMode === 'mode' ? modeData : statusData).reduce((a, b) => a + b.value, 0)}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                  Events
                </span>
              </div>
            </div>

            {/* Legend Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
              {(pieMode === 'mode' ? modeData : statusData).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {item.name}:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CHART 3: Registration Velocity & Activity Trend (Area Chart) */}
        {(activeTab === 'all' || activeTab === 'trends') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className={`rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm ${
              activeTab === 'trends' ? 'lg:col-span-12' : 'lg:col-span-12'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Registration Velocity & Growth Curve
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time timeline of participant registrations & team formations
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
                  Registrations
                </span>
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block shadow-sm" />
                  Teams Formed
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={registrationTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="teamCurveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="date"
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={axisColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} />}
                    cursor={{ stroke: isDark ? '#3f3f46' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    name="Registrations"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#regGrad)"
                    activeDot={{ r: 6, fill: '#10B981', stroke: isDark ? '#000' : '#fff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="teams"
                    name="Teams"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#teamCurveGrad)"
                    activeDot={{ r: 5, fill: '#06B6D4', stroke: isDark ? '#000' : '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
