import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  RefreshCw,
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import { getEventTypeInfo, normalizeHackathonMode } from '@/lib/utils';
import useToast from '@/Hooks/useToast';

export function matchesEventType(eventType, targetType) {
  const info = getEventTypeInfo(eventType);
  const target = String(targetType || '').toLowerCase();
  if (target === 'expo' || target === 'project expo') return info.isProjectExpo;
  if (target === 'alumni' || target === 'alumni meet') return info.isAlumni;
  if (target === 'workshop') return info.isWorkshop;
  if (target === 'webinar') return info.isWebinar;
  if (target === 'seminar' || target === 'conference') return info.isSeminar;
  if (target === 'hackathon') return info.isHackathon || info.isCodingContest || info.isTechFest;
  return false;
}

export function getTargetTypeLabel(types = []) {
  if (types.some((t) => matchesEventType(t, 'expo'))) return 'Project Expo';
  if (types.some((t) => matchesEventType(t, 'alumni'))) return 'Alumni Meet';
  if (types.some((t) => matchesEventType(t, 'workshop'))) return 'Workshop';
  if (types.some((t) => matchesEventType(t, 'webinar'))) return 'Webinar';
  if (types.some((t) => matchesEventType(t, 'seminar'))) return 'Seminar / Conference';
  if (types.some((t) => matchesEventType(t, 'hackathon'))) return 'Hackathon';
  return types.join(' / ');
}

export default function AdminEventTypeRoute({ allowedTypes = [], allowedModes = null, children }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  });
  const [switchingId, setSwitchingId] = useState(null);

  useEffect(() => {
    const handleEventUpdate = (e) => {
      try {
        const stored = JSON.parse(localStorage.getItem('admin') || '{}');
        setAdmin(stored);
      } catch {}
    };
    window.addEventListener('admin-event-updated', handleEventUpdate);
    window.addEventListener('storage', handleEventUpdate);
    return () => {
      window.removeEventListener('admin-event-updated', handleEventUpdate);
      window.removeEventListener('storage', handleEventUpdate);
    };
  }, []);

  const activeEventType = admin?.EventType || 'Hackathon';
  const activeTypeInfo = getEventTypeInfo(activeEventType);
  const isTypeAllowed = allowedTypes.length === 0 || allowedTypes.some((t) => matchesEventType(activeEventType, t));

  // If allowedModes is specified (e.g. virtual, physical), verify hackathon mode
  let isModeAllowed = true;
  if (allowedModes && Array.isArray(allowedModes)) {
    const currentMode = normalizeHackathonMode(admin?.HackathonMode, admin?.Location);
    isModeAllowed = Boolean(currentMode && allowedModes.includes(currentMode));
  }

  // If both type and mode are allowed, render children directly
  if (isTypeAllowed && isModeAllowed) {
    return children;
  }

  // Otherwise, inspect admin's assigned events list
  const assignedEvents = Array.isArray(admin?.events) ? admin.events : [];
  const matchingEvents = assignedEvents.filter((ev) => {
    const typeMatch = allowedTypes.length === 0 || allowedTypes.some((t) => matchesEventType(ev.EventType, t));
    if (!typeMatch) return false;
    if (allowedModes && Array.isArray(allowedModes)) {
      const mode = normalizeHackathonMode(ev.HackathonMode, ev.Location);
      return Boolean(mode && allowedModes.includes(mode));
    }
    return true;
  });

  const targetLabel = getTargetTypeLabel(allowedTypes);
  const activeEventName = admin?.EventName || 'Current Active Event';

  const handleSwitchWorkspace = async (targetEvent) => {
    if (!targetEvent || Number(targetEvent.Id) === Number(admin?.EventId)) return;
    setSwitchingId(targetEvent.Id);
    const targetAdminId = admin?.Id || admin?.id;
    const updated = {
      ...admin,
      EventId: targetEvent.Id,
      EventName: targetEvent.EventName,
      HackathonMode: targetEvent.HackathonMode,
      EventType: targetEvent.EventType || 'Hackathon',
      Location: targetEvent.Location,
    };

    try {
      localStorage.setItem('admin', JSON.stringify(updated));
      localStorage.removeItem(`admin_dashboard_cache_${targetEvent.Id}`);
      localStorage.removeItem(`admin_dashboard_cache_${admin?.EventId}`);
    } catch {}

    setAdmin(updated);

    if (targetAdminId) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/switch-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ AdminId: targetAdminId, EventId: targetEvent.Id }),
        });
      } catch (e) {
        console.warn('Backend switch failed:', e);
      }
    }

    window.dispatchEvent(new CustomEvent('admin-event-updated', { detail: targetEvent }));
    toast.success(`Switched workspace to "${targetEvent.EventName}"`);

    // Reload smoothly to activate the newly unlocked route
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-white dark:bg-black rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-8 right-8 h-[3px] bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 rounded-b-full shadow-sm" />

        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Workspace Context Restricted</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white font-heading">
            Exclusive to {targetLabel} Events
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            This management portal is configured strictly for <strong>{targetLabel}</strong> events. Your active workspace is currently focused on:
          </p>

          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-800 dark:text-zinc-200">
            <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate max-w-xs">{activeEventName}</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {activeTypeInfo.label}
            </span>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-5">
          {matchingEvents.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  Assigned {targetLabel} Workspace{matchingEvents.length > 1 ? 's' : ''} ({matchingEvents.length})
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Shift Focus to Unlock
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {matchingEvents.map((ev) => (
                  <div
                    key={ev.Id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {ev.EventName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
                          {ev.EventType || targetLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
                        {ev.StartDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(ev.StartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {ev.Location && (
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {ev.Location}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={switchingId === ev.Id}
                      onClick={() => handleSwitchWorkspace(ev)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {switchingId === ev.Id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Switching...</span>
                        </>
                      ) : (
                        <>
                          <span>Shift Focus & Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
                You do not have organizer permissions for any <strong>{targetLabel}</strong> event.
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Contact the Super Administrator if you need to be assigned to a {targetLabel} event.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Active Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/my-events')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-900 text-xs font-semibold text-gray-800 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>View All My Events</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

