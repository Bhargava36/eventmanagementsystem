const teamsService = require('./teamsService');

const createTeam = (req, res) => {

    const { TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId } = req.body;

    if (!TeamLead || !Email || !TeamSize || !College || !State || !PhoneNumber || !TeamName || !ProblemStatementId || !Tech_Stack || !EventId) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if(Tech_Stack !== 'hardware' && Tech_Stack !== 'software') {
        return res.status(400).json({
            message : "TechStack must be hardware or software"
        });
    }

    teamsService.createTeam( TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "team creation failed",
                    error: err.message
                });
            }

            return res.status(201).json({
                message: "team created successfully",
                teamId: result.insertId
            });
        }
    );
};

const getAllTeams = (req, res) => {

    teamsService.getAllTeams((err, result) => {

        if (err) {

            return res.status(500).json({
                message: "Failed to get teams",
                error: err
            });
        }

        return res.status(200).json({
            message: "teams fetched successfully",
            teams: result
        });
    });
};

const getTeamById = (req, res) => {
    const id = req.params.id;
    teamsService.getTeamById(id, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get teams by id",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "team not found"
            });
        }

        return res.status(200).json({
            message: "teams fetched successfully",
            teams: result
        });
    });
};

const getTeamByCollege = (req, res) => {
    const clg = req.params.clg;
    teamsService.getTeamByCollege(clg, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get teams by college name",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "team not found"
            });
        }

        return res.status(200).json({
            message: "teams fetched successfully",
            teams: result
        });
    });
};

const getTeamByState = (req, res) => {
    const state = req.params.state;
    teamsService.getTeamByState(state, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get teams by state",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "team not found"
            });
        }

        return res.status(200).json({
            message: "teams fetched successfully",
            teams: result
        });
    });
};

const getTeamByProblem = (req, res) => {
    const id = req.params.id;
    teamsService.getTeamByStatement(id, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get teams by problem statement",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "team not found"
            });
        }

        return res.status(200).json({
            message: "teams fetched successfully",
            teams: result
        });
    });
};

const getTeamByTech = (req, res) => {
    const tech = req.params.tech;
    teamsService.getTeamByTech(tech, (err, result) => {
        if(err) {
            return res.status(500).json({
                message: "Failed to get teams by tech stack",
                error: err
            });
        }

        if(result.length === 0) {
            return res.status(404).json({
                message: "team not found"
            });
        }

        return res.status(200).json({
            message: "teams fetched successfully",
            teams: result
        });
    });
};


const updateTeams = (req, res) => {

    const id = req.params.id;

    const { TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId } = req.body;

    if (!TeamLead || !Email || !TeamSize || !College || !State || !PhoneNumber || !TeamName || !ProblemStatementId || !Tech_Stack || !EventId) {

        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if(Tech_Stack !== 'hardware' && Tech_Stack !== 'software') {
        return res.status(400).json({
            message : "TechStack must be hardware or software"
        });
    }

    teamsService.updateTeamById( id, TeamLead, Email, TeamSize, College, State, PhoneNumber, TeamName, ProblemStatementId, Tech_Stack, EventId, (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "team update failed",
                    error: err
                });
            }

            return res.status(200).json({
                message: "team updated successfully"
            });
        }
    );
};

module.exports = {
    createTeam,
    getAllTeams,
    getTeamById,
    getTeamByCollege,
    getTeamByProblem,
    getTeamByState,
    getTeamByTech,
    updateTeams
};