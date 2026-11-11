const db = require("../../config/db");
const superAdminService = require("../superAdmin/superAdminService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sessionService = require("../security/sessionService");
const { recordLoginAttempt, isAccountLocked } = require("../security/securityAlertService");
const { recordMutation } = require("../security/auditService");
const { verifyCaptcha } = require("../../utils/captchaService");
const { initiateLogin2FA } = require("../security/twoFactorService");
const registerAdmin = (req,res) => {
    const {UserName, Email, Password, PhoneNumber} = req.body;
    if(!UserName || !Email || !Password || !PhoneNumber){
        return res.status(400).json({message: "All fields are required"});
    }
    superAdminService.createAdmin(UserName,Email,Password,PhoneNumber,(err,result) => {
        if(err){
            return res.status(500).json({
                message: err.message || "Registration failed",
                error: err.sqlMessage || err.message || err
            });
        }
        else {
            recordMutation({
                actor: req.user,
                actorEmail: Email,
                actorRole: 'super_admin',
                module: 'super_admin',
                action: 'REGISTER_SUPER_ADMIN',
                entityType: 'super_admin',
                entityId: result?.insertId,
                newState: { UserName, Email, PhoneNumber },
                req
            });
            return res.status(201).json({
                message: "Super Admin Registered Successfully!",
                result : result
            });
        }
    });
};
const loginAdminController = async (req,res) => {
    const {email, password, captchaId, captchaAnswer} = req.body;
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
    if(!email || !password){
        return res.status(400).json({
            message: "Email and password are required"
        });
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    // Check account lockout status
    const lockStatus = await isAccountLocked(cleanEmail);
    if (lockStatus.locked) {
        return res.status(423).json({
            success: false,
            code: 'ACCOUNT_LOCKED',
            message: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${lockStatus.remainingMinutes} minutes or contact platform administration.`
        });
    }
    superAdminService.loginAdmin(cleanEmail, async(err,result) => {
        if(err){
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }
        if (!result || result.length === 0) {
            recordLoginAttempt({ email: cleanEmail, role: 'super_admin', status: 'INVALID_USER', failureReason: 'Account not found', req });
            const trimmedEmail = cleanEmail;
            db.query('SELECT u.Id, r.RoleName FROM users u JOIN roles r ON u.RoleId = r.Id WHERE LOWER(u.Email) = ?', [trimmedEmail], (uErr, uRows) => {
                if (!uErr && uRows && uRows.length > 0 && uRows[0].RoleName !== 'super_admin') {
                    return res.status(403).json({
                        message: "Access Denied: Unauthorized portal access. Please log in via your designated portal."
                    });
                }
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            });
            return;
        }
        const admin = result[0];
        const isMatch = await bcrypt.compare(password, admin.Password);
        if(!isMatch) {
            recordLoginAttempt({ userId: admin.Id, email: cleanEmail, role: 'super_admin', status: 'FAILED_PASSWORD', failureReason: 'Invalid password', req });
             return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }
        // Check if Two-Factor Authentication is enabled
        if (admin.TwoFactorEnabled) {
            try {
                const twoFactorResponse = await initiateLogin2FA(admin, "super_admin", req);
                return res.status(200).json({
                    success: true,
                    requires2FA: true,
                    ...twoFactorResponse
                });
            } catch (tfaErr) {
                console.error('[SuperAdminLogin] Error initiating 2FA:', tfaErr.message);
                return res.status(500).json({ success: false, message: 'Failed to initiate Two-Factor Authentication code.' });
            }
        }
        // Create active session in database
        let sessionId = null;
        try {
            const session = await sessionService.createSession({
                userId: admin.Id,
                userEmail: admin.Email,
                userRole: "super_admin",
                req
            });
            sessionId = session.sessionId;
        } catch (sErr) {
            console.error('[SuperAdminLogin] Failed to register session record:', sErr.message);
        }
        // Record successful login
        recordLoginAttempt({ userId: admin.Id, email: cleanEmail, role: 'super_admin', status: 'SUCCESS', req });
        const token = jwt.sign(
            {
                Id: admin.Id,
                UserName: admin.UserName,
                Email: admin.Email,
                role: "super_admin",
                sessionId
            },
            process.env.JWT_SECRECT || "secret",
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );
        return res.status(200).json({
            message:"Login Successful",
            token,
            sessionId,
            admin: {
                Id: admin.Id,
                UserName: admin.UserName,
                Email: admin.Email,
                PhoneNumber: admin.PhoneNumber || admin.Mobile,
                Mobile: admin.Mobile || admin.PhoneNumber,
                Photo: admin.Photo || null,
                role: "super_admin"
            }
        });
    });
};
const getAdminProfile = (req, res) => {
    const { id } = req.params;
    superAdminService.getAdminProfile(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch profile",
                error: err
            });
        }
        if (result.length === 0) {
            return res.status(404).json({
                message: "Super Admin not found"
            });
        }
        return res.status(200).json({
            message: "Profile fetched successfully",
            admin: result[0]
        });
    });
};
const updateAdmin = (req,res) => {
    const { id } = req.params;
    const { UserName, Email, PhoneNumber, Photo } = req.body;
    if(!UserName || !Email || !PhoneNumber){
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    superAdminService.updateAdmin(id, UserName, Email, PhoneNumber, Photo, (err,result) => {
            if(err){
                return res.status(500).json({
                    message: "Profile update failed",
                    error: err
                });
            }
            recordMutation({
                actor: req.user,
                actorEmail: Email,
                actorRole: 'super_admin',
                module: 'super_admin',
                action: 'UPDATE_SUPER_ADMIN_PROFILE',
                entityType: 'super_admin',
                entityId: id,
                newState: { UserName, Email, PhoneNumber },
                req
            });
            return res.status(200).json({
                message: "Profile updated successfully",
                result: result,
                admin: {
                    Id: id,
                    UserName,
                    Email,
                    PhoneNumber,
                    Mobile: PhoneNumber,
                    Photo,
                    role: "super_admin"
                }
            });
        }
    );
};
module.exports = {
    registerAdmin,
    loginAdminController,
    getAdminProfile,
    updateAdmin
};
