const { logActivity } = require('../modules/logs/loggerService');
const { trackRequestMetric } = require('../modules/security/telemetryService');
// Audit Middleware Intercepts mutating requests (POST, PUT, DELETE, PATCH) and error responses (>= 400)
const auditMiddleware = (req, res, next) => {
    // Ignore static assets, health checks, or GET logs polling to avoid self-referential loops
    if (
        req.url.startsWith('/uploads') ||
        req.url.startsWith('/favicon.ico') ||
        req.url.includes('/api/logs') ||
        req.url.includes('/api/super_admin/logs') ||
        req.url.includes('/api/security/health') ||
        req.url.includes('/api/security/monitoring') ||
        req.url.includes('/api/security/database-health') ||
        req.url.includes('/api/security/telemetry') ||
        req.url.includes('/api/notifications')
    ) {
        return next();
    }
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        // Feed real-time telemetry metrics
        trackRequestMetric(duration, res.statusCode);
        const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
        const isError = res.statusCode >= 400;
        // Only log mutating actions or errors
        if (!isMutating && !isError) {
            return;
        }
        let level = 'INFO';
        if (res.statusCode >= 500) level = 'ERROR';
        else if (res.statusCode >= 400) level = 'WARN';
        // Categorize based on URL
        let category = 'SYSTEM';
        const url = req.originalUrl || req.url;
        if (url.includes('/api/super_admin') || url.includes('/api/users/login') || url.includes('/api/users/register') || url.includes('/api/admin/login')) {
            category = 'AUTH';
        } else if (url.includes('/api/events')) {
            category = 'EVENT';
        } else if (url.includes('/api/teams') || url.includes('/api/members') || url.includes('/api/event_reg')) {
            category = 'TEAM';
        } else if (url.includes('/api/users')) {
            category = 'USER';
        } else if (url.includes('/api/admin')) {
            category = 'ADMIN';
        }
        const action = `${req.method}_${url.split('?')[0].replace(/^\/api\//, '').replace(/\//g, '_').toUpperCase()}`;
        let message = `${req.method} ${url} responded with ${res.statusCode} (${duration}ms)`;
        if (isError) {
            message = `API Warning/Error on ${req.method} ${url} [Status ${res.statusCode}]`;
        }
        logActivity({
            level,
            category,
            action: action.slice(0, 100),
            message,
            statusCode: res.statusCode,
            executionTimeMs: duration,
            req
        });
    });
    next();
};
module.exports = auditMiddleware;
