const userService = require('./usersServices');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createUser = (req, res) => {
    const {UserName, Email, Password, College, Location, State, Mobile } = req.body;

    if( !UserName || !Email || !Password || !College || !Location || !State || !Mobile) {
        return res.status(400).json({message: "All fields are required"});
    }

    userService.createUser(UserName, Email, Password, College, Location, State, Mobile, (err, result) => {
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

const loginUser = (req, res) => {
    const {Email, Password} = req.body;

    if(!Email || !Password){
        return res.status(400).json({
            message: "All fields are required, Check it once"
        });
    }

    userService.loginUser(Email, async(err, result) => {
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
                State: users.State,
                Mobile: users.Mobile
            }
        });
    });
};

const getAllUsers = (req, res) => {

    userService.getAllUsers((err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to get users",
                error: err
            });
        }

        return res.status(200).json({
            message: "users fetched successfully",
            events: result
        });
    });
};

const getUserById = (req, res) => {
    const id = req.params.id;

    userService.getUserById(id, (err, result) => {
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

    userService.getUserCount((err, result) => {

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

const updateUser = (req, res) => {
    const { id } = req.params;
    const { UserName, Email, College, Location, State, Mobile } = req.body;

    userService.updateUser(id, UserName, Email, College, Location, State, Mobile, (err, result) => {
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
    createUser,
    loginUser,
    getAllUsers,
    getUserById,
    getUserCount,
    updateUser
};