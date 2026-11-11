const nodemailer = require('nodemailer');
const recordEmailLogSafe = (data) => {
    try {
        const { recordEmailLog } = require('../modules/email_dispatch/emailDispatchService');
        if (recordEmailLog) recordEmailLog(data);
        const { broadcastEvent } = require('./websocket');
        if (broadcastEvent) {
            broadcastEvent(null, { type: 'EMAIL_DISPATCHED', ...data });
        }
    } catch (e) {
        // Safe fallback if module not loaded
    }
};
// Create SMTP Transporter using environment variables or safe defaults
const getTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (!user || !pass) {
        console.warn('⚠️ [SMTP Mailer] SMTP_USER or SMTP_PASS not set in .env. Emails will be logged to console.');
    }
    const isGmail = host === 'smtp.gmail.com' || (user && user.endsWith('@gmail.com'));
    if (isGmail && user && pass) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
        tls: {
            rejectUnauthorized: false // Allow self-signed or internal relays
        }
    });
};
// Send 6-digit OTP verification email for password reset
const sendOtpEmail = async (toEmail, otpCode, userName = 'Participant') => {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"AYOJAN" <no-reply@ayojan.live>';
    // Beautiful, responsive, Google-grade HTML template
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background-color: #059669; padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #10b981; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-title { font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #065f46; margin: 4px 0; }
        .otp-sub { font-size: 11px; color: #64748b; margin-top: 6px; }
        .security-notice { background: #f8fafc; border-radius: 12px; padding: 14px 16px; font-size: 11px; color: #64748b; line-height: 1.5; border-left: 3px solid #059669; }
        .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AYOJAN</h1>
          <p>Security & Account Protection Portal</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${userName || 'User'},</div>
          <p class="message">
            We received a request to reset your password. Please use the 6-digit one-time verification code below to authorize this password change:
          </p>

          <div class="otp-box">
            <div class="otp-title">Your One-Time Password</div>
            <div class="otp-code">${otpCode}</div>
            <div class="otp-sub">Expires in <strong>10 minutes</strong></div>
          </div>

          <div class="security-notice">
            <strong>Security Tip:</strong> Never share this code with anyone. Event organizers and staff will never ask for your verification code. If you did not request this, please disregard this email.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AYOJAN. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;
    console.log(`\n======================================================`);
    console.log(`📧 [SMTP OTP DISPATCH] To: ${toEmail} | Code: ${otpCode}`);
    console.log(`======================================================\n`);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (!user || !pass) {
        // Dev fallback if SMTP credentials aren't configured yet
        return {
            sent: true,
            mode: 'development_logged',
            message: 'OTP logged to server console (SMTP credentials not yet configured)'
        };
    }
    const transporter = getTransporter();
    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: `${otpCode} is your AYOJAN Verification code`,
            text: `Your password reset code is: ${otpCode}. It expires in 10 minutes.`,
            html
        });
        recordEmailLogSafe({
            recipientEmail: toEmail,
            recipientName: userName,
            subject: `${otpCode} is your AYOJAN Verification code`,
            emailType: 'OTP',
            status: 'Delivered',
            payloadSnippet: `Password reset OTP: ${otpCode}`
        });
        return { sent: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
        recordEmailLogSafe({
            recipientEmail: toEmail,
            recipientName: userName,
            subject: `${otpCode} is your AYOJAN Verification code`,
            emailType: 'OTP',
            status: 'Failed',
            errorMessage: err.message,
            payloadSnippet: `Password reset OTP: ${otpCode}`
        });
        throw err;
    }
};
// Send confirmation email after password has been successfully reset
const sendPasswordResetSuccessEmail = async (toEmail, userName = 'Participant') => {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"AYOJAN" <no-reply@ayojan.live>';
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Password Reset Successful</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #059669; padding: 28px; text-align: center; color: #ffffff; }
        .content { padding: 32px 28px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;">Password Reset Completed</h2>
        </div>
        <div class="content">
          <p>Hello ${userName || 'User'},</p>
          <p>Your password for <strong>${toEmail}</strong> was successfully updated on <strong>${new Date().toLocaleString()}</strong>.</p>
          <p>You can now sign in using your new password.</p>
          <p style="font-size:12px; color:#64748b; margin-top:24px;">If you did not make this change, please contact your event administrator immediately.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (!user || !pass) return { sent: true, mode: 'development_logged' };
    try {
        const transporter = getTransporter();
        await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: 'Security Alert: Your password was successfully changed',
            html
        });
    } catch (err) {
        console.warn('Failed to send confirmation email:', err.message);
    }
};
// Send Event Announcement / Broadcast email to participants
const sendEventBroadcastEmail = async ({
    toEmail,
    userName = 'Participant',
    eventName = 'Hackathon Event',
    subject,
    message,
    category = 'Announcement',
    organizerName = 'Event Organizing Committee'
}) => {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || `"${eventName}" <no-reply@eventmanagement.com>`;
    const getCategoryTheme = (cat) => {
        const c = String(cat || '').toLowerCase().trim();
        // 1. Emergency / Urgent (Solid Rose Red)
        if (c.includes('emergency') || c.includes('urgent')) {
            return {
                headerBg: '#be123c',
                tag: 'URGENT NOTIFICATION',
                badge: { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' },
                accentColor: '#e11d48'
            };
        }
        // 2. Important Notice (Solid Crimson Red)
        if (c.includes('important')) {
            return {
                headerBg: '#dc2626',
                tag: 'IMPORTANT NOTICE',
                badge: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
                accentColor: '#dc2626'
            };
        }
        // 3. Schedule & Agenda Updates (Solid Orange)
        if (c.includes('schedule') || c.includes('timings') || c.includes('timetable')) {
            return {
                headerBg: '#ea580c',
                tag: 'SCHEDULE & TIMETABLE UPDATE',
                badge: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
                accentColor: '#ea580c'
            };
        }
        // 4. Action Alert (Solid Amber)
        if (c.includes('alert')) {
            return {
                headerBg: '#d97706',
                tag: 'ACTION REQUIRED',
                badge: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
                accentColor: '#d97706'
            };
        }
        // 5. Reunion / Keynote / Speaker Spotlight (Solid Royal Blue)
        if (c.includes('reunion') || c.includes('keynote') || c.includes('speaker') || c.includes('spotlight')) {
            return {
                headerBg: '#2563eb',
                tag: 'OFFICIAL REUNION ANNOUNCEMENT',
                badge: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
                accentColor: '#2563eb'
            };
        }
        // 6. Gate Pass / Banquet / Venue (Solid Teal)
        if (c.includes('gate') || c.includes('banquet') || c.includes('venue') || c.includes('auditorium')) {
            return {
                headerBg: '#0d9488',
                tag: 'GATE PASS & VENUE ENTRY',
                badge: { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' },
                accentColor: '#0d9488'
            };
        }
        // 7. Nostalgia & Memories / Slides / Code Materials (Solid Sky Blue)
        if (c.includes('nostalgia') || c.includes('memories') || c.includes('study') || c.includes('slides') || c.includes('proceedings') || c.includes('replays')) {
            return {
                headerBg: '#0284c7',
                tag: 'MEMORIES & RESOURCES',
                badge: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
                accentColor: '#0284c7'
            };
        }
        // 8. Alumni Giving / Certificates / Feedback (Solid Purple)
        if (c.includes('giving') || c.includes('endowment') || c.includes('certificate') || c.includes('feedback')) {
            return {
                headerBg: '#7c3aed',
                tag: 'ALUMNI GIVING & HONORS',
                badge: { bg: '#faf5ff', text: '#6d28d9', border: '#e9d5ff' },
                accentColor: '#7c3aed'
            };
        }
        // 9. Default Announcement (Solid Emerald Green)
        return {
            headerBg: '#059669',
            tag: 'LIVE EVENT ANNOUNCEMENT',
            badge: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
            accentColor: '#059669'
        };
    };
    const theme = getCategoryTheme(category);
    const formattedMessage = (message || '')
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155; font-size: 14px;">${p}</p>`)
        .join('');
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background-color: ${theme.headerBg}; padding: 32px 28px; text-align: left; color: #ffffff; }
        .header-tag { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255, 255, 255, 0.92); margin-bottom: 8px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; }
        .category-label { font-size: 12px; font-weight: 800; color: ${theme.accentColor}; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 14px; }
        .subject-box { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; line-height: 1.4; }
        .greeting { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 16px; }
        .message-body { background: #f8fafc; border-radius: 14px; padding: 20px; border: 1px solid #f1f5f9; border-left: 4px solid ${theme.accentColor}; margin-bottom: 24px; }
        .organizer-card { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; font-size: 12px; color: #64748b; }
        .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-tag">${theme.tag}</div>
          <h1>${eventName}</h1>
        </div>
        <div class="content">
          <div class="category-label">&bull; ${category}</div>
          <div class="subject-box">${subject}</div>
          <div class="greeting">Dear ${userName || 'Participant'},</div>
          <div class="message-body">
            ${formattedMessage}
          </div>
          <div class="organizer-card">
            <strong>Dispatched by:</strong> ${organizerName}<br/>
            <span>Broadcast sent via AYOJAN Event Protocol.</span>
          </div>
        </div>
        <div class="footer">
          You are receiving this communication because you are registered for ${eventName}.<br/>
          &copy; ${new Date().getFullYear()} AYOJAN.
        </div>
      </div>
    </body>
    </html>
    `;
    console.log(`📢 [BROADCAST EMAIL] To: ${toEmail} | Subject: "${subject}" [${category}]`);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (!user || !pass) {
        return { sent: true, mode: 'development_logged' };
    }
    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: `[${eventName}] ${subject}`,
            text: `${subject}\n\nDear ${userName},\n\n${message}\n\n- ${organizerName}`,
            html
        });
        recordEmailLogSafe({
            recipientEmail: toEmail,
            recipientName: userName,
            subject: `[${eventName}] ${subject}`,
            emailType: 'BROADCAST',
            status: 'Delivered',
            payloadSnippet: message ? message.slice(0, 160) : null
        });
        return { sent: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
        console.error(`Failed to send broadcast email to ${toEmail}:`, err.message);
        recordEmailLogSafe({
            recipientEmail: toEmail,
            recipientName: userName,
            subject: `[${eventName}] ${subject}`,
            emailType: 'BROADCAST',
            status: 'Failed',
            errorMessage: err.message,
            payloadSnippet: message ? message.slice(0, 160) : null
        });
        return { sent: false, error: err.message };
    }
};
module.exports = {
    sendOtpEmail,
    sendPasswordResetSuccessEmail,
    sendEventBroadcastEmail
};
