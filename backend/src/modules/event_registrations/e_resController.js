const eResService = require("./e_resServices");

const createRegistration = (req, res) => {

    const { EventId, TeamId, ParticipationMode, Status, ProblemStatementId} = req.body;

    if (!EventId || !TeamId || !ParticipationMode) {
        return res.status(400).json({
            message: "EventId, TeamId and ParticipateMode are required"
        });
    }

    const validModes = ["Virtual", "Physical", "Virtual and Physical", "Hybrid", "Both"];
    if (!validModes.includes(ParticipationMode)) {
        return res.status(400).json({
            message: "ParticipationMode must be Virtual, Physical, Virtual and Physical, or Hybrid"
        });
    }

    const registrationStatus = Status || "pending";

    if ( registrationStatus !== "pending" && registrationStatus !== "approved" && registrationStatus !== "rejected" && registrationStatus !== "cancelled") {
        return res.status(400).json({
            message: "Invalid registration status"
        });
    }

    eResService.createEventRegistration( Number(EventId), Number(TeamId), ParticipationMode, registrationStatus, ProblemStatementId, (err, result) => {

            if (err) {
                console.log( "CREATE REGISTRATION ERROR:",err);

                return res.status(500).json({
                    message: "Event registration failed",
                    error: err.message
                });
            }

            return res.status(201).json({
                message: "Event registration created successfully",
                registrationId: result.insertId
            });
        }
    );
};

const getAllRegistrations = (req, res) => {

    eResService.getAllEventRegistrations((err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to get event registrations",
                error: err.message
            });
        }

        return res.status(200).json({
            message: "Event registrations fetched successfully",
            registrations: result
        });
    });
};


const getRegistrationById = (req, res) => {

    const id = req.params.id;

    eResService.getEventRegistrationById( id, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get event registration",
                    error: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Event registration not found"
                });
            }

            return res.status(200).json({
                message: "Event registration fetched successfully",
                registration: result[0]
            });
        }
    );
};


const getRegistrationsByEventId = (req, res) => {

    const eventId = req.params.eventId;

    eResService.getRegistrationsByEventId( eventId, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registrations by event",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Event registrations fetched successfully",
                registrations: result
            });
        }
    );
};


const getRegistrationsByTeamId = (req, res) => {

    const teamId = req.params.teamId;

    eResService.getRegistrationsByTeamId( teamId, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registrations by team",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Team registrations fetched successfully",
                registrations: result
            });
        }
    );
};


const getRegistrationsByMode = (req, res) => {

    const mode = req.params.mode;

    const validModes = ["Virtual", "Physical", "Virtual and Physical", "Hybrid", "Both"];
    if (!validModes.includes(mode)) {
        return res.status(400).json({
            message: "Mode must be Virtual, Physical, Virtual and Physical, or Hybrid"
        });
    }

    eResService.getRegistrationsByMode(mode, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registrations by mode",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Registrations fetched successfully",
                registrations: result
            });
        }
    );
};


const getRegistrationsByStatus = (req, res) => {

    const status = req.params.status;

    eResService.getRegistrationsByStatus( status,(err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registrations by status",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Registrations fetched successfully",
                registrations: result
            });
        }
    );
};


const getRegistrationCount = (req, res) => {

    eResService.getRegistrationCount((err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registration count",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Registration count fetched successfully",
                count: result.registrationCount
            });
        }
    );
};


const getRegistrationCountByEvent = (req, res) => {

    const eventId = req.params.eventId;

    eResService.getRegistrationCountByEvent( eventId, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registration count by event",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Registration count fetched successfully",
                count: result.registrationCount
            });
        }
    );
};

const getPendingCountByEvent = (req, res) => {

    const eventId = req.params.eventId;

    eResService.getPendingCountByEvent( eventId, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get pending count by event",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Pending count fetched successfully",
                count: result.pendingCount
            });
        }
    );
};

const getRecentRegistrations = (req, res) => {

    const limit = 5;

    eResService.getRecentRegistrations( limit, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get recent registrations",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Recent registrations fetched successfully",
                registration: result
            });
        }
    );
};

const getRecentActivities = (req, res) => {

    const limit = 5;

    eResService.getRecentActivities(limit, (err, result) => {

            if (err) {
                 console.error("GET RECENT ACTIVITIES ERROR:", err);
                return res.status(500).json({
                    message: "Failed to get recent Activities",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Recent Activities fetched successfully",
                activities: result
            });
        }
    );
};


const getRegistrationCountByMode = (req, res) => {

    const mode = req.params.mode;

    const validModes = ["Virtual", "Physical", "Virtual and Physical", "Hybrid", "Both"];
    if (!validModes.includes(mode)) {
        return res.status(400).json({
            message: "Mode must be Virtual, Physical, Virtual and Physical, or Hybrid"
        });
    }

    eResService.getRegistrationCountByMode( mode, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get registration count by mode",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Registration count fetched successfully",
                count: result.registrationCount
            });
        }
    );
};


const updateRegistrationStatus = (req, res) => {

    const id = req.params.id;
    const { Status } = req.body;

    if (!Status) {
        return res.status(400).json({
            message: "Status is required"
        });
    }

    if ( Status !== "pending" && Status !== "approved" && Status !== "rejected") {
        return res.status(400).json({
            message: "Invalid registration status"
        });
    }

    eResService.updateRegistrationStatus( id, Status, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Registration status update failed",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Event registration not found"
                });
            }

            return res.status(200).json({
                message: "Registration status updated successfully"
            });
        }
    );
};


module.exports = {
    createRegistration,
    getAllRegistrations,
    getRegistrationById,
    getRegistrationsByEventId,
    getRegistrationsByTeamId,
    getRegistrationsByMode,
    getRegistrationsByStatus,
    getRegistrationCount,
    getRegistrationCountByEvent,
    getRegistrationCountByMode,
    getPendingCountByEvent,
    updateRegistrationStatus,
    getRecentRegistrations,
    getRecentActivities
};