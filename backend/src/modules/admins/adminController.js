const adminService = require("../admins/adminServices");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerAdmin = (req,res) => {
    const {AdminName, Email, Password, Mobile} = req.body;

    if(!AdminName || !Email || !Password || !Mobile){
        return res.status(400).json({message: "All fields are required"});
    }

    adminService.createAdmin(AdminName, Email, Password, Mobile, (err, result) => {
        if(err){
            return res.status(500).json({
                message: "Registration failed",
                error: err
            });
        }
        else {
            return res.status(201).json({
                message: "Admin Registered Successfully!"
            });
        }
    });
};

const loginAdminController = (req,res) => {
    const {Email,Password} = req.body;

    if(!Email || !Password){
        return res.status(400).json({
            message: "All fields are required, Check it once"
        });
    }

    adminService.loginAdmin(Email, async(err,result) => {
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

        const isMatch = await bcrypt.compare(Password, admin.Password);
        
        if(!isMatch) {
             return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }

        const token = jwt.sign(
            {
            Id: admin.Id,
            AdminName: admin.AdminName,
            role: "admin" 
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
                AdminName: admin.AdminName,
                Email: admin.Email,
                Mobile: admin.Mobile
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
        if(err) {
            return res.status(500).json({
                message: "Failed to get admins by id",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            message: "Admin fetched successfully",
            events: result
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

        return res.status(200).json({
            message: "Admin deleted successfully"
        });
    });
};

module.exports = {
    registerAdmin,
    loginAdminController,
    getAllAdmin,
    getAdminById,
    deleteAdmin
};