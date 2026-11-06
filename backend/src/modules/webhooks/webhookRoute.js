const express = require('express');
const router = express.Router();
const controller = require('./webhookController');

router.get('/', controller.getWebhooks);
router.post('/', controller.createWebhook);
router.put('/:id', controller.updateWebhook);
router.delete('/:id', controller.deleteWebhook);
router.post('/test/:id', controller.testWebhook);
router.get('/logs', controller.getLogs);

module.exports = router;

