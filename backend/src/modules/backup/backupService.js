const db = require('../../config/db');
// Get comprehensive database table stats
const getDatabaseStats = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                TABLE_NAME AS tableName,
                TABLE_ROWS AS rowCount,
                ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS sizeMb,
                ENGINE AS engine,
                TABLE_COLLATION AS collation
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
        `;
        db.query(query, (err, rows) => {
            if (err) return reject(err);
            const tables = rows || [];
            const totalTables = tables.length;
            const totalRows = tables.reduce((acc, t) => acc + (Number(t.rowCount) || 0), 0);
            const totalSizeMb = tables.reduce((acc, t) => acc + (parseFloat(t.sizeMb) || 0), 0).toFixed(2);
            resolve({
                totalTables,
                totalRows,
                totalSizeMb: parseFloat(totalSizeMb),
                tables
            });
        });
    });
};
// Generate full database SQL dump
const generateSqlDump = () => {
    return new Promise(async (resolve, reject) => {
        try {
            db.query('SHOW TABLES', async (err, tableRows) => {
                if (err) return reject(err);
                const tables = tableRows.map(r => Object.values(r)[0]);
                let sqlDump = `-- ========================================================\n`;
                sqlDump += `-- AYOJAN Event Management System Database Snapshot Dump\n`;
                sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
                sqlDump += `-- ========================================================\n\n`;
                sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;
                let totalRowsCount = 0;
                for (const table of tables) {
                    await new Promise((resT) => {
                        db.query(`SHOW CREATE TABLE \`${table}\``, (cErr, cResult) => {
                            if (!cErr && cResult.length) {
                                const createSql = cResult[0]['Create Table'];
                                sqlDump += `-- --------------------------------------------------------\n`;
                                sqlDump += `-- Table structure for table \`${table}\`\n`;
                                sqlDump += `-- --------------------------------------------------------\n`;
                                sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
                                sqlDump += `${createSql};\n\n`;
                                db.query(`SELECT * FROM \`${table}\``, (dErr, dataRows) => {
                                    if (!dErr && dataRows.length > 0) {
                                        totalRowsCount += dataRows.length;
                                        sqlDump += `-- Dumping data for table \`${table}\` (${dataRows.length} rows)\n`;
                                        for (const row of dataRows) {
                                            const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
                                            const values = Object.values(row).map(val => {
                                                if (val === null) return 'NULL';
                                                if (typeof val === 'number') return val;
                                                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                                                return `'${String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
                                                    switch (char) {
                                                        case "\0": return "\\0";
                                                        case "\x08": return "\\b";
                                                        case "\x09": return "\\t";
                                                        case "\x1a": return "\\z";
                                                        case "\n": return "\\n";
                                                        case "\r": return "\\r";
                                                        case "\"":
                                                        case "'":
                                                        case "\\":
                                                        case "%": return "\\" + char;
                                                        default: return char;
                                                    }
                                                })}'`;
                                            }).join(', ');
                                            sqlDump += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
                                        }
                                        sqlDump += `\n`;
                                    }
                                    resT();
                                });
                            } else {
                                resT();
                            }
                        });
                    });
                }
                sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
                sqlDump += `-- Dump completed at: ${new Date().toISOString()}\n`;
                resolve({
                    sql: sqlDump,
                    totalTables: tables.length,
                    totalRows: totalRowsCount
                });
            });
        } catch (e) {
            reject(e);
        }
    });
};
// Generate full database JSON dump
const generateJsonDump = () => {
    return new Promise((resolve, reject) => {
        db.query('SHOW TABLES', async (err, tableRows) => {
            if (err) return reject(err);
            const tables = tableRows.map(r => Object.values(r)[0]);
            const resultData = {
                exportedAt: new Date().toISOString(),
                tables: {}
            };
            let totalRowsCount = 0;
            for (const table of tables) {
                await new Promise((resT) => {
                    db.query(`SELECT * FROM \`${table}\``, (dErr, dataRows) => {
                        if (!dErr && dataRows) {
                            resultData.tables[table] = dataRows;
                            totalRowsCount += dataRows.length;
                        }
                        resT();
                    });
                });
            }
            resolve({
                json: resultData,
                totalTables: tables.length,
                totalRows: totalRowsCount
            });
        });
    });
};
// Record backup in database_backups table
const recordBackup = ({ filename, sizeBytes, totalTables, totalRows, format = 'SQL', notes = 'Manual Backup' }) => {
    return new Promise((resolve) => {
        const query = `
            INSERT INTO database_backups (Filename, SizeBytes, TotalTables, TotalRows, Format, Notes)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [filename, sizeBytes, totalTables, totalRows, format, notes], (err, res) => {
            if (err) console.error('[BackupService] Failed to record backup:', err.message);
            resolve(res?.insertId || null);
        });
    });
};
// List backups history
const getBackupsList = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM database_backups ORDER BY CreatedAt DESC', (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};
// Delete a backup history record
const deleteBackup = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM database_backups WHERE Id = ?', [id], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};
// Seed initial sample backup record if table empty
const seedInitialBackupsIfEmpty = () => {
    db.query('SELECT COUNT(*) AS count FROM database_backups', (err, res) => {
        if (err || !res || res[0].count > 0) return;
        recordBackup({
            filename: `ayojan_db_snapshot_initial.sql`,
            sizeBytes: 1420580,
            totalTables: 48,
            totalRows: 1240,
            format: 'SQL',
            notes: 'System Initialization Base Snapshot'
        });
    });
};
setTimeout(seedInitialBackupsIfEmpty, 2500);
module.exports = {
    getDatabaseStats,
    generateSqlDump,
    generateJsonDump,
    recordBackup,
    getBackupsList,
    deleteBackup
};
