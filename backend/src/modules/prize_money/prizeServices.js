const db = require("../../config/db");

const addPrizes = (eventId, prizes, callback) => {
    const query = `INSERT INTO event_prizes (EventId, PrizeRank, Prize) VALUES ?`;

    const values = prizes.map((prize, index) => [eventId, index + 1, prize.prize]);

    db.query(query, [values], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getPrizesByEvent = (eventId, callback) => {
    const query = `SELECT Id, EventId, PrizeRank, Prize FROM event_prizes WHERE EventId = ? ORDER BY PrizeRank ASC`;

    db.query(query, [eventId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getPrizeById = (id, callback) => {
    const query = `SELECT Id, EventId, PrizeRank, Prize FROM event_prizes WHERE Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result[0]);
    });
};

const updatePrize = (id, prize, callback) => {
    const query = `UPDATE event_prizes SET Prize = ? WHERE Id = ? `;

    db.query(query, [prize, id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const deletePrize = (id, callback) => {
    const query = `DELETE FROM event_prizes WHERE Id = ? `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

module.exports = {
    addPrizes,
    getPrizesByEvent,
    getPrizeById,
    updatePrize,
    deletePrize
};