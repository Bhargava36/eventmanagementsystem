const db = require("../../config/db");

const getAllRoles = (req, res) => {
    const query = "SELECT Id, RoleName, Description, CreatedAt FROM roles ORDER BY Id ASC";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch roles", error: err.message });
        }
        res.status(200).json({ roles: results });
    });
};

const getRoleById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT Id, RoleName, Description, CreatedAt FROM roles WHERE Id = ?";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Failed to fetch role", error: err.message });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Role not found" });
        }
        res.status(200).json({ role: results[0] });
    });
};

module.exports = {
    getAllRoles,
    getRoleById
};
