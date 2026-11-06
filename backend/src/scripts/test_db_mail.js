const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('../config/db');
const { sendEventBroadcastEmail } = require('../config/mailer');
const { getEmailLogs } = require('../modules/email_dispatch/emailDispatchService');

async function runTest() {
    console.log('--- Step 1: Connecting to DB and fetching users ---');
    db.query('SELECT Id, UserName, Email, RoleId FROM users ORDER BY Id ASC LIMIT 5', async (err, users) => {
        if (err) {
            console.error('Error fetching users from DB:', err.message);
            process.exit(1);
        }

        console.log(`Found ${users.length} users in DB:`);
        users.forEach((u, i) => console.log(`  [${i + 1}] ID: ${u.Id} | Name: ${u.UserName} | Email: ${u.Email} | RoleId: ${u.RoleId}`));

        if (users.length === 0) {
            console.log('No users in DB to send to.');
            process.exit(0);
        }

        const targetUser = users[0];
        console.log(`\n--- Step 2: Sending broadcast test email to user: ${targetUser.UserName} (${targetUser.Email}) ---`);

        try {
            const sendResult = await sendEventBroadcastEmail({
                toEmail: targetUser.Email,
                userName: targetUser.UserName || 'Valued Participant',
                eventName: 'HackMatrix 2026: AI & Systems',
                subject: 'Official Verification: Member Dispatch Confirmation',
                message: 'Hello! This is a real-time verification email confirming that the AYOJAN Member-Wise Email Dispatch Engine is functioning properly.',
                category: 'Important Alert',
                organizerName: 'AYOJAN Platform Directorate'
            });

            console.log('Send result:', sendResult);

            console.log('\n--- Step 3: Fetching recent email dispatch logs from DB ---');
            setTimeout(async () => {
                const logsData = await getEmailLogs({ page: 1, limit: 5 });
                console.log(`Total dispatched logs in DB: ${logsData.pagination.total}`);
                console.log('Latest dispatch records:');
                logsData.logs.slice(0, 3).forEach((l) => {
                    console.log(`  -> Log #${l.Id} | Recipient: ${l.RecipientName} (${l.RecipientEmail}) | Status: [${l.Status}] | Type: ${l.EmailType} | Time: ${l.SentAt}`);
                    if (l.ErrorMessage) console.log(`     Error details: ${l.ErrorMessage}`);
                });

                db.end();
                process.exit(0);
            }, 1500);

        } catch (dispatchErr) {
            console.error('Error sending email:', dispatchErr);
            db.end();
            process.exit(1);
        }
    });
}

runTest();

