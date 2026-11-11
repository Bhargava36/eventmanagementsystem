const jwt = require('jsonwebtoken');
const db = require('../config/db');
const sessionService = require('../modules/security/sessionService');
const { recordLoginAttempt } = require('../modules/security/securityAlertService');
const JWT_SECRET = process.env.JWT_SECRECT || process.env.JWT_SECRET || 'ayojan_enterprise_secret_2026';
// Validates the Bearer token on incoming requests and verifies that the associated database session hasn't been revoked.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Authorization header missing. Bearer token required.'
        });
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({
            success: false,
            message: 'Malformed authorization header. Format must be: Bearer <token>'
        });
    }
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        // Verify active session state if sessionId is present in payload
        if (decoded.sessionId) {
            db.query(
                'SELECT IsRevoked, ExpiresAt FROM user_sessions WHERE Id = ? LIMIT 1',
                [decoded.sessionId],
                (err, rows) => {
                    if (!err && rows && rows.length > 0) {
                        const session = rows[0];
                        if (session.IsRevoked) {
                            return res.status(401).json({
                                success: false,
                                message: 'Session has been revoked. Please log in again.'
                            });
                        }
                    }
                    next();
                }
            );
        } else {
            // Auto-provision session for legacy valid tokens without an embedded sessionId
            const userId = decoded.Id || decoded.id;
            const email = decoded.Email || decoded.email || decoded.UserName;
            const role = decoded.role || decoded.Role || decoded.RoleName || 'user';
            if (userId && email) {
                db.query(
                    'SELECT Id FROM user_sessions WHERE UserId = ? AND UserRole = ? AND IsRevoked = 0 AND ExpiresAt > NOW() LIMIT 1',
                    [userId, role],
                    (sessErr, sessRows) => {
                        if (!sessErr && (!sessRows || sessRows.length === 0)) {
                            sessionService.createSession({
                                userId,
                                userEmail: email,
                                userRole: role,
                                req
                            }).then((sess) => {
                                decoded.sessionId = sess.sessionId;
                                req.user.sessionId = sess.sessionId;
                                recordLoginAttempt({ userId, email, role, status: 'SUCCESS', req });
                                next();
                            }).catch(() => {
                                next();
                            });
                        } else {
                            if (!sessErr && sessRows && sessRows.length > 0) {
                                decoded.sessionId = sessRows[0].Id;
                                req.user.sessionId = sessRows[0].Id;
                            }
                            next();
                        }
                    }
                );
            } else {
                next();
            }
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            code: 'INVALID_TOKEN',
            message: 'Invalid or corrupted authentication token.'
        });
    }
};
// Optional authentication middleware: populates req.user if a valid token is supplied, but does not block unauthenticated requests.
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return next();
    try {
        const decoded = jwt.verify(parts[1], JWT_SECRET);
        req.user = decoded;
    } catch {
        // Ignored for optional auth
    }
    next();
};
// Role guard: allows access only to specified roles. super_admin automatically passes all role checks.
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required prior to permission evaluation.'
            });
        }
        const userRole = (req.user.role || req.user.Role || req.user.RoleName || '').toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
        if (userRole === 'super_admin' || normalizedAllowed.includes(userRole)) {
            return next();
        }
        return res.status(403).json({
            success: false,
            code: 'FORBIDDEN_ROLE',
            message: `Access denied. Role '${userRole}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`
        });
    };
};
// Ensures event organizers only access resources scoped to their assigned EventId.
const requireEventAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const userRole = (req.user.role || req.user.Role || '').toLowerCase();
    if (userRole === 'super_admin') {
        return next();
    }
    const targetEventId = req.params.eventId || req.params.id || req.body.EventId || req.query.eventId;
    if (!targetEventId) {
        return next();
    }
    const userEventId = req.user.EventId || req.user.eventId;
    if (Number(userEventId) === Number(targetEventId)) {
        return next();
    }
    return res.status(403).json({
        success: false,
        code: 'CROSS_EVENT_ACCESS_DENIED',
        message: `Security Isolation Violation: Admin is not authorized to access Event ID ${targetEventId}.`
    });
};
module.exports = {
    authenticateToken,
    verifyToken: authenticateToken,
    optionalAuth,
    authorizeRoles,
    requireEventAccess,
    JWT_SECRET
};
