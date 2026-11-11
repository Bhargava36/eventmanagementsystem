// In-memory sliding window rate limiter for endpoint throttling and basic brute-force protection.
class RateLimiter {
    constructor({ windowMs = 60 * 1000, max = 100, message = 'Too many requests, please try again later.', keyGenerator = null }) {
        this.windowMs = windowMs;
        this.max = max;
        this.message = message;
        this.keyGenerator = keyGenerator || ((req) => {
            return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || 'unknown-client';
        });
        this.hits = new Map();
        // Evict expired entries every 2 minutes
        setInterval(() => this.cleanup(), 2 * 60 * 1000).unref();
    }
    cleanup() {
        const now = Date.now();
        for (const [key, timestamps] of this.hits.entries()) {
            const valid = timestamps.filter(t => now - t < this.windowMs);
            if (valid.length === 0) {
                this.hits.delete(key);
            } else {
                this.hits.set(key, valid);
            }
        }
    }
    middleware() {
        return (req, res, next) => {
            if (req.method === 'OPTIONS') return next();
            const key = this.keyGenerator(req);
            const now = Date.now();
            const existing = this.hits.get(key) || [];
            const validHits = existing.filter(t => now - t < this.windowMs);
            if (validHits.length >= this.max) {
                const oldestHit = validHits[0];
                const resetTimeSec = Math.ceil((oldestHit + this.windowMs - now) / 1000);
                res.setHeader('Retry-After', resetTimeSec);
                res.setHeader('RateLimit-Limit', this.max);
                res.setHeader('RateLimit-Remaining', 0);
                res.setHeader('RateLimit-Reset', resetTimeSec);
                return res.status(429).json({
                    success: false,
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: this.message,
                    retryAfterSeconds: resetTimeSec
                });
            }
            validHits.push(now);
            this.hits.set(key, validHits);
            res.setHeader('RateLimit-Limit', this.max);
            res.setHeader('RateLimit-Remaining', Math.max(0, this.max - validHits.length));
            next();
        };
    }
}
// Pre-configured rate limiter instances
const globalLimiter = new RateLimiter({
    windowMs: 60 * 1000,
    max: 300,
    message: 'Global request rate exceeded. Please slow down.'
});
const authLimiter = new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts from this network. Please wait 15 minutes.'
});
const sensitiveLimiter = new RateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: 'Too many operations. Please wait a few minutes before trying again.'
});
module.exports = {
    RateLimiter,
    globalLimiter: globalLimiter.middleware(),
    authLimiter: authLimiter.middleware(),
    sensitiveLimiter: sensitiveLimiter.middleware()
};
