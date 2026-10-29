import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, ArrowLeft, Palette, Sliders, ShieldAlert, Loader2 } from 'lucide-react';
import IdCardDesigner from '@/features/id_card/components/IdCardDesigner';
import { API_BASE_URL } from '@/lib/api';
import { isSoloTeamSize } from '@/lib/utils';

export default function TeamCardDesignerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getAssignedEventId = () => {
    try {
      return String(JSON.parse(localStorage.getItem('admin') || 'null')?.EventId || '');
    } catch {
      return '';
    }
  };

  const getStoredAdmin = () => {
    try {
      return JSON.parse(localStorage.getItem('admin') || 'null') || {};
    } catch {
      return {};
    }
  };

  const eventId = searchParams.get('eventId')?.trim() || getAssignedEventId();
  const templateId = searchParams.get('templateId')?.trim() || null;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(eventId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load event details.');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const ev = data.event || data.data || data;
          setEvent(ev);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching event for Team Card Designer:', err);
          setError(err.message || 'Unable to check event team settings.');
          // Fallback to localStorage admin TeamSize if available
          const stored = getStoredAdmin();
          if (stored?.TeamSize) {
            setEvent({ TeamSize: stored.TeamSize, EventName: stored.EventName || 'Assigned Event' });
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // Determine if this event is team-based
  const adminData = getStoredAdmin();
  const rawTeamSize = event?.TeamSize || adminData?.TeamSize;
  const isIndividual = isSoloTeamSize(rawTeamSize);
  const isTeamBasedEvent = !isIndividual;

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090b] flex flex-col items-center justify-center text-slate-900 dark:text-white p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Verifying event participation structure...</p>
        </div>
      </div>
    );
  }

  // 2. Disabled View if Individual / Solo Event
  if (!isTeamBasedEvent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090b] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="max-w-xl w-full bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Accent glow backdrop */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Tag */}
          <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-200 dark:border-zinc-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Team-Based Events Only</span>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              Team Size: <span className="font-bold text-amber-600 dark:text-amber-300">{rawTeamSize || 'Individual (1)'}</span>
            </span>
          </div>

          {/* Main Visual */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-zinc-800/80 border border-cyan-200 dark:border-zinc-700/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 shadow-inner">
              <Users className="w-7 h-7 text-cyan-600 dark:text-cyan-400/80" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Team Card Designer is Disabled
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                This event (<span className="text-slate-900 dark:text-zinc-200 font-bold">{event?.EventName || 'Current Event'}</span>) is configured for <span className="text-amber-600 dark:text-amber-400 font-semibold">Individual / Solo participants</span>.
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Team display cards, desk tent placards, and group bench cards are only available for team-based competitions (Team Size ≥ 2). For solo events, each participant uses an individual ID Card.
              </p>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 mb-6 text-xs text-slate-600 dark:text-zinc-400 space-y-2">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>What would you like to do?</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the <strong className="text-emerald-600 dark:text-emerald-400">Participant ID Card Designer</strong> to design attendee badges.</li>
              <li>Or switch the event to a team event in <strong className="text-slate-800 dark:text-zinc-200">Event Settings</strong> if this is meant to be a team hackathon.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/id-card-designer?eventId=${encodeURIComponent(eventId)}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>Go to ID Card Designer</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/admin/settings?eventId=${encodeURIComponent(eventId)}`)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-zinc-700 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Event Settings</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/admin/physical-event?eventId=${encodeURIComponent(eventId)}`)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Dedicated Team Card Designer Studio for Team-based Events
  return (
    <IdCardDesigner
      eventId={eventId}
      initialTemplateId={templateId}
      initialCardType="team_card"
      lockCardType={true}
      onBack={() => {
        navigate(`/admin/physical-event?eventId=${encodeURIComponent(eventId)}`);
      }}
    />
  );
}
