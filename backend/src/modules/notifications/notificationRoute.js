const express = require('express');
const router = express.Router();
const controller = require('./notificationController');

router.get('/', controller.getNotifications);
router.post('/', controller.createNotification);
router.put('/read/:id', controller.markRead);
router.put('/read-all', controller.markAllRead);
router.delete('/:id', controller.deleteNotif);

module.exports = router;

