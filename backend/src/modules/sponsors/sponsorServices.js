const db = require("../../config/db");

const createSponsor = (EventId, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder, callback) => {
    const query = `INSERT INTO event_sponsors (EventId, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [EventId, Name, LogoUrl || null, Tier || 'Partner', WebsiteUrl || null, Number(DisplayOrder || 0)];

    db.query(query, values, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const getSponsorsByEvent = (EventId, callback) => {
    const query = `SELECT Id, EventId, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder, CreatedAt FROM event_sponsors WHERE EventId = ? ORDER BY DisplayOrder ASC, Id ASC`;

    db.query(query, [EventId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const getSponsorById = (id, callback) => {
    const query = `SELECT Id, EventId, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder, CreatedAt FROM event_sponsors WHERE Id = ? LIMIT 1`;

    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const updateSponsor = (id, Name, LogoUrl, Tier, WebsiteUrl, DisplayOrder, callback) => {
    const query = `UPDATE event_sponsors SET Name = ?, LogoUrl = ?, Tier = ?, WebsiteUrl = ?, DisplayOrder = ? WHERE Id = ?`;
    const values = [Name, LogoUrl || null, Tier || 'Partner', WebsiteUrl || null, Number(DisplayOrder || 0), id];

    db.query(query, values, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const deleteSponsor = (id, callback) => {
    const query = `DELETE FROM event_sponsors WHERE Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

module.exports = {
    createSponsor,
    getSponsorsByEvent,
    getSponsorById,
    updateSponsor,
    deleteSponsor
};
