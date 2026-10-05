const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createAdmin = async (AdminName, Email, Password, Mobile, EventId, callback) => {
    try {
        const countQuery = "SELECT COUNT(*) AS adminCount FROM users WHERE EventId = ? AND RoleId = 2";
        db.query(countQuery, [EventId], async (countErr, countResult) => {
            if (countErr) {
                return callback(countErr, null);
            }

            if (countResult && countResult[0] && countResult[0].adminCount >= 3) {
                const limitError = new Error("Maximum limit reached. An event can have up to 3 admins only.");
                limitError.statusCode = 400;
                return callback(limitError, null);
            }

            const hashedPassword = await bcrypt.hash(Password, 10);
            const trimmedEmail = (Email || '').trim().toLowerCase();

            // Check if user already exists
            const checkQuery = "SELECT Id FROM users WHERE LOWER(Email) = ?";
            db.query(checkQuery, [trimmedEmail], (chkErr, chkRows) => {
                if (chkErr) return callback(chkErr, null);

                if (chkRows && chkRows.length > 0) {
                    // Update user to admin
                    const updateQuery = "UPDATE users SET UserName = ?, Password = ?, Mobile = ?, EventId = ?, RoleId = 2 WHERE Id = ?";
                    db.query(updateQuery, [AdminName, hashedPassword, Mobile, EventId, chkRows[0].Id], (upErr, upRes) => {
                        if (upErr) return callback(upErr, null);
                        return callback(null, { insertId: chkRows[0].Id, affectedRows: upRes.affectedRows });
                    });
                } else {
                    const insertQuery = "INSERT INTO users (UserName, Email, Password, Mobile, EventId, RoleId) VALUES (?, ?, ?, ?, ?, 2)";
                    db.query(insertQuery, [AdminName, trimmedEmail, hashedPassword, Mobile, EventId], (inErr, inRes) => {
                        if (inErr) return callback(inErr, null);
                        return callback(null, inRes);
                    });
                }
            });
        });
    } catch (err) {
        return callback(err, null);
    }
};

const loginAdmin = (Email, EventName, callback) => {
    const query = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.Password, u.EventId, events.EventName, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        JOIN events ON u.EventId = events.Id 
        WHERE LOWER(u.Email) = LOWER(?) AND TRIM(events.EventName) = TRIM(?) AND r.RoleName = 'admin'
    `;

    db.query(query, [Email, EventName], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAllAdmin = (callback) => {
    const query = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.EventId, u.CreatedAt AS createdAt, events.EventName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        LEFT JOIN events ON u.EventId = events.Id 
        WHERE r.RoleName = 'admin' 
        ORDER BY u.CreatedAt DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAdminById = (id, callback) => {
    const query = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.EventId, u.CreatedAt AS createdAt, events.EventName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        LEFT JOIN events ON u.EventId = events.Id 
        WHERE u.Id = ? AND r.RoleName = 'admin'
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAdminByEventId = (EventId, callback) => {
    const query = `
        SELECT u.Id, u.UserName AS AdminName, u.UserName, u.Email, u.Mobile, u.EventId, u.CreatedAt AS createdAt, events.EventName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        LEFT JOIN events ON u.EventId = events.Id 
        WHERE u.EventId = ? AND r.RoleName = 'admin'
    `;

    db.query(query, [EventId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateAdmin = (id, AdminName, Email, Mobile, EventId, callback) => {
    const query = `UPDATE users SET UserName = ?, Email = ?, Mobile = ?, EventId = ? WHERE Id = ? AND RoleId = 2`;
    db.query(query, [AdminName, Email, Mobile, EventId, id], (err, result) => {
        if (err) {
            return callback(err, null);
        } else {
            return callback(null, result);
        }
    });
};

const deleteAdmin = (id, callback) => {
    // Revert user role to student/user and clear EventId
    const query = `UPDATE users SET RoleId = 3, EventId = NULL WHERE Id = ? AND RoleId = 2`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

module.exports = {
    createAdmin,
    loginAdmin,
    getAllAdmin,
    getAdminById,
    getAdminByEventId,
    updateAdmin,
    deleteAdmin
};