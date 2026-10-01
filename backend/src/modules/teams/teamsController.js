const teamsService = require('./teamsService');
const db = require('../../config/db');

const createTeam = (req, res) => {
    const {TeamName, TeamLeadEmail, TeamSize, EventId, MemberEmails } = req.body;

    teamsService.createTeam( TeamName, TeamLeadEmail, TeamSize, EventId, MemberEmails, (err, result) => {
            if (err) {
                return res.status(err.status || 500).json({
                    message: err.message
                });
            }

            res.status(201).json({
                message: "Team created successfully",
                teamId: result.teamId
            });
        }
    );
};

const getAllTeams = (req, res) => {
    teamsService.getAllTeams((err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get teams',
                error: err.message
            });
        }

        res.status(200).json({
            message: 'Teams fetched successfully',
            teams: result
        });
    });
};

const getTeamById = (req, res) => {
    const id = req.params.id;

    teamsService.getTeamById(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get team by id',
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Team not found'
            });
        }

        res.status(200).json({
            message: 'Team fetched successfully',
            team: result[0]
        });
    });
};

const getTeamByCollege = (req, res) => {
    const clg = req.params.clg;

    teamsService.getTeamByCollege(clg, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get teams by college',
                error: err.message
            });
        }

        res.status(200).json({
            message: 'Teams fetched successfully',
            teams: result
        });
    });
};

const getTeamByState = (req, res) => {
    const state = req.params.state;

    teamsService.getTeamByState(state, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get teams by state',
                error: err.message
            });
        }

        res.status(200).json({
            message: 'Teams fetched successfully',
            teams: result
        });
    });
};

const getTeamByProblem = (req, res) => {
    const id = req.params.id;

    teamsService.getTeamByStatement(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get teams by problem statement',
                error: err.message
            });
        }

        res.status(200).json({
            message: 'Teams fetched successfully',
            teams: result
        });
    });
};

const getTeamByTech = (req, res) => {
    const tech = req.params.tech;

    teamsService.getTeamByTech(tech, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get teams by tech stack',
                error: err.message
            });
        }

        res.status(200).json({
            message: 'Teams fetched successfully',
            teams: result
        });
    });
};

const getTeamsCount = (req, res) => {
    teamsService.getTeamsCount((err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to get teams count',
                error: err.message
            });
        }

        res.status(200).json({
            message: 'Teams count fetched successfully',
            count: result.teamsCount
        });
    });
};

const getTeamCountByEvent = (req, res) => {

    const eventId = req.params.eventId;

    teamsService.getTeamCountByEvent(
        eventId,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get team count by event",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "Team count fetched successfully",
                count: result.teamCount
            });
        }
    );
};

const getMyTeams = (req, res) => {
    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({
            message: 'User ID is required'
        });
    }

    teamsService.getMyTeams(userId, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to fetch teams',
                error: err.message
            });
        }

        res.status(200).json({
            teams: result
        });
    });
};

const getTeamInfo = (req, res) => {
    const { teamId, userId } = req.params;

    if (!teamId || !userId) {
        return res.status(400).json({
            message: 'Team ID and User ID are required'
        });
    }

    teamsService.getTeamInfo( teamId, userId, (err, result) => {

            if (err) {
                console.error('Get team info error:', err);

                return res.status(500).json({
                    message: 'Failed to fetch team information',
                    error: err.message
                });
            }

            if (!result.team) {
                return res.status(404).json({
                    message: 'Team not found or user is not a member of this team'
                });
            }

            return res.status(200).json({
                message: 'Team information fetched successfully',
                team: result.team,
                members: result.members
            });
        }
    );
};

const updateTeams = (req, res) => {
    const id = req.params.id;

    const {TeamName, TeamLeadUserId, TeamSize, College, State, ProblemStatementId, Tech_Stack, EventId} = req.body;

    if (!TeamName || !TeamLeadUserId || !TeamSize || !College || !State || !ProblemStatementId || !Tech_Stack || !EventId) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    if (
        Tech_Stack !== 'hardware' && Tech_Stack !== 'software') {
        return res.status(400).json({
            message: 'TechStack must be hardware or software'
        });
    }

    teamsService.updateTeamById(id, TeamName, TeamLeadUserId, TeamSize, College, State, ProblemStatementId, Tech_Stack, EventId, (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: 'Team update failed',
                    error: err.message
                });
            }

            res.status(200).json({
                message: 'Team updated successfully',
                res: result
            });
        }
    );
};

const getTeamsByEvent = (req, res) => {

    const EventId = req.params.eventId;

    teamsService.getTeamsByEvent(EventId, (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch teams"
            });
        }

        return res.status(200).json(result);
    });
};

module.exports = {
    createTeam,
    getAllTeams,
    getTeamById,
    getTeamByCollege,
    getTeamByProblem,
    getTeamByState,
    getTeamByTech,
    getTeamsCount,
    getMyTeams,
    getTeamInfo,
    getTeamCountByEvent,
    updateTeams,
    getTeamsByEvent
};
