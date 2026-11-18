const db = require('../src/config/db');

async function migrateUrls() {
    console.log('Starting migration: replacing localhost:3000 with https://emsapi.aitamsac.in...');

    db.query(`
        SELECT TABLE_NAME, COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND DATA_TYPE IN ('varchar', 'text', 'mediumtext', 'longtext')
    `, async (err, cols) => {
        if (err) {
            console.error('Error fetching columns:', err);
            process.exit(1);
        }

        let totalUpdated = 0;

        for (const c of cols) {
            const table = c.TABLE_NAME;
            const col = c.COLUMN_NAME;

            try {
                // Check if any row contains localhost:3000 or 127.0.0.1:3000
                const rows = await new Promise((resolve) => {
                    db.query(
                        `SELECT COUNT(*) as cnt FROM \`${table}\` WHERE \`${col}\` LIKE '%localhost:3000%' OR \`${col}\` LIKE '%127.0.0.1:3000%'`,
                        (qErr, res) => {
                            if (qErr) resolve([]);
                            else resolve(res);
                        }
                    );
                });

                if (rows && rows[0] && rows[0].cnt > 0) {
                    console.log(`Updating ${rows[0].cnt} row(s) in ${table}.${col}...`);

                    await new Promise((resolve) => {
                        const updateQuery = `
                            UPDATE \`${table}\`
                            SET \`${col}\` = REPLACE(
                                REPLACE(
                                    REPLACE(\`${col}\`, 'http://localhost:3000', 'https://emsapi.aitamsac.in'),
                                    'https://localhost:3000', 'https://emsapi.aitamsac.in'
                                ),
                                'http://127.0.0.1:3000', 'https://emsapi.aitamsac.in'
                            )
                            WHERE \`${col}\` LIKE '%localhost:3000%' OR \`${col}\` LIKE '%127.0.0.1:3000%'
                        `;
                        db.query(updateQuery, (upErr, upRes) => {
                            if (upErr) {
                                console.error(`Failed to update ${table}.${col}:`, upErr.message);
                            } else {
                                totalUpdated += upRes.affectedRows || 0;
                                console.log(`Successfully updated ${upRes.affectedRows} row(s) in ${table}.${col}`);
                            }
                            resolve();
                        });
                    });
                }
            } catch (colErr) {
                console.error(`Error processing ${table}.${col}:`, colErr.message);
            }
        }

        console.log(`Migration complete! Total rows updated across database: ${totalUpdated}`);
        process.exit(0);
    });
}

migrateUrls();

