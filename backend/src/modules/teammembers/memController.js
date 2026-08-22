const memberService = require("../teammembers/memService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = (req,res) => {
    const {Name, Email, Password, Role, PhoneNumber, TeamId, Gender} = req.body;

    if(!Name || !Email || !Password || !Role || !PhoneNumber || !TeamId || !Gender){
        return res.status(400).json({message: "All fields are required"});
    }

    if(Role !== 'TeamLead' && Role !== 'TeamMember') {
        return res.status(400).json({
            message : "Role must be Team lead or member"
        });
    }

    memberService.createUser(Name, Email, Password, Role, PhoneNumber, TeamId, Gender, (err, result) => {
        if(err){
            return res.status(500).json({
                message: "Registration failed",
                error: err
            });
        }
        else {
            return res.status(201).json({
                message: "User Registered Successfully!"
            });
        }
    });
};

const loginUser = (req,res) => {
    const {Email,Password} = req.body;

    if(!Email || !Password){
        return res.status(400).json({
            message: "All fields are required, Check it once"
        });
    }

    memberService.loginUser(Email, async(err,result) => {
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
        const user = result[0];

        const isMatch = await bcrypt.compare(Password, user.Password);
        if(!isMatch) {
             return res.status(401).json({
                message: "Invalid UserName or Password"
            });
        }

        const token = jwt.sign(
            {
            Id: user.Id,
            Name: user.Name,
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
            user: {
                Id: user.Id,
                Name: user.AdminName,
                Email: user.Email,
                PhoneNumber: user.PhoneNumber
            }
        });
    });
};

const getAllUsers = (req, res) => {

    memberService.getAllUsers((err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to get uses",
                error: err
            });
        }

        return res.status(200).json({
            message: "users fetched successfully",
            events: result
        });
    });
};

const getUsersById = (req, res) => {
    const id = req.params.id;
    memberService.getusersById(id, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get user by id",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            events: result
        });
    });
};

const getUsersByTeamId = (req, res) => {
    const teamid = req.params.teamid;
    memberService.getusersById(teamid, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get users by teamid",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "team not found"
            });
        }

        return res.status(200).json({
            message: "Users fetched successfully",
            events: result
        });
    });
};


const updateUserById = (req, res) => {

    const id = req.params.id;

    const { Name, Email, Password, Role, PhoneNumber, TeamId, Gender } = req.body;

    if (!Name || !Email || !Password || !Role || !PhoneNumber || !TeamId || !Gender) {

        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if(Role !== 'TeamLead' && Role !== 'TeamMember') {
        return res.status(400).json({
            message : "Role must be Team lead or member"
        });
    }

    memberService.updateUserById( id, Name, Email, Password, Role, PhoneNumber, TeamId, Gender, (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "users update failed",
                    error: err
                });
            }

            return res.status(200).json({
                message: "users updated successfully"
            });
        }
    );
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUsersById,
    getUsersByTeamId,
    updateUserById
};