const db = require('../../config/db');

// Create a new notification and broadcast via WebSocket
const createNotification = (data = {}) => {
    const userId = data.userId ?? data.UserId ?? null;
    const targetRole = (data.targetRole ?? data.TargetRole ?? data.role ?? data.Role ?? 'ALL').toString();
    const eventId = data.eventId ?? data.EventId ?? null;
    const title = data.title ?? data.Title;
    const message = data.message ?? data.Message;
    const type = (data.type ?? data.Type ?? 'ANNOUNCEMENT').toString().toUpperCase();
    const linkUrl = data.linkUrl ?? data.LinkUrl ?? null;

    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO user_notifications (UserId, TargetRole, EventId, Title, Message, Type, LinkUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [userId, targetRole, eventId, title, message, type, linkUrl], (err, res) => {
            if (err) return reject(err);
            const notification = {
                Id: res.insertId,
                UserId: userId,
                TargetRole: targetRole,
                EventId: eventId,
                Title: title,
                Message: message,
                Type: type,
                LinkUrl: linkUrl,
                IsRead: 0,
                CreatedAt: new Date().toISOString()
            };
            // Real-time WebSocket push
            try {
                const { broadcastEvent } = require('../../config/websocket');
                if (broadcastEvent) {
                    broadcastEvent(eventId, {
                        type: 'NEW_NOTIFICATION',
                        notification
                    });
                }
            } catch (wsErr) {
                console.error('[NotificationService] WebSocket push failed:', wsErr.message);
            }
            resolve(notification);
        });
    });
};

// Fetch notifications for a user based on role and userId
const getUserNotifications = ({
    userId = null,
    role = null,
    eventId = null,
    page = 1,
    limit = 20,
    unreadOnly = false
}) => {
    return new Promise((resolve, reject) => {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(5, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        let normalizedRole = null;
        if (role) {
            const r = String(role).trim().toLowerCase();
            if (r === 'super_admin' || r === 'superadmin') normalizedRole = 'super_admin';
            else if (r === 'admin' || r === 'event_admin' || r === 'organizer') normalizedRole = 'admin';
            else if (r === 'evaluator' || r === 'jury') normalizedRole = 'evaluator';
            else normalizedRole = 'user';
        }

        const conditions = [];
        const params = [];

        // Role & User scoping
        if (userId && normalizedRole) {
            if (normalizedRole === 'user') {
                conditions.push('(UserId = ? OR (UserId IS NULL AND (TargetRole IN (\'ALL\', \'user\', \'teamlead\') OR TargetRole IS NULL)))');
                params.push(Number(userId));
            } else {
                conditions.push('(UserId = ? OR (UserId IS NULL AND (TargetRole IN (\'ALL\', ?) OR TargetRole IS NULL)))');
                params.push(Number(userId), normalizedRole);
            }
        } else if (userId) {
            conditions.push('(UserId = ? OR (UserId IS NULL AND (TargetRole = \'ALL\' OR TargetRole IS NULL)))');
            params.push(Number(userId));
        } else if (normalizedRole) {
            if (normalizedRole === 'user') {
                conditions.push('(UserId IS NULL AND (TargetRole IN (\'ALL\', \'user\', \'teamlead\') OR TargetRole IS NULL))');
            } else {
                conditions.push('(UserId IS NULL AND (TargetRole IN (\'ALL\', ?) OR TargetRole IS NULL))');
                params.push(normalizedRole);
            }
        } else {
            conditions.push('(UserId IS NULL AND (TargetRole = \'ALL\' OR TargetRole IS NULL))');
        }

        if (eventId) {
            conditions.push('(EventId = ? OR EventId IS NULL)');
            params.push(Number(eventId));
        }

        if (unreadOnly) {
            conditions.push('IsRead = 0');
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Unread count conditions
        const unreadConditions = conditions.filter((c) => c !== 'IsRead = 0');
        unreadConditions.push('IsRead = 0');
        const unreadWhere = `WHERE ${unreadConditions.join(' AND ')}`;
        const unreadParams = [...params];

        const unreadQuery = `
            SELECT COUNT(*) AS unreadCount
            FROM user_notifications
            ${unreadWhere}
        `;

        db.query(unreadQuery, unreadParams, (uErr, uRes) => {
            const unreadCount = uRes?.[0]?.unreadCount || 0;
            const dataQuery = `
                SELECT Id, UserId, TargetRole, EventId, Title, Message, Type, LinkUrl, IsRead, CreatedAt
                FROM user_notifications
                ${whereClause}
                ORDER BY CreatedAt DESC, Id DESC
                LIMIT ? OFFSET ?
            `;
            db.query(dataQuery, [...params, limitNum, offset], (dErr, rows) => {
                if (dErr) return reject(dErr);
                resolve({
                    notifications: rows || [],
                    unreadCount: Number(unreadCount),
                    page: pageNum,
                    limit: limitNum
                });
            });
        });
    });
};

// Mark a single notification as read
const markAsRead = (id) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE user_notifications SET IsRead = 1 WHERE Id = ?', [id], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

// Mark all notifications as read for a user
const markAllAsRead = (userId = null, role = null) => {
    return new Promise((resolve, reject) => {
        let query = 'UPDATE user_notifications SET IsRead = 1';
        const conditions = [];
        const params = [];
        if (userId) {
            conditions.push('(UserId = ? OR UserId IS NULL)');
            params.push(Number(userId));
        }
        if (role) {
            conditions.push('(TargetRole IN (\'ALL\', ?) OR TargetRole IS NULL)');
            params.push(String(role).toLowerCase());
        }
        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        db.query(query, params, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

// Delete a notification
const deleteNotification = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM user_notifications WHERE Id = ?', [id], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};

// Seed starter notifications if table empty
const seedInitialNotificationsIfEmpty = () => {
    db.query('SELECT COUNT(*) AS count FROM user_notifications', (err, res) => {
        if (err || !res || res[0].count > 0) return;
        const starters = [
            {
                title: 'Welcome to AVISHKAAR!',
                message: 'Your high-throughput event management account is active. Explore flagship hackathons and workshops.',
                type: 'WELCOME',
                targetRole: 'user',
                linkUrl: '/user/competitions'
            },
            {
                title: 'HackMatrix 2026 Registration Open',
                message: 'Team registrations are now live for HackMatrix 2026: AI & Systems. Prize pool: ₹2,50,000.',
                type: 'ANNOUNCEMENT',
                targetRole: 'user',
                linkUrl: '/events/evt-1'
            },
            {
                title: 'Team Invitations & Updates',
                message: 'You have no pending team invitations. Create or join a squad to participate in upcoming hackathons.',
                type: 'TEAM_INVITE',
                targetRole: 'user',
                linkUrl: '/user/teams'
            },
            {
                title: 'System Architecture Operational',
                message: 'All core subsystems, WebSocket event stream, and remote database connections are running normally.',
                type: 'BROADCAST',
                targetRole: 'super_admin',
                linkUrl: '/sidebar/reports'
            },
            {
                title: 'Organizer Console Active',
                message: 'Welcome to the Event Management Console. Manage rounds, team registrations, and live scoring.',
                type: 'WELCOME',
                targetRole: 'admin',
                linkUrl: '/admin/dashboard'
            }
        ];
        starters.forEach((item) => createNotification(item));
    });
};
setTimeout(seedInitialNotificationsIfEmpty, 2500);

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};