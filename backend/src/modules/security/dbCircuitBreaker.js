// Database Circuit Breaker Protects MySQL from cascading connection quota exhaustion (e.g., Hostinger max_connections_per_hour).
class DatabaseCircuitBreaker {
    constructor({
        failureThreshold = 3,
        cooldownMs = 30000, // 30 seconds in OPEN state
    } = {}) {
        this.failureThreshold = failureThreshold;
        this.cooldownMs = cooldownMs;
        this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
        this.consecutiveFailures = 0;
        this.lastFailureTime = null;
        this.lastStateChange = Date.now();
    }
    // Check if circuit breaker is actively blocking database operations
    isOpen() {
        if (this.state === 'CLOSED') {
            return false;
        }
        const now = Date.now();
        if (this.state === 'OPEN') {
            // Check if cooldown period elapsed
            if (now - this.lastFailureTime > this.cooldownMs) {
                this.state = 'HALF_OPEN';
                this.lastStateChange = now;
                console.info('[CircuitBreaker] Transitioning to HALF_OPEN to probe MySQL health.');
                return false; // Allow probe attempt
            }
            return true;
        }
        // HALF_OPEN: allow limited trial traffic
        return false;
    }
    // Record a connection / database failure
    recordFailure(err) {
        const errorMsg = err?.message || String(err || '');
        const isQuotaOrConnError =
            errorMsg.includes('max_connections_per_hour') ||
            err?.code === 'ER_USER_LIMIT_REACHED' ||
            err?.code === 'ECONNREFUSED' ||
            err?.code === 'PROTOCOL_CONNECTION_LOST';
        if (!isQuotaOrConnError) {
            // Standard query syntax errors or non-connection errors do not trigger circuit trip
            return;
        }
        this.consecutiveFailures++;
        this.lastFailureTime = Date.now();
        if (this.state === 'HALF_OPEN') {
            this.state = 'OPEN';
            this.lastStateChange = Date.now();
            console.warn(`[CircuitBreaker] Probe failed. Circuit re-tripped to OPEN for ${this.cooldownMs / 1000}s.`);
        } else if (this.state === 'CLOSED' && this.consecutiveFailures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.lastStateChange = Date.now();
            console.error(`[CircuitBreaker] Threshold reached (${this.consecutiveFailures} consecutive connection failures). Circuit OPENED for ${this.cooldownMs / 1000}s.`);
        }
    }
    // Record a successful database operation
    recordSuccess() {
        if (this.state === 'HALF_OPEN' || this.consecutiveFailures > 0) {
            this.state = 'CLOSED';
            this.consecutiveFailures = 0;
            this.lastStateChange = Date.now();
            console.info('[CircuitBreaker] MySQL health recovered. Circuit CLOSED.');
        }
    }
    // Get current status for monitoring telemetry
    getStatus() {
        const now = Date.now();
        const cooldownRemaining = this.state === 'OPEN' && this.lastFailureTime
            ? Math.max(0, Math.ceil((this.cooldownMs - (now - this.lastFailureTime)) / 1000))
            : 0;
        return {
            state: this.state,
            consecutiveFailures: this.consecutiveFailures,
            lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
            cooldownRemainingSeconds: cooldownRemaining,
            isOperational: this.state !== 'OPEN'
        };
    }
    // Express middleware: reject requests fast with 503 if circuit is OPEN
    middleware() {
        return (req, res, next) => {
            if (req.method === 'OPTIONS') return next();
            if (this.isOpen()) {
                const status = this.getStatus();
                return res.status(503).json({
                    success: false,
                    error: 'DATABASE_CIRCUIT_OPEN',
                    message: 'Database connection quota protection active. Request throttled to allow database recovery.',
                    retryAfterSeconds: status.cooldownRemainingSeconds || 30
                });
            }
            next();
        };
    }
}
const dbCircuitBreaker = new DatabaseCircuitBreaker({
    failureThreshold: 3,
    cooldownMs: 30000
});
module.exports = dbCircuitBreaker;
