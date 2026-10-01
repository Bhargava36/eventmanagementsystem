const express = require("express");
const router = express.Router();
const memController = require("./memController");

router.post('/register', memController.registerUser);
router.get('/count', memController.getUserCount);
router.get('/teams/:teamid', memController.getUsersByTeamId);
router.get('/', memController.getAllUsers);
router.get('/:id', memController.getUsersById);
router.put('/:id', memController.updateUserById);

module.exports = router;