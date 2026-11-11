const webhookService = require('./webhookService');
const { recordMutation } = require('../security/auditService');
const getWebhooks = async (req, res) => {
    try {
        const webhooks = await webhookService.getWebhooks();
        return res.status(200).json({ success: true, webhooks });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const createWebhook = async (req, res) => {
    try {
        const { name, targetUrl, platform, events, secretKey, eventId } = req.body;
        if (!name || !targetUrl) {
            return res.status(400).json({ success: false, message: 'Name and Target URL are required' });
        }
        const created = await webhookService.createWebhook({ name, targetUrl, platform, events, secretKey, eventId });
        recordMutation({
            actor: req.user,
            module: 'webhooks',
            action: 'CREATE_WEBHOOK',
            entityType: 'webhook',
            entityId: created?.id,
            eventId,
            newState: { name, targetUrl, platform, events },
            req
        });
        return res.status(201).json({ success: true, webhook: created });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const updateWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        await webhookService.updateWebhook(id, req.body);
        recordMutation({
            actor: req.user,
            module: 'webhooks',
            action: 'UPDATE_WEBHOOK',
            entityType: 'webhook',
            entityId: id,
            newState: req.body,
            req
        });
        return res.status(200).json({ success: true, message: 'Webhook updated successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deleteWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        await webhookService.deleteWebhook(id);
        recordMutation({
            actor: req.user,
            module: 'webhooks',
            action: 'DELETE_WEBHOOK',
            entityType: 'webhook',
            entityId: id,
            req
        });
        return res.status(200).json({ success: true, message: 'Webhook removed successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const testWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await webhookService.testWebhook(id);
        return res.status(200).json({ success: true, result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const getLogs = async (req, res) => {
    try {
        const { webhookId, limit = 50 } = req.query;
        const logs = await webhookService.getWebhookLogs(webhookId, limit);
        return res.status(200).json({ success: true, logs });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = {
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    getLogs
};
