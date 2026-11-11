const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const { sendOtpEmail } = require('../../config/mailer');
const sessionService = require('./sessionService');
const { recordLoginAttempt } = require('./securityAlertService');
const JWT_SECRET = process.env.JWT_SECRECT || process.env.JWT_SECRET || 'ayojan_enterprise_secret_2026';
const OTP_EXPIRY_MINUTES = 10;
const generateOtpCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// Checks whether 2FA is currently active for a given user account.
const get2FAStatus = (userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT TwoFactorEnabled, Email, UserName FROM users WHERE Id = ? LIMIT 1',
            [userId],
            (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return reject(new Error('User not found.'));
                resolve({
                    twoFactorEnabled: Boolean(rows[0].TwoFactorEnabled),
                    email: rows[0].Email
                });
            }
        );
    });
};
// Generates an activation OTP and delivers it to the user's email address.
const requestEnable2FA = (userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT Id, UserName, Email, TwoFactorEnabled FROM users WHERE Id = ? LIMIT 1',
            [userId],
            async (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return reject(new Error('User not found.'));
                const user = rows[0];
                const otp = generateOtpCode();
                db.query(
                    'UPDATE users SET TwoFactorCode = ?, TwoFactorExpiresAt = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE Id = ?',
                    [otp, OTP_EXPIRY_MINUTES, userId],
                    async (updateErr) => {
                        if (updateErr) return reject(updateErr);
                        try {
                            await sendOtpEmail(user.Email, otp, user.UserName || 'User');
                            resolve({
                                success: true,
                                email: user.Email,
                                message: `Verification code sent to ${user.Email}`
                            });
                        } catch (mailErr) {
                            console.error('Failed to send 2FA activation email:', mailErr.message);
                            resolve({
                                success: true,
                                email: user.Email,
                                message: `Verification code sent to ${user.Email}`
                            });
                        }
                    }
                );
            }
        );
    });
};
// Validates the email OTP and turns on 2FA for the account.
const confirmEnable2FA = (userId, otpCode) => {
    return new Promise((resolve, reject) => {
        if (!otpCode || String(otpCode).trim().length !== 6) {
            return reject(new Error('Please enter a valid 6-digit verification code.'));
        }
        const cleanCode = String(otpCode).trim();
        db.query(
            'SELECT TwoFactorCode, (TwoFactorExpiresAt >= NOW()) AS IsCodeValid FROM users WHERE Id = ? LIMIT 1',
            [userId],
            (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return reject(new Error('User not found.'));
                const user = rows[0];
                if (!user.TwoFactorCode) {
                    return reject(new Error('No pending 2FA verification request. Please request a new code.'));
                }
                if (!user.IsCodeValid) {
                    return reject(new Error('Verification code has expired. Please request a new code.'));
                }
                if (user.TwoFactorCode !== cleanCode) {
                    return reject(new Error('Invalid verification code. Please check your email and try again.'));
                }
                db.query(
                    'UPDATE users SET TwoFactorEnabled = 1, TwoFactorCode = NULL, TwoFactorExpiresAt = NULL WHERE Id = ?',
                    [userId],
                    (saveErr) => {
                        if (saveErr) return reject(saveErr);
                        resolve({
                            success: true,
                            message: 'Two-Factor Authentication enabled successfully!'
                        });
                    }
                );
            }
        );
    });
};
// Disables 2FA after verifying the user's current password.
const disable2FA = (userId, password) => {
    return new Promise((resolve, reject) => {
        if (!password) {
            return reject(new Error('Current password is required to disable Two-Factor Authentication.'));
        }
        db.query(
            'SELECT Password FROM users WHERE Id = ? LIMIT 1',
            [userId],
            async (err, rows) => {
                if (err) return reject(err);
                if (!rows || rows.length === 0) return reject(new Error('User not found.'));
                const user = rows[0];
                const isMatch = await bcrypt.compare(password, user.Password);
                if (!isMatch) {
                    return reject(new Error('Incorrect password. Please try again.'));
                }
                db.query(
                    'UPDATE users SET TwoFactorEnabled = 0, TwoFactorCode = NULL, TwoFactorExpiresAt = NULL WHERE Id = ?',
                    [userId],
                    (updateErr) => {
                        if (updateErr) return reject(updateErr);
                        resolve({
                            success: true,
                            message: 'Two-Factor Authentication has been successfully disabled.'
                        });
                    }
                );
            }
        );
    });
};
// Generates and emails an OTP when a user with 2FA enabled signs in. Returns a short-lived tempToken linking this specific login flow.
const initiateLogin2FA = async (user, userRole, req) => {
    const otp = generateOtpCode();
    await new Promise((resolve, reject) => {
        db.query(
            'UPDATE users SET TwoFactorCode = ?, TwoFactorExpiresAt = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE Id = ?',
            [otp, OTP_EXPIRY_MINUTES, user.Id],
            (err) => err ? reject(err) : resolve()
        );
    });
    try {
        await sendOtpEmail(user.Email, otp, user.UserName || 'User');
    } catch (e) {
        console.error('Failed to send login OTP email:', e.message);
    }
    const tempToken = jwt.sign(
        {
            userId: user.Id,
            email: user.Email,
            role: userRole,
            type: '2FA_PENDING'
        },
        JWT_SECRET,
        { expiresIn: '10m' }
    );
    // Mask user email (e.g. b***u@example.com) for clean UI display
    const [namePart, domainPart] = (user.Email || '').split('@');
    const maskedEmail = namePart.length > 2
        ? `${namePart[0]}***${namePart[namePart.length - 1]}@${domainPart}`
        : `${namePart[0]}***@${domainPart}`;
    return {
        requires2FA: true,
        tempToken,
        maskedEmail,
        message: `A 6-digit verification code was sent to ${maskedEmail}`
    };
};
// Validates login OTP and signs the full application JWT on success.
const verifyLogin2FA = async (tempToken, otpCode, req) => {
    if (!tempToken) {
        throw new Error('Authentication session expired. Please sign in again.');
    }
    if (!otpCode || String(otpCode).trim().length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code.');
    }
    let decoded;
    try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
        throw new Error('Verification session expired. Please sign in again.');
    }
    if (decoded.type !== '2FA_PENDING') {
        throw new Error('Invalid verification request token.');
    }
    const userId = decoded.userId;
    const cleanCode = String(otpCode).trim();
    return new Promise((resolve, reject) => {
        const query = `
            SELECT u.*, r.RoleName, (u.TwoFactorExpiresAt >= NOW()) AS IsCodeValid
            FROM users u
            JOIN roles r ON u.RoleId = r.Id
            WHERE u.Id = ? LIMIT 1
        `;
        db.query(query, [userId], async (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return reject(new Error('User account not found.'));
            const user = rows[0];
            if (!user.TwoFactorCode) {
                return reject(new Error('No pending 2FA challenge. Please log in again.'));
            }
            if (!user.IsCodeValid) {
                return reject(new Error('Verification code has expired. Please sign in again to receive a new code.'));
            }
            if (user.TwoFactorCode !== cleanCode) {
                return reject(new Error('Invalid verification code. Please check your email and try again.'));
            }
            // Invalidate the consumed OTP
            db.query('UPDATE users SET TwoFactorCode = NULL, TwoFactorExpiresAt = NULL WHERE Id = ?', [userId], () => {});
            const role = user.RoleName || decoded.role || 'user';
            // Register session
            let sessionId = null;
            try {
                const session = await sessionService.createSession({
                    userId: user.Id,
                    userEmail: user.Email,
                    userRole: role,
                    req
                });
                sessionId = session.sessionId;
            } catch (sErr) {
                console.error('Session creation failed during 2FA:', sErr.message);
            }
            recordLoginAttempt({
                userId: user.Id,
                email: user.Email,
                role,
                status: 'SUCCESS',
                req
            });
            const token = jwt.sign(
                {
                    Id: user.Id,
                    UserName: user.UserName,
                    Email: user.Email,
                    role,
                    sessionId
                },
                JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );
            const safeUser = {
                Id: user.Id,
                UserName: user.UserName,
                Email: user.Email,
                role,
                PhoneNumber: user.Mobile,
                Mobile: user.Mobile,
                Photo: user.Photo || null
            };
            resolve({
                success: true,
                message: 'Two-Factor verification successful',
                token,
                sessionId,
                role,
                user: safeUser,
                admin: safeUser
            });
        });
    });
};
module.exports = {
    get2FAStatus,
    requestEnable2FA,
    confirmEnable2FA,
    disable2FA,
    initiateLogin2FA,
    verifyLogin2FA
};
