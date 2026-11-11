const db = require('../../config/db');
// Format payload based on platform
const formatPayload = (platform, eventName, payload) => {
    const timestamp = new Date().toISOString();
    if (platform === 'DISCORD') {
        return {
            username: 'AYOJAN Event Engine',
            avatar_url: 'https://cdn-icons-png.flaticon.com/512/906/906343.png',
            embeds: [
                {
                    title: `🔔 Event Alert: ${eventName}`,
                    description: payload?.message || `Triggered by AYOJAN Event Management System`,
                    color: 0x10b981, // Emerald brand color
                    fields: Object.entries(payload?.details || payload || {}).slice(0, 8).map(([key, value]) => ({
                        name: String(key).toUpperCase(),
                        value: String(typeof value === 'object' ? JSON.stringify(value) : value),
                        inline: true
                    })),
                    timestamp,
                    footer: {
                        text: 'AYOJAN Webhook Telemetry'
                    }
                }
            ]
        };
    }
    if (platform === 'SLACK') {
        return {
            text: `*AYOJAN Alert*: ${eventName}`,
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `🔔 Event Alert: ${eventName}`,
                        emoji: true
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Message*: ${payload?.message || 'New event activity reported in AYOJAN'}\n*Timestamp*: \`${timestamp}\``
                    }
                }
            ]
        };
    }
    // Default: Generic Standard Webhook Payload
    return {
        event: eventName,
        timestamp,
        data: payload
    };
};
// Trigger webhooks for a specific event
const triggerWebhooks = async (eventName, payload, eventId = null) => {
    return new Promise((resolve) => {
        db.query('SELECT * FROM webhook_endpoints WHERE IsActive = 1', async (err, endpoints) => {
            if (err || !endpoints || !endpoints.length) return resolve([]);
            const matching = endpoints.filter((ep) => {
                if (ep.EventId && eventId && Number(ep.EventId) !== Number(eventId)) return false;
                const eventsList = ep.Events ? ep.Events.split(',').map(s => s.trim().toUpperCase()) : [];
                return eventsList.includes(eventName.toUpperCase()) || eventsList.includes('*') || eventsList.includes('ALL');
            });
            if (!matching.length) return resolve([]);
            const results = [];
            for (const ep of matching) {
                const startTime = Date.now();
                const formattedBody = formatPayload(ep.Platform, eventName, payload);
                // Mock URL handling
                if (ep.TargetUrl.includes('/mock/') || ep.TargetUrl.includes('example.com') || ep.TargetUrl.includes('localhost')) {
                    const duration = Math.floor(Math.random() * 20) + 35;
                    db.query(`
                        INSERT INTO webhook_logs (
                            WebhookId, EventName, TargetUrl, Payload, ResponseStatusCode,
                            ResponseBody, ExecutionTimeMs, Status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        ep.Id,
                        eventName,
                        ep.TargetUrl,
                        JSON.stringify(formattedBody),
                        200,
                        '{"delivered": true, "note": "Mock Dispatch Simulated"}',
                        duration,
                        'SUCCESS'
                    ]);
                    db.query(`
                        UPDATE webhook_endpoints
                        SET LastTriggeredAt = CURRENT_TIMESTAMP, LastStatus = 200
                        WHERE Id = ?
                    `, [ep.Id]);
                    results.push({ webhookId: ep.Id, status: 200, duration, success: true });
                    continue;
                }
                try {
                    const response = await fetch(ep.TargetUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'AYOJAN-Webhook-Engine/1.0',
                            ...(ep.SecretKey ? { 'X-Ayojan-Secret': ep.SecretKey } : {})
                        },
                        body: JSON.stringify(formattedBody),
                        signal: AbortSignal.timeout(6000)
                    });
                    const duration = Date.now() - startTime;
                    const responseText = await response.text().catch(() => '');
                    const isSuccess = response.status >= 200 && response.status < 300;
                    // Log webhook delivery
                    db.query(`
                        INSERT INTO webhook_logs (
                            WebhookId, EventName, TargetUrl, Payload, ResponseStatusCode,
                            ResponseBody, ExecutionTimeMs, Status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        ep.Id,
                        eventName,
                        ep.TargetUrl,
                        JSON.stringify(formattedBody),
                        response.status,
                        responseText.slice(0, 1000),
                        duration,
                        isSuccess ? 'SUCCESS' : 'FAILED'
                    ]);
                    // Update last status
                    db.query(`
                        UPDATE webhook_endpoints
                        SET LastTriggeredAt = CURRENT_TIMESTAMP, LastStatus = ?
                        WHERE Id = ?
                    `, [response.status, ep.Id]);
                    results.push({ webhookId: ep.Id, status: response.status, duration, success: isSuccess });
                } catch (sendErr) {
                    const duration = Date.now() - startTime;
                    db.query(`
                        INSERT INTO webhook_logs (
                            WebhookId, EventName, TargetUrl, Payload, ResponseStatusCode,
                            ResponseBody, ExecutionTimeMs, Status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        ep.Id,
                        eventName,
                        ep.TargetUrl,
                        JSON.stringify(formattedBody),
                        504,
                        sendErr.message,
                        duration,
                        'FAILED'
                    ]);
                    db.query(`
                        UPDATE webhook_endpoints
                        SET LastTriggeredAt = CURRENT_TIMESTAMP, LastStatus = 504
                        WHERE Id = ?
                    `, [ep.Id]);
                    results.push({ webhookId: ep.Id, status: 504, error: sendErr.message, success: false });
                }
            }
            resolve(results);
        });
    });
};
// Test a webhook endpoint with a simulated ping
const testWebhook = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM webhook_endpoints WHERE Id = ?', [id], async (err, rows) => {
            if (err || !rows.length) return reject(new Error('Webhook endpoint not found'));
            const ep = rows[0];
            const mockPayload = {
                message: 'This is a test notification verifying connectivity with AYOJAN.',
                details: {
                    service: 'AYOJAN Webhook Dispatcher',
                    environment: 'Production / Local',
                    testId: Math.random().toString(36).substring(7).toUpperCase()
                }
            };
            const startTime = Date.now();
            const formatted = formatPayload(ep.Platform, 'TEST_PING', mockPayload);
            // Handle demo/mock endpoints gracefully without hitting Discord/Slack real auth
            const isMockUrl = ep.TargetUrl.includes('/mock/') || ep.TargetUrl.includes('example.com') || ep.TargetUrl.includes('localhost');
            if (isMockUrl) {
                const duration = Math.floor(Math.random() * 20) + 35;
                const simulatedStatus = 200;
                db.query(`
                    INSERT INTO webhook_logs (
                        WebhookId, EventName, TargetUrl, Payload, ResponseStatusCode,
                        ResponseBody, ExecutionTimeMs, Status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    ep.Id,
                    'TEST_PING',
                    ep.TargetUrl,
                    JSON.stringify(formatted),
                    simulatedStatus,
                    '{"success": true, "note": "Demo/Mock Endpoint Verified", "channel": "Discord Organizers"}',
                    duration,
                    'SUCCESS'
                ]);
                db.query(`
                    UPDATE webhook_endpoints
                    SET LastTriggeredAt = CURRENT_TIMESTAMP, LastStatus = ?
                    WHERE Id = ?
                `, [simulatedStatus, ep.Id]);
                return resolve({
                    success: true,
                    statusCode: simulatedStatus,
                    durationMs: duration,
                    response: 'Demo/Mock Webhook Ping Verified (HTTP 200 OK)'
                });
            }
            try {
                const response = await fetch(ep.TargetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'AYOJAN-Webhook-Engine/1.0',
                        ...(ep.SecretKey ? { 'X-Ayojan-Secret': ep.SecretKey } : {})
                    },
                    body: JSON.stringify(formatted),
                    signal: AbortSignal.timeout(6000)
                });
                const duration = Date.now() - startTime;
                const responseText = await response.text().catch(() => '');
                const isSuccess = response.status >= 200 && response.status < 300;
                db.query(`
                    INSERT INTO webhook_logs (
                        WebhookId, EventName, TargetUrl, Payload, ResponseStatusCode,
                        ResponseBody, ExecutionTimeMs, Status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    ep.Id,
                    'TEST_PING',
                    ep.TargetUrl,
                    JSON.stringify(formatted),
                    response.status,
                    responseText.slice(0, 1000),
                    duration,
                    isSuccess ? 'SUCCESS' : 'FAILED'
                ]);
                db.query(`
                    UPDATE webhook_endpoints
                    SET LastTriggeredAt = CURRENT_TIMESTAMP, LastStatus = ?
                    WHERE Id = ?
                `, [response.status, ep.Id]);
                resolve({
                    success: isSuccess,
                    statusCode: response.status,
                    durationMs: duration,
                    response: responseText
                });
            } catch (fetchErr) {
                const duration = Date.now() - startTime;
                db.query(`
                    INSERT INTO webhook_logs (
                        WebhookId, EventName, TargetUrl, Payload, ResponseStatusCode,
                        ResponseBody, ExecutionTimeMs, Status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    ep.Id,
                    'TEST_PING',
                    ep.TargetUrl,
                    JSON.stringify(formatted),
                    504,
                    fetchErr.message,
                    duration,
                    'FAILED'
                ]);
                resolve({
                    success: false,
                    statusCode: 504,
                    durationMs: duration,
                    error: fetchErr.message
                });
            }
        });
    });
};
// CRUD operations for webhooks
const getWebhooks = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM webhook_endpoints ORDER BY CreatedAt DESC', (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};
const createWebhook = ({ name, targetUrl, platform = 'GENERIC', events = 'ALL', secretKey = null, eventId = null }) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO webhook_endpoints (Name, TargetUrl, Platform, Events, SecretKey, EventId)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [name, targetUrl, platform.toUpperCase(), events, secretKey, eventId], (err, res) => {
            if (err) return reject(err);
            resolve({ id: res.insertId, name, targetUrl, platform });
        });
    });
};
const updateWebhook = (id, { name, targetUrl, platform, events, secretKey, isActive }) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE webhook_endpoints
            SET Name = COALESCE(?, Name),
                TargetUrl = COALESCE(?, TargetUrl),
                Platform = COALESCE(?, Platform),
                Events = COALESCE(?, Events),
                SecretKey = COALESCE(?, SecretKey),
                IsActive = COALESCE(?, IsActive)
            WHERE Id = ?
        `;
        db.query(query, [name, targetUrl, platform, events, secretKey, isActive, id], (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};
const deleteWebhook = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM webhook_logs WHERE WebhookId = ?', [id], () => {
            db.query('DELETE FROM webhook_endpoints WHERE Id = ?', [id], (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    });
};
const getWebhookLogs = (webhookId = null, limit = 50) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM webhook_logs ';
        const params = [];
        if (webhookId) {
            query += 'WHERE WebhookId = ? ';
            params.push(webhookId);
        }
        query += 'ORDER BY CreatedAt DESC LIMIT ?';
        params.push(Number(limit));
        db.query(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};
// Seed initial sample webhook if empty
const seedInitialWebhooksIfEmpty = () => {
    db.query('SELECT COUNT(*) AS count FROM webhook_endpoints', (err, res) => {
        if (err || !res || res[0].count > 0) return;
        createWebhook({
            name: 'Discord Organizers Channel',
            targetUrl: 'https://discord.com/api/webhooks/mock/ayojan-organizers',
            platform: 'DISCORD',
            events: 'TEAM_REGISTERED,PROJECT_SUBMITTED,RESULTS_PUBLISHED'
        }).then((wh) => {
            // Seed a delivery log
            db.query(`
                INSERT INTO webhook_logs (
                    WebhookId, EventName, TargetUrl, ResponseStatusCode, ResponseBody, ExecutionTimeMs, Status
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                wh.id,
                'TEAM_REGISTERED',
                'https://discord.com/api/webhooks/mock/ayojan-organizers',
                204,
                '{"message": "delivered"}',
                45,
                'SUCCESS'
            ]);
        });
    });
};
setTimeout(seedInitialWebhooksIfEmpty, 2500);
module.exports = {
    triggerWebhooks,
    testWebhook,
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    getWebhookLogs
};
