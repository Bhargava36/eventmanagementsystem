const nodemailer = require('nodemailer');

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

/**
 * Send 6-digit OTP verification email for password reset
 */
const sendOtpEmail = async (toEmail, otpCode, userName = 'Participant') => {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Event Management System" <no-reply@eventmanagement.com>';
    
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
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
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
          <h1>Event Management System</h1>
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
          &copy; ${new Date().getFullYear()} Event Management System. All rights reserved.
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
    const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `${otpCode} is your Event Management System password reset code`,
        text: `Your password reset code is: ${otpCode}. It expires in 10 minutes.`,
        html
    });

    return { sent: true, mode: 'smtp', messageId: info.messageId };
};

/**
 * Send confirmation email after password has been successfully reset
 */
const sendPasswordResetSuccessEmail = async (toEmail, userName = 'Participant') => {
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"Event Management System" <no-reply@eventmanagement.com>';
    
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
        .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; }
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

/**
 * Send Event Announcement / Broadcast email to participants
 */
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

    const categoryBadgeColors = {
        'Important Alert': { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
        'Schedule Update': { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
        'Venue Information': { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
        'Announcement': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
        'Emergency': { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' },
    };

    const badgeStyle = categoryBadgeColors[category] || categoryBadgeColors['Announcement'];

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
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 28px; text-align: left; color: #ffffff; }
        .header-tag { display: inline-block; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; }
        .badge { display: inline-block; background: ${badgeStyle.bg}; color: ${badgeStyle.text}; border: 1px solid ${badgeStyle.border}; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
        .subject-box { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; line-height: 1.4; }
        .greeting { font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 16px; }
        .message-body { background: #f8fafc; border-radius: 14px; padding: 20px; border: 1px solid #f1f5f9; margin-bottom: 24px; }
        .organizer-card { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 24px; font-size: 12px; color: #64748b; }
        .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: #fafafa; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-tag">Live Event Broadcast</div>
          <h1>${eventName}</h1>
        </div>
        <div class="content">
          <div>
            <span class="badge">${category}</span>
          </div>
          <div class="subject-box">${subject}</div>
          <div class="greeting">Dear ${userName || 'Participant'},</div>
          <div class="message-body">
            ${formattedMessage}
          </div>
          <div class="organizer-card">
            <strong>Dispatched by:</strong> ${organizerName}<br/>
            <span>Broadcast sent via AYOJAN Event Management Protocol.</span>
          </div>
        </div>
        <div class="footer">
          You are receiving this communication because you are registered for ${eventName}.<br/>
          &copy; ${new Date().getFullYear()} AYOJAN Event Management.
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
        return { sent: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
        console.error(`Failed to send broadcast email to ${toEmail}:`, err.message);
        return { sent: false, error: err.message };
    }
};

module.exports = {
    sendOtpEmail,
    sendPasswordResetSuccessEmail,
    sendEventBroadcastEmail
};

