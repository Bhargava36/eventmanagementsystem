const memberService = require("../team_members/memService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const registerUser = (req, res) => {

    const { UserId, TeamId, Role, Gender } = req.body;

    if (!UserId || !TeamId || !Role || !Gender) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (Role !== "TeamLead" && Role !== "TeamMember") {
        return res.status(400).json({
            message: "Role must be TeamLead or TeamMember"
        });
    }

    if (Gender !== "Male" && Gender !== "Female" && Gender !== "Other") {
        return res.status(400).json({
            message: "Gender must be Male, Female or Other"
        });
    }

    memberService.createUser( UserId, TeamId, Role, Gender, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Registration failed",
                    error: err.message
                });
            }

            return res.status(201).json({
                message: "User added to team successfully",
                teamMemberId: result.insertId
            });
        }
    );
};


const loginUser = (req, res) => {

    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({
            message: "Email and Password are required"
        });
    }

    memberService.loginUser(Email, async (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(Password, user.Password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const token = jwt.sign(
            {
                Id: user.UserId,
                Name: user.UserName,
                role: user.Role,
                TeamId: user.TeamId
            },
            process.env.JWT_SECRECT,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                Id: user.UserId,
                Name: user.UserName,
                Email: user.Email,
                PhoneNumber: user.PhoneNumber,
                TeamId: user.TeamId,
                Role: user.Role,
                Gender: user.Gender
            }
        });
    });
};


const getAllUsers = (req, res) => {

    memberService.getAllUsers((err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to get users",
                error: err.message
            });
        }

        return res.status(200).json({
            message: "Users fetched successfully",
            users: result
        });
    });
};


const getUsersById = (req, res) => {

    const id = req.params.id;

    memberService.getusersById(id, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to get user by id",
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: result[0]
        });
    });
};


const getUsersByTeamId = (req, res) => {

    const teamId = req.params.teamid;

    memberService.getusersByTeamId(teamId, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to get users by team id",
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "No users found in this team"
            });
        }

        return res.status(200).json({
            message: "Team users fetched successfully",
            users: result
        });
    });
};


const getUserCount = (req, res) => {

    memberService.getUserCount((err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to get user count",
                error: err.message
            });
        }

        return res.status(200).json({
            message: "User count fetched successfully",
            count: result.userCount
        });
    });
};


const updateUserById = (req, res) => {

    const id = req.params.id;

    const { UserId, TeamId, Role, Gender } = req.body;

    if (!UserId || !TeamId || !Role || !Gender) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (Role !== "TeamLead" && Role !== "TeamMember") {
        return res.status(400).json({
            message: "Role must be TeamLead or TeamMember"
        });
    }

    if (Gender !== "Male" && Gender !== "Female" && Gender !== "Other") {
        return res.status(400).json({
            message: "Gender must be Male, Female or Other"
        });
    }

    memberService.updateUserById(id, UserId, TeamId, Role, Gender, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "User update failed",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "User updated successfully"
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
    getUserCount,
    updateUserById
};