const db = require("../../config/db");
const bcrypt = require('bcrypt');

const createUser = async (UserName, Email, Password, College, Location, State,Mobile, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const query = `insert into users (UserName, Email, Password, College, Location, State, Mobile) values (?,?,?,?,?,?,?)`;
        db.query(query, [UserName, Email, hashedPassword, College, Location, State, Mobile], (err, result) => {
           if (err) {
                return callback(err, null);
            }
            else {
                return callback(null, result);
            }  
        });
    }
    catch (err) {
        return callback(err, null);
    }
};

const loginUser = (Email, callback) => {
    const query = "Select Id, UserName, Email, Password, College, Location, State, Mobile from users where Email = ?";
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

const getAllUsers = (callback) => {

    const query = ` SELECT * FROM users ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserById = (id, callback) => {
    const query = ` SELECT * FROM users where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserCount = (callback) => {
    const query = ` SELECT COUNT(*) AS userCount FROM users `;
    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result[0]);
    });
};

const updateUser = (id, UserName, Email,College, Location, State,Mobile, callback) => {
    const query = `UPDATE users SET UserName = ?, Email = ?, College = ?, Location = ?, State = ?, Mobile = ? WHERE Id = ?`;
    db.query(query, [UserName, Email, College, Location, State, Mobile, id], (err, result) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result);
        }
    });
};

module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getUserCount,
    getUserById,
    updateUser
};