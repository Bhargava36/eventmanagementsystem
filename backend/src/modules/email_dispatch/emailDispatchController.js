const emailService = require('./emailDispatchService');

const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 25, status = 'ALL', emailType = 'ALL', search = '' } = req.query;
        const data = await emailService.getEmailLogs({ page, limit, status, emailType, search });
        return res.status(200).json({ success: true, ...data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const retry = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await emailService.retryEmail(id);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const sendTest = async (req, res) => {
    try {
        const { to, subject, body } = req.body;
        if (!to) return res.status(400).json({ success: false, message: 'Recipient email required' });
        const result = await emailService.sendTestEmail({ to, subject, body });
        return res.status(200).json({ success: true, message: 'Test email dispatched successfully', info: result });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getLogs,
    retry,
    sendTest
};

