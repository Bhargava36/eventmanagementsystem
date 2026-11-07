const { getLogs } = require('./loggerService');
const db = require('../../config/db');

const getLogsController = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            level,
            category,
            search,
            startDate,
            endDate,
            userId
        } = req.query;

        const result = await getLogs({
            page,
            limit,
            level,
            category,
            search,
            startDate,
            endDate,
            userId
        });

        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('[LogsController] Error fetching logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve activity logs',
            error: error.message
        });
    }
};

const exportLogsController = async (req, res) => {
    try {
        const { level, category, search, startDate, endDate, format = 'csv' } = req.query;

        const result = await getLogs({
            page: 1,
            limit: 2000, // Export up to 2,000 recent logs matching filter
            level,
            category,
            search,
            startDate,
            endDate
        });

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="system_activity_logs.json"');
            return res.send(JSON.stringify(result.logs, null, 2));
        }

        // CSV formatting
        const headers = ['Id', 'Timestamp', 'Level', 'Category', 'Action', 'Message', 'UserEmail', 'UserRole', 'IpAddress', 'HttpMethod', 'Endpoint', 'StatusCode', 'ExecutionTimeMs'];
        const csvRows = [headers.join(',')];

        result.logs.forEach((log) => {
            const row = [
                log.Id,
                `"${log.Timestamp}"`,
                `"${log.Level || ''}"`,
                `"${log.Category || ''}"`,
                `"${(log.Action || '').replace(/"/g, '""')}"`,
                `"${(log.Message || '').replace(/"/g, '""')}"`,
                `"${log.UserEmail || ''}"`,
                `"${log.UserRole || ''}"`,
                `"${log.IpAddress || ''}"`,
                `"${log.HttpMethod || ''}"`,
                `"${log.Endpoint || ''}"`,
                log.StatusCode || '',
                log.ExecutionTimeMs || ''
            ];
            csvRows.push(row.join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="system_activity_logs.csv"');
        return res.status(200).send(csvRows.join('\n'));
    } catch (error) {
        console.error('[LogsController] Export error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to export logs',
            error: error.message
        });
    }
};

const cleanupLogsController = async (req, res) => {
    try {
        const days = Math.max(7, parseInt(req.body.days || 30, 10));
        const query = 'DELETE FROM activity_logs WHERE Timestamp < NOW() - INTERVAL ? DAY';

        db.query(query, [days], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database deletion failed', error: err.message });
            }
            return res.status(200).json({
                success: true,
                message: `Cleaned up logs older than ${days} days`,
                affectedRows: result.affectedRows
            });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Cleanup failed', error: error.message });
    }
};

module.exports = {
    getLogsController,
    exportLogsController,
    cleanupLogsController
};

