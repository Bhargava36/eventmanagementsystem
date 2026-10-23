const jwt = require('jsonwebtoken');
const projectSubmissionService = require('./projectSubmissionService');
const { broadcastEvent } = require('../../config/websocket');

const getSubmissionByTeam = (req, res) => {
    const { eventId, teamId } = req.params;
    projectSubmissionService.getSubmissionByTeam(eventId, teamId, (err, submission) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve project submission', error: err.message });
        }
        res.json({ submission });
    });
};

const getAllSubmissionsByEvent = (req, res) => {
    const { eventId } = req.params;
    projectSubmissionService.getAllSubmissionsByEvent(eventId, (err, submissions) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to retrieve event submissions', error: err.message });
        }
        res.json({ submissions });
    });
};

const submitProject = (req, res) => {
    const { eventId } = req.params;
    const { teamId, githubRepoUrl, liveDemoUrl, drivePptUrl, techStack, description } = req.body;

    if (!teamId) {
        return res.status(400).json({ message: 'teamId is required' });
    }

    let userId = null;
    let userRole = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRECT || 'secret');
            userId = decoded.Id || decoded.id;
            userRole = decoded.role || decoded.Role;
        } catch (e) {
            // invalid or expired token
        }
    }

    projectSubmissionService.submitProject(
        eventId,
        teamId,
        userId,
        userRole,
        { githubRepoUrl, liveDemoUrl, drivePptUrl, techStack, description },
        (err, result) => {
            if (err) {
                const status = err.status || 500;
                return res.status(status).json({ message: err.message || 'Submission failed' });
            }

            // Real-time broadcast to event participants and admin
            broadcastEvent(eventId, {
                type: 'PROJECT_SUBMITTED',
                eventId,
                teamId,
                submission: result.submission
            });

            res.status(200).json(result);
        }
    );
};

module.exports = {
    getSubmissionByTeam,
    getAllSubmissionsByEvent,
    submitProject
};
