const db = require('../../config/db');

/**
 * Log an activity to activity_logs table asynchronously
 */
const logActivity = async ({
    level = 'INFO',
    category = 'SYSTEM',
    action,
    message,
    userId = null,
    userEmail = null,
    userRole = null,
    targetId = null,
    targetType = null,
    ipAddress = null,
    userAgent = null,
    httpMethod = null,
    endpoint = null,
    statusCode = null,
    executionTimeMs = null,
    metadata = null,
    req = null
}) => {
    try {
        // Automatically extract from req if passed
        let ip = ipAddress;
        let ua = userAgent;
        let method = httpMethod;
        let path = endpoint;
        let actorId = userId;
        let actorEmail = userEmail;
        let actorRole = userRole;

        if (req) {
            ip = ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || null;
            ua = ua || req.headers['user-agent'] || null;
            method = method || req.method || null;
            path = path || req.originalUrl || req.url || null;

            if (!actorId && req.user) {
                actorId = req.user.Id || req.user.id || null;
                actorEmail = req.user.Email || req.user.email || null;
                actorRole = req.user.Role || req.user.role || req.user.RoleName || null;
            }
        }

        const normalizedMetadata = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;

        const query = `
            INSERT INTO activity_logs (
                Level, Category, Action, Message, UserId, UserEmail, UserRole,
                TargetId, TargetType, IpAddress, UserAgent, HttpMethod, Endpoint,
                StatusCode, ExecutionTimeMs, Metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            level.toUpperCase(),
            category.toUpperCase(),
            action || 'SYSTEM_ACTION',
            message || 'No description provided',
            actorId || null,
            actorEmail || null,
            actorRole || null,
            targetId ? String(targetId) : null,
            targetType || null,
            ip ? String(ip).slice(0, 64) : null,
            ua ? String(ua).slice(0, 500) : null,
            method || null,
            path ? String(path).slice(0, 255) : null,
            statusCode ? Number(statusCode) : null,
            executionTimeMs ? Math.round(Number(executionTimeMs)) : null,
            normalizedMetadata
        ];

        db.query(query, values, (err) => {
            if (err) {
                console.error('[LoggerService] Failed to record log:', err.message);
            }
        });
    } catch (err) {
        console.error('[LoggerService] Exception logging activity:', err.message);
    }
};

/**
 * Get paginated logs with dynamic filtering & summary stats
 */
const getLogs = ({
    page = 1,
    limit = 25,
    level,
    category,
    search,
    startDate,
    endDate,
    userId
}) => {
    return new Promise((resolve, reject) => {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(200, Math.max(5, parseInt(limit, 10) || 25));
        const offset = (pageNum - 1) * limitNum;

        const conditions = [];
        const params = [];

        if (level && level !== 'ALL') {
            conditions.push('Level = ?');
            params.push(level.toUpperCase());
        }

        if (category && category !== 'ALL') {
            conditions.push('Category = ?');
            params.push(category.toUpperCase());
        }

        if (userId) {
            conditions.push('UserId = ?');
            params.push(Number(userId));
        }

        if (startDate) {
            conditions.push('Timestamp >= ?');
            params.push(startDate);
        }

        if (endDate) {
            conditions.push('Timestamp <= ?');
            params.push(endDate);
        }

        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            conditions.push('(Action LIKE ? OR Message LIKE ? OR UserEmail LIKE ? OR Endpoint LIKE ? OR IpAddress LIKE ?)');
            params.push(term, term, term, term, term);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count query
        const countQuery = `SELECT COUNT(*) AS total FROM activity_logs ${whereClause}`;

        db.query(countQuery, params, (countErr, countResult) => {
            if (countErr) {
                return reject(countErr);
            }

            const total = countResult[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum) || 1;

            // Data query
            const dataQuery = `
                SELECT 
                    Id, Timestamp, Level, Category, Action, Message,
                    UserId, UserEmail, UserRole, TargetId, TargetType,
                    IpAddress, UserAgent, HttpMethod, Endpoint, StatusCode,
                    ExecutionTimeMs, Metadata
                FROM activity_logs
                ${whereClause}
                ORDER BY Timestamp DESC, Id DESC
                LIMIT ? OFFSET ?
            `;

            const dataParams = [...params, limitNum, offset];

            db.query(dataQuery, dataParams, (dataErr, rows) => {
                if (dataErr) {
                    return reject(dataErr);
                }

                // Parse Metadata JSON safely
                const sanitizedRows = rows.map((r) => {
                    let parsedMeta = null;
                    if (r.Metadata) {
                        try {
                            parsedMeta = typeof r.Metadata === 'string' ? JSON.parse(r.Metadata) : r.Metadata;
                        } catch {
                            parsedMeta = r.Metadata;
                        }
                    }
                    return {
                        ...r,
                        Metadata: parsedMeta
                    };
                });

                // Compute telemetry stats for top metrics bar
                const statsQuery = `
                    SELECT 
                        COUNT(*) AS total24h,
                        SUM(CASE WHEN Level = 'ERROR' OR Level = 'CRITICAL' THEN 1 ELSE 0 END) AS errors24h,
                        SUM(CASE WHEN Level = 'WARN' THEN 1 ELSE 0 END) AS warnings24h,
                        COUNT(DISTINCT UserId) AS uniqueUsers24h,
                        ROUND(AVG(ExecutionTimeMs), 0) AS avgLatencyMs
                    FROM activity_logs
                    WHERE Timestamp >= NOW() - INTERVAL 24 HOUR
                `;

                db.query(statsQuery, (statsErr, statsResult) => {
                    const stats = statsResult?.[0] || {
                        total24h: 0,
                        errors24h: 0,
                        warnings24h: 0,
                        uniqueUsers24h: 0,
                        avgLatencyMs: 0
                    };

                    resolve({
                        logs: sanitizedRows,
                        pagination: {
                            total,
                            currentPage: pageNum,
                            totalPages,
                            limit: limitNum,
                            hasNextPage: pageNum < totalPages,
                            hasPrevPage: pageNum > 1
                        },
                        stats: {
                            total24h: Number(stats.total24h || 0),
                            errors24h: Number(stats.errors24h || 0),
                            warnings24h: Number(stats.warnings24h || 0),
                            uniqueUsers24h: Number(stats.uniqueUsers24h || 0),
                            avgLatencyMs: Number(stats.avgLatencyMs || 0)
                        }
                    });
                });
            });
        });
    });
};

/**
 * Seed initial sample logs if table is completely empty
 */
const seedInitialLogsIfEmpty = () => {
    db.query('SELECT COUNT(*) as count FROM activity_logs', (err, res) => {
        if (err || !res) return;
        if (res[0].count === 0) {
            console.log('[LoggerService] Seeding initial audit logs for SuperAdmin telemetry...');
            const sampleLogs = [
                {
                    level: 'INFO',
                    category: 'SYSTEM',
                    action: 'SYSTEM_BOOT',
                    message: 'Event Management Engine initialized successfully. Database connection established.',
                    userRole: 'system',
                    httpMethod: 'SYSTEM',
                    endpoint: '/core/bootstrap',
                    statusCode: 200,
                    executionTimeMs: 14
                },
                {
                    level: 'INFO',
                    category: 'AUTH',
                    action: 'SUPER_ADMIN_SESSION',
                    message: 'Super Administrator session validated and telemetry stream active.',
                    userEmail: 'superadmin@ayojan.io',
                    userRole: 'super_admin',
                    httpMethod: 'POST',
                    endpoint: '/api/super_admin/login',
                    statusCode: 200,
                    executionTimeMs: 42
                },
                {
                    level: 'INFO',
                    category: 'EVENT',
                    action: 'EVENT_INDEX_ACCELERATED',
                    message: 'Synchronized event catalog and indexed upcoming flagship hackathons.',
                    userRole: 'super_admin',
                    httpMethod: 'GET',
                    endpoint: '/api/events',
                    statusCode: 200,
                    executionTimeMs: 28
                },
                {
                    level: 'WARN',
                    category: 'SECURITY',
                    action: 'RATE_LIMIT_NOTICE',
                    message: 'High request frequency detected from subnet 192.168.1.0/24. Throttling applied.',
                    ipAddress: '192.168.1.45',
                    httpMethod: 'POST',
                    endpoint: '/api/users/login',
                    statusCode: 429,
                    executionTimeMs: 5
                },
                {
                    level: 'INFO',
                    category: 'TEAM',
                    action: 'TEAM_REGISTERED',
                    message: 'Team "Matrix Crafters" registered for HackMatrix 2026: AI & Systems.',
                    userEmail: 'rahul.lead@univ.edu',
                    userRole: 'user',
                    targetId: 'evt-1',
                    targetType: 'event',
                    httpMethod: 'POST',
                    endpoint: '/api/event_reg/register',
                    statusCode: 201,
                    executionTimeMs: 65
                }
            ];

            sampleLogs.forEach((item) => logActivity(item));
        }
    });
};

setTimeout(seedInitialLogsIfEmpty, 2000);

module.exports = {
    logActivity,
    getLogs,
    seedInitialLogsIfEmpty
};

