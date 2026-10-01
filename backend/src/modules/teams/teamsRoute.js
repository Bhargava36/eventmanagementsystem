const express = require('express');
const router = express.Router();
const teamsController = require('./teamsController');

router.post('/create', teamsController.createTeam);
router.get('/', teamsController.getAllTeams);
router.get('/count', teamsController.getTeamsCount);
router.get('/event/:eventId/count', teamsController.getTeamCountByEvent);
router.get('/state/:state', teamsController.getTeamByState);
router.get('/college/:clg', teamsController.getTeamByCollege);
router.get('/problem/:id', teamsController.getTeamByProblem);
router.get('/stack/:tech', teamsController.getTeamByTech);
router.get('/my-teams/:userId', teamsController.getMyTeams);
router.get('/info/:teamId/:userId', teamsController.getTeamInfo);
router.get('/event/:eventId', teamsController.getTeamsByEvent);
router.get('/:id', teamsController.getTeamById);
router.put('/:id', teamsController.updateTeams);

module.exports = router;
