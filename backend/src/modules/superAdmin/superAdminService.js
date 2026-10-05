const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createAdmin = async (UserName, Email, Password, PhoneNumber, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const trimmedEmail = (Email || '').trim().toLowerCase();

        // Check if user already exists
        const checkQuery = "SELECT Id FROM users WHERE LOWER(Email) = ?";
        db.query(checkQuery, [trimmedEmail], (chkErr, chkRows) => {
            if (chkErr) return callback(chkErr, null);

            if (chkRows && chkRows.length > 0) {
                const updateQuery = "UPDATE users SET UserName = ?, Password = ?, Mobile = ?, RoleId = 1 WHERE Id = ?";
                db.query(updateQuery, [UserName, hashedPassword, PhoneNumber, chkRows[0].Id], (upErr, upRes) => {
                    if (upErr) return callback(upErr, null);
                    return callback(null, { insertId: chkRows[0].Id, affectedRows: upRes.affectedRows });
                });
            } else {
                const insertQuery = "INSERT INTO users (UserName, Email, Password, Mobile, RoleId, CreatedAt) VALUES (?, ?, ?, ?, 1, NOW())";
                db.query(insertQuery, [UserName, trimmedEmail, hashedPassword, PhoneNumber], (err, result) => {
                    if (err) {
                        return callback(err, null);
                    }
                    return callback(null, result);
                });
            }
        });
    } catch (err) {
        return callback(err, null);
    }
};

const loginAdmin = (Email, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile AS PhoneNumber, u.Mobile, u.Password, u.CreatedAt AS created_at, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE LOWER(u.Email) = LOWER(?) AND r.RoleName = 'super_admin'
    `;
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
};

const getAdminProfile = (id, callback) => {
    const query = `
        SELECT u.Id, u.UserName, u.Email, u.Mobile AS PhoneNumber, u.Mobile, u.CreatedAt AS created_at, r.RoleName 
        FROM users u 
        JOIN roles r ON u.RoleId = r.Id 
        WHERE u.Id = ? AND r.RoleName = 'super_admin'
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateAdmin = (id, UserName, Email, PhoneNumber, callback) => {
    const query = `UPDATE users SET UserName = ?, Email = ?, Mobile = ? WHERE Id = ? AND RoleId = 1`;
    db.query(query, [UserName, Email, PhoneNumber, id], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
};

module.exports = {
    createAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdmin
};
