const db = require('../../config/db');
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
// Check if an email/identifier is currently locked out
const isAccountLocked = (identifier) => {
    return new Promise((resolve) => {
        const cleanId = (identifier || '').trim().toLowerCase();
        if (!cleanId) return resolve({ locked: false });
        const query = `
            SELECT AttemptCount, LockedUntil,
                   TIMESTAMPDIFF(MINUTE, NOW(), LockedUntil) AS RemainingMinutes
            FROM failed_login_attempts
            WHERE Identifier = ? AND LockedUntil > NOW()
            LIMIT 1
        `;
        db.query(query, [cleanId], (err, rows) => {
            if (err || !rows || rows.length === 0) {
                return resolve({ locked: false });
            }
            const record = rows[0];
            resolve({
                locked: true,
                lockedUntil: record.LockedUntil,
                remainingMinutes: Math.max(1, record.RemainingMinutes || 1)
            });
        });
    });
};
// Manually unlock an account (Super Admin action)
const unlockAccount = (identifier) => {
    return new Promise((resolve, reject) => {
        const cleanId = (identifier || '').trim().toLowerCase();
        db.query(`DELETE FROM failed_login_attempts WHERE Identifier = ?`, [cleanId], (err) => {
            if (err) return reject(err);
            resolve({ success: true, message: `Account ${cleanId} unlocked successfully.` });
        });
    });
};

// Manually unlock all currently locked accounts (Super Admin emergency action)
const unlockAllAccounts = () => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM failed_login_attempts WHERE LockedUntil > NOW()`, (err, result) => {
            if (err) return reject(err);
            resolve({
                success: true,
                message: `Unlocked ${result.affectedRows || 0} account(s) successfully.`,
                unlockedCount: result.affectedRows || 0
            });
        });
    });
};

// Retrieve all currently locked accounts with remaining lockout countdown & user identity
const getLockedAccounts = ({ page = 1, limit = 10, search = '' } = {}) => {
    return new Promise((resolve, reject) => {
        const p = Math.max(1, parseInt(page, 10) || 1);
        const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const offset = (p - 1) * lim;

        let whereClause = 'WHERE fla.LockedUntil > NOW()';
        const params = [];

        if (search && search.trim()) {
            whereClause += ' AND (LOWER(fla.Identifier) LIKE ? OR LOWER(u.UserName) LIKE ?)';
            const q = `%${search.trim().toLowerCase()}%`;
            params.push(q, q);
        }

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM failed_login_attempts fla
            LEFT JOIN users u ON LOWER(u.Email) = LOWER(fla.Identifier)
            ${whereClause}
        `;

        db.query(countQuery, params, (err, countRes) => {
            if (err) return reject(err);
            const total = countRes[0]?.total || 0;

            const dataQuery = `
                SELECT 
                    fla.Id,
                    fla.Identifier AS Email,
                    fla.AttemptCount,
                    fla.FirstAttemptAt,
                    fla.LastAttemptAt,
                    fla.LockedUntil,
                    TIMESTAMPDIFF(MINUTE, NOW(), fla.LockedUntil) AS RemainingMinutes,
                    TIMESTAMPDIFF(SECOND, NOW(), fla.LockedUntil) AS RemainingSeconds,
                    COALESCE(u.UserName, 'Unregistered / Unknown') AS UserName,
                    COALESCE(r.RoleName, 'User') AS RoleName
                FROM failed_login_attempts fla
                LEFT JOIN users u ON LOWER(u.Email) = LOWER(fla.Identifier)
                LEFT JOIN roles r ON u.RoleId = r.Id
                ${whereClause}
                ORDER BY fla.LockedUntil DESC
                LIMIT ? OFFSET ?
            `;

            db.query(dataQuery, [...params, lim, offset], (dataErr, rows) => {
                if (dataErr) return reject(dataErr);
                resolve({
                    accounts: rows || [],
                    pagination: {
                        page: p,
                        limit: lim,
                        total,
                        totalPages: Math.ceil(total / lim) || 1
                    }
                });
            });
        });
    });
};
// Record every login attempt and manage brute-force progressive lockouts
const recordLoginAttempt = async ({ userId = null, email, role = null, status, failureReason = null, req = null }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const ip = req?.headers['x-forwarded-for']?.split(',')[0]?.trim() || req?.socket?.remoteAddress || req?.ip || '127.0.0.1';
    const ua = req?.headers['user-agent'] || 'Unknown';
    // 1. Insert into login_history table
    db.query(
        `INSERT INTO login_history (UserId, AttemptedEmail, Role, Status, IpAddress, UserAgent, FailureReason)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, cleanEmail, role, status, ip.slice(0, 64), ua.slice(0, 500), failureReason],
        (err) => {
            if (err && !err.message?.includes('max_connections_per_hour')) {
                console.error('[SecurityService] Failed to record login history:', err.message);
            }
        }
    );
    // 2. Manage failed login counters
    if (status === 'SUCCESS') {
        // Reset failed counter upon successful authentication
        db.query(`DELETE FROM failed_login_attempts WHERE Identifier = ?`, [cleanEmail], (err) => {
            if (err && !err.message?.includes('max_connections_per_hour')) {
                console.error('[SecurityService] Failed to reset failed attempts counter:', err.message);
            }
        });
    } else if (['FAILED_PASSWORD', 'INVALID_USER'].includes(status)) {
        // Increment failure counter
        db.query(
            `INSERT INTO failed_login_attempts (Identifier, AttemptCount, FirstAttemptAt, LastAttemptAt)
             VALUES (?, 1, NOW(), NOW())
             ON DUPLICATE KEY UPDATE AttemptCount = AttemptCount + 1, LastAttemptAt = NOW()`,
            [cleanEmail],
            (err) => {
                if (err) {
                    if (!err.message?.includes('max_connections_per_hour')) {
                        console.error('[SecurityService] Failed to increment failed login attempt:', err.message);
                    }
                    return;
                }
                // Check if threshold breached
                db.query(`SELECT AttemptCount FROM failed_login_attempts WHERE Identifier = ?`, [cleanEmail], (chkErr, rows) => {
                    if (!chkErr && rows && rows.length > 0) {
                        const count = rows[0].AttemptCount;
                        if (count >= MAX_FAILED_ATTEMPTS) {
                            // Lock account
                            db.query(
                                `UPDATE failed_login_attempts
                                 SET LockedUntil = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                                 WHERE Identifier = ?`,
                                [LOCKOUT_DURATION_MINUTES, cleanEmail],
                                () => {}
                            );
                            // Raise Security Alert
                            raiseAlert({
                                alertCode: 'AUTH_BRUTE_FORCE',
                                severity: 'HIGH',
                                title: `Account Locked: Repeated Login Failures (${cleanEmail})`,
                                description: `Account '${cleanEmail}' was temporarily locked for ${LOCKOUT_DURATION_MINUTES} minutes after ${count} consecutive failed login attempts from IP ${ip}.`,
                                sourceIp: ip,
                                metadata: { attemptedEmail: cleanEmail, attempts: count, ip, userAgent: ua }
                            });
                        }
                    }
                });
            }
        );
    }
};
// Raise a structured incident alert in security_alerts
const raiseAlert = ({
    alertCode,
    severity = 'MEDIUM',
    title,
    description,
    eventId = null,
    targetUserId = null,
    sourceIp = null,
    metadata = null
}) => {
    return new Promise((resolve) => {
        const normMeta = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
        const query = `
            INSERT INTO security_alerts (
                AlertCode, Severity, Title, Description, EventId,
                TargetUserId, SourceIp, Metadata, Status, CreatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', NOW())
        `;
        db.query(
            query,
            [alertCode, severity.toUpperCase(), title, description, eventId, targetUserId, sourceIp ? String(sourceIp).slice(0, 64) : null, normMeta],
            (err, res) => {
                if (err) {
                    console.error('[SecurityAlerts] Failed to record alert:', err.message);
                    return resolve(null);
                }
                resolve({ alertId: res.insertId });
            }
        );
    });
};
// Paginated query for security alerts with filters and severity summary counts
const getSecurityAlerts = ({ page = 1, limit = 20, severity, status, eventId }) => {
    return new Promise((resolve, reject) => {
        let where = 'WHERE 1=1';
        const params = [];
        if (severity && severity !== 'ALL') {
            where += ' AND Severity = ?';
            params.push(severity);
        }
        if (status && status !== 'ALL') {
            where += ' AND Status = ?';
            params.push(status);
        }
        if (eventId) {
            where += ' AND EventId = ?';
            params.push(eventId);
        }
        const countSql = `SELECT COUNT(*) AS total FROM security_alerts ${where}`;
        db.query(countSql, params, (err, countRows) => {
            if (err) return reject(err);
            const total = countRows[0]?.total || 0;
            const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
            const dataSql = `
                SELECT
                    sa.*,
                    u.UserName AS TargetUserName,
                    e.EventName
                FROM security_alerts sa
                LEFT JOIN users u ON sa.TargetUserId = u.Id
                LEFT JOIN events e ON sa.EventId = e.Id
                ${where}
                ORDER BY sa.CreatedAt DESC
                LIMIT ? OFFSET ?
            `;
            db.query(dataSql, [...params, parseInt(limit, 10), offset], (dataErr, rows) => {
                if (dataErr) return reject(dataErr);
                // Fetch severity stats
                db.query(`
                    SELECT
                        Severity, COUNT(*) AS count
                    FROM security_alerts
                    WHERE Status IN ('OPEN', 'INVESTIGATING')
                    GROUP BY Severity
                `, (statErr, statRows) => {
                    const stats = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, TOTAL_OPEN: 0 };
                    if (!statErr && statRows) {
                        statRows.forEach(r => {
                            stats[r.Severity] = r.count;
                            stats.TOTAL_OPEN += r.count;
                        });
                    }
                    resolve({
                        alerts: rows,
                        pagination: {
                            page: parseInt(page, 10),
                            limit: parseInt(limit, 10),
                            total,
                            totalPages: Math.ceil(total / parseInt(limit, 10)) || 1
                        },
                        stats
                    });
                });
            });
        });
    });
};
// Update status & resolution of a security alert
const updateAlertStatus = (alertId, status, resolutionNotes, assignedToUserId = null) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE security_alerts
            SET Status = ?,
                ResolutionNotes = COALESCE(?, ResolutionNotes),
                AssignedToUserId = COALESCE(?, AssignedToUserId),
                ResolvedAt = CASE WHEN ? IN ('RESOLVED', 'FALSE_POSITIVE') THEN NOW() ELSE ResolvedAt END
            WHERE Id = ?
        `;
        db.query(query, [status, resolutionNotes, assignedToUserId, status, alertId], (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) return reject(new Error('Alert not found.'));
            resolve({ success: true, message: `Alert status updated to ${status}.` });
        });
    });
};
// Paginated query for login history audit trail
const getLoginHistory = ({ page = 1, limit = 25, status, search }) => {
    return new Promise((resolve, reject) => {
        let where = 'WHERE 1=1';
        const params = [];
        if (status && status !== 'ALL') {
            where += ' AND Status = ?';
            params.push(status);
        }
        if (search) {
            where += ' AND (AttemptedEmail LIKE ? OR IpAddress LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        const countSql = `SELECT COUNT(*) AS total FROM login_history ${where}`;
        db.query(countSql, params, (err, countRows) => {
            if (err) return reject(err);
            const total = countRows[0]?.total || 0;
            const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
            const dataSql = `
                SELECT
                    lh.*,
                    u.UserName
                FROM login_history lh
                LEFT JOIN users u ON lh.UserId = u.Id
                ${where}
                ORDER BY lh.CreatedAt DESC
                LIMIT ? OFFSET ?
            `;
            db.query(dataSql, [...params, parseInt(limit, 10), offset], (dataErr, rows) => {
                if (dataErr) return reject(dataErr);
                resolve({
                    history: rows,
                    pagination: {
                        page: parseInt(page, 10),
                        limit: parseInt(limit, 10),
                        total,
                        totalPages: Math.ceil(total / parseInt(limit, 10)) || 1
                    }
                });
            });
        });
    });
};
// Aggregate overview metrics for the Security Center dashboard
const getSecurityOverview = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const queries = [
                // Open Alerts
                `SELECT COUNT(*) AS count FROM security_alerts WHERE Status IN ('OPEN', 'INVESTIGATING')`,
                // Critical Alerts
                `SELECT COUNT(*) AS count FROM security_alerts WHERE Severity = 'CRITICAL' AND Status IN ('OPEN', 'INVESTIGATING')`,
                // Failed Logins 24h
                `SELECT COUNT(*) AS count FROM login_history WHERE Status != 'SUCCESS' AND CreatedAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
                // Currently Locked Accounts
                `SELECT COUNT(*) AS count FROM failed_login_attempts WHERE LockedUntil > NOW()`,
                // Active Sessions
                `SELECT COUNT(*) AS count FROM user_sessions WHERE IsRevoked = 0 AND ExpiresAt > NOW()`
            ];
            const results = await Promise.all(
                queries.map(q => new Promise((res, rej) => db.query(q, (err, r) => err ? rej(err) : res(r[0]?.count || 0))))
            );
            resolve({
                openAlerts: results[0],
                criticalAlerts: results[1],
                failedLogins24h: results[2],
                lockedAccounts: results[3],
                activeSessions: results[4],
                threats: {
                    openAlerts: results[0],
                    criticalAlerts: results[1],
                    highAlerts: Math.max(0, results[0] - results[1])
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};
module.exports = {
    isAccountLocked,
    unlockAccount,
    unlockAllAccounts,
    getLockedAccounts,
    recordLoginAttempt,
    raiseAlert,
    getSecurityAlerts,
    updateAlertStatus,
    getLoginHistory,
    getSecurityOverview
};
