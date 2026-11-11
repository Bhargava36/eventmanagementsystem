const db = require('../../config/db');
// Record an immutable audit log entry capturing state mutations (before/after diffs)
const recordMutation = ({
    actor = null, // { id, email, role }
    actorUserId = null,
    actorEmail = null,
    actorRole = null,
    eventId = null,
    action,
    module: auditModule = 'GENERAL',
    entityType,
    entityId,
    previousValue = null,
    newValue = null,
    previousState = null,
    newState = null,
    diff = null,
    req = null,
    status = 'SUCCESS'
}) => {
    setImmediate(() => {
        try {
            const actorId = actorUserId || actor?.id || actor?.Id || req?.user?.id || req?.user?.Id || null;
            const actorEmailFinal = actorEmail || actor?.email || actor?.Email || req?.user?.email || req?.user?.Email || req?.user?.UserName || 'system@ems.internal';
            const actorRoleFinal = actorRole || actor?.role || actor?.Role || req?.user?.role || 'system';
            const ip = req?.headers['x-forwarded-for']?.split(',')[0]?.trim() || req?.socket?.remoteAddress || req?.ip || null;
            const ua = req?.headers['user-agent'] || null;
            const effectivePrev = previousValue !== null ? previousValue : previousState;
            const effectiveNew = newValue !== null ? newValue : (newState !== null ? newState : diff);
            const prevJson = effectivePrev !== null ? JSON.stringify(effectivePrev) : null;
            const newJson = effectiveNew !== null ? JSON.stringify(effectiveNew) : null;
            const query = `
                INSERT INTO audit_logs (
                    ActorUserId, ActorEmail, ActorRole, EventId, Action,
                    Module, EntityType, EntityId, PreviousValue, NewValue,
                    IpAddress, UserAgent, Status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                actorId,
                actorEmailFinal,
                actorRoleFinal,
                eventId ? Number(eventId) : null,
                (action || 'MUTATION').slice(0, 100),
                (auditModule || 'GENERAL').toUpperCase().slice(0, 50),
                (entityType || 'Entity').slice(0, 50),
                String(entityId || '0').slice(0, 100),
                prevJson,
                newJson,
                ip ? String(ip).slice(0, 64) : null,
                ua ? String(ua).slice(0, 500) : null,
                status
            ];
            db.query(query, params, (err) => {
                if (err) {
                    if (err.message?.includes('max_connections_per_hour') || err.code === 'ER_USER_LIMIT_REACHED') {
                        return;
                    }
                    console.error('[AuditService] Failed to record mutation audit log:', err.message);
                }
            });
        } catch (err) {
            console.error('[AuditService] Exception recording audit log:', err.message);
        }
    });
};
// Paginated query for audit logs with granular filters
const getAuditLogs = ({
    page = 1,
    limit = 25,
    eventId = null,
    module: filterModule = null,
    action = null,
    search = null,
    startDate = null,
    endDate = null
}) => {
    return new Promise((resolve, reject) => {
        let where = 'WHERE 1=1';
        const params = [];
        if (eventId) {
            where += ' AND a.EventId = ?';
            params.push(Number(eventId));
        }
        if (filterModule && filterModule !== 'ALL') {
            where += ' AND a.Module = ?';
            params.push(filterModule.toUpperCase());
        }
        if (action && action !== 'ALL') {
            where += ' AND a.Action = ?';
            params.push(action);
        }
        if (search) {
            where += ' AND (a.Action LIKE ? OR a.ActorEmail LIKE ? OR a.EntityId LIKE ? OR a.EntityType LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (startDate) {
            where += ' AND a.CreatedAt >= ?';
            params.push(startDate);
        }
        if (endDate) {
            where += ' AND a.CreatedAt <= ?';
            params.push(endDate);
        }
        const countSql = `SELECT COUNT(*) AS total FROM audit_logs a ${where}`;
        db.query(countSql, params, (err, countRows) => {
            if (err) return reject(err);
            const total = countRows[0]?.total || 0;
            const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
            const dataSql = `
                SELECT
                    a.Id, a.ActorUserId, a.ActorEmail, a.ActorRole, a.EventId,
                    a.Action, a.Module, a.EntityType, a.EntityId,
                    a.PreviousValue, a.NewValue, a.IpAddress, a.UserAgent,
                    a.Status, a.CreatedAt,
                    e.EventName
                FROM audit_logs a
                LEFT JOIN events e ON a.EventId = e.Id
                ${where}
                ORDER BY a.CreatedAt DESC
                LIMIT ? OFFSET ?
            `;
            db.query(dataSql, [...params, parseInt(limit, 10), offset], (dataErr, rows) => {
                if (dataErr) return reject(dataErr);
                // Parse JSON diff fields safely
                const logs = rows.map(r => ({
                    ...r,
                    PreviousValue: typeof r.PreviousValue === 'string' ? JSON.parse(r.PreviousValue || 'null') : r.PreviousValue,
                    NewValue: typeof r.NewValue === 'string' ? JSON.parse(r.NewValue || 'null') : r.NewValue
                }));
                resolve({
                    logs,
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
// Retrieve a single audit log with full diff inspection
const getAuditLogById = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.*, e.EventName
            FROM audit_logs a
            LEFT JOIN events e ON a.EventId = e.Id
            WHERE a.Id = ?
        `;
        db.query(query, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return reject(new Error('Audit log record not found.'));
            const r = rows[0];
            resolve({
                ...r,
                PreviousValue: typeof r.PreviousValue === 'string' ? JSON.parse(r.PreviousValue || 'null') : r.PreviousValue,
                NewValue: typeof r.NewValue === 'string' ? JSON.parse(r.NewValue || 'null') : r.NewValue
            });
        });
    });
};
module.exports = {
    recordMutation,
    getAuditLogs,
    getAuditLogById
};
