const notificationService = require('./notificationService');
const getNotifications = async (req, res) => {
    try {
        const { userId, eventId, page = 1, limit = 20, unreadOnly = 'false' } = req.query;
        const result = await notificationService.getUserNotifications({
            userId,
            eventId,
            page,
            limit,
            unreadOnly: unreadOnly === 'true'
        });
        return res.status(200).json({ success: true, ...result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const createNotification = async (req, res) => {
    try {
        const userId = req.body.userId ?? req.body.UserId ?? null;
        const eventId = req.body.eventId ?? req.body.EventId ?? null;
        const title = req.body.title ?? req.body.Title;
        const message = req.body.message ?? req.body.Message;
        const type = req.body.type ?? req.body.Type ?? 'BROADCAST';
        const linkUrl = req.body.linkUrl ?? req.body.LinkUrl ?? null;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }
        const created = await notificationService.createNotification({ userId, eventId, title, message, type, linkUrl });
        return res.status(201).json({ success: true, notification: created });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id);
        return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const markAllRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await notificationService.markAllAsRead(userId);
        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deleteNotif = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.deleteNotification(id);
        return res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = {
    getNotifications,
    createNotification,
    markRead,
    markAllRead,
    deleteNotif
};
