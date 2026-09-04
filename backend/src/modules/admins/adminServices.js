const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createAdmin = async (AdminName, Email, Password, Mobile, EventId, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password,10);

        const query = "insert into admins (AdminName, Email, Password, Mobile, EventId) values (?,?,?,?,?)";
        db.query(query, [AdminName, Email, hashedPassword, Mobile, EventId], (err, result) => {
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

const loginAdmin = (Email, callback) => {
    const query = "select Id, AdminName, Email, Mobile, Password from admins where Email = ?";
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

const getAllAdmin = (callback) => {

    const query = ` SELECT * FROM admins ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAdminById = (id, callback) => {
    const query = ` SELECT * FROM admins where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getAdminByEventId = (EventId, callback) => {

    const query = `SELECT admins.Id, admins.AdminName, admins.Email, admins.Mobile, admins.EventId, events.EventName FROM admins JOIN events ON admins.EventId = events.Id WHERE admins.EventId = ?`;

    db.query(query, [EventId], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const deleteAdmin = (id, callback) => {

    const query = ` DELETE FROM admins WHERE Id = ? `;

    db.query(query, [id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    }
    );
};


module.exports = {
    createAdmin,
    loginAdmin,
    getAllAdmin,
    getAdminById,
    getAdminByEventId,
    deleteAdmin
};