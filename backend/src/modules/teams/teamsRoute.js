const express = require("express");

const router = express.Router();

const teamsController = require("./teamsController");

router.post('/create', teamsController.createTeam);
router.get( '/', teamsController.getAllTeams );
router.get('/:id', teamsController.getTeamById );
router.get('/state/:state', teamsController.getTeamByState);
router.get('/college/:clg', teamsController.getTeamByCollege);
router.get('/problem/:id', teamsController.getTeamByProblem);
router.get('/Stack/:tech', teamsController.getTeamByTech);
router.put('/:id', teamsController.updateTeams);

module.exports = router;