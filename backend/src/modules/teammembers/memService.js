const db = require('../../config/db');
const bcrypt = require('bcrypt');

const createUser = async (Name, Email, Password, Role, PhoneNumber, TeamId, Gender, callback) => {
    try {
        const hashedPassword = await bcrypt.hash(Password,10);

        const query = "insert into teammembers (Name, Email, Password, Role, PhoneNumber, TeamId, Gender) values (?,?,?,?,?,?,?)";
        db.query(query, [Name, Email, Role, PhoneNumber, TeamId, Gender, hashedPassword ], (err, result) => {
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

const loginUser = (Email, callback) => {
    const query = "select Id, Name, Email, Password, Role, PhoneNumber, TeamId, Gender from teammembers where Email = ?";
    db.query(query, [Email], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        else {
            return callback(null, result);
        }
    });
};

const getAllUsers = (callback) => {

    const query = ` SELECT * FROM teammembers ORDER BY CreatedAt DESC `;

    db.query(query, (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getusersById = (id, callback) => {
    const query = ` SELECT * FROM teammembers where Id = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const getusersByTeamId = (id, callback) => {
    const query = ` SELECT * FROM teammembers where TeamId = ?`;

    db.query(query, [id], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    });
};

const updateUserById = (id, Name, Email, Password, Role, PhoneNumber, TeamId, Gender, callback) => {
    const query = ` Update teammembers SET Name = ?, Email = ?, Password = ?, Role = ?, PhoneNumber = ?, TeamId = ?, Gender = ? WHERE Id = ? `;
    db.query(query, [Name, Email, Password, Role, PhoneNumber, TeamId, Gender, id], (err, result) => {

        if (err) {
            return callback(err, null);
        }

        return callback(null, result);
    }
    );
};

module.exports = {
    createUser,
    loginUser,
    getAllUsers,
    getusersById,
    getusersByTeamId,
    updateUserById
};