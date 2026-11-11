const db = require('../../config/db');
const dbCircuitBreaker = require('./dbCircuitBreaker');
const cacheService = require('../../utils/cacheService');
const sessionService = require('./sessionService');
const securityAlertService = require('./securityAlertService');
const auditService = require('./auditService');
const telemetryService = require('./telemetryService');
const twoFactorService = require('./twoFactorService');
const captchaService = require('../../utils/captchaService');
// --- Captcha ---
const getCaptcha = (req, res) => {
    try {
        const captcha = captchaService.generateCaptcha();
        return res.status(200).json({ success: true, ...captcha });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to generate CAPTCHA challenge.' });
    }
};
// --- Two-Factor Authentication ---
const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.Id || req.user.id;
        const status = await twoFactorService.get2FAStatus(userId);
        return res.status(200).json({ success: true, ...status });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const requestEnable2FA = async (req, res) => {
    try {
        const userId = req.user.Id || req.user.id;
        const result = await twoFactorService.requestEnable2FA(userId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
const confirmEnable2FA = async (req, res) => {
    try {
        const userId = req.user.Id || req.user.id;
        const { otpCode } = req.body;
        const result = await twoFactorService.confirmEnable2FA(userId, otpCode);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
const disable2FA = async (req, res) => {
    try {
        const userId = req.user.Id || req.user.id;
        const { password } = req.body;
        const result = await twoFactorService.disable2FA(userId, password);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
const verifyLogin2FA = async (req, res) => {
    try {
        const { tempToken, otpCode } = req.body;
        const result = await twoFactorService.verifyLogin2FA(tempToken, otpCode, req);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
// --- Active User Sessions ---
const getMySessions = async (req, res) => {
    try {
        const userId = req.user.Id || req.user.id;
        const userRole = (req.user.role || '').toLowerCase();
        const currentSessionId = req.user.sessionId || null;
        const sessions = await sessionService.getUserSessions(userId, userRole, currentSessionId);
        return res.status(200).json({ success: true, sessions });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getAllSessions = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const data = await sessionService.getAllActiveSessions({ page, limit, search });
        return res.status(200).json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.Id || req.user.id;
        const userRole = (req.user.role || '').toLowerCase();
        const result = await sessionService.revokeSession(sessionId, userId, userRole);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
const logoutCurrentSession = async (req, res) => {
    try {
        const sessionId = req.user?.sessionId;
        const userId = req.user?.Id || req.user?.id;
        const userRole = (req.user?.role || '').toLowerCase();
        if (sessionId) {
            await sessionService.revokeSession(sessionId, userId, userRole);
        }
        return res.status(200).json({ success: true, message: 'Session revoked successfully on logout.' });
    } catch (err) {
        return res.status(200).json({ success: true, message: 'Local session cleared.' });
    }
};
const logoutAllSessions = async (req, res) => {
    try {
        const userId = req.user.Id || req.user.id;
        const userRole = (req.user.role || '').toLowerCase();
        const currentSessionId = req.user.sessionId || null;
        const { keepCurrent = true } = req.body;
        const result = await sessionService.revokeAllUserSessions(userId, userRole, keepCurrent ? currentSessionId : null);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --- Security Alerts & Monitoring ---
const getSecurityOverview = async (req, res) => {
    try {
        const overview = await securityAlertService.getSecurityOverview();
        return res.status(200).json({ success: true, overview });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getSecurityAlerts = async (req, res) => {
    try {
        const { page = 1, limit = 20, severity, status, eventId } = req.query;
        const data = await securityAlertService.getSecurityAlerts({ page, limit, severity, status, eventId });
        return res.status(200).json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const updateAlertStatus = async (req, res) => {
    try {
        const { alertId } = req.params;
        const { status, resolutionNotes } = req.body;
        const assignedToUserId = req.user.Id || req.user.id || null;
        if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });
        const result = await securityAlertService.updateAlertStatus(alertId, status, resolutionNotes, assignedToUserId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};
const getLoginHistory = async (req, res) => {
    try {
        const { page = 1, limit = 25, status, search } = req.query;
        const data = await securityAlertService.getLoginHistory({ page, limit, status, search });
        return res.status(200).json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const unlockAccount = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email identifier is required.' });
        const result = await securityAlertService.unlockAccount(email);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getLockedAccounts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const data = await securityAlertService.getLockedAccounts({ page, limit, search });
        return res.status(200).json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const unlockAllAccounts = async (req, res) => {
    try {
        const result = await securityAlertService.unlockAllAccounts();
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
// --- Audit Trail ---
const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 25, eventId, module: filterModule, action, search, startDate, endDate } = req.query;
        const userRole = (req.user?.role || '').toLowerCase();
        // Enforce event isolation for organizer admins
        let targetEventId = eventId;
        if (userRole === 'admin') {
            targetEventId = req.user.EventId || req.user.eventId;
        }
        const data = await auditService.getAuditLogs({
            page,
            limit,
            eventId: targetEventId,
            module: filterModule,
            action,
            search,
            startDate,
            endDate
        });
        return res.status(200).json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await auditService.getAuditLogById(id);
        const userRole = (req.user?.role || '').toLowerCase();
        if (userRole === 'admin' && log.EventId && Number(log.EventId) !== Number(req.user.EventId)) {
            return res.status(403).json({ success: false, message: 'Access denied to event audit log.' });
        }
        return res.status(200).json({ success: true, log });
    } catch (err) {
        return res.status(404).json({ success: false, message: err.message });
    }
};
// --- System Telemetry & Database Health ---
const getSystemHealth = async (req, res) => {
    try {
        const health = await telemetryService.getSystemHealth();
        return res.status(200).json({ success: true, health });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getDatabaseHealth = async (req, res) => {
    try {
        const pool = db.pool || db;
        const total = pool._allConnections ? pool._allConnections.length : (pool._freeConnections ? pool._freeConnections.length : 0);
        const free = pool._freeConnections ? pool._freeConnections.length : 0;
        const queue = pool._connectionQueue ? pool._connectionQueue.length : 0;
        const circuit = dbCircuitBreaker.getStatus();
        const cache = cacheService.getStats();
        const health = {
            status: !circuit.isOperational ? 'CIRCUIT_OPEN' : (queue > 5 ? 'CONGESTED' : 'HEALTHY'),
            pool: {
                connectionLimit: 8,
                totalConnections: total,
                activeConnections: Math.max(0, total - free),
                idleConnections: free,
                queuedRequests: queue
            },
            circuitBreaker: circuit,
            cache: cache,
            timestamp: new Date().toISOString()
        };
        return res.status(200).json({ success: true, databaseHealth: health });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = {
    getMySessions,
    getAllSessions,
    revokeSession,
    logoutCurrentSession,
    logoutAllSessions,
    getSecurityOverview,
    getSecurityAlerts,
    updateAlertStatus,
    getLoginHistory,
    unlockAccount,
    getLockedAccounts,
    unlockAllAccounts,
    getAuditLogs,
    getAuditLogById,
    getSystemHealth,
    getDatabaseHealth,
    getCaptcha,
    get2FAStatus,
    requestEnable2FA,
    confirmEnable2FA,
    disable2FA,
    verifyLogin2FA
};
