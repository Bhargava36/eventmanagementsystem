"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Trophy,
  Calendar,
  Layers,
  Users,
  Activity,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const WAVE_POINTS_COUNT = 18;
const WAVE_STEP_X = 340 / (WAVE_POINTS_COUNT - 1);

function buildWavePaths(timeSec) {
  const pts = [];
  for (let i = 0; i < WAVE_POINTS_COUNT; i++) {
    const progress = i / (WAVE_POINTS_COUNT - 1);
    const x = i * WAVE_STEP_X;
    const baseY = 92 - Math.pow(progress, 1.2) * 70;
    const damp = i === 0 ? 0.35 : 1;
    const ripple =
      (Math.sin(timeSec * 2.1 - i * 0.58) * 9.5 +
        Math.cos(timeSec * 1.35 + i * 0.42) * 5) *
      damp;
    const y = Math.max(10, Math.min(106, baseY + ripple));
    pts.push({ x, y });
  }

  let lineD = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    lineD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(
      1
    )} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const last = pts[pts.length - 1];
  return {
    lineD,
    areaD: `${lineD} L 340 120 L 0 120 Z`,
    endY: last.y,
  };
}

const INITIAL_WAVE = buildWavePaths(0);

function LiveWaveTrendChart({ uid, reduceMotion }) {
  const svgRef = useRef(null);
  const isChartVisible = useInView(svgRef, { amount: 0.05 });
  const areaRef = useRef(null);
  const lineRef = useRef(null);
  const pulseRef = useRef(null);
  const beaconRef = useRef(null);
  const dotRef = useRef(null);
  const dotCoreRef = useRef(null);

  useEffect(() => {
    if (reduceMotion || !isChartVisible) return;

    let rafId = null;
    const startedAt = performance.now();

    const frame = (now) => {
      const t = (now - startedAt) / 1000;
      const { lineD, areaD, endY } = buildWavePaths(t);
      const cyStr = endY.toFixed(2);

      if (areaRef.current) areaRef.current.setAttribute("d", areaD);
      if (lineRef.current) lineRef.current.setAttribute("d", lineD);
      if (pulseRef.current) pulseRef.current.setAttribute("d", lineD);
      if (beaconRef.current) beaconRef.current.setAttribute("cy", cyStr);
      if (dotRef.current) dotRef.current.setAttribute("cy", cyStr);
      if (dotCoreRef.current) dotCoreRef.current.setAttribute("cy", cyStr);

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isChartVisible, reduceMotion]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 340 120"
      className="w-full h-auto overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`trendGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#10b981" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`trendStroke-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="65%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id={`trendPulse-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
          <stop offset="50%" stopColor="#a7f3d0" stopOpacity="1" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        ref={areaRef}
        d={INITIAL_WAVE.areaD}
        fill={`url(#trendGrad-${uid})`}
      />

      <path
        ref={lineRef}
        d={INITIAL_WAVE.lineD}
        stroke={`url(#trendStroke-${uid})`}
        strokeOpacity="0.6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {!reduceMotion && (
        <motion.path
          ref={pulseRef}
          d={INITIAL_WAVE.lineD}
          pathLength="100"
          stroke={`url(#trendPulse-${uid})`}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="28 100"
          animate={{ strokeDashoffset: [28, -100] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {!reduceMotion && (
        <motion.circle
          ref={beaconRef}
          cx="340"
          cy={INITIAL_WAVE.endY}
          r="4"
          stroke="#10b981"
          strokeWidth="1.5"
          fill="none"
          animate={{ r: [4, 14], opacity: [0.7, 0] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      <circle
        ref={dotRef}
        cx="340"
        cy={INITIAL_WAVE.endY}
        r="4"
        fill="#10b981"
      />
      <circle
        ref={dotCoreRef}
        cx="340"
        cy={INITIAL_WAVE.endY}
        r="1.8"
        fill="#ffffff"
      />
    </svg>
  );
}

function formatCompactPrize(amount) {
  const safe = Math.max(0, Number(amount) || 0);
  if (safe >= 10000000) {
    const cr = safe / 10000000;
    const isWhole = Math.abs(cr - Math.round(cr)) < 0.05;
    return {
      value: isWhole ? Math.round(cr) : Number(cr.toFixed(1)),
      suffix: "Cr",
      decimals: isWhole ? 0 : 1,
    };
  }
  if (safe >= 100000) {
    const lakhs = safe / 100000;
    const isWhole = Math.abs(lakhs - Math.round(lakhs)) < 0.05;
    return {
      value: isWhole ? Math.round(lakhs) : Number(lakhs.toFixed(1)),
      suffix: "L",
      decimals: isWhole ? 0 : 1,
    };
  }
  if (safe >= 1000) {
    return {
      value: Math.round(safe / 1000),
      suffix: "K",
      decimals: 0,
    };
  }
  return {
    value: Math.round(safe),
    suffix: "",
    decimals: 0,
  };
}

function formatCounterValue(value, prefix = "", suffix = "", decimals = 0) {
  const num = Math.max(0, Number(value) || 0);
  const formatted =
    decimals > 0
      ? num.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.round(num).toLocaleString("en-IN");
  return `${prefix}${formatted}${suffix}`;
}

function SmoothCounter({ value = 0, prefix = "", suffix = "", decimals = 0 }) {
  const spanRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(spanRef, { once: true, margin: "-40px" });

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;
    const target = Math.max(0, Number(value) || 0);

    if (reduceMotion || !isInView) {
      node.textContent = formatCounterValue(target, prefix, suffix, decimals);
      return;
    }

    const duration = 900;
    const start = performance.now();
    let rafId = null;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = formatCounterValue(target * eased, prefix, suffix, decimals);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        node.textContent = formatCounterValue(target, prefix, suffix, decimals);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, prefix, suffix, decimals, isInView, reduceMotion]);

  return (
    <span ref={spanRef}>
      {formatCounterValue(value, prefix, suffix, decimals)}
    </span>
  );
}

export default function PlatformStatsSection() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const isSectionInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    const endpoints = [
      `${API_BASE_URL}/api/events/public-stats`,
      "/api/events/public-stats",
    ];
    let lastErr = null;
    for (const url of endpoints) {
      try {
        const startedAt = performance.now();
        const res = await fetch(url);
        if (!res.ok) {
          lastErr = new Error(`HTTP ${res.status}`);
          continue;
        }
        const data = await res.json();
        const clientLatencyMs = Math.max(1, Math.round(performance.now() - startedAt));
        if (data?.stats) {
          return {
            ...data.stats,
            clientLatencyMs,
          };
        }
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("Unable to load platform statistics");
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadStats()
      .then((s) => {
        if (!cancelled) {
          setStats(s);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Unable to load platform statistics");
          setStats(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadStats]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await loadStats();
      setStats(s);
    } catch (err) {
      setError(err?.message || "Unable to load platform statistics");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const totalPrizeAmount = Math.max(0, Number(stats?.totalPrizeMoney ?? 0));
  const prizeParts = formatCompactPrize(totalPrizeAmount);
  const prizeCompactLabel = formatCounterValue(
    prizeParts.value,
    "₹",
    prizeParts.suffix,
    prizeParts.decimals
  );
  const totalEvents = Math.max(0, Number(stats?.eventsCount ?? 0));
  const totalTeams = Math.max(0, Number(stats?.teamsCount ?? 0));
  const totalUsers = Math.max(0, Number(stats?.usersCount ?? stats?.buildersCount ?? 0));

  const serverLatency = Number(stats?.medianLatencyMs);
  const clientLatency = Number(stats?.clientLatencyMs);
  const latencyMs =
    Number.isFinite(serverLatency) && serverLatency > 0
      ? Math.round(serverLatency)
      : Number.isFinite(clientLatency) && clientLatency > 0
        ? Math.round(clientLatency)
        : 0;

  const apiAccuracy =
    typeof stats?.apiSuccessRate === "number" && Number.isFinite(stats.apiSuccessRate)
      ? stats.apiSuccessRate
      : 100;

  const secondaryMetrics = [
    {
      label: "Events Organized",
      value: totalEvents,
      suffix: "",
      decimals: 0,
      iconEl: <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      delay: 0.12,
    },
    {
      label: "Registered Teams",
      value: totalTeams,
      suffix: "",
      decimals: 0,
      iconEl: <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      delay: 0.18,
    },
    {
      label: "Registered Users",
      value: totalUsers,
      suffix: "",
      decimals: 0,
      iconEl: <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      delay: 0.24,
    },
    {
      label: "Response Latency",
      value: latencyMs,
      suffix: " ms",
      decimals: 0,
      iconEl: <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      delay: 0.3,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative w-full bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 py-20 sm:py-28 overflow-hidden border-t border-slate-200/70 dark:border-zinc-800/80 scroll-mt-20 selection:bg-emerald-500 selection:text-white"
    >
      <div className="w-full md:max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: Heading, Live Summary, Pill CTA, Emerald Line Trend Visual */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <motion.h2
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]"
              >
                Platform Scale <br className="hidden sm:inline" />
                &amp; Live Reliability
              </motion.h2>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed mt-4 sm:mt-5 max-w-md"
              >
                {loading ? (
                  <span className="inline-block h-4 w-64 rounded bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                ) : error ? (
                  "Live database totals are temporarily unavailable."
                ) : (
                  <>
                    Across {totalEvents.toLocaleString("en-IN")} organized events,{" "}
                    {prizeCompactLabel} in prize pools, and{" "}
                    {totalUsers.toLocaleString("en-IN")} registered users — served at{" "}
                    {latencyMs} ms response latency with {apiAccuracy}% API accuracy.
                  </>
                )}
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3"
              >
                <Link
                  to="/events"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm active:translate-y-0"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-3.5 h-3.5 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5" />
                </Link>

                {error && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500/60 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                )}
              </motion.div>
            </div>

            {/* Emerald Line Trend Graph Emblem */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 sm:mt-12 w-full max-w-[340px]"
            >
              <div className="flex items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400 mb-3">
                <div className="inline-flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Platform Growth</span>
                </div>
                {!loading && !error && (
                  <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{apiAccuracy}% Accuracy</span>
                  </div>
                )}
              </div>

              <LiveWaveTrendChart
                uid={uid}
                reduceMotion={Boolean(reduceMotion)}
              />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Huge Primary Prize Metric + 2x2 Grid with Clean Icons */}
          <div className="lg:col-span-7 flex flex-col justify-start lg:pl-10">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {loading ? (
                <div className="h-16 sm:h-20 lg:h-24 w-64 sm:w-80 rounded-2xl bg-slate-100 dark:bg-zinc-900 animate-pulse" />
              ) : error ? (
                <div className="font-heading text-5xl sm:text-6xl font-bold text-slate-300 dark:text-zinc-700 leading-none">
                  —
                </div>
              ) : (
                <div
                  className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-none"
                  style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
                >
                  <SmoothCounter
                    value={prizeParts.value}
                    prefix="₹"
                    suffix={prizeParts.suffix}
                    decimals={prizeParts.decimals}
                  />
                </div>
              )}

              <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium">
                <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Cumulative Event Prize Pools</span>
              </div>
            </motion.div>

            {/* 2x2 Secondary Metrics Grid */}
            <div className="mt-10 sm:mt-14 pt-10 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-x-8 sm:gap-x-14 gap-y-8 sm:gap-y-12">
              {secondaryMetrics.map((metric) => (
                <motion.div
                  key={metric.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={isSectionInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: metric.delay,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {loading ? (
                    <div className="h-10 w-20 rounded-xl bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                  ) : error ? (
                    <div className="font-heading text-3xl sm:text-4xl font-bold text-slate-300 dark:text-zinc-700 leading-none">
                      —
                    </div>
                  ) : (
                    <div
                      className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-none"
                      style={{ fontVariantNumeric: "lining-nums tabular-nums" }}
                    >
                      <SmoothCounter
                        value={metric.value}
                        suffix={metric.suffix}
                        decimals={metric.decimals}
                      />
                    </div>
                  )}

                  <div className="mt-2 sm:mt-2.5 flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium">
                    {metric.iconEl}
                    <span>{metric.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
