const express = require("express");

const router = express.Router();

const superAdminController = require("./superAdminController");

router.post('/register', superAdminController.registerAdmin);

router.post('/login', superAdminController.loginAdminController);

router.put('/profile/:id', superAdminController.updateAdmin);

router.get('/profile/:id', superAdminController.getAdminProfile);

module.exports = router;