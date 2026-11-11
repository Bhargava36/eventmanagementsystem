import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '@/lib/api';
import useToast from '../../../../Hooks/useToast';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  Utensils,
  RefreshCw,
  X,
  Volume2,
  VolumeX,
  ShieldCheck,
  Building,
  GraduationCap,
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}
function playWarningChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch {}
}
export default function AlumniAttendancePage() {
  const toast = useToast();
  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}');
    } catch {
      return {};
    }
  }, []);
  const eventId = admin?.EventId;
  // Mode: 'GATE' | 'FOOD'
  const [scanMode, setScanMode] = useState('GATE');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Live Camera Scanner State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [lastScannedResult, setLastScannedResult] = useState(null);
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const loadData = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/registrations`);
      if (!res.ok) throw new Error('Failed to load roster');
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  }, [eventId, toast]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  // Handle Scan Verification
  const processScanData = async (rawString) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    try {
      let teamId = null;
      let userId = null;
      try {
        const parsed = JSON.parse(rawString);
        teamId = parsed.teamId || parsed.TeamId || null;
        userId = parsed.userId || parsed.UserId || null;
      } catch {
        const num = Number(rawString.trim());
        if (!isNaN(num) && num > 0) {
          teamId = num;
        }
      }
      if (!teamId && !userId) {
        if (soundEnabled) playWarningChime();
        setLastScannedResult({
          success: false,
          title: 'Unrecognized QR Format',
          message: `Scanned data "${rawString.slice(0, 40)}" is not a valid Alumni Pass QR.`
        });
        toast.error('Invalid QR code');
        return;
      }
      if (scanMode === 'GATE') {
        const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, userId })
        });
        const data = await res.json();
        if (!res.ok) {
          if (soundEnabled) playWarningChime();
          setLastScannedResult({
            success: false,
            title: 'Gate Check-In Failed',
            message: data.message || 'Alumnus not found in registration database.'
          });
          toast.error(data.message || 'Check-in failed');
        } else {
          if (soundEnabled) playSuccessChime();
          const al = data.alumnus || {};
          setLastScannedResult({
            success: true,
            title: 'Gate Check-In Approved!',
            alumnus: al,
            message: `${al.UserName || 'Alumnus'} (Class of ${al.GraduationYear || 'Alumni'}) verified at Entrance Gate.`
          });
          toast.success(`Checked In: ${al.UserName || 'Alumnus'}`);
          loadData();
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/alumni/${eventId}/food-scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamId, userId })
        });
        const data = await res.json();
        if (!res.ok) {
          if (soundEnabled) playWarningChime();
          setLastScannedResult({
            success: false,
            title: 'Food Token Invalid / Already Used',
            message: data.message || 'This meal token has already been redeemed.'
          });
          toast.error(data.message || 'Food scan failed');
        } else {
          if (soundEnabled) playSuccessChime();
          const al = data.alumnus || {};
          const totalPlates = 1 + (Number(al.GuestCount) || 0);
          setLastScannedResult({
            success: true,
            title: 'Banquet Meal Token Approved!',
            alumnus: al,
            message: `Authorized ${totalPlates} meal plate(s) for ${al.UserName || 'Alumnus'} & guests.`
          });
          toast.success(`Food Token Approved: ${totalPlates} Plate(s)`);
          loadData();
        }
      }
    } catch (err) {
      console.error('Scan error:', err);
      if (soundEnabled) playWarningChime();
      toast.error('Network or server error during scan verification');
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000);
    }
  };
  // HTML5 Camera Scanner Lifecycle
  const startScanner = async () => {
    setScannerOpen(true);
    setLastScannedResult(null);
    setTimeout(async () => {
      try {
        if (!scannerRef.current) {
          const html5QrCode = new Html5Qrcode('alumni-qr-reader');
          scannerRef.current = html5QrCode;
          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              processScanData(decodedText);
            },
            () => {}
          );
          setScanning(true);
        }
      } catch (err) {
        console.error('Camera startup error:', err);
        toast.error('Could not access camera. Please check browser permissions.');
        setScannerOpen(false);
      }
    }, 300);
  };
  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.warn('Scanner stop error:', err);
    } finally {
      setScanning(false);
      setScannerOpen(false);
    }
  };
  const handleManualAction = (alumnus, type) => {
    processScanData(String(alumnus.TeamId));
  };
  const handleManualInputSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processScanData(manualInput.trim());
    setManualInput('');
  };
  // Stats calculation
  const totalRegistered = registrations.length;
  const gateCheckedIn = registrations.filter((r) => r.GateCheckInStatus === 'CheckedIn').length;
  const foodScanned = registrations.filter((r) => Boolean(r.FoodTokenScanned)).length;
  const checkInRate = totalRegistered > 0 ? Math.round((gateCheckedIn / totalRegistered) * 100) : 0;
  const foodRate = totalRegistered > 0 ? Math.round((foodScanned / totalRegistered) * 100) : 0;
  // Filtered List for Table
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        (r.UserName || '').toLowerCase().includes(q) ||
        (r.Email || '').toLowerCase().includes(q) ||
        (r.GraduationYear || '').toLowerCase().includes(q) ||
        String(r.TeamId || '').includes(q)
      );
    });
  }, [registrations, searchQuery]);
  const scannerTabs = [
    { id: 'GATE', label: 'Main Entrance Gate Check-in', count: `${gateCheckedIn}/${totalRegistered}`, icon: QrCode },
    { id: 'FOOD', label: 'Banquet & Gala Food Token', count: `${foodScanned}/${totalRegistered}`, icon: Utensils },
  ];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <QrCode className="w-4 h-4" />
            <span>Live Event Day Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-gray-900 dark:text-white">
            Gate Entry &amp; Banquet Food Scanner
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Scan physical or digital QR passes for lightning-fast arrival check-in and gala dinner token validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all text-gray-600 dark:text-zinc-300 cursor-pointer"
            title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={startScanner}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Launch Live Camera Scanner
          </button>
        </div>
      </div>
      {/* Application Signature Folder Tabs for Scanner Modes */}
      <div className="relative pt-2">
        <div className="flex items-end gap-2 px-2 sm:px-4 relative z-10 -mb-px overflow-x-auto">
          {scannerTabs.map((tab) => {
            const isActive = scanMode === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setScanMode(tab.id)}
                className="relative h-12 px-5 sm:px-7 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none cursor-pointer shrink-0"
              >
                {isActive ? (
                  <motion.div
                    layoutId="alumniScannerTabFolder"
                    className="absolute inset-0 rounded-t-2xl bg-white dark:bg-black border-t border-x border-b-0 border-gray-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  >
                    <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-emerald-500 rounded-b-full shadow-[0_1px_6px_rgba(16,185,129,0.5)]" />
                    <div className="absolute -bottom-[2px] left-0 right-0 h-[4px] bg-white dark:bg-black pointer-events-none z-20" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 rounded-t-2xl bg-gray-100 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800/80 z-0" />
                )}
                <span className={`relative z-20 flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
                }`}>
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span className="text-xs text-slate-400">
                    ({tab.count})
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {/* Tab Content Box with matching border */}
        <div className="rounded-3xl rounded-tl-none border border-gray-200 dark:border-zinc-800 bg-white dark:bg-black p-6 shadow-sm space-y-6">
          {/* Active Mode Banner & Progress */}
          <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                {scanMode === 'GATE' ? 'Mode 1: Gate Admission Progress' : 'Mode 2: Banquet Meals Served'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {scanMode === 'GATE' ? gateCheckedIn : foodScanned}
                </span>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  / {totalRegistered} Verified ({scanMode === 'GATE' ? checkInRate : foodRate}%)
                </span>
              </div>
            </div>
            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                <span>Progress</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {scanMode === 'GATE' ? checkInRate : foodRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scanMode === 'GATE' ? checkInRate : foodRate}%` }}
                />
              </div>
            </div>
          </div>
          {/* Manual Input Bar */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleManualInputSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Manual Entry: Type Registration ID # or Email"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shrink-0 shadow-xs cursor-pointer"
              >
                Process {scanMode === 'GATE' ? 'Gate' : 'Food'}
              </button>
            </form>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search alumni table below..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          {/* Roster & Quick Action Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/70 dark:bg-black border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Reg ID</th>
                    <th className="p-4">Alumnus Name</th>
                    <th className="p-4">Class Year</th>
                    <th className="p-4">Guests</th>
                    <th className="p-4">Gate Status</th>
                    <th className="p-4">Banquet Token</th>
                    <th className="p-4 text-right">Quick Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 dark:text-zinc-500">
                        No alumni records found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((r) => {
                      const isCheckedIn = r.GateCheckInStatus === 'CheckedIn';
                      const isFoodClaimed = Boolean(r.FoodTokenScanned);
                      return (
                        <tr
                          key={r.TeamId}
                          className="hover:bg-gray-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                        >
                          <td className="p-4 font-mono font-bold text-gray-400 dark:text-zinc-500">
                            #{r.TeamId}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {r.UserName || 'Alumnus'}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-zinc-500">{r.Email}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Class of {r.GraduationYear || 'N/A'}
                            </span>
                          </td>
                          <td className="p-4">
                            {Number(r.GuestCount) > 0 ? (
                              <span className="font-semibold text-blue-500">
                                +{r.GuestCount} ({r.GuestNames || 'Guest'})
                              </span>
                            ) : (
                              <span className="text-slate-400">Solo</span>
                            )}
                          </td>
                          <td className="p-4">
                            {isCheckedIn ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Checked In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock className="w-3.5 h-3.5" />
                                Registered
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {isFoodClaimed ? (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                • Claimed ✓
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">• Unclaimed</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {scanMode === 'GATE' ? (
                              <button
                                onClick={() => handleManualAction(r, 'GATE')}
                                disabled={isCheckedIn}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                  isCheckedIn
                                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                }`}
                              >
                                {isCheckedIn ? 'Checked In' : 'Check In Gate'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleManualAction(r, 'FOOD')}
                                disabled={isFoodClaimed}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                  isFoodClaimed
                                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                }`}
                              >
                                {isFoodClaimed ? 'Claimed' : 'Authorize Meal'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* LIVE CAMERA SCANNER MODAL */}
      <AnimatePresence>
        {scannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                    Scanning: {scanMode === 'GATE' ? 'Gate Admission QR' : 'Banquet Meal Token'}
                  </h3>
                </div>
                <button
                  onClick={stopScanner}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Camera Video Viewport */}
              <div className="relative overflow-hidden rounded-2xl bg-black aspect-square border-2 border-dashed border-emerald-500/40 flex items-center justify-center">
                <div id="alumni-qr-reader" className="w-full h-full" />
              </div>
              {/* Last Scanned Feedback Banner */}
              {lastScannedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border text-xs space-y-1 ${
                    lastScannedResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {lastScannedResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0" />
                    )}
                    {lastScannedResult.title}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {lastScannedResult.message}
                  </p>
                </motion.div>
              )}
              <div className="text-center">
                <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                  Align the participant's QR pass inside the target viewfinder.
                </p>
                <button
                  onClick={stopScanner}
                  className="mt-3 w-full py-2.5 rounded-xl font-bold text-xs bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 transition-all cursor-pointer"
                >
                  Close Camera Scanner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
