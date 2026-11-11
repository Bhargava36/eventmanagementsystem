const os = require('os');
const db = require('../../config/db');
const dbCircuitBreaker = require('./dbCircuitBreaker');
// Running circular buffer of recent API latencies (last 200 requests)
const MAX_LATENCY_SAMPLES = 200;
const latencySamples = [];
let totalRequestsTracked = 0;
let totalErrorsTracked = 0;
// Record a single request duration for telemetry profiling
const trackRequestMetric = (durationMs, statusCode) => {
    totalRequestsTracked++;
    if (statusCode >= 400) {
        totalErrorsTracked++;
    }
    if (latencySamples.length >= MAX_LATENCY_SAMPLES) {
        latencySamples.shift();
    }
    latencySamples.push(durationMs);
};
// Calculate percentiles (p50, p95, p99) from latency samples
const calculatePercentiles = () => {
    if (latencySamples.length === 0) {
        return { avg: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0 };
    }
    const sorted = [...latencySamples].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / sorted.length);
    const getP = (p) => {
        const idx = Math.floor(sorted.length * p);
        return sorted[Math.min(sorted.length - 1, idx)];
    };
    return {
        avg,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: getP(0.50),
        p95: getP(0.95),
        p99: getP(0.99)
    };
};
// Collect complete system health, resource telemetry, and database connectivity probe
const getSystemHealth = () => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        // If circuit is OPEN, avoid pinging MySQL to respect quota cooldown
        if (dbCircuitBreaker.isOpen()) {
            const dbLatencyMs = 0;
            const dbStatus = 'CIRCUIT_OPEN';
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memUsagePct = Math.round((usedMem / totalMem) * 100);
            const procMem = process.memoryUsage();
            const uptimeSec = Math.floor(process.uptime());
            const hours = Math.floor(uptimeSec / 3600);
            const minutes = Math.floor((uptimeSec % 3600) / 60);
            const seconds = uptimeSec % 60;
            const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;
            const cpus = os.cpus();
            const loadAvg = os.loadavg();
            const cpuUsagePct = Math.min(100, Math.round((loadAvg[0] / Math.max(1, cpus.length)) * 100));
            const latencyStats = calculatePercentiles();
            const errorRatePct = totalRequestsTracked > 0
                ? ((totalErrorsTracked / totalRequestsTracked) * 100).toFixed(1)
                : '0.0';
            return resolve({
                status: 'THROTTLED',
                timestamp: new Date().toISOString(),
                server: {
                    platform: `${os.type()} ${os.release()} (${os.arch()})`,
                    nodeVersion: process.version,
                    uptimeSeconds: uptimeSec,
                    uptimeFormatted: formattedUptime,
                    pid: process.pid
                },
                system: {
                    cpuCount: cpus.length,
                    cpuUsagePercent: cpuUsagePct,
                    loadAverage: loadAvg.map(l => Number(l.toFixed(2))),
                    totalMemoryBytes: totalMem,
                    freeMemoryBytes: freeMem,
                    memoryUsagePercent: memUsagePct,
                    processMemoryBytes: procMem.rss,
                    processHeapUsedBytes: procMem.heapUsed
                },
                database: {
                    status: dbStatus,
                    latencyMs: dbLatencyMs,
                    circuitBreaker: dbCircuitBreaker.getStatus()
                },
                api: {
                    totalRequestsTracked,
                    totalErrorsTracked,
                    errorRatePercent: parseFloat(errorRatePct),
                    avgLatencyMs: latencyStats.avg,
                    p95LatencyMs: latencyStats.p95,
                    p99LatencyMs: latencyStats.p99
                }
            });
        }
        // Test DB roundtrip ping
        db.query('SELECT 1 AS ping', (dbErr) => {
            const dbLatencyMs = Date.now() - startTime;
            const dbStatus = !dbErr ? 'HEALTHY' : 'DEGRADED';
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memUsagePct = Math.round((usedMem / totalMem) * 100);
            const procMem = process.memoryUsage();
            const uptimeSec = Math.floor(process.uptime());
            const hours = Math.floor(uptimeSec / 3600);
            const minutes = Math.floor((uptimeSec % 3600) / 60);
            const seconds = uptimeSec % 60;
            const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;
            const cpus = os.cpus();
            const loadAvg = os.loadavg();
            const cpuUsagePct = Math.min(100, Math.round((loadAvg[0] / Math.max(1, cpus.length)) * 100));
            const latencyStats = calculatePercentiles();
            const errorRatePct = totalRequestsTracked > 0
                ? ((totalErrorsTracked / totalRequestsTracked) * 100).toFixed(1)
                : '0.0';
            resolve({
                status: dbStatus === 'HEALTHY' ? 'OPERATIONAL' : 'DEGRADED',
                timestamp: new Date().toISOString(),
                server: {
                    platform: `${os.type()} ${os.release()} (${os.arch()})`,
                    nodeVersion: process.version,
                    uptimeSeconds: uptimeSec,
                    uptimeFormatted: formattedUptime,
                    pid: process.pid
                },
                cpu: {
                    coreCount: cpus.length,
                    model: cpus[0]?.model || 'Generic Processor',
                    cpuPercent: cpuUsagePct,
                    loadAvg1m: loadAvg[0].toFixed(2),
                    loadAvg5m: loadAvg[1].toFixed(2),
                    loadAvg15m: loadAvg[2].toFixed(2),
                    loadAvg: [loadAvg[0].toFixed(2), loadAvg[1].toFixed(2), loadAvg[2].toFixed(2)]
                },
                memory: {
                    totalMb: Math.round(totalMem / (1024 * 1024)),
                    usedMb: Math.round(usedMem / (1024 * 1024)),
                    freeMb: Math.round(freeMem / (1024 * 1024)),
                    usagePercent: memUsagePct,
                    processHeapUsedMb: Math.round(procMem.heapUsed / (1024 * 1024)),
                    processHeapTotalMb: Math.round(procMem.heapTotal / (1024 * 1024)),
                    processRssMb: Math.round(procMem.rss / (1024 * 1024))
                },
                database: {
                    status: dbStatus,
                    latencyMs: dbLatencyMs,
                    connectionPoolLimit: 8,
                    pool: {
                        connectionLimit: 8,
                        allConnections: db?._allConnections?.length || 1,
                        freeConnections: db?._freeConnections?.length || 1
                    },
                    circuitBreaker: dbCircuitBreaker.getStatus()
                },
                apiPerformance: {
                    totalRequests: totalRequestsTracked,
                    totalErrors: totalErrorsTracked,
                    errorRatePercent: errorRatePct,
                    latencyStats
                },
                // Canonical aliases for direct telemetry monitoring
                os: {
                    cpuPercent: cpuUsagePct,
                    totalMemMb: Math.round(totalMem / (1024 * 1024)),
                    freeMemMb: Math.round(freeMem / (1024 * 1024)),
                    usedMemMb: Math.round(usedMem / (1024 * 1024)),
                    memUsagePercent: memUsagePct,
                    loadAvg: [loadAvg[0].toFixed(2), loadAvg[1].toFixed(2), loadAvg[2].toFixed(2)],
                    uptimeSeconds: Math.floor(os.uptime())
                },
                process: {
                    memoryMb: {
                        heapUsed: Math.round(procMem.heapUsed / (1024 * 1024)),
                        heapTotal: Math.round(procMem.heapTotal / (1024 * 1024)),
                        rss: Math.round(procMem.rss / (1024 * 1024)),
                        external: Math.round((procMem.external || 0) / (1024 * 1024))
                    },
                    uptimeSeconds: uptimeSec,
                    nodeVersion: process.version,
                    pid: process.pid
                },
                networkApi: {
                    totalRequestsSampled: totalRequestsTracked,
                    throughputPerMin: totalRequestsTracked,
                    latency: {
                        p50: latencyStats.p50,
                        p95: latencyStats.p95,
                        p99: latencyStats.p99,
                        avg: latencyStats.avg
                    },
                    errorRatePercent: errorRatePct
                }
            });
        });
    });
};
module.exports = {
    trackRequestMetric,
    getSystemHealth
};
