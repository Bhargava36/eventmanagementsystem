const db = require("../../config/db");
const bcrypt = require('bcrypt');

const createTeamLead = async (LeadName, Email, Password, College, Location, State, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const query = `insert into teamlead (LeadName, Email, Password, College, Location, State) values (?,?,?,?,?,?)`;
        db.query(query, [LeadName, Email, hashedPassword, College, Location, State], (err, result) => {
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
    const query = "Select Id, LeadName, Email, Password, College, Location, State from teamlead where Email = ?";
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

    const query = ` SELECT * FROM teamlead ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamLeadById = (id, callback) => {
    const query = ` SELECT * FROM teamlead where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateTeamLead = (id, LeadName, Email,College, Location, State, callback) => {
    const query = `UPDATE teamlead SET LeadName = ?, Email = ?, College = ?, Location = ?, State = ? WHERE Id = ?`;
    db.query(query, [LeadName, Email, College, Location, State, id], (err, result) => {
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