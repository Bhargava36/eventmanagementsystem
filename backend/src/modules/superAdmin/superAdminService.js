const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createAdmin = async (UserName, Email, Password, PhoneNumber, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password,10);

        const query = "insert into superadmin (UserName, Email, Password, PhoneNumber, created_at) values (?,?,?,?,?)";
        db.query(query, [UserName, Email, hashedPassword, PhoneNumber], (err, result) => {
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
    const query = "select Id, UserName, Email, PhoneNumber, Password, created_at from superadmin where Email = ?";
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

const getAdminProfile = (id, callback) => {
    const query = "SELECT Id, UserName, Email, PhoneNumber, created_at FROM superadmin WHERE Id = ?";

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateAdmin = (id, UserName, Email, PhoneNumber, created_at, callback) => {
    const query = `UPDATE superadmin SET UserName = ?, Email = ?, PhoneNumber = ?, created_at = ? WHERE Id = ?`;
    db.query(query, [UserName, Email, PhoneNumber, created_at, id], (err, result) => {
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result);
            }
        }
    );
};

module.exports = {
    createAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdmin
};