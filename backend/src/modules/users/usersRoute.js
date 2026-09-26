const express = require("express");
const router = express.Router();
const userController = require("./usersController");

router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getAllUsers);
router.get('/count', userController.getUserCount);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
module.exports = router;
