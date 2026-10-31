const jwt = require('jsonwebtoken');
const evaluatorService = require('./evaluatorService');

const getEvaluatorsByEvent = (req, res) => {
    const eventId = req.params.eventId;
    const track = req.query.track || null;

    evaluatorService.getEvaluatorsByEvent(eventId, track, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to fetch evaluators',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluators fetched successfully',
            data: result
        });
    });
};

const getAllEvaluators = (req, res) => {
    evaluatorService.getAllEvaluators((err, evaluators) => {
        if (err) {
            return res.status(500).json({
                message: err.message
            });
        }

        res.status(200).json({
            evaluators
        });
    });
};

const createEvaluator = (req, res) => {
    evaluatorService.createEvaluator(req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to create evaluator',
                error: err.message
            });
        }
        res.status(201).json({
            message: 'Evaluator created successfully',
            data: result
        });
    });
};

const updateEvaluator = (req, res) => {
    const id = req.params.id;
    evaluatorService.updateEvaluator(id, req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to update evaluator',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluator updated successfully',
            data: result
        });
    });
};

const deleteEvaluator = (req, res) => {
    const id = req.params.id;
    evaluatorService.deleteEvaluator(id, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to delete evaluator',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluator deleted successfully'
        });
    });
};

// ── ROUNDS CONTROLLER ──

const getEvaluationRounds = (req, res) => {
    const eventId = req.params.eventId;
    const track = req.query.track || null;

    evaluatorService.getEvaluationRounds(eventId, track, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to fetch evaluation rounds',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluation rounds fetched successfully',
            data: result,
            rounds: result
        });
    });
};

const createEvaluationRound = (req, res) => {
    evaluatorService.createEvaluationRound(req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to create evaluation round',
                error: err.message
            });
        }
        res.status(201).json({
            message: 'Evaluation round created successfully',
            round: result
        });
    });
};

const updateEvaluationRound = (req, res) => {
    const id = req.params.id;
    evaluatorService.updateEvaluationRound(id, req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to update evaluation round',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluation round updated successfully'
        });
    });
};

const deleteEvaluationRound = (req, res) => {
    const id = req.params.id;
    evaluatorService.deleteEvaluationRound(id, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to delete evaluation round',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluation round deleted successfully'
        });
    });
};

// ── QUESTIONS CONTROLLER ──

const createEvaluationQuestion = (req, res) => {
    const roundId = req.params.roundId;
    evaluatorService.createEvaluationQuestion(roundId, req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to add evaluation question',
                error: err.message
            });
        }
        res.status(201).json({
            message: 'Evaluation question added successfully',
            question: result
        });
    });
};

const updateEvaluationQuestion = (req, res) => {
    const id = req.params.id;
    evaluatorService.updateEvaluationQuestion(id, req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to update evaluation question',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluation question updated successfully'
        });
    });
};

const deleteEvaluationQuestion = (req, res) => {
    const id = req.params.id;
    evaluatorService.deleteEvaluationQuestion(id, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to delete evaluation question',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Evaluation question deleted successfully'
        });
    });
};

const evaluatorLogin = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    evaluatorService.evaluatorLogin(username, password, (err, result) => {
        if (err) {
            return res.status(err.status || 401).json({
                message: err.message || 'Authentication failed',
                error: err.message
            });
        }

        const token = jwt.sign(
            {
                Id: result.Id,
                Name: result.Name,
                Username: result.Username,
                Email: result.Email,
                EventId: result.EventId,
                EventName: result.EventName,
                Track: result.Track,
                Role: result.Role,
                RoleName: result.RoleName,
                College: result.College,
                role: 'evaluator'
            },
            process.env.JWT_SECRECT || 'secret',
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        );

        return res.status(200).json({
            message: 'Evaluator authenticated successfully',
            token,
            evaluator: {
                ...result,
                RoleName: result.RoleName,
                role: 'evaluator'
            },
            user: {
                ...result,
                RoleName: result.RoleName,
                role: 'evaluator'
            },
            role: 'evaluator'
        });
    });
};

const getTeamsForEvaluation = (req, res) => {
    const { eventId } = req.params;
    const { track } = req.query;

    evaluatorService.getTeamsForEvaluation(eventId, track, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to fetch teams for evaluation',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Teams fetched successfully',
            data: result,
            teams: result
        });
    });
};

const getScoresForRound = (req, res) => {
    const { roundId } = req.params;
    const { evaluatorId } = req.query;

    evaluatorService.getScoresForRound(roundId, evaluatorId, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to fetch scores',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Scores fetched successfully',
            data: result
        });
    });
};

const saveEvaluationScore = (req, res) => {
    evaluatorService.saveEvaluationScore(req.body, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                message: err.message || 'Failed to save evaluation score',
                error: err.message
            });
        }
        res.status(200).json({
            message: 'Score saved successfully',
            data: result
        });
    });
};

const getEventResults = (req, res) => {
    const { eventId } = req.params;
    const { track } = req.query;

    evaluatorService.getEventResults(eventId, track, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Failed to fetch event results',
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: 'Event results fetched successfully',
            data: result,
            results: result
        });
    });
};

const publishRoundResults = (req, res) => {
    const roundId = req.params.roundId;
    const isPublished = req.body.isPublished !== undefined ? req.body.isPublished : true;

    evaluatorService.publishRoundResults(roundId, isPublished, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Failed to update round publication status',
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: `Round results ${isPublished ? 'published' : 'unpublished'} successfully`,
            data: result
        });
    });
};

const publishOverallResults = (req, res) => {
    const eventId = req.params.eventId;
    const track = req.body.track || req.query.track || 'Physical';
    const isPublished = req.body.isPublished !== undefined ? req.body.isPublished : true;

    evaluatorService.publishOverallResults(eventId, track, isPublished, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Failed to update overall publication status',
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: `Overall ${track} results ${isPublished ? 'published' : 'unpublished'} successfully`,
            data: result
        });
    });
};

const getTeamPublishedResults = (req, res) => {
    const teamId = req.params.teamId;

    evaluatorService.getTeamPublishedResults(teamId, (err, result) => {
        if (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Failed to fetch published results for team',
                error: err.message
            });
        }
        res.status(200).json({
            success: true,
            message: 'Published results fetched successfully',
            data: result
        });
    });
};

module.exports = {
    getEvaluatorsByEvent,
    getAllEvaluators,
    createEvaluator,
    updateEvaluator,
    deleteEvaluator,
    getEvaluationRounds,
    createEvaluationRound,
    updateEvaluationRound,
    deleteEvaluationRound,
    createEvaluationQuestion,
    updateEvaluationQuestion,
    deleteEvaluationQuestion,
    evaluatorLogin,
    getTeamsForEvaluation,
    getScoresForRound,
    saveEvaluationScore,
    getEventResults,
    publishRoundResults,
    publishOverallResults,
    getTeamPublishedResults
};
