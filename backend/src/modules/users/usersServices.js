const db = require("../../config/db");
const bcrypt = require("bcrypt");

const createUser = async (UserName, Email, Password, Mobile, Gender, College, Location, State, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const query = ` INSERT INTO users (UserName, Email, Password, Mobile, Gender, College, Location, State) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(query, [UserName, Email, hashedPassword, Mobile, Gender, College, Location, State], (err, result) => {
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
    const query = `SELECT Id, UserName, Email, Password, Mobile, Gender, College, Location, State FROM users WHERE Email = ? `;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllUsers = (callback) => {
    const query = `SELECT * FROM users ORDER BY CreatedAt DESC `;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserById = (id, callback) => {
    const query = ` SELECT * FROM users WHERE Id = ?`;
    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserCount = (callback) => {
    const query = `SELECT COUNT(*) AS userCount FROM users`;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const getUserByEmail = (Email, callback) => {
    const query = `SELECT Id, UserName, Email, Mobile, Gender, College, Location, State FROM users WHERE Email = ?`;
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
    const query = `SELECT Id FROM users WHERE Email = ? LIMIT 1`;
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