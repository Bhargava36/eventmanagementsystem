const db = require("../../config/db");

const createGalleryItem = (EventId, ImageUrl, Caption, Season, Year, DisplayOrder, callback) => {
    const query = `INSERT INTO event_gallery (EventId, ImageUrl, Caption, Season, Year, DisplayOrder) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [
        EventId,
        ImageUrl,
        Caption || null,
        Season || 'Highlights',
        Year || new Date().getFullYear().toString(),
        Number(DisplayOrder || 0)
    ];

    db.query(query, values, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const createBulkGalleryItems = (EventId, items, callback) => {
    if (!Array.isArray(items) || items.length === 0) {
        return callback(null, { affectedRows: 0 });
    }

    const values = items.map((item, idx) => [
        EventId,
        typeof item === 'string' ? item : item.ImageUrl,
        typeof item === 'string' ? null : (item.Caption || null),
        typeof item === 'string' ? 'Highlights' : (item.Season || 'Highlights'),
        typeof item === 'string' ? new Date().getFullYear().toString() : (item.Year || new Date().getFullYear().toString()),
        typeof item === 'string' ? idx : Number(item.DisplayOrder || idx)
    ]);

    const query = `INSERT INTO event_gallery (EventId, ImageUrl, Caption, Season, Year, DisplayOrder) VALUES ?`;

    db.query(query, [values], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const getGalleryByEvent = (EventId, callback) => {
    const query = `SELECT Id, EventId, ImageUrl, Caption, Season, Year, DisplayOrder, CreatedAt FROM event_gallery WHERE EventId = ? ORDER BY Season ASC, DisplayOrder ASC, Id DESC`;

    db.query(query, [EventId], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const getGalleryById = (id, callback) => {
    const query = `SELECT Id, EventId, ImageUrl, Caption, Season, Year, DisplayOrder, CreatedAt FROM event_gallery WHERE Id = ? LIMIT 1`;

    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const updateGalleryItem = (id, ImageUrl, Caption, Season, Year, DisplayOrder, callback) => {
    const query = `UPDATE event_gallery SET ImageUrl = ?, Caption = ?, Season = ?, Year = ?, DisplayOrder = ? WHERE Id = ?`;
    const values = [
        ImageUrl,
        Caption || null,
        Season || 'Highlights',
        Year || null,
        Number(DisplayOrder || 0),
        id
    ];

    db.query(query, values, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

const deleteGalleryItem = (id, callback) => {
    const query = `DELETE FROM event_gallery WHERE Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
};

module.exports = {
    createGalleryItem,
    createBulkGalleryItems,
    getGalleryByEvent,
    getGalleryById,
    updateGalleryItem,
    deleteGalleryItem
};
