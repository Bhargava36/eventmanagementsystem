const backupService = require('./backupService');
const { recordMutation } = require('../security/auditService');
const getStats = async (req, res) => {
    try {
        const stats = await backupService.getDatabaseStats();
        const history = await backupService.getBackupsList();
        return res.status(200).json({ success: true, stats, history });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const downloadSqlBackup = async (req, res) => {
    try {
        const { sql, totalTables, totalRows } = await backupService.generateSqlDump();
        const filename = `ayojan_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
        const sizeBytes = Buffer.byteLength(sql, 'utf8');
        await backupService.recordBackup({
            filename,
            sizeBytes,
            totalTables,
            totalRows,
            format: 'SQL',
            notes: req.body?.notes || 'Manual SuperAdmin Backup'
        });
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(sql);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const downloadJsonBackup = async (req, res) => {
    try {
        const { json, totalTables, totalRows } = await backupService.generateJsonDump();
        const filename = `ayojan_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const jsonString = JSON.stringify(json, null, 2);
        const sizeBytes = Buffer.byteLength(jsonString, 'utf8');
        await backupService.recordBackup({
            filename,
            sizeBytes,
            totalTables,
            totalRows,
            format: 'JSON',
            notes: req.body?.notes || 'JSON Snapshot'
        });
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(jsonString);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const createSnapshot = async (req, res) => {
    try {
        const { sql, totalTables, totalRows } = await backupService.generateSqlDump();
        const filename = `snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
        const sizeBytes = Buffer.byteLength(sql, 'utf8');
        const insertId = await backupService.recordBackup({
            filename,
            sizeBytes,
            totalTables,
            totalRows,
            format: 'SQL',
            notes: req.body?.notes || 'Triggered Snapshot'
        });
        recordMutation({
            actor: req.user,
            module: 'backup',
            action: 'CREATE_BACKUP_SNAPSHOT',
            entityType: 'database_backup',
            entityId: insertId,
            newState: { filename, sizeBytes, totalTables, totalRows },
            req
        });
        return res.status(200).json({
            success: true,
            message: 'Database snapshot captured and logged successfully',
            snapshot: { id: insertId, filename, sizeBytes, totalTables, totalRows }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
const deleteBackupItem = async (req, res) => {
    try {
        const { id } = req.params;
        await backupService.deleteBackup(id);
        recordMutation({
            actor: req.user,
            module: 'backup',
            action: 'DELETE_BACKUP_ITEM',
            entityType: 'database_backup',
            entityId: id,
            req
        });
        return res.status(200).json({ success: true, message: 'Backup record deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = {
    getStats,
    downloadSqlBackup,
    downloadJsonBackup,
    createSnapshot,
    deleteBackupItem
};
