const usersService = require("./usersServices");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const createUser = (req, res) => {
    const {UserName, Email, Password, Mobile, Gender, College, Location, State } = req.body;
    usersService.createUser(UserName, Email, Password, Mobile, Gender, College, Location, State, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }
            res.status(201).json({
                message: "User created successfully",
                userId: result.insertId
            });
        }
    );
};

const loginUser = (req, res) => {
    const { Email, Password } = req.body;
    usersService.loginUser(Email, async (err, users) => {
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

        const user = users[0];

        try {
            const isMatch = await bcrypt.compare(
                Password,
                user.Password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
                {
                    Id: user.Id,
                    UserName: user.UserName,
                    Email: user.Email,
                    role: "user"
                },
                process.env.JWT_SECRECT || "secret",
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
                }
            );

            res.status(200).json({
                message: "Login successful",
                token,
                user
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
            count: result.userCount
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
    const {UserName, Email, Mobile, Gender, College, Location, State } = req.body;
    const id = req.params.id;
    usersService.updateUser(id, UserName, Email, Mobile, Gender, College, Location, State, (err, result) => {
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

            res.status(200).json({
                message: "User updated successfully",
                result
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

module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getUserCount,
    getUserById,
    getUserByEmail,
    updateUser,
    checkEmailExists
};