const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const psService = require('./psService');
const { broadcastEvent } = require('../../config/websocket');

// ========================
// ADMIN: CRUD Themes for an Event
// ========================

// GET all themes for an event
router.get('/event/:eventId/themes', (req, res) => {
    psService.getAllThemes(req.params.eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch themes', error: err.message });
        res.json({ themes: results });
    });
});

// CREATE a theme
router.post('/event/:eventId/themes', (req, res) => {
    psService.createTheme(req.params.eventId, req.body, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'A theme with this name already exists for this event.' });
            }
            return res.status(500).json({ message: 'Failed to create theme', error: err.message });
        }
        broadcastEvent(req.params.eventId, { type: 'THEMES_UPDATED', eventId: req.params.eventId });
        res.status(201).json(result);
    });
});

// UPDATE a theme
router.put('/themes/:id', (req, res) => {
    psService.updateTheme(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update theme', error: err.message });
        broadcastEvent(null, { type: 'THEMES_UPDATED' });
        res.json({ message: 'Theme updated successfully' });
    });
});

// DELETE a theme
router.delete('/themes/:id', (req, res) => {
    psService.deleteTheme(req.params.id, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to delete theme', error: err.message });
        broadcastEvent(null, { type: 'THEMES_UPDATED' });
        res.json({ message: 'Theme deleted successfully' });
    });
});

// ========================
// ADMIN: CRUD Problem Statements for an Event
// ========================

// GET all problem statements for an event
router.get('/event/:eventId', (req, res) => {
    psService.getAllByEvent(req.params.eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch problem statements', error: err.message });
        res.json({ problemStatements: results });
    });
});

// CREATE a problem statement
router.post('/event/:eventId', (req, res) => {
    psService.createProblemStatement(req.params.eventId, req.body, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'A problem statement with this code already exists for this event.' });
            }
            return res.status(500).json({ message: 'Failed to create problem statement', error: err.message });
        }
        broadcastEvent(req.params.eventId, { type: 'STATEMENTS_UPDATED', eventId: req.params.eventId });
        res.status(201).json(result);
    });
});

// UPDATE a problem statement
router.put('/:id', (req, res) => {
    psService.updateProblemStatement(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update problem statement', error: err.message });
        broadcastEvent(null, { type: 'STATEMENTS_UPDATED' });
        res.json({ message: 'Problem statement updated successfully' });
    });
});

// DELETE a problem statement
router.delete('/:id', (req, res) => {
    psService.deleteProblemStatement(req.params.id, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to delete problem statement', error: err.message });
        broadcastEvent(null, { type: 'STATEMENTS_UPDATED' });
        res.json({ message: 'Problem statement deleted successfully' });
    });
});

// ========================
// ADMIN: Publish Controls
// ========================

// GET publish status for an event
router.get('/event/:eventId/publish-status', (req, res) => {
    psService.getPublishStatus(req.params.eventId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch status', error: err.message });
        res.json(result);
    });
});

// Publish/Unpublish Theme
router.put('/event/:eventId/publish-theme', (req, res) => {
    psService.publishTheme(req.params.eventId, req.body.published, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update theme status', error: err.message });
        broadcastEvent(req.params.eventId, {
            type: 'THEME_PUBLISHED',
            eventId: req.params.eventId,
            published: req.body.published
        });
        res.json({ message: `Theme ${req.body.published ? 'published' : 'unpublished'} successfully` });
    });
});

// Publish/Unpublish Problem Statements
router.put('/event/:eventId/publish-statements', (req, res) => {
    psService.publishProblemStatements(req.params.eventId, req.body.published, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update status', error: err.message });
        broadcastEvent(req.params.eventId, {
            type: 'STATEMENTS_PUBLISHED',
            eventId: req.params.eventId,
            published: req.body.published
        });
        res.json({ message: `Problem statements ${req.body.published ? 'published' : 'unpublished'} successfully` });
    });
});

// Set Selection Deadline
router.put('/event/:eventId/selection-deadline', (req, res) => {
    psService.setSelectionDeadline(req.params.eventId, req.body.deadline, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to set deadline', error: err.message });
        broadcastEvent(req.params.eventId, {
            type: 'DEADLINE_UPDATED',
            eventId: req.params.eventId,
            deadline: req.body.deadline
        });
        res.json({ message: 'Selection deadline updated successfully' });
    });
});

// Set Max Teams Per Statement
router.put('/event/:eventId/max-teams', (req, res) => {
    psService.setMaxTeamsPerStatement(req.params.eventId, req.body.maxTeams, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to set max teams', error: err.message });
        broadcastEvent(req.params.eventId, {
            type: 'MAX_TEAMS_UPDATED',
            eventId: req.params.eventId,
            maxTeams: req.body.maxTeams
        });
        res.json({ message: 'Max teams per statement updated successfully' });
    });
});

// ========================
// TEAM: Select Problem Statement
// ========================

// GET specific team's selection
router.get('/event/:eventId/team/:teamId', (req, res) => {
    psService.getTeamSelection(req.params.eventId, req.params.teamId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch team selection', error: err.message });
        res.json({ selection: result });
    });
});

router.post('/event/:eventId/select', (req, res) => {
    const { teamId, problemStatementId } = req.body;
    if (!teamId || !problemStatementId) {
        return res.status(400).json({ message: 'teamId and problemStatementId are required.' });
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

    psService.selectProblemStatement(req.params.eventId, teamId, problemStatementId, userId, userRole, (err, result) => {
        if (err) {
            const status = err.status || 500;
            return res.status(status).json({ message: err.message || 'Selection failed' });
        }
        broadcastEvent(req.params.eventId, {
            type: 'SELECTION_MADE',
            eventId: req.params.eventId,
            teamId,
            problemStatementId
        });
        res.json(result);
    });
});

// ========================
// GET: All Selections for an Event
// ========================

router.get('/event/:eventId/selections', (req, res) => {
    psService.getSelectionsByEvent(req.params.eventId, (err, results) => {
        if (err) return res.status(500).json({ message: 'Failed to fetch selections', error: err.message });
        res.json({ selections: results });
    });
});

// ========================
// ADMIN: Auto-Assign Remaining Teams
// ========================

router.post('/event/:eventId/auto-assign', (req, res) => {
    psService.autoAssignRemainingTeams(req.params.eventId, (err, result) => {
        if (err) return res.status(500).json({ message: 'Auto-assignment failed', error: err.message });
        broadcastEvent(req.params.eventId, {
            type: 'AUTO_ASSIGN_COMPLETED',
            eventId: req.params.eventId
        });
        res.json(result);
    });
});

// ========================
// ADMIN: Remove a Selection
// ========================

router.delete('/selection/:id', (req, res) => {
    psService.removeSelection(req.params.id, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to remove selection', error: err.message });
        broadcastEvent(null, { type: 'SELECTION_REMOVED' });
        res.json({ message: 'Selection removed successfully' });
    });
});

module.exports = router;
