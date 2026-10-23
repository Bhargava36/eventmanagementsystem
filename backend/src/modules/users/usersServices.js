const db = require("../../config/db");
const bcrypt = require("bcrypt");

const createUser = async (UserName, Email, Password, Mobile, Gender, College, Location, State, callback, RoleId = 3) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const query = `INSERT INTO users (UserName, Email, Password, Mobile, Gender, College, Location, State, RoleId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [UserName, Email, hashedPassword, Mobile, Gender, College, Location, State, RoleId], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            const newUserId = result.insertId;
            const linkSql = `UPDATE registered_team_members SET UserId = ? WHERE LOWER(MemberEmail) = LOWER(?) AND UserId IS NULL`;
            db.query(linkSql, [newUserId, Email], () => {
                return callback(null, result);
            });
        });
    }
    catch (err) {
        return callback(err, null);
    }
};

const loginUser = (Email, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Password, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE LOWER(u.Email) = LOWER(?)
    `;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        if (result && result.length > 0) {
            const u = result[0];
            const linkSql = `UPDATE registered_team_members SET UserId = ? WHERE LOWER(MemberEmail) = LOWER(?) AND UserId IS NULL`;
            db.query(linkSql, [u.Id, Email], () => {});
        }

        return callback(null, result);
    });
};

const getAllUsers = (callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, u.CreatedAt, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        ORDER BY u.CreatedAt DESC
    `;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserById = (id, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, u.CreatedAt, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE u.Id = ?
    `;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserCount = (callback) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM users WHERE RoleId = 3) AS userCount,
            (SELECT COUNT(*) FROM registered_team_members) AS totalMembersCount,
            COALESCE((SELECT COUNT(DISTINCT tm.Id) FROM registered_team_members tm JOIN event_registrations er ON tm.TeamId = er.TeamId), 0) AS registeredMembersCount
    `;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getUserByEmail = (Email, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE LOWER(u.Email) = LOWER(?)
    `;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateUser = ( id, UserName, Email, Mobile, Gender, College, Location, State, callback ) => {
    const query = `UPDATE users SET UserName = ?, Email = ?, Mobile = ?, Gender = ?, College = ?, Location = ?, State = ? WHERE Id = ?`;
    db.query( query, [UserName, Email, Mobile, Gender, College, Location, State, id ], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            return callback(null, result);
        }
    );
};

const checkEmailExists = (Email, callback) => {
    const query = `SELECT Id FROM users WHERE LOWER(Email) = LOWER(?) LIMIT 1`;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const sendPasswordResetOtp = async (email, callback) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
        const error = new Error('Email address is required');
        error.status = 400;
        return callback(error);
    }

    // Check if user exists in users table
    db.query('SELECT Id, UserName, Email FROM users WHERE LOWER(Email) = ? LIMIT 1', [cleanEmail], async (userErr, userRows) => {
        if (userErr) return callback(userErr);

        if (!userRows || userRows.length === 0) {
            const notFound = new Error('No registered account found with this email address.');
            notFound.status = 404;
            return callback(notFound);
        }

        const account = userRows[0];
        try {
                // Generate 6-digit OTP code
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpHash = await bcrypt.hash(otp, 10);

                // Invalidate any previously pending OTPs for this email
                db.query('UPDATE password_reset_otps SET IsUsed = 1 WHERE LOWER(Email) = ?', [cleanEmail], (invalErr) => {
                    if (invalErr) console.warn('OTP invalidation warning:', invalErr.message);

                    // Insert new OTP with 10 minute expiry
                    const insertSql = `
                        INSERT INTO password_reset_otps (Email, OtpHash, ExpiresAt, IsUsed)
                        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)
                    `;
                    db.query(insertSql, [cleanEmail, otpHash], async (saveErr, saveResult) => {
                        if (saveErr) return callback(saveErr);

                        // Send email via SMTP protocol
                        try {
                            const { sendOtpEmail } = require('../../config/mailer');
                            const sendResult = await sendOtpEmail(cleanEmail, otp, account.UserName || 'Participant');
                            return callback(null, {
                                success: true,
                                message: 'A 6-digit verification code has been dispatched to your email.',
                                email: cleanEmail,
                                devOtp: sendResult.mode === 'development_logged' ? otp : undefined
                            });
                        } catch (mailErr) {
                            console.error('SMTP Send Error:', mailErr.message);
                            // Still return success in dev so developers aren't locked out
                            return callback(null, {
                                success: true,
                                message: 'Verification code generated. (Check server logs if SMTP is not configured)',
                                email: cleanEmail,
                                devOtp: otp
                            });
                        }
                    });
                });
            } catch (err) {
                return callback(err);
            }
    });
};

const verifyPasswordResetOtp = (email, otp, callback) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    if (!cleanEmail || !cleanOtp) {
        const error = new Error('Email and verification code are required');
        error.status = 400;
        return callback(error);
    }

    const query = `
        SELECT Id, OtpHash, ExpiresAt, IsUsed
        FROM password_reset_otps
        WHERE LOWER(Email) = ? AND IsUsed = 0 AND ExpiresAt > NOW()
        ORDER BY CreatedAt DESC
        LIMIT 1
    `;
    db.query(query, [cleanEmail], async (err, rows) => {
        if (err) return callback(err);

        if (!rows || rows.length === 0) {
            // Check if there was an expired one
            const checkQuery = `SELECT Id, ExpiresAt FROM password_reset_otps WHERE LOWER(Email) = ? ORDER BY CreatedAt DESC LIMIT 1`;
            db.query(checkQuery, [cleanEmail], (chkErr, chkRows) => {
                if (chkRows && chkRows.length > 0 && new Date(chkRows[0].ExpiresAt) <= new Date()) {
                    const expired = new Error('Verification code has expired. Please request a new one.');
                    expired.status = 400;
                    return callback(expired);
                }
                const notFound = new Error('Invalid or unrequested verification code.');
                notFound.status = 400;
                return callback(notFound);
            });
            return;
        }

        const record = rows[0];
        try {
            const isMatch = await bcrypt.compare(cleanOtp, record.OtpHash);
            if (!isMatch) {
                const invalid = new Error('Incorrect verification code. Please check your email and try again.');
                invalid.status = 400;
                return callback(invalid);
            }

            const jwt = require('jsonwebtoken');
            const resetToken = jwt.sign(
                { email: cleanEmail, otpId: record.Id, purpose: 'password_reset' },
                process.env.JWT_SECRECT || 'secret',
                { expiresIn: '15m' }
            );

            return callback(null, {
                success: true,
                message: 'Verification code verified successfully.',
                resetToken,
                email: cleanEmail
            });
        } catch (e) {
            return callback(e);
        }
    });
};

const resetPasswordWithOtp = async (email, otp, resetToken, newPassword, callback) => {
    let cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(newPassword || '').trim();

    if (!cleanPassword || cleanPassword.length < 6) {
        const err = new Error('New password must be at least 6 characters long.');
        err.status = 400;
        return callback(err);
    }

    // Verify token or OTP
    if (resetToken) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(resetToken, process.env.JWT_SECRECT || 'secret');
            if (decoded.purpose !== 'password_reset') {
                const invalidToken = new Error('Invalid authorization token for password reset');
                invalidToken.status = 403;
                return callback(invalidToken);
            }
            if (decoded.email) {
                cleanEmail = decoded.email.toLowerCase();
            }
        } catch (e) {
            const expToken = new Error('Password reset session expired. Please verify your OTP again.');
            expToken.status = 401;
            return callback(expToken);
        }
    } else if (otp) {
        // Direct OTP verification flow
        return verifyPasswordResetOtp(cleanEmail, otp, (vErr, vRes) => {
            if (vErr) return callback(vErr);
            proceedUpdate();
        });
    } else {
        const error = new Error('Valid OTP code or reset token is required');
        error.status = 400;
        return callback(error);
    }

    proceedUpdate();

    async function proceedUpdate() {
        try {
            const hashedPassword = await bcrypt.hash(cleanPassword, 10);

            // Update in users table
            db.query('UPDATE users SET Password = ? WHERE LOWER(Email) = ?', [hashedPassword, cleanEmail], (uErr, uResult) => {
                if (uErr) return callback(uErr);

                // Invalidate all OTPs for this email
                db.query('UPDATE password_reset_otps SET IsUsed = 1 WHERE LOWER(Email) = ?', [cleanEmail], () => {});

                // Fetch user name and send confirmation email
                db.query('SELECT UserName FROM users WHERE LOWER(Email) = ? LIMIT 1', [cleanEmail], (nameErr, nameRows) => {
                    const uName = nameRows && nameRows.length > 0 ? nameRows[0].UserName : 'Participant';
                    const { sendPasswordResetSuccessEmail } = require('../../config/mailer');
                    sendPasswordResetSuccessEmail(cleanEmail, uName);
                });

                return callback(null, {
                    success: true,
                    message: 'Password has been reset successfully! You can now log in with your new password.'
                });
            });
        } catch (err) {
            return callback(err);
        }
    }
};

module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getUserCount,
    getUserById,
    getUserByEmail,
    updateUser,
    checkEmailExists,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPasswordWithOtp
};