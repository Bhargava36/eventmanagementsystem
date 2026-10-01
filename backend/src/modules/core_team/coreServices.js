const db = require("../../config/db");

const createCoreTeam = ( EventId, Role, Name, Phone, Email, Department, Type, callback) => {

    const query = `INSERT INTO event_core_team ( EventId, Role, Name, Phone, Email, Department, Type ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [ EventId, Role, Name, Phone, Email, Department, Type];

    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getCoreTeamByEvent = (EventId, callback) => {

    const query = ` SELECT Id, EventId, Role, Name, Phone, Email, Department, Type FROM event_core_team WHERE EventId = ? ORDER BY Id DESC`;

    db.query(query, [EventId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getCoreTeamById = (id, callback) => {

    const query = ` SELECT Id, EventId, Role, Name, Phone, Email, Department, Type FROM event_core_team WHERE Id = ? LIMIT 1`;

    db.query(query, [id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const updateCoreTeam = ( id, Role, Name, Phone, Email, Department, Type, callback) => {

    const query = `UPDATE event_core_team SET Role = ?, Name = ?, Phone = ?, Email = ?, Department = ?, Type = ? WHERE Id = ?`;

    const values = [ Role, Name, Phone, Email, Department, Type, id];

    db.query(query, values, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const deleteCoreTeam = (id, callback) => {

    const query = ` DELETE FROM event_core_team WHERE Id = ?`;

    db.query(query, [id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};


module.exports = {
    createCoreTeam,
    getCoreTeamByEvent,
    getCoreTeamById,
    updateCoreTeam,
    deleteCoreTeam
};