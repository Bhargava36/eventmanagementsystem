const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createAdmin = async (UserName, Email, Password, PhoneNumber, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password,10);

        const query = "insert into superadmin (UserName, Email, Password, PhoneNumber) values (?,?,?,?)";
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
    const query = "select Id, UserName, Email, PhoneNumber, Password from superadmin where Email = ?";
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

module.exports = {
    createAdmin,
    loginAdmin
};