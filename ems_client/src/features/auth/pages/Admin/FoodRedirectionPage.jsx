import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Utensils,
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle2,
  Clock,
  Search,
  MoreVertical,
  MapPin,
  CalendarDays,
  Sun,
  Moon,
  Info,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Drumstick,
  Check,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import useToast from '../../../../Hooks/useToast';
import { API_BASE_URL } from '@/lib/api';

function FoodRedirectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const eventId = searchParams.get('eventId');

  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [allocatingMeal, setAllocatingMeal] = useState(null);

  // Token Scanner / Redemption State
  const [tokenInput, setTokenInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventAndParticipants();
    }
  }, [eventId]);

  const loadEventAndParticipants = async () => {
    try {
      setLoading(true);
      const [evRes, foodRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/events/${eventId}`),
        fetch(`${API_BASE_URL}/api/physical-services/events/${eventId}/food-participants`)
      ]);

      if (evRes.status === 'fulfilled' && evRes.value.ok) {
        const evData = await evRes.value.json();
        setEventData(Array.isArray(evData) ? evData[0] : (evData.event || evData));
      }

      if (foodRes.status === 'fulfilled' && foodRes.value.ok) {
        const foodData = await foodRes.value.json();
        setParticipants(foodData.participants || []);
      }
    } catch (err) {
      console.error('Error loading food participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateTokens = async (mealType) => {
    if (!eventId) {
      toast.error('Event ID is missing');
      return;
    }
    try {
      setAllocatingMeal(mealType);
      const res = await fetch(`${API_BASE_URL}/api/physical-services/events/${eventId}/food-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to allocate tokens');
      toast.success(data.message || `${mealType.toUpperCase()} tokens generated successfully!`);
      loadEventAndParticipants();
    } catch (err) {
      toast.error(err.message || 'Token generation failed');
    } finally {
      setAllocatingMeal(null);
    }
  };

  const handleVerifyToken = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      toast.error('Please enter a food token code');
      return;
    }
    try {
      setVerifying(true);
      setVerifiedToken(null);
      const res = await fetch(`${API_BASE_URL}/api/physical-services/food-tokens/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: clean })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid token code');
      setVerifiedToken(data.tokenInfo);
      if (data.tokenInfo.IsRedeemed) {
        toast.warning(`Notice: Token already redeemed for ${data.tokenInfo.MealType}`);
      } else {
        toast.success(`Token verified for ${data.tokenInfo.UserName}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed');
      setVerifiedToken(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleRedeemToken = async () => {
    if (!verifiedToken?.Token) return;
    try {
      setRedeeming(true);
      const res = await fetch(`${API_BASE_URL}/api/physical-services/food-tokens/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifiedToken.Token })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to redeem token');
      toast.success(data.message || 'Coupon successfully redeemed!');
      setVerifiedToken(data.tokenInfo);
      loadEventAndParticipants();
    } catch (err) {
      toast.error(err.message || 'Redemption error');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 p-4 font-sans text-slate-900 dark:bg-black dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <button
          type="button"
          onClick={() => navigate('/admin/physical-event')}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Physical Event
        </button>

        {/* Event Header Banner */}
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Utensils className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                  Food Catering & Token Distribution
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage meal schedules, generate food coupons, and scan-verify participant tokens at dining counters.
                </p>
              </div>
            </div>
            {eventData && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-300">{eventData.EventName}</span>
                {eventData.EventStartDate && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700 sm:block" />
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {new Date(eventData.EventStartDate).toLocaleDateString()}</span>
                  </>
                )}
                {eventData.Venue && (
                  <>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-zinc-700 sm:block" />
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {eventData.Venue}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadEventAndParticipants}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* FOOD TOKEN VERIFICATION & REDEMPTION TERMINAL */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-white dark:via-zinc-950 to-emerald-500/5 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Food Token Scanner & Redemption Terminal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scan QR code or enter token string (e.g. FD-22-XXXXX) to verify catering eligibility and mark redeemed.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifyToken} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Ticket className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter or scan token code (e.g. FD-22-3B4C5D6E)..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-mono font-bold tracking-wide text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={verifying || !tokenInput.trim()}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {verifying ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Verify Token</span>
            </button>
          </form>

          {/* VERIFIED TOKEN DETAILS CARD */}
          {verifiedToken && (
            <div className={`p-5 rounded-2xl border transition-all ${
              verifiedToken.IsRedeemed
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-mono font-bold">
                      {verifiedToken.Token}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      Meal: {verifiedToken.MealType}
                    </span>
                    {verifiedToken.IsRedeemed ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Already Redeemed
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Valid For Collection
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {verifiedToken.UserName} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({verifiedToken.UserEmail})</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    Team: <strong>{verifiedToken.TeamName}</strong> • Event: <strong>{verifiedToken.EventName}</strong>
                  </p>
                  {verifiedToken.IsRedeemed && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold pt-1">
                      ⚠️ This coupon was already marked redeemed on {new Date(verifiedToken.RedeemedAt).toLocaleString()}. Do NOT issue duplicate meals.
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {!verifiedToken.IsRedeemed && (
                    <button
                      type="button"
                      onClick={handleRedeemToken}
                      disabled={redeeming}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {redeeming ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Utensils className="h-4 w-4" />
                      )}
                      <span>Confirm Meal Redemption</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setVerifiedToken(null); setTokenInput(''); }}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real Allocation Triggers */}
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 xl:flex-row xl:p-8">
          <div className="flex w-full items-start gap-4 xl:w-auto xl:min-w-[280px]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <Clock className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Token Allocation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate tokens for each meal time as per the event schedule.</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 sm:flex-row xl:flex-1">
            <button
              type="button"
              onClick={() => handleAllocateTokens('tiffin')}
              disabled={allocatingMeal === 'tiffin'}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-emerald-700 p-4 text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
            >
              <Sun className="h-6 w-6 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold">{allocatingMeal === 'tiffin' ? 'Generating...' : 'Allocate Tiffin Token'}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleAllocateTokens('lunch')}
              disabled={allocatingMeal === 'lunch'}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10 dark:text-emerald-400 dark:hover:bg-emerald-900/20 cursor-pointer disabled:opacity-50"
            >
              <Utensils className="h-6 w-6 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold">{allocatingMeal === 'lunch' ? 'Generating...' : 'Allocate Lunch Token'}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleAllocateTokens('dinner')}
              disabled={allocatingMeal === 'dinner'}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10 dark:text-emerald-400 dark:hover:bg-emerald-900/20 cursor-pointer disabled:opacity-50"
            >
              <Moon className="h-6 w-6 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-bold">{allocatingMeal === 'dinner' ? 'Generating...' : 'Allocate Dinner Token'}</p>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 p-6 dark:border-zinc-800 sm:p-8 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Registered Teams with Food Opted</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Teams that have selected food and their meal token status</p>
              </div>
            </div>
            
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search team name, lead or college..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-emerald-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm [&_tbody_td:nth-child(4)]:hidden [&_tbody_td:last-child]:hidden [&_thead_tr:first-child_th:nth-child(4)]:hidden [&_thead_tr:first-child_th:last-child]:hidden">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <th rowSpan="2" className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Team Name</th>
                  <th rowSpan="2" className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Team Lead</th>
                  <th rowSpan="2" className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">College / State</th>
                  <th rowSpan="2" className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Food Preference</th>
                  <th colSpan="3" className="border-b border-slate-100 px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-zinc-800 dark:text-slate-500">Token Allocation</th>
                  <th rowSpan="2" className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</th>
                  <th rowSpan="2" className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Actions</th>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Tiffin</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Lunch</th>
                  <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Dinner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        TB
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Tech Blazers</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Rohit Kumar</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">rohit@aitam.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">AITAM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Leaf className="h-3 w-3" /> Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Normal
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Food Complete
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                        AI
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Alpha Innovators</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Sneha Reddy</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">sneha@rguktn.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">RGUKT</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Leaf className="h-3 w-3" /> Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                        Jain
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Food Complete
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-400">
                        CS
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Code Spartans</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Vikram Naidu</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">vikram@svp.ac.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">SVPEC</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <Drumstick className="h-3 w-3" /> Non-Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Normal
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      Partial
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                        BD
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Byte Dreamers</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Priya Sree</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">priya@aitam.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">AITAM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Leaf className="h-3 w-3" /> Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                        Jain
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Food Complete
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-100 font-bold text-pink-700 dark:bg-pink-500/20 dark:text-pink-400">
                        ZX
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Zero X</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Sai Charan</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">saicharan@jntuk.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">JNTUK</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Leaf className="h-3 w-3" /> Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Normal
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Food Complete
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-400">
                        DR
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Dream Runners</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Karthik Varma</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">karthik@svpc.ac.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">SVPEC</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <Drumstick className="h-3 w-3" /> Non-Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Normal
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      Partial
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                        NT
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">NextGen Techies</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Lavanya</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">lavanya@aitam.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">AITAM</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Leaf className="h-3 w-3" /> Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                        Jain
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Food Complete
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>

                <tr className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/20">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                        SK
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">Skywalkers</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-semibold text-slate-900 dark:text-slate-200">Harsha Vardhan</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">harsha@rgukt.edu.in</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-slate-700 dark:text-slate-300">RGUKT</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Andhra Pradesh</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <Drumstick className="h-3 w-3" /> Non-Veg
                      </span>
                      <span className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        Normal
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Allocated
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                      <Clock className="h-3 w-3" />
                      Partial
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-slate-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}

export default FoodRedirectionPage;