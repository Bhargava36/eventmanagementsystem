const coreTeamService = require("./coreServices");

const createCoreTeam = (req, res) => {
    const { EventId, Role, Name, Phone, Email, Department, Type} = req.body;
    coreTeamService.createCoreTeam( EventId, Role, Name, Phone, Email, Department, Type,(err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to add core team member"
                });
            }

            res.status(201).json({
                message: "Core team member added successfully",
                id: result.insertId
            });
        }
    );
};

const getCoreTeamByEvent = (req, res) => {
    const eventId = req.params.eventId;
    coreTeamService.getCoreTeamByEvent(eventId, (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to get core team"
                });
            }

            res.status(200).json({
                members: result
            });
        }
    );
};

const getCoreTeamById = (req, res) => {
    const id = req.params.id;
    coreTeamService.getCoreTeamById( id, (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to get core team member"
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Core team member not found"
                });
            }

            res.status(200).json({
                member: result[0]
            });
        }
    );
};

const updateCoreTeam = (req, res) => {
    const { Role, Name, Phone, Email, Department, Type} = req.body;
    const id = req.params.id;

    coreTeamService.updateCoreTeam(id, Role, Name, Phone, Email, Department, Type, (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to update core team member"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Core team member not found"
                });
            }

            res.status(200).json({
                message: "Core team member updated successfully",
                result
            });
        }
    );
};

const deleteCoreTeam = (req, res) => {
    const id = req.params.id;
    coreTeamService.deleteCoreTeam(id, (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed to delete core team member"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Core team member not found"
                });
            }

            res.status(200).json({
                message: "Core team member deleted successfully"
            });
        }
    );
};

module.exports = {
    createCoreTeam,
    getCoreTeamByEvent,
    getCoreTeamById,
    updateCoreTeam,
    deleteCoreTeam
};