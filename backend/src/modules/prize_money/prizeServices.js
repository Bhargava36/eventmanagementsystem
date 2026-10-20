const db = require("../../config/db");

const addPrizes = (eventId, prizes, callback) => {
    db.query(`DELETE FROM event_prizes WHERE EventId = ?`, [eventId], (deleteErr) => {
        if (deleteErr) {
            return callback(deleteErr, null);
        }

        if (!prizes || prizes.length === 0) {
            return callback(null, { affectedRows: 0 });
        }

        const query = `INSERT INTO event_prizes (EventId, PrizeRank, Prize, Track) VALUES ?`;
        const values = prizes.map((prize, index) => {
            const prizeVal = typeof prize === 'object' && prize !== null ? (prize.prize || prize.Prize || prize.amount || '') : prize;
            const rank = typeof prize === 'object' && prize !== null && (prize.prizeRank || prize.PrizeRank) ? Number(prize.prizeRank || prize.PrizeRank) : index + 1;
            const track = typeof prize === 'object' && prize !== null && (prize.track || prize.Track) ? (prize.track || prize.Track) : 'Overall';
            return [eventId, rank, String(prizeVal), track];
        });

        db.query(query, [values], (err, result) => {
            if (err) {
                return callback(err, null);
            }

            // Also synchronize track prize pools on the parent event record
            let physicalSum = 0;
            let virtualSum = 0;
            let overallSum = 0;

            prizes.forEach((p) => {
                const trk = String(p.track || p.Track || '').trim().toLowerCase();
                const val = parseFloat(String(p.prize || p.Prize || p.amount || '').replace(/[^0-9.]/g, '')) || 0;
                if (trk === 'physical') {
                    physicalSum += val;
                } else if (trk === 'virtual') {
                    virtualSum += val;
                } else {
                    overallSum += val;
                }
            });

            const total = physicalSum + virtualSum + overallSum;
            const updateEvQuery = `UPDATE events SET 
                PhysicalPrizeMoney = COALESCE(?, PhysicalPrizeMoney), 
                VirtualPrizeMoney = COALESCE(?, VirtualPrizeMoney), 
                PrizeMoney = COALESCE(?, PrizeMoney) 
                WHERE Id = ?`;

            const physVal = physicalSum > 0 ? `₹${physicalSum.toLocaleString('en-IN')}` : null;
            const virtVal = virtualSum > 0 ? `₹${virtualSum.toLocaleString('en-IN')}` : null;
            const totVal = total > 0 ? `₹${total.toLocaleString('en-IN')}` : null;

            db.query(updateEvQuery, [physVal, virtVal, totVal, eventId], () => {
                callback(null, result);
            });
        });
    });
};

const getPrizesByEvent = (eventId, callback) => {
    const query = `SELECT Id, EventId, PrizeRank, Prize, Track FROM event_prizes WHERE EventId = ? ORDER BY Track ASC, PrizeRank ASC`;

    db.query(query, [eventId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
};

const getPrizeById = (id, callback) => {
    const query = `SELECT Id, EventId, PrizeRank, Prize, Track FROM event_prizes WHERE Id = ?`;

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