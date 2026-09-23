const leadService = require('./usersServices');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createTeamLead = (req, res) => {
    const {UserName, Email, Password, College, Location, State } = req.body;

    if( !UserName || !Email || !Password || !College || !Location || !State) {
        return res.status(400).json({message: "All fields are required"});
    }

    leadService.createTeamLead(UserName, Email, Password, College, Location, State, (err, result) => {
        if(err){
            return res.status(500).json({
                message: "Registration failed",
                error: err
            });
        }
        else {
            return res.status(201).json({
                message: "Users Registered Successfully!",
            });
        }
    });
};

const loginTeamLead = (req, res) => {
    const {Email, Password} = req.body;

    if(!Email || !Password){
        return res.status(400).json({
            message: "All fields are required, Check it once"
        });
    }

    leadService.loginTeamLead(Email, async(err, result) => {
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
        const users = result[0];

        const isMatch = await bcrypt.compare(Password, users.Password);
        
        if(!isMatch) {
             return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }

        const token = jwt.sign(
            {
            Id: users.Id,
            UserName: users.UserName,
            role: "user" 
            },
            process.env.JWT_SECRECT,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
        return res.status(200).json({
            message:"Login Successful",
            token,
            users: {
                Id: users.Id,
                UserName: users.UserName,
                Email: users.Email,
                College: users.College,
                Location: users.Location,
                State: users.State
            }
        });
    });
};

const getAllTeamLead = (req, res) => {

    leadService.getAllTeamLead((err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to get teamleads",
                error: err
            });
        }

        return res.status(200).json({
            message: "users fetched successfully",
            events: result
        });
    });
};

const getTeamLeadById = (req, res) => {
    const id = req.params.id;
    leadService.getTeamLeadById(id, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get users by id",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "users not found"
            });
        }

        return res.status(200).json({
            message: "users fetched successfully",
            events: result
        });
    });
};

const getUserCount = (req, res) => {

    leadService.getUserCount((err, result) => {

        if (err) {
            return res.status(500).json({
                message: 'Failed to get user count',
                error: err.message
            });
        }

        return res.status(200).json({
            message: 'User count fetched successfully',
            count: result.userCount
        });
    });
};

const updateTeamLead = (req, res) => {
    const { id } = req.params;
    const { LeadName, Email, College, Location, State } = req.body;

    leadService.updateTeamLead(id, LeadName, Email, College, Location, State, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to update users",
                error: err
            });
        }

        return res.status(200).json({
            message: "users updated successfully",
            users: result
        });
    });
};

module.exports = {
    createTeamLead,
    loginTeamLead,
    getAllTeamLead,
    getTeamLeadById,
    getUserCount,
    updateTeamLead
};