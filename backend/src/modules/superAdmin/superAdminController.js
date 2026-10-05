const db = require("../../config/db");
const superAdminService = require("../superAdmin/superAdminService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
            return res.status(201).json({
                message: "Super Admin Registered Successfully!",
                result : result
            });
        }
    });
};

const loginAdminController = (req,res) => {
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    superAdminService.loginAdmin(email, async(err,result) => {
        if(err){
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }
        if (!result || result.length === 0) {
            const trimmedEmail = email.trim().toLowerCase();
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
             return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }

        const token = jwt.sign(
            {
                Id: admin.Id,
                UserName: admin.UserName,
                Email: admin.Email,
                role: "super_admin" 
            },
            process.env.JWT_SECRECT || "secret",
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "7d"
            }
        );
        return res.status(200).json({
            message:"Login Successful",
            token,
            admin: {
                Id: admin.Id,
                UserName: admin.UserName,
                Email: admin.Email,
                PhoneNumber: admin.PhoneNumber || admin.Mobile,
                Mobile: admin.Mobile || admin.PhoneNumber,
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
    const { UserName, Email, PhoneNumber } = req.body;

    if(!UserName || !Email || !PhoneNumber){
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    superAdminService.updateAdmin(id, UserName, Email, PhoneNumber, (err,result) => {
            if(err){
                return res.status(500).json({
                    message: "Profile update failed",
                    error: err
                });
            }

            return res.status(200).json({
                message: "Profile updated successfully",
                result: result
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