const db = require('../../config/db');
const nodemailer = require('nodemailer');

const getTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (host === 'smtp.gmail.com' || (user && user.endsWith('@gmail.com'))) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
        tls: { rejectUnauthorized: false }
    });
};

/**
 * Record an email dispatch attempt
 */
const recordEmailLog = ({
    recipientEmail,
    recipientName = null,
    subject,
    emailType = 'GENERAL',
    status = 'Delivered',
    errorMessage = null,
    eventId = null,
    senderAdminId = null,
    payloadSnippet = null
}) => {
    return new Promise((resolve) => {
        const query = `
            INSERT INTO email_dispatch_logs (
                RecipientEmail, RecipientName, Subject, EmailType,
                Status, ErrorMessage, EventId, SenderAdminId, PayloadSnippet
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [
            recipientEmail,
            recipientName,
            subject,
            emailType.toUpperCase(),
            status,
            errorMessage,
            eventId,
            senderAdminId,
            payloadSnippet
        ], (err, result) => {
            if (err) console.error('[EmailDispatch] Failed to record log:', err.message);
            resolve(result?.insertId || null);
        });
    });
};

/**
 * Get paginated email logs with filters & summary stats
 */
const getEmailLogs = ({
    page = 1,
    limit = 25,
    status = 'ALL',
    emailType = 'ALL',
    search = ''
}) => {
    return new Promise((resolve, reject) => {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(200, Math.max(5, parseInt(limit, 10) || 25));
        const offset = (pageNum - 1) * limitNum;

        const conditions = [];
        const params = [];

        if (status && status !== 'ALL') {
            conditions.push('Status = ?');
            params.push(status);
        }

        if (emailType && emailType !== 'ALL') {
            conditions.push('EmailType = ?');
            params.push(emailType.toUpperCase());
        }

        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            conditions.push('(RecipientEmail LIKE ? OR RecipientName LIKE ? OR Subject LIKE ?)');
            params.push(term, term, term);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(*) AS total FROM email_dispatch_logs ${whereClause}`;

        db.query(countQuery, params, (countErr, countResult) => {
            if (countErr) return reject(countErr);

            const total = countResult[0]?.total || 0;
            const totalPages = Math.ceil(total / limitNum) || 1;

            const dataQuery = `
                SELECT 
                    Id, RecipientEmail, RecipientName, Subject, EmailType,
                    Status, ErrorMessage, EventId, SenderAdminId, SentAt,
                    RetryCount, PayloadSnippet
                FROM email_dispatch_logs
                ${whereClause}
                ORDER BY SentAt DESC, Id DESC
                LIMIT ? OFFSET ?
            `;

            db.query(dataQuery, [...params, limitNum, offset], (dataErr, rows) => {
                if (dataErr) return reject(dataErr);

                // Stats query
                const statsQuery = `
                    SELECT 
                        COUNT(*) AS totalSent,
                        SUM(CASE WHEN Status = 'Delivered' THEN 1 ELSE 0 END) AS delivered,
                        SUM(CASE WHEN Status = 'Failed' THEN 1 ELSE 0 END) AS failed,
                        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) AS pending
                    FROM email_dispatch_logs
                `;

                db.query(statsQuery, (statsErr, statsResult) => {
                    const stats = statsResult?.[0] || { totalSent: 0, delivered: 0, failed: 0, pending: 0 };

                    resolve({
                        logs: rows || [],
                        pagination: {
                            total,
                            currentPage: pageNum,
                            totalPages,
                            limit: limitNum,
                            hasNextPage: pageNum < totalPages,
                            hasPrevPage: pageNum > 1
                        },
                        stats: {
                            totalSent: Number(stats.totalSent || 0),
                            delivered: Number(stats.delivered || 0),
                            failed: Number(stats.failed || 0),
                            pending: Number(stats.pending || 0),
                            deliveryRate: stats.totalSent > 0 ? ((stats.delivered / stats.totalSent) * 100).toFixed(1) : 100
                        }
                    });
                });
            });
        });
    });
};

/**
 * Retry dispatching a failed email
 */
const retryEmail = (logId) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM email_dispatch_logs WHERE Id = ?', [logId], async (err, rows) => {
            if (err || !rows.length) return reject(new Error('Email log not found'));
            const log = rows[0];

            try {
                const transporter = getTransporter();
                const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"AYOJAN" <no-reply@ayojan.live>';

                await transporter.sendMail({
                    from: fromAddress,
                    to: log.RecipientEmail,
                    subject: log.Subject,
                    text: log.PayloadSnippet || log.Subject,
                    html: `<p>${log.PayloadSnippet || log.Subject}</p>`
                });

                db.query(`
                    UPDATE email_dispatch_logs 
                    SET Status = 'Delivered', ErrorMessage = NULL, RetryCount = RetryCount + 1, SentAt = CURRENT_TIMESTAMP
                    WHERE Id = ?
                `, [logId], () => {
                    resolve({ success: true, message: 'Email redelivered successfully' });
                });
            } catch (sendErr) {
                db.query(`
                    UPDATE email_dispatch_logs 
                    SET Status = 'Failed', ErrorMessage = ?, RetryCount = RetryCount + 1 
                    WHERE Id = ?
                `, [sendErr.message, logId], () => {
                    reject(sendErr);
                });
            }
        });
    });
};

/**
 * Send test diagnostic email
 */
const sendTestEmail = async ({ to, subject = 'AYOJAN Telemetry Diagnostic Test', body = 'Test email dispatch verification' }) => {
    const transporter = getTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"AYOJAN" <no-reply@ayojan.live>';

    const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html: `
            <div style="font-family:sans-serif; padding:20px; border:1px solid #e2e8f0; border-radius:12px;">
                <h2 style="color:#059669; margin-top:0;">AYOJAN Email Dispatch Test</h2>
                <p>${body}</p>
                <p style="color:#64748b; font-size:12px;">Dispatched from SuperAdmin Operations Center at ${new Date().toISOString()}</p>
            </div>
        `
    });

    await recordEmailLog({
        recipientEmail: to,
        recipientName: 'Diagnostic Receiver',
        subject,
        emailType: 'TEST',
        status: 'Delivered',
        payloadSnippet: body
    });

    return info;
};

/**
 * Seed initial sample logs if empty
 */
const seedInitialEmailLogsIfEmpty = () => {
    db.query('SELECT COUNT(*) AS count FROM email_dispatch_logs', (err, res) => {
        if (err || !res || res[0].count > 0) return;

        const sample = [
            {
                recipientEmail: 'rahul.lead@univ.edu',
                recipientName: 'Rahul Sharma',
                subject: 'Team Registration Confirmed - HackMatrix 2026',
                emailType: 'REGISTRATION',
                status: 'Delivered',
                payloadSnippet: 'Congratulations! Your team Matrix Crafters has been confirmed for HackMatrix 2026.'
            },
            {
                recipientEmail: 'priya.deshmukh@college.in',
                recipientName: 'Priya Deshmukh',
                subject: 'Your 6-Digit Password Reset Code: 839201',
                emailType: 'OTP',
                status: 'Delivered',
                payloadSnippet: 'Verification code: 839201. Valid for 10 minutes.'
            },
            {
                recipientEmail: 'admin.support@partner.org',
                recipientName: 'Partner Admin',
                subject: 'Emergency Server Maintenance Scheduled',
                emailType: 'BROADCAST',
                status: 'Delivered',
                payloadSnippet: 'Platform maintenance notice for scheduled infrastructure upgrades.'
            },
            {
                recipientEmail: 'invalid.mailbox@nonexistent.domain',
                recipientName: 'Dev Tester',
                subject: 'Evaluation Round 2 Reminder',
                emailType: 'EVALUATION',
                status: 'Failed',
                errorMessage: '550 5.1.1 The email account that you tried to reach does not exist.'
            }
        ];

        sample.forEach(item => recordEmailLog(item));
    });
};

setTimeout(seedInitialEmailLogsIfEmpty, 2500);

module.exports = {
    recordEmailLog,
    getEmailLogs,
    retryEmail,
    sendTestEmail
};

