const superAdminService = require("../superAdmin/superAdminService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerAdmin = (req,res) => {
    const {UserName, Email, Password, PhoneNumber} = req.body;

    if(!UserName || !Email || !Password || !PhoneNumber){
        return res.status(400).json({message: "All fields are required"});
    }

    // if(Password !== ConfirmPassword){
    //     return res.status(400).json({message:"Password should not match"});
    // }

    superAdminService.createAdmin(UserName,Email,Password,PhoneNumber,(err,result) => {
        if(err){
            return res.status(500).json({
                message: "Registration failed",
                error: err
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

    superAdminService.loginAdmin(email, async(err,result) => {
        if(err){
            return res.status(500).json({
                message: "Database error",
                error: err
            });
        }
        
        if(result.length === 0){
            return res.status(401).json({
                message: "Invalid UserName or Password"
            });
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
            role: "super_admin" 
            },
            process.env.JWT_SECRECT,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
        return res.status(200).json({
            message:"Login Successful",
            token,
            admin: {
                Id: admin.Id,
                UserName: admin.UserName,
                Email: admin.Email,
                PhoneNumber: admin.PhoneNumber
            }
        });
    });
};

module.exports = {
    registerAdmin,
    loginAdminController
};