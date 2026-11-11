const db = require('../../config/db');
// Create a new notification and broadcast via WebSocket
const createNotification = ({
    userId = null,
    eventId = null,
    title,
    message,
    type = 'ANNOUNCEMENT',
    linkUrl = null
}) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO user_notifications (UserId, EventId, Title, Message, Type, LinkUrl)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [userId, eventId, title, message, type.toUpperCase(), linkUrl], (err, res) => {
            if (err) return reject(err);
            const notification = {
                Id: res.insertId,
                UserId: userId,
                EventId: eventId,
                Title: title,
                Message: message,
                Type: type.toUpperCase(),
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
// Fetch notifications for a user (including global broadcasts where UserId IS NULL)
const getUserNotifications = ({
    userId = null,
    eventId = null,
    page = 1,
    limit = 20,
    unreadOnly = false
}) => {
    return new Promise((resolve, reject) => {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(5, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;
        const conditions = [];
        const params = [];
        if (userId) {
            conditions.push('(UserId = ? OR UserId IS NULL)');
            params.push(Number(userId));
        }
        if (eventId) {
            conditions.push('(EventId = ? OR EventId IS NULL)');
            params.push(Number(eventId));
        }
        if (unreadOnly) {
            conditions.push('IsRead = 0');
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Unread count query
        const unreadQuery = `
            SELECT COUNT(*) AS unreadCount
            FROM user_notifications
            WHERE IsRead = 0 ${userId ? 'AND (UserId = ? OR UserId IS NULL)' : ''}
        `;
        db.query(unreadQuery, userId ? [Number(userId)] : [], (uErr, uRes) => {
            const unreadCount = uRes?.[0]?.unreadCount || 0;
            const dataQuery = `
                SELECT Id, UserId, EventId, Title, Message, Type, LinkUrl, IsRead, CreatedAt
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
const markAllAsRead = (userId = null) => {
    return new Promise((resolve, reject) => {
        let query = 'UPDATE user_notifications SET IsRead = 1';
        const params = [];
        if (userId) {
            query += ' WHERE (UserId = ? OR UserId IS NULL)';
            params.push(Number(userId));
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
                title: 'Welcome to AYOJAN! 🚀',
                message: 'Your high-throughput event management account is active. Explore flagship hackathons and workshops.',
                type: 'WELCOME',
                linkUrl: '/user/competitions'
            },
            {
                title: 'HackMatrix 2026 Registration Open',
                message: 'Team registrations are now live for HackMatrix 2026: AI & Systems. Prize pool: ₹2,50,000.',
                type: 'ANNOUNCEMENT',
                linkUrl: '/events/evt-1'
            },
            {
                title: 'Team Invitations & Updates',
                message: 'You have no pending team invitations. Create or join a squad to participate in upcoming hackathons.',
                type: 'TEAM_INVITE',
                linkUrl: '/user/teams'
            }
        ];
        starters.forEach(item => createNotification(item));
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
