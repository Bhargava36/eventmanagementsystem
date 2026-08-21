const db = require('../../config/db');

const createTeam = (TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId, callback) => {

    const query = ` INSERT INTO teams ( TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId];


    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllTeams = (callback) => {

    const query = ` SELECT * FROM teams ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamById = (id, callback) => {
    const query = ` SELECT * FROM teams where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamByCollege = (clg, callback) => {
    const query = `select * from teams where College = ? `;
    db.query(query, [clg], (err, result) => {
        if(err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamByState = (state, callback) => {
    const query = `select * from teams where State = ? `;
    db.query(query, [state], (err, result) => {
        if(err){
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamByStatement = (problemId, callback) => {
    const query = `select * from teams where ProblemStatementId = ? `;
    db.query(query, [problemId], (err, result) => {
        if(err){
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getTeamByTech = (tech, callback) => {
    const query = `select * from teams where Tech_Stack = ? `;
    db.query(query, [tech], (err, result) => {
        if(err){
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateTeamById = (id, TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId, callback) => {
    const query = ` Update teams SET TeamLead = ?, Email = ?, TeamSize = ?, College = ?, State = ?, PhoneNumber = ?, TeamName = ?, ProblemStatementId = ?, Tech_Stack = ?, EventId = ? WHERE Id = ? `;
    db.query(query, [TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId, id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    }
    );
};


module.exports = {
    createTeam,
    getAllTeams,
    getTeamById,
    getTeamByCollege,
    getTeamByState,
    getTeamByStatement,
    getTeamByTech,
    updateTeamById
};