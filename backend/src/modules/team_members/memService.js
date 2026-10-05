const db = require('../../config/db');

const createUser = (UserId, TeamId, Role, Gender, callback) => {
    const query = `INSERT INTO registered_team_members ( UserId, TeamId, Role, Gender ) VALUES (?, ?, ?, ?) `;

    const values = [ UserId, TeamId, Role, Gender];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllUsers = (callback) => {
    const query = `
        SELECT tm.Id, tm.UserId, u.UserName, u.Email, u.Mobile, u.Mobile AS PhoneNumber, COALESCE(u.Gender, tm.Gender) AS UserGender, u.College, u.State, tm.TeamId, tm.Role, COALESCE(u.Gender, tm.Gender) AS Gender, tm.CreatedAt 
        FROM registered_team_members tm 
        LEFT JOIN users u ON tm.UserId = u.Id 
        ORDER BY tm.CreatedAt DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getusersById = (id, callback) => {
    const query = `
        SELECT tm.Id, tm.UserId, u.UserName, u.Email, u.Mobile, u.Mobile AS PhoneNumber, COALESCE(u.Gender, tm.Gender) AS UserGender, u.College, u.State, tm.TeamId, tm.Role, COALESCE(u.Gender, tm.Gender) AS Gender, tm.CreatedAt 
        FROM registered_team_members tm 
        LEFT JOIN users u ON tm.UserId = u.Id 
        WHERE tm.Id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getusersByTeamId = (teamId, callback) => {
    const query = `
        SELECT tm.Id, tm.UserId, u.UserName, u.Email, u.Mobile, u.Mobile AS PhoneNumber, COALESCE(u.Gender, tm.Gender) AS UserGender, u.College, u.State, tm.TeamId, tm.Role, COALESCE(u.Gender, tm.Gender) AS Gender, tm.CreatedAt 
        FROM registered_team_members tm 
        LEFT JOIN users u ON tm.UserId = u.Id 
        WHERE tm.TeamId = ? 
        ORDER BY CASE WHEN LOWER(tm.Role) = 'teamlead' THEN 1 ELSE 2 END, tm.CreatedAt ASC
    `;

    db.query(query, [teamId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getUserCount = (callback) => {
    const query = `SELECT COUNT(*) AS userCount FROM registered_team_members`;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result[0]);
    });
};

const updateUserById = (id, UserId, TeamId, Role, Gender, callback) => {
    const query = `UPDATE registered_team_members SET UserId = ?, TeamId = ?, Role = ?, Gender = ? WHERE Id = ?`;

    const values = [ UserId, TeamId, Role, Gender, id];

    db.query(query, values, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

module.exports = {
    createUser,
    getAllUsers,
    getusersById,
    getusersByTeamId,
    getUserCount,
    updateUserById
};