const db = require("../../config/db");
const bcrypt = require("bcrypt");

const createUser = async (UserName, Email, Password, Mobile, Gender, College, Location, State, callback, RoleId = 3) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const query = `INSERT INTO users (UserName, Email, Password, Mobile, Gender, College, Location, State, RoleId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [UserName, Email, hashedPassword, Mobile, Gender, College, Location, State, RoleId], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            return callback(null, result);
        });
    }
    catch (err) {
        return callback(err, null);
    }
};

const loginUser = (Email, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Password, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE LOWER(u.Email) = LOWER(?)
    `;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllUsers = (callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, u.CreatedAt, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        ORDER BY u.CreatedAt DESC
    `;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserById = (id, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, u.CreatedAt, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE u.Id = ?
    `;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserCount = (callback) => {
    const query = `SELECT COUNT(*) AS userCount FROM users WHERE RoleId = 3`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getUserByEmail = (Email, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile, u.Gender, u.College, u.Location, u.State, u.RoleId, u.EventId, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE LOWER(u.Email) = LOWER(?)
    `;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateUser = ( id, UserName, Email, Mobile, Gender, College, Location, State, callback ) => {
    const query = `UPDATE users SET UserName = ?, Email = ?, Mobile = ?, Gender = ?, College = ?, Location = ?, State = ? WHERE Id = ?`;
    db.query( query, [UserName, Email, Mobile, Gender, College, Location, State, id ], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            return callback(null, result);
        }
    );
};

const checkEmailExists = (Email, callback) => {
    const query = `SELECT Id FROM users WHERE LOWER(Email) = LOWER(?) LIMIT 1`;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
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