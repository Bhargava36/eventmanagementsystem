const db = require("../../config/db");
const bcrypt = require('bcrypt');

const createTeamLead = async (UserName, Email, Password, College, Location, State, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const query = `insert into users (UserName, Email, Password, College, Location, State) values (?,?,?,?,?,?)`;
        db.query(query, [UserName, Email, hashedPassword, College, Location, State], (err, result) => {
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

const loginTeamLead = (Email, callback) => {
    const query = "Select Id, UserName, Email, Password, College, Location, State from users where Email = ?";
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

const getAllTeamLead = (callback) => {

    const query = ` SELECT * FROM users ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamLeadById = (id, callback) => {
    const query = ` SELECT * FROM users where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateTeamLead = (id, UserName, Email,College, Location, State, callback) => {
    const query = `UPDATE users SET UserName = ?, Email = ?, College = ?, Location = ?, State = ? WHERE Id = ?`;
    db.query(query, [UserName, Email, College, Location, State, id], (err, result) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result);
        }
    });
};

module.exports = {
    createTeamLead,
    loginTeamLead,
    getAllTeamLead,
    getTeamLeadById,
    updateTeamLead
};