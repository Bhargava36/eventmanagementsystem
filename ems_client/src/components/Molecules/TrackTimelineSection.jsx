import React from 'react';
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  CheckCircle2,
  BookOpen,
  Award
} from 'lucide-react';
import { getEventTypeInfo } from '../../lib/utils';

export default function TrackTimelineSection({ trackType = 'virtual', timelines = [], eventTheme = null, eventType = '' }) {
  const isVirtual = trackType.toLowerCase() === 'virtual';
  const typeInfo = getEventTypeInfo(eventType);

  // Filter timelines for this track, or general ones
  const filteredTimelines = (timelines || []).filter((item) => {
    const t = (item.Track || '').toLowerCase();
    return t === trackType.toLowerCase() || t === 'general';
  });

  // Sort by OrderIndex ascending, then Id
  const sortedTimelines = [...filteredTimelines].sort((a, b) => {
    const orderA = a.OrderIndex !== undefined && a.OrderIndex !== null ? Number(a.OrderIndex) : 0;
    const orderB = b.OrderIndex !== undefined && b.OrderIndex !== null ? Number(b.OrderIndex) : 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.Id || 0) - (b.Id || 0);
  });

  const getHeaderTitle = () => {
    if (typeInfo.isWorkshop) {
      return isVirtual ? 'Virtual Workshop Agenda & Labs' : 'Campus Workshop Sessions & Hands-on Agenda';
    }
    if (typeInfo.isSeminar) {
      return isVirtual ? 'Webinar Keynotes & Talk Schedule' : 'Conference Keynotes & Speaker Sessions';
    }
    if (typeInfo.isCodingContest) {
      return isVirtual ? 'Online Contest Schedule & Rounds' : 'On-Campus Coding Rounds & Rules';
    }
    return isVirtual ? 'Virtual Track Milestones & Roadmap' : 'On-Campus Track Milestones & Schedule';
  };

  const getHeaderDesc = () => {
    if (typeInfo.isWorkshop || typeInfo.isSeminar) {
      return isVirtual
        ? 'Schedule for live streams, interactive exercises, code labs & expert Q&A'
        : 'Detailed agenda for venue check-in, speaker presentations, lab practice & certificate award';
    }
    if (typeInfo.isCodingContest) {
      return isVirtual
        ? 'Time limits, problem unlock timings, code submissions and leaderboard freeze'
        : 'Reporting time, coding rounds, algorithmic challenge judging and winners announcement';
    }
    return isVirtual
      ? 'Step-by-step roadmap for cloud sprints, code freezes, mentor check-ins & virtual jury evaluations'
      : 'Complete schedule for reporting, in-person mentorship, build sprint & final demos';
  };

  return (
    <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 space-y-6">
      {/* Section Header matching Event details typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            style={eventTheme ? { backgroundColor: eventTheme.iconBg, color: eventTheme.iconColor } : undefined}
          >
            {typeInfo.isWorkshop || typeInfo.isSeminar ? (
              <BookOpen className="h-5 w-5" />
            ) : isVirtual ? (
              <Globe className="h-5 w-5" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{getHeaderTitle()}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {getHeaderDesc()}
            </p>
          </div>
        </div>

        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold self-start sm:self-auto"
          style={eventTheme ? { backgroundColor: eventTheme.badgeBg, color: eventTheme.badgeText, borderColor: eventTheme.badgeBorder } : undefined}
        >
          <Clock className="h-3.5 w-3.5" style={eventTheme ? { color: eventTheme.iconColor } : undefined} />
          <span>
            {sortedTimelines.length} {typeInfo.isWorkshop || typeInfo.isSeminar ? 'Sessions Planned' : 'Phases Scheduled'}
          </span>
        </div>
      </div>

      {/* Timeline items list */}
      {sortedTimelines.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-50/50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-center">
          <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            Timeline Coming Soon
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Detailed milestone schedule for the {isVirtual ? 'Virtual' : 'On-Campus'} track is being finalized by event administrators.
          </p>
        </div>
      ) : (
        <div className="relative pl-8 sm:pl-10 before:absolute before:left-3.5 sm:before:left-4 before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-200 dark:before:bg-zinc-800 space-y-4">
          {sortedTimelines.map((item, index) => {
            const stepNum = index + 1;
            const padNum = stepNum < 10 ? `0${stepNum}` : `${stepNum}`;

            return (
              <div
                key={item.Id || index}
                className="relative group"
              >
                {/* Node circle on timeline line */}
                <div
                  className="absolute -left-[30px] sm:-left-[34px] top-3.5 w-7 h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black font-mono shadow-xs bg-white dark:bg-black border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 z-10 transition-transform group-hover:scale-105"
                  style={eventTheme ? { borderColor: eventTheme.border, color: eventTheme.accent } : undefined}
                >
                  {padNum}
                </div>

                {/* Milestone card content matching facilities & requirements styling */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-black border border-slate-200 dark:border-zinc-800 transition-all shadow-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 shadow-xs">
                      <Calendar className="h-3.5 w-3.5" style={eventTheme ? { color: eventTheme.iconColor } : undefined} />
                      <span>{item.TimelineDate}</span>
                    </div>

                    <span
                      className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20"
                      style={eventTheme ? { backgroundColor: eventTheme.badgeBg, color: eventTheme.badgeText, borderColor: eventTheme.badgeBorder } : undefined}
                    >
                      Phase {stepNum}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pt-0.5">
                    {item.Heading}
                  </h4>

                  {item.Description && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {item.Description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
