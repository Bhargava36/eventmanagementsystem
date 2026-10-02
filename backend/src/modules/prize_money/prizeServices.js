const db = require("../../config/db");

const addPrizes = (eventId, prizes, callback) => {
    db.query(`DELETE FROM event_prizes WHERE EventId = ?`, [eventId], (deleteErr) => {
        if (deleteErr) {
            return callback(deleteErr, null);
        }

        if (!prizes || prizes.length === 0) {
            return callback(null, { affectedRows: 0 });
        }

        const query = `INSERT INTO event_prizes (EventId, PrizeRank, Prize) VALUES ?`;
        const values = prizes.map((prize, index) => {
            const prizeVal = typeof prize === 'object' && prize !== null ? (prize.prize || prize.Prize || '') : prize;
            return [eventId, index + 1, String(prizeVal)];
        });

        db.query(query, [values], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
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