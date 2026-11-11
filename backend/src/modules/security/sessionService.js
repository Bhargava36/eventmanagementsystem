const crypto = require('crypto');
const db = require('../../config/db');
// Extracts basic device category, OS, and browser from the User-Agent header.
const parseUserAgent = (userAgentString = '') => {
    const ua = (userAgentString || '').toLowerCase();
    // Device category
    let deviceType = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'Tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
        deviceType = 'Mobile';
    }
    // Operating system
    let os = 'Unknown OS';
    if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
    else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
    else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/iphone/i.test(ua)) os = 'iOS';
    else if (/ipad/i.test(ua)) os = 'iPadOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/cros/i.test(ua)) os = 'Chrome OS';
    else if (/linux/i.test(ua)) os = 'Linux';
    // Browser family
    let browser = 'Web Browser';
    if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
    else if (/safari/i.test(ua)) browser = 'Apple Safari';
    return { deviceType, os, browser };
};
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const parseDurationMs = (durationStr, defaultDays = 7) => {
    if (!durationStr || typeof durationStr !== 'string') return defaultDays * 24 * 60 * 60 * 1000;
    const match = durationStr.trim().match(/^(\d+)\s*([smhdwy]?)$/i);
    if (!match) return defaultDays * 24 * 60 * 60 * 1000;
    const val = parseInt(match[1], 10);
    const unit = (match[2] || 'd').toLowerCase();
    switch (unit) {
        case 's': return val * 1000;
        case 'm': return val * 60 * 1000;
        case 'h': return val * 60 * 60 * 1000;
        case 'd': return val * 24 * 60 * 60 * 1000;
        case 'w': return val * 7 * 24 * 60 * 60 * 1000;
        case 'y': return val * 365 * 24 * 60 * 60 * 1000;
        default: return val * 24 * 60 * 60 * 1000;
    }
};

// Inserts a new active session record upon successful authentication.
const createSession = ({ userId, userEmail, userRole, req, expiresInDays = 7 }) => {
    return new Promise((resolve, reject) => {
        try {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = hashToken(rawToken);
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '127.0.0.1';
            const userAgent = req.headers['user-agent'] || 'Unknown Agent';
            const { deviceType, os, browser } = parseUserAgent(userAgent);
            const durationMs = parseDurationMs(process.env.JWT_EXPIRES_IN || `${expiresInDays}d`, expiresInDays);
            const expiresAt = new Date(Date.now() + durationMs);
            const query = `
                INSERT INTO user_sessions (
                    UserId, UserEmail, UserRole, SessionTokenHash, IpAddress,
                    UserAgent, DeviceType, Browser, Os, ExpiresAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(
                query,
                [userId, userEmail, userRole, tokenHash, ipAddress.slice(0, 64), userAgent.slice(0, 500), deviceType, browser, os, expiresAt],
                (err, result) => {
                    if (err) return reject(err);
                    resolve({
                        sessionId: result.insertId,
                        sessionToken: rawToken,
                        deviceType,
                        browser,
                        os,
                        ipAddress,
                        expiresAt
                    });
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};
// Returns active sessions for an individual user, flagging the one in current use.
const getUserSessions = (userId, userRole = null, currentSessionId = null) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT
                Id, UserId, UserEmail, UserRole, IpAddress,
                DeviceType, Browser, Os, LocationCity,
                LastActivityAt, ExpiresAt, IsRevoked, CreatedAt
            FROM user_sessions
            WHERE UserId = ? AND IsRevoked = 0 AND ExpiresAt > NOW()
        `;
        const params = [userId];
        if (userRole) {
            query += ` AND UserRole = ?`;
            params.push(userRole);
        }
        query += ` ORDER BY LastActivityAt DESC`;
        db.query(query, params, (err, rows) => {
            if (err) return reject(err);
            const sessions = rows.map(s => ({
                ...s,
                isCurrent: currentSessionId ? Number(s.Id) === Number(currentSessionId) : false
            }));
            resolve(sessions);
        });
    });
};
// Super Admin overview of all active sessions across the application.
const getAllActiveSessions = ({ page = 1, limit = 20, search = '' }) => {
    return new Promise((resolve, reject) => {
        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
        const offset = (parsedPage - 1) * parsedLimit;
        let whereClause = 'WHERE IsRevoked = 0 AND ExpiresAt > NOW()';
        const params = [];
        if (search && search.trim()) {
            whereClause += ' AND (UserEmail LIKE ? OR IpAddress LIKE ? OR Browser LIKE ? OR Os LIKE ? OR UserRole LIKE ?)';
            const q = `%${search.trim()}%`;
            params.push(q, q, q, q, q);
        }
        const countQuery = `SELECT COUNT(*) AS total FROM user_sessions ${whereClause}`;
        db.query(countQuery, params, (err, countResult) => {
            if (err) return reject(err);
            const total = countResult[0]?.total || 0;
            const dataQuery = `
                SELECT
                    Id, UserId, UserEmail, UserRole, IpAddress,
                    DeviceType, Browser, Os, LocationCity,
                    LastActivityAt, ExpiresAt, IsRevoked, CreatedAt
                FROM user_sessions
                ${whereClause}
                ORDER BY LastActivityAt DESC
                LIMIT ? OFFSET ?
            `;
            db.query(dataQuery, [...params, parsedLimit, offset], (err2, rows) => {
                if (err2) return reject(err2);
                resolve({
                    sessions: rows || [],
                    pagination: {
                        page: parsedPage,
                        limit: parsedLimit,
                        total,
                        totalPages: Math.ceil(total / parsedLimit) || 1
                    }
                });
            });
        });
    });
};
// Revokes a single session by ID. Users can only revoke their own sessions.
const revokeSession = (sessionId, requestingUserId, requestingRole) => {
    return new Promise((resolve, reject) => {
        let query = `UPDATE user_sessions SET IsRevoked = 1 WHERE Id = ?`;
        const params = [sessionId];
        if (requestingRole !== 'super_admin') {
            query += ` AND UserId = ?`;
            params.push(requestingUserId);
        }
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) {
                return reject(new Error('Session not found or permission denied.'));
            }
            resolve({ success: true, message: 'Session revoked successfully.' });
        });
    });
};
// Logs out all devices for a given user, optionally keeping the current device active.
const revokeAllUserSessions = (userId, userRole = null, exceptSessionId = null) => {
    return new Promise((resolve, reject) => {
        let query = `UPDATE user_sessions SET IsRevoked = 1 WHERE UserId = ? AND IsRevoked = 0`;
        const params = [userId];
        if (userRole) {
            query += ` AND LOWER(UserRole) = LOWER(?)`;
            params.push(userRole);
        }
        if (exceptSessionId) {
            query += ` AND Id != ?`;
            params.push(exceptSessionId);
        }
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve({ success: true, revokedCount: result.affectedRows });
        });
    });
};
// Updates the LastActivityAt timestamp on active usage.
const touchSession = (sessionId) => {
    if (!sessionId) return;
    db.query(`UPDATE user_sessions SET LastActivityAt = CURRENT_TIMESTAMP WHERE Id = ? AND IsRevoked = 0`, [sessionId], () => {});
};
module.exports = {
    createSession,
    getUserSessions,
    getAllActiveSessions,
    revokeSession,
    revokeAllUserSessions,
    touchSession,
    parseUserAgent
};
