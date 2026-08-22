const express = require("express");

const router = express.Router();

const memController = require("./memController");

router.post('/register', memController.registerUser);
router.post('/login', memController.loginUser);
router.get('/', memController.getAllUsers);
router.get('/:id', memController.getUsersById);
router.get('/teams/:teamid',memController.getUsersByTeamId)
router.put('/:id', memController.updateUserById);

module.exports = router;