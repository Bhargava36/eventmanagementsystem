const express = require("express");

const router = express.Router();

const superAdminController = require("./superAdminController");

router.post('/register', superAdminController.registerAdmin);

router.post('/login', superAdminController.loginAdminController);

module.exports = router;