const db = require("../../config/db");
const adminService = require("../admins/adminServices");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sessionService = require("../security/sessionService");
const { recordLoginAttempt, isAccountLocked } = require("../security/securityAlertService");
const { recordMutation } = require("../security/auditService");
const { verifyCaptcha } = require("../../utils/captchaService");
const { initiateLogin2FA } = require("../security/twoFactorService");
const registerAdmin = (req, res) => {
    const { AdminName, Email, Password, Mobile, EventId } = req.body;
    if (!AdminName || !Email || !EventId) {
        return res.status(400).json({ message: "AdminName, Email and EventId are required" });
    }
    adminService.createAdmin(AdminName, Email, Password, Mobile, EventId, (err, result) => {
        if (err) {
            const statusCode = err.statusCode || 400;
            return res.status(statusCode).json({
                message: err.message || "Registration failed",
                error: err
            });
        }
        recordMutation({
            actor: req.user,
            module: 'admins',
            action: 'CREATE_ADMIN',
            entityType: 'admin',
            entityId: result?.insertId,
            eventId: EventId,
            newState: { AdminName, Email, EventId },
            req
        });
        return res.status(201).json({
            message: "Admin Registered Successfully!"
        });
    });
};
const loginAdminController = async (req, res) => {
    const { Email, Password, EventName, captchaId, captchaAnswer } = req.body;
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
    const cleanEmail = (Email || '').trim().toLowerCase();
    // Check account lockout status
    const lockStatus = await isAccountLocked(cleanEmail);
    if (lockStatus.locked) {
        return res.status(423).json({
            success: false,
            code: 'ACCOUNT_LOCKED',
            message: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${lockStatus.remainingMinutes} minutes or contact support.`
        });
    }
    adminService.loginAdmin(cleanEmail, EventName, async (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }
        if (!result || result.length === 0) {
            recordLoginAttempt({ email: cleanEmail, role: 'admin', status: 'INVALID_USER', failureReason: 'Admin account or event mismatch', req });
            const trimmedEmail = cleanEmail;
            db.query('SELECT u.Id, r.RoleName FROM users u JOIN roles r ON u.RoleId = r.Id WHERE LOWER(u.Email) = ?', [trimmedEmail], (uErr, uRows) => {
                if (!uErr && uRows && uRows.length > 0 && uRows[0].RoleName !== 'admin') {
                    return res.status(403).json({
                        message: "Access Denied: Unauthorized portal access. Please log in via your designated portal."
                    });
                }
                return res.status(401).json({
                    message: "Invalid Email or Password"
                });
            });
            return;
        }
        const admin = result[0];
        const isMatch = await bcrypt.compare(Password, admin.Password);
        if (!isMatch) {
            recordLoginAttempt({ userId: admin.Id, email: cleanEmail, role: 'admin', status: 'FAILED_PASSWORD', failureReason: 'Invalid password', req });
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }
        // Check if Two-Factor Authentication is enabled
        if (admin.TwoFactorEnabled) {
            try {
                const twoFactorResponse = await initiateLogin2FA(admin, "admin", req);
                return res.status(200).json({
                    success: true,
                    requires2FA: true,
                    ...twoFactorResponse
                });
            } catch (tfaErr) {
                console.error('[AdminLogin] Error initiating 2FA:', tfaErr.message);
                return res.status(500).json({ success: false, message: 'Failed to initiate Two-Factor Authentication code.' });
            }
        }
        // Create active session in database
        let sessionId = null;
        try {
            const session = await sessionService.createSession({
                userId: admin.Id,
                userEmail: admin.Email,
                userRole: "admin",
                req
            });
            sessionId = session.sessionId;
        } catch (sErr) {
            console.error('[AdminLogin] Failed to register session record:', sErr.message);
        }
        // Record successful login
        recordLoginAttempt({ userId: admin.Id, email: cleanEmail, role: 'admin', status: 'SUCCESS', req });
        const token = jwt.sign(
            {
                Id: admin.Id,
                AdminName: admin.AdminName,
                UserName: admin.UserName,
                EventId: admin.EventId,
                EventName: admin.EventName,
                HackathonMode: admin.HackathonMode,
                EventType: admin.EventType || 'Hackathon',
                Photo: admin.Photo || null,
                role: "admin",
                events: admin.events || [],
                sessionId
            },
            process.env.JWT_SECRECT || "secret",
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );
        return res.status(200).json({
            message: "Login Successful",
            token,
            sessionId,
            admin: {
                Id: admin.Id,
                AdminName: admin.AdminName,
                UserName: admin.UserName,
                Email: admin.Email,
                Mobile: admin.Mobile,
                EventId: admin.EventId,
                EventName: admin.EventName,
                HackathonMode: admin.HackathonMode,
                EventType: admin.EventType || 'Hackathon',
                Photo: admin.Photo || null,
                role: "admin",
                events: admin.events || []
            }
        });
    });
};
const getAllAdmin = (req, res) => {
    adminService.getAllAdmin((err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to get admins",
                error: err
            });
        }
        return res.status(200).json({
            message: "Admins fetched successfully",
            events: result
        });
    });
};
const getAdminById = (req, res) => {
    const id = req.params.id;
    adminService.getAdminById(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to get admins by id",
                error: err
            });
        }
        if (result.length === 0) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }
        const adminObj = result[0];
        return res.status(200).json({
            message: "Admin fetched successfully",
            admin: adminObj,
            events: adminObj.events || []
        });
    });
};
const getAdminByEventId = (req, res) => {
    const EventId = req.params.EventId;
    adminService.getAdminByEventId(EventId, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to get admins by event",
                error: err
            });
        }
        return res.status(200).json({
            message: "Admins fetched successfully",
            admins: result
        });
    });
};
const assignEventToAdmin = (req, res) => {
    const { AdminId, EventId, Role } = req.body;
    if (!AdminId || !EventId) {
        return res.status(400).json({
            message: "AdminId and EventId are required"
        });
    }
    adminService.assignEventToAdmin(AdminId, EventId, Role || 'Organizer', (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to assign event to admin",
                error: err
            });
        }
        recordMutation({
            actor: req.user,
            module: 'admins',
            action: 'ASSIGN_ADMIN_EVENT',
            entityType: 'admin_event',
            entityId: AdminId,
            eventId: EventId,
            newState: { AdminId, EventId, Role: Role || 'Organizer' },
            req
        });
        return res.status(200).json({
            message: "Event assigned to admin successfully",
            result
        });
    });
};
const removeAdminFromEvent = (req, res) => {
    const { AdminId, EventId } = req.params;
    if (!AdminId || !EventId) {
        return res.status(400).json({
            message: "AdminId and EventId are required"
        });
    }
    adminService.removeAdminFromEvent(AdminId, EventId, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to remove admin from event",
                error: err
            });
        }
        recordMutation({
            actor: req.user,
            module: 'admins',
            action: 'REMOVE_ADMIN_EVENT',
            entityType: 'admin_event',
            entityId: AdminId,
            eventId: EventId,
            req
        });
        return res.status(200).json({
            message: "Admin removed from event successfully",
            result
        });
    });
};
const updateAdmin = (req, res) => {
    const { id } = req.params;
    const { AdminName, Email, Mobile, EventId, Photo } = req.body;
    adminService.updateAdmin(id, AdminName, Email, Mobile, EventId, Photo, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to update admin",
                error: err
            });
        }
        recordMutation({
            actor: req.user,
            module: 'admins',
            action: 'UPDATE_ADMIN',
            entityType: 'admin',
            entityId: id,
            eventId: EventId,
            newState: { AdminName, Email, Mobile, EventId },
            req
        });
        return res.status(200).json({
            message: "Admin updated successfully",
            admin: {
                Id: id,
                AdminName,
                UserName: AdminName,
                Email,
                Mobile,
                EventId,
                Photo
            }
        });
    });
};
const deleteAdmin = (req, res) => {
    const id = req.params.id;
    adminService.deleteAdmin(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Admin deletion failed",
                error: err
            });
        }
        recordMutation({
            actor: req.user,
            module: 'admins',
            action: 'DELETE_ADMIN',
            entityType: 'admin',
            entityId: id,
            req
        });
        return res.status(200).json({
            message: "Admin deleted successfully"
        });
    });
};
const switchEvent = (req, res) => {
    const { AdminId, EventId } = req.body;
    if (!AdminId || !EventId) {
        return res.status(400).json({
            message: "AdminId and EventId are required"
        });
    }
    adminService.switchActiveEvent(AdminId, EventId, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to switch active event",
                error: err
            });
        }
        return res.status(200).json({
            message: "Active event switched successfully"
        });
    });
};
module.exports = {
    registerAdmin,
    loginAdminController,
    getAllAdmin,
    getAdminById,
    getAdminByEventId,
    assignEventToAdmin,
    removeAdminFromEvent,
    switchEvent,
    updateAdmin,
    deleteAdmin
};
