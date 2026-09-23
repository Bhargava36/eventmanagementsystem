const express = require("express");
const router = express.Router();
const leadController = require("./usersController");

router.post('/create', leadController.createTeamLead);
router.post('/login', leadController.loginTeamLead);
router.get('/', leadController.getAllTeamLead);
router.get('/count', leadController.getUserCount);
router.get('/:id', leadController.getTeamLeadById);
router.put('/:id', leadController.updateTeamLead);
module.exports = router;
