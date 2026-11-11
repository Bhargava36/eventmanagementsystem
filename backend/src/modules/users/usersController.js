const db = require("../../config/db");
const usersService = require("./usersServices");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sessionService = require("../security/sessionService");
const { recordLoginAttempt, isAccountLocked } = require("../security/securityAlertService");
const { recordMutation } = require("../security/auditService");
const { verifyCaptcha } = require("../../utils/captchaService");
const { initiateLogin2FA } = require("../security/twoFactorService");
const createUser = (req, res) => {
    const {UserName, Email, Password, Mobile, Gender, College, Location, State } = req.body;
    usersService.createUser(UserName, Email, Password, Mobile, Gender, College, Location, State, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            recordMutation({
                actor: req.user,
                actorUserId: result.insertId,
                actorEmail: Email,
                actorRole: 'participant',
                module: 'users',
                action: 'REGISTER_USER',
                entityType: 'user',
                entityId: result.insertId,
                newState: { UserName, Email, Mobile, College, Location, State },
                req
            });
            res.status(201).json({
                message: "User created successfully",
                userId: result.insertId
            });
        }
    );
};
const loginUser = async (req, res) => {
    const { Email, Password, captchaId, captchaAnswer } = req.body;
    // Verify CAPTCHA challenge if provided
    if (captchaId || captchaAnswer) {
        const captchaCheck = verifyCaptcha(captchaId, captchaAnswer);
        if (!captchaCheck.valid) {
            return res.status(400).json({
                success: false,
                message: captchaCheck.reason
            });
        }
    }
    if (!Email || !Password) {
        return res.status(400).json({
            message: "Email and Password are required"
        });
    }
    const trimmedEmail = Email.trim().toLowerCase();
    // Check account lockout status
    const lockStatus = await isAccountLocked(trimmedEmail);
    if (lockStatus.locked) {
        return res.status(423).json({
            success: false,
            code: 'ACCOUNT_LOCKED',
            message: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${lockStatus.remainingMinutes} minutes or contact support.`
        });
    }
    usersService.loginUser(trimmedEmail, async (err, users) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }
        if (!users || users.length === 0) {
            recordLoginAttempt({ email: trimmedEmail, status: 'INVALID_USER', failureReason: 'User not found', req });
            return res.status(404).json({
                message: "User not found"
            });
        }
        const user = users[0];
        // Check if user has participant / student role
        if (user.RoleName !== 'user') {
            recordLoginAttempt({ userId: user.Id, email: trimmedEmail, role: user.RoleName, status: 'INVALID_USER', failureReason: 'Wrong portal role', req });
            return res.status(403).json({
                message: "Access Denied: Unauthorized portal access. Please log in via your designated organizer or super admin portal."
            });
        }
        try {
            const isMatch = await bcrypt.compare(
                Password,
                user.Password
            );
            if (!isMatch) {
                recordLoginAttempt({ userId: user.Id, email: trimmedEmail, role: user.RoleName, status: 'FAILED_PASSWORD', failureReason: 'Invalid password', req });
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }
            // Check if Two-Factor Authentication is enabled
            if (user.TwoFactorEnabled) {
                try {
                    const twoFactorResponse = await initiateLogin2FA(user, "user", req);
                    return res.status(200).json({
                        success: true,
                        requires2FA: true,
                        ...twoFactorResponse
                    });
                } catch (tfaErr) {
                    console.error('[UserLogin] Error initiating 2FA:', tfaErr.message);
                    return res.status(500).json({ success: false, message: 'Failed to initiate Two-Factor Authentication code.' });
                }
            }
            // Create active session in database
            let sessionId = null;
            try {
                const session = await sessionService.createSession({
                    userId: user.Id,
                    userEmail: user.Email,
                    userRole: user.RoleName || "user",
                    req
                });
                sessionId = session.sessionId;
            } catch (sErr) {
                console.error('[UserLogin] Failed to register session record:', sErr.message);
            }
            // Record successful login
            recordLoginAttempt({ userId: user.Id, email: trimmedEmail, role: user.RoleName, status: 'SUCCESS', req });
            const token = jwt.sign(
                {
                    Id: user.Id,
                    UserName: user.UserName,
                    Email: user.Email,
                    role: user.RoleName || "user",
                    sessionId
                },
                process.env.JWT_SECRECT || "secret",
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
                }
            );
            // Do not send password hash in response
            const { Password: _, ...userWithoutPassword } = user;
            res.status(200).json({
                message: "Login successful",
                token,
                sessionId,
                user: {
                    ...userWithoutPassword,
                    role: user.RoleName || "user"
                }
            });
        } catch (error) {
            return res.status(500).json({
                message: error.message
            });
        }
    });
};
const getAllUsers = (req, res) => {
    usersService.getAllUsers((err, users) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }
        res.status(200).json({
            users
        });
    });
};
const getUserById = (req, res) => {
    usersService.getUserById(req.params.id, (err, users) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }
        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            user: users[0]
        });
    });
};
const getUserCount = (req, res) => {
    usersService.getUserCount((err, result) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }
        res.status(200).json({
            count: result.userCount,
            userCount: result.userCount,
            membersCount: result.registeredMembersCount || result.totalMembersCount || 0,
            totalMembersCount: result.totalMembersCount || 0,
            registeredMembersCount: result.registeredMembersCount || 0
        });
    });
};
const getUserByEmail = (req, res) => {
    usersService.getUserByEmail(
        req.params.email,
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.status(200).json({
                user: users[0]
            });
        }
    );
};
const updateUser = (req, res) => {
    const {UserName, Email, Mobile, Gender, College, Location, State, Photo } = req.body;
    const id = req.params.id;
    usersService.updateUser(id, UserName, Email, Mobile, Gender, College, Location, State, Photo, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            recordMutation({
                actor: req.user,
                actorUserId: id,
                actorEmail: Email,
                module: 'users',
                action: 'UPDATE_PROFILE',
                entityType: 'user',
                entityId: id,
                newState: { UserName, Email, Mobile, Gender, College, Location, State },
                req
            });
            res.status(200).json({
                message: "User updated successfully",
                result,
                user: {
                    Id: id,
                    UserName,
                    Email,
                    Mobile,
                    Gender,
                    College,
                    Location,
                    State,
                    Photo
                }
            });
        }
    );
};
const checkEmailExists = (req, res) => {
    const email =  req.params.email;
    usersService.checkEmailExists(email, (err, exists) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            res.status(200).json({
                exists
            });
        }
    );
};
const sendPasswordResetOtp = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    usersService.sendPasswordResetOtp(email, (err, result) => {
        if (err) {
            const status = err.status || 500;
            return res.status(status).json({ message: err.message || "Failed to dispatch verification code" });
        }
        res.status(200).json(result);
    });
};
const verifyPasswordResetOtp = (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and verification code are required" });
    }
    usersService.verifyPasswordResetOtp(email, otp, (err, result) => {
        if (err) {
            const status = err.status || 400;
            return res.status(status).json({ message: err.message || "Invalid verification code" });
        }
        res.status(200).json(result);
    });
};
const resetPasswordWithOtp = (req, res) => {
    const { email, otp, resetToken, newPassword } = req.body;
    if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
    }
    usersService.resetPasswordWithOtp(email, otp, resetToken, newPassword, (err, result) => {
        if (err) {
            const status = err.status || 400;
            return res.status(status).json({ message: err.message || "Failed to reset password" });
        }
        recordMutation({
            actorEmail: email,
            module: 'users',
            action: 'RESET_PASSWORD',
            entityType: 'user',
            newState: { email, resetSuccess: true },
            req
        });
        res.status(200).json(result);
    });
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
