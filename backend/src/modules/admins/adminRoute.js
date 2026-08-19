const express = require("express");

const router = express.Router();

const adminController = require("./adminController");

router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdminController);
router.get('/', adminController.getAllAdmin);
router.get('/:id', adminController.getAdminById);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;