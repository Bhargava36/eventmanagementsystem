const express = require("express");

const router = express.Router();

const adminController = require("./adminController");

router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdminController);
router.post('/assign-event', adminController.assignEventToAdmin);
router.post('/switch-event', adminController.switchEvent);
router.delete('/:AdminId/event/:EventId', adminController.removeAdminFromEvent);
router.get('/', adminController.getAllAdmin);
router.get('/event/:EventId', adminController.getAdminByEventId);
router.get('/:id', adminController.getAdminById);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);
module.exports = router;